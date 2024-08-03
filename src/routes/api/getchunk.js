const express = require('express');

const { checkCanvasConditions } = require('../../utils/canvas');

const router = express.Router();

// came to conclusion that there is useless to add rate limit/slowdown :D

router.get('/', async (req, res) => {
    const canvasId = +req.query.canvas;
    const chunkX = +req.query.x;
    const chunkY = +req.query.y;

    const canvases = global.canvases;
    if (canvasId < 0 || canvasId >= canvases.length) {
        return res.send({
            errors: ['Wrong canvas id']
        });
    }

    const canvas = canvases[canvasId];
    // if (canvas.require && !checkCanvasConditions(req.user, canvas.require)) {
    //     return res.send({
    //         errors: ['You have no access to this canvas']
    //     });
    // }

    if (chunkX < 0 || chunkX >= canvas.width || chunkY < 0 || chunkY >= canvas.height) {
        return res.send({
            errors: ['Bad x/y chunk coordinate']
        });
    }


    try {
        const chunkData = await canvas.chunkManager.getChunkData(chunkX, chunkY);
        res.header('Content-Encoding', 'deflate');
        res.header('Content-Type', 'application/binary');
        res.send(chunkData);
    } catch (error) {
        console.error(error);
        return res.send({
            errors: ['Internal server error']
        });
    }
})

module.exports = router