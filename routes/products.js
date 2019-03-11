const express       = require('express');
const router        = express.Router();
const path          = require('path');
const cloudinary    = require('cloudinary').v2;
const aws           = require('aws-sdk');
const bodyParser    = require('body-parser');
const multer        = require('multer');
const multerS3      = require('multer-s3');
const db            = require('../config/database');
const Product       = db.Product;
const ProductMeta   = db.ProductMeta;
const Category      = db.Category;
const Attribute     = db.Attribute;

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

// Product Add Get Route
router.get('/add-product', ensureAuthenticated, async function (req, res) {
    let products = await Product.find().select('-1').sort({_id: 'asc'});
    let categories = await Category.find().select('-1').sort({_id: 'asc'});
    // let countries = ['Hong Kong', 'Japan', 'Republic of Korea', 'Singapore', 'Taiwan', 'Thailand', 'Andorra', 'Austria', 'Belgium', 'Bulgaria', 'Cyprus', 'Czech', 'Denmark', 'Estonia', 'Finland', 'France', 'Germany', 'Greece', 'Iceland', 'Ireland', 'Italy', 'Latvia', 'Lithuania', 'Luxembourg', 'Malta', 'Monaco', 'Netherlands', 'Norway', 'Poland', 'Portugal', 'Romania', 'San Marino', 'Slovak Republic', 'Slovenia', 'Spain', 'Sweden', 'Switzerland', 'United Kingdom'];
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
    let attributes = await Attribute.find().exec();

    return res.status(200).render('add_product.hbs', {
        pageTitle: 'Add Products',
        products:products,
        categories:categories,
        attributes: attributes,
        countries: countries
    });      
});

// Product Add Post Route 
router.post('/add-product', upload.any(), async (req, res, next) => {
    req.checkBody('producttitle', 'Title is required').notEmpty();
    req.checkBody('categoryid', 'Product Category is required').notEmpty();
    req.checkBody('producttype', 'Product Type is required').notEmpty();
    req.checkBody('sku', 'Product Sku is required').notEmpty();
    let filesArray = req.files;
    let errors = req.validationErrors();
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
        return res.status(404).json({ 'success': false, 'message': 'Validation error', 'errors': errors });
    }
    let photo = {};
    let galleryArray = [];
    let galindex = 0;
    filesArray.map( (item, index)=> {
        if(item.fieldname == 'feature_image') {
            photo.featureimage = item.location;
        } else {
            galleryArray[galindex] = item.location;
            galindex++;
        }
    });
    // console.log(req.body);
    // console.log(req.body.variation_atttribute);
    // let variatonAtttribute = req.body.variaton_atttribute;
    // variatonAtttribute = variatonAtttribute.filter(Boolean);
    // console.log(variatonAtttribute);

    if(req.fileValidationError) return res.status(400).json({ 'success': false, 'message': 'File Validation error', errors: req.fileValidationError });
    let productExist = await Product.findOne({sku: req.body.sku}).select('-1').sort({_id: 'asc'});
    let product = new Product();
    if(productExist) {
        return res.status(404).json({ 'success': false, 'message': 'Duplicate Product Sku'});
    } else {

        function saveAttributes(array){
            const returnVal = array.map((el)=>{
                return {
                    ...el,
                    values: el.values.constructor === Array ?  [...el.values] : [el.values]
                }
            })

            return returnVal;
        }

        console.log(req.body.attribute);
        product.producttitle            = req.body.producttitle;
        product.sku                     = req.body.sku;
        product.productdescription      = req.body.productdescription;
        product.featurefilepath         = photo.featureimage;
        product.blockedcountries        = req.body.blockedcountries;
        product.save().then((product) => product_service(product)).catch((err) => res.status(404).json({'success': false, 'message': "error in getting result", 'error': err}));
        function product_service(product){
            if(product){
                let productMeta                     = new ProductMeta();
                productMeta.producttype             = req.body.producttype;
                productMeta.keyingredients          = req.body.keyingredients;
                if(req.body.manage_stock) {
                    productMeta.managestockstatus   = req.body.manage_stock;
                    productMeta.unit                = req.body.stock;
                };
                if(req.body.enable_review) {
                    productMeta.enablereview        = req.body.enable_review;
                }
                productMeta.type = req.body.type;
                productMeta.barcode = req.body.barcode;
                productMeta.visibilitytype = req.body.hide;
                productMeta.saleprice               = req.body.sale_price;
                productMeta.regularprice            = req.body.regular_price;
                productMeta.productid               = product._id;
                productMeta.galleryimgdetails       = galleryArray;
                productMeta.attributecontent        = req.body.page_attribute;
                productMeta.faqcontent              = req.body.faq;
                productMeta.attributes              = saveAttributes(req.body.attribute);
                productMeta.categoryid             = req.body.categoryid;
                productMeta.variation               = req.body.variaton_atttribute;
                if(req.body._weight){
                productMeta.shipping_weight         = req.body._weight;}
                if(req.body._length){
                productMeta.shipping_length         = req.body._length;}
                if(req.body._width){
                productMeta.shipping_width          = req.body._width;}
                if(req.body._height){
                productMeta.shipping_height         = req.body._height;}
                if(req.body.product_shipping_class){
                productMeta.shipping_class          = req.body.product_shipping_class;}
                if(req.body._stock_status){
                productMeta.stock_status            = req.body._stock_status;};
            
                productMeta.save().then((productmeta) => res.redirect('/products/all').catch((err) => res.status(404).json({'success': false, 'message': "error in Saving Product", 'error': err})));
                // res.status(200).json({'success': true, 'message': "Product Saved Successfully", 'productmeta': productmeta, 'product': product}))
            } else {
                res.status(404).json({'success': false, 'message': "error in Saving Product"});
            }
        
        }
    }
});


