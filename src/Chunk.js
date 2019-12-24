const pako = require('pako');

const {
    chunkSize
} = require('./config');

class Chunk{
    constructor(x, y, data){
        this.x = x;
        this.y = y;

        this.data = data;
        this._needUpdate = true;
        this._compressed = null;
    }

    get(x, y){
        return this.data[x + y * chunkSize]
    }

    set(x, y, c){
        this.data[x + y * chunkSize] = c;
        this._needUpdate = true;
    }

    compress(){
        if(this._needUpdate){
            this._needUpdate = false;

            this._compressed = pako.deflate(this.data);
        }

        return this._compressed
    }
}

Chunk.fromBuffer = buffer => {
    return new Uint8Array(buffer);
}

Chunk.createEmpty = () => {
    return new Uint8Array(chunkSize * chunkSize).fill(0)
}

module.exports = Chunk