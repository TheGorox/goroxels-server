try { // optional
    require('dotenv').config();
} catch {}

const Server = require('./Server');
const Canvas = require('./Canvas');

const config = require('./config');

const logger = require('./logger')('MAIN', 'info');

const {
    DB_HOST,
    DB_PORT,
    DB_USER,
    DB_PASS
} = process.env;

const db = require('./db');
// db.init(DB_HOST, DB_PORT, DB_USER, DB_PASS);

const canvases = [];
config.canvases.forEach((canvas, i) => {
    canvases.push(new Canvas(
        i,
        canvas
    ))
})

db.sync().then(() => {
    Server.startServer(config.port, canvases);
}).catch(err => {
    logger.fatal('Can\'t sync database: ' + err);
    process.exit()
})