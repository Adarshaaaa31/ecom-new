const mongoose = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
var orderSchema = new mongoose.Schema({
    products:[
        {
            product:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Product"
            },
            count:Number,
            color:String
        },
    ],
    paymentIntent:{},
    orderStatus:{
        type:String,
        default:"not processed",
        enum:["not processed",
        "Cash on delivery",
        "Processing",
        "Dispatched",
        "Cancelled",
        "Delivered"],
    },
    orderby:{
        type:mongoose.Types.ObjectId,
        ref:"user"
    },
},
{
    timestamps:true,
}
);

//Export the model
module.exports = mongoose.model('Order', orderSchema);