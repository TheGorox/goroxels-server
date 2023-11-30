/*
    new, optimized backuper for canvases
    first folder (by creation date) in 
    /backupPath/canvas/day will be 
    a base image for every next backup in this folder
*/

const PNG = require('pngjs').PNG;
const fs = require('fs');
const { getFancyDate, getFancyTime } = require('./utils');
const fsp = fs.promises;
const async = require('async');
const zlib = require('zlib');

const pathlib = require('path');
const Chunk = require('./Chunk');

const logger = require('./logger')('BACKUP', 'debug');

const backupState = new Map();

const backupPath = pathlib.resolve(__dirname, '../backup/');

async function inflateAsync(buf) {
    return new Promise((res, rej) => {
        zlib.inflate(buf, (err, result) => {
            if (err) return rej(err);
            res(result);
        })
    })
}
async function deflateAsync(buffer){
    return new Promise((res, rej) => {
        zlib.deflate(buffer, (err, result) => {
            if(err) return rej(err);
            res(result);
        })
    })
}

function chunkKey(cx, cy){
    return `${cx},${cy}`
}

async function loadPrevState(chunkManager) {
    const canvasBackupPath = pathlib.resolve(backupPath, chunkManager.canvas.id.toString());
    const date = getFancyDate();

    const dayFolder = pathlib.join(canvasBackupPath, date);
    if (!fs.existsSync(dayFolder)){
        logger.debug('Not found dayFolder')
        return [false, emptyState(chunkManager)];
    }

    // read all saved times to determine the first one by date
    const dayTimes = await fsp.readdir(dayFolder);
    const dayTimesDates = await async.mapLimit(dayTimes, 8, async path => {
        path = pathlib.join(dayFolder, path)
        return [(await fsp.stat(path)).ctime, path]
    })

    // sort by creation date
    // so now we can load changes chronically
    const sortedDayTimes = dayTimesDates.sort((a, b) => a[0] - b[0]);
    const chunks = {};
    for ([_, timepath] of sortedDayTimes) {
        const metaPath = pathlib.join(timepath, 'metadata');
        let meta = await fsp.readFile(metaPath);
        meta = JSON.parse(meta.toString());

        if(meta.version != 2.2){
            throw new Error('Unsupported metadata version: ' + (meta.version||1.0));
        }

        const size = meta.chunkSize;
        const chunklen = size**2;
        const cw = meta.width;
        const ch = meta.height;

        const chunkdataPath = pathlib.join(timepath, 'chunkdata');

        const chunkdataGzipped = (await fs.promises.readFile(chunkdataPath)).buffer;
        let chunkdata = await inflateAsync(chunkdataGzipped);

        const changedBitsCount = cw * ch;
        const changedBits = chunkdata.subarray(0, Math.ceil(changedBitsCount / 8));
        const changedBitsArr = (new Array(changedBitsCount)).fill(0).map((_, i) => readBit(changedBits[i / 8 | 0], i % 8));

        const chunkLength = size ** 2;

        let currentOffset = Math.ceil(changedBitsCount / 8);
        for (let cy = 0; cy < ch; cy++) {
            for (let cx = 0; cx < cw; cx++) {
                const key = chunkKey(cx, cy);

                if (!changedBitsArr[cx + cy * cw]) {
                    if (!chunks[key]) {
                        throw new Error('No prevStateData on unchanged chunk');
                    }

                    continue;
                }


                const chunkOffset = currentOffset;
                currentOffset += chunkLength;
                const curChunkData = chunkdata.subarray(chunkOffset, chunkOffset + chunkLength);

                let chunk = chunks[key];
                if(!chunk){
                    chunk = new Chunk(cx, cy, size, curChunkData);
                    chunks[key] = chunk;
                    continue
                }

                for(let i = 0; i < chunklen; i++){
                    if(curChunkData[i] !== 0b11111111){
                        chunk.data[i] = curChunkData[i];
                    }
                }
            }
        }
    }
    return [true, chunks]
}
function emptyState(chunkManager) {
    const w = chunkManager.chunkWidth;
    const h = chunkManager.chunkHeight;
    const s = chunkManager.chunkSize;

    const emptyStateChunks = {};

    for(let cx = 0; cx < w; cx++){
        for(let cy = 0; cy < h; cy++){
            const chunk = new Chunk(cx, cy, s, Chunk.createEmpty(s));
            emptyStateChunks[chunkKey(cx, cy)] = chunk;
        }
    }

    return emptyStateChunks
}

async function chunkToImage(w, h, palette, data, name){
    return new Promise((res, rej) => {
        const png = new PNG({
            width: w,
            height: h,
            filterType: -1
        })

        if(data.data) data = data.data;

        for(let i = 0; i < data.length; i++){
            const I = i << 2;
            const color = data[i]&0x7F;
            const rgbed = palette[color];

            png.data[I] = rgbed[0];
            png.data[I+1] = rgbed[1];
            png.data[I+2] = rgbed[2];
            png.data[I+3] = 255;
        }

        png.pack().pipe(fs.createWriteStream(`C:/Users/Sha/Desktop/scripts/other/goroxels/goroxels-server/tests/img/${name}.png`)).once('close', res).once('error', rej)
    })
}

