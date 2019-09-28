const express = require('express');
const exphbs = require('express-handlebars');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const passport = require('passport');

// Load User model
require('./models/User');

// Passport config
require('./config/passport')(passport);

// Load routes
const auth = require('./routes/auth');
const index = require('./routes/index');

// Load keys
const keys = require('./config/keys');

// Map global Promises
mongoose.Promise = global.Promise;

// Mongoose connect
mongoose.connect(keys.mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => {
        console.log('MongoDB connected');
    })
    .catch(err => console.log(err));

const app = express();

// Handlebars middleware
app.engine('handlebars', exphbs({
    defaultLayout: 'main'// If you dont set this, defaultLayout will be "layout.handlebars"
}));
app.set('view engine', 'handlebars');

// Cookieparser middleware
app.use(cookieParser());

// Session middleware
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false // Two falses because I guess this is managed by Google, not by ourselves anymore. In previous project, both were true
}))

// Passport middleware. NOTE: MUST BE PUT AFTER EXPRESS SESSION MIDDLEWARE
app.use(passport.initialize());
app.use(passport.session());

// Set global vars to use in front end
app.use((req, res, next) => {
    res.locals.user = req.user || null;// The structure of global user is exactly like its structure in DB, i.e. user.id, user.name etc
    next();
});

// Use routes
app.use('/auth', auth);
app.use('/', index);

const port = process.env.PORT || 5000;

app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});