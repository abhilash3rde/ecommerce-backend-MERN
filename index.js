require('dotenv').config();
const express           = require('express');
const path              = require('path');
const cors              = require('cors');
const bodyParser        = require('body-parser');
const expressValidator  = require('express-validator');
const session           = require('express-session');
const passport          = require('passport');
const hbs               = require('hbs');
const flash             = require('connect-flash');
const moment            = require('moment-timezone');
const db                = require('./config/database');
const errorHandler      = require('./config/error-handler');
const cookieparser      = require("cookie-parser");
const User              = db.User;
const Product           = db.Product;
const PORT              = process.env.PORT || 3000;
const app               = express();
var morgan              = require("morgan");
var request               = require('request');
const Notify = require("./models/notification");

// var ip = req.headers['x-forwarded-for'] || 
//      req.connection.remoteAddress || 
//      req.socket.remoteAddress ||
//      req.connection.socket.remoteAddress;
//      console.log(ip);

app.use(
    session({
      key: "user_sid",
      secret: "secret",
      resave: false,
      saveUninitialized: false,
      cookie: {
        expires: 600000
      }
    })
  );

  

require('./config/passport')(passport);
hbs.registerPartials(__dirname + '/views/partials');

app.set('view engine', 'hbs');
app.set('views', __dirname + '/views');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(flash());
app.use(function (req, res, next) {
    res.locals.messages = require('express-messages')(req, res);
    next();
});

app.use(expressValidator({
    errorFormatter: function (param, msg, value) {
        var namespace = param.split('.')
            , root = namespace.shift()
            , formParam = root;

        while (namespace.length) {
            formParam += '[' + namespace.shift() + ']';
        }
        return {
            param: formParam,
            msg: msg,
            value: value
        };
    }
}));

app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(morgan('dev'));
app.use(errorHandler);
app.use(cookieparser());

app.use(express.static(path.join(__dirname, 'public')));
app.use('*/css', express.static('public/css'));
app.use('*/js', express.static('public/js'));
app.use('*/images', express.static('public/images'));
app.use('*/fonts', express.static('public/fonts'));
app.use('*/uploads', express.static('public/uploads'));

hbs.registerHelper('getCurrentYear', () => {
    return new Date().getFullYear()
});

hbs.registerHelper('equal', function (lvalue, rvalue, options) {
    if (arguments.length < 3)
        throw new Error("Handlebars Helper equal needs 2 parameters");
        let newlvalue = JSON.stringify(lvalue);
        let newrvalue = JSON.stringify(rvalue);
    if (newlvalue !== newrvalue) {
        console.log(typeof newlvalue);
        console.log(typeof newrvalue);
        return options.inverse(this);
    } else {
        console.log("matched");
        return options.fn(this);
    }
});

hbs.registerHelper('notequal', function (lvalue, rvalue, options) {
    if (arguments.length < 3)
        throw new Error("Handlebars Helper equal needs 2 parameters");
    if (lvalue == rvalue) {
        return options.inverse(this);
    } else {
        return options.fn(this);
    }
});

// hbs.registerHelper('subtract', function (lvalue, rvalue, options) {
//     if (arguments.length < 3) {
//         throw new Error("Handlebars Helper equal needs 2 parameters");
//     }
//     var newvalue = lvalue - rvalue;
//     return newvalue;
// });

// hbs.registerHelper('sum', function (lvalue, rvalue, options) {
//     if (arguments.length < 3) {
//         throw new Error("Handlebars Helper equal needs 2 parameters");
//     }
//     var newvalue = lvalue + rvalue;
//     return newvalue;
// });


// hbs.registerHelper('select', function( value, options ){
//     var $el = $('<select />').html( options.fn(this) );
//     $el.find('[value="' + value + '"]').attr({'selected':'selected'});
//     return $el.html();
// });

hbs.registerHelper('select', function(selected, options) {
    return options.fn(this).replace(
        new RegExp(' value=\"' + selected + '\"'),
        '$& selected="selected"');
});


hbs.registerHelper('list', function(context, lvalue, rvalue, options) {
    if(context) {
        var ret = "<select class='form-control' name='attribute_taxonomy' id='offerproductname'>";
        for(var i=0, j=context.length; i<j; i++) {
            if (options.fn(context[i]).trim() == lvalue.trim()) {
                ret = ret + "<option value='"+options.fn(context[i]).trim()+"' selected='' data-productid='"+context[i]._id+"'>"+options.fn(context[i]).trim()+"</option>";
            } else {
                ret = ret + "<option value='"+options.fn(context[i]).trim()+"' data-productid='"+context[i]._id+"'>"+options.fn(context[i]).trim()+"</option>";
            }
        }
        return ret + "</select>";
    } else {
        var ret = "<select class='form-control' name='"+rvalue+"' id='offerproductname'>";
        return ret + "</select>";
    }
});

// hbs.registerHelper('retailerbrandprice', function(brandkey, retailprice, brandprice) {
//     if(retailprice) {
//         var retailerbrandprice = retailprice[brandkey];
//     } else {
//         var retailerbrandprice = brandprice;
//     }
//     return retailerbrandprice;
// });

// hbs.registerHelper('retailerbranddiff', function(brandkey, retailerpricediff) {
//     if(retailerpricediff) {
//         var pricediff = retailerpricediff[brandkey];
//     } else {
//         var pricediff = 0;
//     }
//     return pricediff;
// });

