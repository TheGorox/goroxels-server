const http = require('http');
const {
    Server: WebSocketServer
} = require('ws');

const Client = require('./Client');
const {
    OPCODES,
    createPacket
} = require('./protocol');
const {
    unpackPixel,
    packPixel
} = require('./utils');
const {
    realBoardWid,
    realBoardHei,
    palette
} = require('./config')

class Server {
    constructor(cm) {
        this.chunkManager = cm;

        this.clients = new Map();
    }

    run(config = {}) {
        const wss = new WebSocketServer({
            port: config.port || 1488,
        });
        wss.on('connection', (socket, request) => {
            const client = new Client(socket);

            this.clients.set(socket, client);

            socket.onclose = () => {
                this.clients.delete(socket);
                this.broadcastOnline();
            }

            socket.onmessage = (event) => this.onmessage(socket, event);

            this.broadcastOnline();
        })

        console.log('Listening!');
    }

    onmessage(socket, ev) {
        // TODO: replace it with more effective
        // event type check
        if (ev.type !== 'message') return;

        let message = ev.data;
        if (typeof message === 'string') {

        } else {
            switch (message.readUInt8(0)) {
                // TODO: check is coords in bounds
                case OPCODES.chunk: {
                    const cx = message.readUInt8(1);
                    const cy = message.readUInt8(2);

                    let chunkData = this.chunkManager.getChunkData(cx, cy);

                    socket.send(createPacket.chunkSend(cx, cy, chunkData));

                    break
                }
                case OPCODES.place: {
                    const [x, y, c] = unpackPixel(message.readUInt32BE(1));

                    if (x < 0 || x >= realBoardWid ||
                        y < 0 || y >= realBoardHei ||
                        c < 0 || c >= palette.length) return;

                    this.chunkManager.setChunkPixel(x, y, c);
                    this.broadcast(message)
                }
            }
        }
    }

    broadcastOnline(){
        let online = this.clients.size;

        let buf = Buffer.allocUnsafe(1 + 3);
        buf.writeUInt8(OPCODES.online, 0);
        buf.writeUInt16BE(online, 1);

        this.broadcast(buf);
    }

    broadcast(message) {
        this.clients.forEach(client => client.send(message));
    }
}

module.exports = Server