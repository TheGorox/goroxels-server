class ChatMessage{
    static deserialize(obj){
        return new ChatMessage(obj.name, obj.message, obj.isServer);
    }

    constructor(name, message, isServer){
        this.name = name;
        this.message = message;
        this.isServer = isServer;
    }

    serialize(){
        const props = {
            name: this.name,
            message: this.message,
            isServer: this.isServer,
        }

        return props;
    }
}

module.exports = ChatMessage