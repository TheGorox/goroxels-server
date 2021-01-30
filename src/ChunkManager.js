const logger = require('./logger')('CHUNK_MANAGER', 'debug');

const fs = require('fs');
const path = require('path');

const Chunk = require('./Chunk');

const PNG = require('pngjs').PNG;

const chunkdataPath = path.resolve(__dirname, '../chunkdata');
const backupPath = path.resolve(__dirname, '../backup/');

class ChunkManager {
    constructor(canvas) {
        this.needToSave = false;

        this.canvas = canvas;

        this.boardWidth = this.canvas.width;
        this.boardHeight = this.canvas.height;

        this.chunkSize = this.canvas.chunkSize;

        this.dataPath = path.resolve(chunkdataPath, this.canvas.id.toString());

        this.chunks = {};

        setInterval(this.saveAll.bind(this), 60000);
    }

    loadAll() {
        for (let cx = 0; cx < this.boardWidth; cx++) {
            for (let cy = 0; cy < this.boardHeight; cy++) {
                const key = this.getChunkKey(cx, cy);
                this.chunks[key] =
                    this.loadChunk(cx, cy);
            }
        }
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

                // TODO move to async
                fs.unlinkSync(chunkPath);

                return this.loadChunk(x, y);
            }
        } else {
            chunkData = Chunk.createEmpty(this.canvas.chunkSize);
            this.needToSave = true;
        }

        return new Chunk(x, y, this.canvas.chunkSize, chunkData)
    }

    saveAll() {
        if (!this.needToSave) return;
        this.needToSave = false;

        logger.debug('Saving all chunks...');

        if (!fs.existsSync(path.resolve(this.dataPath))) {
            logger.info('Chunk folder doesn\'t exists, creating...');
            fs.mkdirSync(this.dataPath);
        }

        for (let key in this.chunks) {
            const chunk = this.chunks[key];

            const filekey = `${chunk.x},${chunk.y}.dat`;
            fs.writeFileSync(path.resolve(this.dataPath, filekey), Buffer.from(chunk.data))
        }

        // this.backup(); // БЛОКИРУЕТ ПРОЦЕСС
    }

    backup() {
        const canvasBackupPath = path.resolve(backupPath, this.canvas.id.toString());

        if (!fs.existsSync(backupPath)) fs.mkdirSync(backupPath);
        if (!fs.existsSync(canvasBackupPath)) fs.mkdirSync(canvasBackupPath);

        // backups should be separated by folders. ?

        // const date = new Date();
        const dateString = Date.now().toString();
        const finallyBackupPath = path.resolve(canvasBackupPath, dateString);

        fs.mkdirSync(finallyBackupPath);

        logger.debug('Backup path: ' + finallyBackupPath);

        for (let key in this.chunks) {
            const chunk = this.chunks[key];

            const filekey = `${chunk.x},${chunk.y}.png`;
            const fullPath = path.resolve(finallyBackupPath, filekey);

            const img = this.chunkToImage(chunk);
            img.pack().pipe(fs.createWriteStream(fullPath));
        }
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
        this.needToSave = true;

        const key = this.getChunkKey(x / this.chunkSize | 0, y / this.chunkSize | 0);
        this.chunks[key].set(x % this.chunkSize, y % this.chunkSize, c)
    }

    getChunkPixel(x, y){
        const key = this.getChunkKey(x / this.chunkSize | 0, y / this.chunkSize | 0);
        return this.chunks[key].get(x % this.chunkSize, y % this.chunkSize)
    }

    setPixelProtected(x, y, flag){
        this.needToSave = true;

        const key = this.getChunkKey(x / this.chunkSize | 0, y / this.chunkSize | 0);
        this.chunks[key].setProtection(x % this.chunkSize, y % this.chunkSize, flag);
    }

    isPixelProtected(x, y){
        const key = this.getChunkKey(x / this.chunkSize | 0, y / this.chunkSize | 0);
        const pixel = this.chunks[key].get(x % this.chunkSize, y % this.chunkSize)
        return pixel & 0x80 > 0
    }
}

module.exports = ChunkManager