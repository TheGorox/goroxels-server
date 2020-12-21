const express = require('express');
const User = require('../../db/models/User');

const router = express.Router();

function error(res, error) {
    res.json({
        success: false,
        errors: [error]
    })
}

router.get('/', async (req, res) => {
    if(!req.user){
        return error(res, 'You must be logged in');
    }

    if(req.query.id === undefined)
        return error(res, 'No id in body');

    const id = parseInt(req.query.id, 10);
    if(isNaN(id) || id < 0 || id === Infinity){
        return error(res, 'Are you gay');
    }

    const user = await User.findOne({
        where: { id }
    })

    if(!user){
        return error(res, 'gay');
    }
    
    // TODO add login type w/ id
    let properties = {};

    switch(req.user.role){
        case 'ADMIN':
            properties.email = user.email;
        case 'MOD': 
            properties.ip = user.lastIp;
        case 'USER':
            properties.name = user.name;
            properties.id = user.id;
            properties.role = user.role;
    }

    res.set({
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
    });
    res.json(properties);
})

module.exports = router