require('../dotenv');

const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');
const { spawn } = require('child_process');
const Song = require('../db/models/Song');
const { Op } = require('sequelize');
const { ffprobe_getAudioInfo, getHash, addPcm, getSongStream, delPcm } = require('./audio');
const Throttle = require('throttle');
const EventEmitter = require('events');
const { SongExistsError, SongNotExistError, spawnWithPipe } = require('./util');
const Server = require('../WebsocketServer');

const logger = require('../logger')('RADIO', 'info');

// check if ffmpeg, ffprobe (or, in future, any other required software) present and available
async function checkRequirements() {
    try {
        await spawnWithPipe('ffmpeg', ['-version']);
        await spawnWithPipe('ffprobe', ['-v', '0']);
        return true
    } catch (error) {
        return false;
    }
}

let currentSong = null;
let playingSince = null;

const broadcasterEventEmitter = new EventEmitter();

let broadcaster;
const maxClients = 10;
const clients = [];

let stuckCheckerInt = null;
function startBroadcasting(song) {
    clearInterval(stuckCheckerInt);
    
    if (broadcaster) {
        // not calling .end, because it will lead to streamEnd event
        if (!broadcaster.destroyed)
            broadcaster.destroy();
    }

    playingSince = Date.now();

    broadcaster = createStreamForSong(song);

    let lastData = Date.now();

    stuckCheckerInt = setInterval(() => {
        if(Date.now() - lastData > 5000){
            clearInterval(stuckCheckerInt);

            // known bug i have no time to fix
            // sometimes "end" event is not called
            logger.warn('DOOR STUCK! FORCE SKIPPING');
            skipSong();
        }
    }, 1000);

    broadcaster.on('data', data => {
        lastData = Date.now();
        broadcastBlock(data);
    });
    broadcaster.once('end', () => {
        broadcasterEventEmitter.emit('streamEnd');
    });

    Server.getInstance()?.broadcastRadioChange();
}

broadcasterEventEmitter.on('streamEnd', () => {
    goNextSong();
})


let _thrrr = null;
function createStreamForSong(songInfo) {
    const fsStream = getSongStream(songInfo.hash, songInfo.isOneTime);
    const throttle = new Throttle({
        bps: 2 * 2 * songInfo.sampleRate // channels*sampleSize(16bit=2byte)*sampleRate
    });

    _thrrr = throttle



    return fsStream.pipe(throttle)
}

function connectClient(socket) {
    if (clients.length > maxClients) {
        logger.warn(`maxClients exceeded(${maxClients})`);
        socket.end();
        return;
    }

    clients.push(socket);
}

function disconnectClient(socket) {
    const id = clients.indexOf(socket);
    if (~id) {
        clients.splice(id, 1);
    }
}

function broadcastBlock(buffer) {
    // we will not remove them in the iterator
    let toRemove = [];

    for (let socket of clients) {
        if (socket.closed || socket.destroyed) {
            const arrIdx = clients.indexOf(socket);
            toRemove.push(arrIdx);
            continue;
        }

        try {
            socket.write(buffer);
        } catch (error) {
            logger.error(error);
            // should we remove it in this case??
        }
    }

    // we will remove from last index to first, to prevent removing restructured parts of array
    while (toRemove.length) {
        const idx = toRemove.pop();
        clients.splice(idx, 1);
    }
}

let songQueue = [];
let defaultSongQueue = [];

function getCurrentSongInfo() {
    if (!currentSong) return null;

    const sanitizedSongInfo = {
        ...getSanitizedSongInfo(currentSong),
        startedAt: playingSince
    };

    return sanitizedSongInfo;
}

function getSanitizedSongInfo(song) {
    return {
        title: song.title,
        id: song.id,
        sampleRate: song.sampleRate,
        isTemp: song.isOneTime || false,

        duration: song.duration
    }
}

// adds a song to queue but does not add it to songlist
async function addOneTimeSong(songBuffer, fileName) {
    const info = await ffprobe_getAudioInfo(songBuffer, fileName)
    const sanInfo = {
        id: -1,

        title: info.title,
        sampleRate: info.sampleRate,
        bitrate: info.bitrate,
        duration: info.duration,
        hash: getHash(songBuffer),

        isOneTime: true
    }

    await addPcm(songBuffer, sanInfo);

    addToQueues(sanInfo, false);
}

async function checkSongExists(songHash) {
    const match = await Song.findOne({
        where: {
            hash: songHash
        }
    });

    if (match) {
        return true;
    }
    return false;
}

