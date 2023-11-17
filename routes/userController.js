const express = require('express');
const router = express.Router();
const userService = require("../routes/userService");
const passport = require('passport')
const crypto = require('crypto')



// HTML VERSION Get Request for Login Page, returns Login HTML
// router.get('/login', (req, res) => {
//     res.redirect('/login.html')
// })

// PUG VERSION Get Request for Login Page, returns Login HTML
router.get('/login', (req, res) => {
    // console.log(req.session)
    // console.log(req.flash('error'))

    res.render('user/login', { message: req.flash('error') });
})


// POST request for logging in
router.post('/login', passport.authenticate('local', {
    successRedirect: '/user/profile',
    failureRedirect: '/user/login',
    failureFlash: true
}))

// Request logout
router.post('/logout', function(req, res, next) {
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/user/login');
    });
});




// Get Request for Register Page, returns Register HTML
router.get('/register', (req, res) => {
    res.render('user/register')
})

// POST request for registering new user, requires email, name, password
// Redirects to Login page if successful
router.post('/register', async (req, res, next) => {
    console.log("UserController: Registering new user!");
    const {email, name, password} = req.body;

    // If any of the user data is null, send code 400
    if (email == null || name == null || password == null) {
        res.status(400).send('User Register: Bad Register Request');
    }

    const salt = crypto.randomBytes(16);

    crypto.pbkdf2(password, salt, 31000, 32, 'sha256', function (error, hashedPassword) {

        if (error) {
            return next(error)
        }

        return userService.registerUser(email, name, salt, hashedPassword)
            .then((registerResult) => {
                if (registerResult) {
                    res.status(200).redirect('/user/login')
                } else{
                    res.status(500).json({ error: "Unable to register user to database." });
                }
            }).catch((error) => {
                console.log(error)
            })
    });
});



// Render user profile page
router.get('/profile', (req, res) => {
    console.log("THIS RUNS?")
    res.render('user/profile')
})

module.exports = router;