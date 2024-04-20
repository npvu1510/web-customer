require("dotenv").config();

const productService = require("../product/productService")

const fs = require("fs");
const sgMail = require("../../config/sendgrid.config");
const path = require("path");
const hbs = require("hbs");

const userModel = require('./userModel');
const orderModel = require("../order/orderModel");
const productModel = require("../product/model/productModel");
const cloudinary = require('../../config/cloudinary.config');
const bcrypt = require("bcrypt")
const ls = require("local-storage");
const { log } = require("console");

/**
 * get user by ID
 * @param userID {string}
 * @returns {Promise<*>}
 */
module.exports.getUserByID = async (userID) => {
    try {
        return await userModel.findById(userID).lean();
    } catch (err) {
        throw err;
    }
}




/**
 * update product in local cart to database
 * @param userID {string}
 * @returns {Promise<*>}
 */
module.exports.updateLocalCartToUser = async (userID) => {
    try {
        console.log("----- update local cart to user -----");
        let local_cart = JSON.parse(ls.get('cart'));

        console.log(userID);
        let user = await userModel.findById(userID).lean();
        console.log(user.cart);

        let user_cart = user.cart;

        for (let i = 0; i < local_cart.length; i++) {
            // product index in cart
            let product = await productService.getProductByID(local_cart[i].productID);
            let itemIdx = user_cart.findIndex(item => item.productID == local_cart[i].productID && item.size == local_cart[i].size && item.color == local_cart[i].color);
            let itemIdxVar = product.variation.findIndex(item => item.size == local_cart[i].size && item.color == local_cart[i].color);


            console.log("-----");
            console.log("itemIdx", itemIdx);
            console.log("itemIdxVar", itemIdxVar);
            console.log("product", product);
            // product exist in cart, update quantity
            if (itemIdx > -1) {
                user_cart[itemIdx].quantity += local_cart[i].quantity;

                if (user_cart[itemIdx].quantity > product.variation[itemIdxVar].stock) {
                    user_cart[itemIdx].quantity = product.variation[itemIdxVar].stock;
                }

                user_cart[itemIdx].total = parseInt(user_cart[itemIdx].quantity) * parseFloat(product.price);
            } else {
                user_cart.push({
                    productID: local_cart[i].productID,
                    quantity: local_cart[i].quantity,
                    color: local_cart[i].color,
                    size: local_cart[i].size,
                    total: Math.round((product.price * local_cart[i].quantity) * 100) / 100
                })
            }
        }

        let total = 0;

        for (let i = 0; i < user_cart.length; i++) {
            total += parseFloat(user_cart[i].total);
        }

        // round total
        total = Math.round(total * 100) / 100;

        await userModel.findByIdAndUpdate(
            { _id: userID },
            {
                $set: {
                    cart: user_cart,
                    total: total
                }
            });

        ls.set("cart", JSON.stringify([]));
    } catch (err) {
        throw err;
    }
}


/**
 * get user order by ID
 * @param userID {string}
 * @returns {Promise<*>}
 */
module.exports.getUserOrder = async (userID) => {
    try {
        const orders = await orderModel.find({ 'customer._id': userID }).lean();
        for (let i = 0; i < orders.length; i++) {
            let total = 0;
            let products = orders[i].products;

            for (let j = 0; j < products.length; j++) {
                const product = await productModel.findById(products[j].product_id).lean();

                products[j].name = product.name;
                products[j].price = Math.round(product.price * 100) / 100;
                products[j].img = product.img[0];
                products[j].total = Math.round(products[j].price * products[j].quantity * 100) / 100;
                total += products[j].total;
            }

            orders[i].thumb = products[0].img;
            orders[i].total = Math.round(total * 100) / 100;

            if (orders[i].promo !== undefined) {
                let discount = parseInt((orders[i].promo).replace("%", ""));
                orders[i].discount = Math.round(orders[i].total * discount) / 100;
            }
        }
        return orders;

    } catch (err) {
        throw err;
    }
}

/**
 * display profile page
 * @param username
 * @param field
 * @param new_value
 * @returns {Promise<*>}
 */
module.exports.updateUser = async (username, field, new_value) => {
    try {
        return await userModel.findOneAndUpdate({ username: username }, { $set: { [field]: new_value } }, { new: true });
    } catch (err) {
        throw err;
    }
}

/**
 * display profile page
 * @param id
 * @param cart
 * @param total
 * @returns {Promise<*>}
 */
module.exports.updateCart = async (id, cart, total) => {
    try {
        await userModel.findByIdAndUpdate(
            { _id: id },
            {
                $set: {
                    cart: cart,
                    total: total
                }
            });
    } catch (err) {
        throw err;
    }
}

/**
 * check if user exist
 * @param username{string}
 * @returns {Promise<*>}
 */