async function addSong(songBuffer, fileName, enqueue = false) {
    const songHash = getHash(songBuffer);
    if (await checkSongExists(songHash)) {
        throw new SongExistsError();
    }

    const info = await ffprobe_getAudioInfo(songBuffer, fileName);

    let dbEntry = Song.build({
        // id is auto-generated

        title: info.title,
        sampleRate: info.sampleRate,
        bitrate: info.bitrate,
        duration: info.duration,
        hash: songHash,
    });

    try {
        await addPcm(songBuffer, dbEntry);
    } catch (error) {
        logger.error(`Error adding/creating song's PCM (${fileName}):`);
        logger.error(error);

        // no need to .destroy it, since we didn't save it to db
        dbEntry = null;

        return false
    }

    await dbEntry.save();

    if (enqueue) {
        addToQueues(dbEntry);
        Server.getInstance().broadcastRadioChange(1);
    } else {
        // add to default queue only
        addToQueues(dbEntry, true, false);
    }

    return true
}

async function addToQueues(song, addToDefault = true, addToCurrent = true) {
    if (addToCurrent) {
        songQueue.push(song);
    }
    if (addToDefault) {
        defaultSongQueue.push(song);
    }

    Server.getInstance()?.broadcastRadioChange(1);
}

async function deleteSong(id) {
    const entry = await Song.findOne({
        where: { id }
    });

    if (!entry) {
        throw new SongNotExistError();
    }

    await entry.destroy();

    // remove song from queues before skipping, to ensure it will not go next
    removeFromQueuesById(id);

    if (currentSong && currentSong.id == id) {
        await skipSong();
    }
}

// alias for goNextSong()
async function skipSong() {
    return await goNextSong();
}

async function clearTempsongData(song) {
    await delPcm(song.hash, true);
}

async function goNextSong() {
    if (currentSong && currentSong.isOneTime) {
        let _currentSong = {
            hash: currentSong.hash
        }

        clearTempsongData(_currentSong).catch(err => {
            logger.error('Error clearing tempsong pcm data:');
            logger.error(err);
        })
    }

    let nextSong;
    if (songQueue.length) {
        nextSong = songQueue.shift();
    } else {
        nextSong = defaultSongQueue.shift();
        // add it to the end so infinite play is enabled
        defaultSongQueue.push(nextSong);
    }

    if (nextSong instanceof Song) {
        try {
            await nextSong.reload();
        } catch (error) {
            // the song was deleted and not removed from the queue for some reason
            if (error.message?.match('not exist')) {
                const id = nextSong.id;
                removeFromQueuesById(id);

                return await goNextSong();
            }
        }
    }

    currentSong = nextSong;
    if (nextSong)
        startBroadcasting(nextSong);
}

async function findSongsByTitle(title) {
    const songs = await Song.findAll({
        where: {
            title: {
                [Op.like]: `%${title}%`
            }
        },
        attributes: ['id', 'title', 'duration', 'sampleRate', 'hash'],
        limit: 10,
        order: [
            ['id', 'asc']
        ]
    });

    return songs
}

async function enqueueSongByTitle(titlePart){
    const songs = await findSongsByTitle(titlePart);
    if(!songs.length) throw new SongNotExistError();

    const song = songs[0];

    addToQueues(song, false, true);
}

async function deleteByTitle(titlePart){
    const songs = await findSongsByTitle(titlePart);
    if(!songs.length) throw new SongNotExistError();

    const song = songs[0];

    removeFromQueuesById(song.id);
    await delPcm(song.hash, false); 
    await song.destroy();
}

function cleanupQueues(){
    // remove deleted entries
    songQueue = songQueue.filter(s => s && !!s.title);
    defaultSongQueue = defaultSongQueue.filter(s => s && !!s.title);
}

function removeFromQueuesById(id, deleteFromDefault = true) {
    songQueue = songQueue.filter(s => s.id !== id);
    if (deleteFromDefault) {
        defaultSongQueue = defaultSongQueue.filter(s => s.id !== id);
    }

    Server.getInstance()?.broadcastRadioChange(1);
}

async function loadDefaultQueue() {
    const allSongs = await fetchSongs();
    defaultSongQueue = allSongs;
}

async function fetchSongs() {
    // play from newest added to oldest
    const allSongs = await Song.findAll({
        order: [
            ['id', 'DESC']
        ]
    });
    return allSongs
}

function getQueues(limit = 10) {
    cleanupQueues();

    // slices made that way, that only [limit] entries in sum will be returned,
    // giving preference to songQueue

    let songQueueSlice = songQueue.slice(0, limit);
    let defalutQueueSlice = defaultSongQueue.slice(0, Math.max(limit - songQueueSlice.length, 0));

    return {
        queue: songQueueSlice.map(getSanitizedSongInfo),
        defaultQueue: defalutQueueSlice.map(getSanitizedSongInfo)
    }
}

async function init() {
    const matchRequirements = await checkRequirements();
    if (!matchRequirements) return false;

    await loadDefaultQueue();
    await goNextSong();

    return true
}

module.exports = {
    init,
    skipSong,
    getCurrentSongInfo,
    addSong,
    addOneTimeSong,
    findSongsByTitle,
    enqueueSongByTitle,
    deleteByTitle,
    connectClient,
    disconnectClient,
    deleteSong,
    getQueues
}