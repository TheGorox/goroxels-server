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
        const server = new http.Server((req, res) => {
            if (req.url === '/api') {
                res.end('Your ip: 127.0.0.1; Banned: true')
            } else {
                res.end('404 Not Found')
            }
        });

        const wss = new WebSocketServer({
            server: server
        });
        wss.on('connection', (socket, request) => {
            const client = new Client(socket);

            this.clients.set(socket, client);

            socket.onclose = () => {
                this.clients.delete(socket);
            }

            socket.onmessage = (event) => this.onmessage(socket, event);
        })

        server.on('clientError', res => {
            res.end('HTTP/1.1 400 Bad Request/r/n/r/n')
        })
        server.listen(config.port || 1488);

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

                    if (x < 0 || x > realBoardWid ||
                        y < 0 || y > realBoardHei ||
                        c < 0 || c >= palette.length) return;

                    this.chunkManager.setChunkPixel(x, y, c);
                    this.broadcast(message)
                }
            }
        }
    }

    broadcast(message) {
        this.clients.forEach(client => client.send(message));
    }
}

module.exports = Server