module.exports = (req, res) => {
    const me = {
        registered: false,
        role: 'guest'
    }

    if (req.user) {
        me.registered = true;
        me.username = req.user.name;
        me.role = req.user.role;
    }

    res.set({
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
    });
    res.json(me);
}