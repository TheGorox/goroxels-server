const nodeCleanup = require('node-cleanup');

// supports only user cancel (ctrl+c, sigint) but not process.exit()/errors/etc
// others does not support async, anyways better than nothing

let cleaningUp = false;
nodeCleanup((exitCode, signal) => {
    if(signal !== 'SIGINT') return true;
    if(cleaningUp) return;
    (async () => {
        cleaningUp = true
        console.log('Cleaning up...')
        let canvases;
        if(canvases=global.canvases){
            for(let canvas of canvases){
                await canvas.chunkManager.saveAll();
            }
        }
        console.log('Cleanup done!')
        process.kill(process.pid, signal);
    })();

    nodeCleanup.uninstall(); // Unregister the nodeCleanup handler.
    return false;
});

async function sleep(ms){return new Promise((res, rej) => setTimeout(res, ms))}