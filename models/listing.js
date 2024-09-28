const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require("./reviews.js");

// Define the Listing schema
const ListingSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    desc: {
        type: String
    },
    price: {
        type: Number,
        required: true
    },
    image: {
        type: String,
        default: "https://images.unsplash.com/photo-1473116763249-2faaef81ccda?q=80&w=900&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        set: (v) => v === "" ? "https://images.unsplash.com/photo-1473116763249-2faaef81ccda?q=80&w=900&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" : v
    },
    location: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
});

// Pre middleware to delete reviews before the listing is deleted
ListingSchema.pre('findOneAndDelete', async function (next) {
    const doc = await this.model.findOne(this.getQuery()); // Get the document being deleted
    
    if (doc && doc.reviews.length > 0) {  // Check if the listing has reviews
        try {
            // Delete all reviews associated with the listing
            await Review.deleteMany({
                _id: { $in: doc.reviews }  // Delete reviews that are in the reviews array of the listing
            });
            console.log("Associated reviews deleted before listing removal");
        } catch (error) {
            console.error("Error deleting associated reviews:", error);
        }
    }
    
    next();  // Proceed with deleting the listing
});

// Compile the model
const Listing = mongoose.model("Listing", ListingSchema);

module.exports = Listing;
