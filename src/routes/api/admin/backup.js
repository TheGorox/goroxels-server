const express = require('express');
const logger = require('../../../logger')('API', 'debug');
const adminLogger = require('../../../logger')('admin');

const pathlib = require('path');
const backupPath = pathlib.resolve(__dirname, '../../../../backup/')

const fs = require('fs');
const Server = require('../../../WebsocketServer');

const zlib = require('zlib');

const WSS = require('../../../WebsocketServer');

const expressCompression = require('compression');

const router = express.Router();

const cachedDays = {};
const cachedTimes = {};

function chunkKey(cx, cy) {
    return `${cx},${cy}`
}
async function inflateAsync(buf) {
    return new Promise((res, rej) => {
        zlib.inflate(buf, (err, result) => {
            if (err) return rej(err);
            res(result);
        })
    })
}
async function deflateAsync(buffer) {
    return new Promise((res, rej) => {
        zlib.deflate(buffer, (err, result) => {
            if (err) return rej(err);
            res(result);
        })
    })
}

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
        days = fs.readdirSync(pathlib.resolve(backupPath, canvas.toString()));
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
        times = fs.readdirSync(pathlib.resolve(backupPath, canvas.toString(), day));
    } catch (e) {
        logger.warn('/getTimes read day exc: ' + e.message);
        return res.error('Unknow error (day path)');
    }

    cachedTime.lastUpdate = Date.now();
    cachedTime.data = times;

    res.json(times)
})

function hhmmssToTimestamp(timeStr) {
    const [hh, mm, ss] = timeStr.split('-').map(x => parseInt(x, 10));
    return (hh * 3600) + (mm * 60) + ss;
}

function readBit(number, n) {
    return (number >> n) & 1
}

// returns object with metadata and chunks as file buffers
async function getBackup(canvas, day, time, separated=false) {
    let cachedCanvas = cachedDays[canvas];

    if (!cachedCanvas || !cachedCanvas.data.includes(day)) {
        throw new Error('Wrong canvas or day');
    }


    const cachedTimeCanvas = cachedTimes[canvas],
        cachedTime = cachedTimeCanvas ? cachedTimeCanvas[day] : null;

    if (!cachedTime || !cachedTime.data.includes(time)) {
        throw new Error('Wrong time');
    }

    const dayFolderPath = pathlib.join(backupPath, canvas.toString(), day);
    const allTimesPaths = fs.readdirSync(dayFolderPath);
    const needTs = hhmmssToTimestamp(time);
    let timesBefore = allTimesPaths.filter(hhmmss => {
        return hhmmssToTimestamp(hhmmss) <= needTs;
    }).sort((a, b) => {
        return hhmmssToTimestamp(a) - hhmmssToTimestamp(b);
    })

    const timesPathsAbs = timesBefore.map(t => pathlib.join(dayFolderPath, t));
    const chunkStates = {};
    let lastMetadata = null;

    for (let timePath of timesPathsAbs) {
        const metaPath = pathlib.join(timePath, 'metadata');
        const metaFile = fs.readFileSync(metaPath);
        const {
            width, height, chunkSize
        } = lastMetadata = JSON.parse(metaFile.toString());

        const chunkdataPath = pathlib.join(timePath, 'chunkdata');

        const chunkdataGzipped = (await fs.promises.readFile(chunkdataPath)).buffer;
        let chunkdata = await inflateAsync(chunkdataGzipped);

        const changedBitsCount = width * height;
        const changedBits = chunkdata.subarray(0, Math.ceil(changedBitsCount / 8));
        const changedBitsArr = (new Array(changedBitsCount)).fill(0).map((_, i) => readBit(changedBits[i / 8 | 0], i % 8));

        const chunkLength = chunkSize ** 2;

        let currentOffset = Math.ceil(changedBitsCount / 8);
        for (let cy = 0; cy < height; cy++) {
            for (let cx = 0; cx < width; cx++) {
                const key = chunkKey(cx, cy);

                if (!changedBitsArr[cx + cy * width]) {
                    if (!chunkStates[key]) {
                        throw new Error('No prevStateData on unchanged chunk');
                    }

                    continue;
                }


                const chunkOffset = currentOffset;
                currentOffset += chunkLength;
                const curChunkData = chunkdata.subarray(chunkOffset, chunkOffset + chunkLength);

                if (!chunkStates[key]) {
                    chunkStates[key] = curChunkData;
                } else {
                    const chunkStateBuf = chunkStates[key];
                    for (let i = 0; i < curChunkData.length; i++) {
                        if (curChunkData[i] !== 0b11111111) {
                            chunkStateBuf[i] = curChunkData[i];
                        }
                    }
                }
            }
        }
    }

    if(separated) {
        return {
            metadata: lastMetadata,
            chunks: chunkStates
        }
    }

    const chunksBuffers = [];

    for (let cy = 0; cy < lastMetadata.height; cy++) {
        for (let cx = 0; cx < lastMetadata.width; cx++) {
            const key = chunkKey(cx, cy);
            const chunk = chunkStates[key];
            chunksBuffers.push(chunk);
        }
    }

    const chunksBuffersConcated = Buffer.concat(chunksBuffers);

    return {
        metadata: lastMetadata,
        chunkdata: chunksBuffersConcated
    }
}

router.use(expressCompression());

let lock = false;
router.get('/getBackup', async (req, res) => {
    if (lock) return res.error('Please try again in a second');
    lock = true;

    try {
        const canvas = +req.query.canvas;
        const day = req.query.day;
        const time = req.query.time;

        const { chunkdata, metadata } = await getBackup(canvas, day, time);
        // converting chunks from binary to base64
        const resultingBuffer = Buffer.concat([Buffer.from(JSON.stringify(metadata) + '\0'), chunkdata]);

        res.setHeader('Content-Type', 'text/plain');

        res.send(resultingBuffer);
    } catch (e) {
        logger.error(e);
        res.error(typeof e == 'string' ? e : e.message);
    } finally {
        lock = false;
    }

});

router.post('/rollback', async (req, res) => {
    const canvas = +req.query.canvas;
    const day = req.query.day;
    const time = req.query.time;
    const crop = req.query.crop;

    const { chunks } = await getBackup(canvas, day, time, true);

    let toCrop = false;
    let minX, minY, maxX, maxY;
    if (crop) {
        [minX, minY, maxX, maxY] = crop.split(',').map(x => +x);
        toCrop = true;
    }

    const canvasInst = global.canvases[canvas];

    let changedChunks = [];

    for (let key of Object.keys(chunks)) {
        const chunk = chunks[key];
        const [cx, cy] = key.split(',').map(x => +x);
        if (toCrop) {
            if (cx < minX || cy < minY || cx > maxX || cy > maxY) {
                continue
            }
        }

        changedChunks.push({x: cx, y: cy});
        canvasInst.chunkManager.setChunkData(cx, cy, chunk);
    }

    const canvasName = canvasInst.name;

    WSS.getInstance().channels[canvasName].addMessage(null, 'Rollback!', true);
    WSS.getInstance().broadcastReloadChunks(canvasInst, toCrop ? changedChunks : null);

    adminLogger.info(
        `${req.user.name} rollbacks ${canvasName} to ${day} ${time} ` +
        `(crop: ${toCrop ? crop : 'no'})`)

    res.status(200).send({
        success: true
    });
})


module.exports = router