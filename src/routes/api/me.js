const { ROLE } = require('../../constants');
const logger = require('../../logger')('ME', 'debug');
const {proxyCheck} = require('../../utils/isProxy');

module.exports = (req, res) => {
    proxyCheck(req.realIp);
    const me = {
        registered: false,
        role: ROLE.USER
    }

    if (req.user) {
        me.registered = true;
        me.name = req.user.name;
        me.role = ROLE[req.user.role];
        me.id = req.user.id;

        if (me.role === undefined) {
            logger.warn('me.role is undefined!', JSON.stringify(me));
            me.role = ROLE.USER;
        }
    }

    res.set({
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
    });
    res.json(me);
}