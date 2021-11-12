const zlib = require('zlib');
const logger = require('./logger')('CHUNK');

_anus = []

class Chunk{
    constructor(x, y, size, data){
        this.x = x;
        this.y = y;

        this.size = size;

        this.data = data;
        this._needUpdate = true;
        this._compressed = null;

        this._needToSave = false;

    }

    upd(){
        this._needUpdate = true;
        this._needToSave = true;
    }

    get(x, y){
        return this.data[x + y * this.size]
    }

    set(x, y, c){
        const i = x + y * this.size;

        this.data[i] = (this.data[i] & 0x80) + c;
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

                    res(this._compressed=result);
                });
            })
        }

        return this._compressed
    }

    wipe(){
        this.data = Chunk.createEmpty(this.size);
        this.upd();
    }
}

Chunk.fromBuffer = buffer => {
    return new Uint8Array(buffer);
}

Chunk.createEmpty = (size) => {
    return new Uint8Array(size * size).fill(0)
}

module.exports = Chunk