const logger = require('./logger')('WEBSOCKET');

const {
    Server: WebSocketServer,
} = require('ws');

const WebSocket = require('ws');

const Client = require('./Client');
const Bucket = require('./Bucket');
const {
    OPCODES,
    STRING_OPCODES,
    createPacket
} = require('./protocol');
const {
    unpackPixel,
    packPixel
} = require('./utils');
const {
    realBoardWid,
    realBoardHei,
    palette,
    MAX_CLIENTS_PER_IP,
    captchaEnabled
} = require('./config');

const ipConns = {};

class Server {
    constructor(canvases) {
        this.canvases = canvases;

        this.clients = new Map();
        this.wss = null;
    }

    run() {
        const wss = new WebSocketServer({
            noServer: true,
        });
        wss.on('connection', (socket, request, user) => {
            const ip = request.socket.remoteAddress;

            if(ipConns[ip] >= MAX_CLIENTS_PER_IP){
                let msg = [STRING_OPCODES.error, 'conn_limit'];
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

                this.clients.delete(socket);
                this.broadcastOnline();
            }

            socket.onmessage = (event) => this.onmessage(client, event);

            this.broadcastOnline();
        });

        this.wss = wss;
    }

    onmessage(client, ev) {
        // TODO: replace it with more effective
        // event type check
        if (ev.type !== 'message') return;

        let message = ev.data;
        if (typeof message === 'string') {
            logger.debug('Got string message: ' + message)
        } else {
            switch (message.readUInt8(0)) {
                case OPCODES.chunk: {
                    if(client.state === 0){
                        return client.sendError('Canvas must be chosen, you, dirty botter');
                    }

                    const cx = message.readUInt8(1);
                    const cy = message.readUInt8(2);

                    const canvas = client.canvas;

                    if(cx < 0 || cy < 0 || cx >= canvas.width || cy >= canvas.height){
                        return client.sendError('Chunk coordinates out of bounds');
                    }

                    const chunkManager = canvas.chunkManager;

                    let chunkData = chunkManager.getChunkData(cx, cy);

                    client.send(createPacket.chunkSend(cx, cy, chunkData));

                    break
                }
                case OPCODES.place: {
                    if(client.state === 0){
                        return client.sendError('Canvas must be chosen, you, dirty botter');
                    }else if(client.state === 1){
                        return client.sendError('captcha');
                    }

                    if(!client.bucket.spend(1)) return;

                    const canvas = client.canvas;

                    const [x, y, c] = unpackPixel(message.readUInt32BE(1));

                    if (x < 0 || x >= realBoardWid ||
                        y < 0 || y >= realBoardHei ||
                        c < 0 || c >= canvas.palette.length) return;

                    canvas.chunkManager.setChunkPixel(x, y, c);
                    this.broadcastBinary(message);

                    break
                }
                case OPCODES.canvas: {
                    const canvas = message.readUInt8(1);

                    // unsigned but i don't care
                    if(canvas < 0 || canvas >= this.canvases.length){
                        return client.send('Wrong canvas number');
                    }

                    if(client.state == 0 && captchaEnabled){
                        client.state = 1
                    }else{
                        client.state = 2
                    }

                    client.canvas = this.canvases[canvas];

                    let cooldown;
                    if(client.user){
                        if(client.user.role === 'admin'){
                            cooldown = [0, 32];
                        }else{
                            cooldown = client.canvas.cooldown.user
                        }
                    }else{
                        cooldown = client.canvas.cooldown.guest
                    }

                    client.bucket = new Bucket(...cooldown);

                    break
                }
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

    broadcastString(msg) {
        this.clients.forEach(client => client.send(msg));
    }
}

module.exports = Server