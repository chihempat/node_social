const express = require('express');

const router = express.Router();
const { forwardAuthenticated } = require('../config/auth');
const a = require('./auth');
const u = require('./user');

router.use('/api/auth', a);
router.use('/api/user', u);

router.use('/', forwardAuthenticated, (req, res) => {
    res.render('welcome', { user: req.user, message: [] });
});

module.exports = router;