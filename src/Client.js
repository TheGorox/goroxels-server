let lastId = 0;
// todo replace it with.. something

const {
    STRING_OPCODES
} = require('./protocol')

const CLIENT_STATES = {
    CANVAS_NOT_CHOSEN: 0,
    CAPTCHA: 1,
    READY: 2
}

class Client{
    constructor(socket){
        this.socket = socket;

        this.canvas = null;

        this.state = 0;

        this.id = ++lastId;
    }

    send(message){
        this.socket.send(message);
    }

    sendError(message){
        const str = JSON.stringify([STRING_OPCODES.error, message]);
        this.socket.send(str);
    }
}

module.exports = Client