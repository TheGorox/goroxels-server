try { // optional
    // this code is used for overriding
    // ecosystem variables
    // (and system too, so be very careful)
    const fs = require('fs')
    const dotenv = require('dotenv')
    const envConfig = dotenv.parse(fs.readFileSync('.env'))
    for (var k in envConfig) {
        process.env[k] = envConfig[k]
    }
} catch {}

const Server = require('./Server');
const Canvas = require('./Canvas');
const config = require('./config');
// the module below will also configure loggers
const logger = require('./logger')('MAIN', 'info');
const db = require('./db');

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
}).catch(err => {
    logger.fatal('Can\'t start server: ');
    logger.error(err)
    process.exit()
})

