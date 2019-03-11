const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const Schema            = mongoose.Schema;
// Product Schema
let productSchema = Schema({
    id: {
        type: Number
    },
    producttitle: {
        type: String,
        required: true
    },
    sku: {
        type: String,
        unique: true,
        required: true
    },
    productdescription: {
        type: String
    },
    featurefilepath: {
        type: String,
        trim: true
    },
    blockedcountries: {
        type: Array
    },
    creationdate: {
        type: Date,
        default: Date.now
    }
});

productSchema.plugin(AutoIncrement, {inc_field: 'id'});
let Product = module.exports = mongoose.model('Product', productSchema);