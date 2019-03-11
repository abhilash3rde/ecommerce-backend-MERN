const express       = require('express');
const app = express();
const router        = express.Router();
const nodemailer    = require('nodemailer');
const bcrypt        = require('bcryptjs');
const passport      = require('passport');
const db            = require('../config/database');
// const userService   = require('../service/user.service');

const session = require("express-session");
const User          = db.User;
const UserMeta      = db.UserMeta;
const crypto = require("crypto");
const algorithm = "aes-256-cbc";
var key = "abcdefghijklmnopqrstuvwxyztgbhgf";
let iv = "1234567891234567";
let cipher = crypto.createCipheriv(algorithm, new Buffer.from(key), iv);


router.get('/register', function(req, res){
  res.render('register.hbs', {
    pageTitle: 'Sign up'
  });
});


let sessionChecker = (req, res, next) => {
  if (req.session.user && req.cookies.user_sid) {
      res.redirect('/');
  } else {
      next();
  }
};

//edit user route
router.get("/edit/:id", async function(req, res){
  let query = req.params.id;
  User.findById(query).then((data) => show(data));
  function show(data){
    res.status(200).render('view_user.hbs', {
      pageTitle: 'View User',
      user: data
  });
  }
});

// APi login route
router.post('/api/login', async function (req, res){
   // validate the input
   req.checkBody("email", "Email is required").notEmpty();
   req.checkBody("email", "Email does not appear to be valid").isEmail();
   req.checkBody("password", "Password is required").notEmpty();
 
   // check the validation object for errors
   let errors = req.validationErrors();
 
   if (errors) {
     res.json({ status: false, messages: errors });
   } else {
     let email = req.body.email;
     let password = req.body.password;
     let cipher = crypto.createCipheriv(algorithm, new Buffer.from(key), iv);
     var encrypted =
       cipher.update(password, "utf8", "hex") + cipher.final("hex");
     User.findOne({ email: email }).then(function(user) {
       app.get(sessionChecker, (req, res) => {
        //  res.json({ status: "session stored" });
       });
       //Checking if user exists or not
       if(!(user == null)){  
       if (encrypted != user.password) {
           res.json({ status: false, error: "Password Incorrect" });
         } else if (user) {
             req.session.user = user;
             req.session.Auth = user;
             res.json({
               status: true,
               user: req.session.Auth
             });
             }} else {
             res.json({status: false, message: "User not found"})
           }
         
       
     });
    }});

//API REGISTER ROUTE
router.post('/api/register', async (req, res) => {

    // validate the input
    req.checkBody("email", "Email is required").notEmpty();
    req.checkBody("email", "Email does not appear to be valid").isEmail();
    req.checkBody("role", "Role is required").notEmpty();
    req.checkBody("firstname", "First Name is required").notEmpty();
    req.checkBody("lastname", "Last Name is required").notEmpty();
    req.checkBody("phonenumber", "Phone Number is required").notEmpty();
    req.checkBody("password", "Password is required").notEmpty();
    req.checkBody("password2", "Password 2 is required").notEmpty();
    // check the validation object for errors
    let errors = req.validationErrors();
  
    if (errors) {
      res.json({ status: false, messages: errors });
    } else {
      // validate
      if (await User.findOne({ email: req.body.email })) {
        res.status(200).json({
          status: false,
          error: "Email " + req.body.email + " is already taken"
        });
      } else if(req.body.password !== req.body.password2){
        res.status(200).json({status: false, error: "Passwords Do Not Match"})
      } else {

        // hashing the password
        let cipher = crypto.createCipheriv(algorithm, new Buffer.from(key), iv);
        var encrypted =
          cipher.update(req.body.password, "utf8", "hex") +
          cipher.final("hex");
  
        console.log(req.body);
        const user = new User({
          email: req.body.email,
          role: req.body.role,
          firstname: req.body.firstname,
          lastname: req.body.lastname,
          phonenumber: req.body.phonenumber,
          password: encrypted
        });
        
          // user.password = bcrypt.hashSync(userParam.password, 10);
            // save user
        await user
        .save()
        .then(() => res.json({ status: true }))
        .catch(err => res.json(err));
        }
      
      }
    });


    function ensureAuthenticated(req, res, next) {
      if (req.isAuthenticated()) {
          return next();
      } else {
          req.session.returnTo = req.originalUrl;
          res.redirect('/users/login');
      }
  }


