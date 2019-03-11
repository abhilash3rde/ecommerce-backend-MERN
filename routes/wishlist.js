const express = require("express");
const router = express.Router();
const DB = require("../config/database");
const Wishlist = DB.Wishlist;

//add item to wishlist api route
router.post('/api/add', function(req, res){
    req.checkBody("userid", "userid is required");
    let errors = req.validationErrors();

    if(errors){
        res.json({status: false, message: errors});
    } else {
        const wishlist = new Wishlist(req.body);
        wishlist.save().then((wishlist) => res.status(200).json({status: true, wishlist: wishlist }))
    }
});


//delete item from wishlist api route 
router.post('/api/delete', function(req, res){
    req.checkBody('id', 'is is required');
    let errors = req.validationErrors();

    if(errors){
        res.json({status: false, message: errors});
    } else {
        let query = req.body.id;
        Wishlist.remove(query).then(() => res.status(200).json({success: true, message:"Succesfully removed"})).catch((err) => res.status(400).json({success: false, error: err}));
    }
});


// get al the wishlist items for any particular user
router.post('/api/byuser', function(req, res){
    
    // req.checkbody("userid", "Userid is required");

    // let errors = req.validationErrors();

    // if(errors){
    //     res.json({status: false, messages: errors});
    // } else {

    let user = req.body.userid;
    Wishlist.find({userid: user}).then((wishlist) => res.status(200).json({success: true, wishlist: wishlist})).catch((err) => res.status(400).json({success: false, error: err}))
    
});

//DONT FORGET TOA DD ENSURE AUTHENTICATEED IN ALL FUNCTIONS
//get all the wishlist items to show in backend
router.get('/all', async function(req, res){
    let wishlist = await Wishlist.find({}).populate('productid').populate('userid').populate('productmeta').select('-1').sort({_id: 'asc'});
    return res.status(200).render('wishlist_all.hbs', {
        pageTitle: 'Wishlist of Users',
        products: wishlist

    });
});

//edit any particular wishlist item from backend
router.get('/edit/:id', async function(req, res){
    let query = req.params.id;
    let wishlist = await Wishlist.findById(query);

    return res.status(200).render('wishlist_edit.hbs', {
        pageTitle: 'Edit Wishlist',
        wishlist: wishlist
    });
});

//Post edit route for cditing any particular wishlist
router.post('/edit/:id', async function(req, res){
    let query = req.params.id;
    
    let newWishlist = {};
    console.log(req.body);
    newWishlist.serial=req.body.serial;
    newWishlist.userid=req.body.userid;
    newWishlist.productid=req.body.productid;
    newWishlist.productmeta=req.body.productmeta;
    Wishlist.findOneAndUpdate({_id: query}, newWishlist).then(() => res.redirect("/wishlist/all")).catch((err) => console.log(err));

});

//delete any particluar wishlist item from backend
router.get('/delete/:id', async function(req, res){
    let query = req.params.id;

    Wishlist.findOneAndRemove(query, function(err, product){
          if(err){
            console.log(err);
          }
              res.redirect('/wishlist/all');
        });
    });


module.exports = router;