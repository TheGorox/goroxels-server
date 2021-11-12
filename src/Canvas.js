const ChunkManager = require('./ChunkManager');

class Canvas{
    constructor(id, canvasOptions){
        this.id = id;

        Object.assign(this, canvasOptions);

        this.width = this.boardWidth;
        this.height = this.boardHeight;

        this.realWidth = this.width * this.chunkSize;
        this.realHeight = this.height * this.chunkSize;

        this.chunkManager = new ChunkManager(this);
    }

    updateSize(w, h){
        this.width = w;
        this.realWidth = this.width * this.chunkSize;

        this.height = h;
        this.realHeight = this.height * this.chunkSize;
    }

    init(){
        this.chunkManager.saveAll();
    }
}

module.exports = Canvas