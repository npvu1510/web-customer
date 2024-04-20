const orderService = require("../../components/order/orderService");
const cartService = require("../../components/cart/cartService")
const userService = require("../../components/user/userService")
const ls = require("local-storage");

/**
 * get checkout
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
exports.getCheckout = async (req, res) => {
    try {
        let result;
        let cart;
        let discount = undefined;
        let total = undefined;
        let products = undefined;
        let user = undefined;

        if (req.user) {
            user = await userService.getUserByID(req.user._id);
            products = await cartService.getProducts(user.cart);
            cart = user.cart;
            total = user.total
        } else {
            cart = JSON.parse(ls.get("cart"));
            products = await cartService.getProducts(cart);
            total = JSON.parse(ls.get("total"));
        }

        for (let i = 0; i < products.length; i++) {
            products[i].size = cart[i].size
            products[i].color = cart[i].color
        }

        if (req.session.promo === undefined)
            result = Math.round(total * 100) / 100
        else {
            discount = req.session.promo.discount_total
            result = Math.round(((Math.round(total * 100) / 100) + req.session.promo.discount_total) * 100) / 100;
        }

        total = Math.round(total * 100) / 100;

        res.send({ products, total, result, discount, user });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

/**
 * get checkout
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
exports.placeOrder = async (req, res) => {
    try {
        if (!req.user) {
            res.send({ signin: "please sign in" });
            return;
        }

        if (req.body === undefined || req.body.fullname === '' || req.body.address === '' || req.body.phone === '' || req.body.email === '') {
            res.send({ msg: "lack-info" });
            return;
        }

        console.log("pass check");

        let canCheckout = true;
        let cart = JSON.parse(ls.get("cart"));
        let user = {};

        if (req.user) {
            user = await userService.getUserByID(req.user._id);
        }
        else {
            user._id = 'undefined';
            user.cart = cart;
        }

        user.fullname = req.body.fullname;
        user.address = req.body.address;
        user.phone = req.body.phone;
        user.email = req.body.email;


        console.log("user:", user);

        if (req.session.promo !== undefined) {
            await orderService.order(user, req.session.promo);
            req.session.promo = undefined;
        } else
            canCheckout = await orderService.order(user);


        console.log("canCheckout:", canCheckout);

        req.session.number_product = 0;

        res.send({ canCheckout });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}