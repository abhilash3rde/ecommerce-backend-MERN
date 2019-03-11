const express           = require('express');
const router            = express.Router();
const DB                = require("../config/database");
const Subscribed        = DB.Subscribed;



router.post('/api/subscribe', function(req, res){
    
    req.checkBody("productid", "productid is required").notEmpty();
  
    // check the validation object for errors
    let errors = req.validationErrors();
  
    if (errors) {
      res.json({ status: false, messages: errors });
    } else {

        const subscribed = new Subscribed(req.body);
        subscribed.save().then((product) => res.status(200).json({status: true, product: product}));

    }
}
)

//View any particular susbcribed product details
router.get("/subscribed/edit/:id", async function(req, res){
    let query = req.params.id;
    let subscribed = await Subscribed.findById(query);
    console.log(subscribed);
    return res.status(200).render('edit_subscribed.hbs', {
        pagetitle: 'Edit Subscribed Products',
        subscribed: subscribed
    });
});

//post route for editing subscribed products 
router.post("/subscribed/edit/:id", function(req, res){
    let query = req.params.id;
    // let subscribed = await Subscribed.findById(query);
    let newData = {};
    console.log(req.body.userid);
    newData.userid= req.body.userid;
    newData.productid= req.body.productid;
    newData.productmeta= req.body.productmeta;
    newData.duration= req.body.duration;
    newData.quantity= req.body.quantity;
    newData.deliverydate= req.body.deliverydate; 
    newData.skipdelivery= req.body.skipdelivery;
    newData.orderid= req.body.orderid;
    newData.subscribedon= req.body.subscribedon;
    Subscribed.findOneAndUpdate({_id: query}, newData).then(() => res.redirect('/all')).catch((err) => console.log(err));

});

//delete subscribed product route
router.post("/subscribed/delete/:id", async function(req, res){
    let query = req.params.id;
    
    Subscribed.findById(query, function(err, product){
        Subscribed.remove(query, function(err){
          if(err){
            console.log(err);
          }
              res.redirect('/all');
        });
    });
});


// router.post('/edit/:id', upload.any(), async function(req, res){
  
    
//             let productmeta_data = await ProductMeta.findById(req.params.id);
//             let categoryid = productmeta_data.categoryid;
//             let productid = productmeta_data.productid;
//             console.log(productmeta_data);
                

//             console.log("_________________________________________________________________")

//               console.log({body: req.body});
//                 // saving the details in product meta
//               let productMeta = {};
//               productMeta.producttype             = req.body.producttype;
//               productMeta.keyingredients          = req.body.keyingredients;
//               if(req.body.manage_stock) {
//                   productMeta.managestockstatus   = req.body.manage_stock;
//                   productMeta.unit                = req.body.stock;
//               }
//               if(req.body.enable_review) {
//                   productMeta.enablereview        = req.body.enable_review;
//               }
//               //productMeta.productid               = product._id;
//               if(galleryArray){
//               productMeta.galleryimgdetails       = galleryArray;}
//               productMeta.attributecontent        = req.body.page_attribute;
//               productMeta.faqcontent              = req.body.faq;
//               productMeta.attributes              = req.body.attribute;
//               productMeta.categoryid              = req.body.categoryid;
//               productMeta.variation               = req.body.variaton_atttribute;
//               console.log({productmeta: productMeta});           
//               ProductMeta.findOneAndUpdate({_id: req.params.id}, productMeta).then((data) => console.log({saved_data: data})).catch((err) => console.log(err));
//             // saving the data in product 
//             let product = {}
//             product.producttitle            = req.body.producttitle;
//             product.sku                     = req.body.sku;
//             product.productdescription      = req.body.productdescription;
//             product.id                      = req.body.productid;
//             if(photo.featureimage){
//             product.featurefilepath         = photo.featureimage;}
//             product.blockedcountries        = req.body.blockedcountries;
//             Product.findOneAndUpdate({_id: productid}, product).then((product) => res.redirect('/products/all')).catch((err) => console.log(err));
                
 

//         }})



router.get('/all', async function (req, res) {
    //DOMT FORGET TO ADD POPULATE ORDER IN THIS !!! IMPORTANT
    let subscribed = await Subscribed.find().select('-1').sort({deliverydate: 'desc'}).populate('userid').populate('productid').populate('productmeta');
    return res.status(200).render('subscribed.hbs', {
        pageTitle: 'All Subscribed Products',
        products: subscribed
    });
});



module.exports = router;
