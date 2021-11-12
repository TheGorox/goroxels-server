const express = require('express');
const { public } = require('../../../config');

const logger = require('../../../logger')('API', 'debug');
const adminLogger = require('../../../logger')('admin');

const roleRequired = require('../../../utils/roleRequired');
const WSS = require('../../../WebsocketServer');

const router = express.Router();

router.use(roleRequired.superadmin);

router.post('/wipe', async (req, res) => {
    const cid = +req.query.canvas;
    if (isNaN(cid) || cid < 0 || cid >= public.canvases.length)
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
    if (isNaN(cid) || cid < 0 || cid >= public.canvases.length)
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