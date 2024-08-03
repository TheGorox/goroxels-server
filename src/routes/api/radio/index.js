const express = require('express');

const botGateway = require('./botGateway');

const radioServer = require('../../../music-radio/server');

const router = express.Router();

router.get('/stream', (req, res) => {
    res.setHeader('Content-Type', 'application/binary');
    res.setHeader('Transfer-Encoding', 'chunked');
    res.set({
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
    });

    res.socket.once('close', () => {
        radioServer.disconnectClient(res);
    })
    radioServer.connectClient(res);
});

router.get('/current-song', (req, res) => {
    res.set({
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
    });

    const info = radioServer.getCurrentSongInfo();
    if(!info){
        return res.json({
            success: false
        });
    }

    res.json({
        success: true,
        song: info
    });
});

router.get('/get-queue', (req, res) => {
    res.set({
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
    });

    const queues = radioServer.getQueues(10);

    res.json({
        success: true,
        queues: queues
    });
});

router.use('/gateway', botGateway);

module.exports = router;