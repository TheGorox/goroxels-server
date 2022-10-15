const express = require('express');
const logger = require('../../../logger')('API', 'debug');
const adminLogger = require('../../../logger')('admin');

const path = require('path');
const backupPath = path.resolve(__dirname, '../../../../backup/')

const fs = require('fs');
const Server = require('../../../WebsocketServer');

const zlib = require('zlib');

const WSS = require('../../../WebsocketServer');

const router = express.Router();

const cachedDays = {};
const cachedTimes = {};

// required role is already set to mod

router.get('/getDays', (req, res) => {
    const canvas = +req.query.canvas;
    //lastUpdate: null,
    // data: []

    if (isNaN(canvas) || canvas < 0 || canvas > 666)
        return res.error('Wrong canvas');

    let canvasDays = cachedDays[canvas];

    if (canvasDays && Date.now() - canvasDays.lastUpdate < 120000) {
        logger.debug('sending cached days')
        return res.json(canvasDays.data);
    } else if (!canvasDays) canvasDays = cachedDays[canvas] = {};

    logger.debug('sending days')

    let days;
    try {
        days = fs.readdirSync(path.resolve(backupPath, canvas.toString()));
    } catch (e) {
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

    if (isNaN(canvas) || !(canvasDays = cachedDays[canvas]))
        return res.error('Wrong canvas');

    const day = req.query.day;
    if (!canvasDays.data.includes(day)) {
        return res.error('Wrong day Martin')
    }

    let cachedCanvas = cachedTimes[canvas];
    let cachedTime = cachedCanvas ? cachedCanvas[day] : null;

    if (cachedTime && Date.now() - cachedTime.lastUpdate < 60000) {
        logger.debug('Cached times');
        return res.json(cachedTime.data)
    } else if (!cachedCanvas) {
        cachedCanvas = cachedTimes[canvas] = {};
    }
    if (!cachedTime) {
        cachedTime = cachedCanvas[day] = {};
    }

    logger.debug('Not cached times')

    let times;
    try {
        times = fs.readdirSync(path.resolve(backupPath, canvas.toString(), day));
    } catch (e) {
        logger.warn('/getTimes read day exc: ' + e.message);
        return res.error('Unknow error (day path)');
    }

    cachedTime.lastUpdate = Date.now();
    cachedTime.data = times;

    res.json(times)
})

// returns object with metadata and chunks as file buffers
function getBackup(canvas, day, time) {
    let cachedCanvas = cachedDays[canvas];

    if (!cachedCanvas || !cachedCanvas.data.includes(day)) {
        throw new Error('Wrong canvas or day');
    }


    const cachedTimeCanvas = cachedTimes[canvas],
        cachedTime = cachedTimeCanvas ? cachedTimeCanvas[day] : null;

    if (!cachedTime || !cachedTime.data.includes(time)) {
        throw new Error('Wrong time');
    }

    const backupFolder = path.resolve(backupPath, canvas.toString(), day, time);

    const chunksList = fs.readdirSync(backupFolder).filter(v => v.endsWith('.dat'));
    const metadataFile = fs.readFileSync(path.resolve(backupFolder, 'metadata'));

    const metadata = JSON.parse(metadataFile.toString());
    const chunks = {};

    const result = {
        metadata,
        chunks
    }

    for (file of chunksList) {
        const chunkKey = file.split('.')[0];

        chunks[chunkKey] = fs.readFileSync(path.resolve(backupFolder, file));
    }

    return result
}

let lock = false;
router.get('/getBackup', (req, res) => {
    if (lock) return res.error('Please try again in a second');
    lock = true;

    try {
        const canvas = +req.query.canvas;
        const day = req.query.day;
        const time = req.query.time;

        const { chunks, metadata } = getBackup(canvas, day, time);
        // converting chunks from binary to base64
        Object.keys(chunks).forEach(c => chunks[c] = chunks[c].toString('base64'));

        res.json({ chunks, metadata });

        lock = false
    } catch (e) {
        logger.error(e);
        res.error(typeof e == 'string' ? e : e.message);
        lock = false;
    }

});  

router.post('/rollback', (req, res) => {
    const canvas = +req.query.canvas;
    const day = req.query.day;
    const time = req.query.time;
    const crop = req.query.crop;

    const { chunks } = getBackup(canvas, day, time);

    let toCrop = false;
    let minX, minY, maxX, maxY;
    if(crop){
        [minX, minY, maxX, maxY] = crop.split(',').map(x => +x);
        toCrop = true;
    }

    for(let key of Object.keys(chunks)){
        const chunk = chunks[key];
        const [cx, cy] = key.split(',').map(x => +x);
        if(toCrop){
            if(cx < minX || cy < minY || cx > maxX || cy > maxY){
                continue
            }
        }

        zlib.inflate(chunk, (err, resp) => {
            if(err) return logger.error(err);
            Server.getInstance().setChunk(canvas, cx, cy, resp);
        })
    }

    const canvasInst = global.canvases[canvas];
    const canvasName = canvasInst.name;

    WSS.getInstance().channels[canvasName].addMessage(null, 'Rollback!', true);
    WSS.getInstance().broadcastReload(canvasInst);

    adminLogger.info(
        `${req.user.name} rollbacks ${canvasName} to ${day} ${time} `+
        `(crop: ${toCrop ? crop : 'no'})`)

    res.status(200).send({
        success: true
    });
})


module.exports = router