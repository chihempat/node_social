const express = require('express');

const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const jsonwt = require('jsonwebtoken');

const key = process.env.KEY;
const LocalStrategy = require('passport-local').Strategy;

// Load User model
const { forwardAuthenticated } = require('../config/auth');

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
router.post('/register', forwardAuthenticated, (req, res) => {
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
    }

    // eslint-disable-next-line eqeqeq
    if (password != password2) {
        errors.push({ msg: 'Passwords do not match' });
    }

    if (password.length < 6) {
        errors.push({ msg: 'Password must be at least 6 characters' });
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
        User.findOne({ email }).then((user) => {
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

                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if (err) throw err;
                        newUser.password = hash;
                        newUser
                            .save()
                            .then((user) => {
                                req.flash(
                                    'success_msg',
                                    'You are now registered and can log in',
                                );
                                console.log(user);
                                res.redirect('/users/login');
                            })
                            .catch((err) => console.log(err));
                    });
                });
            }
        });
    }
});
// Login
router.post('/login', (req, res, next) => {
    console.log('in login post');
    passport.authenticate('local', {
        successRedirect: '/user/dashboard',
        failureRedirect: '/login',
        failureFlash: true,
    })(req, res, next);
});

// Logout
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/login');
});

module.exports = router;