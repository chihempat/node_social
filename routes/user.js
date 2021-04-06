const express = require('express');
const async = require('async');

const router = express.Router();

const { ensureAuthenticated } = require('../config/auth');

const {
    updateData,
    check,
} = require('../config/check');

global.fr = [];
global.rl = [];
global.sr = [];

// eslint-disable-next-line import/no-unresolved
const User = require('../models/User');

console.log(User);
//  @desc   :For sending request
//  @route :POST/sendRequest
router.post('/sendRequest', ensureAuthenticated, check, (req, res) => {
    User
        .updateOne({
            username: req.body.username,
            'requestList.userId': { $ne: req.user._id },
            'friendsList.friendId': { $ne: req.user._id },
        }, {
            $push: { requestList: { userId: req.user._id, username: req.user.username } },
        }, { new: true })
        .then((cb) => {
            if (cb) {
                console.log('in sendRequest Part two');
                User
                    .updateOne({
                        username: req.user.username,
                        'sentRequests.username': { $ne: req.body.username },
                    }, { $push: { sendRequests: { username: req.body.username } } })
                    .then((cb1) => {
                        if (cb1) {
                            console.log('REQ Sent');
                            console.log(cb1);
                            res.redirect('/search');
                        } else {
                            res.render('404');
                        }
                    }).catch((err) => console.log(err));
            } else {
                res.redirect('404');
            }
        });
});

//  @desc   :For accepting request
//  @route  :POST/acceptRequest
//  @from   :list/request
router.post('/acceptRequest', (req, res) => {
    console.log('in ar');
    User.updateOne({
        _id: req.body._id,
        'friendsList.friendId': { $ne: req.user._id },
    }, {
        $push: {
            friendsList: {
                friendId: req.user._id,
                friendName: req.user.username,
            },
        },
        $pull: {
            sendRequests: {
                username: req.user.username,
            },
        },
    }, { new: true }).then((cb) => {
        if (cb) {
            console.log('done sender part');
            console.log(cb);
            User.updateOne({
                _id: req.user._id,
                'friendsList.friendId': { $ne: req.body._id },
            }, {
                $push: {
                    friendsList: {
                        friendId: req.body._id,
                        friendName: req.body.username,
                    },
                },
                $pull: {
                    requestList: {
                        userId: req.body._id,
                        username: req.body.username,
                    },
                },
            }).then((us) => {
                if (us) {
                    console.log(us);
                    console.log('done user part');
                    res.redirect('/friends');
                } else {
                    res.redirect('404');
                }
            }).catch((err) => console.log(err));
        } else {
            res.redirect('404');
        }
    }, { new: true }).catch((err) => console.log(err));
});

// res.redirect('/dashboard');

// change to delete
//  @desc   :For dropping already sent request
//  @route :POST/dropSentRequest
//  @from  :list/sentrequests

router.post('/dropSentRequest', ensureAuthenticated, async(req, res) => {
    try {
        async.parallel([
            (callback) => {
                console.log('1');
                if (req.body.username) {
                    console.log('2');
                    User.updateOne({
                        username: req.body.username,
                        'requestList.userId': { $eq: req.user._id },
                    }, {
                        $pull: {
                            requestList: {
                                userId: req.body._id,
                                username: req.body.username,
                            },
                        },
                    }, (err, count) => {
                        console.log('3');
                        callback(err, count);
                    });
                }
            },
            (callback) => {
                console.log('4');
                if (req.body.username) {
                    console.log('5');

                    User.updateOne({
                        username: req.user.username,
                        'sendRequests.username': { $eq: req.body.username },
                    }, {
                        $pull: {
                            sendRequests: {
                                username: req.body.username,
                            },
                        },
                    }, (err, count) => {
                        console.log('6');
                        callback(err, count);
                    });
                }
            },
        ], (err, results) => {
            console.log(err);
            console.log(results);
            res.redirect('/');
        });
    } catch (err) {
        console.log(err);
    }
});
// change to delete
//  @desc   :For rejecting pending request
//  @route :POST/dropRequest
//  @from  :list/sentReuest
router.post('/dropRequest', ensureAuthenticated, async(req, res) => {
    try {
        async.parallel([
            (callback) => {
                console.log('1');
                if (req.user._id) {
                    console.log('2');
                    User.updateOne({
                        _id: req.user._id,
                        'requestList.userId': { $eq: req.body._id },
                    }, {
                        $pull: {
                            requestList: {
                                userId: req.body._id,
                                username: req.body.username,
                            },
                        },
                    }, (err, count) => {
                        console.log('3');
                        callback(err, count);
                    });
                }
            },
            (callback) => {
                console.log('4');
                if (req.user._id) {
                    console.log('5');
                    User.updateOne({
                        _id: req.body._id,
                        'sendRequests.username': { $eq: req.body.username },
                    }, {
                        $pull: {
                            sendRequests: {
                                username: req.body.username,
                            },
                        },
                    }, (err, count) => {
                        console.log('6');
                        callback(err, count);
                    });
                }
            },
        ], (err, results) => {
            console.log(err);
            console.log(results);
            res.redirect('/');
        });
    } catch (err) {
        console.log(err);
    }
});

