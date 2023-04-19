const {
    packPixel,
    unpackPixel
} = require('./utils')

const OPCODES = {
    chunk:      0x0,
    place:      0x1,
    online:     0x2,
    canvas:     0x3,
    pixels:     0x4,
    captcha:    0x5,
    ping:       0x6,
    placeBatch: 0x7
}

const STRING_OPCODES = {
    error: 'e',
    userJoin: 'u',
    userLeave: 'l',
    subscribeChat: 's',
    chatMessage: 'c',
    alert: 'a',
    me: 'm', // rn used only to get my id
    reload: 'r',
    reloadChunks: 'rc'
}

const createPacket = {
    chunkSend: (x, y, compressedData) => {
        // Warning: max x/y cord is 0xFF=255
        // to increase, change data type from uint8 to uint16 (offsets too)
        // btw max canvas coord is 4095, as designed at packPixel()
        const buf = Buffer.allocUnsafe(1 + 1 + 1 + compressedData.byteLength);
        buf.writeUInt8(OPCODES.chunk, 0);
        buf.writeUInt8(x, 1);
        buf.writeUInt8(y, 2);
        buf.set(compressedData, 3);

        return buf
    },

    pixelSendQueueBufferSize: 8,
    pixelSendEnqueue: (x, y, col, uid, targBuffer, targBufferOffset) => {
        const offs = targBufferOffset;
        targBuffer.writeUInt32BE(packPixel(x, y, col), offs);
        targBuffer.writeUInt32BE(uid, offs+4);

        return null
    },
    pixelSend: (x, y, col, uid) => {
        const buf = Buffer.allocUnsafe(1 + 4 + 4);
        buf.writeUInt8(OPCODES.place, 0);
        buf.writeUInt32BE(packPixel(x, y, col), 1);
        buf.writeUInt32BE(uid, 5);

        return buf
    },
    // pixelsSend: (pixels, uid){

    // },
    online: (count) => {
        const buf = Buffer.allocUnsafe(1 + 2);
        buf.writeUInt8(OPCODES.online, 0);
        buf.writeUInt16BE(count, 1);

        return buf
    }
}

const createStringPacket = {
    error: (...errors) => {
        return {
            c: STRING_OPCODES.error,
            errors: errors
        }
    },
    userJoin: (client) => {
        return {
            c: STRING_OPCODES.userJoin,
            nick: client.user ? client.user.name : null,
            userId: client.user ? client.user.id : null,
            id: client.id,
            registered: !!client.user,
            role: client.user ? client.user.role : null
        }
    },
    userLeave: (client) => {
        return {
            c: STRING_OPCODES.userLeave,
            id: client.id
        }
    },
    chatMessage: (message, channel) => {
        return {
            c: STRING_OPCODES.chatMessage,
            nick: message.name,
            msg: message.message,
            server: message.isServer,
            ch: channel
        }
    },
    alert(message){
        return {
            c: STRING_OPCODES.alert,
            msg: message
        }
    },
    me(id){
        return {
            c: STRING_OPCODES.me,
            id
        }
    },
    reload(){
        return {
            c: STRING_OPCODES.reload
        }
    },
    chunksReload(){
        return {
            c: STRING_OPCODES.reloadChunks
        }
    }
}

const unpackPacket = {
    pixel: (buffer) => {
        return unpackPixel(message.readUInt32BE(1))
    }
}

module.exports = {
    OPCODES,
    STRING_OPCODES,
    createPacket,
    createStringPacket,
    unpackPacket
}