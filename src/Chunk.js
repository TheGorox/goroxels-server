const pako = require('pako');

class Chunk{
    constructor(x, y, size, data){
        this.x = x;
        this.y = y;

        this.size = size;

        this.data = data;
        this._needUpdate = true;
        this._compressed = null;
    }

    get(x, y){
        return this.data[x + y * this.size]
    }

    set(x, y, c){
        this.data[x + y * this.size] = c;
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

Chunk.createEmpty = (size) => {
    return new Uint8Array(size * size).fill(0)
}

module.exports = Chunk