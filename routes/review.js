const express = require("express");
const router =express.Router({mergeParams:true});
const Listing = require("../models/listing.js");
const Review = require('../models/reviews.js');
const {reviewsSchema} =require('../validateschema.js');
const {isLoggedIn,isReviewAuthor} = require("../middleware.js")



const validateReview = (req,res,next)=>{
    let {error}= reviewsSchema.validate(req.body);
    if(error){
        res.send(error.details[0].message)
    }else{
        next()
    }
}


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

// -----------------------Review route-------------------
router.post("/submit-review",isLoggedIn,validateReview,  asyncWrap(async(req,res)=>{
    reviewsSchema.validate(req.body)
    let id = req.params.id;
    let listing = await Listing.findById(id)
    let data = req.body;
    console.log(data)
    let newreview = new Review(data);
    newreview.author = req.user._id;
    listing.reviews.push(newreview);
    await newreview.save();
    await listing.save();
    
    // res.send({review})
    req.flash("success", "Review added successfully")
  
    res.redirect(`/listings/search/${id}`)

}));

// -----------------DELETE REVIEW------------------- 




router.delete("/delete-review/:reviewid",isReviewAuthor, asyncWrap(async (req,res)=>{
    let id = req.params.id;
    if (!req.isAuthenticated()) {
        req.session.returnTo = `/listings/search/${req.params.id}`;
        req.flash("error", "You need to login first");
        return res.redirect("/login");
    }
    let reviewid = req.params.reviewid;
   
    await Listing.findByIdAndUpdate(id,{$pull:{reviews :reviewid}})
    
    await Review.findByIdAndDelete(reviewid);

    // await Listing.findOne({_id :})
    req.flash("success", "Review deleted successfully")
    res.redirect(`/listings/search/${id}`)
}));

module.exports = router;