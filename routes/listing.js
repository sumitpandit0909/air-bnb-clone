const express = require("express");
const router =express.Router({mergeParams:true});
const Listing = require("../models/listing.js");
const Review = require('../models/reviews.js');

// ---------------handling async routes error--------------------
function asyncWrap(fxn){
    return (req,res,next)=>{
        fxn(req,res,next).catch(err=>next(err));
    }
}

class ExpressError extends Error {
    constructor(status,message) {
        super();
        this.status = status;
        this.message = message;
        
    }
}


// --------------------Home route-----------

router.get("/",asyncWrap(async (req,res)=>{
    let datas = await Listing.find();
    
    res.render("listings/index.ejs",{datas})
}));

// ------------------post route---------------------

router.get("/newlisting", (req,res)=>{
    res.render("listings/newlisting.ejs");
    
})
router.post("/submit-listing",asyncWrap(async (req,res)=>{
    // ListingSchema.validate(req.body)
    let data = req.body;
    let newlisting =  new Listing(data);
    await newlisting.save();
    res.redirect("/listings")
}));
// ------------------show route--------------------

router.get("/search/:id", asyncWrap(async (req, res) => {
    let id = req.params.id;

    // Fetch the listing document
    let listing = await Listing.findById(id);

    // Manually fetch reviews based on the review IDs in the listing
    let reviews = [];
    if (listing.reviews && listing.reviews.length > 0) {
        reviews = await Review.find({ _id: { $in: listing.reviews } });
    }

    // Combine listing data with fetched reviews
    let data = {
        ...listing._doc,
        reviews // Add the fetched reviews to the listing data
    };

    res.render("listings/show.ejs", { data });
}));





// -----------------------EDit and update route-------------------
router.get("/search/:id/edit",asyncWrap(async (req,res)=>{
    let id = req.params.id;
    let data = await Listing.findById(id);
    res.render("listings/edit.ejs",{datas:data})

}));

router.put("/search/:id",asyncWrap(async (req,res)=>{
    let id = req.params.id;
    let data = req.body;
    await Listing.findByIdAndUpdate(id,data);
    res.redirect("/listings")
}));
// -----------------------Delete route-------------------
router.delete("/search/:id/remove",asyncWrap(async (req,res)=>{
    let id = req.params.id;
    await Listing.findByIdAndDelete({_id:id});
    res.redirect("/listings")
}));

module.exports = router;