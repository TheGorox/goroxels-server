const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');
const crypto = require('crypto');
const { spawnWithPipe, checkBounds, GetAudioError, ffprobeTempfile } = require('./util');
const { pcmPath, tempPcmPath, infoPath } = require('./paths');

const logger = require('../logger')('RADIO', 'info');

// const pcmPath = path.join(__dirname, '../../data/radio/pcm');
// const tempPcmPath = path.join(__dirname, '../../data/radio/temp');
// const infoPath = path.join(__dirname, '../../data/radio/info');

if (!fs.existsSync(pcmPath)) {
    logger.info('PCM path not exists, creating');

    fs.mkdirSync(pcmPath, { recursive: true });
}

if (!fs.existsSync(tempPcmPath)) {
    logger.info('Temp PCM path not exists, creating');

    fs.mkdirSync(tempPcmPath, { recursive: true });
}

if (!fs.existsSync(infoPath)) {
    logger.info('Info path not exists, creating');

    fs.mkdirSync(infoPath, { recursive: true });
}

function getHash(buffer) {
    const hasher = crypto.createHash('sha256');
    hasher.update(buffer);

    const hash = hasher.digest('hex');

    return hash;
}

async function checkIsAdded(songHash) {
    return fs.existsSync(path.join(pcmPath, songHash))
}

async function getSavedSongInfo(songHash) {
    if (!checkIsAdded(songHash)) {
        throw new Error('song not found');
    }

    const songInfoPath = path.join(infoPath, songHash);
    const songInfo = JSON.parse(await fsp.readFile(songInfoPath));

    return songInfo
}

function getSongStream(songHash, isTempSong) {
    const songPcmPath = path.join((isTempSong ? tempPcmPath : pcmPath), songHash);
    const stream = fs.createReadStream(songPcmPath);
    return stream
}

async function ffprobe_getAudioInfo(audioBuffer, audioFileName) {
    const respBuf = await ffprobeTempfile(audioBuffer);    

    const json = JSON.parse(respBuf.toString());
    if (!json.format) {
        throw new GetAudioError('empty response (stream error)');
    }

    const sanProps = {};

    if (json.streams[0].codec_name !== 'mp3') {
        throw new GetAudioError('the file is not mp3 stream');
    }

    // use metadata tags if present
    if (json.format?.tags?.title && json.format?.tags?.artist) {
        sanProps.title = `${json.format?.tags?.artist} - ${json.format?.tags?.title}`.slice(0, 64);
    } else {
        sanProps.title = audioFileName.slice(0, 32);
    }

    const sampleRate = json.streams[0].sample_rate;
    if (!checkBounds(+sampleRate, 8000, 96000)) {
        throw new GetAudioError('malformed sample rate');
    }

    const bitrate = json.streams[0].bit_rate;
    if (!checkBounds(+bitrate, 32_000, 320_000)) {
        throw new GetAudioError('malformed bitrate');
    }

    // const channels = json.streams[0].channels;
    // // for some reason it is already a number
    // if (channels !== 2) {
    //     throw new GetAudioError('only 2 channel audio is supported');
    // }

    // ffmpeg will convert it to 2channel anyway
    const channels = 2;

    const duration = json.format.duration;
    if (!checkBounds(+duration, 1, 60 * 7)) {
        throw new GetAudioError('track is too short or too long (<1s or >7min)');
    }

    Object.assign(sanProps, {
        sampleRate: +sampleRate,
        bitrate: +bitrate,
        channels,
        duration: +duration
    });

    return sanProps;
}

async function addPcm(songBuffer, songInfo) {
    const { isOneTime, hash } = songInfo;

    const outPath = path.join((isOneTime ? tempPcmPath : pcmPath), hash);

    await spawnWithPipe('ffmpeg', [
        '-i', 'pipe:0',
        '-f', 's16le', // output format (signed 16bit little endian)
        '-ar', songInfo.sampleRate.toString(), // sample rate
        '-ac', '2', // number of channels (fixed 2)
        '-acodec', 'pcm_s16le', // set audio codec (again)
        '-v', 'quiet',
        '-hide_banner',
        '-y', // override existing file (though it should not be ever encountered)
        outPath
    ], songBuffer);
}

async function delPcm(songHash, isTemp){
    const pcmFilePath = path.join(isTemp ? tempPcmPath : pcmPath, songHash);
    
    // unlink and rm does not work ...
    await spawnWithPipe('rm', [pcmFilePath], null);
}

async function cliRm(){

}

async function clearTemp() {
    logger.info('Clearing temp folder...');

    const files = fs.readdirSync(tempPcmPath).map((p) => path.join(tempPcmPath, p));
    for (let file of files) {
        try {
            await fsp.unlink(file);
        } catch (error) {
            logger.error(`Cannot unlink temp file ...${file.slice(-20)}: ${error.message}`);
        }
    }
}
clearTemp();

module.exports = {
    getHash,
    getSavedSongInfo,
    ffprobe_getAudioInfo,
    addPcm,
    delPcm,
    getSongStream
}