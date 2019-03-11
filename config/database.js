const mongoose = require('mongoose');
mongoose.set('debug', true);
mongoose.connect(process.env.MONGOLAB_URI || 'mongodb://ratnesh3rde:ratnesh123@ds121475.mlab.com:21475/reactappdb');
let db = mongoose.connection;
db.once('open', function () {
    console.log('Connected to MongoDB New');
});

db.on('error', function (err) {
    console.log(err);
});

mongoose.Promise = global.Promise;


module.exports = {
User: require('../models/user'),
UserMeta: require('../models/usermeta'),
Category: require('../models/category'),
Product: require('../models/product'),
ProductMeta: require('../models/productmeta'),
Option: require('../models/option'),
Page: require('../models/page'),
Attribute: require('../models/productattribute'),
Subscribed: require('../models/subscribed'),
Wishlist: require("../models/wishlist"),
order: require("../models/order"),
orderMeta: require("../models/ordermeta"),
orderProduct: require("../models/order_product")
// Setting: require('../models/setting'),
// Notification: require('../models/notification')
}
