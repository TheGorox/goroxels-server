const express = require('express');
const User = require('../../db/models/User');
const logger = require('../../logger')('API');

const rateLimit = require('express-rate-limit');
const roleRequired = require('../roleRequired');

const router = express.Router();

// limit to 15 minutes
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 3
})

function error(res, error) {
    res.json({
        errors: [error]
    })
}

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