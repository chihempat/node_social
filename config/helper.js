/* eslint-disable func-names */
/* eslint-disable no-param-reassign */
const bcrypt = require('bcryptjs');

module.exports = {
    getHash: function (req, res, newUser) {
        console.log('1');
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(newUser.password,
                salt,
                (err, hash) => {
                    console.log('2');
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
    },
};