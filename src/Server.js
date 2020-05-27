const logger = require('log4js').getLogger('SERVER');
logger.level = 'info';

const express = require('express');
const https = require('http');

const Socket = require('./WebsocketServer');

function startServer(port, canvases){
    const app = express();
    const server = https.createServer(app);

    // TODO handle world names?
    app.use(/\/[\d\w]{0,32}/, express.static(__dirname + '/../public'));
    // kostyl↓
    app.use('/', express.static(__dirname + '/../public'));

    const webSocketServer = new Socket(canvases);

    logger.info('Listening http + websocket on port ' + port);
    server.listen(port);
    webSocketServer.run(server);
}

// const compression = require('compression');

// app.use(compression());

module.exports = {
    startServer
}