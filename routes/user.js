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
//  @route :POST/api/user/sendRequest
router.post('/sendRequest', ensureAuthenticated, check, async (req, res) => {
    try {
        const result1 = await User.updateOne({
            username: req.body.username,
            'requestList.userId': { $ne: req.user._id },
            'friendsList.friendId': { $ne: req.user._id },
        }, {
            $push: { requestList: { userId: req.user._id, username: req.user.username } },
        }, { new: true });
        const result2 = await User
            .updateOne({
                username: req.user.username,
                'sentRequests.username': { $ne: req.body.username },
            }, { $push: { sendRequests: { username: req.body.username } } });
        console.log(result1, result2);
        res.redirect('/api/user/sentRequests');
    } catch (err) {
        console.log(err);
        res.render('404');
    }
});

//  @desc   :For accepting request
//  @route  :POST/api/user/acceptRequest
//  @from   :list/request
router.post('/acceptRequest', async (req, res) => {
    try {
        console.log('in ar');
        const result1 = await User.updateOne({
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
        }, { new: true });

        const result2 = await User.updateOne({
            _id: req.user._id,
            'friendsList.friendId': { $ne: req.body._id },
        },
        {
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
        }, { new: true });
        console.log(result1, result2);
        res.redirect('/api/user/friends');
    } catch (err) {
        console.log(err);
        res.render('404');
    }
});

// res.redirect('/dashboard');

// change to delete
//  @desc   :For dropping already sent request
//  @route :POST/api/user/dropSentRequest
//  @from  :list/sentrequests

router.post('/dropSentRequest', ensureAuthenticated, async(req, res) => {
    try {
        async.parallel([
            async (callback) => {
                if (req.body.username) {
                    const result = await User.updateOne({
                        username: req.body.username,
                        'requestList.userId': { $eq: req.user._id },
                    }, {
                        $pull: {
                            requestList: {
                                userId: req.body._id,
                                username: req.body.username,
                            },
                        },
                    });
                    callback(result);
                }
            },
            async (callback) => {
                if (req.body.username) {
                    const result = await User.updateOne({
                        username: req.user.username,
                        'sendRequests.username': { $eq: req.body.username },
                    }, {
                        $pull: {
                            sendRequests: {
                                username: req.body.username,
                            },
                        },
                    });
                    callback(result);
                }
            },
        ], (err, results) => {
            console.log(err);
            console.log(results);
            res.redirect('/api/user/sentRequests');
        });
    } catch (err) {
        console.log(err);
        res.redirect('/api/user/sentRequests');
    }
});
// change to delete
//  @desc   :For rejecting pending request
//  @route :POST/api/user/dropRequest
//  @from  :list/sentReuest
router.post('/dropRequest', ensureAuthenticated, async(req, res) => {
    try {
        async.parallel([
            async (callback) => {
                const result = await User.updateOne({
                    _id: req.user._id,
                    'requestList.userId': { $eq: req.body._id },
                }, {
                    $pull: {
                        requestList: {
                            userId: req.body._id,
                            username: req.body.username,
                        },
                    },
                });
                callback(result);
            },
            async (callback) => {
                const result = await User.updateOne({
                    _id: req.body._id,
                    'sendRequests.username': { $eq: req.body.username },
                }, {
                    $pull: {
                        sendRequests: {
                            username: req.body.username,
                        },
                    },
                });
                callback(result);
            },
        ], (err, results) => {
            console.log(err);
            console.log(results);
            res.redirect('/api/user/friends');
        });
    } catch (err) {
        console.log(err);
        res.render('404');
    }
});

// change to deleye
//  @desc   :For dropping friend
//  @route :POST/api/user/dropFriend
//  @from  :tables/friends
// eslint-disable-next-line no-undef
router.post('/dropFriend', ensureAuthenticated, async (req, res) => {
    try {
        const result1 = await User.updateOne({
            _id: req.user._id,
        }, {
            $pull: {
                friendsList: {
                    friendId: req.body._id,
                    friendName: req.body.username,
                },
            },
        });
        const result2 = await User.updateOne({
            _id: req.body._id,
        }, {
            $pull: {
                friendsList: {
                    friendId: req.user._id,
                    friendName: req.user.username,
                },
            },
        });
        console.log(result1, result2);
        res.redirect('/api/user/friends');
    } catch (e) {
        console.log(e);
        res.render('404');
    }
});

// @desc   :For showing sent request
//  @route :GET/api/user/sentRequests
//  @to  :list/dropRequest
router.get('/sentRequests', ensureAuthenticated, async(req, res) => {
    const find = await User.findOne({ _id: req.user._id }).lean();
    const request = find.sendRequests;
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
//  @route  :GET/api/user/friends
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
//  @route  :GET/api/user/edit
//  @to     :edit
router.get('/edit', ensureAuthenticated, (req, res) => {
    const usr = req.user;
    res.render('edit', {
        usr,
    });
});

//  @desc   :For submitting edit page
//  @route  :POST/api/user/edit
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
//  @route  :get/api/user/dashborad
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
//  @route  :GET/api/user/serach

router.get('/search', (req, res) => {
    User.find({}).then((cb) => {
        if (cb) {
            //  console.log(cb)
            res.render('search', { List: cb });
        } else res.render('404');
    });
});

//  @desc   :For sorting by state
//  @route  :GET/api/user/search/state
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
//  @route  :GET/api/user/search/city
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
//  @route  :GET/api/user/searchUser
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
//  @route  :GET/api/user/searching
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