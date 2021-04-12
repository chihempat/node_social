module.exports = {
    ensureAuthenticated(req, res, next) {
        console.log(req.isAuthenticated());
        if (req.isAuthenticated()) {
            return next();
        }
        req.flash('error_msg', 'Please log in to view that resource');
        res.redirect('/auth/login');
    },
    forwardAuthenticated(req, res, next) {
        if (!req.isAuthenticated()) {
            return next();
        }
        res.redirect('/user');
    },
};