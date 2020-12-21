const expressSession = require('express-session');
const Store = require('connect-session-sequelize')(expressSession.Store);

const sequelize = require('./db/index');
const {
    MONTH
} = require('./constants');

const session = expressSession({
    name: 'goroxels.session',

    secret: process.env.SESSION_SECRET || 'YOUR SECRET HERE',
    store: new Store({
        db: sequelize
    }),

    resave: false,
    saveUninitialized: false,
    cookie: {
        path: '/',
        httpOnly: true,
        secure: false,
        maxAge: MONTH,
    },
})

module.exports = session