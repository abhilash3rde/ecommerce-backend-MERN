const mongoose          = require('mongoose');
const Schema            = mongoose.Schema;
// Product Schema
let productMetaSchema = Schema({
    producttype: {
        type: String,
        required: true
    },
    visibilitytype:{type:String},
    barcode:{type: String},
    type:{type:String},
    keyingredients: {
        type: String
    },
    attributecontent: {
        type: Array
    },
    regularprice: {
        type: Number
    },
    saleprice: {
        type: Number
    },
    faqcontent: {
        type: Array
    },
    managestockstatus: {
        type: Boolean
    },
    soldindividual: {
        type: Boolean
    },
    unit: {
        type: Number
    },
    shipping_weight:{type: Number},
    shipping_length:{type: Number},
    shipping_width:{type: Number},
    shipping_height:{type: Number},
    shipping_class:{type: String},
    stock_status:{type: String},

    enablereview: {
        type: String
    },
    galleryimgdetails: {
        type: Array
    },
    attributes: {
        type: Array
    },
    variation: {
        type: Array
    },
    categoryid: [{ type : Schema.Types.ObjectId, ref: 'Category', required: true }],
    productid: {
        type: Schema.Types.ObjectId, ref: 'Product',
        required: true
    }
});
let ProductMeta = module.exports = mongoose.model('ProductMeta', productMetaSchema);