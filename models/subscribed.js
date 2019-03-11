const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const subscribedProd = mongoose.Schema({

    userid:{
        type: Schema.Types.ObjectId, ref: 'User'
    },
    productid: {
        type: Schema.Types.ObjectId, ref:'Product'
    }, 
    productmeta: {
        type: Schema.Types.ObjectId, ref:'ProductMeta', 
    },
    subscribedon:{
        type: Date, default: Date.now
    },
    //duration till which this subscription will last 
    duration:{
        type: String, required: true
    },
    //The number of products that will be delivered per order
    quantity:{
        type: Number, required: true
    },
    deliverydate:{
        type: Date
    },
    //The number of time you want this particular product 
    frequency:{
        type: Number,
        default: '1'
    },
    skipdelivery: {
        type: String
    },
    orderid:{
        type: Schema.Types.ObjectId, ref: 'Order'
    }
});

const Subscribed = module.exports = mongoose.model('Subscribed', subscribedProd);