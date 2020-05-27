require('dotenv').config();

const Server = require('./Server');
const Canvas = require('./Canvas');

const config = require('./config');

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

Server.startServer(config.port, canvases)