const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ObjectId = require('mongodb').ObjectID

const userSchema = new Schema({
    firstname: String,
    lastname: String,
    email: String,
    password: String,
    profileImage: String,
    friendsCount: Number,
    friendsList: [String],
    lastLoginAt : String
})

userSchema.index({"$**": "text"})
module.exports = mongoose.model('User', userSchema)