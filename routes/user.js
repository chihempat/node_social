const express = require('express')
const router = express.Router();
const async = require('async');
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');
const { filterByState, filterByCity, findUse, findall } = require('../controller/querys');
const { checkfriend, checksent, checkrequest, updateData, check } = require('../config/check');
const User = require('../models/User');
var c = 0;

//  @desc   :For sending request
//  @route :POST/sendRequest
router.post('/sendRequest', ensureAuthenticated, check, (req, res, next) => {
    User.updateOne({
            'username': req.body.username,
            'requestList.userId': { $ne: req.user._id },
            'friendsList.friendId': { $ne: req.user._id }
        }, {
            $push: { requestList: { userId: req.user._id, username: req.user.username, } }
        }, { new: true })
        .then((cb) => {
            if (cb) {
                console.log("in sendRequest Part two")
                User.updateOne({
                        'username': req.user.username,
                        'sentRequests.username': { $ne: req.body.username }
                    }, { $push: { sendRequests: { username: req.body.username } } })
                    .then((cb1) => {
                        if (cb1) {
                            console.log("REQ Sent")
                            console.log(cb1);
                            res.redirect("/search")
                        } else {
                            res.render('404')
                        }
                    }).catch(err => console.log(err))
            } else {
                res.redirect('404')
            }
        })
});


//  @desc   :For accepting request
//  @route  :POST/acceptRequest
//  @from   :list/request
router.post('/acceptRequest', (req, res, next) => {
    if (fr.includes(req.body._id)) {
        res.json('Already Friend')
    } else {

        console.log("in ar")

        User.updateOne({
            '_id': req.body._id,
            'friendsList.friendId': { $ne: req.user._id }
        }, {
            $push: {
                friendsList: {
                    friendId: req.user._id,
                    friendName: req.user.username
                }
            },
            $pull: {
                sendRequests: {
                    username: req.user.username
                }
            }
        }, { new: true }).then((cb) => {
            if (cb) {
                console.log("done sender part")
                console.log(cb)
                User.updateOne({
                    '_id': req.user._id,
                    'friendsList.friendId': { $ne: req.body._id }
                }, {
                    $push: {
                        friendsList: {
                            friendId: req.body._id,
                            friendName: req.body.username
                        }
                    },
                    $pull: {
                        requestList: {
                            userId: req.body._id,
                            username: req.body.username
                        }
                    }
                }).then(us => {
                    if (us) {
                        console.log(us);
                        console.log("done user part")
                        res.redirect('/friends')
                    } else {
                        res.redirect('404')
                    }
                }).catch(err => console.log(err));
            } else {
                res.redirect('404')
            }

        }, { new: true }).catch(err => console.log(err))
    }
});

//res.redirect('/dashboard');

//change to delete
//  @desc   :For dropping already sent request
//  @route :POST/dropSentRequest
//  @from  :list/sentrequests

router.post('/dropSentRequest', ensureAuthenticated, async(req, res, next) => {
    try {
        async.parallel([
            function(callback) {
                console.log("1");
                if (req.body.username) {
                    console.log("2");
                    User.updateOne({
                        'username': req.body.username,
                        'requestList.userId': { $eq: req.user._id }
                    }, {
                        $pull: {
                            requestList: {
                                userId: req.body._id,
                                username: req.body.username
                            }
                        }
                    }, (err, count) => {
                        console.log("3");
                        callback(err, count);
                    });
                }
            },
            function(callback) {
                console.log("4");
                if (req.body.username) {
                    console.log("5");

                    User.updateOne({
                        'username': req.user.username,
                        'sendRequests.username': { $eq: req.body.username }
                    }, {
                        $pull: {
                            sendRequests: {
                                username: req.body.username
                            }
                        }
                    }, (err, count) => {
                        console.log("6");
                        callback(err, count);
                    });
                }
            }
        ], (err, results) => {
            res.redirect('/');
        });
    } catch (err) {
        console.log(err)
    }
});
//change to delete
//  @desc   :For rejecting pending request
//  @route :POST/dropRequest
//  @from  :list/sentReuest
router.post('/dropRequest', ensureAuthenticated, async(req, res, next) => {

    try {
        async.parallel([
            function(callback) {
                console.log("1");
                if (req.user._id) {
                    console.log("2");
                    User.updateOne({
                        '_id': req.user._id,
                        'requestList.userId': { $eq: req.body._id }
                    }, {
                        $pull: {
                            requestList: {
                                userId: req.body._id,
                                username: req.body.username
                            }
                        }
                    }, (err, count) => {
                        console.log("3");
                        callback(err, count);
                    });
                }
            },
            function(callback) {
                console.log("4");
                if (req.user._id) {
                    console.log("5");
                    User.updateOne({
                        '_id': req.body._id,
                        'sendRequests.username': { $eq: req.body.username }
                    }, {
                        $pull: {
                            sendRequests: {
                                username: req.body.username
                            }
                        }
                    }, (err, count) => {
                        console.log("6");
                        callback(err, count);
                    });
                }
            }
        ], (err, results) => {
            res.redirect('/');
        });
    } catch (err) {
        console.log(err)
    }
});

