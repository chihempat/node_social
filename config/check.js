/* eslint-disable no-undef */
/* eslint-disable no-var */
module.exports = {
    updateData: (req, res, next) => {
        const f = req.user.friendsList || [];
        const s = req.user.sendRequests || [];
        const r = req.user.requestList || [];
        const sr = [];
        const rl = [];
        const fr = [];
        s.forEach((e) => sr.push(e.username));
        r.forEach((e) => rl.push(e.username));
        f.forEach((e) => fr.push(e.friendName));
        console.log(sr);
        console.log(rl);
        console.log(fr);
        next();
    },
    check: (req, res, next) => {
        const f = req.user.friendsList || [];
        const s = req.user.sendRequests || [];
        const r = req.user.requestList || [];
        const sr = [];
        const rl = [];
        const fr = [];
        s.forEach((e) => sr.push(e.username));
        r.forEach((e) => rl.push(e.username));
        f.forEach((e) => fr.push(e.friendName));
        if (fr.includes(req.body.username) || fr.includes(req.query.username)) {
            res.redirect('404');
        } else if (rl.includes(req.body.username) || rl.includes(req.query.username)) {
            res.redirect('404');
        } else if (sr.includes(req.body.username) || sr.includes(req.query.username)) {
            res.redirect('404');
        } else {
            next();
        }
    },
};