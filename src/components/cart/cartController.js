const userService = require("../user/userService");
const ls = require("local-storage");

/*************************** GET methods ***************************/
/**
 * render the cart page
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
module.exports.render = async (req, res) => {
    try {
        let total = 0;

        if (req.user) {
            const user = await userService.getUserByID(req.user._id);
            total = user.total;
        }
        else {
            total = ls.get("total");
        }

        res.render("cart/views/cart", { active: { Cart: true }, page: "cart", total });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
