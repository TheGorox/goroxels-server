const svgCaptcha = require('ppfun-captcha');
const { ROLE, MINUTE, SECOND } = require('./constants');
const logger = require('./logger')('CAPTCHA', 'debug');
const { checkRole } = require('./utils/role');
const config = require('./config');
const { randint } = require('./utils');

const CAPTCHA_ALLOWANCE_TIME = 30*MINUTE;

// ip -> { svg, text, allowanceExpires }
// allowanceExpires is time when user 
// will need to solve captcha again
const captchas = {};

function generateCaptcha(){
    return svgCaptcha.create({
        size: randint(3, 4+1),
        background: '#00000000',
        stroke: 'white',
        style: 'stroke-width: 2px;',
        connectionPathDeviation: 15
    });
}

function needCaptcha(ip, client=null){
    if(!config.captchaEnabled) return false;

    if(client && client.user && checkRole(client.user, ROLE.TRUSTED)){
        // return false
    }

    if(!captchas[ip]) return true;

    if(captchas[ip].allowanceExpires < Date.now()) return true

    return false
}

function updateCaptcha(ip){
    const generated = generateCaptcha();

    let captcha = captchas[ip] || {}

    captcha.svg = generated.data;
    captcha.text = generated.text;
    captcha.allowanceExpires = 0;

    captchas[ip] = captcha
}

function getCaptcha(req){
    if(!config.captchaEnabled) return '';

    const ip = req.realIp;
    updateCaptcha(ip);

    return captchas[ip].svg
}

const similar = [
    ['I', 'l'],
    ['l', 'i'],
    ['i', 'j'],
    ['0', 'O'],
    ['0', 'o']
]

function equal(c, uc){
    if(uc.toLowerCase() === c.toLowerCase()) return true


    for(let [sim1, sim2] of similar){
        if((c === sim1 && uc === sim2) || (c === sim2 && uc === sim1)){
            return true
        }
    }

    return false
}

function checkAnswer(uText, text){
    if(uText.length != text.length) return false;

    for(let i = 0; i < text.length; i++){
        const uc = uText[i],
            c = text[i];

        if(!equal(c, uc)) return false
    }

    return true
}

function solveAttempt(req){
    if(!config.captchaEnabled) return true;
    
    const ip = req.realIp;

    if(!captchas[ip]){
        logger.warn(ip + ' tried to solve captcha w/o its existance')
        return false
    }else{
        const captcha = captchas[ip];

        const uText = req.body.answer;
        const text = captcha.text;

        if(checkAnswer(text, uText)){
            captcha.allowanceExpires = Date.now() + CAPTCHA_ALLOWANCE_TIME;
            captcha.svg = captcha.text = null;

            return true
        }else{
            updateCaptcha(ip);

            return false
        }
    }
}

module.exports = {
    needCaptcha,
    getCaptcha,
    solveAttempt
}