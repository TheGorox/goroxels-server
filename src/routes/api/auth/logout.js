const logger = require('../../../logger')('API', 'debug');

module.exports = (req, res) => {
    if(req.user){
        req.logout(err => {
            if(err){
                logger.error(err);
                return res.error('Internal server error on logout');
            }

            res.json({
                success: true
            })
        });
    }else{
        res.error('You are not logged in!');
    }
};