// All Product show Route
router.get('/all', ensureAuthenticated, async function (req, res) {
    let productmeta = await ProductMeta.find().select('-1').sort({_id: 'desc'}).populate('productid').populate('categoryid');
    return res.status(200).render('allprodct.hbs', {
        pageTitle: 'All Products',
        products:productmeta
    });
});

//All products show route for frontend 
//NOTE: ADD ENSURE AUTHENTICATED IN THIS ROUTE
router.get('/api/all', async function (req, res) {
    let productmeta = await ProductMeta.find().select('-1').sort({_id: 'desc'}).populate('productid').populate('categoryid');
    res.status(200).json({products: productmeta});
    });

//Route to show all the products by their category 
router.post('/api/bycategory', async function(req, res){
    await Category.find({categorytitle: req.body.title}).then((data) => displayData(data))
    async function displayData(data){
        let id = data[0]._id;
         await ProductMeta.find({categoryid: id}).select('-1').sort({_id: '-1'}).populate('productid').populate('çategoryid').then((data) =>  res.status(200).json({success: true, products: data}));
    }
})


// Product Edit Get Route
router.get('/edit/:id', async function(req, res){
    let productmeta = await ProductMeta.findById(req.params.id).select('-1').sort({_id: 'desc'}).populate('productid').populate('categoryid');
    let categories = await Category.find().select('-1').sort({_id: 'asc'});
    let countries = ['Hong Kong', 'Japan', 'Republic of Korea', 'Singapore', 'Taiwan', 'Thailand', 'Andorra', 'Austria', 'Belgium', 'Bulgaria', 'Cyprus', 'Czech', 'Denmark', 'Estonia', 'Finland', 'France', 'Germany', 'Greece', 'Iceland', 'Ireland', 'Italy', 'Latvia', 'Lithuania', 'Luxembourg', 'Malta', 'Monaco', 'Netherlands', 'Norway', 'Poland', 'Portugal', 'Romania', 'San Marino', 'Slovak Republic', 'Slovenia', 'Spain', 'Sweden', 'Switzerland', 'United Kingdom'];
    let attributes = await Attribute.find().exec();

    return res.status(200).render('edit_product.hbs', {
        pageTitle: 'Edit Products',
        products: productmeta,
        categories:categories,
        attributes: attributes,
        countries: countries
    });  
});

