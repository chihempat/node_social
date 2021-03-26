const express = require('express')
const User = require('../models/User')
const mongoose = require('mongoose')
const list = []

module.exports = {
    findall: function(callback) {
        User.find().then(callback)
    },
    filterByCity: function(city, callback) {
        User.find({ 'address.city': city }).then((user) => {
            list.push(user)
            if (user) {
                list.push(user)
                    // console.log(user)
                callback(user)
            } else
                console.log('not proper query')

        }).catch((err) => console.error(err))
    },
    filterByState: function(state, callback) {
        User.find({ 'address.state': state }).then((user) => {
            list.push(user)
            if (user) {
                list.push(user)
                console.log(user)
                callback(user)
            } else
                console.log('not proper query')
        }).catch((err) => console.error(err))
    },
    findUser: function(email, callback) {
        User.find({ email: email }).then((user) => {
            if (user) {
                console.log('found user')
                list.push(user)
                console.log(user)
                callback(user)

            } else
                console.log('not proper query')
        }).catch((err) => console.error(err))
    },
    findFriends: function(user, callback) {
        User.find().grop({ friendList }).then((user) => {
            if (user) {
                console.log('found user')
                list.push(user)
                console.log(user)
                callback(user)
            } else
                console.log('not proper query')
        })
    }
}