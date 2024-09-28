
/////////////////////require/////////////////////

const express = require("express");
const mongoose = require('mongoose');
const path = require('path');
const app = express();
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const port = 8080;
const listings = require("./routes/listing.js")
const reviews = require("./routes/review.js")
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

app.use("/listings",listings);
app.use("/listings/search/:id",reviews)



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
    next(new ExpressError(404,"Page not found"))
})

// -------------------handling error--------------------
app.use((err,req,res,next)=>{
    let {status=500,message="some error occured"}= err;
    res.status(status).send(message);
    next(err);

})