// Product Edit Post Route
router.post('/edit/:id', upload.any(), async function(req, res){
    let filesArray = req.files;
    let tempArr = [];
    req.checkBody('producttitle', 'Title is required').notEmpty();
    req.checkBody('sku', 'Product Serial Number is required').notEmpty();
    // req.checkBody('unit', 'Product Unit is required').notEmpty();
    // let product_brand_group = req.body.product_brand_group;
    console.log(req.body);
    let errors = req.validationErrors();
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
        res.json({ 'success': false, 'message': 'Validation error', 'errors': errors });
    } else {
        // filesArray.map( (item, index)=> {
        //     let empObj = {};
        //     tempArr.push(empObj);
        //     tempArr[index]['fieldname'] = item.fieldname;
        //     tempArr[index]['path'] = item.location;
        //     tempArr[index]['filename'] = item.key;
        // });
        // var tempFieldname;
        // code added _______
        let photo = {};
        let galleryArray = [];
        let galindex = 0;
        filesArray.map( (item, index)=> {
            if(item.fieldname == 'feature_image') {
                photo.featureimage = item.location;
            } else {
                galleryArray[galindex] = item.location;
                galindex++;
            }
        });
    
        // for (let index = 0; index < tempArr.length; index++) {
        //     tempFieldname = tempArr[index]['fieldname'];
        //     tempFieldname = tempFieldname.trim();
        //     var arrayindex = tempFieldname.substring(0, tempFieldname.indexOf("]") + 1);
        //     arrayindex = arrayindex.replace("product_brand_group[", "");
        //     arrayindex = arrayindex.replace("]", "");
        //     product_brand_group[arrayindex]['filepath'] = tempArr[index]['path'];
        //     product_brand_group[arrayindex]['filename'] = tempArr[index]['filename'];
        // }
        
            let productmeta_data = await ProductMeta.findById(req.params.id);
            let categoryid = productmeta_data.categoryid;
            let productid = productmeta_data.productid;
            console.log(productmeta_data);
                

            console.log("_________________________________________________________________")

              console.log({body: req.body});
                // saving the details in product meta
              let productMeta = {};
              productMeta.producttype             = req.body.producttype;
              productMeta.keyingredients          = req.body.keyingredients;
              productMeta.producttype              = req.body.producttype;
              productMeta.visibilitytype            = req.body.visibilitytype;
              productMeta.type                      = req.body.type;
              if(req.body.manage_stock) {
                  productMeta.managestockstatus   = req.body.manage_stock;
                  productMeta.unit                = req.body.stock;
              }
              if(req.body.enable_review) {
                  productMeta.enablereview        = req.body.enable_review;
              }
              //productMeta.productid               = product._id;
              if(galleryArray){
              productMeta.galleryimgdetails       = galleryArray;}
              productMeta.attributecontent        = req.body.page_attribute;
              productMeta.faqcontent              = req.body.faq;
              productMeta.attributes              = req.body.attribute;
              productMeta.categoryid              = req.body.categoryid;
              productMeta.variation               = req.body.variaton_atttribute;
              console.log({productmeta: productMeta});           
              ProductMeta.findOneAndUpdate({_id: req.params.id}, productMeta).then((data) => console.log({saved_data: data})).catch((err) => console.log(err));
            // saving the data in product 
            let product = {}
            product.producttitle            = req.body.producttitle;
            product.sku                     = req.body.sku;
            product.productdescription      = req.body.productdescription;
            product.id                      = req.body.productid;
            if(photo.featureimage){
            product.featurefilepath         = photo.featureimage;}
            product.blockedcountries        = req.body.blockedcountries;
            Product.findOneAndUpdate({_id: productid}, product).then((product) => res.redirect('/products/all')).catch((err) => console.log(err));
                
 

        }})
            // let product = {}
            // product.producttitle            = req.body.producttitle;
            // product.sku                     = req.body.sku;
            // product.productdescription      = req.body.productdescription;
            // // product.featurefilepath         = photo.featureimage;
            // product.blockedcountries        = req.body.blockedcountries;
            // Product.findOneAndUpdate({_id: req.params.id}, product).then((product) => product_service(product)).catch((err) => res.status(404).json({'success': false, 'message': "error in getting result", 'error': err}));
            // function product_service(product){
            //     // let product = product;
            //     console.log(product);
            //     if(product){
            //         let productMeta = {}
            //         productMeta.producttype             = req.body.producttype;
            //         productMeta.keyingredients          = req.body.keyingredients;
            //         if(req.body.manage_stock) {
            //             productMeta.managestockstatus   = req.body.manage_stock;
            //             productMeta.unit                = req.body.stock;
            //         }
            //         if(req.body.enable_review) {
            //             productMeta.enablereview        = req.body.enable_review;
            //         }
            //         productMeta.productid               = product._id;
            //         productMeta.galleryimgdetails       = galleryArray;
            //         productMeta.attributecontent        = req.body.page_attribute;
            //         productMeta.faqcontent              = req.body.faq;
            //         productMeta.attributes              = req.body.attribute;
            //         productMeta.categoryid              = req.body.categoryid;
            //         productMeta.variation               = req.body.variaton_atttribute;
            //         productMeta.update({}).then((productmeta) => res.status(200).json({'success': true, 'message': "Product Saved Successfully", 'productmeta': productmeta, 'product': product})).catch((err) => res.status(404).json({'success': false, 'message': "error in Saving Product", 'error': err}));
            // }





            // console.log(req.body);
            // console.log(req.body[2].productid);
            // // Product.findOneAndUpdate({req.body[2].})
            // let product  = {};
            // product.title = 
            // let product = {};
            // product.producttitle = req.body.producttitle;
            // product.productbody = req.body.productbody;
            // product.sku = req.body.sku;
            // product.unit = req.body.unit;
            // product.productbrand = product_brand_group;
            // console.log(product_brand_group);
            // product.modifieddate = Date.now;
            // // product.modifieddate = moment().tz("Asia/Kolkata");
            // if(req.files) {
            //     product_brand_group.map( (item, index)=> {
            //         if(item.previousfilename != item.filename) {
            //             let previousFilename = item.previousfilename;
            //             var params = {
            //                 Bucket: 'elasticbeanstalk-us-east-2-797993184252',
            //                 Key: previousFilename
            //             };
            //             s3.deleteObject(params, function (err, data) {
            //                 if (data) {
            //                     console.log("File deleted successfully");
            //                 }
            //                 else {
            //                     console.log("Check if you have sufficient permissions : "+err);
            //                 }
            //             });
            //         }
            //     });
            // }
            // let query = {_id:req.params.id}
            // Product.update(query, product, function(err){
            //     if(err){
            //         res.json({ 'success': false, 'message': 'Error in Updating Product', errors: err });
            //     } else {
            //         res.json({ 'success': true, 'message': 'Product Updated'});
            //     }
            // });
