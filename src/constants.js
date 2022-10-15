const SECOND = 1000,
    MINUTE = SECOND * 60,
    HOUR = MINUTE * 60,
    DAY = HOUR * 24,
    WEEK = DAY * 7,
    MONTH = DAY * 30;

const ROLE = {
    BANNED: -1,
    GUEST: 0,
    USER: 1,
    TRUSTED: 2,
    MOD: 3,
    ADMIN: 4
}

const ROLE_I = {};
Object.keys(ROLE).forEach(x => ROLE_I[ROLE[x]] = x);

const chatBucket = {
    USER: [2000, 3],
    TRUSTED: [1000, 4],
    MOD: [500, 5],
    ADMIN: [0, 32],
}

module.exports = {
    SECOND,
    MINUTE,
    HOUR,
    DAY,
    WEEK,
    MONTH,

    ROLE,
    ROLE_I,

    chatBucket
}