//User management
router.get('/usermanagement',  ensureAuthenticated, async function(req, res){

  User.find({}).then((data) => show(data));
  function show(data){
      res.status(200).render('all_users.hbs', {
          pageTitle: 'All Alerts',
          user: data
      });
  }
})

router.post('/users/usermanagement', ensureAuthenticated, async (req, res) => {
 

  let firstName       = req.body.firtstname;
  let lastName        = req.body.lastname;
  let role            = req.body.role;
  let status          = req.body.status;
  let displayname     = firstName + +lastName;
 
  req.checkBody('username', 'User Name is required').notEmpty();
  req.checkBody('email', 'Email is required').notEmpty();
  req.checkBody('email', 'Email is not valid').isEmail();
  req.checkBody('phonenumber', 'phonenumber is required').notEmpty();
  req.checkBody('phonenumber', 'phonenumber is required').isNumeric();
  req.checkBody('password', 'Passwords is required').notEmpty();
  req.checkBody('password2', 'Passwords do not match').equals(req.body.password);
  
  let errors = req.validationErrors();
  if (errors) return res.status(404).render('all_users.hbs', {
    pageTitle: 'User Management',
    errors:errors,
    message: errors
  });

  let userexist = await User.findOne({email: req.body.email}, '_id', function(err, user){}); 
    if(userexist) {
      return res.status(404).render('all_users.hbs', {
        pageTitle: 'User Management',
        message:'User already exist with this phone number'
      });
    } else {
      const newUser = new User({
        username:req.body.username,
        email:req.body.email,
        displayname: displayname,
        phonenumber:req.body.phonenumber,
        role:role,
        password:req.body.password,
        status:status
      });
      let hashPass = bcrypt.hashSync(newUser.password, 11);
      newUser.password = hashPass;
      newUser.save(function(err){
        if(err){
          console.log(err);
          return res.status(404).render('all_users.hbs', {
          pageTitle: 'User Management',
          message:'Error in User Save',
          err:err
          });
        }
        User.findOne({email: req.body.email}, '_id', function(err, user){
          const userMeta = new UserMeta({
            firstname:user.firstname,
            lastname:user.lastName,
            userid: user._id
          });
          userMeta.save(function(err){
            if(err){
              console.log(err);
              return res.status(404).render('.hbs', {
                pageTitle: 'Sign up',
                message:'Error in User meta Save',
                err:err
              });
            } else {
              console.log("User Created");
              return res.redirect("/users/usermanagement")
            }
          });
        });
      });
    }
});







// Register Proccess
router.post('/register', ensureNotAuthenticated, async (req, res) => {
 
  let firstName       = req.body.firtstname;
  let lastName        = req.body.lastname;
  let role            = "superadmin"
  let status          = "active"
  let displayname     = firstName + +lastName;
 
  req.checkBody('username', 'User Name is required').notEmpty();
  req.checkBody('email', 'Email is required').notEmpty();
  req.checkBody('email', 'Email is not valid').isEmail();
  req.checkBody('phonenumber', 'phonenumber is required').notEmpty();
  req.checkBody('phonenumber', 'phonenumber is required').isNumeric();
  req.checkBody('password', 'Passwords is required').notEmpty();
  req.checkBody('password2', 'Passwords do not match').equals(req.body.password);
  
  let errors = req.validationErrors();
  if (errors) return res.status(404).render('register.hbs', {
    pageTitle: 'Sign up',
    errors:errors,
    message:'validation error'
  });

  let userexist = await User.findOne({email: req.body.email}, '_id', function(err, user){}); 
    if(userexist) {
      return res.status(404).render('register.hbs', {
        pageTitle: 'Sign up',
        message:'User already exist with this phone number'
      });
    } else {
      const newUser = new User({
        username:req.body.username,
        email:req.body.email,
        displayname: displayname,
        phonenumber:req.body.phonenumber,
        role:role,
        password:req.body.password,
        status:status
      });
      let hashPass = bcrypt.hashSync(newUser.password, 11);
      newUser.password = hashPass;
      newUser.save(function(err){
        if(err){
          console.log(err);
          return res.status(404).render('register.hbs', {
          pageTitle: 'Sign up',
          message:'Error in User Save',
          err:err
          });
        }
        User.findOne({email: req.body.email}, '_id', function(err, user){
          const userMeta = new UserMeta({
            firstname:firstName,
            lastname:lastName,
            userid: user._id
          });
          userMeta.save(function(err){
            if(err){
              return res.status(404).render('register.hbs', {
                pageTitle: 'Sign up',
                message:'Error in User meta Save',
                err:err
              });
            } else {
              return res.status(200).render('register.hbs', {
                pageTitle: 'Sign up',
                message:'User Successfully Register'
              });
            }
          });
        });
      });
    }
});

