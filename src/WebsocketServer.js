const logger = require('./logger')('WEBSOCKET', 'debug');

const {
    Server: WebSocketServer,
} = require('ws');

const WebSocket = require('ws');

const {
    CLIENT_STATES: STATES,
    Client
} = require('./Client');
const Bucket = require('./Bucket');
const {
    OPCODES,
    STRING_OPCODES,
    createPacket,
    createStringPacket,
    unpackPacket
} = require('./protocol');
const {
    unpackPixel
} = require('./utils');
const {
    MAX_CLIENTS_PER_IP,
    captchaEnabled
} = require('./config');
const { ROLE } = require('./constants');

const ipConns = {};

class Server {
    constructor(canvases) {
        this.canvases = canvases;

        this.clients = new Map();
        this.wss = null;

        this.__state = 0;
    }

    run() {
        const wss = new WebSocketServer({
            noServer: true,
            maxPayload: 65536,

        });
        wss.on('connection', (socket, request, user) => {
            const ip = request.socket.remoteAddress;

            if (ipConns[ip] >= MAX_CLIENTS_PER_IP) {
                let msg = createStringPacket.error('conn_limit');
                socket.send(JSON.stringify(msg));

                return socket.close();
            }

            const client = new Client(socket, ip);
            client.user = user;
            client.ip = ip

            // this.clients.set(socket, client);
            this.clients.set(client.id, client);

            if (ipConns[ip])
                ipConns[ip] += 1;
            else
                ipConns[ip] = 1;

            socket.onclose = () => {
                // won't let users use reconnection to reset cd
                setTimeout(() => {
                    ipConns[ip]--;
                }, 1600);

                const packet = {
                    c: STRING_OPCODES.userLeave,
                    id: client.id
                };
                this.broadcastString(JSON.stringify(packet));

                this.clients.delete(client.id);
                socket = null;

                this.broadcastOnline();
            }

            socket.onmessage = (event) => this.onmessage(client, event);

            let initiated = false;
            client.on('statechange', state => {
                if (state === STATES.READY) {
                    if (!initiated) {
                        initiated = true;

                        const packet = createStringPacket.userJoin(client);

                        this.broadcastString(JSON.stringify(packet));

                        this.clients.forEach(_client => {
                            if (_client !== client && _client.canvas === client.canvas) {
                                packet.nick = _client.user ? _client.user.name : null;
                                packet.userId = _client.user ? _client.user.id : null;

                                packet.id = _client.id;
                                packet.registered = !!_client.user;

                                client.send(JSON.stringify(packet));
                            }
                        });

                        const message = createStringPacket.chatMessage({}, client.canvas.textChannel.id);

                        client.canvas.textChannel.getMessages().forEach(msg => {
                            message.nick = msg.name;
                            message.msg = msg.message;
                            message.server = msg.isServer;

                            client.send(JSON.stringify(message));
                        });

                        // send welcome
                        message.nick = '';
                        message.server = true;

                        message.msg = `Welcome to the [#00f986]Goroxels[], server ${client.canvas.name}!`;
                        client.send(JSON.stringify(message));

                        if (!client.user) {
                            message.msg = `Use <a href="/api/auth/discord">/api/auth/discord</a> to log in!`;
                            client.send(JSON.stringify(message));
                        }
                    }
                }
            })

            this.broadcastOnline();
        });
        wss.on('error', err => {
            logger.error(err);
        })

        this.wss = wss;
    }

    onmessage(client, ev) {
        // TODO: replace it with more effective
        // event type check
        if (ev.type !== 'message') return;

        let message = ev.data;

        if (typeof message === 'string') {
            logger.debug('Got string message: ' + message);

            try{
                this.handleStringMessage(message, client);
            }catch(e){
                logger.error(e, client.user)
            }
        } else {
            try{
                this.handleBinaryMessage(message, client);
            }catch(e){
                logger.error(e, client.user)
            }
        }
    }

