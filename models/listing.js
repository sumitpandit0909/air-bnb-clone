const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ListingSchema = new Schema({
    title:{
        type: String,
        required: true
    },
    desc:{
        type: String
    },
    price:{
        type: Number,
        required: true
    },
    image:{
        type: String,
        default:"https://images.unsplash.com/photo-1473116763249-2faaef81ccda?q=80&w=900&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        set : (v)=> v === ""? "https://images.unsplash.com/photo-1473116763249-2faaef81ccda?q=80&w=900&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" : v
    },
    location:{
        type: String,
        required: true
    },
    country:{
        type: String,
        required: true
    }
})
const Listing = mongoose.model("Listing",ListingSchema);

module.exports = Listing ;