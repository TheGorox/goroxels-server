const express = require('express');
const { getCaptcha, 
        solveAttempt, 
        needCaptcha } = require('../../captcha');
const { rateLimiter } = require('../../utils/express');
const { SECOND } = require('../../constants');

const router = express.Router();

// 1 per second
const limiter = rateLimiter.byIp({
    time: 10*SECOND,
    max: 10,
    headers: false
})

router.use(limiter);

router.get('/get', async (req, res) => {
    const svg = getCaptcha(req);
    res.send(svg);
});

router.post('/solve', async (req, res) => {
    const success = solveAttempt(req);
    res.json({ success });
});

module.exports = router