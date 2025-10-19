const { createHash } = require('node:crypto');

function sha256(data, bytes = 16) {
    const buf = Buffer.isBuffer(data) ? data : Buffer.from(data);
    return createHash('sha256').update(buf).digest().subarray(0, bytes).toString('hex');
}

module.exports = {
    sha256
}