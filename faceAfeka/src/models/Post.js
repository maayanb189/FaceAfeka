const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ObjectId = require('mongodb').ObjectID

const postSchema = new Schema({
   content: String,
   date: String,
   location: String,
   likesCount: Number,
   likes: [String],
   isPrivate: Boolean,
   userId: String, 
   images: [String]
})

postSchema.index({"$**": "text"})
module.exports = mongoose.model('Post', postSchema)