// takes canvasState and chunkManager instances
// and generates new, masked one, based on differences
// of chunk colors
// 0b11111111 means no change, otherwise update
// thus, maximum colors count practically reduced
// to 0b111111 = 64
function conjuctChunks(prevState, chunkManager){
    let ignoreDiffFlag = false;

    const REF_UNCHANGED_BUF = Buffer.alloc(chunkManager.chunkSize**2).fill(0b11111111);

    const changedBits = [];
    const chunksObj = {};

    for(let cy = 0; cy < chunkManager.boardHeight; cy++){
        for(let cx = 0; cx < chunkManager.boardWidth; cx++){
            const key = chunkKey(cx, cy);
            const stateChunk = prevState[key];
            if(!stateChunk){
                ignoreDiffFlag = true;
            }

            const cmChunk = chunkManager.getChunk(cx, cy);
            const newChunk = new Chunk(cx, cy, chunkManager.chunkSize, Chunk.createEmpty(chunkManager.chunkSize));

            if(ignoreDiffFlag){
                newChunk.setBuffer(cmChunk.data.slice());
                chunksObj[key] = newChunk;
                continue;
            }

            // эта часть скорее всего замедляет код
            for(let x = 0; x < chunkManager.chunkSize; x++){
                for(let y = 0; y < chunkManager.chunkSize; y++){
                    const psPixel = stateChunk.get(x, y);
                    const cmPixel = cmChunk.get(x, y);
                    if(psPixel !== cmPixel){
                        newChunk.setP(x, y, cmPixel);
                    }else{
                        newChunk.setP(x, y, 0b11111111)
                    }
                }
            }

            if(Buffer.compare(newChunk.data, REF_UNCHANGED_BUF) == 0){
                changedBits.push(0);
            }else{
                changedBits.push(1);
            }
            chunksObj[key] = newChunk;
        }
    }

    if(ignoreDiffFlag){
        changedBits.length = chunkManager.boardHeight*chunkManager.boardWidth;
        changedBits.fill(1);
    }

    return {
        changedBits,
        chunks: chunksObj
    }
}

function readBit(number, n) {
    return (number >> n) & 1
}
function setBit(mask, bit, pos){
    return mask ^ (-bit ^ mask) & (1 << pos);
}

async function backup(chunkManager) {
    const nowDate = new Date();

    let prevState = backupState.get(chunkManager);
    let keyframe = false;

    if (!prevState || prevState.day != nowDate.getUTCDate()) {
        logger.debug(`loading prevState for ${chunkManager.canvas.name}`);

        let [found, chunks] = await loadPrevState(chunkManager);
        if(!found){
            keyframe = true;
            for(let chunk of Object.values(chunkManager.chunks)){
                chunks[chunkKey(chunk.x, chunk.y)] = chunk.clone();
            }
        }

        prevState = {
            chunks,
            day: nowDate.getUTCDate()
        };
        backupState.set(chunkManager, prevState);
    }
    const timer = Date.now();

    const canvasBackupPath = pathlib.resolve(backupPath, chunkManager.canvas.id.toString());

    if (!fs.existsSync(backupPath)) fs.mkdirSync(backupPath);
    if (!fs.existsSync(canvasBackupPath)) fs.mkdirSync(canvasBackupPath);

    const date = getFancyDate(),
        time = getFancyTime().replace(/:/g, '-');

    const dayFolder = pathlib.resolve(canvasBackupPath, date);
    if (!fs.existsSync(dayFolder)) fs.mkdirSync(dayFolder);

    const timeFolder = pathlib.resolve(dayFolder, time);
    fs.mkdirSync(timeFolder);

    const canvas = chunkManager.canvas;

    let {
        chunks,
        changedBits
    } = conjuctChunks(prevState.chunks, chunkManager);
    if(keyframe) changedBits.fill(1);

    const chunkLength = chunkManager.chunkSize**2;

    const maxsize = chunkManager.boardWidth * chunkManager.boardHeight * chunkLength;
    const seqBuffer = Buffer.alloc(maxsize);
    let curOffset = 0;
    for(let cy = 0; cy < chunkManager.boardHeight; cy++){
        for(let cx = 0; cx < chunkManager.boardWidth; cx++){
            const i = cx + cy * chunkManager.boardWidth;
            const key = chunkKey(cx, cy);

            // if keyframe pick current chunk, with all data is just pixels
            // otherwise we'll use masked data from conjuctChunks
            // (masked data will significantly improve zip speed and effectiveness)

            if(!prevState.chunks[key]){
                prevState.chunks[key] = chunkManager.getChunk(cx, cy).clone();
            }
            
            let curChunk = keyframe ? prevState.chunks[key] : chunks[key];

            if(changedBits[i]){
                
                Buffer.from(curChunk.data.buffer).copy(seqBuffer, curOffset);
                curOffset += chunkLength;
                prevState.chunks[key].data = chunkManager.getChunk(cx, cy).data.slice();
            }
        }
    }

    const changedBitsPadding = Math.ceil((canvas.width*canvas.height)/8);
    const changedBitsBuffer = Buffer.alloc(changedBitsPadding);
    changedBits.forEach((v, i) => {
        const octet = i / 8 | 0;
        const rem = i % 8;
        changedBitsBuffer[octet] = setBit(changedBitsBuffer[octet], v, rem);
    })

    const finalChunkdata = Buffer.concat([changedBitsBuffer, seqBuffer.subarray(0, curOffset)]);
    const finalChunkdataGzipped = await deflateAsync(finalChunkdata);
    const newPath = pathlib.join(timeFolder, 'chunkdata');
    await fsp.writeFile(newPath, finalChunkdataGzipped);

    const metadata = {
        chunkSize: canvas.chunkSize,
        palette: canvas.palette,
        width: canvas.width,
        height: canvas.height,
        version: 2.2
    }
    const metaPath = pathlib.resolve(timeFolder, 'metadata');
    const metaStr = JSON.stringify(metadata);
    fs.writeFileSync(metaPath, metaStr);

    logger.debug(`${chunkManager.canvas.name} backup done in ${(Date.now() - timer)}ms`)
}

module.exports = {
    backup
}