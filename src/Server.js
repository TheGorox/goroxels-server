const logger = require('./logger')('SERVER', 'debug');
const exLogger = require('./logger')('express');
const log4js = require('log4js');

const express = require('express');
const compression = require('compression');
const http = require('http');
const https = require('https');

const { proxyCheck, expiresFromCache } = require('./utils/isProxy');

const verifyUser = require('./verifySocket');
const { api } = require('./routes/')

const Socket = require('./WebsocketServer');
const { getIPFromRequest, getIPv6Subnet, ipToInt } = require('./utils/ip');

const path = require('path');
const fs = require('fs');

const config = require('./config');
const { STRING_OPCODES } = require('./protocol');
const ms = require('ms');
const { DAY } = require('./constants');

const APIKEY = process.env.APISOCKET_KEY

function startServer(port) {
    ///// HTTP
    const app = express();
    app.disable('x-powered-by');

    let httpsOptions = {};
    let key, cert;
    let httpServer = http;
    try { // probably doesn't work, we use Cloudflare for ssl
        key = fs.readFileSync(process.env.SSL_KEY, 'utf-8');
        cert = fs.readFileSync(process.env.SSL_CERT, 'utf-8');
        httpsOptions.key = key;
        httpsOptions.cert = cert;

        httpServer = https;
        port = 443;

    } catch {
        logger.warn('Unable to load ssl key/cert')
    }

    const server = httpServer.createServer(httpsOptions, app);

    app.use(compression({
        level: 3
    }))

    app.use((req, res, next) => {
        req.realIp = getIPv6Subnet(getIPFromRequest(req));
        next();
    })

    app.use(log4js.connectLogger(exLogger, {
        format: (req, res, format) => {
            return format(`${req.user ? req.user.name.replace(/:/g, ';') : 'null'} at ${req.realIp} - :method :url len(:content-length)`)
        }
    }));

    app.use('/config.json', (req, res) => {
        res.header('Cache-Control', 'no-cache');
        res.json(config.public);
    })

    app.use('/robots.txt', (req, res) => {
        res.sendFile(path.join(__dirname, '../data/robots.txt'));
    })

    const changelogPath = path.join(__dirname, '../data/CHANGELOG');

    app.get('/changelog', (req, res) => {
        res.setHeader('Content-Type', 'text/plain');
        res.sendFile(changelogPath);
    })

    app.use('/api', api);

    const publicDir = path.join(__dirname, '/../public');

    app.get('/convert/:filename', (req, res) => {
        res.sendFile(req.params.filename, {
            root: publicDir,
            dotfiles: 'deny'
        }, (err) => {
            if (err) {
                res.status(err.statusCode || 404).send('Not found');
            }
        });
    });

    app.get('/convert', (req, res) => {
        res.sendFile('convert.html', { root: publicDir });
    });

    app.get('/admin/:filename', (req, res) => {
        res.sendFile(req.params.filename, {
            root: publicDir,
            dotfiles: 'deny'
        }, (err) => {
            if (err) {
                res.status(err.statusCode || 404).send('Not found');
            }
        });
    });

    app.get('/admin', (req, res) => {
        res.sendFile('admin.html', { root: publicDir });
    });

    app.get('/radio/:filename', (req, res) => {
        res.sendFile(req.params.filename, {
            root: publicDir,
            dotfiles: 'deny'
        }, (err) => {
            if (err) {
                res.status(err.statusCode || 404).send('Not found');
            }
        });
    });

    app.get('/radio', (req, res) => {
        res.sendFile('radio.html', { root: publicDir });
    });

    app.use(express.static(publicDir));
    app.use(/\/[\d\w]{0,32}/, express.static(publicDir));

    const webSocketServer = new Socket();

    logger.info('Listening http + websocket on port ' + port);
    server.listen(port);

    ///// WS
    webSocketServer.run(server);
    const wss = webSocketServer.wss;
    server.on('upgrade', async (request, socket, head) => {
        socket.realIp = getIPv6Subnet(getIPFromRequest(request));

        let user;

        if (request.headers.authorization) {
            if (request.headers.authorization !== `Bearer ${APIKEY}`)
                return logger.warn(`${socket.realIp} tried to connect apisocket`);

            user = {
                id: 0,
                role: 'ADMIN',
                isApiSocket: true
            }
        } else {
            if (!webSocketServer.verifyClient(request, socket)) {
                socket.write('HTTP/1.1 429 Too Many Requests\r\n\r\n');
                socket.destroy();
                return
            }
            user = await verifyUser(request);

            if (!user || user.role === 'USER') {
                // will defer socket closing if proxy isn't cached
                const isBanned = proxyCheck(socket.realIp, () => {
                    wss.clients.forEach(client => {
                        console.log(client.ip, socket.realIp);
                        if (client.ip === socket.realIp) {
                            client.close();
                        }
                    })
                });

                if (isBanned) {
                    const until = expiresFromCache(socket.realIp);
                    wss.handleUpgrade(request, socket, head, function done(ws) {
                        const errMsg = {
                            msg: 'bannedUntil',
                            data: ms(Math.max(until-Date.now(), 0))
                        }
                        ws.send(JSON.stringify({c: STRING_OPCODES.error, errors: [errMsg]}))
                        ws.close();
                    });
                    return
                }
            }

            logger.debug('Going to upgrade ip ' + socket.realIp + ' with user ' + (user ? user.name : null));
        }


        wss.handleUpgrade(request, socket, head, function done(ws) {
            wss.emit('connection', ws, request, user);
        });
    });
}

module.exports = {
    startServer
}