
/////////////////////require/////////////////////

const express = require("express");
const mongoose = require('mongoose');
const path = require('path');
const Listing = require("./models/listing.js");
const User = require("./models/user.js")
const app = express();
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
// const {ListingSchema} =require('./validateschema.js')
const {reviewsSchema} =require('./validateschema.js')

const Review = require('./models/reviews.js')
const port = 8080;

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

const validateReview = (req,res,next)=>{
    let {error}= reviewsSchema.validate(req.body);
    if(error){
        res.send(error.details[0].message)
    }else{
        next()
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
// restful api //

app.get("/",(req,res)=>{
    res.send("working");
});

// app.get("/testing",(req,res)=>{
//     let samplealisting = new Listing({
//         title: "my new home",
//         price:5000,
//         desc:"dream home buuilders",
//         location:"goa",
//         country:"India"
//     })
//     samplealisting.save().then((data)=>{
//         console.log(data)
//         res.send("listing saved");
//     })
// });
// --------------------Home route-----------

app.get("/listings",asyncWrap(async (req,res)=>{
    let datas = await Listing.find();
    
    res.render("listings/index.ejs",{datas})
}));

// ------------------post route---------------------

app.get("/listings/newlisting", (req,res)=>{
    res.render("listings/newlisting.ejs");
    
})
app.post("/listings/submit-listing",asyncWrap(async (req,res)=>{
    // ListingSchema.validate(req.body)
    let data = req.body;
    let newlisting =  new Listing(data);
    await newlisting.save();
    res.redirect("/listings")
}));
// ------------------show route--------------------

app.get("/listings/search/:id", asyncWrap(async (req, res) => {
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
app.get("/listings/search/:id/edit",asyncWrap(async (req,res)=>{
    let id = req.params.id;
    let data = await Listing.findById(id);
    res.render("listings/edit.ejs",{datas:data})

}));

app.put("/listings/search/:id",asyncWrap(async (req,res)=>{
    let id = req.params.id;
    let data = req.body;
    await Listing.findByIdAndUpdate(id,data);
    res.redirect("/listings")
}));
// -----------------------Delete route-------------------
app.delete("/listings/search/:id/remove",asyncWrap(async (req,res)=>{
    let id = req.params.id;
    await Listing.findByIdAndDelete({_id:id});
    res.redirect("/listings")
}));
// -----------------------Review route-------------------
app.post("/listings/search/:id/submit-review",validateReview, asyncWrap(async(req,res)=>{
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


// reviewsSchema.post("deleteOne",(data)=>{
//     console.log(data)
// })
// -----------------DELETE REVIEW------------------- 




app.delete("/listings/search/:id/delete-review/:reviewid", asyncWrap(async (req,res)=>{
    let id = req.params.id;
    let reviewid = req.params.reviewid;
   
    await Listing.findByIdAndUpdate(id,{$pull:{reviews :reviewid}})
    
    await Review.findByIdAndDelete(reviewid);

    // await Listing.findOne({_id :})
    res.redirect(`/listings/search/${id}`)
}));





// -----------------------------signup route---------

app.get("/signup",(req,res)=>{
    res.render("users/signup.ejs")
})

app.post("/signup/submit-signup",asyncWrap(async (req,res)=>{
    let data = req.body;
    let newuser = new User(data);
    await newuser.save();
    res.redirect("/login");
}))
// ---------------login route-------------------------
app.get("/login",(req,res)=>{
    res.render("users/login.ejs");
})
app.post("/login/submit-login",async(req,res)=>{
    let data = req.body;
    console.log(data)
    let getData = await User.findOne({email:data.email});
    console.log(getData.password)
    if(getData.password === data.password){
        res.send("login successfull")
    }else{
        res.send("login failed")
    }
});
app.get("*",(req,res,next)=>{
    next(new ExpressError(404,"Page not found"))
})

// -------------------handling error--------------------
app.use((err,req,res,next)=>{
    let {status=500,message="some error occured"}= err;
    res.status(status).send(message);
    next(err);

})
