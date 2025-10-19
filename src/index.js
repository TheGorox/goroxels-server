require('./dotenv');

const config = require('./config');
const { MINUTE } = require('./constants');
const db = require('./db');
const server = require('./Server');
const Canvas = require('./Canvas');
const radioServer = require('./music-radio/server');

// the module below will also configure loggers
const logger = require('./logger')('MAIN', 'info');

const unbanJob = require('./jobs/unban');

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
    server.startServer(config.port);

    radioServer.init().then(started => {
        if(!started)
            logger.warn('Cannot start radio server (maybe requirements not match)');
    });

    setInterval(unbanJob, 60000);
}).catch(err => {
    logger.fatal('Can\'t start server: ');
    logger.error(err)
    process.exit()
})

