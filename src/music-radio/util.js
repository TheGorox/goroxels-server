const { spawn } = require('child_process');

const fsp = require('fs/promises');
const path = require('path');
const crypto = require('crypto');
const os = require('os');

const logger = require('../logger')('RADIO/UTIL', 'info');

const PROC_TIMEOUT = 20e3;
async function spawnWithPipe(command, processArguments, bufferToPipe){
    return new Promise((res, rej) => {
        const globalTimeout = setTimeout(() => {
            cleanup();
            rej('process timeout');
        }, PROC_TIMEOUT);
    
        const proc = spawn(command, processArguments);
    
        let dataArr = [];
        proc.stdout.on('data', data => {
            dataArr.push(data);
        });
        proc.stdout.on('end', () => {
            if(!dataArr.length) return;

            cleanup();
            res(Buffer.concat(dataArr));
        });
    
        let errDataArr = [];
        proc.stderr.on('data', data => {
            errDataArr.push(data);
        });
        proc.stderr.on('end', () => {
            if(!errDataArr.length) return;

            cleanup();
            rej(Buffer.concat(errDataArr).toString());
        });

        // i don't know how, i don't know why
        // it causes EOF error but both sockets working normally
        proc.on('error', (e) => {
            if(e.code !== 'EOF'){
                cleanup();
                rej(e);
            }
        });

        proc.once('exit', () => {
            res(null);
        })

        if(bufferToPipe){
            proc.stdin.write(bufferToPipe);
            proc.stdin.end();
        }
    
        function cleanup(){
            clearTimeout(globalTimeout);
            if(!proc.killed && proc.connected){
                try {
                    proc.removeAllListeners();
                    proc.kill();
                } catch {}
            }
            proc.stdin.removeAllListeners();
            proc.stderr.removeAllListeners();
        }  
    })
}

async function ffprobeTempfile(fileBuf){
    const filename = randHash();
    const filepath = path.join(os.tmpdir(), filename);

    await fsp.writeFile(filepath, fileBuf);

    try {
        const resp = await spawnWithPipe('ffprobe', [
            '-i', filepath,
            '-show_format',
            '-show_streams',
            '-select_streams', 'a',
            '-print_format', 'json',
            '-v', 'quiet',
            '-hide_banner',
        ], null);

        return resp.toString();
    } finally {
        try {
            await fsp.unlink(filepath);
        } catch (error) {
            logger.warn('Failed to remove ffprobe tempfile with error: ' + error.message);
        }
    }
}

function randHash(){
    return crypto
        .createHash('sha256')
        .update(Buffer.from(Math.random().toString()))
        .digest('hex');
}

function checkBounds(num, min, max){
    return !isNaN(num) && num >= min && num <= max
}

class GetAudioError extends Error{}
class SongExistsError extends Error{}
class SongNotExistError extends Error{}

module.exports = {
    spawnWithPipe,
    checkBounds,
    ffprobeTempfile,

    GetAudioError,
    SongExistsError,
    SongNotExistError
}