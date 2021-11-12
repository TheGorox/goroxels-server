const logger = require('./logger')('CHUNK_MANAGER', 'debug');

const fs = require('fs');
const path = require('path');
const EventEmitter = require('events')
const util = require('util');
// const pako = require('pako');
const zlib = require('zlib');

const Chunk = require('./Chunk');

const PNG = require('pngjs').PNG;

const { getFancyDate, getFancyTime, randint, savePublicConfig } = require('./utils');
const config = require('./config');
const { MINUTE, SECOND } = require('./constants');

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
            setInterval(this.saveAll.bind(this), MINUTE * 2);
            setInterval(this.backup.bind(this), MINUTE * 5);
        }, randint(0, 60000));

        this.loadAll();
        this.backup();
    }

    async enlargeBy(top, right, bottom, left) {
        const newHeight = top + bottom + this.boardHeight;
        const newWidth = right + left + this.boardWidth;
        if (newHeight >= 255)
            throw new Error('Height limit');
        if (newWidth >= 255)
            throw new Error('Width limit');


        // save memory chunk data to files, due to be reloaded soon
        await this.saveAll();

        if (top || left) {
            // "move" existing chunks
            for (let x = this.boardWidth-1; x >= 0; x--) {
                for (let y = this.boardHeight-1; y >= 0; y--) {
                    this._renameChunk(x, y, x + left, y + top)
                }
            }
        }

        // update config & ChunkManager(this) & Canvas
        const canvasConf = config.public.canvases[this.canvas.id];
        this.canvas.updateSize(newWidth, newHeight);
        this.boardWidth = canvasConf.boardWidth = newWidth;
        this.boardHeight = canvasConf.boardHeight = newHeight;
        savePublicConfig();

        // other chunks will be automatically created by loadChunk()
        this.chunks = {};
        this.loadAll();
    }

    // currently used only for enlargeBy
    _renameChunk(x, y, x1, y1) {
        const key = `${x},${y}.dat`;
        const newKey = `${x1},${y1}.dat`;
        const chunkPath = path.resolve(this.dataPath, key);
        const newChunkPath = path.resolve(this.dataPath, newKey);

        if (fs.existsSync(chunkPath)) {
            fs.renameSync(chunkPath, newChunkPath);
        }
    }

    wipeAll() {
        for (let chunkKey of Object.keys(this.chunks)) {
            const chunk = this.chunks[chunkKey];
            chunk.wipe();
        }
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

    async saveAll() {
        let timer = Date.now();

        if (!fs.existsSync(path.resolve(this.dataPath))) {
            logger.info('Chunk folder doesn\'t exists, creating...');
            fs.mkdirSync(this.dataPath);
        }

        let saved = 0;
        for (let key in this.chunks) {
            const chunk = this.chunks[key];

            if (!chunk._needToSave) continue;

            const filekey = `${chunk.x},${chunk.y}.dat`;
            await fs.promises.writeFile(path.resolve(this.dataPath, filekey), Buffer.from(chunk.data));
            saved += 1

            chunk._needToSave = false;
        }

        saved > 0 && logger.debug(`Saved ${saved} chunks in ${Date.now() - timer}ms`);
    }

    async backup() {
        if (!this.needToBackup) return;
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

        logger.debug(`Check time+meta ${Date.now() - timer}ms`)

        for (let key in this.chunks) {
            const chunk = this.chunks[key];

            const filekey = `${chunk.x},${chunk.y}.dat`;
            const fullPath = path.resolve(timeFolder, filekey);

            // FIXME: use chunk compress method
            // FIXME: make async
            const data = zlib.deflateSync(chunk.data)

            await fs.promises.writeFile(fullPath, data)
        }

        logger.debug('backup done in ' + (Date.now() - timer) + 'ms')
    }

    chunkToImage(chunk) { // for debugging only
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

    async getChunkData(cx, cy) {
        const chunkKey = this.getChunkKey(cx, cy);

        if (this.chunks.hasOwnProperty(chunkKey)) {
            return await this.chunks[chunkKey].compress()
        } else {
            let newChunk = this.loadChunk(cx, cy);
            this.chunks[chunkKey] = newChunk;

            return await newChunk.compress();
        }
    }

    setChunkData(cx, cy, buffer) {
        const chunk = this.chunks[this.getChunkKey(cx, cy)];
        if (chunk.data.byteLength !== buffer.byteLength)
            throw new Error('New buffer does not match chunk size');

        chunk.setBuffer(buffer);
    }

    cordToChunk(x, y) {
        return [x / this.chunkSize | 0, y / this.chunkSize | 0]
    }

    setChunkPixel(x, y, c) {
        this.needToBackup = true;

        // FIXME: check is .apply() works faster 
        const key = this.getChunkKey(...this.cordToChunk(x, y));
        this.chunks[key].set(x % this.chunkSize, y % this.chunkSize, c)
    }

    getChunkPixel(x, y) {
        const key = this.getChunkKey(...this.cordToChunk(x, y));
        return this.chunks[key].get(x % this.chunkSize, y % this.chunkSize)
    }

    setPixelProtected(x, y, flag) {
        this.needToBackup = true;

        const key = this.getChunkKey(...this.cordToChunk(x, y));
        this.chunks[key].setProtection(x % this.chunkSize, y % this.chunkSize, flag);
    }

    isPixelProtected(x, y) {
        const key = this.getChunkKey(...this.cordToChunk(x, y));
        const pixel = this.chunks[key].get(x % this.chunkSize, y % this.chunkSize)
        return pixel & 0x80 > 0
    }
}

module.exports = ChunkManager