    handleBinaryMessage(message, client){
        switch (message.readUInt8(0)) {
            case OPCODES.chunk: {
                if (client.state === 0) {
                    return client.sendError('Canvas must be chosen, you, dirty botter');
                }

                const cx = message.readUInt8(1),
                    cy = message.readUInt8(2);

                const canvas = client.canvas;

                if (cx < 0 || cy < 0 || cx >= canvas.width || cy >= canvas.height) {
                    return client.sendError('Chunk coordinates out of bounds');
                }

                const chunkManager = canvas.chunkManager;

                let chunkData = chunkManager.getChunkData(cx, cy);

                client.send(createPacket.chunkSend(cx, cy, chunkData));

                break
            }

            case OPCODES.place: {
                if (client.state === STATES.CANVAS_NOT_CHOSEN) {
                    return client.sendError('Canvas must be chosen, you, dirty botter');
                } else if (client.state === STATES.CAPTCHA) {
                    return client.sendError('error.captcha');
                }

                if (!client.bucket.spend(1)) {
                    return
                };

                const canvas = client.canvas;

                const [x, y, c] = unpackPixel(message.readUInt32BE(1));

                if (x < 0 || x >= canvas.realWidth ||
                    y < 0 || y >= canvas.realHeight ||
                    c < 0 || c >= canvas.palette.length) return;


                const oldPixel = canvas.chunkManager.getChunkPixel(x, y);

                if (((oldPixel & 0x80) && ROLE[client.user.role] < ROLE.MOD) ||
                    (oldPixel & 0x7F === c)) {
                    return;
                }

                canvas.chunkManager.setChunkPixel(x, y, c);

                // todo not pack pixel again
                const pixel = createPacket.pixelSend(x, y, c & 0x7F, client.id);
                this.broadcastPixel(canvas, pixel);

                break
            }
            case OPCODES.pixels: {
                if (!client.user) return;

                if (client.state === STATES.CANVAS_NOT_CHOSEN) {
                    return client.sendError('Canvas must be chosen, you, dirty botter');
                } else if (client.state === STATES.CAPTCHA) {
                    return client.sendError('error.captcha');
                } else {
                    const isProtect = !!message.readUInt8(1);
                    if (isProtect && ROLE[client.user.role] < ROLE.MOD) {
                        logger.info(`User ${client.user.name} tried to protect many pixels`);
                        return
                    }

                    const {
                        realWidth, realHeight
                    } = client.canvas;
                    const max = isProtect ? 1 : client.canvas.palette.length;

                    const pxlsCount = (message.length - 6) / 4;

                    if (!isProtect && !client.bucket.spend(pxlsCount)) {
                        return
                    }

                    for (let i = 6; i < message.length; i += 4) {
                        let [
                            x, y, clr
                        ] = unpackPixel(message.readUInt32BE(i));

                        if (clr < 0 || clr > max) {
                            return
                        }

                        if (x < 0 || x >= realWidth ||
                            y < 0 || y >= realHeight) return;

                        if(ROLE[client.user.role] < ROLE.MOD){
                            const oldPixel = client.canvas.chunkManager.getChunkPixel(x, y);

                            if (((oldPixel & 0x80) && ROLE[client.user.role] < ROLE.ADMIN) ||
                                (oldPixel & 0x7F === clr)) {
                                continue;
                            }
                        }
                        
                        if (isProtect) {
                            client.canvas.chunkManager.setPixelProtected(x, y, clr);
                        } else {
                            client.canvas.chunkManager.setChunkPixel(x, y, clr);
                        }
                    }

                    message.writeUInt32BE(client.id, 2);

                    this.broadcastPixels(client.canvas, message);
                }
                break
            }
            case OPCODES.canvas: {
                const canvas = message.readUInt8(1);

                // unsigned but i don't care
                if (canvas < 0 || canvas >= this.canvases.length) {
                    return client.send('Wrong canvas number');
                }

                client.canvas = this.canvases[canvas];

                if (captchaEnabled) {
                    client.state = STATES.CAPTCHA
                } else {
                    client.state = STATES.READY
                }

                let cooldown;
                if (client.user) {
                    if (client.user.role === 'admin') {
                        cooldown = [0, 32];
                    } else {
                        cooldown = client.canvas.cooldown.USER
                    }
                } else {
                    cooldown = client.canvas.cooldown.GUEST
                }

                client.bucket = new Bucket(...cooldown);

                break
            }
        }
    }

    handleStringMessage(msg, client) {
        try {
            msg = JSON.parse(msg);
        } catch {
            logger.error('Error while parsing string message: ' + msg);
            return
        }

        switch (msg.c) {
            case STRING_OPCODES.chatMessage: {
                if (!client.user ||
                    !msg.msg ||
                    client.state != STATES.READY ||
                    msg.ch === undefined
                ) return;

                const canvas = this.canvases[msg.ch];
                if (!canvas) return;

                const channel = canvas.textChannel;

                const nick = client.user.name;
                const message = msg.msg.trim();

                if (!message.length || message.length > 250 || (!nick.length && (client.role !== 'gorox'))) return;

                const chatMessage = channel.addMessage(nick, message);

                const packet = createStringPacket.chatMessage(chatMessage, channel.id);
                this.broadcastString(JSON.stringify(packet), receiver => {
                    return receiver.canvas && receiver.canvas.id === channel.id
                })

                break
            }
            case STRING_OPCODES.alert: {
                if (!client.user ||
                    ROLE[client.user.role] < ROLE.MOD ||
                    client.state != STATES.READY
                ) {
                    return
                }

                if (msg.msg.length == 0 || msg.msg.length > ((ROLE[client.user.role] == ROLE.ADMIN) ? 2000 : 500)) {
                    return
                }

                let packet = createStringPacket.alert(msg.msg);
                packet = JSON.stringify(packet);

                if (msg.to === 'all' && ROLE[client.user.role] === ROLE.ADMIN) {
                    this.clients.forEach(client => client.send(packet));
                } else if (!isNaN(msg.to)) {
                    const id = +msg.to;
                    const client = this.clients.get(id);
                    if (!client) return;

                    client.send(packet);
                }

                break
            }
        }
    }

    broadcastOnline() {
        let online = this.clients.size;

        let buf = Buffer.allocUnsafe(1 + 3);
        buf.writeUInt8(OPCODES.online, 0);
        buf.writeUInt16BE(online, 1);

        this.broadcastBinary(buf);
    }

    broadcastPixels(canvas, buffer) {
        this.clients.forEach(client => {
            if (client.canvas !== canvas) {
                return
            }

            const ws = client.socket;

            ws.send(buffer);
        });
    }

    broadcastPixel(canvas, pixel) {
        const frame = WebSocket.Sender.frame(pixel, {
            readOnly: true,
            mask: false,
            rsv1: false,
            opcode: 2,
            fin: true,
        });

        this.clients.forEach(client => {
            if (client.canvas !== canvas) {
                return
            }

            const ws = client.socket;

            frame.forEach((buffer) => {
                try {
                    ws._socket.write(buffer);
                } catch (error) {
                    logger.error(`WebSocket broadcast error: ${error.message}`);
                }
            });
        });
    }


    broadcastBinary(data) {
        this.clients.forEach(client => client.send(data));
    }

    broadcastString(msg, checkFunc = () => true) {
        this.clients.forEach(client => checkFunc(client) && client.send(msg));
    }
}

module.exports = Server