const express = require('express');
const { User, Badge } = require('../../db/models/User');
const roleRequired = require('../../utils/roleRequired');

const logger = require('../../logger')('API/BADGE');

const router = express.Router();

function error(res, error) {
    res.json({ errors: [error] })
}

router.use(roleRequired.admin);

router.post('/add', async (req, res) => {
    if (req.query.userId === undefined)
        return error(res, 'Player id is not specified');

    const id = parseInt(req.query.userId, 10);
    if (isNaN(id) || id < 0 || id === Infinity) {
        return error(res, 'Invalid id');
    }

    const user = await User.findOne({
        where: { id }
    });

    if (!user) {
        return error(res, 'No such user');
    }

    const badgeName = req.query.badge;
    if (typeof badgeName !== 'string' || !badgeName.length) {
        return error(res, 'Invalid badge name');
    }

    const badge = await Badge.findOne({
        where: { name: badgeName }
    });

    if (!badge) {
        return error(res, 'No such badge');
    }


    try {
        await user.addBadge(badge);
        res.json({
            ok: true
        });
    } catch (error) {
        logger.error(error);
        return error(res, 'Error while trying to add badge');
    }
});

router.post('/del', async (req, res) => {
    if (req.query.userId === undefined)
        return error(res, 'Player id is not specified');

    const id = parseInt(req.query.userId, 10);
    if (isNaN(id) || id < 0 || id === Infinity) {
        return error(res, 'Invalid id');
    }

    const user = await User.findOne({
        where: { id }
    });

    if (!user) {
        return error(res, 'No such user');
    }

    const badgeName = req.query.badge;
    if (typeof badgeName !== 'string' || !badgeName.length) {
        return error(res, 'Invalid badge name');
    }

    const badge = await Badge.findOne({
        where: { name: badgeName }
    });

    if (!badge) {
        return error(res, 'No such badge');
    }

    try {
        await user.removeBadge(badge);
        res.json({
            ok: true
        });
    } catch (error) {
        logger.error(error);
        return error(res, 'Error while trying to remove badge');
    }
});

module.exports = router;