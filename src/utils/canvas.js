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

module.exports = {
    checkCanvasConditions
}