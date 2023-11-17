const express = require('express');
const router = express.Router();
const userService = require("../routes/userService");


// HTML VERSION Get Request for Login Page, returns Login HTML
// router.get('/login', (req, res) => {
//     res.redirect('/login.html')
// })

// PUG VERSION Get Request for Login Page, returns Login HTML
router.get('/login', (req, res) => {
    res.render('user/login')
})

// POST request for logging in
router.post('/login', (req, res) => {
     
    res.send("logging in")
})





// Get Request for Register Page, returns Register HTML
router.get('/register', (req, res) => {
    res.render('user/register')
})

// POST request for registering new user, requires email, name, password
// Redirects to Login page if successful
router.post('/register', async (req, res) => {
    console.log("UserController: Registering new user!");
    const {email, name, password} = req.body;

    // If any of the user data is null, send code 400
    if (email == null || name == null || password == null) {
        res.status(400).send('Bad Register Request');
    }

    try {
        const registerResult = await userService.registerUser(email, name, password);
        if (registerResult) {
            res.status(200).redirect('/user/login')
        } else{
            res.status(500).json({ error: "Unable to register user to database." });
        }
    } catch (error) {
        console.error("Error registering user:", error)
        res.status(500).json({ error: "An error occurred while registering user." });
    }


});

module.exports = router;