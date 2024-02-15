const bodyParser = require('body-parser');

const express = require('express');
const passport = require('../../passport');
const session = require('../../session');

const auth = require('./auth');
const me = require('./me');
const changeName = require('./changename');
const userInfo = require('./userInfo');
const admin = require('./admin');
const captcha = require('./captcha');
const online = require('./online');
const pixelInfo = require('./pixelInfo');
const getChunk = require('./getchunk');

const router = express.Router();

router.use(bodyParser.json());

router.use(session);

router.use(passport.initialize());
router.use(passport.session())

router.use((req, res, next) => {
    res.error = function(error){
        res.json({
            success: false,
            errors: [error]
        })
    }

    next();
})

router.use('/auth', auth(passport));
router.use('/me', me);
router.use('/changename', changeName);
router.use('/userInfo', userInfo);
router.use('/captcha', captcha);
router.use('/online', online);
router.use('/pixelInfo', pixelInfo);
router.use('/getchunk', getChunk);

router.use('/admin', admin);

module.exports = router;