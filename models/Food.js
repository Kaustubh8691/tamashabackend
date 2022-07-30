const mongoose = require("mongoose");

const foodSchema = new mongoose.Schema({
  Date: {
    type: String,
  },
  
    Milk:{
      type:Number

    },
    banana:{
      type:Number

    },
    hamburger:{
      type:Number
    },
    PreviousCalories:{
      type:Number,
      default:0
    }

  
  
  
},{strict:false});

const Food = mongoose.model("Daily", foodSchema);

module.exports = Property;
