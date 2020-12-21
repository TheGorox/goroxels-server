const SECOND = 1000,
    MINUTE = SECOND * 60,
    HOUR = MINUTE * 60,
    DAY = HOUR * 24,
    WEEK = DAY * 7,
    MONTH = DAY * 30;

const ROLE = {
    BANNED: -1,
    USER: 0,
    TRUSTED: 1,
    MOD: 2,
    ADMIN: 3
}

module.exports = {
    SECOND,
    MINUTE,
    HOUR,
    DAY,
    WEEK,
    MONTH,

    ROLE
}