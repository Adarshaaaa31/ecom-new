const mongoose = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
var productSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true,
       trim:true,
    },
    slug:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
    },
    description:{
        type:String,
        required:true,
    },
    price:{
        type:Number,
        required:true,
    },
    category:{
        type:String,
        required:true,
    },
    brand :{
        type:String,
        required:true,
    },
    quantity:{
        type:Number,
        required:true,
        select:false,
    },
    sold:{
        type:Number,
        default:0,
        select:false,
    },
    images:{
        type:Array,
    },
    color:{
        type:String,
        required:true,
    },
    Ratings :[
        {
            star:Number,
            Postedby:{type:mongoose.Schema.Types.ObjectId,ref:"user"}
        },
    ],
},
{timestamps:true}
);

//Export the model
module.exports = mongoose.model('product',productSchema);