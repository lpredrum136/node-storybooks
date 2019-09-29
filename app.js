const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');// This access the values posted in forms
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const passport = require('passport');

// Load models
require('./models/User');
require('./models/Story');

// Passport config
require('./config/passport')(passport);

// Load routes
const auth = require('./routes/auth');
const index = require('./routes/index');
const stories = require('./routes/stories');

// Load keys
const keys = require('./config/keys');

// Handlebars helpers
const {
    truncate,
    stripTags,
    formatDate,
    //select // Commented out because I found an easier solution, see helpers/hbs.js for more info
    editIcon
} = require('./helpers/hbs');

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

// Body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Handlebars middleware
app.engine('handlebars', exphbs({
    helpers: {
        truncate: truncate,
        stripTags: stripTags,
        formatDate: formatDate,
        //select:select // Commented out because I found an easier solution, see helpers/hbs.js for more info
        editIcon: editIcon
    },// To import the helpers function for rendering hbs so that you can use these functions in handlebars file
    defaultLayout: 'main'// If you dont set this, defaultLayout will be "layout.handlebars"
}));
app.set('view engine', 'handlebars');

// Static folder: Tell app this is the static folder with css, front-end views, images.
app.use(express.static(path.join(__dirname, 'public')));

// Method override middleware
app.use(methodOverride('_method'));

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
app.use('/stories', stories);

const port = process.env.PORT || 5000;

app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});