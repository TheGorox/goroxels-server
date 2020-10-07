const ChunkManager = require('./ChunkManager');
const ChatChannel = require('./ChatChannel');

class Canvas{
    constructor(id, canvasOptions){
        this.id = id;

        Object.assign(this, canvasOptions); // copying args like "this.prop = prop"

        this.width = this.boardWidth; // todo wtf
        this.height = this.boardHeight;

        this.realWidth = this.width * this.chunkSize;
        this.realHeight = this.height * this.chunkSize;

        this.chunkManager = new ChunkManager(this);
        this.textChannel = new ChatChannel(this.id);

        this.textChannel.addMessage('', `Welcome to the goroxels, server ${canvasOptions.name}!`, true)
        this.textChannel.addMessage('', `Use <a href="/api/auth/discord">/api/auth/discord</a> to log in!`, true)
    }

    init(){
        this.chunkManager.saveAll();
    }
}

module.exports = Canvas