//change to deleye
//  @desc   :For dropping friend
//  @route :POST/dropFriend
//  @from  :tables/friends
router.post('/dropFriend', ensureAuthenticated, (req, res, next) => {

    User.updateOne({
            '_id': req.user._id,
        }, {
            $pull: {
                friendsList: {
                    friendId: req.body._id,
                    friendName: req.body.username
                }
            },
        }).then((cb) => {
            if (cb) {
                console.log("Friend dropped")
                console.log(cb)
            } else {
                console.log("error")
            }
        })
        .catch((err) => { console.log(err) });

    User.updateOne({
        '_id': req.body._id,
    }, {
        $pull: {
            friendsList: {
                friendId: req.user._id,
                friendName: req.user.username
            }
        }
    }).then(cb => console.log((cb) => {
        if (cb) {
            console.log("requestList dropped")
            console.log(cb)
            res.render('/profile')
        } else {
            console.log("error")
            console.error
        }
    })).catch(err => console.log(err));

    res.redirect('/profile')
});

// @desc   :For showing sent request
//  @route :GET/sentRequests
//  @to  :list/dropRequest
router.get('/sentRequests', ensureAuthenticated, async(req, res, next) => {
    const find = await User.findOne({ _id: req.user._id }).lean();
    const request = find.sendRequests;
    //  console.log(request[0].username)
    res.render('list', { 'List': request, "route": "dropSentRequest" })
});

// @desc   :For showing incoming request
//  @route :GET/requests
//  @to  :list/acceptsRequest
router.get('/requests', ensureAuthenticated, async(req, res, next) => {
    const user = req.user.username;
    const find = await User.findOne({ _id: req.user._id }).lean();
    const request = find.requestList;
    res.render('list', { 'List': request, 'route': 'dropRequest' })
});

//  @desc   :For showing friends request
//  @route  :GET/friends
//  @to     :tables/dropFriend
router.get('/friends', ensureAuthenticated, (req, res, next) => {
    const user = req.user
    console.log(user)
    User.aggregate([
        { $unwind: '$friendsList' },
        { $match: { 'friendsList.friendName': user.username } }
    ]).then(cb => {
        if (cb) {
            console.log(cb)
            res.render('tables', { 'List': cb, route: "dropFriend" });
        } else {
            res.render("404");
        }
    }).catch(err => console.log(err))
});

//  @desc   :For showing esit page
//  @route  :GET/edit
//  @to     :edit
router.get('/edit', ensureAuthenticated, (req, res, next) => {
    let usr = req.user
    res.render('edit', {
        usr
    });
});

//  @desc   :For submitting edit page
//  @route  :POST/edit
router.post('/edit', ensureAuthenticated, updateData, (req, res, next) => {

    const { username, name, email, gender, bio, city, state } = req.body;
    let address = [{ city, state }]
    User.findOneAndUpdate({ email: email }, {
        $set: {
            "username": username,
            "name": name,
            "email": email,
            "gender": gender,
            "address": address,
            "bio": bio
        }
    }).then((cb) => {
        if (cb) {
            console.log(cb)
            res.render('profile')
        } else {
            res.render("partials/404")
        }
    }).catch((err) => console.log(err))
}, );

//  @desc   :For getiing to dashboard
//  @route  :get/dashborad
router.get('/dashboard', ensureAuthenticated, updateData, (req, res, next) => {

    // console.log(f)
    res.render('dashboard')
});

//  @desc   :For redirecting to profile
//  @route  :get/
router.get('/', ensureAuthenticated, (req, res, next) => {

    res.render('profile')
});

//  @desc   :For searchiing all memeber
//  @route  :GET/serach

router.get('/search', (req, res, next) => {
    findall(cb => {
        if (cb) {
            //  console.log(cb)
            res.render('search', { 'List': cb });
        } else
            res.render("404")
    })
});

//  @desc   :For sorting by state
//  @route  :GET/user/search/state
router.get('/search/state', (req, res, next) => {
    User.find({}).sort({ 'address.state': 1 }).then((cb) => {
        if (cb) {
            console.log(cb)
            res.render('search', { 'List': cb }).json(cb);
        } else {
            res.render('404')
        }
    }).catch((err) => { console.log(err) });

});


//  @desc   :For sorting by citty
//  @route  :GET/user/search/city
router.get('/search/city', async(req, res, next) => {
    const List = await User.find({}).sort({ 'address.city': 1 }).exec()
    if (List) {
        console.log(List.address)
        res.render('search', { 'List': List })
    } else {
        res.render('404')
    }
})


//  @desc   :For usersearching
//  @route  :GET/user/searchUser
// @to:     :tosomeprofile
router.get('/searchUser', ensureAuthenticated, (req, res, next) => {
    console.log("in search user")
    User.findOne({ username: req.query.username }).then(
        (cb) => {
            if (cb) {
                res.render('someProfile', { 'List': cb })
            } else
                res.render("404")
        }).catch(err => console.log(err))
});

//  @desc   :For usersearching
//  @route  :GET/user/user/someProfile
// @to:     :tosomeprofile
router.get('/searching', ensureAuthenticated, (req, res, next) => {

    User.findOne({ name: req.query.name }).then(
        (cb) => {
            if (cb) {
                res.render('someProfile', { 'List': cb })
            } else
                res.render("404")
        }).catch(err => console.log(err))
});

module.exports = router;