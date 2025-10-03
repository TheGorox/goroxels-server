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
        const ip = req.headers['x-real-ip'] || req.headers['cf-connecting-ip'];
        if (ip) {
            return ip;
        }
    }

    const { socket, connection } = req;

    let conip = (connection ? connection.remoteAddress : socket.remoteAddress);
    conip = conip || '0.0.0.1';

    if (conip.substr(0, 7) == "::ffff:") {
        conip = conip.substr(7)
    }

    return conip;
}

function getIPv6Subnet(ip) {
    if (ip.includes(':')) {
        const ipv6sub = `${ip.split(':').slice(0, 4).join(':')}:0000:0000:0000:0000`;
        const ipv6norm = normalizeIpv6(ipv6sub);
        return ipv6norm;
    }
    return ip;
}

function ipToInt(ip) {
    let int;
    if (ip.includes(':')) {
        const v6norm = ip;
        const v6sub = v6norm.split(':').slice(0, 4);
        // https://stackoverflow.com/questions/73550834/ip-address-to-int
        int = v6sub.map(str => Number('0x' + str)).reduce(function (int, value) { return BigInt(int) * BigInt(65536) + BigInt(+value) });
    } else {
        const octets = ip.split('.').map(x => +x);
        int = octets.reduce((sum, cur) => { return ((sum << 8) + cur) >>> 0 });
    }

    return int
}

function int2ipv4(int) {
    const first = (int >> 24) & 255,
        second = (int >> 16) & 255,
        third = (int >> 8) & 255,
        fourth = int & 255;

    return `${first}.${second}.${third}.${fourth}`
}

function int2ipv6subnet(bigint) {
    let first = (bigint >> 48n) & 0xffffn,
        second = (bigint >> 32n) & 0xffffn,
        third = (bigint >> 16n) & 0xffffn,
        fourth = bigint & 0xffffn;

    first = first.toString(16);
    second = second.toString(16);
    third = third.toString(16);
    fourth = fourth.toString(16);

    const v6sub = `${first}:${second}:${third}:${fourth}:0000:0000:0000:0000`;
    const v6subNorm = normalizeIpv6(v6sub);
    return v6subNorm
}

// copied from open source
function normalizeIpv6(a) {
    const nh = a.split(/\:\:/g);
    if (nh.length > 2) {
        throw new Error('Invalid address: ' + a);
    }

    let sections = [];
    if (nh.length === 1) {
        // full mode
        sections = a.split(/\:/g);
        if (sections.length !== 8) {
            throw new Error('Invalid address: ' + a);
        }
    } else if (nh.length === 2) {
        // compact mode
        const n = nh[0];
        const h = nh[1];
        const ns = n.split(/\:/g);
        const hs = h.split(/\:/g);
        for (let i in ns) {
            sections[i] = ns[i];
        }
        for (let i = hs.length; i > 0; --i) {
            sections[7 - (hs.length - i)] = hs[i - 1];
        }
    }
    for (let i = 0; i < 8; ++i) {
        if (sections[i] === undefined) {
            sections[i] = '0000';
        }
        sections[i] = _leftPad(sections[i], '0', 4);
    }
    return sections.join(':');

    function _leftPad(d, p, n) {
        const padding = p.repeat(n);
        if (d.length < padding.length) {
            d = padding.substring(0, padding.length - d.length) + d;
        }
        return d;
    };
};

module.exports = {
    getHostFromRequest,
    getIPFromRequest,
    getIPv6Subnet,
    ipToInt,
    int2ipv4,
    int2ipv6subnet
}