const express = require('express');
const router = express.Router();
const moment = require('moment-timezone');
let db = require('../config/database');
const OrderProduct = require("../models/order_product");
const Order = db.order;
const orderMeta = require("../models/ordermeta");
const crypto = require('crypto');
const nodemailer    = require('nodemailer');
const Notify = require("../models/notification");
// let Delivery = require('../models/delivery');
// let User = require('../models/user');
// let Notification = require('../models/notification');




// Adding orde to database
router.post('/add', async function(req, res) {
	// req.checkBody('', 'Customer Name is required').notEmpty();
	// req.checkBody('', 'Broker Name is required').notEmpty();
	// req.checkBody('', 'Price is required').notEmpty();
	// req.checkBody('', 'Price Shuold be Number only').isNumeric();
	// req.checkBody('', 'Order ID is required').notEmpty();
	// req.checkBody('', 'Order ID Shuold be Number only').isNumeric();
	// req.checkBody('', 'Order Date is required').notEmpty();
	// req.checkBody('', 'User ID is required').notEmpty();
	// req.checkBody('', 'Transport Charge is required').notEmpty();
	// req.checkBody('', 'Order miliseconds is required').notEmpty();
	// req.checkBody('', 'Wallet Amount Used is required').notEmpty();
	// req.checkBody('', 'Wallet Amount Used Shuold be Number only').isNumeric();
	let errors = req.validationErrors();
	if (errors) {
		console.log(errors);
		res.json({ success: false, message: 'validation error', errors: errors });
	} else {
		function gen_id() {
			let dash = crypto.randomBytes(20, function(err, buf) {
                var orderId = buf.toString('hex');
				return JSON.stringify(orderId);
            });
            console.log(dash);
        }
        
        var randomString = function (len, bits)
{
    bits = bits || 36;
    var outStr = "", newStr;
    while (outStr.length < len)
    {
        newStr = Math.random().toString(bits).slice(2);
        outStr += newStr.slice(0, Math.min(newStr.length, (len - outStr.length)));
    }
    return outStr.toLowerCase();
};

    let order = new OrderProduct(req.body);
    order.save().then((data) => send_mail(data));
    //     let id = randomString(19, 16);
	
	function send_mail(data){
	var smtpTransport = nodemailer.createTransport(
		"smtps://anas3rde@gmail.com:8123342590@smtp.gmail.com"
	  );

	  var mailOptions = {
		from: "anas3rde@gmail.com",
		to: data.userdetails.email,
		subject: "Order Placed - CBDBene",
		text: "Your order has been successfully placed. To view your order click on the link below" +
		"\n\n"  + process.env.CLIENT_URL + "/accounts/order/" + data._id + "\n\n"
	  };
	  smtpTransport.sendMail(mailOptions, function(err) {
		if(err){
			res.json({success: false, error: err});
		}
		console.log("Order placed email sent ");
		res.json({success: true, order: data});
	  });

	  //Creating a notification for User
	  let notify = new Notify();
	  notify.title = "New Order",
      notify.content= "New Order Placed",
	  notify.type= "order",
	  notify.vieworder = data._id
	notify.save().then((data) => console.log(data)); 
	}




    //     // let id = Math.random().toString(36).slice(2);
    //     // let id = (Math.random()*1e32).toString(36);
    //     console.log(id);
	// 	let product_ids = new Array();
	// 	let num = req.body.orderproduct.length - 1;
	// 	//Saving the order product first
	// 	for (i = 0; i <= num; i++) {
	// 		let orderProduct = new OrderProduct();
    //         orderProduct.productMetaId = req.body.orderproduct[i].productmetaid;
    //         orderProduct.producttitle = req.body.orderproduct[i].producttitle;
	// 		orderProduct.orderid = id;
	// 		orderProduct.quantity = req.body.orderproduct[i].quantity;
	// 		orderProduct.singleprice = req.body.orderproduct[i].singleprice;
	// 		orderProduct.orderdate = req.body.orderproduct[i].orderdate;
	// 		orderProduct.country = req.body.orderproduct[i].country;
	// 		orderProduct.isguest = req.body.orderproduct[i].isguest;
	// 		orderProduct.userid = req.body.orderproduct[i].userid;
	// 		orderProduct.subtotal = req.body.orderproduct[i].subtotal;
    //         orderProduct.selectedattribute = req.body.orderproduct[i].selectedattribute;
    //         await orderProduct.save().then((product) => product_ids.push(product));
    //     }
	// 	// function product1(product) {
	// 	// 	let product_id = product.id;
    //     make_order()
    //     // await OrderProduct.find({orderid: id}).then((data) => console.log(data));
    //    async function make_order(){
    //     console.log('in');
	//     let order = new Order();
	// 	order.orderid = id;
	// 	order.userid = req.body.userid;
	// 	order.orderid = id;
	// 	order.orderproducts = product_ids;
	// 	order.couponid = req.body.couponid;
	// 	order.coupondisc = req.body.coupondisc;
	// 	order.country = req.body.country;
	// 	order.offerprice = req.body.offerprice;
	// 	order.shippingmethod = req.body.shippingmethod;
	// 	order.wholesubtotal = req.body.wholesubtotal;
	// 	order.shippingcharge = req.body.shippingcharge;
	// 	order.orderdate = req.body.orderdate;
	// 	order.paymentmethod = req.body.paymentmethod;
	// 	order.ordernote = req.body.ordernote;
    //     order.userid = req.body.userid;
    //     order.grandtotal = req.body.grandtotal;
	// 	await order.save().then((order) => create_order_meta(order)).catch((err) => res.json({error: err}));
          
    
        	
	// 	 function create_order_meta(order) {
	// 		let ordermeta = new orderMeta();
	// 		ordermeta.status = req.body.status;
	// 		ordermeta.paymentstatus = req.body.paymentstatus;
	// 		ordermeta.transactionid = req.body.transactionid;
	// 		ordermeta.country_tax = req.body.country_tax;
	// 		ordermeta.taxamount = req.body.taxamount;
	// 		ordermeta.isguest = req.body.isguest;
	// 		ordermeta.userdetails.country = req.body.userdetails.country;
	// 		ordermeta.userdetails.firstname = req.body.userdetails.firstname;
	// 		ordermeta.userdetails.lastname = req.body.userdetails.lastname;
	// 		ordermeta.userdetails.shippingaddress = req.body.userdetails.shippingaddress;
	// 		ordermeta.userdetails.billingaddress = req.body.userdetails.billingaddress;
	// 		ordermeta.userdetails.city = req.body.userdetails.city;
	// 		ordermeta.userdetails.state = req.body.userdetails.state;
	// 		ordermeta.userdetails.zipcode = req.body.userdetails.zipcode;
	// 		ordermeta.userdetails.phonenumber = req.body.userdetails.phonenumber;
	// 		ordermeta.orderstatus = req.body.orderstatus;
	// 		ordermeta.orderid = order.orderid;

            
	// 		ordermeta.save(function(err) {
	// 			if (err) {
	// 				res.json({
	// 					success: false,
	// 					message: 'Error in Saving Order meta',
	// 					errors: err
	// 				});
	// 				return;
	// 			} else {
	// 				res.json({
	// 					success: true,
	// 					message: 'OrderMeta added succesfully'
	// 				});
	// 			}
	// 		});
    //     }}
        }
	});

