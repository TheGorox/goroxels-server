const express = require('express');
const { User, Badge } = require('../../db/models/User');
const roleRequired = require('../../utils/roleRequired');
const WSS = require('../../WebsocketServer');
const { checkRole } = require('../../utils/role');
const { ROLE, MINUTE } = require('../../constants');
const { rateLimiter } = require('../../utils/express');

const router = express.Router();

function error(res, error) {
    res.json({ errors: [error] })
}

const limiter = rateLimiter.byIdOrIp({
    time: 5 * MINUTE,
    max: 60*5
});

router.use(limiter);

router.get('/badges', async (req, res) => {
    if (req.query.id === undefined)
        return error(res, 'Player id is not specified');

    const id = parseInt(req.query.id, 10);
    if (isNaN(id) || id < 0 || id === Infinity) {
        return error(res, 'Invalid id');
    }

    const badges = await Badge.findAll({
        include: {
            association: 'users',
            where: { id: req.query.id },
            attributes: [],
            through: {
                attributes: []
            }
        }
    });

    const badgesFormatted = badges.map(b => b.toJSON());

    // PUBLIC cache for 5min
    res.set({
        'Cache-Control': 'public, max-age=300, s-maxage=300'
    });
    res.json(badgesFormatted);
})

// role required only to get full info
router.use(roleRequired.user);

router.get('/', async (req, res) => {
    if (req.query.id === undefined)
        return error(res, 'Player id is not specified');

    const id = parseInt(req.query.id, 10);
    if (isNaN(id) || id < 0 || id === Infinity) {
        return error(res, 'Invalid id');
    }

    let properties;
    if (!req.query.unreg) {
        const user = await User.findOne({
            where: { id },
            include: [{
                model: Badge,
                through: { // remove createdAt/updatedAt attrs (otherwise error)
                    attributes: []
                }
            }]
        });

        if (!user) {
            return error(res, 'No such user');
        }

        properties = {};

        if (req.user) {
            switch (req.user.role) {
                case 'ADMIN':
                    properties.email = user.email;
                case 'MOD':
                    properties.ip = user.lastIp;
                    properties.cc = user.lastCC;
                    properties.badges = user.badges.map(b => b.toJSON());
                    properties.shadowBanned = user.shadowBanned;
                    properties.bannedUntil = user.bannedUntil;
                case 'TRUSTED':
                case 'USER':
                    properties.name = user.name;
                    properties.id = user.id;
                    properties.role = user.role;
            }
        } else {
            console.log('shieeeettt')
        }
    } else {
        let client = WSS.getInstance().clients.get(id);
        if (!client) client = WSS.getInstance().leaved.get(id);

        if (!client) {
            return res.error('Socket with this id was closed long time ago or never opened')
        }

        properties = {
            'registered': client.user ? 'yes' : 'no',
        }

        if (checkRole(req.user, ROLE.MOD)) {
            properties.ip = client.ip;
        }
    }

    res.set({
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
    });
    res.json(properties);
});


module.exports = router;
