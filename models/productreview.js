const mongoose          = require('mongoose');
const AutoIncrement     = require('mongoose-sequence')(mongoose);
const Schema            = mongoose.Schema;

let productReviewSchema = Schema({
    id: {
        type: Number
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        required: true
    },
    productid: {
        type: Schema.Types.ObjectId, ref: 'Product',
        required: true
    },
    userid: {
        type: Schema.Types.ObjectId, ref: 'User',
        required: true
    }
});

productReviewSchema.plugin(AutoIncrement, {inc_field: 'id'});
let ProductReview = module.exports = mongoose.model('ProductReview', productReviewSchema);