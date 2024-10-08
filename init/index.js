const mongoose = require('mongoose');
const initData = require("./sampleListing.js")
const Listing = require("../models/listing.js");

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

let initDB = async()=>{
   await Listing.deleteMany({});
   initData.data = initData.data.map(data=>{
    return {...data, owner: "66fd85a2d6935532dbeb1aa3"}
   })
   await Listing.insertMany(initData.data)
   console.log("data initialised");
}
initDB();