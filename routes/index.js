const express = require('express');
const router = express.Router();
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');



router.use('/', forwardAuthenticated, (req, res, next) => {
    res.render('welcome', { user: req.user, message: [] })
})


module.exports = router;