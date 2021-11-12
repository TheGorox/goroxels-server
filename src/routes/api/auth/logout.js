module.exports = (req, res) => {
    if(req.user){
        req.logout();
        res.json({
            success: true
        })
    }else{
        res.error('You are not logged in!');
    }
};