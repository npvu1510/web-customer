require('dotenv').config()

const passport = require('passport');
const LocalStrategy = require('passport-local');
const GoogleStrategy = require('passport-google-oauth2').Strategy;
const googleService = require('../components/google/googleService');
const userService = require('../components/user/userService');


// authN local
passport.use(new LocalStrategy(
    async (username, password, cb) => {
        const user = await userService.verifyUser(username, password);
        if (user && user.confirm === true && user.status !== 'Banned') return cb(null, user);
        return cb(null, false);
    }));

// authN google
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
    passReqToCallback: true
},
    async (req, accessToken, refreshToken, profile, cb) => {
        const user = await googleService.verifyGoogle(profile);
        console.log("--- gg callback ---");
        console.log("user: ", user);
        console.log("req.query: ", req.query);

        if (!user) {
            if (req.query.state === 'register') {
                const result = await googleService.addUserGoogle(profile);
                return cb(null, true, result);
            } else {
                return cb(null, true, { message: 'login: account dont exist' });
            }
        } else {
            if (user.confirm === false) {
                return cb(null, true, { message: 'login: account not confirmed' });
            } else if (user.status === 'Banned') {
                return cb(null, true, { message: 'login: account banned' });
            }

            if (req.query.state === 'register') {
                return cb(null, user, { message: 'register: account exist' });
            } else {
                return cb(null, user, { message: 'login: login success' });
            }
        }
    }
));

passport.serializeUser(function (user, cb) {
    process.nextTick(function () {
        cb(null, {
            _id: user._id,
            fullname: user.fullname,
            username: user.username,
            email: user.email,
            employed: user.employed,
            avatar_url: user.avatar_url,
            address: user.address,
            phone: user.phone,
            intro: user.intro,
            total: user.total,
            cart: user.cart,
            status: "Unbanned"
        });
    });
});

passport.deserializeUser(function (user, cb) {
    process.nextTick(function () {
        cb(null, user);
    });
});

module.exports = passport;