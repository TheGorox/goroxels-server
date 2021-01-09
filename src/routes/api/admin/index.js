const express = require('express');

const router = express.Router();

const changerole = require('./changerole');

router.use('/changerole', changerole);

module.exports = router