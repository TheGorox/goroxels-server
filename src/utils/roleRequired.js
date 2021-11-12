// tool for check roles in requests
// TODO move it to /express.js

const {
    ROLE
} = require('../constants');

const roleRequired = {
    user: (req, res, next) => {
        checkerHandler(req, res, ROLE.USER, next);
    },
    trusted: (req, res, next) => {
        checkerHandler(req, res, ROLE.TRUSTED, next);
    },
    mod: (req, res, next) => {
        checkerHandler(req, res, ROLE.MOD, next);
    },
    admin: (req, res, next) => {
        checkerHandler(req, res, ROLE.ADMIN, next);
    },
    superadmin: (req, res, next) => {
        if(req.user && req.user.id == 1){
            next()
        }else{
            res.json({
                errors: ['Not permitted']
            })
        }
    },
}

function checkerHandler(req, res, role, next){
    if(checkRole(req, role)){
        next()
    }else{
        res.json({
            errors: ['Not permitted']
        })
    }
}

function checkRole(req, role){
    if(!req.user || ROLE[req.user.role] < role) return false;
    return true
}

module.exports = roleRequired