router.post('/getordersbyuser', function(req, res) {
	if (req.body.userid) {
		Order.find({ userid: req.body.userid }, function(err, orders) {
			if (err) {
				res.json({ success: false, message: err });
			} else {
				res.json({ success: true, orders: orders });
			}
		}).sort({ orderdate: 'desc' });
	} else {
		res.json({ success: false, message: 'User Id is empty' });
	}
});

// router.get('/getorderbyid', function (req, res) {
//     if( req.query.orderid ) {
//         Order.find({orderid: req.query.orderid}, function (err, orders) {
//             if (err) {
//                 res.json({ 'success': false, 'message': err });
//             } else {
//                 res.json({ 'success': true, 'orders': orders });
//             }
//         }).sort({_id: 'asc'});
//     } else {
//         res.json({ 'success': false, 'message': 'User Id is empty' });
//     }
// });

// router.get('/orderdetail', ensureAuthenticated, function (req, res) {
//     const firstDay = moment().tz("Asia/Kolkata").startOf('month');
//     const lastDay   = moment().tz("Asia/Kolkata").endOf('month');
//     Order.
//     find({$and: [{orderdate:{$gte:firstDay}},{orderdate:{$lte:lastDay}}]}).
//       populate('userid').
//       sort({_id: 'desc'}).
//       exec(function (err, orders) {
//         if(err) {
//             console.log(err);
//         } else {
//             res.render('order_details_page.hbs', {
//                 pageTitle: 'Order Details Page',
//                 orders: orders
//             });
//         }
//     });
// });

