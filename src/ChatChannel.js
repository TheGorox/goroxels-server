class ChatChannel{
    constructor(id){
        this.maxLastMessages = 10;
        this.lastMessages = [];

        this.id = id;
    }

    addMessage(name, message, isServer=false){
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

class ChatMessage{
    // TODO add attachments
    constructor(name, message, isServer){
        this.name = name;
        this.message = message;
        this.isServer = isServer;
    }
}

module.exports = ChatChannel