module.exports.checkUserName = async (username) => {
    try {
        return await userModel.findOne({ username: username }).lean();
    } catch (err) {
        throw err;
    }
}

/**
 * check if gmail exist
 * @param email{string}
 * @returns {Promise<*>}
 */
module.exports.checkEmail = async (email) => {
    try {
        return await userModel.findOne({ email: email });
    } catch (err) {
        throw err;
    }
}

/**
 *  change avatar of user
 *
 * @param file {object}
 * @param id {string}
 * @returns {Promise<void>}
 */
module.exports.changeAvatar = async (id, file) => {
    try {
        if (!file) return;
        const url = await cloudinary.upload(file.path, 'user_avatar');
        console.log(id, url);
        await userModel.findByIdAndUpdate(id, { avatar_url: url });
    } catch (err) {
        throw err;
    }
};

/**
 * register
 * @param body {object}
 * @returns {Promise<*>}
 */
module.exports.Register = async (body) => {
    try {

        if (!body.username || !body.password || !body.email) return "input_error";
        const find_user = await userModel.findOne({ username: body.username });
        if (find_user !== null) return "existed";

        const email = await userModel.findOne({ email: body.email });

        if (email) return "email_exist";

        const salt = await bcrypt.genSaltSync(10);
        const hash_pass = await bcrypt.hashSync(body.password, salt);

        const now = (new Date()).toString().split(" ");

        const user = {
            username: body.username,
            fullname: '',
            password: hash_pass,
            email: body.email,
            role: "User",
            employed: now[2] + ' ' + now[1] + ',' + now[3],
            address: "",
            phone: "",
            intro: "",
            total: 0,
            confirm: false,
            status: "Unbanned",
            avatar_url: "https://res.cloudinary.com/web-hcmus/image/upload/v1648341181/Default_avatar/default-avtar_wmf6yf.jpg", //default avatar
        }
        // insert
        await userModel.insertMany(user)
        return "success";

    } catch (err) {
        /*console.log(error);*/
        throw err;
    }
}

/**
 * register
 * @param username {string}
 * @param password {string}
 * @returns {Promise<user||false>}
 */
module.exports.verifyUser = async (username, password) => {
    try {
        const user = await userModel.findOne({ username: username });

        if (!user) return false;
        else if (user.confirm === false) return false;
        else if (await bcrypt.compareSync(password, user.password)) return user;
        return false;
    } catch (err) {
        throw err;
    }
}

module.exports.resetPasswordForm = async (email) => {
    try {
        // Send email template
        const template = fs.readFileSync(
            path.resolve(__dirname, "../auth/views/forgetPassword.hbs"),
            "utf8"
        );

        const compiledTemplate = hbs.compile(template);
        const msg = {
            to: email,
            from: process.env.EMAIL_SENDER,
            subject: "Male Fashion shop reset password",
            html: compiledTemplate({
                domain: process.env.DOMAIN_NAME,
                email,
                curr_time: Date.now(),
            }),
        };
        await sgMail.send(msg);
    } catch (err) {
        throw err;
    }
};

/**
 *  change password of user
 *
 * @param newPass {string}
 * @param email {string}
 * @returns {Promise<string>}
 */
module.exports.changePasswordByEmail = async (email, newPass) => {
    try {
        await bcrypt.hash(newPass, 4).then(async (hash) => {
            await userModel.findOneAndUpdate(
                { email: email },
                { $set: { password: hash } });
        });
    } catch (err) {
        throw err;
    }
};

/**
 * confirm email
 * @param username {string}
 * @param email {string}
 * @returns {Promise<user||false>}
 */
module.exports.confirmForm = async (username, email) => {
    try {
        // Send email confirm
        const template = fs.readFileSync(
            path.resolve(__dirname, "../auth/views/confirm-email.hbs"),
            "utf8"
        );

        const compiledTemplate = hbs.compile(template);
        const msg = {
            to: email,
            from: process.env.EMAIL_SENDER,
            subject: "Male Fashion confirm account",
            html: compiledTemplate({
                domain: process.env.DOMAIN_NAME,
                username
            }),
        };
        await sgMail.send(msg);
    } catch (err) {
        throw err;
    }
}

/**
 * confirm email
 * @param username {string}
 * @returns {Promise<user||false>}
 */
module.exports.confirmEmail = async (username) => {
    try {
        await userModel.findOneAndUpdate(
            { username: username },
            { $set: { confirm: true } });
    } catch (err) {
        throw err;
    }
}

/**
 * confirm email
 * @param userID {string}
 * @returns {Promise<number>}
 */
module.exports.getNumberProduct = async (userID) => {
    try {
        let number_product = 0;
        if (userID) {
            const user = await userModel.findById(userID);
            for (let i = 0, len = user.cart.length; i < len; i++) {
                number_product += user.cart[i].quantity;
            }
        }
        return number_product;
    } catch (err) {
        throw err;
    }
}