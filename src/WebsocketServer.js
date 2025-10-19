const logger = require('./logger')('WEBSOCKET', 'debug');

const {
    Server: WebSocketServer,
} = require('ws');

const WebSocket = require('ws');

const {
    Client,
} = require('./Client');
const Bucket = require('./Bucket');
const ChatChannel = require('./ChatChannel');
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
    MAX_CLIENTS_PER_IP
} = require('./config');
const { ROLE, ROLE_I, MINUTE, chatBucket } = require('./constants');
const { needCaptcha } = require('./captcha');
const { getIPFromRequest, getIPv6Subnet, ipToInt } = require('./utils/ip');
const config = require('./config');
const { checkCanvasConditions } = require('./utils/canvas');
const { checkRole } = require('./utils/role');
const ChatMessage = require('./ChatMessage');
const ms = require('ms');

const ipConns = {};

let instance = null;

// conditions for msg broadcasting
const CONDITION = {
    sameCanvas: client => _c => _c.canvas == client.canvas
}

// this number is used for masking/hiding invalid pixels
// in opcodes.pixels message
const notValidPixel = 0xffff;
function writeInvalidPixel(buffer, i) {
    // TODO: rework this
    buffer.writeUInt16BE(0xffff, i);
    buffer.writeUInt16BE(0xffff, i + 2);
}

class Server {
    /**
     * 
     * @returns {Server}
     */
    static getInstance() {
        return instance
    }

    static PIXEL_SEND_INTERVAL = 20;

    constructor() {
        this.canvases = global.canvases;
        // chat channels
        this.channels = {};

        this.clients = new Map();
        this.leaved = new Map();
        this.connections = {
            TOTAL: {}
        }
        this.onlineStats = {};

        this.broadcastPixelQueue = new Map();

        this.wss = null;

        instance = this;

        // motd can be set through console command
        this.MOTD = null;

        setInterval(this.updateOnlineStats.bind(this), 10000);
    }

    verifyClient(request, socket) {
        const ip = socket.realIp;
        if (this.connections['TOTAL'][ip] && this.connections['TOTAL'][ip] > 50)
            return false
        return true
    }

    run() {
        this.startTime = Date.now();

        const wss = new WebSocketServer({
            noServer: true,
            maxPayload: 262175
        });

        this.channels.global = new ChatChannel('global');

        this.canvases.forEach(canvas => {
            this.channels[canvas.name] = new ChatChannel(canvas.name);
            this.channels[canvas.name].canvas = canvas;

            this.connections[canvas.name] = {};

            const pixelSize = createPacket.pixelSendQueueBufferSize;
            const maxPixelQueue = 1000,
                bufferLimit = pixelSize * maxPixelQueue;
            this.broadcastPixelQueue.set(canvas, {
                maxOffset: bufferLimit - pixelSize,
                // extra 1 is for OP
                buffer: Buffer.alloc(bufferLimit + 1),
                curOffset: 0
            });
            this.initPixelQueueBroadcastInterval(canvas);
        })

        wss.on('connection', (socket, request, user) => {
            const ip = getIPv6Subnet(getIPFromRequest(request));
            const ipInt = ipToInt(ip);

            const client = new Client(socket);
            client.user = user;
            client.ip = ip;
            client.ipInt = ipInt;

            if (client.user?.role === 'BANNED') {
                if (client.user.bannedUntil) {
                    const timeLeft = Math.max(client.user.bannedUntil - Date.now(), 0);
                    client.sendError({
                        msg: 'bannedUntil',
                        data: ms(timeLeft)
                    });
                } else {
                    client.sendError('banned');
                }
                client.kill();
                return;
            }

            this.clients.set(client.id, client);

            if (this.connections['TOTAL'][ip])
                this.connections['TOTAL'][ip] += 1;
            else
                this.connections['TOTAL'][ip] = 1;

            socket.onclose = () => {
                this.clients.delete(client.id);

                // won't let users use reconnection to reset cd or spam
                setTimeout(() => {
                    this.connections['TOTAL'][ip]--;
                    client.canvas && this.connections[client.canvas.name][ip]--
                }, 900);

                if (!client.user || !client.user.isApiSocket) {
                    if (client.canvas) {
                        const packet = {
                            c: STRING_OPCODES.userLeave,
                            id: client.id
                        };
                        this.broadcastString(JSON.stringify(packet), CONDITION.sameCanvas(client));
                    };

                    this.leaved.set(client.id, client);
                }

                socket = null;

                this.broadcastOnline();
            }

            socket.onmessage = (event) => this.onmessage(client, event);

            socket.on('error', err => {
                logger.error('Socket client error: ' + err.message)
            })

            if (needCaptcha(client.ip, client)) {
                client.sendCaptcha();
            }
        });
        wss.on('error', err => {
            logger.error(err);
        })

        this.wss = wss;
        setInterval(this.ping.bind(this), 45000);
    }

