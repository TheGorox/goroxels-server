const logger = require('./logger')('SERVER');

const express = require('express');
const https = require('http');
const path = require('path');

const verifyUser = require('./verifySocket');
const {
    api
} = require('./routes/')

const Socket = require('./WebsocketServer');
const { fileURLToPath } = require('url');

function startServer(port, canvases) {
    const app = express();
    app.disable('x-powered-by');

    const server = https.createServer(app);

    app.use('/api', api);

    // kostyl↓
    app.use('/', express.static(__dirname + '/../public'));
    // TODO handle world names?
    app.use([/\/[\d\w]{0,32}/, '/'], express.static(__dirname + '/../public'));

    const webSocketServer = new Socket(canvases);

    logger.info('Listening http + websocket on port ' + port);
    server.listen(port);
    webSocketServer.run(server);

    const wss = webSocketServer.wss;

    server.on('upgrade', async (request, socket, head) => {
        const user = await verifyUser(request);
        logger.debug('Going to upgrade ip ' + socket.remoteAddress + ' with user ' + (user ? user.name : null));

        wss.handleUpgrade(request, socket, head, function done(ws) {
            wss.emit('connection', ws, request, user);
        });
    });
}

// const compression = require('compression');

// app.use(compression());

module.exports = {
    startServer
}