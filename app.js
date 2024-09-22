
/////////////////////require/////////////////////

const express = require("express");
const mongoose = require('mongoose');
const path = require('path');
const Listing = require("./models/listing.js");
const app = express();
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');

const port = 8080;


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname,"public")));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));
app.engine('ejs',ejsMate)
app.listen(port,()=>{
    console.log(`Server running on port ${port}`);
})
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

app.get("/listings",async (req,res)=>{
    let datas = await Listing.find();
    
    res.render("listings/index.ejs",{datas})
});

// ------------------post route---------------------

app.get("/listings/newlisting", (req,res)=>{
    res.render("listings/newlisting.ejs");
    
})
app.post("/listings/submit-listing",async (req,res)=>{
    let data = req.body;
    let newlisting =  new Listing(data);
    await newlisting.save();
    res.redirect("/listings")
})
// ------------------show route--------------------
app.get("/listings/search/:id",async (req,res)=>{
    let id = req.params.id;
    let data = await Listing.findById(id);
    // console.log(data)
    res.render("listings/show.ejs",{data})

})

// -----------------------EDit and update route-------------------
app.get("/listings/search/:id/edit",async (req,res)=>{
    let id = req.params.id;
    let data = await Listing.findById(id);
    res.render("listings/edit.ejs",{datas:data})

})

app.put("/listings/search/:id",async (req,res)=>{
    let id = req.params.id;
    let data = req.body;
    await Listing.findByIdAndUpdate(id,data);
    res.redirect("/listings")
})
// -----------------------Delete route-------------------
app.delete("/listings/search/:id/remove",async (req,res)=>{
    let id = req.params.id;
    await Listing.deleteOne({_id:id});
    res.redirect("/listings")
})
