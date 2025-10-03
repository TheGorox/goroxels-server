const express = require('express');
const {User} = require('../../../db/models/User');

const logger = require('../../../logger')('API', 'debug');
const adminLogger = require('../../../logger')('admin');

const router = express.Router();

const roleRequired = require('../../../utils/roleRequired');

const {
    ROLE
} = require('../../../constants');
const { rateLimiter } = require('../../../utils/express');
const { Op } = require('sequelize');

router.use(rateLimiter.byIp({
    max: 12, // 2 per second
    time: 6000
}))
router.use(rateLimiter.global({
    max: 40, // 4 per second globally
    time: 10000
}))

router.use(roleRequired.mod);

router.get('/search', async (req, res) => {
    let term = req.query.t;
    let id = req.query.id;
    
    let isId = false;

    const isBanned = +req.query.isBanned;

    if(term){
        if(term.length > 16){
            return res.error('too long');
        }
        term = term.replace(/%/g, '[%]').replace(/_/g, '[_]')
    }else if(id){
        id = +id;
        if(isNaN(id) || id < 1 || id > Number.MAX_SAFE_INTEGER){
            return res.error('bad id');
        }
        isId = true;
    }else {
        if(!isBanned)
            return res.error('nothing provided');
    }

    let query = {};

    if(id){
        query = {
            id
        }
    }else if(term){
        query = {
            name: {
                [Op.like]: '%' + term + '%'
            }
        }
    }

    const options = {
        where: query,
        limit: 30,
        attributes: [ 'name', 'id', 'role' ]
    }

    if(isBanned){
        options.where.role = 'BANNED';
        options.order = [['updateDate', 'DESC']];
    }
        
    const users = await User.findAll(options);

    res.json(users);
})

module.exports = router