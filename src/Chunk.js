const zlib = require('zlib');
const ChunkPlaceInfo = require('./ChunkPlaceInfo');
const { sha256 } = require('./utils/crypto');
const logger = require('./logger')('CHUNK');

_anus = []

class Chunk{
    constructor(x, y, size, data, canvasId){
        this.x = x;
        this.y = y;

        this.size = size;

        this.data = data;
        
        // for compression
        this.__needUpdate = true;
        
        this.compressed = null;
        this.compressedHash = null;
        
        // for saves (to file)
        this.__needToSave = false;
        // for backups
        this.__needBackup = false;
        
        // to update everything
        this._updLatch = false;

        this.placeInfo = new ChunkPlaceInfo(canvasId, this);
    }
    
    resetUpdLatch(){
        this._updLatch = false;
    }
    
    // this looks so ugly! :D
    get _needToSave(){ return this.__needToSave }
    set _needToSave(value){
        this.__needToSave = value;
        if(!value) this.resetUpdLatch();
    }
    get _needBackup(){ return this.__needBackup }
    set _needBackup(value){
        this.__needBackup = value;
        if(!value) this.resetUpdLatch();
    }
    get _needUpdate(){ return this.__needUpdate }
    set _needUpdate(value){
        this.__needUpdate = value;
        if(!value) this.resetUpdLatch();
    }

    upd(){
        if(!this._updLatch){
            this._needUpdate = true;
            this._needToSave = true;
            this._needBackup = true;
            this._updLatch = true;
        }
    }

    get(x, y){
        return this.data[x + y * this.size]
    }

    set(x, y, c){
        const i = x + y * this.size;

        this.data[i] = (this.data[i] & 0x80) + c;
        this.upd();
    }

    // the same as above, but with protection overwrite
    setP(x, y, c){
        const i = x + y * this.size;

        this.data[i] = c;
        this.upd();
    }

    setBuffer(buffer){
        for(let i = 0; i < this.data.length; i++){
            // protection is overwritten!
            this.data[i] = buffer[i];
        }
        this.upd();
    }

    setProtection(x, y, state){
        const i = x + y * this.size
        const col = this.data[i];

        this.data[i] = (state << 7) | (col & 0x7F);
        this.upd();
    }

    async compress(){
        if(this._needUpdate){
            this._needUpdate = false;

            return new Promise((res, rej) => {
                zlib.deflate(this.data, (err, result) => {
                    if(err) return rej(err);

                    const chunkhash = sha256(result, 8);
                    this.compressedHash = chunkhash;

                    res(this.compressed=result);
                });
            })
        }

        return this.compressed
    }

    wipe(){
        this.data = Chunk.createEmpty(this.size);
        this.placeInfo.initEmpty();
        this.upd();
    }

    clone(){
        return new Chunk(this.x, this.y, this.size, new Uint8Array(this.data));
    }
    
    getChunkKey(){
        return this.x << 16 | this.y
    }
}

Chunk.fromBuffer = buffer => {
    return new Uint8Array(buffer);
}

Chunk.createEmpty = (size) => {
    return new Uint8Array(size * size).fill(0)
}

module.exports = Chunk