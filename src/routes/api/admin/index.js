const express = require('express');

const changerole = require('./changerole');
const backup = require('./backup');

const router = express.Router();

router.use('/changerole', changerole);
router.use('/backup', backup);

module.exports = router