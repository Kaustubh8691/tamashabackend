const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({

    email: {
      required: true,
      type: String,
      unique: true,
    },
    password: {
      required: true,
      type: String,
    },
    UserName:{
      type: String,
      required: true,
    },
    Role:{
      type:String,
      required:true
    },
    limit:{
      type:Number,
      default:2100
    }
},{strict:false});


const User = mongoose.model("Users", userSchema);

module.exports = User;
