const Listing = require("./models/listing.js");
const Review = require("./models/reviews.js");
const ExpressError = require("./Expresserror.js");
const asyncWrap = require("./asyncwrap.js");
module.exports.isLoggedIn = (req,res,next)=>{
    if(!req.isAuthenticated()){
        req.session.returnTo = req.originalUrl;
        req.flash("error","You need to login first")
        res.redirect("/login")
    }
    next()
}

module.exports.storeReturnTo = (req,res,next)=>{
    if(req.session.returnTo){
        res.locals.returnTo = req.session.returnTo;
    }
    next();
}

module.exports.isOwner = asyncWrap(async (req,res,next)=>{
    let id = req.params.id;
    let listing = await Listing.findById(id);
    if(res.locals.currentUser && !listing.owner.equals(res.locals.currentUser._id)){
        req.flash("error", "Action Restricted! You are not the owner of this listing");
        return res.redirect(`/listings/search/${id}`);
    }
    next();
})

module.exports.isReviewAuthor = asyncWrap(async (req,res,next)=>{
    let {id,reviewid} = req.params;
    let review = await Review.findById(reviewid);
    if(res.locals.currentUser && !review.author.equals(res.locals.currentUser._id)){
        req.flash("error", "Action Restricted! You are not the author of this review");
        return res.redirect(`/listings/search/${id}`);
    }
    next();
})