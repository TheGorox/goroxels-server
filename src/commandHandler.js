const readline = require('readline');
const Server = require('./WebsocketServer');
const logger = require('./logger')('COMMANDS');

// handle terminal input lines as commands
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});
rl.on('line', onLine);

function onLine(line){
    if(!line || !line.length) return;
    let args = line.split(' ');
    
    const command = args[0];
    args = args.slice(1);

    if(!command.length) return;

    try{
        handleCommand(command, args);
    }catch(e){
        logger.error('Error while handling/executing command: ')
        logger.error(e);
    }
}

function handleCommand(command, args){
    command = command.toUpperCase();
    switch(command){
        // for science
        case 'ILOVEFURRY': {
            console.log('Moron! Self-destruction in 3..2..1..')
            throw new Error('furfag')
            break
        }
        // send server message
        case 'MESSAGE': {
            if(args.length < 1)
                throw new Error('arguments length must be at least 1 (?channel, message)');

            let channel = null;
            if(args.length > 1){
                const channelId = args[0];
                channel = Server.getInstance().channels[channelId];
                if(!channel)
                    throw new Error(`channel ${channelId} does not exists`);
                args = args.slice(1);
            }

            let message = args.join(' ');
            if(!channel){
                message = '[GLOBAL] ' + message;
            }

            if(!message.length)
                throw new Error('message is empty');

            Server.getInstance().sendServerMessage(message, channel);

            logger.info('Sent server message');
            break
        }
        // purge chat channel
        case 'PURGE': {
            if(args.length < 1)
                throw new Error('arguments length must be at least 1 (channel)');
            const channelId = args[0];
            const channel = Server.getInstance().channels[channelId];
            if(!channel)
                throw new Error(`channel ${channelId} does not exists`);

            channel.lastMessages = [];
            Server.getInstance().sendServerMessage('This chat has been purged.', channel);

            logger.info(`Channel ${channelId} purged`);
            break
        }
        // force players to reload
        case 'RELOAD': {
            const canvasName = args[0];
            const canvases = global.canvases;
            const canvas = canvases.find(x => x.name === canvasName);

            if(canvasName && !canvas)
                throw new Error(`canvas with name "${canvasName}" does not exist`);

            Server.getInstance().broadcastReload(canvas);
            break
        }
        case 'MOTD': {
            if(args.length < 1)
                throw new Error('arguments length must be at least 1 (message)');

            let message = args.join(' ');

            if(!message.length)
                throw new Error('message is empty');

            if(message === 'reset'){
                Server.getInstance().MOTD = null;    
                logger.info('Reset motd');
                break
            }

            Server.getInstance().MOTD = message;

            logger.info('Set motd to ' + message);
            break
        }
    }
}