// }  }    )
        
     
// });

// Product Delete Route
router.get('/delete/:id', async function(req, res){
    let query = {_id:req.params.id}

    let productmeta = await ProductMeta.find().populate('productid').populate('categoryid');
    let productid =  productmeta.productid;
    ProductMeta.findById(req.params.id, function(err, product){
        ProductMeta.remove(query, function(err){
          if(err){
            console.log(err);
          }
          Product.findById(productid, function(err, product){
            Product.remove(productid, function(err){
              if(err){
                console.log(err);
              }
              res.redirect('/products/all');
        });
    });
});
});
});

// All Attribute Show Route
router.get('/product-attribute', ensureAuthenticated, async function (req, res) {
    let attributes = await Attribute.find().exec();
    let termsobject  = attributes.terms;
    res.render('product_attribute.hbs', {
        pageTitle: 'Products Attribute',
        attributes: attributes,
        keys: termsobject
    });
});

// Add Attribute Route
router.post('/add-attribute', async (req, res) => {
    req.checkBody('attributetitle', 'Attribute Name is required').notEmpty();
    let errors = req.validationErrors();
    if (errors) return res.status(404).json({success: false, message: 'Validation Error', errors: errors});
    let nameCheck = await Attribute.findOne({name: req.body.attributetitle}).exec();
    if(nameCheck) return res.status(404).json({success: false, message: 'Name Already Exist Please Use Different Name'});
    let name                    = req.body.attributetitle;
    let lowerCaseName           = name.toLowerCase()
    let withoutSpaceName        = lowerCaseName.trim();
    let slug;
    if(req.body.attributeslug) {
        slug                    = req.body.attributeslug;
    } else {
        slug                    = withoutSpaceName.replace(/\s+/g, '-');
    }
    let attribute               = new Attribute();
    attribute.name              = name;
    attribute.slug              = slug;
    let attributeSave           = await attribute.save();
    if(attributeSave) {
        res.status(200).json({'success':true, 'message':"Attribute Added successfully", 'test':attributeSave});
    } else {
        res.status(200).json({'success':false, 'message':"Error in Saving the Attribute", 'test':attributeSave});
    }
});

