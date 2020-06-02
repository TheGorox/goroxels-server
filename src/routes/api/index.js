const bodyParser = require('body-parser');

const express = require('express');
const passport = require('../../passport');

const auth = require('./auth');

const router = express.Router();

router.use(bodyParser.json());

router.use('/auth', auth(passport));

module.exports = router;