// hbs.registerHelper('dateformat', function (datetime, format) {
//     return moment(datetime).format(format);
// });

hbs.registerHelper('splitTitle', function(lvalue, options) {
    var str;
    if(lvalue) {
        str= lvalue.split(' ').join('_');
    } else {
        str = "default page";
        str= str.split(' ').join('_');
    }
    var res = str.toLowerCase();
    return res;
});

// hbs.registerHelper('removeAndsign', function(lvalue, action) {
//     var str;
//     if(action == 'remove') {
//         str= lvalue.split('-').join('&');
//     } else {
//         str= lvalue.split('&').join('-');
//     }
//     return str;
// });

// hbs.registerHelper('getbrandname', function(brandkey, productbrand) {
//     if(productbrand) {
//         var brandname = productbrand[brandkey].productbrand;
//     }
//     return brandname;
// });

// app.use(session({
//     secret: 'keyboard cat',
//     resave: true,
//     saveUninitialized: true
// }));




require("./Strategies/google");

app.use(passport.initialize());
app.use(passport.session());

app.get('*', function (req, res, next) {
    res.locals.user = req.user || null;
    next();
});






// Home Route
app.get('/', loggedIn, async function (req, res) {
    let usercount = await User.count();
    // let productcount = await Product.count();
    Notify.find({title: "New Order"}).sort({notificationtime: 'desc'}).then((data) => sort(data));
    console.log({count: usercount});
    
    function sort(data){
    //     console.log({database :data})
    // var newOrders = data.filter(function (el) {
    //     return el.title == 'New Order'
    // });
    
let olddate = data[0].notificationtime;
let newdate = Date.now();
var d = Math.abs(olddate - newdate) / 1000;               
var r = {};                                                               
var s = {                                                                  
    year: 31536000,
    month: 2592000,
    week: 604800, 
    day: 86400,   
    hour: 3600,
    minute: 60,
    second: 1
};

Object.keys(s).forEach(function(key){
    r[key] = Math.floor(d / s[key]);
    d -= r[key] * s[key];
});

var time_elapsed;
if(r.year !== 0){
    time_elapsed = r.year + " Years ago"
} else if(r.month !== 0 && r.year == 0){
    time_elapsed = r.month + " Months ago"
} else if(r.week !== 0 && r.month == 0 && r.year == 0){
    time_elapsed = r.week + " Weeks ago"
} else if(r.week == 0 && r.month == 0 && r.year == 0 && r.day !== 0){
    time_elapsed = r.day + " Days ago"
} else if(r.week == 0 && r.month == 0 && r.year == 0 && r.day == 0 && r.hour !== 0){
    time_elapsed = r.hour + " Hours ago"
} else if(r.week == 0 && r.month == 0 && r.year == 0 && r.day == 0 && r.hour == 0 && r.minute !== 0){
    time_elapsed = r.minute + ' Minutes ago'
} else if(r.week == 0 && r.month == 0 && r.year == 0 && r.day == 0 && r.hour == 0 && r.minute == 0 && r.second !== 0){
    time_elapsed = r.second; + " Seconds ago";
}
console.log(time_elapsed);



// //     // record start time
// // var startTime = new Date();

// // ...

// // // later record end time
// // var endTime = new Date();

// // time difference in ms
// var timeDiff = newdate - olddate;
// console.log({ms: timeDiff});
// // // strip the ms
// timeDiff /= 1000;

// // // get seconds (Original had 'round' which incorrectly counts 0:28, 0:29, 1:30 ... 1:59, 1:0)
// var seconds = Math.round(timeDiff % 60);
// console.log({seconds: seconds})
// // remove seconds from the date
// timeDiff = Math.floor(timeDiff / 60);

// // get minutes
// var minutes = Math.round(timeDiff % 60);

// // remove minutes from the date
// timeDiff = Math.floor(timeDiff / 60);

// // get hours
// var hours = Math.round(timeDiff % 24);

// // remove hours from the date
// timeDiff = Math.floor(timeDiff / 24);

// // the rest of timeDiff is number of days
// var days = timeDiff ;


    res.render('index.hbs', {
        pageTitle: 'Home Page',
        usercount: usercount,
        order_elapsedtime: time_elapsed
        // productcount: productcount
    }); 

}
});

function loggedIn(req, res, next) {
    if (req.user) {
        next();
    } else {
        req.session.returnTo = req.originalUrl;
        res.redirect('/users/login');
    }
}

app.use('/users', require('./routes/users'));
app.use('/products', require('./routes/products'));
app.use('/categories', require('./routes/categories'));
app.use('/options', require('./routes/options'));
app.use('/getinfo', require('./routes/getcountry'));
//app.use('/brokers', require('./routes/brokers'));
//app.use('/offers', require('./routes/offers'));
//app.use('/payments', require('./routes/payments'));
//app.use('/inquires', require('./routes/inquires'));
//app.use('/orders', require('./routes/orders'));
//app.use('/settings', require('./routes/settings'));
app.use('/order', require('./routes/orders'));
app.use('/', require('./routes/subscribed'));
app.use('/wishlist', require('./routes/wishlist'));
app.use('/pages', require('./routes/pages'));
app.use('/', require("./routes/google"));
//app.use('/sliders', require('./routes/sliders'));

app.listen(PORT, () => console.log('Listening on '+ PORT));