const rateLimiter = require('express-rate-limit');

function rateLimit(generator, time, max, headers){
    const limiter = rateLimiter({
        windowMs: time,
        max: max,
        keyGenerator: generator,
        headers
    });

    return limiter;
}

const limiter = {
    byUserId({time, max, headers=true}){
        return rateLimit((req) => {
            return req.user.id
        }, time, max, headers)
    },
    byIp({time, max, headers=true}){
        return rateLimit((req) => {
            return req.realIp
        }, time, max, headers)
    },
    byIdOrIp({time, max, headers=true}){
        return rateLimit((req) => {
            return req.user ? req.user.id : req.realIp
        }, time, max, headers)
    },
    global({time, max, headers=true}){
        return rateLimit(() => null, time, max, headers)
    },
}

module.exports = {
    rateLimiter: limiter
}