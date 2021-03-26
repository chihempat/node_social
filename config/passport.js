const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const mongoose = require("mongoose");
const myKey = process.env.KEY


// Load User model
const User = require('../models/User');

module.exports = function(passport) {
    passport.use(
        new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
            // Match user
            User.findOne({
                email: email
            }).then(user => {
                if (!user) {
                    return done(null, false, { message: 'That email is not registered' });
                }
                console.log("In local Strattegy")
                    // Match password
                bcrypt.compare(password, user.password, (err, isMatch) => {
                    if (err) throw err;
                    if (isMatch) {
                        console.log("Matched")

                        return done(null, user);
                    } else {
                        console.log("not Matched")
                        return done(null, false, { message: 'Password incorrect' });
                    }
                });
            }).catch(err => console.log(err));
        })
    );

    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });
};