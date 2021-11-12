const express = require('express');

const changerole = require('./changerole');
const backup = require('./backup');
const config = require('./config');
const ip = require('./ip');
const banPlayer = require('./banPlayer');
const users = require('./users');
const canvas = require('./canvas');

const roleRequired = require('../../../utils/roleRequired');

const router = express.Router();

router.use(roleRequired.mod);

router.use('/changerole', changerole);
router.use('/backup', backup); // get backup or rollback
router.use('/config', config); // set some temp variables
router.use('/ip', ip); // bulk ip actions
router.use('/banPlayer', banPlayer); // ban ip (for mods)
router.use('/users', users); // search users
router.use('/canvas', canvas); // canvas actions (like wipe)

module.exports = router