require('./dotenv');

const Server = require('./Server');
const Canvas = require('./Canvas');
const config = require('./config');
// the module below will also configure loggers
const logger = require('./logger')('MAIN', 'info');
const db = require('./db');
const radioServer = require('./music-radio/server');

// backup boards when process exits with error or without
require('./exitHandler');
// treat stdin lines as server commands
require('./commandHandler');

const canvases = [];
config.public.canvases.forEach((canvas, i) => {
    canvases.push(new Canvas(
        i,
        canvas
    ))
})
global.canvases = canvases;

db.sync().then(() => {
    Server.startServer(config.port);

    radioServer.init().then(started => {
        if(!started)
            logger.warn('Cannot start radio server (maybe requirements not match)');
    })
}).catch(err => {
    logger.fatal('Can\'t start server: ');
    logger.error(err)
    process.exit()
})