// router.post('/orderdetail', function(req, res) {
//     var startdate = req.body.startdate;
//     var enddate = req.body.enddate;
//     const startmiliseconds = moment(startdate, "DD/MM/YYYY").tz("Asia/Kolkata").startOf('month').format('x');
//     const endmiliseconds = moment(enddate, "DD/MM/YYYY").tz("Asia/Kolkata").endOf('month').format('x');
//     Order.
//     find({$and: [{ordermilisecond:{$gte:startmiliseconds}},{ordermilisecond:{$lte:endmiliseconds}}]}).
//     populate('userid').
//     sort({orderid: 'desc'})
//     .exec(function (err, orders) {
//         if(err) {
//             console.log(err);
//         } else {
//             res.json({ 'success': true, 'orders': orders });
//         }
//     });
// });

// router.get('/ordersingledetail', function(req, res){
//     var key = req.query.key
//     key = key.split('-').join('&');
//     Order.
// findById(req.query.id).
//   populate('userid').
//   sort({_id: 'desc'}).
//   exec(function (err, order) {
//     if (err) {
//         console.log(err);
//     } else {
//         var orderobject = {};
//         orderobject.date = order.ordermilisecond;
//         orderobject.customername = order.customername;
//         orderobject.brokername = order.brokername;
//         orderobject.customernumber = order.customernumber;
//         orderobject.brokernumber = order.brokernumber;
//         orderobject.user_id = order.user_id;
//         orderobject.id = order._id;
//         orderobject.orderid = order.orderid;
//         orderobject.amount = order.amount;
//         orderobject.ordernote = order.ordernote;
//         orderobject.userid = order.userid;
//         orderobject.transportcharge = order.transportcharge;
//         orderobject.key = key;
//         let cartarray = order.cartobject;
//         for (let index = 0; index < cartarray.length; index++) {
//             let delivary = cartarray[index][key];
//             if (typeof delivary === "undefined") {
//                 console.log("something is undefined");
//             } else {
//                 res.render('order_single_details.hbs', {
//                     pageTitle: 'Order Single Detail',
//                     delivary: delivary,
//                     orderobject: orderobject,
//                     objectindex: index
//                 });
//             }
//         }
//     }
//   });
// });

