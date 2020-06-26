// can be improved

const config = require('./config');
const fs = require('fs');

function packPixel(x, y, col){
    return (x << 12 | y) << 7 | col
}

function unpackPixel(num){
    return [
        num >>> 19,
        num >>> 7 & 0xFFF,
        num & 0b1111111
    ]
}

function split(str){
    // crossplatform split
    return str.split('\r\n').join('\n').split('\n');
}

let nicknames;
if(config.generateUsernamesFromFile){
    nicknames = split(fs.readFileSync(config.generateUsernamesFilePath).toString());
}
function randomNameGenerator(originalName){
    if(config.generateUsernamesFromFile){
        return nicknames[Math.random()*nicknames.length|0]
    }else{
        return originalName.substr(0, 15) + '-' + Math.random().toString(36).substr(2, 10)
    }
}

module.exports = {
    packPixel,
    unpackPixel,
    randomNameGenerator
}