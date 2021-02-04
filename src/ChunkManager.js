const logger = require('./logger')('CHUNK_MANAGER', 'debug');

const fs = require('fs');
const path = require('path');
const EventEmitter = require('events')
const util = require('util');
const pako = require('pako');

const Chunk = require('./Chunk');

const PNG = require('pngjs').PNG;

const { getFancyDate, getFancyTime, randint } = require('./utils');

util.promisify(fs.writeFile)

const chunkdataPath = path.resolve(__dirname, '../chunkdata');
const backupPath = path.resolve(__dirname, '../backup/');

class ChunkManager extends EventEmitter {
    constructor(canvas) {
        super();

        this.needToBackup = false;

        this.canvas = canvas;

        this.boardWidth = this.canvas.width;
        this.boardHeight = this.canvas.height;

        this.chunkSize = this.canvas.chunkSize;

        this.dataPath = path.resolve(chunkdataPath, this.canvas.id.toString());

        this.chunks = {};
        this.loaded = false;

        // imagine 10 instances of this, and all saving in one time..
        setTimeout(() => {
            setInterval(this.saveAll.bind(this), 60000);
            setInterval(this.backup.bind(this), (60000 * 2) + 1000);
        }, randint(0, 60000));

        this.loadAll();
        this.backup();
    }

    loadAll() {
        for (let cx = 0; cx < this.boardWidth; cx++) {
            for (let cy = 0; cy < this.boardHeight; cy++) {
                const key = this.getChunkKey(cx, cy);
                if (!this.chunks[key])
                    this.chunks[key] = this.loadChunk(cx, cy);
            }
        }

        this.loaded = true;
        this.emit('loaded');
    }

    getChunkKey(x, y) {
        return x << 4 | y
    }

    loadChunk(x, y) {
        const key = `${x},${y}.dat`;
        const chunkPath = path.resolve(this.dataPath, key);

        let chunkData;
        if (fs.existsSync(chunkPath)) {
            chunkData = Chunk.fromBuffer(fs.readFileSync(chunkPath).buffer);
            if (chunkData.length != this.chunkSize * this.chunkSize) {
                logger.warn(`Wrong chunk size. Removing (${x}, ${y}) chunk`);

                fs.unlinkSync(chunkPath);

                return this.loadChunk(x, y);
            }
        } else {
            chunkData = Chunk.createEmpty(this.canvas.chunkSize);
            this.needToBackup = true;
        }

        return new Chunk(x, y, this.canvas.chunkSize, chunkData)
    }

    saveAll() {
        if (!fs.existsSync(path.resolve(this.dataPath))) {
            logger.info('Chunk folder doesn\'t exists, creating...');
            fs.mkdirSync(this.dataPath);
        }

        let saved = 0;
        for (let key in this.chunks) {
            const chunk = this.chunks[key];
            
            if(!chunk._needToSave) continue;

            const filekey = `${chunk.x},${chunk.y}.dat`;
            fs.writeFileSync(path.resolve(this.dataPath, filekey), Buffer.from(chunk.data));
            saved += 1

            chunk._needToSave = false;
        }

        saved > 0 && logger.debug('Saved ' + saved + ' chunks');
    }

    backup() {
        if(!this.needToBackup) return;
        this.needToBackup = false;

        const timer = Date.now();

        const canvasBackupPath = path.resolve(backupPath, this.canvas.id.toString());

        if (!fs.existsSync(backupPath)) fs.mkdirSync(backupPath);
        if (!fs.existsSync(canvasBackupPath)) fs.mkdirSync(canvasBackupPath);

        const date = getFancyDate(),
            time = getFancyTime().replace(/:/g, '-');

        const dayFolder = path.resolve(canvasBackupPath, date);
        if (!fs.existsSync(dayFolder)) fs.mkdirSync(dayFolder);

        const timeFolder = path.resolve(dayFolder, time);
        fs.mkdirSync(timeFolder);

        const canvas = this.canvas;
        const metadata = {
            chunkSize: canvas.chunkSize,
            palette: canvas.palette,
            width: canvas.boardWidth,
            height: canvas.boardHeight
        }

        const metaPath = path.resolve(timeFolder, 'metadata');
        const metaStr = JSON.stringify(metadata);
        fs.writeFileSync(metaPath, metaStr);

        for (let key in this.chunks) {
            const chunk = this.chunks[key];

            const filekey = `${chunk.x},${chunk.y}.dat`;
            const fullPath = path.resolve(timeFolder, filekey);

            const data = pako.deflate(chunk.data)

            fs.writeFileSync(fullPath, data)
        }

        logger.debug('backup done in ' + (Date.now() - timer) + 'ms')
    }

    chunkToImage(chunk) {
        const image = new PNG({
            width: this.chunkSize,
            height: this.chunkSize
        });

        chunk.data.forEach((c, i) => {
            const rgb = this.canvas.palette[c];

            image[i <<= 2] = rgb[0];
            image[i + 1] = rgb[1];
            image[i + 2] = rgb[2];
            image[i + 3] = 255;
        });

        return image
    }

    getChunkData(cx, cy) {
        const chunkKey = this.getChunkKey(cx, cy);

        if (this.chunks.hasOwnProperty(chunkKey)) {
            return this.chunks[chunkKey].compress()
        } else {
            let newChunk = this.loadChunk(cx, cy);
            this.chunks[chunkKey] = newChunk;

            return newChunk.compress();
        }
    }

    setChunkPixel(x, y, c) {
        this.needToBackup = true;

        const key = this.getChunkKey(x / this.chunkSize | 0, y / this.chunkSize | 0);
        this.chunks[key].set(x % this.chunkSize, y % this.chunkSize, c)
    }

    getChunkPixel(x, y) {
        const key = this.getChunkKey(x / this.chunkSize | 0, y / this.chunkSize | 0);
        return this.chunks[key].get(x % this.chunkSize, y % this.chunkSize)
    }

    setPixelProtected(x, y, flag) {
        this.needToBackup = true;

        const key = this.getChunkKey(x / this.chunkSize | 0, y / this.chunkSize | 0);
        this.chunks[key].setProtection(x % this.chunkSize, y % this.chunkSize, flag);
    }

    isPixelProtected(x, y) {
        const key = this.getChunkKey(x / this.chunkSize | 0, y / this.chunkSize | 0);
        const pixel = this.chunks[key].get(x % this.chunkSize, y % this.chunkSize)
        return pixel & 0x80 > 0
    }
}

module.exports = ChunkManager