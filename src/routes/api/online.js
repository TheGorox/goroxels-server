const express = require('express');
const WSS = require('../../WebsocketServer');

const router = express.Router();

// TODO rate limiter

router.get('/', async (req, res) => {
    const online = WSS.getInstance().onlineStats;
    res.json(online);
})

module.exports = router