const path = require('path');
const fs = require('fs');
const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const { query, validationResult } = require('express-validator');

const roleRequired = require('../../utils/roleRequired');
const { checkRole } = require('../../utils/role');
const { rateLimiter } = require('../../utils/express');
const { randomFileName } = require('../../utils/misc');
const Template = require('../../db/models/Template');
const { ROLE } = require('../../constants');
const logger = require('../../logger')('API/TEMPLATE');

const router = express.Router();

const dataPath = path.join(__dirname, '../../../data');
const patternsPath = path.join(dataPath, 'templates/patterns');
const thumbnailsPath = path.join(dataPath, 'templates/thumb');

for (const p of [patternsPath, thumbnailsPath]) {
    if (!fs.existsSync(p)) {
        fs.mkdirSync(p, { recursive: true });
    }
}

function error(res, msg) {
    return res.json({ errors: [msg] });
}

router.use(roleRequired.user);

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 1048576 * 16 } // 16mb
});

function isSafePngFileName(name) {
    return /^[0-9a-f]{16,32}\.png$/.test(name);
}

router.post(
    '/add',
    rateLimiter.byUserId({ time: 60 * 1000, max: 5 }),
    upload.fields([
        { name: 'thumb', maxCount: 1 },
        { name: 'pattern', maxCount: 1 },
    ]),
    [
        query('name')
            .isString()
            .trim()
            .isLength({ min: 3, max: 32 })
            .escape(),
        query('public').toBoolean(),
        query('width').optional().isInt({ min: 1 })
    ],
    async (req, res) => {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return res.json({ errors: result.array() });
        }

        if (!req.files.thumb || !req.files.pattern) {
            return error(res, 'both thumb and pattern images are required');
        }

        const thumbFile = req.files.thumb[0];
        const patternFile = req.files.pattern[0];
        let thumbName, patternName;

        const oldTemplate = await Template.findByPk(req.query.name);
        if (oldTemplate) {
            if (oldTemplate.userId !== req.user.id) {
                return error(res, 'template exists');
            }
            thumbName = oldTemplate.thumb;
            patternName = oldTemplate.file;
        } else {
            thumbName = randomFileName() + '.png';
            patternName = randomFileName() + '.png';
        }

        const thumbPath = path.join(thumbnailsPath, thumbName);
        const patternPath = path.join(patternsPath, patternName);

        try {
            // validate thumb is 50х50 PNG
            const thumbMeta = await sharp(thumbFile.buffer).metadata();
            if (thumbMeta.width !== 50 || thumbMeta.height !== 50) {
                return error(res, 'thumbnail must be exactly 50x50');
            }
            if (thumbMeta.format !== 'png') {
                return error(res, 'thumbnail must be PNG');
            }

            // validate pattern is PNG
            const patternMeta = await sharp(patternFile.buffer).metadata();
            if (patternMeta.format !== 'png') {
                return error(res, 'pattern must be PNG');
            }

            await fs.promises.writeFile(thumbPath, thumbFile.buffer);
            await fs.promises.writeFile(patternPath, patternFile.buffer);

            let template;
            if (oldTemplate) {
                template = oldTemplate;

                template.public = req.query.public;
                template.origWidth = req.query.width || null;
                await template.save();
            } else {
                template = await req.user.createTemplate({
                    name: req.query.name,
                    file: patternName,
                    thumb: thumbName,
                    public: req.query.public,
                    origWidth: req.query.width || null
                });
            }

            return res.json(template);
        } catch (err) {
            if (fs.existsSync(thumbPath)) await fs.promises.unlink(thumbPath);
            if (fs.existsSync(patternPath)) await fs.promises.unlink(patternPath);

            logger.error(err);
            return error(res, 'unknown error creating template, try again later');
        }
    }
);

router.post(
    '/del',
    [query('name').isString().isLength({ min: 3, max: 32 }).escape()],
    async (req, res) => {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return res.json({ errors: result.array() });
        }

        try {
            const template = await Template.findByPk(req.query.name);
            if (!template) {
                return error(res, 'template not found');
            }

            if (template.userId !== req.user.id && !checkRole(req.user, ROLE.ADMIN)) {
                return error(res, 'permission denied');
            }

            const thumbPath = path.join(thumbnailsPath, template.thumb);
            const patternPath = path.join(patternsPath, template.file);

            if (fs.existsSync(thumbPath)) await fs.promises.unlink(thumbPath);
            if (fs.existsSync(patternPath)) await fs.promises.unlink(patternPath);

            await template.destroy();

            return res.json({ success: true });
        } catch (err) {
            logger.error(err);
            return error(res, 'failed to delete template');
        }
    }
);

router.get(
    '/list',
    [query('self').optional().isBoolean()],
    async (req, res) => {
        try {
            const onlySelf = req.query.self;
            let cond = {
                [require('sequelize').Op.or]: [
                    { public: true },
                    { userId: req.user.id }
                ]
            };
            if (onlySelf) {
                cond = {
                    userId: req.user.id
                };
            }
            const templates = await Template.findAll({
                where: cond
            });

            return res.json(templates);
        } catch (err) {
            logger.error(err);
            return error(res, 'failed to fetch templates');
        }
    }
);


router.get(
    '/img',
    [
        query('t').isIn(['thumb', 'orig']),
        query('f')
            .isString()
            .custom(value => {
                if (!isSafePngFileName(value)) {
                    throw new Error('invalid file name');
                }
                return true;
            }),
    ],
    async (req, res) => {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return res.json({ errors: result.array() });
        }

        const type = req.query.t;
        const fileName = req.query.f;

        const dir = type === 'thumb' ? thumbnailsPath : patternsPath;
        const filePath = path.join(dir, fileName);

        if (!fs.existsSync(filePath)) {
            return error(res, 'file not found');
        }

        try {
            const meta = await sharp(filePath).metadata();
            if (meta.format !== 'png') {
                return error(res, 'invalid image format');
            }
        } catch (err) {
            logger.error(err);
            return error(res, 'error reading image');
        }

        res.setHeader('Cache-Control', 'private, max-age=86400'); // 24 hours
        res.setHeader('Expires', new Date(Date.now() + 86400000).toUTCString());
        res.setHeader('Content-Type', 'image/png');
        
        fs.createReadStream(filePath).pipe(res);
    }
);


module.exports = router;
