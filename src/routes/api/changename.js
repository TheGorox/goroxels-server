const express = require('express');
const { MINUTE } = require('../../constants');
const {User} = require('../../db/models/User');
const logger = require('../../logger')('API');

const { rateLimiter } = require('../../utils/express');
const roleRequired = require('../../utils/roleRequired');

const router = express.Router();

const limiter = rateLimiter.byIdOrIp({
    time: 5 * MINUTE,
    max: 3
})

function error(res, error) {
    res.json({
        errors: [error]
    })
}

// TODO disconnect all sockets

router.use(limiter);
router.use(roleRequired.user)

router.post('/', async (req, res) => {
    const newName = req.body.name;

    if (!newName) {
        return error(res, 'new name should be provided')
    }
    if (newName === req.user.name) {
        return error(res, 'username is the same')
    }

    if (newName.length === 0 || newName.length > 32) {
        return error(res, 'username is invalid');
    }

    const exists = await User.findOne({
        where: {
            name: newName
        }
    });

    if (exists) {
        return error(res, 'name already taken');
    }

    req.user.name = newName;
    req.user.save().then(() => {
        return res.json({
            errors: []
        })
    }).catch(e => {
        logger.error(e);

        return error(res, 'unknown database error. please, notify admin');
    });
});

module.exports = router