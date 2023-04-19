const ChatMessage = require("./ChatMessage");
const ChatMessages = require("./db/models/ChatMessages");

class ChatChannel{
    constructor(name){
        this.maxLastMessages = 10;
        this.lastMessages = [];

        this.name = name;

        this._changed = false;

        this.loadFromDb();
        this.initSaver();
    }

    async loadFromDb(){
        const saved = await ChatMessages.findByPk(this.name);
        if(!saved) return;

        const entriesRaw = Buffer.from(saved.messagesJson, 'base64');
        const entriesParsed = JSON.parse(entriesRaw);
        const entriesDeserialized = entriesParsed.map(ChatMessage.deserialize);
        this.lastMessages = entriesDeserialized;
    }

    initSaver(){
        setInterval(() => {
            if(this._changed){
                this.saveToDb();
                this._changed = false;
            }
        }, 10e3);
    }

    async saveToDb(){
        const serializedMsgs = JSON.stringify(this.lastMessages.slice(-10).map(x => x.serialize()));
        const base64encodedMsgs = Buffer.from(serializedMsgs).toString('base64')
        const saved = await ChatMessages.count({
            where: { 'channelName': this.name }
        });

        if(!saved) {
            await ChatMessages.create({
                channelName: this.name,
                messagesJson: base64encodedMsgs
            });
        }else{
            await ChatMessages.update({ 'messagesJson': base64encodedMsgs }, {
                where: {
                    'channelName': this.name
                }
            });
        }
    }

    addMessage(name, message, isServer=false){
        this._changed = true;

        const cm = new ChatMessage(name, message, isServer);
        this.lastMessages.push(cm);

        if(this.lastMessages.length >= 10*2){
            this.lastMessages = this.lastMessages.slice(-10);
        }

        return cm
    }

    getMessages(){
        return this.lastMessages
    }
}

module.exports = ChatChannel