const router = require("express").Router();
const userController = require("./userController");
const upload = require("../../config/multer.config");

/*************************** GET methods ***************************/
//render products page
router.get("/profile", userController.renderProfile);

router.get("/order", userController.renderOrder);

/*************************** POST methods ***************************/
//change avatar
router.post("/profile/change-avatar", upload.single('avatar_url'), userController.changeAvatar);

module.exports = router;