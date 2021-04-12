const express = require('express');

const router = express.Router();
const passport = require('passport');
const { getHash } = require('../config/helper');
// const jsonwt = require('jsonwebtoken');

// const key = process.env.KEY;
// const LocalStrategy = require('passport-local').Strategy;

// Load User model
const { forwardAuthenticated } = require('../config/auth');

// eslint-disable-next-line import/no-unresolved
const User = require('../models/User');

router.get('/', forwardAuthenticated, (req, res) => {
    res.render('login');
});

// Login Page
router.get('/login', forwardAuthenticated, (req, res) => {
    res.render('login');
});

// Register Page
router.get('/register', forwardAuthenticated, (req, res) => {
    res.render('register');
});

// Register
router.post('/register', forwardAuthenticated, async (req, res) => {
    // console.trace();
    console.log('in register');
    const {
        username,
        name,
        email,
        password,
        password2,
        gender,
        age,
        bio,
        city,
        state,
        country,
    } = req.body;
    const errors = [];
    const address = [{ city, state, country }];

    console.log(address);

    if (!name || !email || !password || !password2 || !username) {
        errors.push({ msg: 'Please enter all fields' });
        console.log({ msg: 'Please enter all fields' });
    }

    // eslint-disable-next-line eqeqeq
    if (password != password2) {
        errors.push({ msg: 'Passwords do not match' });
        console.log({ msg: 'Passwords do not match' });
    }

    if (password.length < 6) {
        errors.push({ msg: 'Password must be at least 6 characters' });
        console.log({ msg: 'Password must be at least 6 characters' });
    }

    if (errors.length > 0) {
        res.render('register', {
            errors,
            username,
            name,
            email,
            password,
            password2,
            gender,
            age,
            bio,
            address,
        });
    } else {
        const user = await User.findOne({ email });
        if (user) {
            errors.push({ msg: 'Email already exists' });
            res.render('register', {
                errors,
                username,
                name,
                email,
                password,
                password2,
                gender,
                age,
                bio,
                address,
            });
        } else {
            const newUser = new User({
                username,
                name,
                email,
                password,
                gender,
                age,
                bio,
                address,
            });
            getHash(req, res, newUser);
        }
    }
});
// Login
router.post('/login', forwardAuthenticated, (req, res, next) => {
    console.log('in login post');
    passport.authenticate('local', {
        successRedirect: '/api/user/dashboard',
        failureRedirect: '/api/auth/login',
        failureFlash: true,
    })(req, res, next);
});

// Logout
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/api/auth/login');
});

module.exports = router;