const path = require('path');
const fs = require('fs');

/**
 * It's ez. Just a class to maintain placement info
 * flagsData is an array of flags, to determine how to read actual <data>
 * 0 = not placed yet
 * 1 = not registered, next data is u32 ip addr
 * 2 = registered, next data is u16 uid
 * 3 = not registered, ipv6 u64 ip subnet
 */
class ChunkPlaceInfo {
    constructor(canvasId, chunk) {
        this.folderPath = path.join(__dirname, `../chunkinfo/${canvasId}`);
        this.path = path.join(this.folderPath, `${chunk.x},${chunk.y}.dat`);
        this.chunk = chunk;

        this.length = this.chunk.size**2;

        this.flagsData = null;
        this.data = null;

        this.ensurePath();
    }

    ensurePath() {
        if (!fs.existsSync(this.folderPath)) {
            fs.mkdirSync(this.folderPath, { recursive: true });
        }
    }

    checkExists() {
        return fs.existsSync(this.path);
    }

    async load() {
        this.initEmpty();
        if (!this.checkExists()) {
            return
        }

        const rawData = (await fs.promises.readFile(this.path));

        let cursor = 0;
        for (let i = 0; i < this.length; i++) {
            const flag = rawData.readUInt8(cursor);
            cursor++;
            // 0 means that there is no placer yet
            if(flag === 0) continue
            let placerOffset, placer;
            switch(flag){
                case 1: { // ipv4 ip
                    placerOffset = 4;
                    placer = rawData.readUInt32BE(cursor);
                    break
                }
                case 2: { // game uuid
                    placerOffset = 2;
                    placer = rawData.readUInt16BE(cursor);
                    break
                }
                case 3: { // ipv6 ip
                    placerOffset = 8;
                    placer = rawData.readBigInt64BE(cursor);
                    break
                }
            }

            cursor += placerOffset

            this.flagsData[i] = flag;
            this.data[i] = placer;
        }
    }

    async save(){
        const len = this.length;

        const maxPossibleSize = len+(len*8);
        const outBuffer = Buffer.allocUnsafe(maxPossibleSize);

        let cursor = 0;

        for(let i = 0; i < len; i++){
            const flag = this.flagsData[i];
            const data = this.data[i];

            outBuffer.writeUInt8(flag, cursor);
            cursor++;

            switch(flag){
                case 1: {
                    outBuffer.writeUInt32BE(data, cursor);
                    cursor += 4;
                    break;
                }
                case 2: {
                    outBuffer.writeUInt16BE(data, cursor);
                    cursor += 2;
                    break;
                }
                case 3: {
                    outBuffer.writeBigUInt64BE(data, cursor);
                    cursor += 8;
                    break;
                }
            }
        }

        await fs.promises.writeFile(this.path, outBuffer.subarray(0, cursor));
    }

    initEmpty() {
        const len = this.length;
        this.flagsData = new Uint8Array(len);
        this.data = new Array(len);
    }

    setRaw(x, y, flag, data){
        const i = x + y * this.chunk.size;
        this.flagsData[i] = flag;
        this.data[i] = data;
    }

    getRaw(x, y){
        const i = x + y * this.chunk.size;
        return [
            this.flagsData[i],
            this.data[i]
        ]
    }
}

module.exports = ChunkPlaceInfo