const express = require('express');
const User = require('../../../db/models/User')

const logger = require('../../../logger')('API', 'debug');

const router = express.Router();

const {
    ROLE
} = require('../../../constants');

function error(res, error) {
    res.json({
        success: false,
        errors: [error]
    })
}

router.post('/', async (req, res) => {
    if(!req.user || ROLE[req.user.role] !== ROLE.ADMIN){
        return error(res, 'you need to be admin to do this')
    }

    const targetUserId = +req.body.id,
        targetUserRole = req.body.role;
    if(isNaN(targetUserId) || targetUserId < 1) return error(res, 'wrong user id');
    if(ROLE[targetUserRole] === undefined || (targetUserRole === 'ADMIN' && req.user.id !== 1))
        return error('wrong role')

    if(req.user.id !== 1 && targetUserId === targetUserRole){
        return error('you can\'t change your role')
    }

    const user = await User.findOne({
        where: {
            id: targetUserId
        }
    });
    if(!user) return error('no such user');

    if(ROLE[user.role] === ROLE.ADMIN && req.user.id !== 1)
        return error('you can\'t change admin\'s role');

    user.role = targetUserRole;
    user.save().then(() => {
        res.json({
            success: true,
        });

        logger.debug(`Set ${user.name}'s role to ${targetUserRole}`)
    }).catch(e => {
        logger.error(e);
        error('unkown database error')
    })
})

module.exports = router