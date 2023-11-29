const express = require('express');
const router = express.Router();
const userService = require("../routes/userService");
const passport = require('passport')
const crypto = require('crypto')
const db = require("../appService");


// Check if user is logged in
function checkLogin(req, res, next) {
    if (req.user) {
        next();
    } else {

        const destination = req.path.split("/")
        const errorMessage = "Please log in before accessing your " + destination[1] + "."
        req.flash("error", errorMessage);
        res.redirect('/user/login');
    }
}

// PUG VERSION Get Request for Login Page, returns Login HTML
router.get('/login', (req, res) => {
    // console.log(req.session)
    // console.log(req.user)
    if (req.user) {
        res.redirect('/user/profile')
    }

    res.render('user/login', { message: req.flash('error')});
})

// Render user profile page
router.get('/profile', checkLogin, (req, res) => {
    // Only logged in user can access beyond this point
    console.log(req.user)
    const user = req.user

    res.render('user/profile', { user:user })
})

// POST request for logging in
router.post('/login', passport.authenticate('local', {
    successRedirect: '/user/profile',
    failureRedirect: '/user/login',
    failureFlash: true
}))


// Get logout page
router.get('/logout', function(req, res, next) {
    res.render('user/logout')
});

// Request logout
router.post('/logout', function(req, res, next) {
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/user/login');
    });
});




// Get Request for Register Page, returns Register HTML
router.get('/register', (req, res) => {
    if (req.user) {
        // req.flash("error", "Please log out before registering new user");
        console.log("Must log out before registering new user!")
        res.redirect('/user/profile');
    }
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
                    req.flash("error", "Register Successful. Please log in.");
                    res.status(200).redirect('/user/login')
                } else{
                    res.status(500).json({ error: "Unable to register user to database." });
                }
            }).catch((error) => {
                console.log(error)
            })
    });
});

router.get('/library', checkLogin, async (req, res) => {
    const user = req.user
    return userService.grabFavourites(req.user.user)
        .then((fav_book_data) => {
            res.render('user/library', {books: fav_book_data});
        })
        .catch((error) => {
            res.render('user/library', { message: "Unable to grab Library!"});
        })
})




module.exports = router;