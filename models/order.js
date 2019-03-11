let mongoose = require('mongoose');
var Schema = mongoose.Schema;
let orderSchema = Schema({
	orderid: {
		type: Number
	},
	orderproducts: 
		{
			type: Object
			
		}
	,
	grandtotal: { type: Number },
	coupondisc: { type: Number },
	couponid: { type: String },
	country: { type: String },
	offerprice: {
		type: Number
	},
	shippingmethod: { type: String },
	wholesubtotal: { type: Number },
	shippingcharge: {
		type: Number
	},
	orderdate: {
		type: Date,

		default: Date.now
	},
	paymentmethod: {
		type: String,
		required: true
	},
	ordernote: {
		type: String
	},
	userid: {
		type: String
		// type: Schema.Types.ObjectId,
		// ref: 'User'
	}
});

let Order = (module.exports = mongoose.model('Order', orderSchema));
