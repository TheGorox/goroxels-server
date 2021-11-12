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
const { getIPFromRequest, getIPv6Subnet } = require('./utils/ip');
const config = require('./config');
const { checkCanvasConditions } = require('./utils/canvas');
const { checkRole } = require('./utils/role');

const ipConns = {};

let instance = null;

// conditions for msg broadcasting
const CONDITION = {
    sameCanvas: client => _c => _c.canvas == client.canvas
}

const notValidPixel = 0xffffffff;
function writeInvalidPixel(buffer, i){
    buffer.writeUInt32BE(notValidPixel, i)
}

class Server {
    /**
     * 
     * @returns {Server}
     */
    static getInstance() {
        return instance
    }

    constructor() {
        this.canvases = global.canvases;
        // chat channels
        this.channels = {};

        this.clients = new Map();
        this.leaved = new Map();

        this.wss = null;

        instance = this;
    }

    run() {
        const wss = new WebSocketServer({
            noServer: true,
            maxPayload: 65536
        });

        this.channels.global = new ChatChannel('global');

        this.canvases.forEach(canvas => {
            this.channels[canvas.name] = new ChatChannel(canvas.name);
            this.channels[canvas.name].canvas = canvas;
        })

        wss.on('connection', (socket, request, user) => {
            const ip = getIPv6Subnet(getIPFromRequest(request));

            const role = user ? user.role : 'GUEST';


            if (ipConns[ip] >= MAX_CLIENTS_PER_IP[role]) {
                let msg = createStringPacket.error('conn_limit');
                socket.send(JSON.stringify(msg));

                return socket.close();
            }

            const client = new Client(socket, ip);
            client.user = user;
            client.ip = ip;

            this.clients.set(client.id, client);

            if (ipConns[ip])
                ipConns[ip] += 1;
            else
                ipConns[ip] = 1;

            socket.onclose = () => {
                // won't let users use reconnection to reset cd or spam
                setTimeout(() => {
                    ipConns[ip]--;
                }, 900);

                if(!client.user || !client.user.isApiSocket){
                   if(client.canvas){
                    const packet = {
                        c: STRING_OPCODES.userLeave,
                        id: client.id
                    };
                    this.broadcastString(JSON.stringify(packet), CONDITION.sameCanvas(client));
                };

                this.leaved.set(client.id, client);
                }

                this.clients.delete(client.id);                 
                socket = null;

                this.broadcastOnline();
            }

            socket.onmessage = (event) => this.onmessage(client, event);

            if (needCaptcha(client.ip, client)) {
                client.sendCaptcha();
            }

            this.broadcastOnline();
        });
        wss.on('error', err => {
            logger.error(err);
        })

        this.wss = wss;
        setInterval(this.ping.bind(this), 45000);
    }
 
    checkUser(client) {
        return !!client.user
    }

