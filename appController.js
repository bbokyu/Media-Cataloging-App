const express = require('express');
const appService = require('./appService');

const router = express.Router();

// ----------------------------------------------------------
// API endpoints
// Modify or extend these routes based on your project's needs.

router.get('/', async(req, res) => {
    return res.redirect(301, '/media/browse');
});


module.exports = router;
