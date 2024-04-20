const express = require('express');
const router = express.Router();
const userController = require("../components/user/userController");

/* GET home page. */
router.get('/', userController.renderHomepage);

module.exports = router;