// router.post('/ordersingledetail', function(req, res){
//     var key = req.body.objectkey;
//     var deliveredQty = req.body.delivaryquantity;
//     var quantity = req.body.quantity;
//     var balancequantity = quantity - deliveredQty;
//     req.checkBody('orderid', 'Order ID is required').notEmpty();
//     req.checkBody('orderid', 'Order ID Shuold be Number only').isNumeric();
//     req.checkBody('delivaryquantity', 'Delivary Quantity is required').notEmpty();
//     req.checkBody('delivaryquantity', 'Delivary Quantity Shuold be Number only').isNumeric();
//     req.checkBody('balancequantity', 'Balanced Quantity is required').notEmpty();
//     req.checkBody('balancequantity', 'Balanced Quantity Shuold be Number only').isNumeric();
//     req.checkBody('userid', 'User ID is required').notEmpty();
//     let errors = req.validationErrors();
//     if (errors) {
//         res.render('order_details_page.hbs', {
//             pageTitle: 'Order Details Page',
//             errors: errors
//         });
//     } else {
//         let cartKey = 'cartobject.'+key;
//         let query = {};
//         query.orderid = req.body.orderid;
//         query[cartKey] = { $exists: true };
//         var setObject = {};
//         setObject["cartobject.$."+ key +".deliveredQty"] = deliveredQty;
//         setObject["cartobject.$."+ key +".balanceQty"] = balancequantity;
//         Order.updateOne(query, {'$set': setObject}, function(err, obj) {
//             if(err) {
//                 console.log(err);
//                 res.render('order_details_page.hbs', {
//                     pageTitle: 'Order Details Page',
//                     errors: err
//                 });
//             } else {
//                 if(obj.nModified != 0) {
//                     Delivery.count({}, function(err, count) {
//                         console.log(err);
//                         let cartobject = {};
//                         cartobject.sku = req.body.sku;
//                         cartobject.brandSerialNumber = req.body.brandSerialNumber;
//                         cartobject.quantity = quantity;
//                         cartobject.productName = req.body.productName;
//                         cartobject.brand = req.body.brand;
//                         cartobject.pack = req.body.pack;
//                         cartobject.price = req.body.price;
//                         cartobject.brandPrice = req.body.brandPrice;
//                         cartobject.deliveredQty = deliveredQty;
//                         cartobject.balanceQty = balancequantity;
//                         cartobject.offerPrice = req.body.offerPrice;
//                         cartobject.staticOfferPrice = req.body.staticOfferPrice;
//                         cartobject.offerId = req.body.offerId;
//                         let delivery = new Delivery();
//                         var date = moment().tz("Asia/Kolkata");
//                         delivery.deliveryid = count + 1;
//                         delivery.orderid = req.body.orderid;
//                         delivery.customernumber = req.body.customernumber;
//                         delivery.brokernumber = req.body.brokernumber;
//                         delivery.user_id = req.body.user_id;
//                         delivery.orderdate = req.body.orderdate;
//                         delivery.deliverydate = date;
//                         delivery.cartobject = cartobject;
//                         delivery.deliverymilisecond = moment().tz("Asia/Kolkata").format('x');
//                         delivery.userid = req.body.userid;
//                         delivery.save(function (err) {
//                             if (err) {
//                                 console.log(err);
//                                 res.render('order_details_page.hbs', {
//                                     pageTitle: 'Order Details Page',
//                                     errors: err
//                                 });
//                             } else {
//                                 var orderdate = moment(req.body.orderdate, "x").tz("Asia/Kolkata").format('DD/MM/YYYY h:mm:ss a');
//                                 var userid = req.body.userid;
//                                 var title = "Order Items Delivered";
//                                 var offermessage = 'Suplier has Delivered '+deliveredQty+' quantity of '+req.body.productName +' '+req.body.brand+' '+req.body.pack.packvalue+' kg for your order Id '+req.body.orderid+' done on '+orderdate;
//                                 var notificationtime = moment().tz("Asia/Kolkata").format('x');
//                                 var type = "Specific";
//                                 var flag = 0;
//                                 let notification = new Notification();
//                                 notification.title = title;
//                                 notification.content = offermessage;
//                                 notification.type = type;
//                                 notification.notificationtime = notificationtime;
//                                 notification.readflag = flag;
//                                 notification.userid = userid;
//                                 notification.save(function (err) {
//                                     if (err) {
//                                         console.log(err);
//                                         return;
//                                     } else {
//                                         console.log('notification saved successfully');
//                                     }
//                                 });
//                                 req.flash('success', 'Delivary Updated');
//                                 res.redirect('/orders/orderdetail');
//                             }
//                         });
//                     });
//                 } else {
//                     res.render('order_details_page.hbs', {
//                         pageTitle: 'Order Details Page',
//                         errors: 'Update Operation failed'
//                     });
//                 }
//             }
//         });
//     }
// });

