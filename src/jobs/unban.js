const { Op, Sequelize } = require('sequelize');
const { User } = require('../db/models/User');
const Blacklist = require('../db/models/Blacklist');
const { setCache } = require('../utils/isProxy');
const Server = require('../WebsocketServer');
const logger = require('../logger')('UNBAN_JOB', 'debug');

// remove expired bans
async function unbanUsers() {
    const now = new Date();

    const toUnban = await User.findAll({
        where: {
            bannedUntil: {
                [Op.lt]: now
            },
            [Op.or]: [
                { role: 'BANNED' },
                { shadowBanned: true }
            ]
        }
    });

    if (!toUnban.length) return;

    for (const user of toUnban) {
        let needReload = false;
        if(user.shadowBanned){
            needReload = true;
        }

        user.role = 'USER';
        user.shadowBanned = false;
        user.bannedUntil = null;
        user.save().then(() => {
            if(needReload){
                Server.getInstance().closeByUser(user);
            }
        });

        logger.info(`unbanned id=${user.id}`);
    }
}
async function unbanIps() {
    const now = new Date();

    const toUnban = await Blacklist.findAll({
        where: {
            until: {
                [Op.lt]: now
            }
        }
    });

    if (!toUnban.length) return;

    for (const ip of toUnban) {
        // intentionally no await
        ip.destroy();
        setCache(ip.ip, false);

        logger.info(`unbanned ip=${ip.ip}`);
    }
}

async function unban() {
    try {
        await unbanUsers();
        await unbanIps();
    } catch (error) {
        logger.error('exception while trying to do unban:', error);
    }
}

module.exports = unban;