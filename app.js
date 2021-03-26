const path = require('path')
const express = require('express')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
var exphbs = require('express-handlebars');
const ejsLint = require('ejs-lint');
const expressLayouts = require('express-ejs-layouts');
const morgan = require('morgan')
const ejs = require('ejs')
const passport = require('passport')
const passportlocal = require('passport-local');
const session = require('express-session')
const flash = require('flash')
var uniqueValidator = require('mongoose-unique-validator');


//const MongoStore = require('connect-mongo')(session)



//app use
const app = express();
app.use(morgan('dev'))
    //app.disable('etag');

// Passport Config
require('./config/passport')(passport);

//config
dotenv.config({ path: '.env' });
const db = process.env.MONGODB_URI;
const PORT = process.env.PORT || 3000;



// Connect to MongoDB
mongoose
    .connect(
        db, { useNewUrlParser: true, useUnifiedTopology: true }
    )
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));


//views EJS
app.set('views', path.join(__dirname, 'views'))
app.use(expressLayouts);
app.set('view engine', 'ejs');



//parser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());



app.use(session({
    secret: "secret",
    resave: false,
    saveUninitialized: true,
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());



app.use(flash());

// Global Vars
app.use(function(req, res, next) {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.user = req.user || null;
    next();
});


//static
app.use(express.static(path.join(__dirname, 'public')))

//router

var index = require('./routes/index');
var user = require('./routes/user');
var auth = require('./routes/auth');


//routers
app.use('/user', user)
app.use('/auth', auth);
app.use('/', index)

//Start Server
app.listen(PORT, () => {
    console.log('Sever listening at ' + PORT)
});