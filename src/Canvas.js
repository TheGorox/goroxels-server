const ChunkManager = require('./ChunkManager');
const ChatChannel = require('./ChatChannel');

class Canvas{
    constructor(id, canvasOptions){
        this.id = id;

        Object.assign(this, canvasOptions);

        this.width = this.boardWidth; // todo wtf
        this.height = this.boardHeight;

        this.realWidth = this.width * this.chunkSize;
        this.realHeight = this.height * this.chunkSize;

        this.chunkManager = new ChunkManager(this);
        this.textChannel = new ChatChannel(this.id);
    }

    init(){
        this.chunkManager.saveAll();
    }
}

module.exports = Canvas