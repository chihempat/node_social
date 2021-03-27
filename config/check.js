module.exports = {
    updateData: function(req, res, next) {

        f = req.user.friendsList || [];
        s = req.user.sendRequests || [];
        r = req.user.requestList || [];
        sr = [];
        rl = [];
        fr = [];
        for (i = 0; i < s.length; i++)
            sr.push(s[i].username)
        for (i = 0; i < r.length; i++)
            rl.push(r[i].username)
        for (i = 0; i < f.length; i++)
            fr.push(f[i].friendName)
        console.log(sr)
        console.log(rl)
        console.log(fr)

        next();
    },
    checkfriend: function(req, res, next) {
        if (fr.includes(req.body.username) || fr.includes(req.query.username)) {
            res.redirect('404')
        } else {
            next()
        }
    },
    checksent: function(req, res, next) {
        if (sr.includes(req.body.username) || sr.includes(req.query.username)) {
            res.redirect('404')
        } else {
            next()
        }
    },
    checkrequest: function(req, res, next) {
        if (rl.includes(req.body.username) || rl.includes(req.query.username)) {
            res.redirect('404')
        } else {
            next()
        }
    },
    check: function(req, res, next) {

        f = req.user.friendsList || [];
        s = req.user.sendRequests || [];
        r = req.user.requestList || [];
        sr = [];
        rl = [];
        fr = [];
        for (i = 0; i < s.length; i++)
            sr.push(s[i].username)
        for (i = 0; i < r.length; i++)
            rl.push(r[i].username)
        for (i = 0; i < f.length; i++)
            fr.push(f[i].friendName)

        if (fr.includes(req.body.username) || fr.includes(req.query.username)) {
            res.redirect('404')
        } else if (rl.includes(req.body.username) || rl.includes(req.query.username)) {
            res.redirect('404')
        } else if (sr.includes(req.body.username) || sr.includes(req.query.username)) {
            res.redirect('404')
        } else {
            next();
        }


    }
}