//attribute Term open by attribute id Route
router.get('/attribute-term/:id', ensureAuthenticated, function(req, res){
    Attribute.findById(req.params.id).then((result) => attributes(result)).catch((err) => res.status(404).json({'success': false, message: "error in getting result"}));
    function attributes(result){
        if(result){
            let pageTitle    = 'Products '+result.name;
            let termsobject  = result.terms;
            res.status(200).render('attribute-term-add.hbs', {
                pageTitle: pageTitle,
                attributes: result,
                keys: termsobject
            });
        } else {
            res.status(404).json({'success': false, message: "error in getting result"});
        }
    }   
});

// Attribute details Fetch Get Route 
router.get('/attribute-term-data/:id', ensureAuthenticated, function(req, res){
    Attribute.findById(req.params.id).then((result) => attributedata(result)).catch((err) => res.status(404).json({success: false, message: "error in getting result"}));
    function attributedata(result){
        if(result){
            res.status(200).json({'success':true, 'message':"Attribute Added successfully", 'attributes':result});
        } else {
            res.status(404).json({success: false, message: "error in getting result"});
        }
    }   
});

//Attribute Edit Post Route
router.post('/attribute-term-data/:id', async (req, res) => {
    req.checkBody('attributetitle', 'Attribute Name is required').notEmpty();
    let errors = req.validationErrors();
    if (errors) return res.status(404).json({success: false, message: 'Validation Error', errors: errors});
    let name                    = req.body.attributetitle;
    let slug;
    let attribute               = new Attribute();
    attribute.name              = name;
    if(req.body.attributeslug) {
        slug                    = req.body.attributeslug;
        attribute.slug              = slug;
    }
    let query = {_id:req.params.id}
    Attribute.update(query, attribute, function(err){
        if(err){
            res.json({ 'success': false, 'message': 'Error in Updating Attribute', errors: err });
        } else {
            res.json({ 'success': true, 'message': 'Attribute Updated'});
        }
    });
});

// Attribute Delete Route
router.delete('attribute-delete/:id', function(req, res){
    let query = {_id:req.params.id}
    Attribute.findById(req.params.id, function(err, attribute){
        Attribute.remove(query, function(err){
          if(err){
            console.log(err);
          }
          res.send('Success');
        });
    });
});

//attribute term get by slug
router.get('/term-by-slug', function(req, res){
    Attribute.find({slug: req.query.slug})
    .then((result) => attributes(result))
    .catch((err) => res.status(404).json({'success': false, 'message': "error in getting result"}));
    function attributes(result){
        if(result){
            let terms  = result['0']['terms'];
            res.status(200).json({'success': true, 'message': "fetching success", 'attributes': terms});
        } else {
            res.status(404).json({'success': false, 'message': "error in getting result"});
        }
    }   
});


// Attribute Term add post route
router.post('/attribute-term/add', async (req, res) => {
    let slug;
    let name                    = req.body.termtitle;
    let lowerCaseName           = name.toLowerCase()
    let withoutSpaceName        = lowerCaseName.trim();
    if(req.body.termslug) {
        slug                    = req.body.termslug;
    } else {
        slug                    = withoutSpaceName.replace(/\s+/g, '-');
    }

    let attributeDetails        = await Attribute.findById(req.body.attributeid).select('-1');
    let termsObject             = attributeDetails.terms;
    let description             = req.body.termdescripiton;
    let attributes              = {};
    if(termsObject) {
        termsObject[slug]           = {name: name, slug: slug, description: description};
        attributes.terms            = termsObject;
    } else {
       let terms                = {};
       terms[slug]              = {name: name, slug: slug, description: description};
       attributes.terms         = terms;
    } 
    let attributeId             = req.body.attributeid;
    let query = {_id:attributeId}
    Attribute.update(query, attributes, function(err){
        if(err){
            return res.status(404).json({ success: false, message: 'Error in Adding Terms', errors: err });
        } else {
            return res.status(200).json({ 'success': true, 'message': 'Terms Added Successfully'});
        }
    });
});

// router.get('/getproduct', function (req, res) {
//     if( req.query.page ) {
//         var page = JSON.parse(req.query.page) || 1;
//         var perPage = JSON.parse(req.query.perpage) || 2;
//         Product
//         .find({})
//         .skip((perPage * page) - perPage)
//         .limit(perPage)
//         .sort({producttitle: 'asc'})
//         .exec(function(err, products) {
//             Product.count().exec(function(err, count) {
//                 if (err) {
//                     res.json({ 'success': false, 'message': 'Error In fetching products' });
//                 } else {
//                     let pages = Math.ceil(count / perPage);
//                     res.json({ 'success': true, 'products': products, 'page': page, 'pages': pages, 'perpage': perPage });
//                 }
//             });
//         });
//     } else {
//         Product.find({}, function (err, products) {
//             if (err) {
//                 res.json({ 'success': false, 'message': 'Error In fetching products' });
//             } else {
//                 res.json({ 'success': true, 'data': products });
//             }
//         }).sort({producttitle: 'asc'}); 
//     } 
// });

