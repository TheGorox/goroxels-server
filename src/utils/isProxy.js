const proxiedRequest = require('./proxiedRequest');

const { getIPv6Subnet } = require('./ip');
const Blacklist = require('../db/models/Blacklist');
const Whitelist = require('../db/models/Whitelist');
const { HOUR, DAY } = require('../constants');
const logger = require('./logger');

async function getProxyCheck(ip) {
    const url = `http://proxycheck.io/v2/${ip}?risk=1&vpn=1&asn=1`;
    const response = await proxiedRequest(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.100 Safari/537.36',
        },
    });
    if (response.status !== 200) {
        const text = response.statusText;
        throw new Error(`proxycheck not ok ${response.status}/${text}`);
    }
    const data = response.data;

    logger.info('proxycheck is proxy?', data);
    return data.status === 'ok' && data[ip].proxy === 'yes';
}

async function isBlacklisted(ip) {
    const count = await Blacklist
        .count({
            where: {
                ip,
            },
        });
    return count !== 0;
}

async function isWhitelisted(ip) {
    const count = await Whitelist
        .count({
            where: {
                ip,
            },
        });
    return count !== 0;
}

async function withoutCache(doNotCheck, ip) {
    if (!ip) return true;
    const ipKey = getIPv6Subnet(ip);
    if (await isWhitelisted(ipKey)) {
        return false;
    }
    if (await isBlacklisted(ipKey)) {
        return true;
    }
    if (doNotCheck) return false;

    const result = await getProxyCheck(ip);
    return result;
}

let lock = 4;
const checking = [];
const checked = {};

function setCache(ipKey, result) {
    checked[ipKey] = [result, Date.now() + (DAY * 6)];
}
function clearCache(ipKey) {
    delete checked[ipKey];
}

function withCache(doNotCheck, ip, deferredCB) {
    if (!ip || ip === '0.0.0.1') return true;

    const ipKey = getIPv6Subnet(ip);
    let cached = checked[ipKey];
    if (cached) {
        return cached[0];
    }
    logger.debug('PROXYCHECK fetch isproxy not from cache %s', ipKey);

    // TODO залей всё на сайт и протестируй с внешним ip

    if (checking.indexOf(ipKey) === -1 && lock > 0) {
        lock -= 1;
        checking.push(ipKey);
        withoutCache(doNotCheck, ip)
            .then((result) => {
                checked[ipKey] = [result, Date.now() + (DAY * 6)];

                const pos = checking.indexOf(ipKey);
                if (~pos) checking.splice(pos, 1);
                lock += 1;

                deferredCB && result && deferredCB();
            })
            .catch((error) => {
                logger.error('PROXYCHECK withCache %s', error.message || error);
                const pos = checking.indexOf(ipKey);
                if (~pos) checking.splice(pos, 1);
                lock += 1;
            });
    }
    return false;
}

// clear outdated cached proxies
setInterval(() => {
    const toDelete = [];
    for (let key of Object.keys(checked)) {
        const expires = checked[key][1]
        if (Date.now() > expires) {
            toDelete.push(key);
        }
    }

    toDelete.forEach(key => {
        delete checked[key]
    })
}, HOUR)

function cheapDetector(ip, cb = null) {
    if (process.env.USE_PROXYCHECK == '1') {
        return withCache(false, ip, cb);
    }
    return withCache(true, ip, cb);
}

module.exports =
{
    proxyCheck: cheapDetector,
    setCache, clearCache
}