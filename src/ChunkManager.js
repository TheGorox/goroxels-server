const logger = require('log4js').getLogger('CHUNK_MANAGER');
logger.level = 'debug';

const fs = require('fs');
const path = require('path');

const Chunk = require('./Chunk');


const chunkdataPath = path.resolve(__dirname, '../chunkdata');

class ChunkManager{
    constructor(canvas){
        this.needToSave = false;

        this.canvas = canvas;

        this.boardWidth = this.canvas.width;
        this.boardHeight = this.canvas.height;

        this.chunkSize = this.canvas.chunkSize;

        this.dataPath = path.resolve(chunkdataPath, this.canvas.id.toString());

        this.chunks = new Object();
        // Map would be faster in often insert/deletion case, but not in gets

        setInterval(this.saveAll.bind(this), 60000);
    }

    loadAll(){
        for(let cx = 0; cx < this.boardWidth; cx++){
            for(let cy = 0; cy < this.boardHeight; cy++){
                const key = this.getChunkKey(cx, cy);
                this.chunks[key] = 
                    this.loadChunk(cx, cy);
            }
        }
    }

    getChunkKey(x, y){
        return x << 4 | y
    }

    loadChunk(x, y){
        const key = `${x},${y}.dat`;
        const chunkPath = path.resolve(this.dataPath, key);

        let chunkData;
        if(fs.existsSync(chunkPath)){
            chunkData = Chunk.fromBuffer(fs.readFileSync(chunkPath).buffer);
            if(chunkData.length != this.chunkSize * this.chunkSize){
                logger.warn(`Wrong chunk size. Removing this (${x}, ${y}) chunk`);

                // TODO move to async
                fs.unlinkSync(chunkPath);

                return this.loadChunk(x, y);
            }
        }else{
            chunkData = Chunk.createEmpty(this.canvas.chunkSize);
            this.needToSave = true;
        }

        return new Chunk(x, y, this.canvas.chunkSize, chunkData)
    }

    saveAll(){
        if(!this.needToSave) return;
        this.needToSave = false;

        logger.debug('Saving all chunks...');

        if(!fs.existsSync(path.resolve(this.dataPath))){
            logger.info('Chunk folder doesn\'t exists, creating...');
            fs.mkdirSync(this.dataPath);
        }
        for(let key in this.chunks){
            const chunk = this.chunks[key];

            const filekey = `${chunk.x},${chunk.y}.dat`;
            fs.writeFileSync(path.resolve(this.dataPath, filekey), Buffer.from(chunk.data))
        }
    }

    getChunkData(cx, cy){
        let chunkKey = this.getChunkKey(cx, cy);

        if(this.chunks.hasOwnProperty(chunkKey)){
            return this.chunks[chunkKey].compress()
        }else{
            let newChunk = this.loadChunk(cx, cy);
            this.chunks[chunkKey] = newChunk;
            
            return newChunk.compress();
        }
    }

    setChunkPixel(x, y, c){
        this.needToSave = true;

        let key = this.getChunkKey(x / this.chunkSize | 0, y / this.chunkSize | 0);
        this.chunks[key].set(x % this.chunkSize, y % this.chunkSize, c)
    }
}

module.exports = ChunkManager