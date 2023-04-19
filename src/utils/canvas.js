const logger = require("./logger");
const { checkRole } = require("./role");

function checkCanvasConditions(user, condition) {
    let splitted = condition.split(' '),
        reqName = splitted[0],
        reqArgs = splitted.slice(1);

    if(checkRole(user, 'ADMIN')) return true;

    switch (reqName) {
        case 'user':
            return !!user
        case 'id': {
            if (!user) return false;
            return reqArgs.some(id => id == user.id);
        }
        case 'role': {
            if (!user) return false;
            return checkRole(user, reqArgs[0]);
        }
        default:
            logger.warn('checkCanvasConditions unknown condition: ' + condition)
            return true
    }
}

function applyProtectMask(startX, startY, canvasId, maskObj){
    const canvas = global.canvases[canvasId];
    
    if(!canvas){
        throw new Error(`Canvas with id ${canvasId} not found in global.canvases`);
    }

    const {
        width, height, mask
    } = maskObj;

    const maxX = Math.min(startX + width, canvas.realWidth);
    const maxY = Math.min(startY + height, canvas.realHeight);
    for(let i = 0; i < width*height; i++){
        const maskX = i % width;
        const maskY = i / width | 0;

        const absX = startX + maskX;
        const absY = startY + maskY;
        if(absX >= maxX || absY >= maxY){
            continue
        }

        const flag = !!mask[i];
        canvas.chunkManager.setPixelProtected(absX, absY, flag);
    }
}

module.exports = {
    checkCanvasConditions,
    applyProtectMask
}