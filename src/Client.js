const EventEmitter = require('events');

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

class Client extends EventEmitter{
    constructor(socket){
        super();
        
        this.socket = socket;
        this.bucket = null;

        this.canvas = null;

        this.id = ++lastId;

        this.user = null;   
        
        this.__state = 0;
    }

    set state(value){
        this.__state = value;

        this.emit('statechange', this.__state);
    }

    get state(){
        return this.__state;
    }

    setCanvas(canvas){
        this.canvas = canvas;
    }

    send(message){
        this.socket.send(message);
    }

    sendError(message){
        const str = JSON.stringify([STRING_OPCODES.error, message]);
        this.socket.send(str);
    }
}

module.exports =  {
    Client,
    CLIENT_STATES
}