const express = require('express');
const appController = require('./appController');
const bodyParser = require('body-parser')

// Load environment variables from .env file
// Ensure your .env file has the required database credentials.
const loadEnvFile = require('./utils/envUtil');
const envVariables = loadEnvFile('./.env');

const app = express();
const PORT = envVariables.PORT || 65534;  // Adjust the PORT if needed (e.g., if you encounter a "port already occupied" error)

// Enable pug
const pug = require('pug');1
app.set("view engine", "pug")

// Adds helpful logs to console (Optional)
const logger = require('morgan');
app.use(logger('dev'));


// Middleware setup
app.use(express.static('public'));  // Serve static files from the 'public' directory
app.use(express.json());             // Parse incoming JSON payloads
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

// Setup Session
const session = require('express-session');
app.use(session({
    secret: "Meow",
    resave: false,
    saveUninitialized: false
}))

// Flash Messages for User Auth.
const flash = require("connect-flash");
app.use(flash());

// Setup Passport
const passport = require('passport')
const initializePassport = require('./routes/userAuth')
initializePassport(passport);
app.use(passport.initialize({}))
app.use(passport.session({}))

// This makes it so that the request object is available on every page
app.use(function (req, res, next) {
    res.locals.user = req.user;
    next();
});


// If you prefer some other file as default page other than 'index.html',
//      you can adjust and use the bellow line of code to
//      route to send 'DEFAULT_FILE_NAME.html' as default for root URL
// app.get('/', (req, res) => {
//     res.sendFile(__dirname + '/public/DEFAULT_FILE_NAME.html');
// });


// mount the router
app.use('/', appController);

// Media Routes
const mediaRoutes = require('./routes/mediaRoutes')
const mediaApi = require('./api/media')

app.use('/media', mediaRoutes);
app.use('/api/media', mediaApi);

// User Routes
const userRoutes = require('./routes/UserController')

app.use('/user', userRoutes);



// ----------------------------------------------------------
// Starting the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
});

