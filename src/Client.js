const EventEmitter = require('events');
const ChatMessage = require('./ChatMessage');

const {
    STRING_OPCODES,
    OPCODES,
    createStringPacket
} = require('./protocol');

const logger = require('./logger')('CLIENT', 'debug');

const CLIENT_STATES = {
    CANVAS_NOT_CHOSEN: 0,
    CAPTCHA: 1,
    READY: 2
}

class Client extends EventEmitter{
    static lastId = 0;
    
    constructor(socket){
        super();
        
        this.socket = socket;
        this.bucket = null;

        this.canvas = null;

        this.id = ++Client.lastId;

        this.user = null;

        this.joinTime = 0;
        this.isAlive = true;

        this.subscribedChs = [];
        this.chatBuckets = {};

        // these are described in ChunkPlaceInfo.js
        // concretely there they are just to not determine placer flag/id
        // every time player places a pixel
        this.placeInfoFlag = 0;
        this.placeInfoNumber = 0;

        this.on('pong', () => {
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

    sendChatWarn(msg, channel){
        const chatMessage = new ChatMessage('', `[b][WARN] ${msg}[/b]`, true);
        const packet = createStringPacket.chatMessage(chatMessage, channel);
        this.send(JSON.stringify(packet));
    }

    sendChat(name, msg, channel, isServer){
        const chatMessage = new ChatMessage(name, msg, isServer);
        const packet = createStringPacket.chatMessage(chatMessage, channel);
        this.send(JSON.stringify(packet));
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
        this.send(Buffer.from([OPCODES.ping]));
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