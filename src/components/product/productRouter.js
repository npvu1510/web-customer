const router = require("express").Router();
const productController = require("./productController");

/*************************** GET methods ***************************/
//render products page
router.get("/", productController.render);

//render product-detail page
router.get("/:id", productController.renderDetail);


module.exports = router;