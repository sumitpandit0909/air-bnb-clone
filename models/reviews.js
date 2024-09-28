const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reviewsSchema = new Schema({
    comment :String,
    rating :{
        type: Number,
        min:1,
        max:5
    },
    CreatedAt :{
        type: Date,
        default: Date.now
    }
});

const Review = mongoose.model("Review",reviewsSchema);
module.exports = Review;