// Fetch Login Form
router.get('/login', ensureNotAuthenticated, function(req, res){
  res.render('login.hbs', { pageTitle: 'Login', error: req.flash('error')[0] });    
});

//Login Check For Adminpanel
router.post('/login', function(req, res, next){
  req.checkBody('email', 'email is required').notEmpty();
  req.checkBody('email', 'Email is not valid').isEmail();
  req.checkBody('password', 'Passwords is required').notEmpty();
  let errors = req.validationErrors();
  if (errors) return res.status(404).res.render('login.hbs', { pageTitle: 'Login', error: req.flash('error')[0] });
  passport.authenticate('local', {
    successReturnToOrRedirect: '/',
    failureRedirect:'/users/login',
    failureFlash: true
  })(req, res, next);
});

// Forget Password Page
router.get('/forgetpassword', ensureNotAuthenticated, function (req, res) {
  let message = req.query.pass;
  if(req.query.step) {
    res.render('forgetpassword.hbs', {
      pageTitle: 'Forget Password',
      userid:req.query.step
    });
  } else {
    res.render('forgetpassword.hbs', {
      pageTitle: 'Forget Password',
      message:message
    });
  }  
});

// forget Passwor Form Submit
router.post('/forgetpassword', async function(req, res, next){
  if(req.body.firststep) {
    req.checkBody('emailid', 'email id is required').notEmpty();
    let errors = req.validationErrors();
    if (errors) return res.status(404).json({ 'success': false, 'message': 'validation error' });

    let userExist = await User.findOne({email: req.body.emailid, status:"active"}, 'email', function(err, user){}); 
    if(!userExist){
      return res.status(404).json({ 'success': false, 'message': 'No user found' });
    } else {
      var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'ratnesh3rde@gmail.com',
          pass: 'Roopesh_123'
        }
      });
      if(req.hostname == 'localhost') {
        var url = req.protocol+'://'+req.hostname+':3000/users/forgetpassword/?step='+userExist._id;
      } else {
        var url = req.hostname+'/users/forgetpassword/?step='+userExist._id;
      }
      var userEmail = userExist.email;
      var emailText = 'please click on the below link for the forget password link';
      emailText += '<p><a href="'+url+'">click here</a>';
      var mailOptions = {
        from: 'ratnesh3rde@gmail.com',
        to: userEmail,
        subject: 'Forget Password Link',
        html: emailText
      };
      
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
          return res.status(404).json({ 'success': false, 'message': error });
        } else {
          return res.status(200).json({ 'success': true, 'message': 'email sent successfully' });
        }
      });
    }
       
  } else {
    req.checkBody('newpassword', 'Password is required').notEmpty();
    let errors = req.validationErrors();
    if (errors) return res.status(404).json({ 'success': false, 'message': 'validation error' });
    let userPassExist = await User.findOne({email: req.body.emailid, status:"active"}, 'email', function(err, user){});
    if(!userPassExist){
      return res.status(404).json({ 'success': false, 'message': 'No user found' });
    } else {
      let hashPass = bcrypt.hashSync(req.body.newpassword, 11);
      let userobject = {};
      userobject.password = hashPass;
      let query = {_id: req.body.userid}
      User.update(query, userobject, function(err){
        if(err){
          return res.status(404).json({ 'success': false, 'message': err });
        } else {
          return res.status(200).json({ 'success': true, 'message': 'Successfully Change the password' });
        }
      });
    }
  }
});

