const express = require('express');

const router = express.Router();

const logger = require('../../../logger')('AUTH');

function afterlogin(req, res){
    req.user.lastIp = req.ip;
    req.user.save().catch(e => {
        logger.error(e);
    });

    res.redirect('/');
}

module.exports = (passport) => {
    router.get('/facebook', passport.authenticate('facebook', {
        scope: ['email']
    }));
    router.get('/facebookCallback', passport.authenticate('facebook', {
        failureRedirect: '/api/auth/failure',
        failureFlash: true,
        // successRedirect: '/',
    }), afterlogin);

    router.get('/discord', passport.authenticate('discord', {
        scope: ['identify', 'email']
    }));
    router.get('/discordCallback', passport.authenticate('discord', {
        failureRedirect: '/api/auth/failure',
        failureFlash: true,
        // successRedirect: '/',
    }), afterlogin);

    router.get('/vk', passport.authenticate('vkontakte', {
        scope: ['email']
    }));
    router.get('/vkCallback', passport.authenticate('vkontakte', {
        failureRedirect: '/api/auth/failure',
        failureFlash: true,
        // successRedirect: '/',
    }), afterlogin);

    router.get('/failure', (req, res) => {
        res.set({
            'Content-Type': 'text/html',
        });
        let text = null;
        if (req.session && req.session.flash) {
            text = req.session.flash.error[0];
            req.session.flash = {};
        }
        if (!text) {
            text = 'Failed to log in. Try again or make a cake';
        }
        res.status(200).send(text);
    });

    return router;
}