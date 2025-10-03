const express = require('express');
const logout = require('./logout');

const router = express.Router();

const logger = require('../../../logger')('AUTH', 'debug');
const adminLogger = require('../../../logger')('admin');

function afterlogin(req, res) {
    if (!req.user) return;
    adminLogger.info(`user login (id${req.user.id}|${req.user.name}) at ${req.realIp}`);

    req.user.lastIp = req.realIp;
    req.user.lastCC = req.headers['cf-ipcountry'] || 'XX';
    req.user.save().catch(e => {
        logger.error(e);
    });

    res.redirect('/');
}

function escapeHtml(str) {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

module.exports = (passport) => {
    function makeAuthHandler(strategy) {
        return (req, res, next) => {
            passport.authenticate(strategy, (err, user, info) => {
                if (err) return next(err);
                if (!user) {
                    const msg = encodeURIComponent(info?.message || 'Failed to log in');
                    return res.redirect(`/api/auth/failure?error=${msg}`);
                }
                req.logIn(user, (err) => {
                    if (err) return next(err);
                    afterlogin(req, res);
                });
            })(req, res, next);
        };
    }
    
    // Google
    router.get('/google', passport.authenticate('google', { scope: ['email'] }));
    router.get('/googleCallback', makeAuthHandler('google'));

    // Discord
    router.get('/discord', passport.authenticate('discord', { scope: ['identify', 'email'] }));
    router.get('/discordCallback', makeAuthHandler('discord'));

    // VK
    router.get('/vk', passport.authenticate('vkontakte', { scope: ['email'] }));
    router.get('/vk/return', makeAuthHandler('vkontakte'));

    // Failure
    router.get('/failure', (req, res) => {
        const msg = req.query.error
            ? escapeHtml(decodeURIComponent(req.query.error))
            : 'Failed to log in. Try again or make a cake';
        res.set({ 'Content-Type': 'text/html; charset=utf-8' });
        res.status(200).send(msg);
    });

    router.get('/logout', logout);

    return router;
};