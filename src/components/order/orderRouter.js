const router = require("express").Router();
const orderController = require("./orderController");

/*************************** GET methods ***************************/
//render check out page
router.get("/", orderController.render);

module.exports = router;