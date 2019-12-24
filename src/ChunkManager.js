const fs = require('fs');
const path = require('path');

const Chunk = require('./Chunk');
const {
    boardWidth,
    boardHeight,
    chunkSize
} = require('./config');


const chunkdataPath = path.resolve(__dirname, '../chunkdata');

class ChunkManager{
    constructor(){
        this.chunks = new Object();
        // Map would be faster in often insert/deletion case, but not in get

        setInterval(this.saveAll.bind(this), 60000*5);
    }

    loadAll(){
        for(let cx = 0; cx < boardWidth; cx++){
            for(let cy = 0; cy < boardHeight; cy++){
                const key = this.getChunkKey(cx, cy);
                this.chunks[key] = 
                    this.loadChunk(cx, cy);
            }
        }

        this.saveAll();
        // TODO: remove this..?
    }

    getChunkKey(x, y){
        return x << 4 | y
    }

    loadChunk(x, y){
        const key = `${x},${y}.dat`;
        const chunkPath = path.resolve(chunkdataPath, key);

        let chunkData;
        if(fs.existsSync(chunkPath)){
            chunkData = Chunk.fromBuffer(fs.readFileSync(chunkPath).buffer);
        }else{
            chunkData = Chunk.createEmpty();
        }

        return new Chunk(x, y, chunkData)
    }

    saveAll(){
        for(let key in this.chunks){
            const chunk = this.chunks[key];

            const filekey = `${chunk.x},${chunk.y}.dat`;
            fs.writeFileSync(path.resolve(chunkdataPath, filekey), Buffer.from(chunk.data))
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
        let key = this.getChunkKey(x / chunkSize | 0, y / chunkSize | 0);
        this.chunks[key].set(x % chunkSize, y % chunkSize, c)
    }
}

module.exports = ChunkManager