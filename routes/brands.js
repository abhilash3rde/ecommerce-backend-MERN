const express = require('express');
const router = express.Router();
var path = require('path');
const moment = require('moment-timezone');
var fs = require('fs');
var aws = require('aws-sdk');
var bodyParser = require('body-parser');
var multer = require('multer');
var multerS3 = require('multer-s3');
let Brand = require('../models/brand');

aws.config.update({
    secretAccessKey: '8C9jSK5K8URFv+FhCHPHceprydP4v9TE5q+qSfkq',
    accessKeyId: 'AKIAIEXHVVF45KDJQPVA',
    region: 'us-east-2'
});

const app = express();
const s3 = new aws.S3();

app.use(bodyParser.json());

const upload = multer({
    storage: multerS3({
        s3: s3,
        acl: 'public-read',
        bucket: 'elasticbeanstalk-us-east-2-797993184252',
        metadata: function (req, file, cb) {
        cb(null, {fieldName: file.fieldname});
        },
        key: function (req, file, cb) {
            cb(null, Date.now() + '-bd-' + file.originalname);
        }
    }),
    fileFilter: function (req, file, callback) {
        var ext = path.extname(file.originalname);
        if(ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg') {
            req.fileValidationError = "Forbidden extension";
            return callback(null, false, req.fileValidationError);
        }
        callback(null, true)
    },
    limits:{
        fileSize: 420 * 150 * 200
    }
});

router.post('/add', upload.single('brandimage'), (req, res, next) => {
    req.checkBody('brandtitle', 'Title is required').notEmpty();
    req.checkBody('brandserialnumber', 'Brand Serial is required').notEmpty();
    req.checkBody('brandserialnumber', 'Brand Serial is Number Only').isNumeric();
    req.checkBody('branddescription', 'Brand Description is required').notEmpty();
    let errors = req.validationErrors();
    if (errors) {
        if(req.file) {
            let filename = req.file.location;
            var params = {
                Bucket: 'elasticbeanstalk-us-east-2-797993184252',
                Key: filename
            };
            s3.deleteObject(params, function (err, data) {
                if (data) {
                    console.log("File deleted successfully");
                }
                else {
                    console.log("Check if you have sufficient permissions : "+err);
                }
            });
        }
        res.json({ 'success': false, 'message': 'Validation error', errors: errors });
    } else {
        if (req.fileValidationError) {  
            res.json({ 'success': false, 'message': 'File Validation error', errors: req.fileValidationError });   
        } else {
            Brand.findOne({brandserialnumber: req.body.brandserialnumber}, function(err,brand) {
                if (err) {
                    res.json({ 'success': false, 'message': 'Brand Serial error', errors: err });
                }
                if(!brand) {
                    let brand = new Brand();
                    brand.brandserialnumber = req.body.brandserialnumber;
                    brand.brandtitle = req.body.brandtitle;
                    brand.branddescription = req.body.branddescription;
                    if(req.file) {
                        brand.filepath = req.file.location;
                        brand.filename = req.file.key;
                    }
                    brand.save(function (err) {
                        if (err) {
                            res.json({ 'success': false, 'message': 'Error in Saving Brand', errors: err });
                        } else {
                            res.json({ 'success': true, 'message': 'Brand Added'});
                        }
                    });
                } else {
                    res.json({ 'success': false, 'message': 'Brand Serial error', serialerror: 'duplicate serial number' });
                }
            });
        }      
    }
});

router.get('/all', ensureAuthenticated, function (req, res) {
    Brand.find({}, function (err, brands) {
        if (err) {
            console.log(err);
        } else {
            res.render('all_brands.hbs', {
                pageTitle: 'All Brands',
                brands: brands
            });
        }
    }).sort({brandserialnumber: 'asc'});
});

router.get('/getbrands', function (req, res) {
    Brand.find({}, function (err, brands) {
        if (err) {
            res.json({ 'success': false, 'message': 'Error in fetching Brands Record' });
        } else {
            res.json({ 'success': true, 'brands': brands });
        }
    }).sort({brandserialnumber: 'asc'});
});

router.get('/:id', ensureAuthenticated, function(req, res){
    Brand.findById(req.params.id, function(err, brand){
        if (err) {
            res.json({ 'success': false, 'message': 'error in fetching Brand details' });
        } else {
            res.json({ 'success': true, 'brand': brand });
        }
    });
});


router.post('/edit/:id', upload.single('brandimage'), function(req, res){
    req.checkBody('brandtitle', 'Title is required').notEmpty();
    req.checkBody('branddescription', 'Brand Description is required').notEmpty();
    let errors = req.validationErrors();
    if (errors) {
        if(req.file) {
            let filename = req.file.location;
            var params = {
                Bucket: 'elasticbeanstalk-us-east-2-797993184252',
                Key: filename
            };
            s3.deleteObject(params, function (err, data) {
                if (data) {
                    console.log("File deleted successfully");
                }
                else {
                    console.log("Check if you have sufficient permissions : "+err);
                }
            });
        }
        res.json({ 'success': false, 'message': 'Validation error', errors: errors });
    } else {
        if (req.fileValidationError) {
            res.json({ 'success': false, 'message': 'File Validation error', errors: req.fileValidationError });    
        } else {
            let brand = {};
            brand.brandtitle = req.body.brandtitle;
            brand.branddescription = req.body.branddescription;
            if(req.file) { 
                brand.filepath = req.file.location;
                brand.filename = req.file.key;
                var params = {
                    Bucket: 'elasticbeanstalk-us-east-2-797993184252',
                    Key: req.body.previousfilename
                };
                s3.deleteObject(params, function (err, data) {
                    if (data) {
                        console.log("File deleted successfully");
                    }
                    else {
                        console.log("Check if you have sufficient permissions : "+err);
                    }
                });
            }
            let query = {_id:req.params.id}
            Brand.update(query, brand, function(err){
                if(err){
                    res.json({ 'success': false, 'message': 'Error in Updating Brand', errors: err });
                } else {
                    res.json({ 'success': true, 'message': 'Brand Updated'});
                }
            });
        }
    }
});

router.delete('/:id', function(req, res){
    if(!req.user._id){
      res.status(500).send();
    }
    let query = {_id:req.params.id}
    Brand.findById(req.params.id, function(err, brand){
        Brand.remove(query, function(err){
          if(err){
            console.log(err);
          }
          res.send('Success');
        });
    });
});

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        req.flash('danger', 'Please login');
        req.session.returnTo = req.originalUrl;
        res.redirect('/users/login');
    }
}

module.exports = router;