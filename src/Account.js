const ROLES = {
    BANNED: 0,
    USER: 1,
    TRUSTED: 2,
    GOROX: 3
}

class Account{
    constructor(config){
        this.id = 0 // todo
        this.verified = false;
        this.role = ROLES.USER;

        this.authId = null;
        this.authKey = null;

        this.creationDate = null;

        this.ip = null;

        this.isGuest = false;

        Object.assign(this, config); // copy account config
    }
}

module.exports = Account;