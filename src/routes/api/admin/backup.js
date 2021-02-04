const express = require('express');
const logger = require('../../../logger')('API', 'debug');
const roleRequired = require('../../roleRequired');

const path = require('path');
const backupPath = path.resolve(__dirname, '../../../../backup/')

const fs = require('fs');

const router = express.Router();

const cachedDays = {};
const cachedTimes = {};

router.use(roleRequired.mod);

router.get('/getDays', (req, res) => {
    const canvas = +req.query.canvas;
    //lastUpdate: null,
    // data: []

    if(isNaN(canvas) || canvas < 0 || canvas > 666)
        return res.error('Wrong canvas');

    let canvasDays = cachedDays[canvas];

    if(canvasDays && Date.now() - canvasDays.lastUpdate < 120000){
        logger.debug('sending cached days')
        return res.json(canvasDays.data);
    }else if(!canvasDays) canvasDays = cachedDays[canvas] = {};

    logger.debug('sending days')

    let days;
    try {
        days = fs.readdirSync(path.resolve(backupPath, canvas.toString()));
    }catch(e){
        logger.warn('/getDays read backup dir exc: ' + e.message);
        return res.error('Unknow error (backup path)');
    }
    
    canvasDays.lastUpdate = Date.now();
    canvasDays.data = days;

    res.json(days)
});

router.get('/getTimes', (req, res) => {
    const canvas = +req.query.canvas;
    let canvasDays;

    if(isNaN(canvas) || !(canvasDays=cachedDays[canvas]))
        return res.error('Wrong canvas');

    const day = req.query.day;
    if(!canvasDays.data.includes(day)){
        return res.error('Wrong day Martin')
    }

    let cachedCanvas = cachedTimes[canvas];
    let cachedTime = cachedCanvas ? cachedCanvas[day] : null;

    if(cachedTime && Date.now() - cachedTime.lastUpdate < 60000){
        logger.debug('Cached times');
        return res.json(cachedTime.data)
    }else if(!cachedCanvas){
        cachedCanvas = cachedTimes[canvas] = {};
    }
    if(!cachedTime){
        cachedTime = cachedCanvas[day] = {};
    }

    logger.debug('Not cached times')

    let times;
    try {
        times = fs.readdirSync(path.resolve(backupPath, canvas.toString(), day));
    }catch(e){
        logger.warn('/getTimes read day exc: ' + e.message);
        return res.error('Unknow error (day path)');
    }

    cachedTime.lastUpdate = Date.now();
    cachedTime.data = times;
    
    res.json(times)
})

let lock = false;
router.get('/getBackup', (req, res) => {
    if(lock) return res.error('Please try again in a second');
    lock = true;

    try{
        const canvas = +req.query.canvas;
        const day = req.query.day;

        let cachedCanvas = cachedDays[canvas];

        if(!cachedCanvas || !cachedCanvas.data.includes(day)){
            throw new Error('Wrong canvas or day');
        }

        const time = req.query.time;
        const cachedTimeCanvas = cachedTimes[canvas],
            cachedTime = cachedTimeCanvas ? cachedTimeCanvas[day] : null;

        if(!cachedTime || !cachedTime.data.includes(time)){
            throw new Error('Wrong time');
        }

        const backupFolder = path.resolve(backupPath, canvas.toString(), day, time);
        
        const chunksList = fs.readdirSync(backupFolder).filter(v => v.endsWith('.dat'));
        const metadataFile = fs.readFileSync(path.resolve(backupFolder, 'metadata'));

        const metadata = JSON.parse(metadataFile.toString());
        const chunks = {};

        const toSend = {
            metadata,
            chunks
        }
        
        for(file of chunksList){
            const chunkKey = file.split('.')[0];

            chunks[chunkKey] = fs.readFileSync(path.resolve(backupFolder, file)).toString('base64');
        }

        res.json(toSend);

        lock = false
    }catch(e){
        logger.error(e);
        res.error(typeof e == 'string' ? e : e.message);
        lock = false;
    }
    
})


module.exports = router