    checkCanvas(client) {
        return client.canvas !== null
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
                logger.error(e, client.user)
            }
        } else {
            try {
                this.handleBinaryMessage(message, client);
            } catch (e) {
                logger.error(e, client.user)
            }
        }
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

                function send(){
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
                    !this.checkDelay(client)) return;

                if (!client.bucket.spend(1)) {
                    return
                };

                const canvas = client.canvas;

                const [x, y, c] = unpackPixel(message.readUInt32BE(1));

                if (x < 0 || x >= canvas.realWidth ||
                    y < 0 || y >= canvas.realHeight ||
                    c < 0 || c >= canvas.palette.length) return;

                const oldPixel = canvas.chunkManager.getChunkPixel(x, y);

                // protected and (no user or user<mod) or
                // old pixel id = new pixel id
                if (((oldPixel & 0x80) && (!client.user || ROLE[client.user.role] < ROLE.MOD)) ||
                    (oldPixel & 0x7F === c)) {
                    return;
                }

                canvas.chunkManager.setChunkPixel(x, y, c);

                const pixel = createPacket.pixelSend(x, y, c & 0x7F, client.id);
                this.broadcastPixel(canvas, pixel);

                break
            }
            case OPCODES.pixels: {
                if (!this.checkCanvas(client) ||
                    !this.checkCaptcha(client) ||
                    !this.checkUser(client) ||
                    !this.checkDelay(client)) return;

                const isProtect = !!message.readUInt8(1);
                if (isProtect && ROLE[client.user.role] < ROLE.MOD) {
                    logger.info(`User ${client.user.name} tried to protect many pixels`);
                    return
                }

                const {
                    realWidth, realHeight
                } = client.canvas;
                const max = isProtect ? 1 : client.canvas.palette.length-1;

                const pxlsCount = (message.length - 6) / 4;

                if (!isProtect && client.bucket.allowance < pxlsCount) {
                    return 
                }
                client.bucket.spend(pxlsCount);

                for (let i = 6; i < message.length; i += 4) {
                    let [
                        x, y, clr
                    ] = unpackPixel(message.readUInt32BE(i));

                    // TODO client side pixel validation

                    if (clr < 0 || clr > max) {
                        continue
                    }

                    if (x < 0 || x >= realWidth ||
                        y < 0 || y >= realHeight) continue;

                    if (ROLE[client.user.role] < ROLE.MOD) {
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
                    }
                }

                message.writeUInt32BE(client.id, 2);

                this.broadcastPixels(client.canvas, message);

                break
            }
            case OPCODES.canvas: {
                if (client.canvas) return;

                const canvas = message.readUInt8(1);

                // unsigned but "doverai no proverai"
                if (canvas < 0 || canvas >= this.canvases.length) {
                    return client.sendError('Wrong canvas number');
                }

                if(!this.checkCanvasRequires(client, this.canvases[canvas]))
                    return client.sendError('Access for this canvas is restricted');

                client.canvas = this.canvases[canvas];

                let cooldown;
                if (client.user) {
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

                if(!this.checkCanvasRequires(client, this.channels[msg.ch].canvas)){
                    return client.sendError('Access for this channel is restricted')
                }

                const ch = this.channels[msg.ch];

                if (client.subscribedChs.includes(ch))
                    return

                client.subscribedChs.push(ch);
                if(this.checkUser(client)){
                    if(!client.chatBuckets[ch.name]){
                        client.chatBuckets[ch.name] = new Bucket(...chatBucket[client.user.role]);
                    }
                }
                if (ch.name !== 'global' && !msg.reconnect) {
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

                if(!this.checkCanvasRequires(client, this.channels[msg.ch].canvas)){
                    return client.sendError('Access for this channel is restricted')
                }

                const nick = client.user.name;
                const message = msg.msg.trim();

                let maxLen = 200, user=client.user;
                switch(true){
                    case checkRole(user, ROLE.TRUSTED): maxLen = 250;
                    case checkRole(user, ROLE.MOD): maxLen = 400;
                    case checkRole(user, ROLE.ADMIN): maxLen = Infinity;
                }

                if (!message.length || message.length > maxLen) return;

                if(!client.chatBuckets[channel.name].spend(1)){
                    // TODO replace with chat warnings
                    return client.sendError('Chat limit')
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

                // second restriction is stupid, maybe remove?
                if (msg.msg.length == 0) {
                    return
                }

                let packet = createStringPacket.alert(msg.msg);

                if (msg.to === 'all') packet.msg = '[all] ' + packet.msg;

                packet = JSON.stringify(packet);

                if (msg.to === 'all' && ROLE[client.user.role] === ROLE.ADMIN) {
                    this.clients.forEach(client => client.send(packet));
                } else if (!isNaN(msg.to)) {
                    console.log(1)
                    const id = +msg.to;
                    const client = this.clients.get(id);
                    console.log(client, id, this.clients, [...this.clients.keys()])
                    if (!client) return;
                    console.log(2)

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

    broadcastReload(canvas){
        const packet = createStringPacket.reload();
        this.broadcastString(JSON.stringify(packet), canvas ? c => c.canvas == canvas : null);
    }


    broadcastBinary(data) {
        this.clients.forEach(client => client.send(data));
    }

    broadcastString(msg, checkFunc) {
        if(checkFunc)
            this.broadcastStringByCond(msg, checkFunc);
        else
            this.clients.forEach(client => client.send(msg));
    }

    broadcastStringByCond(msg, checkFunc){
        this.clients.forEach(client => checkFunc(client) && client.send(msg));
    }

    onChatSubscribed(ch, client) {
        logger.debug(client.ip + ' subscribed ' + ch.name);

        const message = createStringPacket.chatMessage({}, ch.name);

        ch.getMessages().forEach(msg => {
            message.nick = msg.name;
            message.msg = msg.message;
            message.server = msg.isServer;

            client.send(JSON.stringify(message));
        });

        // send welcome
        message.nick = '';
        message.server = true;

        message.msg = `Welcome to the [#00f986]Goroxels[], server ${ch.name}!`;
        client.send(JSON.stringify(message));

        if (!client.user) {
            message.msg = `Use <a href="/api/auth/discord">Discord</a> to log in!`;
            client.send(JSON.stringify(message));
        }
    }

    sendServerMessage(message, channel, addToLog=true){
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
        const packet = createStringPacket.userJoin(client);

        client.joinTime = Date.now();

        // send join to all clients on this canvas
        if(!client.user || !client.user.isApiSocket)
            this.broadcastString(JSON.stringify(packet), CONDITION.sameCanvas(client));

        this.clients.forEach(_client => {
            if(!_client.user || _client.user.isApiSocket) return;

            if(_client == client){
                const mePacket = createStringPacket.me(client.id);
                client.send(JSON.stringify(mePacket));
            } else if (_client.canvas === canvas) {
                packet.nick = _client.user ? _client.user.name : null;
                packet.userId = _client.user ? _client.user.id : null;

                packet.id = _client.id;
                packet.registered = !!_client.user;

                client.send(JSON.stringify(packet));
            }
        });
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

    setChunk(canvasId, cx, cy, data){
        const canvas = this.canvases[canvasId];
        canvas.chunkManager.setChunkData(cx, cy, data);
    }

    ping(){
        this.clients.forEach(client => {
            if(!client.isAlive){
                return client.kill();
            }
            client.ping();
            client.isAlive = false;
        })
    }
}

module.exports = Server