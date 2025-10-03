const crypto = require('crypto');

function randomFileName(){
    return crypto.randomBytes(8).toString('hex');
}

module.exports = {
    randomFileName
}