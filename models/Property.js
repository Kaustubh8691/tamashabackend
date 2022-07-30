const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema({
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

const Property = mongoose.model("Daily", propertySchema);

module.exports = Property;
