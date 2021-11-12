const express = require('express');

const logger = require('../../../logger')('API', 'debug');
const adminLogger = require('../../../logger')('admin');

const Blacklist = require('../../../db/models/Blacklist');
const Whitelist = require('../../../db/models/Whitelist');
const { getIPv6Subnet } = require('../../../utils/ip');
const { setCache, clearCache } = require('../../../utils/isProxy');

const router = express.Router();

const roleRequired = require('../../../utils/roleRequired');
const Server = require('../../../WebsocketServer');

function error(res, error) {
    res.json({
        success: false,
        errors: [error]
    })
}

router.use(roleRequired.admin);

router.post('/', async (req, res) => {
    const { action, ips } = req.body;

    const errors = [];

    if (action === undefined || typeof action !== 'string' 
        || !['whitelist','blacklist','unwhitelist','unblacklist'].some(x => x==action))
            return error(res, 'Invalid action');
    if (ips === undefined || !Array.isArray(ips) || !ips.length) return error(res, 'Invalid ip list');

    adminLogger.info(`${req.user.name}[id${req.user.id}] ${action}ing ${ips.length} ips`);

    for (let ip of ips) {
        // вот почему я не даю админку всем подряд
        if (!ip || typeof ip !== 'string' || ip.length<8) {
            errors.push('Could not parse ip ' + ip);
            continue
        }

        ip = getIPv6Subnet(ip);

        switch (action) {
            case 'whitelist':
                await whitelist(ip)
                break
            case 'unwhitelist':
                await unwhitelist(ip)
                break
            case 'blacklist':
                await blacklist(ip)
                break
            case 'unblacklist':
                await unblacklist(ip)
                break
            default:
                logger.warn('Unknown action: ' + action + ' on admin/ip.js (unbeliveable)')
                return error(res, 'Unknown action: ' + action);
        }
    }

    res.json({
        success: true,
        errors
    })
})

async function whitelist(ip){
    await Whitelist.findOrCreate({
        where: { ip }
    });
    setCache(ip, false);
}
async function unwhitelist(ip){
    await Whitelist.destroy({
        where: { ip }
    });
    clearCache(ip);
}
async function blacklist(ip){
    await Blacklist.findOrCreate({
        where: { ip }
    })
    setCache(ip, true);
    // close all instances from this ip
    const server = Server.getInstance();
    server.closeByIp(ip);
}
async function unblacklist(ip){
    await Blacklist.destroy({
        where: { ip }
    });
    clearCache(ip);
}

module.exports = router