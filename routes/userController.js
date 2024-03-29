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
        const errorMessage = "Please log in before accessing " + destination[1] + "."
        req.flash("error", errorMessage);
        res.redirect('/user/login');
    }
}

// PUG VERSION Get Request for Login Page, returns Login HTML
router.get('/login', (req, res) => {
    // console.log(req.session)
    // console.log(req.user)
    if (req.user) {
        return res.redirect('/user/profile')
    }

    res.render('user/login', { message: req.flash('error')});
})

// Render user profile page
router.get('/profile', checkLogin, (req, res) => {
    // Only online user can access beyond this point
    // console.log(req.user)
    const user = req.user
    res.render('user/profile', { user:user })
})

// POST request for logging in
router.post('/login', passport.authenticate('local', {
    successRedirect: '/user/profile',
    failureRedirect: '/user/login',
    failureFlash: true
}))




router.get('/deleteUser', (req, res) => {
    res.render('user/deleteUser')
})

// Delete User
router.delete('/deleteUser', checkLogin, (req, res, next) => {
    const user = req.user.user
    console.log("Delete user: " + user);

    return userService.deleteUser(user)
        .then((deleteResult) => {
            if (deleteResult) {
                res.redirect(303,'/user/logout')
            } else {
                console.log("coffee");
            }
        })
        .catch((error) => {
            res.status(500).json({ error: "Unable to delete user." });
        })


})

// Get logout page
router.get('/logout', function(req, res, next) {
    res.render('user/logout')
});

// Request logout
router.post('/logout', function(req, res, next) {
    req.logout(function(err) {
        if (err) {
            return next(err);
        }
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
    const {email, name, password, postalCode, city, province} = req.body;

    // If any of the user data is null, send code 400
    if (email == null || name == null || password == null) {
        res.status(400).send('User Register: Bad Register Request');
    }

    // Check if email already is used:
    
    const duplicateEmail = await userService.checkEmail(email)
    if (duplicateEmail) {
        req.flash("error", "Email already in use. Try another email");
        return res.status(200).redirect('/user/login')
    }

    const salt = crypto.randomBytes(16);
    

    crypto.pbkdf2(password, salt, 31000, 32, 'sha256', function (error, hashedPassword) {

        if (error) {
            return next(error)
        }

        return userService.registerUser(email, name, salt, hashedPassword, postalCode, city, province)
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
    let { date_filter } = req.query

    if (date_filter == null || date_filter < 0) {
        date_filter = 1
    }
    try {
        const fav_book_data = await userService.grabFavouriteBooks(req.user.user, date_filter)
        const fav_film_data = await userService.grabFavouriteFilms(req.user.user, date_filter)
        res.render('user/library', {books: fav_book_data, films: fav_film_data});
    } catch (error) {
        console.error("Error fetching library data:", error)
        res.status(500).json({ error: "An error occurred while fetching library data." });
    }
})

// Render Update User Page
router.get('/updateUser', checkLogin, (req, res) => {
    res.render('user/updateUser')
})

// POST request to update user email
router.post('/updateUserName', checkLogin, async (req, res) => {
    const { name } = req.body

    if (name == null) {
        res.send("Bad userName Request")
    }

    return userService.changeUserName(req.user.user, name)
        .then((result) => {
            if (result) {
                res.redirect('/user/profile')
            } else {
                res.send("Failed to update userName")
            }
        }).catch((error) => {
            res.send(error)
        })

})

// POST request to update user password
router.post('/updateUserPassword', checkLogin, async (req, res) => {
    const { password } = req.body

    if (password == null) {
        return res.status(400).send("Bad new Password Request");
    }

    const salt = crypto.randomBytes(16);

    crypto.pbkdf2(password, salt, 31000, 32, 'sha256', function (error, hashedPassword) {

        if (error) {
            return next(error)
        }

        return userService.changeUserPassword(req.user.user, salt, hashedPassword)
            .then((registerResult) => {
                if (registerResult) {
                    req.flash("error", "Password Change Successful. Please log in.");
                    return res.status(200).redirect('/user/login')
                } else{
                    res.status(500).json({ error: "Unable to update password to database." });
                }
            }).catch((error) => {
                return res.status(500).json({ error: "Unable to update user password in the database." });
            })
    });
    


});

module.exports = router;