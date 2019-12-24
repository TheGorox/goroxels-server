let lastId = 0;
// todo replace it with.. something

class Client{
    constructor(socket){
        this.socket = socket;

        this.id = ++lastId;
    }

    send(message){
        this.socket.send(message);
    }
}

module.exports = Client