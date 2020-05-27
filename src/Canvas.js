const ChunkManager = require('./ChunkManager');


class Canvas{
    constructor(id, canvasOptions){
        this.id = id;

        Object.assign(this, canvasOptions); // copying args like "this.prop = prop"

        this.width = this.boardWidth;
        this.height = this.boardHeight;

        this.realWidth = this.width * this.chunkSize;
        this.realHeight = this.height * this.chunkSize;

        this.chunkManager = new ChunkManager(this);
    }

    init(){
        this.chunkManager.saveAll();
    }
}

module.exports = Canvas