    initPixelQueueBroadcastInterval(canvas) {
        const objPixelQueueRef = this.broadcastPixelQueue.get(canvas);

        // this byte is never changed later and writer preserves it
        objPixelQueueRef.buffer.writeUint8(OPCODES.placeBatch, 0);

        setInterval(() => {
            if (objPixelQueueRef.curOffset) {
                let subBuffer = objPixelQueueRef.buffer.subarray(0, objPixelQueueRef.curOffset + 1);
                this.broadcastForCanvasFast(canvas, subBuffer);
                objPixelQueueRef.curOffset = 0;
            }
        }, Server.PIXEL_SEND_INTERVAL);
    }

    initOnlineBroadcast() {
        // todo
    }

    checkUser(client) {
        return !!client.user
    }

    checkCanvas(client) {
        return client.canvas !== null
    }

    checkShadowBan(client) {
        if (!client.user) return true;
        return !client.user.shadowBanned;
    }

    checkCaptcha(client) {
        if (needCaptcha(client.ip, client)) {
            client.sendError('error.captcha');
            return false
        }

        return true
    }

    checkDelay(client) { // delay for placing after join
        // can be set only through the admin menu
        if (config.afterJoinDelay == 0) return true;
        if (!client.joinTime) return false;

        return (Date.now() >= (client.joinTime + config.afterJoinDelay))
    }

    checkCanvasRequires(client, canvas) {
        if (!canvas || !canvas.require) return true;

        return checkCanvasConditions(client.user, canvas.require)
    }

    onmessage(client, ev) {
        // TODO: replace it with more effective
        // event type check
        if (ev.type !== 'message') return;

        let message = ev.data;

        if (typeof message === 'string') {
            logger.debug('Got string message: ' + message);

            try {
                this.handleStringMessage(message, client);
            } catch (e) {
                logger.error(e.message)
            }
        } else {
            try {
                this.handleBinaryMessage(message, client);
            } catch (e) {
                logger.error(e.message)
            }
        }
    }

    broadcastReloadChunks(canvas, chunks) {
        const packet = createStringPacket.chunksReload(chunks);
        const packetStr = JSON.stringify(packet);
        this.broadcastStringByCond(packetStr, CONDITION.sameCanvas({ canvas }));
    }

