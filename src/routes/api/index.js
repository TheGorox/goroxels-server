const bodyParser = require('body-parser');

const express = require('express');
const passport = require('../../passport');
const session = require('../../session');

const auth = require('./auth');
const me = require('./me');
const changeName = require('./changename')

const router = express.Router();

router.use(bodyParser.json());

router.use(session);

router.use(passport.initialize());
router.use(passport.session())

router.use('/auth', auth(passport));
router.use('/me', me);
router.use('/changename', changeName);

module.exports = router;