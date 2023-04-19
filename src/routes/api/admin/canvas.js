const express = require('express');
const multer = require('multer');
const { public } = require('../../../config');

const logger = require('../../../logger')('API', 'debug');
const adminLogger = require('../../../logger')('admin');

const roleRequired = require('../../../utils/roleRequired');
const WSS = require('../../../WebsocketServer');

const sharp = require('sharp');
const { applyProtectMask } = require('../../../utils/canvas');

const router = express.Router();

function validateCanvasId(cid) {
    return !(isNaN(cid) || cid < 0 || cid >= public.canvases.length)
}
function validateCoords(x, y, canvasId) {
    const canvas = public.canvases[canvasId];
    const canvasW = canvas.boardWidth * canvas.chunkSize;
    const canvasH = canvas.boardHeight * canvas.chunkSize;

    if (!canvas) return false;

    if (x < 0 || y < 0)
        return false;
    if (x >= canvasW || y >= canvasH)
        return false;

    return true
}

const formDataMW = multer({
    storage: multer.memoryStorage(),
    limits: {
        fieldSize: 1048576 * 5 // 5mb
    }
});

const protectMaskMulter = formDataMW.fields([{ name: 'x', maxCount: 1 }, { name: 'y', maxCount: 1 }, { name: 'canvas', maxCount: 1 }, { name: 'img', maxCount: 1 }])
router.post('/applyProtectMask', protectMaskMulter, async (req, res) => {
    const file = req?.files?.img[0];
    if (!file) {
        return res.error('No file provided');
    }

    const canvasId = +req.body?.canvas;
    if (!validateCanvasId(canvasId)) {
        return res.error('Bad canvas id');
    }

    let x = +req.body?.x;
    let y = +req.body?.y;

    if (!validateCoords(x, y, canvasId)) {
        return res.error('Invalid x/y')
    }

    let png = sharp(file.buffer);
    try {
        await png.toBuffer();
    } catch (error) {
        return res.error('Invalid PNG provided')
    }

    const buffer = (await png.raw().toBuffer())
    const { width, height } = await png.metadata();

    const mask = new Array(width * height);

    for (let i = 0; i < mask.length; i++) {
        mask[i] = buffer[(i << 2) + 3] ? 1 : 0;
    }

    try {
        applyProtectMask(x, y, canvasId, {
            width, height, mask
        })   
    } catch (e) {
        logger.error(e);
        return res.error('Unknown applyProtectMask error');
    }

    adminLogger.info(`${req.user.name} applied protect mask on "${global.canvases[canvasId].name}" with size ${width}x${height}`)

    res.json({
        success: true
    })
})

router.use(roleRequired.superadmin);

router.post('/wipe', async (req, res) => {
    const cid = +req.query.canvas;
    if (!validateCanvasId(cid))
        return res.error('invalid canvas id')

    const canvas = global.canvases[cid];
    canvas.chunkManager.wipeAll();
    WSS.getInstance().channels[canvas.name].addMessage(null, 'WIPE!!', true);
    WSS.getInstance().broadcastReload(cid);

    adminLogger.info(`${req.user.name} wiped canvas "${canvas.name}"`)

    res.json({
        success: true
    })
})

router.post('/enlarge', async (req, res) => {
    const cid = +req.query.canvas;
    if (!validateCanvasId(cid))
        return res.error('invalid canvas id')

    const t = +req.query.top;
    const r = +req.query.right;
    const b = +req.query.bottom;
    const l = +req.query.left;
    if ([t, r, b, l].some(x => (x < 0 || x > 254 || isNaN(x))))
        return res.error('invalid t/r/b/l');
    if ([t, r, b, l].every(x => x == 0))
        return res.error('nothing to do!')

    const canvas = global.canvases[cid];

    try {
        await canvas.chunkManager.enlargeBy(t, r, b, l);
    } catch (e) {
        return res.error(e.message);
    }

    WSS.getInstance().channels[canvas.name].addMessage(null, 'RESIZE!!', true);
    WSS.getInstance().broadcastReload(cid);

    adminLogger.info(`${req.user.name} resized canvas "${canvas.name}" by (top ${t}, right ${r}, bottom ${b}, left ${l})`)

    res.json({
        success: true
    })
})

module.exports = router