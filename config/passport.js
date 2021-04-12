const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');

// Load User model
// eslint-disable-next-line import/no-unresolved
const User = require('../models/User');

module.exports = (passport) => {
    passport.use(
        new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
            // Match user
            User.findOne({
                email: email,
            }).then((user) => {
                if (!user) {
                    return done(null, false, { message: 'That email is not registered' });
                }
                console.log('In local Strattegy');
                // Match password
                bcrypt.compare(password, user.password, (err, isMatch) => {
                    if (err) throw err;
                    if (isMatch) {
                        console.log('Matched');

                        return done(null, user);
                    }
                    console.log('not Matched');
                    return done(null, false, { message: 'Password incorrect' });
                });
            }).catch((err) => console.log(err));
        }),
    );

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser((id, done) => {
        User.findById(id, (err, user) => {
            done(err, user);
        });
    });
};