// router.get('/all', function (req, res) {
// //     OrderProduct.
// // find({}).
// //   sort({_id: 'desc'}).
// //   exec(function (err, orders) {
// //     if(err) {
// //         console.log(err);
// //     } else {
//         res.render('all_orders.hbs', {
//             pageTitle: 'All Orders'
//         });
// //     }
// //   });

// // res.status({data});
// });

// router.get('/allorder',function (req, res) {
//     Order.
// find({}).
//   populate('userid').
//   sort({_id: 'desc'}).
//   exec(function (err, orders) {
//     if(err) {
//         res.json({ 'success': false, 'message': err });
//     } else {
//         res.json({ 'success': true, 'orders': orders });
//     }
//   });
// });

// router.get('/allorderbydate',function (req, res) {
//     var DateSplit, orderDate, start, end, startmiliseconds, endmiliseconds ;
//     if(req.query.date) {
//         startmiliseconds = moment(orderDate, "DD/MM/YYYY").tz("Asia/Kolkata").startOf('day').format('x');
//         endmiliseconds = moment(orderDate, "DD/MM/YYYY").tz("Asia/Kolkata").endOf('day').format('x');
//     } else {
//         startmiliseconds = moment().tz("Asia/Kolkata").startOf('day').format('x');
//         endmiliseconds = moment().tz("Asia/Kolkata").endOf('day').format('x');
//     }
//     Order.
//     find({$and: [{ordermilisecond:{$gte:startmiliseconds}},{ordermilisecond:{$lte:endmiliseconds}}]}).
//       populate('userid').
//       sort({_id: 'desc'}).
//       exec(function (err, orders) {
//         if(err) {
//             res.json({ 'success': false, 'message': err });
//         } else {
//             res.json({ 'success': true, 'orders': orders });
//         }
//       });
// });

// router.get('/deliverybyuserid',function (req, res) {
//     Delivery.find({userid: req.query.userid, paymentflag: 0}, 'deliveryid', function (err, deliveries) {
//         if (err) {
//             res.json({ 'success': false, 'message': err });
//         } else {
//             res.json({ 'success': true, 'deliveries': deliveries });
//         }
//     }).sort({_id: 'desc'});
// });

// router.get('/deliverybydeliveryid',function (req, res) {
//     Delivery.findById(req.query.id, function (err, delivery) {
//         if (err) {
//             res.json({ 'success': false, 'message': err });
//         } else {
//             res.json({ 'success': true, 'delivery': delivery });
//         }
//     }).sort({_id: 'desc'});
// });

// router.get('/deliverybyorderid',function (req, res) {
//     Order.findOne({orderid: req.query.orderid}, function (err, order) {
//         if (err) {
//             res.json({ 'success': false, 'message': err });
//         } else {
//             Delivery.find({orderid: req.query.orderid}, function (err, deliveries) {
//                 if (err) {
//                     res.json({ 'success': false, 'message': err });
//                 } else {
//                     res.json({ 'success': true, 'deliveries': deliveries, 'order': order });
//                 }
//             }).sort({_id: 'desc'});
//         }
//     }).sort({_id: 'desc'});
// });

// router.get('/:id', ensureAuthenticated, function(req, res){
//     Order.
//     findById(req.params.id).
//       populate('userid').
//       sort({_id: 'desc'}).
//       exec(function (err, order) {
//         if(err) {
//             console.log(err);
//         } else {
//             res.render('order_single.hbs', {
//                 pageTitle: 'Order',
//                 order:order
//             });
//         }
//       });
// });

// router.delete('/:id', function(req, res){
//     if(!req.user._id){
//       res.status(500).send();
//     }
//     let query = {_id:req.params.id}
//     Order.findById(req.params.id, function(err, order){
//         Order.remove(query, function(err){
//           if(err){
//             console.log(err);
//           }
//           res.send('Success');
//         });
//     });
// });

// // Access Control
// function ensureAuthenticated(req, res, next) {
//     if (req.isAuthenticated()) {
//         return next();
//     } else {
//         req.flash('danger', 'Please login');
//         req.session.returnTo = req.originalUrl;
//         res.redirect('/users/login');
//     }
// }

module.exports = router;
