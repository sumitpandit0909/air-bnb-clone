const express = require("express");
const router =express.Router();
const User = require("../models/user.js");
const Listing = require("../models/listing.js");
const Review = require('../models/reviews.js');
const passport = require("passport");
const {storeReturnTo} = require("../middleware.js");

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

router.get("/register",(req,res)=>{
    res.render("users/signup.ejs");
})

router.post("/register",(async(req,res,next)=>{
    try {
    let {name,username,email,password} = req.body;
    let user = new User({name,username,email});
    let registeredUser = await User.register(user,password);
    console.log(registeredUser);
    req.login(registeredUser,(err)=>{
        if(err){
            return next(err);
        }
        req.flash("success","Welcome to airbnb");
        res.redirect("/listings");
    });
    } catch (error) {
        req.flash("error",error.message);
    res.redirect("/register");
        
    }
}));

router.get("/login",(req,res)=>{
    res.render("users/login.ejs");
});

router.post("/login",storeReturnTo,passport.authenticate("local",{failureFlash:true,failureRedirect:"/login"}),asyncWrap(async (req,res,next)=>{
    req.flash("success","Welcome back to airbnb");
    const redirectUrl = res.locals.returnTo || "/listings";
    res.redirect(redirectUrl);
}));

router.get("/logout",(req,res,next)=>{
    req.logout((err)=>{
        if(err){
            return next(err);
        }
        req.flash("success","Logged out successfully");
        res.redirect("/listings");
    });
    
});

module.exports = router;