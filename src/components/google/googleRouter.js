const router = require("express").Router();

const passport = require("../../config/passport");

router.get('/register', passport.authenticate('google', {
    scope: ['email', 'profile'],
    state: 'register'
}));

router.get('/login', passport.authenticate('google', {
    scope: ['email', 'profile'],
    state: 'login'
}));

// get google callback
router.get("/callback", (req, res, next) => {
    passport.authenticate('google', {}, (err, user, info) => {
        console.log(err, user, info);

        info = info.message;
        console.log("info: ", info);
        if (info === 'login: account dont exist') {
            res.redirect('/auth/login?state=false&message=Account%20dont%20exist');
        }
        else if (info === 'login: login success') {
            req.session.user = user;
            res.redirect("/");
        }
        else if (info === 'login: account not confirmed') {
            res.redirect('/auth/login?state=false&message=Account%20not%20confirmed');
        }
        else if (info === 'login: account banned') {
            res.redirect('/auth/login?state=false&message=account%20banned');
        }
        else try {
            if (info.includes('register')) {
                res.redirect("/auth/register?message=" + info.replace("register: ", "").replace(" ", "%20"));
            }
        }
        catch (error) {
            res.redirect("/auth/register?state=true&message=Create%20new%20user%20success");
        }
    })(req, res, next);
});

module.exports = router;