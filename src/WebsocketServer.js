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
    createStringPacket
} = require('./protocol');
const {
    unpackPixel
} = require('./utils');
const {
    realBoardWid,
    realBoardHei,
    MAX_CLIENTS_PER_IP,
    captchaEnabled
} = require('./config');

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
            maxPayload: 65536
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

            this.clients.set(socket, client);

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

                this.clients.delete(socket);
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
                        })
                    }
                }
            })

            this.broadcastOnline();
        });

        this.wss = wss;
    }

    onmessage(client, ev) {
        // TODO: replace it with more effective
        // event type check
        if (ev.type !== 'message') return;

        let message = ev.data;
        // todo: replace with !== statement(should be faster)
        if (typeof message === 'string') {
            logger.debug('Got string message: ' + message);

            this.handleStringMessage(message, client);
        } else {
            switch (message.readUInt8(0)) {
                case OPCODES.chunk: {
                    if (client.state === 0) {
                        return client.sendError('Canvas must be chosen, you, dirty botter');
                    }

                    const cx = message.readUInt8(1);
                    const cy = message.readUInt8(2);

                    const canvas = client.canvas;

                    if (cx < 0 || cy < 0 || cx >= canvas.width || cy >= canvas.height) {
                        return client.sendError('Chunk coordinates out of bounds');
                    }

                    const chunkManager = canvas.chunkManager;

                    let chunkData = chunkManager.getChunkData(cx, cy);

                    client.send(createPacket.chunkSend(cx, cy, chunkData));

                    break
                }

                // todo IMPORTANT don't send pixels to other canvases
                case OPCODES.place: {
                    if (client.state === STATES.CANVAS_NOT_CHOSEN) {
                        return client.sendError('Canvas must be chosen, you, dirty botter');
                    } else if (client.state === STATES.CAPTCHA) {
                        return client.sendError('error.captcha');
                    }

                    if (!client.bucket.spend(1)){
                        return
                    };

                    const canvas = client.canvas;

                    const [x, y, c] = unpackPixel(message.readUInt32BE(1));

                    if (x < 0 || x >= realBoardWid ||
                        y < 0 || y >= realBoardHei ||
                        c < 0 || c >= canvas.palette.length) return ;

                    const _oldColorKek = canvas.chunkManager.getChunkPixel(x, y);

                    canvas.chunkManager.setChunkPixel(x, y, c);

                    // todo not pack pixel again
                    const newMessage = createPacket.pixelSend(x, y, c, client.id);

                    this.broadcastBinary(newMessage);

                    // setTimeout(() => {
                    //     const newMessageKek = createPacket.pixelSend(x, y, _oldColorKek, 999);
                    //     this.broadcastBinary(newMessageKek);

                    //     canvas.chunkManager.setChunkPixel(x, y, _oldColorKek);
                    // }, 1000)

                    break
                }
                case OPCODES.canvas: {
                    const canvas = message.readUInt8(1);

                    // unsigned but i don't care
                    if (canvas < 0 || canvas >= this.canvases.length) {
                        return client.send('Wrong canvas number');
                    }

                    client.canvas = this.canvases[canvas];

                    if (client.state == STATES.CANVAS_NOT_CHOSEN && captchaEnabled) {
                        client.state = STATES.CAPTCHA
                    } else {
                        client.state = STATES.READY
                    }

                    let cooldown;
                    if (client.user) {
                        if (client.user.role === 'admin') {
                            cooldown = [0, 32];
                        } else {
                            cooldown = client.canvas.cooldown.user
                        }
                    } else {
                        cooldown = client.canvas.cooldown.guest
                    }

                    client.bucket = new Bucket(...cooldown);

                    break
                }
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
                if(!canvas) return;

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
        }
    }

    broadcastOnline() {
        let online = this.clients.size;

        let buf = Buffer.allocUnsafe(1 + 3);
        buf.writeUInt8(OPCODES.online, 0);
        buf.writeUInt16BE(online, 1);

        this.broadcastBinary(buf);
    }

    // https://github.com/websockets/ws/issues/617
    broadcastBinary(data) {
        const frame = WebSocket.Sender.frame(data, {
            readOnly: true,
            mask: false,
            rsv1: false,
            opcode: 2,
            fin: true,
        });

        this.clients.forEach(client => {
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

    broadcastString(msg, checkFunc = () => true) {
        this.clients.forEach(client => checkFunc(client) && client.send(msg));
    }
}

module.exports = Server