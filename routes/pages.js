const express       = require('express');
const router        = express.Router();
const cors          = require('cors');
const path          = require('path');
var aws             = require('aws-sdk');
var bodyParser      = require('body-parser');
var multer          = require('multer');
var multerS3        = require('multer-s3');
const bcrypt        = require('bcryptjs');
const db            = require('../config/database');
const User          = db.User;
const UserMeta      = db.UserMeta;
const Page          = db.Page;
const OrderProduct = require("../models/order_product");
const Notify = require("../models/notification");
aws.config.update({
    secretAccessKey: 'Kl0XJuTHXPcvaFwChQa+U8FixUnDA/c1A2T8/XSS',
    accessKeyId: 'AKIAIGS6EL4YZXFOIOBQ',
    region: 'us-east-2'
});

const app = express();
const s3 = new aws.S3();

app.use(bodyParser.json());

const upload = multer({
    storage: multerS3({
        s3: s3,
        acl: 'public-read',
        bucket: 'maxxbio',
        metadata: function (req, file, cb) {
        cb(null, {fieldName: file.fieldname});
        },
        key: function (req, file, cb) {
            cb(null, Date.now() + '-prd-' + file.originalname);
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


//registration for usermanagement
// Register Proccess







//Marking notifications as read 
router.get("/orders/alerts/:id", async function(req, res){

    Notify.findOneAndUpdate({_id: req.params.id}, {$set: {
        "readflag" : true
    }}).then(() => res.redirect("/pages/orders/allalerts"));
});

//Displaying all Notifications
router.get("/orders/allalerts", async function(req, res){
    
    Notify.find({"readflag" : false}).then((data) => show(data));

    function show(data){
    res.status(200).render('alerts.hbs', {
        pageTitle: 'All Alerts',
        alerts: data
    });
} 
});




//post layout page 
router.post("/layout/add", async function(req, res){
    console.log({data:req.body});
});


//Route to process any particular Order
router.get("/orders/process/:id", async function(req, res){
    console.log("Process function not yet created");
    res.status(200).render('process.hbs', {
        pageTitle: 'Process Order'
    });   
});

//Route to delet any particular order
router.get("/orders/delete/:id", function(req, res){
    let query = req.params.id;
    
    OrderProduct.findById(query, function(err, product){
        OrderProduct.remove({query}, function(err){
          if(err){
            console.log(err);
          } else {
              res.redirect('/pages/orders/all');}
        });
    });
});




//viewing order 
router.get("/orders/view/:id", async function(req, res){

    let query = req.params.id;
    OrderProduct.find({_id: query}).exec(function(err, orders){
        if(err){
            res.json({status: false, error: err})
        } else {
            let product = {};
            product = orders.orderproduct;
            console.log(product);
            
            res.status(200).render('view_order.hbs', {
                pageTitle: 'View Ordered Products',
                orders: orders,

            });    
        }
    });
	  
});




// Route to get all orders
router.get('/orders/all', function (req, res) {
OrderProduct.find({}).
      sort({_id: 'desc'}).
      exec(function (err, orders) {
        if(err) {
            console.log(err);
        } else {
            res.render('all_orders.hbs', {
                pageTitle: 'All Orders',
                orders: orders 
            });
    //     }
    //   });
    
    // res.status({data});
    }})});

//create new Layout page
router.get('/layout/add', function (req, res) {
    
    let layoutDropDown  = {};
    layoutDropDown.layout1 = "Layout1";
    layoutDropDown.home = "Home";
    console.log("layout function");
    let countries = ["Afghanistan","Albania","Algeria","Andorra","Angola","Anguilla","Antigua &amp; Barbuda","Argentina","Armenia","Aruba","Australia","Austria","Azerbaijan","Bahamas"
	,"Bahrain","Bangladesh","Barbados","Belarus","Belgium","Belize","Benin","Bermuda","Bhutan","Bolivia","Bosnia &amp; Herzegovina","Botswana","Brazil","British Virgin Islands"
	,"Brunei","Bulgaria","Burkina Faso","Burundi","Cambodia","Cameroon","Canada","Cape Verde","Cayman Islands","Chad","Chile","China","Colombia","Congo","Cook Islands","Costa Rica"
	,"Cote D Ivoire","Croatia","Cruise Ship","Cuba","Cyprus","Czech Republic","Denmark","Djibouti","Dominica","Dominican Republic","Ecuador","Egypt","El Salvador","Equatorial Guinea"
	,"Estonia","Ethiopia","Falkland Islands","Faroe Islands","Fiji","Finland","France","French Polynesia","French West Indies","Gabon","Gambia","Georgia","Germany","Ghana"
	,"Gibraltar","Greece","Greenland","Grenada","Guam","Guatemala","Guernsey","Guinea","Guinea Bissau","Guyana","Haiti","Honduras","Hong Kong","Hungary","Iceland","India"
	,"Indonesia","Iran","Iraq","Ireland","Isle of Man","Israel","Italy","Jamaica","Japan","Jersey","Jordan","Kazakhstan","Kenya","Kuwait","Kyrgyz Republic","Laos","Latvia"
	,"Lebanon","Lesotho","Liberia","Libya","Liechtenstein","Lithuania","Luxembourg","Macau","Macedonia","Madagascar","Malawi","Malaysia","Maldives","Mali","Malta","Mauritania"
	,"Mauritius","Mexico","Moldova","Monaco","Mongolia","Montenegro","Montserrat","Morocco","Mozambique","Namibia","Nepal","Netherlands","Netherlands Antilles","New Caledonia"
	,"New Zealand","Nicaragua","Niger","Nigeria","Norway","Oman","Pakistan","Palestine","Panama","Papua New Guinea","Paraguay","Peru","Philippines","Poland","Portugal"
	,"Puerto Rico","Qatar","Reunion","Romania","Russia","Rwanda","Saint Pierre &amp; Miquelon","Samoa","San Marino","Satellite","Saudi Arabia","Senegal","Serbia","Seychelles"
	,"Sierra Leone","Singapore","Slovakia","Slovenia","South Africa","South Korea","Spain","Sri Lanka","St Kitts &amp; Nevis","St Lucia","St Vincent","St. Lucia","Sudan"
	,"Suriname","Swaziland","Sweden","Switzerland","Syria","Taiwan","Tajikistan","Tanzania","Thailand","Timor L'Este","Togo","Tonga","Trinidad &amp; Tobago","Tunisia"
	,"Turkey","Turkmenistan","Turks &amp; Caicos","Uganda","Ukraine","United Arab Emirates","United Kingdom","United States","United States Minor Outlying Islands","Uruguay"
	,"Uzbekistan","Venezuela","Vietnam","Virgin Islands (US)","Yemen","Zambia","Zimbabwe"];

    res.render('add-layout.hbs', {
        pageTitle: 'Add Layout',
        layoutDropDown: layoutDropDown,
        countries: countries,
        action: 'add'
    });
});



router.get('/add', ensureAuthenticated, function (req, res) {
    let layoutDropDown  = {};
    layoutDropDown.home = "Home";
   layoutDropDown.contact = "Contact";
    layoutDropDown.shippingreturns = "Shipping & Returns";
    layoutDropDown.faq = "FAQ";
    layoutDropDown.about = "About";
    layoutDropDown.qualityguarantee = "Quality Guarantee";
    layoutDropDown.affiliateprogram = "Affiliate program";
    layoutDropDown.press = "Press";
    layoutDropDown.policies = "Policies";
    layoutDropDown.terms = "Terms";
    layoutDropDown.privacy = "Privacy";
    layoutDropDown.cookies = "Cookies";
    layoutDropDown.accessibility = "Accessibility";
    layoutDropDown.fda = "FDA"

    // let countries = ['Hong Kong', 'Japan', 'Republic of Korea', 'Singapore', 'Taiwan', 'Thailand', 'Andorra', 'Austria', 'Belgium', 'Bulgaria', 'Cyprus', 'Czech', 'Denmark', 'Estonia', 'Finland', 'France', 'Germany', 'Greece', 'Iceland', 'Ireland', 'Italy', 'Latvia', 'Lithuania', 'Luxembourg', 'Malta', 'Monaco', 'Netherlands', 'Norway', 'Poland', 'Portugal', 'Romania', 'San Marino', 'Slovak Republic', 'Slovenia', 'Spain', 'Sweden', 'Switzerland', 'United Kingdom'];

    var countries = ["Afghanistan","Albania","Algeria","Andorra","Angola","Anguilla","Antigua &amp; Barbuda","Argentina","Armenia","Aruba","Australia","Austria","Azerbaijan","Bahamas"
	,"Bahrain","Bangladesh","Barbados","Belarus","Belgium","Belize","Benin","Bermuda","Bhutan","Bolivia","Bosnia &amp; Herzegovina","Botswana","Brazil","British Virgin Islands"
	,"Brunei","Bulgaria","Burkina Faso","Burundi","Cambodia","Cameroon","Canada","Cape Verde","Cayman Islands","Chad","Chile","China","Colombia","Congo","Cook Islands","Costa Rica"
	,"Cote D Ivoire","Croatia","Cruise Ship","Cuba","Cyprus","Czech Republic","Denmark","Djibouti","Dominica","Dominican Republic","Ecuador","Egypt","El Salvador","Equatorial Guinea"
	,"Estonia","Ethiopia","Falkland Islands","Faroe Islands","Fiji","Finland","France","French Polynesia","French West Indies","Gabon","Gambia","Georgia","Germany","Ghana"
	,"Gibraltar","Greece","Greenland","Grenada","Guam","Guatemala","Guernsey","Guinea","Guinea Bissau","Guyana","Haiti","Honduras","Hong Kong","Hungary","Iceland","India"
	,"Indonesia","Iran","Iraq","Ireland","Isle of Man","Israel","Italy","Jamaica","Japan","Jersey","Jordan","Kazakhstan","Kenya","Kuwait","Kyrgyz Republic","Laos","Latvia"
	,"Lebanon","Lesotho","Liberia","Libya","Liechtenstein","Lithuania","Luxembourg","Macau","Macedonia","Madagascar","Malawi","Malaysia","Maldives","Mali","Malta","Mauritania"
	,"Mauritius","Mexico","Moldova","Monaco","Mongolia","Montenegro","Montserrat","Morocco","Mozambique","Namibia","Nepal","Netherlands","Netherlands Antilles","New Caledonia"
	,"New Zealand","Nicaragua","Niger","Nigeria","Norway","Oman","Pakistan","Palestine","Panama","Papua New Guinea","Paraguay","Peru","Philippines","Poland","Portugal"
	,"Puerto Rico","Qatar","Reunion","Romania","Russia","Rwanda","Saint Pierre &amp; Miquelon","Samoa","San Marino","Satellite","Saudi Arabia","Senegal","Serbia","Seychelles"
	,"Sierra Leone","Singapore","Slovakia","Slovenia","South Africa","South Korea","Spain","Sri Lanka","St Kitts &amp; Nevis","St Lucia","St Vincent","St. Lucia","Sudan"
	,"Suriname","Swaziland","Sweden","Switzerland","Syria","Taiwan","Tajikistan","Tanzania","Thailand","Timor L'Este","Togo","Tonga","Trinidad &amp; Tobago","Tunisia"
	,"Turkey","Turkmenistan","Turks &amp; Caicos","Uganda","Ukraine","United Arab Emirates","United Kingdom","United States","United States Minor Outlying Islands","Uruguay"
	,"Uzbekistan","Venezuela","Vietnam","Virgin Islands (US)","Yemen","Zambia","Zimbabwe"];



    res.render('add-page.hbs', {
        pageTitle: 'Add Page',
        layoutDropDown: layoutDropDown,
        countries: countries,
        action: 'add'
    });
});


//Add new html page route
router.get('/layout/html', async function(req, res){

    var countries = ["Afghanistan","Albania","Algeria","Andorra","Angola","Anguilla","Antigua &amp; Barbuda","Argentina","Armenia","Aruba","Australia","Austria","Azerbaijan","Bahamas"
	,"Bahrain","Bangladesh","Barbados","Belarus","Belgium","Belize","Benin","Bermuda","Bhutan","Bolivia","Bosnia &amp; Herzegovina","Botswana","Brazil","British Virgin Islands"
	,"Brunei","Bulgaria","Burkina Faso","Burundi","Cambodia","Cameroon","Canada","Cape Verde","Cayman Islands","Chad","Chile","China","Colombia","Congo","Cook Islands","Costa Rica"
	,"Cote D Ivoire","Croatia","Cruise Ship","Cuba","Cyprus","Czech Republic","Denmark","Djibouti","Dominica","Dominican Republic","Ecuador","Egypt","El Salvador","Equatorial Guinea"
	,"Estonia","Ethiopia","Falkland Islands","Faroe Islands","Fiji","Finland","France","French Polynesia","French West Indies","Gabon","Gambia","Georgia","Germany","Ghana"
	,"Gibraltar","Greece","Greenland","Grenada","Guam","Guatemala","Guernsey","Guinea","Guinea Bissau","Guyana","Haiti","Honduras","Hong Kong","Hungary","Iceland","India"
	,"Indonesia","Iran","Iraq","Ireland","Isle of Man","Israel","Italy","Jamaica","Japan","Jersey","Jordan","Kazakhstan","Kenya","Kuwait","Kyrgyz Republic","Laos","Latvia"
	,"Lebanon","Lesotho","Liberia","Libya","Liechtenstein","Lithuania","Luxembourg","Macau","Macedonia","Madagascar","Malawi","Malaysia","Maldives","Mali","Malta","Mauritania"
	,"Mauritius","Mexico","Moldova","Monaco","Mongolia","Montenegro","Montserrat","Morocco","Mozambique","Namibia","Nepal","Netherlands","Netherlands Antilles","New Caledonia"
	,"New Zealand","Nicaragua","Niger","Nigeria","Norway","Oman","Pakistan","Palestine","Panama","Papua New Guinea","Paraguay","Peru","Philippines","Poland","Portugal"
	,"Puerto Rico","Qatar","Reunion","Romania","Russia","Rwanda","Saint Pierre &amp; Miquelon","Samoa","San Marino","Satellite","Saudi Arabia","Senegal","Serbia","Seychelles"
	,"Sierra Leone","Singapore","Slovakia","Slovenia","South Africa","South Korea","Spain","Sri Lanka","St Kitts &amp; Nevis","St Lucia","St Vincent","St. Lucia","Sudan"
	,"Suriname","Swaziland","Sweden","Switzerland","Syria","Taiwan","Tajikistan","Tanzania","Thailand","Timor L'Este","Togo","Tonga","Trinidad &amp; Tobago","Tunisia"
	,"Turkey","Turkmenistan","Turks &amp; Caicos","Uganda","Ukraine","United Arab Emirates","United Kingdom","United States","United States Minor Outlying Islands","Uruguay"
	,"Uzbekistan","Venezuela","Vietnam","Virgin Islands (US)","Yemen","Zambia","Zimbabwe"];

    res.render('add-html.hbs', {
        pageTitle: 'Add html'
        // countries: countries
    });

});


router.post('/add', upload.any(), async function(req, res) {
    // if(req.body.titlelayout1){
    //     req.checkbody('titlelayout1', "page title is required ");
    // }
    // req.checkBody('title', 'Page Title is required').notEmpty();
    // if(req.body.title){
    // req.checkBody('layout', 'Page Layout is required').notEmpty()};
    // req.checkBody('country', 'Page Country is required').notEmpty();
    let errors = req.validationErrors();
    let filesArray = req.files;
    if (errors) {
        if(req.files) {
            filesArray.map( (item, index)=> {
                let insertfilename = item.location;
                var params = {
                    Bucket: 'elasticbeanstalk-us-east-2-797993184252',
                    Key: insertfilename
                };

                s3.deleteObject(params, function (err, data) {
                    if (data) {
                        console.log("File deleted successfully");
                    }
                    else {
                        console.log("Check if you have sufficient permissions : "+err);
                    }
                });
            });
        }
        return res.status(404).json({ 'success': false, 'message': 'validation error' });
    }
    if(req.fileValidationError) return res.json({ 'success': false, 'message': 'File Validation error', errors: req.fileValidationError }); 
     
    let pageExist  = await Page.findOne({title: req.body.title}).select('-1').sort({_id: 'asc'});
    if(pageExist){
        res.json({ 'success': false, 'message': 'Page already exist with this Title', 'serialerror': 'Page already exist with this Title' });
    } else {
        console.log(req.body);
        if(req.body.titlelayout1){
            //Code for layout 1 starts from here

            let optionsData = {};
        if(req.files) {
            filesArray.map( async (item, index)=> {
                let fieldname           = item.fieldname
                optionsData[fieldname]  = item.location;
            });
        }
        let page               = new Page();
        page.title             = req.body.titlelayout1;
        page.layout            = 'layout1';
        page.country           = req.body.country;
        let items              = {};

        items["firstsection"]  = {
            visibility: req.body.firstvisibility,
            title: req.body.firsttitle,
            author: req.body.firstauthor,
            title: req.body.firstdate,
            description: req.body.firstdescription,
            firstorder: req.body.firstorder,
            imagelink: optionsData.firstimage}

        items["secondsection"] = {
            secondtitle: req.body.secondtitle,
            seconddescription: req.body.seconddescription,
            secondorder: req.body.secondorder,
            secondtitle1: req.body.secondtitle1,
            seconddescription1: req.body.seconddescription1,
            secondorder1: req.body.secondorder1,
            secondtitle2: req.body.secondtitle2,
            seconddescription2: req.body.seconddescription2,
            secondorder2: req.body.secondorder2,
            secondtitle3: req.body.secondtitle3,
            seconddescription4: req.body.secondescription4,
            secondorder3: req.body.secondorder3,
            secondtitle4: req.body.secondtitle4,
            secondorder4: req.body.secondorder4}

        items["thirdsection"]  = {
            thirdtitle: req.body.thirdtitle,
            thirddescription: req.body.thirddescription,
            thirdbtntext: req.body.thirdbtntext,
            thirdbtnlink: req.body.thirdbtnlink,
            imagelink: optionsData.thirdimage,
            thirdorder: req.body.thirdorder,
            thirdtitle1: req.body.thirdtitle1,
            thirddescription1: req.body.thirddescription1,
            thirdbtntext1: req.body.thirdbtntext1,
            thirdbtnlink1: req.body.thirdbtnlink1,
            thirdorder1: req.body.thirdorder1,
            imagelink1: optionsData.thirdimage1,
            thirdtitle2: req.body.thirdtitle2,
            thirddescription2: req.body.thirddescription2,
            thirdbtntext2: req.body.thirdbtntext2,
            thirdbtnlink2: req.body.thirdbtnlink2,
            imagelink2: optionsData.thirdimage2,
            thirdorder2:  req.body.thirdorder2
  
        };

        items["fourthsection"] = {
            fourthtitle: req.body.fourthtitle,
            fourthauthor: req.body.fourthauthor,
            fourthdescription: req.body.fourthdescription,
            fourthtwitter: req.body.fourthtwitter,
            fourthinsta: req.body.fourthinsta,
            fourthfb: req.body.fourthfb,
            fourthorder: req.body.fourthorder,
              
        };

       
        page.pagecontent       = items;
        page.save(function (err) {
            if (err) {
                res.json({ 'success': false, 'message': 'Error in Saving Page', 'errors': err });
                return;
            } else {
                res.json({ 'success': true, 'message': 'Page added succesfully' });
            }
        });

            
            
            
         

        }else{ 
        let optionsData = {};
        if(req.files) {
            filesArray.map( async (item, index)=> {
                let fieldname           = item.fieldname
                optionsData[fieldname]  = item.location;
            });
        }
        console.log(req.body);
        let page               = new Page();
        page.title             = req.body.title;
        page.layout            = req.body.layout;
        page.country           = req.body.country;
        let items              = {};

        items["firstsection"]  = {title: req.body.firsttitle, description: req.body.firstdescription, visibility: req.body.firstvisibility, btntext: req.body.firstbtntext, btnlink: req.body.firstbtnlink, imagelink: optionsData.firstimage};

        items["secondsection"] = {title: req.body.secondtitle, description: req.body.seconddescription, visibility: req.body.secondvisibility, linktext: req.body.secondlinktext, btnlink: req.body.secondlink};

        items["thirdsection"]  = {stitle: req.body.thirdstitle, title: req.body.thirdtitle, description: req.body.thirddescription, visibility: req.body.thirdvisibility, btntext: req.body.thirdbtntext, btnlink: req.body.thirdbtnlink, imagelink: optionsData.thirdimage};

        items["fourthsection"] = {stitle: req.body.fourthstitle, title: req.body.fourthtitle, description: req.body.fourthdescription, visibility: req.body.fourthvisibility, btntext: req.body.fourthbtntext, btnlink: req.body.fourthbtnlink, imagelink: optionsData.fourthimage};

        items["fifthsection"]  = {stitle: req.body.fifthstitle, title: req.body.fifthtitle, description: req.body.fifthdescription, visibility: req.body.fifthvisibility, btntext: req.body.fifthbtntext, btnlink: req.body.fifthbtnlink, imagelink: optionsData.fifthimage};

        items["sixthsection"]  = {title: req.body.sixthtitle, description: req.body.sixthdescription, visibility: req.body.sixthsectionvisibility};

        page.pagecontent       = items;
        page.save(function (err) {
            if (err) {
                res.json({ 'success': false, 'message': 'Error in Saving Page', 'errors': err });
                return;
            } else {
                res.json({ 'success': true, 'message': 'Page added succesfully' });
            }
        });
    }

    }
});

router.get('/all', ensureAuthenticated, function (req, res) {
    Page.find({}).sort({_id: 'desc'}).exec(function (err, pages) {
        if(err) {
            console.log(err);
        } else {
            res.render('all_pages.hbs', {
                pageTitle: 'All Pages',
                pages: pages
            });
        }
    });
});

router.get('/edit/:id', ensureAuthenticated, function (req, res) {
    let layoutDropDown  = {};
    layoutDropDown.home = "Home";
    layoutDropDown.contact = "Contact";
    layoutDropDown.shippingreturns = "Shipping & Returns";
    layoutDropDown.faq = "FAQ";
    layoutDropDown.about = "About";
    layoutDropDown.qualityguarantee = "Quality Guarantee";
    layoutDropDown.affiliateprogram = "Affiliate program";
    layoutDropDown.press = "Press";
    layoutDropDown.policies = "Policies";
    layoutDropDown.terms = "Terms";
    layoutDropDown.privacy = "Privacy";
    layoutDropDown.cookies = "Cookies";
    layoutDropDown.accessibility = "Accessibility";
    layoutDropDown.fda = "FDA";
    let countries = ["Afghanistan","Albania","Algeria","Andorra","Angola","Anguilla","Antigua &amp; Barbuda","Argentina","Armenia","Aruba","Australia","Austria","Azerbaijan","Bahamas"
	,"Bahrain","Bangladesh","Barbados","Belarus","Belgium","Belize","Benin","Bermuda","Bhutan","Bolivia","Bosnia &amp; Herzegovina","Botswana","Brazil","British Virgin Islands"
	,"Brunei","Bulgaria","Burkina Faso","Burundi","Cambodia","Cameroon","Canada","Cape Verde","Cayman Islands","Chad","Chile","China","Colombia","Congo","Cook Islands","Costa Rica"
	,"Cote D Ivoire","Croatia","Cruise Ship","Cuba","Cyprus","Czech Republic","Denmark","Djibouti","Dominica","Dominican Republic","Ecuador","Egypt","El Salvador","Equatorial Guinea"
	,"Estonia","Ethiopia","Falkland Islands","Faroe Islands","Fiji","Finland","France","French Polynesia","French West Indies","Gabon","Gambia","Georgia","Germany","Ghana"
	,"Gibraltar","Greece","Greenland","Grenada","Guam","Guatemala","Guernsey","Guinea","Guinea Bissau","Guyana","Haiti","Honduras","Hong Kong","Hungary","Iceland","India"
	,"Indonesia","Iran","Iraq","Ireland","Isle of Man","Israel","Italy","Jamaica","Japan","Jersey","Jordan","Kazakhstan","Kenya","Kuwait","Kyrgyz Republic","Laos","Latvia"
	,"Lebanon","Lesotho","Liberia","Libya","Liechtenstein","Lithuania","Luxembourg","Macau","Macedonia","Madagascar","Malawi","Malaysia","Maldives","Mali","Malta","Mauritania"
	,"Mauritius","Mexico","Moldova","Monaco","Mongolia","Montenegro","Montserrat","Morocco","Mozambique","Namibia","Nepal","Netherlands","Netherlands Antilles","New Caledonia"
	,"New Zealand","Nicaragua","Niger","Nigeria","Norway","Oman","Pakistan","Palestine","Panama","Papua New Guinea","Paraguay","Peru","Philippines","Poland","Portugal"
	,"Puerto Rico","Qatar","Reunion","Romania","Russia","Rwanda","Saint Pierre &amp; Miquelon","Samoa","San Marino","Satellite","Saudi Arabia","Senegal","Serbia","Seychelles"
	,"Sierra Leone","Singapore","Slovakia","Slovenia","South Africa","South Korea","Spain","Sri Lanka","St Kitts &amp; Nevis","St Lucia","St Vincent","St. Lucia","Sudan"
	,"Suriname","Swaziland","Sweden","Switzerland","Syria","Taiwan","Tajikistan","Tanzania","Thailand","Timor L'Este","Togo","Tonga","Trinidad &amp; Tobago","Tunisia"
	,"Turkey","Turkmenistan","Turks &amp; Caicos","Uganda","Ukraine","United Arab Emirates","United Kingdom","United States","United States Minor Outlying Islands","Uruguay"
	,"Uzbekistan","Venezuela","Vietnam","Virgin Islands (US)","Yemen","Zambia","Zimbabwe"];

    Page.findById(req.params.id).then((result) => pages(result)).catch((err) => res.status(404).json({success: false, message: err }));
    function pages(page){
        if(page){
            let pageContent = page.pagecontent;
            res.status(200).render('add-page.hbs', {
                pageTitle: 'Edit '+page.title,
                title: page.title,
                pagelayout: page.layout,
                country: page.country,
                pagecontent: pageContent,
                pageid: req.params.id,
                layoutDropDown: layoutDropDown,
                countries: countries,
                action: 'edit'
            });
        } else {
            res.status(404).json({success: false, message: "error in getting result"});
        }
    }
});

router.post('/edit/:id', upload.any(), async (req, res) => {
    req.checkBody('title', 'Page Title is required').notEmpty();
    req.checkBody('layout', 'Page Layout is required').notEmpty();
    req.checkBody('country', 'Page Country is required').notEmpty();
    let errors = req.validationErrors();
    let filesArray = req.files;
    if (errors) return res.status(404).json({ 'success': false, 'message': errors});
    let optionsData = {};
    if(req.files) {
        filesArray.map( async (item, index)=> {
            let fieldname           = item.fieldname
            optionsData[fieldname]  = item.location;
        });
    }

    if(!optionsData.hasOwnProperty('firstimage')){
        console.log("firstimage");
        optionsData.firstimage = req.body.firstimagelink;
    }

    if(!optionsData.hasOwnProperty('thirdimage')){
        optionsData.thirdimage = req.body.thirdimagelink;
    }

    if(!optionsData.hasOwnProperty('fourthimage')){
        optionsData.fourthimage = req.body.fourthimagelink;
    }

    if(!optionsData.hasOwnProperty('fifthimage')){
        optionsData.fifthimage = req.body.fifthimagelink;
    }


    let page               = {};
    page.title             = req.body.title;
    page.layout            = req.body.layout;
    page.country           = req.body.country;
    let items              = {};

    items["firstsection"]  = {title: req.body.firsttitle, description: req.body.firstdescription, visibility: req.body.firstvisibility, btntext: req.body.firstbtntext, btnlink: req.body.firstbtnlink, imagelink: optionsData.firstimage};

    items["secondsection"] = {title: req.body.secondtitle, description: req.body.seconddescription, visibility: req.body.secondvisibility, linktext: req.body.secondlinktext, btnlink: req.body.secondlink};

    items["thirdsection"]  = {stitle: req.body.thirdstitle, title: req.body.thirdtitle, description: req.body.thirddescription, visibility: req.body.thirdvisibility, btntext: req.body.thirdbtntext, btnlink: req.body.thirdbtnlink, imagelink: optionsData.thirdimage};

    items["fourthsection"] = {stitle: req.body.fourthstitle, title: req.body.fourthtitle, description: req.body.fourthdescription, visibility: req.body.fourthvisibility, btntext: req.body.fourthbtntext, btnlink: req.body.fourthbtnlink, imagelink: optionsData.fourthimage};

    items["fifthsection"]  = {stitle: req.body.fifthstitle, title: req.body.fifthtitle, description: req.body.fifthdescription, visibility: req.body.fifthvisibility, btntext: req.body.fifthbtntext, btnlink: req.body.fifthbtnlink, imagelink: optionsData.fifthimage};

    items["sixthsection"]  = {title: req.body.sixthtitle, description: req.body.sixthdescription, visibility: req.body.sixthsectionvisibility};

    page.pagecontent      = items;
    let query = {_id:req.params.id}
    Page.update(query, page, function(err){
        if(err){
            res.status(404).json({ 'success': false, 'message': 'Error in Updating Page', errors: err });
        } else {
            res.status(200).json({ 'success': true, 'message': 'Page Updated'});
        }
    });
});


router.get('/pagecontent', async function (req, res) {
    
    Page.find().then((data) => check(data));

    function check(data){
        if(data.length >= 1){
            Page.find({country: req.query.country}).then((page_content) => redirect(page_content))
    
    async function redirect(page_content){
        console.log(page_content.length);
        if(page_content.length == 0){
            let pageContent  = await Page.findOne({layout: 'home', country: 'United States'}).select('-1').sort({_id: 'asc'});
            res.json({ 'success': true, 'error': 'Country not found', 'content':pageContent });
        } else {
            let pageContent  = await Page.findOne({layout: req.query.layout, country: req.query.country}).select('-1').sort({_id: 'asc'});
            res.status(200).json({ 'success': true, 'content': pageContent });
        }
        }
    } else {
        res.json({'success': false, message: "No layouts found"  });
    }
    
    

}});

router.delete('/:id', ensureAuthenticated, function(req, res){
    let query = {_id:req.params.id}
    Page.findById(req.params.id, function(err, page){
        Page.remove(query, function(err){
          if(err){
            console.log(err);
          }
          res.send('Success');
        });
    });
});

// router.get('/allpages',function (req, res) {
//     Page.find({}).sort({_id: 'desc'}).exec(function (err, pages) {
//     if(err) {
//         res.json({ 'success': false, 'message': err });
//     } else {
//         res.json({ 'success': true, 'pages': pages });
//     }
//   });
// });

// Access Control
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        req.session.returnTo = req.originalUrl;
        res.redirect('/users/login');
    }
}

module.exports = router;