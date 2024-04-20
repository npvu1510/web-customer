const router = require("express").Router();
const authController = require("./authController");
const passport = require("../../config/passport");

/*************************** GET methods ***************************/
//render login page
router.get("/login", authController.renderLogin);

//render register page
router.get("/register", authController.renderRegister);

// logout
router.get('/logout', authController.logout);

/*************************** POST methods ***************************/
// get login info from client
router.post('/login', passport.authenticate('local', {
    successRedirect: '/', //login success, save user in req.user
    failureRedirect: '/auth/login?message=Login%20Fail%20' //login fail, redirect to login page
}));

// confirm register by email
router.post("/confirm", authController.confirmEmail);

// forgot password
router.post("/forgot-password", authController.forgotPassword);

// reset password
router.post("/reset-password", authController.resetPassword);
/*************************** PUT methods ***************************/

/*************************** DELETE methods ***************************/

module.exports = router;