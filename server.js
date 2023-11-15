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
const pug = require('pug');
app.set("view engine", "pug")

// Middleware setup
app.use(express.static('public'));  // Serve static files from the 'public' directory
app.use(express.json());             // Parse incoming JSON payloads
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));


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

// ----------------------------------------------------------
// Starting the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
});

