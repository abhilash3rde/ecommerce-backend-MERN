const express = require('express');
const router = express.Router();
const moment = require('moment-timezone');
const bcrypt = require('bcryptjs');
const passport = require('passport');
let User = require('../models/user');

router.post('/add', function(req, res){
    const name = req.body.name;
    const email = req.body.email;
    const phonenumber = req.body.phonenumber;
    const role = req.body.role;
    const password = req.body.phonenumber;
    const accountnumber = req.body.accountnumber;
    const station = req.body.station;
    const status = 'active';
    const myreferencecode = gererateReferalCode(req.body.phonenumber);
    const referedcodeused = '';
    const referalamout = 0;
    const discountbyrefnumber = 0;
    req.checkBody('name', 'Name is required').notEmpty();
    req.checkBody('role', 'Type is required').notEmpty();
    req.checkBody('email', 'Email is required').notEmpty();
    req.checkBody('email', 'Email is not valid').isEmail();
    req.checkBody('phonenumber', 'phonenumber is required').notEmpty();
    req.checkBody('phonenumber', 'phonenumber should be number only').isNumeric();
    let errors = req.validationErrors();
    if (errors) {
        res.json({ 'success': false, 'message': 'Validation error', errors: errors });
    } else {
        User.findOne({phonenumber: req.body.phonenumber}, function(errors, user){
            if(errors) {
                console.log(errors);
                res.json({ 'success': false, 'message': 'Error in finding Phonenumber', errors: errors });
            }
            if(!user){
                let newUser = new User({
                    name:name,
                    email:email,
                    phonenumber:phonenumber,
                    password:password,
                    role:role,
                    accountnumber:accountnumber,
                    station:station,
                    status:status,
                    myreferencecode:myreferencecode,
                    referedcodeused:referedcodeused,
                    referalamout:referalamout,
                    discountbyrefnumber:discountbyrefnumber
                });
                bcrypt.genSalt(10, function(errors, salt) {
                    bcrypt.hash(newUser.password, salt, function(errors, hash){
                      if(errors){
                        res.json({ 'success': false, 'message': 'Error in Generating Password Hash', errors: errors });
                      }
                      newUser.password = hash;
                      newUser.save(function(errors){
                        if(errors){
                            console.log(errors);
                            res.json({ 'success': false, 'message': 'Error in Saving User', errors: errors });
                        } else {
                          res.json({ 'success': true, 'message': 'User added succesfully'});
                        }
                      });
                    });
                });
            } else {
                var errors = 'User already exist with this phone number';
                res.json({ 'success': false, 'message': 'User already exist with this phone number', serialerror: 'User already exist with this phone number' });
            }  
        });
    }
});

router.get('/all', ensureAuthenticated, function (req, res) {
    User.find({}, function (err, users) {
        if (err) {
            console.log(err);
        } else {
            res.render('all_brokers.hbs', {
                pageTitle: 'All Party Master',
                users: users
            });
        }
    }).sort({_id: 'asc'});
});

router.get('/:id', ensureAuthenticated, function(req, res){
    User.findById(req.params.id, function(err, user){
        if (err) {
            res.json({ 'success': false, 'message': 'error in fetching Broker Details' });
        } else {
            res.json({ 'success': true, 'broker': user });
        }
    });
});


router.post('/edit/:id', function(req, res){
    req.checkBody('name', 'Name is required').notEmpty();
    req.checkBody('role', 'Type is required').notEmpty();
    req.checkBody('email', 'Email is required').notEmpty();
    req.checkBody('email', 'Email is not valid').isEmail();
    req.checkBody('phonenumber', 'phonenumber is required').notEmpty();
    req.checkBody('phonenumber', 'phonenumber should be number only').isNumeric();
    let errors = req.validationErrors();
    if (errors) {
        res.json({ 'success': false, 'message': 'Validation error', errors: errors });
    } else {
        let user = {};
        user.role = req.body.role;
        user.accountnumber = req.body.accountnumber;
        user.phonenumber = req.body.phonenumber;
        user.name = req.body.name;
        user.station = req.body.station;
        user.email = req.body.email;
        user.status = req.body.status;
        let query = {_id:req.params.id}
        User.update(query, user, function(err){
            if(err){
                res.json({ 'success': false, 'message': 'Error in Updating User', errors: err });
            } else {
                res.json({ 'success': true, 'message': 'User Updated'});
            }
        });
    }
});

router.delete('/:id', function(req, res){
    if(!req.user._id){
      res.status(500).send();
    }
    let query = {_id:req.params.id}
    User.findById(req.params.id, function(err, user){
        User.remove(query, function(err){
          if(err){
            console.log(err);
          }
          res.send('Success');
        });
    });
});

  // Access Control
  function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        req.flash('danger', 'Please login');
        req.session.returnTo = req.originalUrl;
        res.redirect('/users/login');
    }
}

function gererateReferalCode(input) {
    input = input * Math.floor(Math.random() * 90 + 10);
    var hash = "",
    alphabet = "0123456789abcdef",
    alphabetLength = alphabet.length;
    do {
    hash = alphabet[input % alphabetLength] + hash;
    input = parseInt(input / alphabetLength, 10);
    } while (input);
    return hash;
}

module.exports = router;