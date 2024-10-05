
/////////////////////require/////////////////////

const express = require("express");
const mongoose = require('mongoose');
const path = require('path');
const app = express();
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const port = 8080;
const listingRouter = require("./routes/listing.js");
const reviewsRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
const session = require('express-session');
const flash = require('connect-flash');
const { date } = require("joi");
const passport = require('passport');
const localStrategy = require('passport-local');
const User = require('./models/user');



const sessionOptions = {
    secret: 'secret',
    resave :false,
    saveUninitialized :true,
    cookie :{
        expires : Date.now() + 7*24*60*66*1000,
        maxAge :  7*24*60*66*1000,
        httpOnly :true
    }
}


// ------------middlewares------------- 
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname,"public")));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));
app.engine('ejs',ejsMate)
app.listen(port,()=>{
    console.log(`Server running on port ${port}`);
})

app.use(session(sessionOptions));
app.use(flash());

///-------------passport-middleware------------------

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    // console.log("Current user:", req.user);
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.currentUser = req.user;
    next();
})


// app.get("/register",async (req,res)=>{
//     const fakeUser = new User({
//         email:"fake@gmail.com",
//         username:"fake",
//         name:"fake",
//     })
//     const registeredUser = await User.register(fakeUser, "12345678");
//     res.send(registeredUser);
// })

/////router middleware/////
app.use("/listings",listingRouter);
app.use("/listings/search/:id",reviewsRouter)
app.use("/",userRouter);



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
//---------------Authentication for add listing---------------

////////Database connection//////////////////
main()
.then(()=>{
    console.log("Database is connected");
})
.catch((err)=>{
    console.log(err);
})

async function main(){
    await mongoose.connect('mongodb://127.0.0.1:27017/airbnb');
}



// handling additional routes 

app.get("*",(req,res,next)=>{
    req.flash("error","Page not found")
    // next(new ExpressError(404,"Page not found"))
    res.redirect("/listings")
})

// -------------------handling error--------------------
app.use((err,req,res,next)=>{
    let {status=500,message="some error occured"}= err;
    res.status(status).send(message);
    next(err);

})
