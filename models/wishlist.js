const mongoose = require("mongoose");
const AutoIncrement = require('mongoose-sequence')(mongoose);
const Schema = mongoose.Schema;

const wishlist = mongoose.Schema({
    serial:{
        type: Number
    },
    userid:{
        type: Schema.Types.ObjectId, ref: 'User' 
    }, 
    productid:{
        type: Schema.Types.ObjectId, ref: 'Product'
    }, 
    productmeta:{
        type: Schema.Types.ObjectId, ref: 'ProductMeta'
    },
    createdon: {
        type: Date, default: Date.now
    }


});

wishlist.plugin(AutoIncrement, {inc_field: 'serial'});

const Wishlist = module.exports = mongoose.model('Wishlist', wishlist);