    handleBinaryMessage(message, client) {
        switch (message.readUInt8(0)) {
            case OPCODES.chunk: {
                if (!this.checkCanvas(client)) return;

                const cx = message.readUInt8(1),
                    cy = message.readUInt8(2);

                const canvas = client.canvas;

                if (cx < 0 || cy < 0 || cx >= canvas.width || cy >= canvas.height) {
                    return client.sendError('Chunk coordinates out of bounds');
                }

                function send() {
                    chunkManager.getChunkData(cx, cy).then(chunkData => {
                        client.send(createPacket.chunkSend(cx, cy, chunkData));
                    });
                }

                const chunkManager = canvas.chunkManager;
                if (!chunkManager.loaded) {
                    chunkManager.once('loaded', send)
                } else send()

                break
            }

            case OPCODES.place: {
                if (!this.checkCanvas(client) ||
                    !this.checkCaptcha(client) ||
                    !this.checkDelay(client) ||
                    !this.checkShadowBan(client)) return;

                if (!client.bucket.spend(1)) {
                    return
                };

                const canvas = client.canvas;

                const x = message.readUInt16BE(1);
                const y = message.readUInt16BE(3);
                const c = message.readUInt8(5);

                if (x < 0 || x >= canvas.realWidth ||
                    y < 0 || y >= canvas.realHeight ||
                    c < 0 || c >= canvas.palette.length) return;

                const oldPixel = canvas.chunkManager.getChunkPixel(x, y);

                // is protected
                if (oldPixel & 0x80) {
                    if (!client.user ||
                        ROLE[client.user.role] < ROLE.TRUSTED) {
                        return
                    }
                }

                if ((oldPixel & 0x7F) === c)
                    return;

                canvas.chunkManager.setChunkPixel(x, y, c);

                const broadcastQueue = this.broadcastPixelQueue.get(canvas);
                if (broadcastQueue.curOffset <= broadcastQueue.maxOffset) {
                    createPacket.pixelSendEnqueue(x, y, c, client.id, broadcastQueue.buffer, broadcastQueue.curOffset + 1)
                    broadcastQueue.curOffset += createPacket.pixelSendQueueBufferSize;
                } else {
                    // we'll just send a single pixel in case that queue buffer is overflowed
                    const pixel = createPacket.pixelSend(x, y, c, client.id);
                    this.broadcastForCanvasFast(canvas, pixel);
                }

                canvas.chunkManager.setPlacerDataRaw(x, y, client.placeInfoFlag, client.placeInfoNumber);

                break
            }
            case OPCODES.pixels: {
                if (!this.checkCanvas(client) ||
                    !this.checkCaptcha(client) ||
                    !this.checkUser(client) ||
                    !this.checkDelay(client) ||
                    !this.checkShadowBan(client)) return;

                const isProtect = !!message.readUInt8(1);
                const isMod = ROLE[client.user.role] >= ROLE.MOD;

                if (isProtect && !isMod) {
                    return
                }

                const isTrusted = ROLE[client.user.role] >= ROLE.TRUSTED;

                const {
                    realWidth, realHeight
                } = client.canvas;
                const maxClrId = isProtect ? 1 : client.canvas.palette.length - 1;

                const pxlsCount = (message.length - 6) / 4;

                if (!isProtect && client.bucket.allowance < pxlsCount) {
                    return
                }
                client.bucket.spend(pxlsCount);

                for (let i = 6; i < message.length; i += 5) {
                    const x = message.readUInt16BE(i);
                    const y = message.readUInt16BE(i + 2);
                    const clr = message.readUInt8(i + 4);


                    if (clr < 0 || clr > maxClrId) {
                        continue
                    }

                    if (x < 0 || x >= realWidth ||
                        y < 0 || y >= realHeight) continue;

                    if (!isTrusted) {
                        // check for protection
                        const oldPixel = client.canvas.chunkManager.getChunkPixel(x, y);
                        if (oldPixel & 0x80) {
                            writeInvalidPixel(message, i);
                            continue;
                        }
                    }

                    if (isProtect) {
                        client.canvas.chunkManager.setPixelProtected(x, y, clr);
                    } else {
                        client.canvas.chunkManager.setChunkPixel(x, y, clr);
                        client.canvas.chunkManager.setPlacerDataRaw(x, y, client.placeInfoFlag, client.placeInfoNumber);
                    }


                }

                if (!client.user.isApiSocket) message.writeUInt32BE(client.id, 2);

                this.broadcastForCanvasFast(client.canvas, message);

                break
            }
            case OPCODES.canvas: {
                if (client.canvas) return;

                const canvas = message.readUInt8(1);

                if (canvas < 0 || canvas >= this.canvases.length) {
                    return client.sendError('Wrong canvas number');
                }

                if (!this.checkCanvasRequires(client, this.canvases[canvas]))
                    return client.sendError('Access for this canvas is restricted');

                client.canvas = this.canvases[canvas];

                let cooldown;
                if (client.user) {
                    if (client.user.role === 'BANNED') {
                        client.kill()
                    }
                    if (client.user.role == 'ADMIN')
                        cooldown = [0, 32]
                    else {
                        cooldown = client.canvas.cooldown[client.user.role];
                    }
                } else {
                    cooldown = client.canvas.cooldown.GUEST
                }

                client.bucket = new Bucket(...cooldown);

                this.onCanvasChosen(client.canvas, client);

                break
            }
            case OPCODES.ping: {
                client.emit('pong');
                break;
            }
        }
    }

