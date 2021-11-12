// router for mod ip bans
// in difference to /ip/Blaclist
// this has rate limit and only one ip per time
// also addedBy appended to database entry

const express = require('express');

const logger = require('../../../logger')('API', 'debug');
const adminLogger = require('../../../logger')('admin');

const Blacklist = require('../../../db/models/Blacklist');
const { getIPv6Subnet } = require('../../../utils/ip');
const { setCache, clearCache } = require('../../../utils/isProxy');
const { rateLimiter } = require('../../../utils/express');

const router = express.Router();

const roleRequired = require('../../../utils/roleRequired');
const { MINUTE } = require('../../../constants');
const Server = require('../../../WebsocketServer');

const limiter = rateLimiter.byUserId({
    time: MINUTE*10,
    max: 10
});

router.use(roleRequired.mod);
router.use(limiter);

router.get('/', async (req, res) => {
    let ip = req.query.ip;

    if (!ip) return res.error('IP should be provided!');

    if(!ip || ip == null) return res.error('Seems there\'s no ip for this user');
    if(ip === req.realIp) return res.error('Are you mad?');

    await Blacklist.findOrCreate({
        where: {
            ip,
            addedBy: req.user.id
        }
    })
    setCache(ip, true);

    // close all instances from this ip
    const server = Server.getInstance();
    server.closeByIp(ip);

    adminLogger.info(`${req.user.name} blacklisted IP ${ip} from mod menu`)

    res.json({ success: true })
})

module.exports = router