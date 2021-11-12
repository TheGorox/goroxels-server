const EventEmitter = require('events');

let lastId = 0;
// todo replace it with.. something

const {
    STRING_OPCODES,
    OPCODES
} = require('./protocol');

const logger = require('./logger')('CLIENT', 'debug');

const CLIENT_STATES = {
    CANVAS_NOT_CHOSEN: 0,
    CAPTCHA: 1,
    READY: 2
}

class Client extends EventEmitter{
    constructor(socket){
        super();
        
        this.socket = socket;
        this.bucket = null;

        this.canvas = null;

        this.id = ++lastId;

        this.user = null;

        this.joinTime = 0;
        this.isAlive = true;

        this.subscribedChs = [];
        this.chatBuckets = {};

        this.socket.on('pong', () => {
            this.heartbeat();
        })
    }

    setCanvas(canvas){
        this.canvas = canvas;
    }

    send(message){
        this.socket.send(message);
    }

    sendError(message){
        const str = JSON.stringify({c: STRING_OPCODES.error, errors: [message]});
        this.send(str);
    }

    sendCaptcha(){
        let buf = Buffer.allocUnsafe(1);
        buf.writeUInt8(OPCODES.captcha, 0);

        this.send(buf);
    }

    kill(){
        this.socket.close();
    }

    ping(){
        this.socket.ping();
        this._pingTime = Date.now();
    }

    heartbeat(){
        this.isAlive = true;
    }
}

module.exports =  {
    Client,
    CLIENT_STATES
}