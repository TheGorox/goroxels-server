/**
 * use if want to record every pixel placed to data
 * decoded and translated to frames with render.js
 * 
 * use: node recorder.js canvasId
 * 
 * p.s. may crash if large amount of data recorded
 * can be optimized, but i'm lazy to do it now
 */

const WebSocketClient = require('ws');
const axios = require('axios').default;
const zlib = require('zlib');
const EventEmitter = require('events');
const fs = require('fs');
const pathlib = require('path');

function packPixel(x, y, col) {
    return (x << 12 | y) << 7 | col
}


function unpackPixel(num) {
    return [
        num >>> 19,
        num >>> 7 & 0xFFF,
        num & 0b1111111
    ]
}

class WSClient extends EventEmitter{
    constructor(local){
        super();

        this.addr = local ? 'ws://localhost/' : 'wss://goroxels.ru/'
        this.ws = null;
    }

    connect(cb=null){
        console.log('connecting');

        if(this.ws){
            this.ws.close();
        }

        this.ws = new WebSocketClient(this.addr);
        this.ws.onopen = cb;
        this.ws.onclose = () => setTimeout(this.connect.bind(this), 50, cb);
        this.ws.onmessage = this.onmessage.bind(this);
    }

    send(...args){
        if(this.ws.readyState !== this.ws.OPEN)
            throw new Error('Cant send on closed socket!')

        this.ws.send(...args)
    }

    sendCanvasReg(cid){
        const buf = Buffer.alloc(2);
        buf.writeUInt8(3, 0);
        buf.writeUInt8(cid, 1);

        this.ws.send(buf);
    }

    sendChunkReq(cx, cy){
        let buf = Buffer.alloc(3);
        buf.writeUInt8(0, 0);
        buf.writeUInt8(cx, 1);
        buf.writeUInt8(cy, 2);

        this.send(buf)
    }

    /**
     * 
     * @param {WebSocketClient.MessageEvent} msgEv 
     * @returns 
     */
    onmessage(msgEv){
        if(msgEv.type !== 'message' || typeof msgEv.data == 'string') return;

        const msg = msgEv.data;
        const op = msg.readUInt8(0);

        switch(op){
            case 0: { // CHUNKDATA
                const cx = msg.readUInt8(1);
                const cy = msg.readUInt8(2);
                const chunkData = zlib.inflateSync(msg.slice(3));
                this.emit('chunk', cx, cy, chunkData);
                break
            }
            case 1: {
                const [x, y, col] = unpackPixel(msg.readUInt32BE(1));
                //const id = dv.getUint32(5);
                this.emit('place', x, y, col);
                break
            }
            case 4: {
                const isProtect = !!msg.readUInt8(1);
                if(isProtect) return;

                for(let i = 6; i < msg.length; i+=4){
                    const [x, y, col] = unpackPixel(msg.readUInt32BE(i));
                    this.emit('place', x, y, col);
                }
                break
            }
        }
    }
}

async function wait(ms){
    return new Promise(res => setTimeout(res, ms));
}

class Recorder{
    constructor(isLocal, canvas){
        this.local = isLocal;
        this.canvas = canvas;
        this.client = new WSClient(isLocal);

        this.canvasCfg = null;

        this.startChunkData = {};
        this.pixels = [];

        this.init();
    }

    async init(){
        this.canvasCfg = await this.fetchCanvasData(this.canvas)
        this.client.connect(this.onconnect.bind(this));

        this.client.on('place', (x, y, c) => {
            //console.log(`place on ${x} x ${y} color ${c}`);
            this.pixels.push([packPixel(x, y, c), Date.now()]);
        })

        this.client.on('chunk', (cx, cy, cd) => {
            console.log(`got chunk ${cx} x ${cy}`);
            this.startChunkData[cx + ' ' + cy] = cd;
        })

        setInterval(this.save.bind(this), 5 * 1000 * 60, true);

        process.on('SIGINT', () => {
            this.save();
            process.exit();
        });
    }

    async fetchCanvasData(cid){
        const baseurl = this.local ? 'http://localhost' : 'https://goroxels.ru';

        const resp = await axios.get(baseurl + '/config.json');
        return resp.data.canvases[cid]
    }

    onconnect(){
        console.log('connected');
        this.client.sendCanvasReg(this.canvas)
        setTimeout(async () => {
            for(let x = 0; x < this.canvasCfg.boardWidth; x++){
                for(let y = 0; y < this.canvasCfg.boardHeight; y++){
                    this.client.sendChunkReq(x, y);
                    await wait(30);
                }
            }
        }, 300);
    }

    save(temp){
        let foldername;
        if(temp){ // backup
            foldername = this.canvasCfg.name + '.' + Date.now();
        }else{
            foldername = this.canvasCfg.name + '-temp';
        }
        console.log('saving into out/' + foldername);

        const outPath = pathlib.join(__dirname, '/out/', foldername);

        if(fs.existsSync(outPath)){
            fs.rmSync(outPath, { recursive: true });
        }

        fs.mkdirSync(outPath);

        this.saveChunks(outPath);
        this.savePixels(outPath);
        this.saveConfig(outPath);
    }

    saveChunks(dest){
        const cw = this.canvasCfg.boardWidth,
            ch = this.canvasCfg.boardHeight;
        const chunksTotal = cw * ch;
        const chunkSize = this.canvasCfg.chunkSize**2
        const raw = Buffer.allocUnsafe(chunksTotal*chunkSize);
        for(let i = 0; i < chunksTotal; i++){
            const x = i % cw;
            const y = i / cw | 0; 
            const chunk = this.startChunkData[x + ' ' + y];
            chunk.copy(raw, i*chunkSize);
        }

        fs.writeFileSync(dest + '/chunks.bin', raw);
    }

    savePixels(dest){
        const buf = Buffer.allocUnsafe(8*this.pixels.length);
        let i = 0;
        for(let [pixel, time] of this.pixels){
            buf.writeUInt32BE(pixel, i);
            buf.writeUInt32BE(time%0xffffffff, i+4);
            i += 8;
        }

        fs.writeFileSync(dest + '/pixels.bin', buf);
    }

    saveConfig(dest){
        fs.writeFileSync(dest + '/config.json', JSON.stringify(this.canvasCfg));
    }
}

const isLocal = false;

let canvas = process.argv[2];
if(!canvas) throw new Error('no canvas in argv')
new Recorder(isLocal, canvas);