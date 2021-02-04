const express = require('express');
const User = require('../../../db/models/User')

const logger = require('../../../logger')('API', 'debug');

const router = express.Router();

const roleRequired = require('../../roleRequired');

const {
    ROLE
} = require('../../../constants');

function error(res, error) {
    res.json({
        errors: [error]
    })
}

router.use(roleRequired.admin);

router.post('/', async (req, res) => {
    const targetUserId = +req.body.id,
        targetUserRole = req.body.role;
    if(isNaN(targetUserId) || targetUserId < 1) return error(res, 'wrong user id');
    if(ROLE[targetUserRole] === undefined || (targetUserRole === 'ADMIN' && req.user.id !== 1))
        return error(res, 'wrong role')

    if(req.user.id !== 1 && targetUserId === targetUserRole){
        return error(res, 'you can\'t change your role')
    }

    const user = await User.findOne({
        where: {
            id: targetUserId
        }
    });
    if(!user) return error(res, 'no such user');

    if(ROLE[user.role] === ROLE.ADMIN && req.user.id !== 1)
        return error(res, 'you can\'t change admin\'s role');

    user.role = targetUserRole;
    user.save().then(() => {
        res.json({
            errors: []
        });

        logger.debug(`Set ${user.name}'s role to ${targetUserRole}`)
    }).catch(e => {
        logger.error(e);
        error('unkown database error')
    })
})

module.exports = router