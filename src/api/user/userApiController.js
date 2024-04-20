const checkoutService = require("../../components/order/orderService");
const userService = require("../../components/user/userService");

/**
 * get order history
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
exports.getOrder = async (req, res) => {
    try {
        const orders = await userService.getUserOrder(req.user._id);
        res.send(orders);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

/**
 * delete order
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
exports.deleteOneOrder = async (req, res) => {
    try {
        await checkoutService.deleteOrderById(req.params.orderID);
        res.status(200);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

/**
 * get profile of user
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
exports.getProfile = async (req, res) => {
    try {
        const user = await userService.getUserByID(req.user._id);
        res.send(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

/**
 * edit profile of user
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
exports.editProfile = async (req, res) => {
    try {
        if (req.user==null)
        {
            res.status(401).json({"message":"UnAuthorized"})
            return;
        }
        await userService.updateUser(req.user.username,req.body.field,req.body.new_val)
        switch (req.body.field)
        {
            case 'fullname':
                req.user.fullname = req.body.new_val
                break;
            case 'intro':
                req.user.intro = req.body.new_val
                break;
            case 'phone':
                req.user.phone = req.body.new_val
                break;
            case 'email':
                req.user.email = req.body.new_val
                break;

        }
        res.status(200).json({message: "success"})
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}