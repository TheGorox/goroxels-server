const express = require('express');
const User = require('../../db/models/User');
const roleRequired = require('../../utils/roleRequired');
const WSS = require('../../WebsocketServer');
const { checkRole } = require('../../utils/role');
const { ROLE, MINUTE } = require('../../constants');
const { rateLimiter } = require('../../utils/express');
const { int2ipv4, int2ipv6subnet } = require('../../utils/ip');

const router = express.Router();

function error(res, error) {
    res.json({
        errors: [error]
    })
}

const limiter = rateLimiter.byIp({
    time: 5 * MINUTE,
    max: 5*30,
    headers: false
})

router.use(roleRequired.mod);
router.use(limiter);

router.get('/', async (req, res) => {
    const canvas = parseInt(req.query.canvas, 10);
    if(!(canvas >= 0 && canvas < global.canvases.length)){
        return error(res, 'Canvas id invalid');
    }

    const canvasInst = global.canvases[canvas];

    const x = parseInt(req.query.x, 10);
    const y = parseInt(req.query.y, 10);

    if(!(x >= 0 && x < canvasInst.realWidth) ||
        !(y >= 0 && y < canvasInst.realHeight)){
            return error(res, 'Coordinates invalid');
    }

    let properties = {};
    const pixelInfo = canvasInst.chunkManager.getPlaceDataRaw(x, y);
    if(!pixelInfo){
        properties.type = 'error';
        properties.placer = 'not found'
    }else{
        const [flag, data] = pixelInfo;
        switch(flag){
            case 0: 
                properties.type = 'empty';
                break
            case 1:
                properties.type = 'ip';
                const converted = int2ipv4(data);
                properties.placer = converted;
                break
            case 2: 
                properties.type = 'UID';
                const uname = await getUserNickname(data);
                if(!uname){
                    return error(res, 'Cannot find user with id ' + data);
                }
                properties.placer = {
                    nick: uname,
                    id: data
                };
                break
            case 3:
                properties.type = 'ipv6';
                const convertedv6 = int2ipv6subnet(data);
                properties.placer = convertedv6;
                break
        }
    }

    res.set({
        'Cache-Control': 'no-cache, no-store',
    });
    res.json(properties);
})

async function getUserNickname(id){
    const user = await User.findOne({
        where: { id },
        attributes: ['name']
    })
    if(!user) return null;

    return user.get('name');
}

module.exports = router