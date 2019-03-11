let mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
var Schema = mongoose.Schema;

let order_product = Schema({
	// producttitle: { type: Schema.Types.ObjectId, ref: 'Product' },
	
	orderproduct:{type: Object},
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
	},
	status: {
		type: String
	},
	paymentstatus: {
		type: String
	},
	transactionid: {
		type: String
	},
	country_tax: { type: String },
	taxamount: {
		type: String
	},
	isguest: { type: Boolean },
	userdetails: {
		type: Object
	},
	orderstatus: { type: String },
	orderid: {
		type: Schema.Types.ObjectId,
		ref: 'Order'
	},
	serial_id:{
		type: Number
	}
});

order_product.plugin(AutoIncrement, {inc_field: 'serial_id'});
let orderProduct = (module.exports = mongoose.model('Orders', order_product));
