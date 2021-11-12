const logger = require('./logger');

// hello hf

function getHostFromRequest(req) {
    const { headers } = req;
    const host = headers['x-forwarded-host'] || headers.host;
    const proto = headers['x-forwarded-proto'] || 'http';

    return `${proto}://${host}`;
}

function getIPFromRequest(req) {
    if (process.env.USE_CF_CONIP != '0') {
        const ip = req.headers['cf-connecting-ip'];
        if (ip) {
            return ip;
        }
    }
    
    const { socket, connection } = req;

    let conip = (connection ? connection.remoteAddress : socket.remoteAddress);
    conip = conip || '0.0.0.1';

    return conip;
}

function getIPv6Subnet(ip) {
    if (ip.includes(':')) {
        const ipv6sub = `${ip.split(':').slice(0, 4).join(':')}:0000:0000:0000:0000`;
        return ipv6sub;
    }
    return ip;
}

module.exports = {
    getHostFromRequest,
    getIPFromRequest,
    getIPv6Subnet
}