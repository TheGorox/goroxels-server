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
const { query, validationResult } = require('express-validator');
const { User } = require('../../../db/models/User');

const limiter = rateLimiter.byUserId({
    time: MINUTE * 10,
    max: 10
});

router.use(roleRequired.mod);
router.use(limiter);

router.get('/byIp',
    query('ip').isIP(),
    query('until').optional().isISO8601().toDate(),
    async (req, res) => {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return res.json({ errors: result.array() });
        }

        let ip = req.query.ip;
        // if (ip === req.realIp) return res.error('Are you mad?');

        req.query.until ??= null;

        const [entry] = await Blacklist.findOrCreate({
            where: { ip }
        });

        entry.addedBy = req.user.id;
        entry.until = req.query.until;
        await entry.save();


        setCache(ip, true, req.query.until);

        // close all instances from this ip
        const server = Server.getInstance();
        server.closeByIp(ip);

        adminLogger.info(`${req.user.name} blacklisted IP ${ip} from mod menu` + (req.query.until ? `until=${req.query.until}` : ''));

        res.json({ success: true })
    });

router.get('/',
    query('uid').isInt({ min: 1 }).toInt(),
    query('banned').isBoolean().toBoolean(),
    query('until').optional().isISO8601().toDate(),
    async (req, res) => {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return res.json({ errors: result.array() });
        }

        const targetUserId = req.query.uid;

        if (req.user.id !== 1 && targetUserId === req.user.id) {
            return error(res, 'you can\'t (un)ban yourself')
        }

        const user = await User.findOne({
            where: {
                id: targetUserId
            }
        });
        if (!user) return error(res, 'no such user');

        if (user.role === 'ADMIN' && req.user.id !== 1)
            return error(res, 'you can\'t ban admins');

        if (req.query.banned === false && user.role !== 'BANNED') {
            return;
        }

        user.role = req.query.banned ? 'BANNED' : 'USER';
        if (req.query.until && req.query.banned) {
            user.bannedUntil = req.query.until;
        } else if (!req.query.banned) {
            user.bannedUntil = null;
        }

        user.save().then(() => {
            res.json({
                errors: []
            });

            adminLogger.info(`${req.user.name} ${req.query.banned ? '' : 'un'}banned ${targetUserId} until ${req.query.until}`);
            Server.getInstance().closeByUser(user);
            // TODO add RELOAD or UPDATE_ME message
        }).catch(e => {
            logger.error(e);
            res.error('unkown database error')
        })
    });

router.get('/shadow',
    query('uid').isInt({ min: 1 }).toInt(),
    query('banned').isBoolean().toBoolean(),
    query('until').optional().isISO8601().toDate(),
    async (req, res) => {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return res.json({ errors: result.array() });
        }

        const user = await User.findOne({
            where: {
                id: req.query.uid
            }
        });
        if (!user) return res.error('no such user');

        user.shadowBanned = req.query.banned;
        if (req.query.until && req.query.banned) {
            user.bannedUntil = req.query.until;
        } else if (!req.query.banned) {
            user.bannedUntil = null;
        }
        // to update cached user objects
        Server.getInstance().closeByUser(user);

        try {
            await user.save();
            adminLogger.info(`${req.user.name} shadowbanned ${user.name} (id${user.id})`);

            res.json({
                success: true,
                errors: []
            });
        } catch (error) {
            logger.error(error);

            res.json({
                success: false,
                errors: [error]
            });
        }
    })

module.exports = router