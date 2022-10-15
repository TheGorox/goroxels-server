const express = require('express');

const verifyRouter = express.Router();
const passport = require('./passport');
const session = require('./session');

verifyRouter.use(session);

verifyRouter.use(passport.initialize());
verifyRouter.use(passport.session());

function verifyClient(req){
    return new Promise(res => {
        verifyRouter(req, {}, () => {
            res(req.user || null);
        })
    })
}

module.exports = verifyClient