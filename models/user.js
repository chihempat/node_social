/* eslint-disable eol-last */
const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const { Schema } = mongoose;
// const bcrypt = require('bcryptjs');

const UserSchema = new Schema({

    username: { type: String, unique: true, required: [true, "can't be blank"] },
    name: { type: String },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    gender: { type: String },
    age: { type: Number },
    bio: { type: String, default: '' },
    address: [{
        city: { type: String },
        state: { type: String },
        country: { type: String },
    }],
    sendRequests: [{
        username: {
            type: String,
            default: '',
        },
    }],
    requestList: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        username: {
            type: String,
            default: '',
        },

    }],
    friendsList: [{
        friendId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        friendName: { type: String, default: '' },
    }],
    totalRequests: { type: Number, default: 0 },
}, { collection: 'users' });

UserSchema.plugin(uniqueValidator);
module.exports = mongoose.model('users', UserSchema);