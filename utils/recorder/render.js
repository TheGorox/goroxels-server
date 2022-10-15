/**
 * renders binary pixel data recorded with record.js
 * use: node render.js dir
 * where dir is record.js output directory
 * 
 * correct HOP constant to make more or less frames
 * HOP=0 renders every pixel
 * HOP is minimum time gone from previous placed pixel to render a frame
 */

const fs = require('fs');
const pathlib = require('path');
const PNG = require('pngjs').PNG;
const sharp = require('sharp');

const HOP = 300; // ms

const dir = process.argv[2];
if(!dir) throw new Error('Dir must be provided to argv');

let startNum = 0;
if(process.argv[3]){
	const overrideStartNum = parseInt(process.argv[3]);
	if(!isNaN(overrideStartNum)){
		startNum = overrideStartNum;
		console.log('set startNum to', overrideStartNum)
	}
}

const basedir = pathlib.join(__dirname, dir);

const conf = JSON.parse(fs.readFileSync(pathlib.join(basedir, 'config.json')).toString());
const chunks = fs.readFileSync(pathlib.join(basedir, 'chunks.bin'));
const pixels = fs.readFileSync(pathlib.join(basedir, 'pixels.bin'));

const saveName = conf.name + '-' + ((Math.random()*(9999-1000)|0)+1000);
const outDir = pathlib.join(__dirname, 'frames', saveName)
fs.mkdirSync(outDir);


function rgb2abgr(r, g, b) {
    return 0xff000000 | b << 16 | g << 8 | r;
}

function unpackPixel(num) {
    return [
        num >>> 19,
        num >>> 7 & 0xFFF,
        num & 0b1111111
    ]
}

class Canvas{
    constructor(config){
        this.width = config.boardWidth*config.chunkSize;
        this.height = config.boardHeight*config.chunkSize;

        this.chunkWid = config.boardWidth;
        this.chunkHei = config.boardHeight;
        this.chunkSize = config.chunkSize;

        this.data = new Uint8Array(this.width*this.height);
        this.data32 = new Uint32Array(this.width*this.height);
        this.palette = config.palette;
        this.palette32 = this.palette.map(c => rgb2abgr(...c));
    }

    set(x, y, c){
        const i = x + y *this.width;
        this.data32[i] = this.palette32[c];
    }

    /**
     * 
     * @param {Buffer} chunksBuf 
     */
    initFromChunks(chunksBuf){
        const maxI = this.chunkWid*this.chunkHei;
        const chunkLen = this.chunkSize**2;
        for(let i = 0; i < maxI; i++){
            const offset = i*chunkLen;

            const chunkX = i % this.chunkWid;
            const chunkY = i / this.chunkWid | 0;

            const canvasXOffs = chunkX * this.chunkSize;
            const canvasYOffs = chunkY * this.chunkSize;

            let chunkData = chunksBuf.slice(offset, offset+chunkLen);
            for(let y = canvasYOffs, localY=0; y < canvasYOffs+this.chunkSize; y++, localY++){
                const dataStart = y*this.width+canvasXOffs;
                const sourceStart = localY*this.chunkSize;
                const sourceEnd = sourceStart+this.chunkSize;
                chunkData.copy(this.data, dataStart, sourceStart, sourceEnd);
            }
        }

        this.convertTo32();
    }

    convertTo32(){
        this.data.map((val, i) => {
            this.data32[i] = this.palette32[val&0x7F];
        })
    }

    async save(path){
        const png = new PNG({
            width: this.width,
            height: this.height
        });

        png.data = Buffer.from(this.data32.buffer)

        return new Promise((res, rej) => {
            png.pack().pipe(fs.createWriteStream(path)).on('error', rej).on('close', res);
        })
    }

    async saveFast(path) {
		await sharp(Buffer.from(this.data32.buffer), {
			raw: {
				width: this.width,
				height: this.height,
				channels: 4
			}
		}).toFile(path)
	}
}

(async () => {

    let canvas = new Canvas(conf);
    canvas.initFromChunks(chunks);
    
    console.log(`Will save to frames/${saveName}`)
    
    let frame = startNum;
    let i = 0;

    let stackedTime = 0;
    for(let _i = 0; _i < pixels.length; _i+=8){
        const pixel = pixels.readUInt32BE(_i);
        const time = pixels.readUInt32BE(_i+4);

        stackedTime += time;

        const [x, y, c] = unpackPixel(pixel);

        
        canvas.set(x, y, c);

        if(stackedTime >= HOP || _i == (pixels.length-8)){
            lastDate = time
            try{
                await canvas.saveFast(pathlib.join(outDir, `${frame++}.png`))

                let perc = (_i/4)/(pixels.length/4)*100
                console.log(`Saved frame ${frame}, pixels drawn ${_i/8}/${pixels.length/8} | ${perc|0}%`)
            }catch(e){
                console.error(e)
            }
            stackedTime = 0;
        }
    }

    console.log(`Saved to frames/${saveName}`)
})()
