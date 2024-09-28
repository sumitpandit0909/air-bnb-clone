const express = require("express");
const router =express.Router({mergeParams:true});
const Listing = require("../models/listing.js");
const Review = require('../models/reviews.js');
const {reviewsSchema} =require('../validateschema.js');


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
router.post("/submit-review",validateReview, asyncWrap(async(req,res)=>{
    reviewsSchema.validate(req.body)
    let id = req.params.id;
    let listing = await Listing.findById(id)
    let data = req.body;
    console.log(data)
    let newreview = new Review(data);
    listing.reviews.push(newreview);
    await newreview.save();
    await listing.save();
    
    // res.send({review})
  
    res.redirect(`/listings/search/${id}`)

}));

// -----------------DELETE REVIEW------------------- 




router.delete("/delete-review/:reviewid", asyncWrap(async (req,res)=>{
    let id = req.params.id;
    let reviewid = req.params.reviewid;
   
    await Listing.findByIdAndUpdate(id,{$pull:{reviews :reviewid}})
    
    await Review.findByIdAndDelete(reviewid);

    // await Listing.findOne({_id :})
    res.redirect(`/listings/search/${id}`)
}));

module.exports = router;