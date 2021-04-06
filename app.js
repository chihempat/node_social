const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const expressLayouts = require('express-ejs-layouts');
const morgan = require('morgan');
const passport = require('passport');
const session = require('express-session');
const flash = require('flash');
const methodOverride = require('method-override');
// const uniqueValidator = require('mongoose-unique-validator');

global.fr = [];
global.rl = [];
global.sr = [];

// app use
const app = express();
app.use(morgan('dev'));
// app.disable('etag');

// Passport Config
require('./config/passport')(passport);

// config
dotenv.config({ path: '.env' });
const db = process.env.MONGODB_URI;
const PORT = process.env.PORT || 3000;

// eslint-disable-next-line consistent-return
app.use(methodOverride((req, res) => {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        // look in urlencoded POST bodies and delete it
        const method = req.body._method;
        delete req.body._method;
        return method;
    }
}));

// Connect to MongoDB
mongoose
    .connect(
        db, { useNewUrlParser: true, useUnifiedTopology: true },
    )
    .then(() => console.log('MongoDB Connected'))
    .catch((err) => console.log(err));

// views EJS
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('view engine', 'ejs');

// parser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: true,
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

// Global Vars
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.user = req.user || null;
    next();
});

// static
app.use(express.static(path.join(__dirname, 'public')));

// router

const index = require('./routes/index');
const user = require('./routes/user');
const auth = require('./routes/auth');

// routers
app.use('/user', user);
app.use('/auth', auth);
app.use('/', index);

// Start Server
app.listen(PORT, () => {
    console.log(`Sever listening at ${PORT}`);
});