const express = require('express');
const User = require('../../db/models/User');
const roleRequired = require('../../utils/roleRequired');
const WSS = require('../../WebsocketServer');
const { checkRole } = require('../../utils/role');
const { ROLE, MINUTE } = require('../../constants');
const { rateLimiter } = require('../../utils/express');

const router = express.Router();

function error(res, error) {
    res.json({
        errors: [error]
    })
}

const limiter = rateLimiter.byIdOrIp({
    time: 1 * MINUTE,
    max: 5
})

router.use(roleRequired.user);
router.use(limiter);

router.get('/', async (req, res) => {
    if (req.query.id === undefined)
        return error(res, 'Player id is not specified');
        
    const id = parseInt(req.query.id, 10);
    if (isNaN(id) || id < 0 || id === Infinity) {
        return error(res, 'Are you gay');
    }

    let properties;
    if (!req.query.unreg) {
        const user = await User.findOne({
            where: { id }
        })

        if (!user) {
            return error(res, 'No such user');
        }

        // TODO add login type with id
        properties = {};

        if(req.user){
            switch (req.user.role) {
                case 'ADMIN':
                    properties.email = user.email;
                case 'MOD':
                    properties.ip = user.lastIp;
                    properties.cc = user.lastCC;
                case 'TRUSTED':
                case 'USER':
                    properties.name = user.name;
                    properties.id = user.id;
                    properties.role = user.role;
            }
        }else{
            console.log('shieeeettt')
        }
    } else {
        let client = WSS.getInstance().clients.get(id);
        if(!client) client = WSS.getInstance().leaved.get(id);

        if(!client){
            return res.error('Socket with this id was closed long time ago or never opened')
        }

        properties = {
            'registered': client.user ? 'yes' : 'no',
        }

        if(checkRole(req.user, ROLE.MOD)){
            properties.ip = client.ip;
        }
    }

    res.set({
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
    });
    res.json(properties);
})

module.exports = router