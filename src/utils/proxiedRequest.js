const axios = require('axios').default;
const HttpProxyAgent = require('http-proxy-agent');
const SocksProxyAgent = require('http-proxy-agent');
const fs = require('fs');
const EOL = require('os').EOL;
const logger = require('./logger');

let proxies = fs.readFileSync(__dirname + '/../../proxies.txt');
proxies = proxies.toString().split(EOL)
proxies = proxies.map(parseProxy).filter(x => x !== null);

// TODO leave HTTP proxies only
// other protocols does not
// going through the checks

// does not actually check
// proxies for validity
function parseProxy(proxy) {
    try {
        let proto, hostport, host, port,
            object = {};
        if (!proxy.match('://')) {
            proto = 'http';
            hostport = proxy
        } else {
            [proto, hostport] = proxy.split('://');
        }
        if (!hostport.match(':')) {
            [host, port] = [hostport, 80]
        } else {
            [host, port] = hostport.split(':');
        }

        if (proto === 'http') {
            object.type = 'http'
        } else if (proto === 'socks4') {
            object.type = 'socks4'
        } else if (proto === 'socks5') {
            object.type = 'socks5'
        } else {
            logger.warn('Unknown proxy protocol: ' + proto);
            return null;
        }

        if (host.length < 7 || host.length > 15) {
            return null;
        }

        object.full = proto + '://' + host + ':' + port;
        object.host = host;
        object.port = port;

        return object
    } catch (e) {
        logger.error('ProxyParse: ' + e);
        return null
    }
}

function getRandomProxy() {
    return proxies[Math.random() * proxies.length | 0]
}

function createProxyAgent(proxy) {
    let agent;
    switch (proxy.type) {
        case 'http':
            agent = new HttpProxyAgent(proxy.full);
            break
        case 'socks4':
        case 'socks5':
            agent = new SocksProxyAgent(proxy.full);
            break
        default:
            agent = undefined;
    }
    return agent
}

async function proxiedRequest(url, options = {}) {
    let agent;
    if (proxies.length) {
        const proxy = getRandomProxy();
        agent = createProxyAgent(proxy);
    }

    return await axios(url, {
        ...options,
        httpAgent: agent,
        httpsAgent: agent,
    })
}

module.exports = proxiedRequest