const express = require('express');
const multer = require('multer');

const radioServer = require('../../../music-radio/server');
const { SongExistsError, SongNotExistError } = require('../../../music-radio/util');
const { checkRole } = require('../../../utils/role');
const { ROLE } = require('../../../constants');
const roleRequired = require('../../../utils/roleRequired');

const logger = require('../../../logger')('BOT-GATEWAY', 'debug');


const router = express.Router();

router.use((req, res, next) => {
    const botKey = process.env.RADIO_BOT_KEY;
    if(req.headers['x-bot-key']){   
        if(req.headers['x-bot-key'] !== botKey){
            return res.status(403).send('BAD API KEY');
        }else{
            req.user = {
                role: ROLE.ADMIN,
                id: -1
            }
        }
    }

    next();
});
router.use(roleRequired.trusted);

const formDataAddSong = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 1048576 * 15 // 15mb
    }
});

const addSongMulter = formDataAddSong.fields([{ name: 'name', maxCount: 1 }, { name: 'enqueue', maxCount: 1 }, { name: 'data', maxCount: 1 }]);
router.post('/add-song', roleRequired.admin, addSongMulter, (req, res) => {
    const songName = req.body.name;
    const enqueue = !!(+req.body.enqueue);
    const songData = req.files.data[0];

    try {
        radioServer.addSong(songData.buffer, songName, enqueue);  
        res.json({
            error: false
        })  
    } catch (error) {
        if(error instanceof SongExistsError){
            return res.json({
                error: true,
                errorText: 'This song exists'
            });
        }

        logger.error(error);

        res.json({
            error: true,
            errorText: 'Unexpected error (logged to console)'
        });
    }
});

router.get('/skip-song', roleRequired.mod, async (req, res) => {
    try {
        await radioServer.skipSong();

        res.json({
            error: false,
        });
    } catch (error) {
        logger.error(error);

        res.json({
            error: true,
            errorText: 'Unexpected error (logged to console)'
        });
    }
});

// we'll use addSong multer since it has all the fields we need
router.post('/add-temp-song',roleRequired.trusted, addSongMulter, async (req, res) => {
    const songName = req.body.name;
    const songData = req.files.data[0];

    try {
        await radioServer.addOneTimeSong(songData.buffer, songName);
        res.json({
            error: false
        })  
    } catch (error) {
        logger.error(error);

        res.json({
            error: true,
            errorText: 'Unexpected error (logged to console)'
        });
    }
});

router.post('/enqueue', async (req, res) => {
    const titlePart = req.query.title;

    try {
        await radioServer.enqueueSongByTitle(titlePart);
        res.json({
            error: false
        })  
    } catch (error) {
        if(error instanceof SongNotExistError){
            res.json({
                error: true,
                errorText: 'No songs found by the given title'
            });
            return;
        }

        logger.error(error);

        res.json({
            error: true,
            errorText: 'Unexpected error (logged to console)'
        });
    }
});

router.post('/delete-song', roleRequired.admin, async (req, res) => {
    const titlePart = req.query.title;

    try {
        await radioServer.deleteByTitle(titlePart);
        res.json({
            error: false
        })  
    } catch (error) {
        if(error instanceof SongNotExistError){
            res.json({
                error: true,
                errorText: 'No songs found by the given title'
            });
            return;
        }

        logger.error(error);

        res.json({
            error: true,
            errorText: 'Unexpected error (logged to console)'
        });
    }
});

module.exports = router;