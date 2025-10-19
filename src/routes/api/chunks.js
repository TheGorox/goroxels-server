const express = require('express');

const { checkCanvasConditions } = require('../../utils/canvas');
const { query, validationResult } = require('express-validator');

const router = express.Router();

// came to conclusion that there is useless to add rate limit/slowdown :D

router.get('/get', async (req, res) => {
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
        const [chunkData, chunkHash] = await canvas.chunkManager.getChunkData(chunkX, chunkY);

        // make the cloudlfare cache chunks, but sending cache check requests every time
        // this will remain the same amount of requests, but will reduce outgoing traffic
        // for the new players drastically
        res.set("Cache-Control", "public, no-cache");

        res.header('Content-Encoding', 'deflate');
        res.header('Content-Type', 'application/binary');
        res.header('X-Compressed-Hash', chunkHash ?? '');
        res.send(chunkData);
    } catch (error) {
        console.error(error);
        return res.send({
            errors: ['Internal server error']
        });
    }
});

router.get('/check',
    query('canvas').isInt({ min: 0 }).toInt(),
    // validate hashes (json array of strings with length (16,64) )
    query('hashes')
        .isJSON().withMessage('Hashes must be valid JSON')
        .bail()
        .customSanitizer(value => {
            try {
                return JSON.parse(value);
            } catch {
                return value;
            }
        })
        .isArray({ min: 1 }).withMessage('Hashes must be a non-empty array')
        .bail()
        .custom(value => {
            return value.every(item =>
                typeof item === 'string' &&
                item.trim().length >= 16 &&
                item.trim().length <= 32
            );
        }).withMessage('All hashes must be non-empty strings with at least 16 characters'),

    // validate chunks (json array of positive numbers with length equals to hashes*2
    // + some additional length checks)
    query('chunks')
        .isJSON().withMessage('Chunks must be valid JSON')
        .bail()
        .customSanitizer(value => {
            try {
                return JSON.parse(value);
            } catch {
                return value;
            }
        })
        .isArray({ min: 1 }).withMessage('Chunks must be a non-empty array')
        .bail()
        .custom((value, { req }) => {
            const hashes = req.query.hashes; // parsed aleady
            return value.length === hashes.length * 2;
        }).withMessage('Chunks must have exactly twice as many elements as hashes')
        .bail()
        .custom(value => {
            return value.length % 2 === 0;
        }).withMessage('Chunks must have even number of elements (coordinate pairs)')
        .bail()
        .custom(value => {
            return value.length <= 64;
        }).withMessage('Chunks cannot exceed 64 elements (32 coordinate pairs)')
        .bail()
        .custom(value => {
            return value.every(item =>
                typeof item === 'number' &&
                item >= 0 &&
                Number.isFinite(item)
            );
        }).withMessage('All chunks must be non-negative numbers')
    , async (req, res) => {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return res.json({ errors: result.array() });
        }

        const canvasId = req.query.canvas;

        const canvases = global.canvases;
        if (canvasId < 0 || canvasId >= canvases.length) {
            return res.send({
                errors: ['Wrong canvas id']
            });
        }
        const canvas = canvases[canvasId];

        const chunksParsed = req.query.chunks;
        const checkResults = new Array(chunksParsed.length / 2);
        for (let i = 0; i < chunksParsed.length; i += 2) {
            const [cx, cy] = [chunksParsed[i], chunksParsed[i + 1]];

            if (cx < 0 || cx >= canvas.width || cy < 0 || cy >= canvas.height) {
                return res.error('Bad cx/cy coordinate');
            }
            const hash = req.query.hashes[i / 2];

            // new Number maps true/false to 1/0
            checkResults[i / 2] = new Number(await canvas.chunkManager.checkChunkHash(cx, cy, hash));
        }

        res.set("Cache-Control", "no-cache, no-store");
        res.json(checkResults);
    })


module.exports = router