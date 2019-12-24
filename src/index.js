const Server = require('./Server.js');
const ChunkManager = require('./ChunkManager');

//const conf
let chunks = new ChunkManager();
chunks.loadAll();

const server = new Server(chunks);
server.run()