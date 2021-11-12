const express = require('express');
const config = require('../../../config');

const logger = require('../../../logger')('API', 'debug');
const adminLogger = require('../../../logger')('admin');

const router = express.Router();

const roleRequired = require('../../../utils/roleRequired');

function error(res, error) {
    res.json({
        errors: [error]
    })
}

router.use(roleRequired.admin);

router.post('/captchaState', async (req, res) => {
    const state = req.body.state;
    if(state === undefined || typeof state !== 'boolean') return error(res, 'Invalid state');

    adminLogger.info(`${req.user.name} ${state ? 'enabled' : 'disabled'} captcha`);

    config.captchaEnabled = state;

    res.json({
        success: true
    })
})

router.post('/afterJoinDelay', async (req, res) => {
    const delay = req.body.value;
    if(delay === undefined || typeof delay !== 'number') return res.error('Invalid state');
    if(delay < 0 || isNaN(delay)) return res.error('Invalid state');

    adminLogger.info(`${req.user.name} set afterJoinDelay to ${delay}`);

    config.afterJoinDelay = delay;

    res.json({
        success: true
    })
})

module.exports = router