// change to deleye
//  @desc   :For dropping friend
//  @route :POST/dropFriend
//  @from  :tables/friends
// eslint-disable-next-line no-undef
router.post('/dropFriend', ensureAuthenticated, (req, res) => {
    User
        .updateOne({
            _id: req.user._id,
        }, {
            $pull: {
                friendsList: {
                    friendId: req.body._id,
                    friendName: req.body.username,
                },
            },
        }).then((cb) => {
            if (cb) {
                console.log('Friend dropped');
                console.log(cb);
            } else {
                console.log('error');
            }
        })
        .catch((err) => { console.log(err); });
    User.updateOne({
        _id: req.body._id,
    }, {
        $pull: {
            friendsList: {
                friendId: req.user._id,
                friendName: req.user.username,
            },
        },
    }).then((cb) => {
        if (cb) {
            console.log('requestList dropped');
            console.log(cb);
            res.render('/profile');
        } else {
            console.log('error');
        }
    }).catch((err) => console.log(err));

    res.redirect('/profile');
});

// @desc   :For showing sent request
//  @route :GET/sentRequests
//  @to  :list/dropRequest
router.get('/sentRequests', ensureAuthenticated, async(req, res) => {
    const find = await User.findOne({ _id: req.user._id }).lean();
    const request = find.sendRequests;
    //  console.log(request[0].username)
    res.render('list', { List: request, route: 'dropSentRequest' });
});

// @desc   :For showing incoming request
//  @route :GET/requests
//  @to  :list/acceptsRequest
router.get('/requests', ensureAuthenticated, async(req, res) => {
    const find = await User.findOne({ _id: req.user._id }).lean();
    const request = find.requestList;
    res.render('list', { List: request, route: 'dropRequest' });
});

//  @desc   :For showing friends request
//  @route  :GET/friends
//  @to     :tables/dropFriend
router.get('/friends', ensureAuthenticated, (req, res) => {
    const { user } = req;
    console.log(user);
    User.aggregate([
        { $unwind: '$friendsList' },
        { $match: { 'friendsList.friendName': user.username } },
    ]).then((cb) => {
        if (cb) {
            console.log(cb);
            res.render('tables', { List: cb, route: 'dropFriend' });
        } else {
            res.render('404');
        }
    }).catch((err) => console.log(err));
});

//  @desc   :For showing esit page
//  @route  :GET/edit
//  @to     :edit
router.get('/edit', ensureAuthenticated, (req, res) => {
    const usr = req.user;
    res.render('edit', {
        usr,
    });
});

//  @desc   :For submitting edit page
//  @route  :POST/edit
router.post('/edit', ensureAuthenticated, updateData, (req, res) => {
    const {
        username,
        name,
        email,
        gender,
        bio,
        city,
        state,
    } = req.body;
    const address = [{ city, state }];
    User.findOneAndUpdate({ email }, {
        $set: {
            username,
            name,
            email,
            gender,
            address,
            bio,
        },
    }).then((cb) => {
        if (cb) {
            console.log(cb);
            res.render('profile');
        } else {
            res.render('partials/404');
        }
    }).catch((err) => console.log(err));
});

//  @desc   :For getiing to dashboard
//  @route  :get/dashborad
router.get('/dashboard', ensureAuthenticated, updateData, (req, res) => {
    // console.log(f)
    res.render('dashboard');
});

//  @desc   :For redirecting to profile
//  @route  :get/
router.get('/', ensureAuthenticated, (req, res) => {
    res.render('profile');
});

//  @desc   :For searchiing all memeber
//  @route  :GET/serach

router.get('/search', (req, res) => {
    User.find({}).then((cb) => {
        if (cb) {
            //  console.log(cb)
            res.render('search', { List: cb });
        } else res.render('404');
    });
});

//  @desc   :For sorting by state
//  @route  :GET/user/search/state
router.get('/search/state', (req, res) => {
    User.find({}).sort({ 'address.state': 1 }).then((cb) => {
        if (cb) {
            console.log(cb);
            res.render('search', { List: cb }).json(cb);
        } else {
            res.render('404');
        }
    }).catch((err) => { console.log(err); });
});

//  @desc   :For sorting by citty
//  @route  :GET/user/search/city
router.get('/search/city', async(req, res) => {
    const List = await User.find({}).sort({ 'address.city': 1 }).exec();
    if (List) {
        console.log(List.address);
        res.render('search', { List });
    } else {
        res.render('404');
    }
});

//  @desc   :For usersearching
//  @route  :GET/user/searchUser
// @to:     :tosomeprofile
router.get('/searchUser', ensureAuthenticated, (req, res) => {
    console.log('in search user');
    User.findOne({ username: req.query.username }).then(
        (cb) => {
            if (cb) {
                res.render('someProfile', { List: cb });
            } else res.render('404');
        },
    ).catch((err) => console.log(err));
});

//  @desc   :For usersearching
//  @route  :GET/user/user/someProfile
// @to:     :tosomeprofile
router.get('/searching', ensureAuthenticated, (req, res) => {
    User.findOne({ name: req.query.name }).then(
        (cb) => {
            if (cb) {
                res.render('someProfile', { List: cb });
            } else res.render('404');
        },
    ).catch((err) => console.log(err));
});

module.exports = router;