const router =  require("express").Router();
const cartController = require("./cartController");

/*************************** GET methods ***************************/
//render cart page
router.get("/", cartController.render);

module.exports = router;