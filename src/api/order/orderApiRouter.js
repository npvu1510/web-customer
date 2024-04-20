const router = require("express").Router();
const orderApiController = require("./orderApiController");

router.get("/", orderApiController.getCheckout);
router.post("/place-order", orderApiController.placeOrder);

module.exports = router;