const passport = require('passport')
const LocalStrategy = require('passport-local');
const userService = require('./userService')
const crypto = require('crypto');

function initializePassport(passport) {

    const myLocalStrategy = new LocalStrategy({usernameField: "email"}, verify)
    passport.use(myLocalStrategy.name, myLocalStrategy)

    passport.serializeUser(function(user, cb) {
        process.nextTick(function() {
            cb(null, { email: user.email });
        });
    });

    passport.deserializeUser(function(user, cb) {
        process.nextTick(function() {
            return cb(null, user);
        });
    });


}

async function verify(email, password, done) {
    console.log("EnteredVerify!")

    // Check if credentials are valid
    if (!email || !password) {
        console.log("Passport Verify: Invalid Credentials")
        return done(Error("LoveDva"))
    }

    // If user is valid, get user information from database
    const user = await userService.grabUser(email)

    // If user email does not exist, then...
    if (!user) {
        console.log("Passport Verify: User does not exist")
        return done(null, false, { message: 'Passport Verify: User does not exist' })
    }

    // User exists, continue validating user password
    const salt = Buffer.from(user[1], 'hex');
    const hash = Buffer.from(user[2], 'hex');
    crypto.pbkdf2(password, salt, 31000, 32, 'sha256', (error, hashedPassword) => {
        if (error) {
            return done(error)
        }

        // Compare passwords in database to password*salt
        if (!crypto.timingSafeEqual(hash, hashedPassword)) {
            console.log("userAuth: Incorrect Password!")
            return done(null, false, { message: 'Incorrect username or password.' });
        }

        console.log("userAuth: Correct Password!")
        return done(null, user)
    })


}

module.exports = initializePassport


