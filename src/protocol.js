const {
    packPixel
} = require('./utils')

const OPCODES = {
    chunk: 0x0,
    place: 0x1,
    online: 0x2,
    canvas: 0x3
}

const STRING_OPCODES = {
    error: 'e',
    userJoin: 'u',
    userLeave: 'l'
}

const createPacket = {
    chunkSend: (x, y, compressedData) => {
        // Warning: max x/y cord is 0xFF=255
        // to increase, change data type from uint8 to uint16
        const buf = Buffer.allocUnsafe(1 + 1 + 1 + compressedData.byteLength);
        buf.writeUInt8(OPCODES.chunk, 0);
        buf.writeUInt8(x, 1);
        buf.writeUInt8(y, 2);
        buf.set(compressedData, 3);

        return buf
    },
    pixelSend: (x, y, col, uid) => {
        const buf = Buffer.allocUnsafe(1 + 3 + 3 + 1 + 4);
        buf.writeUInt8(OPCODES.place, 0);
        buf.writeUInt32BE(packPixel(x, y, col), 1);
        buf.writeUInt32BE(uid, 5);

        return buf
    },
    online: (count) => {
        const buf = Buffer.allocUnsafe(1 + 2);
        buf.writeUInt8(OPCODES.online, 0);
        buf.writeUInt16BE(count, 1);

        return buf
    }
}

module.exports = {
    OPCODES,
    STRING_OPCODES,
    createPacket
}