const express = require("express");
const router =express.Router({mergeParams:true});
const Listing = require("../models/listing.js");
const Review = require('../models/reviews.js');
const {isLoggedIn,isOwner} = require("../middleware.js")

// ---------------handling async routes error--------------------
function asyncWrap(fxn){
    return (req,res,next)=>{
        fxn(req,res,next).catch(err=>{req.flash("error",err.message);res.redirect("/listings")});
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

router.get("/newlisting", isLoggedIn, (req,res)=>{
   
    res.render("listings/newlisting.ejs");
    
})
router.post("/submit-listing",isLoggedIn,asyncWrap(async (req,res)=>{
    // ListingSchema.validate(req.body)
    let data = req.body;
    let newlisting =  new Listing(data);
    newlisting.owner = req.user._id;
    await newlisting.save();
    req.flash("success", "Listing added successfully")
    res.redirect("/listings")
}));
// ------------------show route--------------------

router.get("/search/:id", asyncWrap(async (req, res) => {
    let id = req.params.id;

    // Fetch the listing document
    let listing = await Listing.findById(id).populate("owner").populate({path:"reviews",populate:{path:"author"}});
    console.log(listing)
    if(!listing){
        req.flash("error","Requested Listing does not exist")
        res.redirect("/listings")
    }

    // Manually fetch reviews based on the review IDs in the listing
    // let reviews = [];
    // if (listing.reviews && listing.reviews.length > 0) {
    //     reviews = await Review.find({ _id: { $in: listing.reviews } });
    // }

    // // Combine listing data with fetched reviews
    // let data = {
    //     ...listing._doc,
    //     reviews // Add the fetched reviews to the listing data
    // };

    res.render("listings/show.ejs", { listing });
}));





// -----------------------EDit and update route-------------------
router.get("/search/:id/edit",isLoggedIn,isOwner,asyncWrap(async (req,res)=>{
    let id = req.params.id;
    let data = await Listing.findById(id);
    if(!data){
        req.flash("error","Requested Listing does not exist")
        res.redirect("/listings")
    }
    res.render("listings/edit.ejs",{datas:data})

}));

router.put("/search/:id",isLoggedIn,isOwner,asyncWrap(async (req,res)=>{
    let id = req.params.id;
    let data = req.body;
    
    await Listing.findByIdAndUpdate(id,data);
    req.flash("success", "Listing updated successfully")
    res.redirect("/listings")
}));
// -----------------------Delete route-------------------
router.delete("/search/:id/remove",isOwner, asyncWrap(async (req,res)=>{
    if (!req.isAuthenticated()) {
        req.session.returnTo = `/listings/search/${req.params.id}`;
        req.flash("error", "You need to login first");
        return res.redirect("/login");
    }
    let id = req.params.id;
    await Listing.findByIdAndDelete({_id:id});
    req.flash("success", "Listing deleted successfully")
    res.redirect("/listings")
}));

module.exports = router;