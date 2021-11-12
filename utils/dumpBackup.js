const zlib = require('zlib');
const path = require('path');
const fs = require('fs');
const PNG = require('pngjs').PNG;

const CANVAS = process.argv[2] || 3;
const backupPath = path.join(__dirname, '../backup', CANVAS.toString());

const exportPath = `D:/goroxelsScreens/'${CANVAS}-${(new Date()).toISOString().replace(/:/g, '-')}`;

function parseDate(str) {
    str = str.replace(/\./g, '');
    const d = str.substr(0,2),
        m = str.substr(2,2) - 1,
        y = str.substr(4,4);

    return new Date(y,m,d);
}

let days = fs.readdirSync(backupPath);
// sort days by parsed date
days = days.sort((a, b) => parseDate(a)-parseDate(b));

function rgb2abgr(r, g, b) {
    return 0xff000000 | b << 16 | g << 8 | r;
}
function palTo32(palette){
    return palette.map(x => rgb2abgr(...x))
}

async function loadBackup(backupPath){
    const metaPath = path.join(backupPath, 'metadata');
    let meta = fs.readFileSync(metaPath).toString();
    meta = JSON.parse(meta);

    const {chunkSize,width,height} = meta;

    const pal32 = palTo32(meta.palette);

    let chunkPromises = [];
    for(let x = 0; x < width; x++){
        for(let y = 0; y < height; y++){
            chunkPromises.push(loadChunk(x, y));
        }
    }

    async function loadChunk(x, y){
        const fullPath = path.join(backupPath, `${x},${y}.dat`);
        const file = await fs.promises.readFile(fullPath);

        return new Promise((res, rej) => {
            zlib.inflate(file, (err, result) => {
                if(err) return rej(err);
                res({ x, y, data: result});
            })
        })
    }

    const chunksData = await Promise.all(chunkPromises);
    const chunks = {};
    chunksData.forEach(chunk => chunks[chunk.x + ',' + chunk.y] = chunk.data)

    const img = new PNG({
        width: width*chunkSize,
        height: height*chunkSize,
        filterType: 0
    });

    let buffer = Buffer.alloc(width*height*chunkSize*chunkSize*4)

    for(let chunkKey of Object.keys(chunks)){
        let [x, y] = chunkKey.split(',').map(x => +x);
        const chunk = chunks[chunkKey];
        const absX = x*chunkSize,
            absY = y*chunkSize;

        const w = img.width;
        let chunkI = 0;
        
        for(let y = absY; y < absY+chunkSize; y++){
            for(let x = absX; x < absX+chunkSize; x++){
                let i = (x + y*w)*4;
                buffer.writeInt32LE(pal32[chunk[chunkI++]], i);
            }
        }
        
    }

    img.data = buffer;
    
    return img
}

function padNum(number){
    return (number).toString().padStart(4, '0');
}

async function saveImage(img, path){
    img.pack();

    const stream = fs.createWriteStream(path);
    img.pipe(stream);

    return new Promise((res, rej) =>
        stream.on('close', res).on('error', rej))
}

async function main(){
    if(!fs.existsSync(exportPath))
        fs.mkdirSync(exportPath)

    let counter = 0;

    for(day of days){

        const times = fs.readdirSync(path.join(backupPath, day));
        
        for(let time of times){
            try{
                const fullPath = path.join(backupPath, day, time);

                let loadT = Date.now();
                const backupImg = await loadBackup(fullPath);
                loadT = Date.now() - loadT;
                
                const fancyName = `${padNum(counter++)} at ${day} ${time}.png`,
                    imgPath = path.join(exportPath, fancyName);

                let saveT = Date.now();
                await saveImage(backupImg, imgPath);
                saveT = Date.now() - saveT;

                console.log(`load ${loadT}ms, save ${saveT}ms, "${imgPath}"`)
                // throw new Error
            }catch(e){
                if(!e.message.match('ENOENT'))
                    throw e
                else console.error(e)
            }
        }
    }
}
main().catch(console.error)