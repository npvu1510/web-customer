const router = require("express").Router();
const authController = require("./authApiController")

router.post("/username", authController.checkUserName);
router.post("/email", authController.checkEmail);
router.post("/register", authController.register);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);

module.exports = router;