// Login Process For application
router.post('/applogin', async function(req, res, next){
  req.checkBody('email', 'email is required').notEmpty();
  req.checkBody('email', 'Email is not valid').isEmail();
  req.checkBody('password', 'Passwords is required').notEmpty();

  let errors = req.validationErrors();
  if (errors) return res.status(404).json({ 'success': false, 'message': 'validation error' });

  let userExist = await User.findOne({ email: req.body.email, status:"active" }).select('-1');
  if(!userExist){
    return res.status(404).json({ 'success': false, 'message': 'No user found' });
  } else {
    bcrypt.compare(req.body.password, userExist.password, function(err, isMatch){
      if(err) throw err;
      if(isMatch){
        return res.status(200).json({ 'success': true, 'name': userExist.name, 'email': userExist.email, 'phonenumber': userExist.phonenumber, '_id':userExist._id, 'role':userExist.role, 'user':userExist });
      } else {
        return res.status(404).json({ 'success': false, 'message': 'Wrong password' });
      }
    });
  }
});

// Change Password Api for Application
router.post('/changepassword', async function(req, res, next){
  req.checkBody('email', 'email is required').notEmpty();
  req.checkBody('email', 'Email is not valid').isEmail();
  req.checkBody('newpassword', 'Password is required').notEmpty();
  if( req.body.flag == 1) {
    req.checkBody('oldpassword', 'Old Password is required').notEmpty();
  }
  let errors = req.validationErrors();
  if (errors) return res.status(404).json({ 'success': false, 'message': errors  });

  let userExist = await User.findOne({ email: req.body.email, status:"active" }).select('-1');

  if(!userExist){
    return res.status(404).json({ 'success': false, 'message': 'No user found' });
  } else {
    if( req.body.flag == 1) {
      bcrypt.compare(req.body.oldpassword, user.password, function(err, isMatch){
        if(err) throw err;
        if(isMatch){
          let hashPass = bcrypt.hashSync(req.body.newpassword, 11);
          let userobject = {};
          userobject.password = hashPass;
          let query = {email:req.body.email}
          User.update(query, userobject, function(err){
            if(err){
              return res.status(404).json({ 'success': false, 'message': err });
            } else {
              return res.status(200).json({ 'sucess': true, 'message': 'Successfully Change the password' });
            }
          });
        } else {
          return res.status(404).json({ 'success': false, 'message': 'You have Entered Wrong password' });
        }
      });
    } else {
      let hashPass = bcrypt.hashSync(req.body.newpassword, 11);
      let userobject = {};
      userobject.password = hashPass;
      let query = {email:req.body.email}
      User.update(query, userobject, function(err){
        if(err){
          return res.status(404).json({ 'success': false, 'message': err });
        } else {
          return res.status(200).json({ 'sucess': true, 'message': 'Successfully Change the password' });
        }
      });
    }
  }
});

router.post('/latestuserdetails', function (req, res) {
  if(req.body.userid) {
    User.findById(req.body.userid, function(err, user){
      if(err) {
        res.json({ 'success': false, 'message': err });
      } else {
        res.json({ 'sucess': true, 'user': user });
      }
    });  
  } else {
    res.json({ 'success': false, 'message': 'please provide the user id' });
  }
});



// logout
router.get('/logout', function(req, res){
  req.logout();
  req.flash('success', 'You are logged out');
  res.redirect('/users/login');
});

function ensureNotAuthenticated(req, res, next) {
  if (!req.isAuthenticated()) {
      return next();
  } else {
      req.session.returnTo = req.originalUrl;
      res.redirect('/');
  }
}

module.exports = router;