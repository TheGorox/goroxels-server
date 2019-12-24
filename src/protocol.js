const {
    packPixel
} = require('./utils')

const OPCODES = {
    chunk: 0x0, // also as getChunk on client
    place: 0x1
}

const STRING_OPCODES = {

}

const createPacket = {
    chunkSend: (x, y, compressedData) => {
        // Warning: max x/y cord is 0xFF=255
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
    }
}

module.exports = {
    OPCODES,
    STRING_OPCODES,
    createPacket
}