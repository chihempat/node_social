const express = require('express');

const router = express.Router();
const { forwardAuthenticated } = require('../config/auth');

router.use('/', forwardAuthenticated, (req, res) => {
    res.render('welcome', { user: req.user, message: [] });
});


module.exports = router;