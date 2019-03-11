const bcrypt 		= require('bcryptjs');
const db            = require('../config/database');
const User 			= db.User;
const async 		= require('async');
// var crypto = require('crypto');
// const nodemailer = require('nodemailer');




// async function getParents_verified() {
// 	return await User.find({ role: 'parent', status: 1 }).select('-1');
// }

// //get al the unverified parents
// async function getParents_Nverified() {
// 	return await User.find({ role: 'parent', status: 0 });
// }

// // get all the verified admins
// async function getadmin_verified() {
// 	return await User.find({ role: 'admin', status: 1 });
// }

// //get al the unverified admins
// async function getadmin_Nverified() {
// 	return await User.find({ role: 'admin', status: 0 });
// }

// // get all the verified teachers
// async function getTeachers_verified() {
// 	return await User.find({ role: 'teacher', status: 1 });
// }

// //get al the unverified teachers
// async function getTeachers_Nverified() {
// 	return await User.find({ role: 'teacher', status: 0 });
// }

// //get users by id
// async function getById(id) {
// 	return await User.findById(id).select('-hash');
// }

// async function create(userParam) {
// 	// validate
// 	if (await User.findOne({ username: userParam.email })) {
// 		throw 'Email "' + userParam.email + '" is already taken';
// 	}

// 	const user = new User(userParam);
// 	// hash password
// 	if (userParam.password) {
// 		user.hash = bcrypt.hashSync(userParam.password, 10);
// 	}

// 	// save user
// 	await user.save();
// }

// async function update(id, userParam) {
// 	const user = await User.findById(id);

// 	// validate
// 	if (!user) throw 'User not found';
// 	if (user.email !== userParam.email && (await User.findOne({ username: userParam.email }))) {
// 		throw 'Email "' + userParam.email + '" is already taken';
// 	}

// 	// hash password if it was entered
// 	if (userParam.password) {
// 		userParam.hash = bcrypt.hashSync(userParam.password, 10);
// 	}

// 	// copy userParam properties to user
// 	Object.assign(user, userParam);
// 	await user.save();
// }

// async function assignToken(email) {
// 	console.log('token function executed');
// 	async.waterfall(
// 		[
// 			function(done) {
// 				crypto.randomBytes(20, function(err, buf) {
// 					var token = buf.toString('hex');
// 					done(err, token);
// 				});
// 			},
// 			function(token, done) {
// 				User.findOneAndUpdate(
// 					{ email: email },
// 					{
// 						$set: {
// 							passwordtoken: token,
// 							passwordexpires: Date.now() + 3600000
// 						}
// 					}
// 				).exec(function(err, user) {
// 					console.log('1');
// 					done(err, token, user);
// 					console.log('2');
// 				});
// 			},
// 			function(token, user, done) {
// 				var smtpTransport = nodemailer.createTransport(
// 					'smtps://anas3rde@gmail.com:3rde@123@smtp.gmail.com'
// 				);

// 				var mailOptions = {
// 					from: 'anas3rde@gmail.com',
// 					to: 'anasmi.business@gmail.com',
// 					subject: 'Test',
// 					text:
// 						'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
// 						'http://localhost:' +
// 						process.env.PORT +
// 						'/users/setpassword/' +
// 						token +
// 						'\n\n'
// 				};
// 				smtpTransport.sendMail(mailOptions, function(err) {
// 					console.log('Email sent');
// 					done(err, 'done');
// 				});
// 			}
// 		],
// 		function(err) {
// 			if (err) console.log(err);
// 		}
// 	);
// }

//  async function verifytoken(token){
//     console.log("from service");
//     User.findOne({passwordtoken: token, passwordexpires: { $gt: Date.now() } }, function(err, user) {
//         if (user) {
//              console.log("user found");
//         } else {
//              console.error("No user with such token or token expired")
//             }
//    })};

// function setPassword(token, password) {
// 	var hashp = bcrypt.hashSync(password, 10);
// 	User.findOneAndUpdate(
// 		{
// 			passwordtoken: token,
// 			passwordexpires: { $gt: Date.now() }
// 		},
// 		{
// 			$set: {
// 				password: hashp,
// 				passwordToken: undefined,
// 				passwordExpires: undefined
// 			}
// 		},
// 		function(err, user) {
// 			var smtptransport2 = nodemailer.createTransport(
// 				'smtps://anas3rde@gmail.com:3rde@123@smtp.gmail.com'
// 			);
// 			var mailOptions = {
// 				to: 'anasmi.business@gmail.com',
// 				from: 'anas3rde@gmail.com',
// 				subject: 'Registration Successful',
// 				text: "You've been successfully registered on "
// 			};
// 			smtptransport2.sendMail(mailOptions, function(err) {
// 				done(err);
// 				res.json({ status: 'Registration complete' });
// 			});
// 		}
// 	);
// }

// async function _delete(id) {
// 	await User.findByIdAndRemove(id);
// }

module.exports = {
	getTeachers_verified,
	getTeachers_Nverified,
	getadmin_verified,
	getadmin_Nverified,
	getParents_verified,
	getParents_Nverified,
	getById,
	create,
	update,
	delete: _delete,
	assignToken,
	setPassword
};
