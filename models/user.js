const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    name :{
        type: String,
        required:true
    },
    username:{
        type:String,
        required:true,
        unique: true
    },
    email:{
        type:String,
        required:true,
        unique:[true,"email id already exists"]
    },
    password:{
        type:String,
        required:true,
        minLength: [8,"Password is too short"]
    }
})
const User = mongoose.model("User",userSchema);
module.exports = User;