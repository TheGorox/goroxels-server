// can be improved

const config = require('./config');
const fs = require('fs');
const path = require('path');

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

function splitByNewline(str){
    // crossplatform split
    return str.split('\r\n').join('\n').split('\n');
}

let nicknames;
if(config.generateUsernamesFromFile){
    nicknames = splitByNewline(fs.readFileSync(config.generateUsernamesFilePath).toString());
}
function randomNameGenerator(originalName){
    if(config.generateUsernamesFromFile){
        return nicknames[Math.random()*nicknames.length|0]
    }else{
        return originalName.substr(0, 15) + '-' + Math.random().toString(36).substr(2, 10)
    }
}

function getFancyDate(){
    const date = new Date();
    let str = '';

    const day = date.getUTCDate();
    str += padDate(day) + '.';

    const month = date.getUTCMonth() + 1;
    str += padDate(month) + '.';

    const year = date.getUTCFullYear();
    str += year;

    return str
}

function getFancyTime(){
    const time = new Date();
    let str = '';

    const hrs = time.getUTCHours();
    str += padDate(hrs) + ':';

    const min = time.getUTCMinutes();
    str += padDate(min) + ':';

    const sec = time.getUTCSeconds();
    str += padDate(sec);

    return str
}

function padDate(num){
    if(num < 10) return '0' + num;
    return num
}

function randint(min, max){
    return ((Math.random() * (max - min)) + min) | 0
}

function savePublicConfig(){
    const str = JSON.stringify(config.public);
    fs.writeFileSync(path.join(__dirname, '/../data/config.json'), str);
}

module.exports = {
    packPixel,
    unpackPixel,
    randomNameGenerator,
    getFancyDate,
    getFancyTime,
    randint,

    savePublicConfig
}