    handleStringMessage(msg, client) {
        try {
            msg = JSON.parse(msg);
        } catch {
            logger.debug('cannot parse string message: ' + msg);
            return
        }

        switch (msg.c) {
            // unsubscribes is not provided by the moment
            case STRING_OPCODES.subscribeChat: {
                if (!msg.ch || typeof msg.ch !== 'string' ||
                    this.channels[msg.ch] === undefined) {

                    return client.sendError('invalid channel');
                }

                if (!this.checkCanvasRequires(client, this.channels[msg.ch].canvas)) {
                    return client.sendError('Access for this channel is restricted')
                }

                // for the moment it's the only way to detect if
                // client is reconnected after server reload
                if (msg.reconnect) {
                    if (Date.now() - this.startTime < 10000) {
                        const packet = createStringPacket.reload();
                        client.send(JSON.stringify(packet));
                        return
                    }
                }

                const ch = this.channels[msg.ch];

                if (client.subscribedChs.includes(ch))
                    return

                client.subscribedChs.push(ch);
                if (this.checkUser(client)) {
                    if (!client.chatBuckets[ch.name]) {
                        client.chatBuckets[ch.name] = new Bucket(...chatBucket[client.user.role]);
                    }
                }
                if (!msg.reconnect) {
                    this.onChatSubscribed(ch, client);
                }

                break
            }
            case STRING_OPCODES.chatMessage: {
                if (!this.checkUser(client) ||
                    !this.checkCaptcha(client) ||
                    !msg.msg || msg.ch === undefined
                ) return;

                const channel = this.channels[msg.ch];
                if (!channel) return;

                if (!this.checkCanvasRequires(client, this.channels[msg.ch].canvas)) {
                    return client.sendError('Access for this channel is restricted')
                }

                const nick = client.user.name;
                const message = msg.msg.trim();

                let maxLen = 200, user = client.user;
                switch (true) {
                    case checkRole(user, ROLE.TRUSTED): maxLen = 250;
                    case checkRole(user, ROLE.MOD): maxLen = 400;
                    case checkRole(user, ROLE.ADMIN): maxLen = Infinity;
                }

                if (!message.length || message.length > maxLen) return;

                if (!client.chatBuckets[channel.name].spend(1)) {
                    return client.sendChatWarn('You\'ve been hit chat limit. Wait')
                }

                if (msg.whisper) {
                    let target = null;
                    for (let [_, client] of this.clients.entries()) {
                        if (client.user && client.user.id == msg.whisper && client.subscribedChs.includes(channel)) {
                            target = client;
                            break
                        }
                    }

                    if (!target) {
                        return client.sendChatWarn(`User with id "${msg.whisper}" is not online on this canvas`);
                    }

                    // why span? name color tags which aren't closed will spread to the message
                    target.sendChat(`[w] ${client.user.name}`, `[i]${message}[/i]`, channel.name, false);
                    return
                }

                const chatMessage = channel.addMessage(nick, message);

                const packet = createStringPacket.chatMessage(chatMessage, channel.name);
                this.broadcastString(JSON.stringify(packet), receiver => {
                    return receiver.subscribedChs.includes(channel)
                })

                break
            }
            case STRING_OPCODES.alert: {
                if (!this.checkUser(client) ||
                    ROLE[client.user.role] < ROLE.MOD
                ) {
                    return
                }

                if (msg.msg.length == 0) {
                    return
                }

                let packet = createStringPacket.alert(msg.msg, msg.type);

                if (msg.to === 'all') packet.msg = '[all] ' + packet.msg;

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
        let online = [...this.clients.values()].reduce((s, c) => c.canvas ? s + 1 : s, 0);

        let buf = Buffer.alloc(1 + 3);
        buf.writeUInt8(OPCODES.online, 0);
        buf.writeUInt16BE(online, 1);

        this.broadcastBinary(buf);
    }

    broadcastForCanvasFast(canvas, buffer) {
        // we create a frame manually
        // to avoid object recreation
        // for every receiver
        const frame = WebSocket.Sender.frame(buffer, {
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

    broadcastReload(canvas) {
        const packet = createStringPacket.reload();
        this.broadcastString(JSON.stringify(packet), canvas ? c => c.canvas == canvas : null);
    }


    broadcastBinary(data) {
        this.clients.forEach(client => client.send(data));
    }

    broadcastString(msg, checkFunc) {
        if (checkFunc)
            this.broadcastStringByCond(msg, checkFunc);
        else
            this.clients.forEach(client => client.send(msg));
    }

    broadcastStringByCond(msg, checkFunc) {
        this.clients.forEach(client => checkFunc(client) && client.send(msg));
    }

    onChatSubscribed(ch, client) {
        logger.debug(client.ip + ' subscribed ' + ch.name);

        // this single instance is used all below
        const message = createStringPacket.chatMessage({}, ch.name);

        ch.getMessages().forEach(msg => {
            message.nick = msg.name;
            message.msg = msg.message;
            message.server = msg.isServer;

            client.send(JSON.stringify(message));
        });

        if (this.MOTD) {
            // change to motd
            message.nick = '';
            message.server = true;
            message.msg = '[b]MOTD: ' + this.MOTD + '[/b]';
            client.send(JSON.stringify(message));
        } else {
            // change to welcome
            message.nick = '';
            message.server = true;

            message.msg = `Welcome to the [#00f986]Goroxels[], server ${ch.name}!`;
            client.send(JSON.stringify(message));
        }
    }

    sendServerMessage(message, channel, addToLog = true) {
        const packet = createStringPacket.chatMessage({
            nick: '',
            message
        }, channel ? channel.name : undefined);
        packet.server = true;
        addToLog && channel && channel.addMessage('', message, true)
        this.broadcastString(JSON.stringify(packet), receiver => {
            return channel ? receiver.subscribedChs.includes(channel) : true
        })
    }

    onCanvasChosen(canvas, client) {
        const role = client.user ? client.user.role : 'GUEST';
        if (!this.connections[canvas.name][client.ip])
            this.connections[canvas.name][client.ip] = 1;
        else
            this.connections[canvas.name][client.ip]++;

        if (this.connections[canvas.name][client.ip] > MAX_CLIENTS_PER_IP[role]) {
            client.sendError('connections limit');
            return client.kill();
        }

        let placeInfoFlag, placeInfoNumber;
        if (client.user) {
            placeInfoFlag = 2;
            placeInfoNumber = client.user.id;
        } else {
            if (typeof client.ipInt === 'bigint') {
                placeInfoFlag = 3;
            } else {
                placeInfoFlag = 1
            }

            placeInfoNumber = client.ipInt;
        }

        client.placeInfoFlag = placeInfoFlag;
        client.placeInfoNumber = placeInfoNumber;

        const packet = createStringPacket.userJoin(client);
        client.joinTime = Date.now();

        // send join to all clients on this canvas
        if (!client.user || !client.user.isApiSocket)
            this.broadcastString(JSON.stringify(packet), CONDITION.sameCanvas(client));

        this.clients.forEach(_client => {
            if (_client.user && _client.user.isApiSocket) return;

            if (_client == client) {
                const mePacket = createStringPacket.me(client.id);
                client.send(JSON.stringify(mePacket));
            } else if (_client.canvas === canvas) {
                packet.nick = _client.user ? _client.user.name : null;
                packet.userId = _client.user ? _client.user.id : null;

                packet.id = _client.id;
                packet.registered = !!_client.user;
                packet.role = _client.user ? _client.user.role : null;

                client.send(JSON.stringify(packet));
            }
        });

        this.broadcastOnline();
    }

    // close any socket by condition function
    closeBy(condition) {
        this.clients.forEach(client => {
            if (condition(client)) {
                client.kill();
                this.leaved.set(client.id, client)
                this.clients.delete(client.id);
            }
        })
    }

    closeByIp(ip) {
        this.closeBy(client => client.ip === ip);
    }

    closeByUser(user) {
        this.closeBy(client => client.user && client.user.id === user.id);
    }

    ping() {
        this.clients.forEach(client => {
            if (!client.isAlive) {
                return client.kill();
            }
            client.ping();
            client.isAlive = false;
        })
    }

    updateOnlineStats() {
        for (let key of Object.keys(this.connections)) {
            let totalPerCanvas = 0;
            for (let ipConns of Object.values(this.connections[key])) {
                if (ipConns == 0) continue;
                totalPerCanvas++;
            }
            this.onlineStats[key] = totalPerCanvas;
        }
    }

    broadcastRadioChange(type = 0) {
        const packet = createPacket.radioChange(type);
        this.broadcastBinary(packet);
    }
}

module.exports = Server