// router.get('/getproductbybrand', function (req, res) {
//     if( req.query.page ) {
//         var page = JSON.parse(req.query.page) || 1;
//         var perPage = JSON.parse(req.query.perpage) || 5;
//         Product
//         .find({productbrand: { $elemMatch: { productbrand: req.query.brand } }})
//         .skip((perPage * page) - perPage)
//         .limit(perPage)
//         .exec(function(err, products) {
//             Product.count().exec(function(err, count) {
//                 if (err) {
//                     res.json({ 'success': false, 'message': 'Error In fetching products' });
//                 } else {
//                     let pages = Math.ceil(count / perPage);
//                     res.json({ 'success': true, 'products': products, 'page': page, 'pages': pages, 'perpage': perPage });
//                 }
//             });
//         });
//     } else {
//         var page = 1;
//         var perPage = 5;
//         Product
//         .find({productbrand: { $elemMatch: { productbrand: req.query.brand } }})
//         .skip((perPage * page) - perPage)
//         .limit(perPage)
//         .exec(function(err, products) {
//             Product.count().exec(function(err, count) {
//                 if (err) {
//                     res.json({ 'success': false, 'message': 'Error In fetching products' });
//                 } else {
//                     let pages = Math.ceil(count / perPage);
//                     res.json({ 'success': true, 'products': products, 'page': page, 'pages': pages, 'perpage': perPage });
//                 }
//             });
//         });
//     }
// });

// router.get('/productsearch', async function(req, res){
//     if( req.query.productstring ) {
//         var page = (req.query.page) ? JSON.parse(req.query.page) : 1;
//         var perPage = (req.query.perpage) ? JSON.parse(req.query.perpage) : 5;
//         let productsCheck = await Product.find({producttitle: req.query.productstring}, function(err, productsCallback){});
//         console.log(productsCheck);
//         if(productsCheck.length == 0) {
//             Product.find({producttitle: { $regex: req.query.productstring, $options : 'i' }}).skip((perPage * page) - perPage).limit(perPage).sort({producttitle: 'asc'}).exec(function(err, productsResult) {
//                 if(productsResult.length != 0) {
//                     Product.count({producttitle: { $regex: req.query.productstring }}).exec(function(err, count) {
//                         if (err) {
//                             res.json({ 'success': false, 'message': 'Error In fetching products' });
//                         } else {
//                             let pages = Math.ceil(count / perPage);
//                             res.json({ 'success': true, 'products': productsResult, 'page': page, 'pages': pages, 'perpage': perPage, 'brand': false });
//                         }
//                     });  
//                 } else {
//                     Category.find({brandtitle: { $regex: req.query.productstring, $options : 'i' }}).skip((perPage * page) - perPage).limit(perPage).sort({brandtitle: 'asc'}).exec(function(err, brandsResults) {
//                         Category.count({brandtitle: { $regex: req.query.productstring }}).exec(function(err, count) {
//                             if (err) {
//                                 res.json({ 'success': false, 'message': 'Error In fetching Results' });
//                             } else {
//                                 let pages = Math.ceil(count / perPage);
//                                 res.json({ 'success': true, 'products': brandsResults, 'page': page, 'pages': pages, 'perpage': perPage, 'brand': true });
//                             }
//                         });
//                     });
//                 } 
//             });
//         } else {
//             console.log('else');
//             res.json({ 'success': true, 'products': products });
//         }
//     } else {
//         res.json({ 'success': false, 'message': 'Error In fetching products' });
//     } 
// });

//DONT FORGET TO ADD ENSURE AUTHENTICATE IN THIS 
router.get('/api/getbyid/:id',  function(req, res){
    ProductMeta.findById(req.params.id).populate('productid').populate('categoryid').then((data) => res.status(200).json({status: true, product_details: data})).catch((err) => res.json({status: false, error: err}));
        });


//Get all the categories
router.get('/api/categories/all', function(req, res){
    Category.find().then((data) => res.json({'success': true, categories: data}))
;});


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