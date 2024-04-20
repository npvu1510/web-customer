const productModel = require('./model/productModel');
const userModel = require('../user/userModel');
const ReviewModel = require('./model/productReviewModel');
const orderModel = require('../order/orderModel');
const ls = require("local-storage");

/**
 * get all product
 * @returns {Promise<*>}
 */
module.exports.getAllProducts = async () => {
    try {
        return await productModel.find().lean();
    } catch (err) {
        throw err;
    }
};

/**
 * get product by ID
 * @param id {string}
 * @returns {Promise<*>}
 */
module.exports.getProductByID = (id) => {
    try {
        return productModel.findById(id).lean();
    } catch (err) {
        throw err;
    }
}

/**
 * get product by name
 * @param name {string}
 * @returns {Promise<*>}
 */
module.exports.getProductByName = async (name) => {
    try {
        return await productModel.find({ name: { $regex: new RegExp('^' + name + '.*', 'i') } }).exec();
    } catch (err) {
        throw err;
    }
}

/**
 * get product by field
 * @param field {string||number}
 * @param type {string}
 * @returns {Promise<*>}
 */
module.exports.getProductByField = async (field, type) => {
    try {
        if (type === 'name') {
            return await productModel.find({ name: { $regex: new RegExp('^' + field + '.*', 'i') } }).exec();
        } else if (type === 'category') {
            return await productModel.find({ category: { $regex: new RegExp('^' + field + '.*', 'i') } }).exec();
        } else if (type === 'brand') {
            return await productModel.find({ brand: { $regex: new RegExp('^' + field + '.*', 'i') } }).exec();
        } else if (type === 'price') {
            if (field === '0') {
                return await productModel.find({ price: { $lte: 49, $gte: 0 } }).exec();
            } else if (field === '150+') {
                return await productModel.find({ price: { $gte: 150 } }).exec();
            }
            return await productModel.find({ price: { $lte: parseInt(field) + 49, $gte: parseInt(field) } }).exec();

        } else if (type === 'size') {
            return await productModel.find({ size: { $regex: new RegExp('^' + field + '.*', 'i') } }).exec();
        } else if (type === 'color') {
            return await productModel.find({ color: [{ $regex: new RegExp('^' + field + '.*', 'i') }] }).exec();
        } else if (type === '') {
            return await productModel.find({}).exec();
        } else if (type === 'sort' && field === 'Low to High') {
            return await productModel.find({}).sort({ price: 1 }).exec();
        } else if (type === 'sort' && field === 'High to Low') {
            return await productModel.find({}).sort({ price: -1 }).exec();
        } else if (type === 'sort' && field === 'Newest') {
            return await productModel.find({}).sort({ createdAt: -1 }).exec();
        } else if (type === 'sort' && field === 'Oldest') {
            return await productModel.find({}).sort({ createdAt: 1 }).exec();
        }
    } catch (err) {
        throw err;
    }
}

/**
 * get related product by category
 * @param categoryValue {string}
 * @returns {Promise<*>}
 */
module.exports.getRelatedList = async (categoryValue) => {
    try {
        return productModel.aggregate([
            { "$match": { "category": { "$eq": categoryValue } } },
            { "$sample": { "size": 4 } }
        ])
    } catch (err) {
        throw err;
    }
}

/**
 * get all review by product ID
 * @param productID {string}
 * @returns {Promise<*>}
 */
module.exports.getAllReviewByProductID = (productID, stranger_name = null, userID = null) => {
    try {
        if (stranger_name)
            return ReviewModel.find({ productID: productID, stranger_name: stranger_name }).sort({ createdAt: -1 }).lean();
        else if (userID)
            return ReviewModel.find({ productID: productID, userID: userID }).sort({ createdAt: -1 }).lean();
        else
            return ReviewModel.find({ productID: productID }).sort({ createdAt: -1 }).lean();
    } catch (err) {
        throw err;
    }
}

/**
 * save review
 * @param fullname {string}
 * @param productID {string}
 * @param content {string}
 * @param createAt
 * @returns {Promise<*>}
 */
module.exports.createReview = async (authorized_user, stranger_name, productID, content, createAt) => {
    try {
        if (authorized_user != null) {
            await new ReviewModel({
                userID: authorized_user._id,
                productID: productID,
                content: content,
                createdAt: createAt
            }).save();
        }

        else {
            await new ReviewModel({
                stranger_name: stranger_name,
                productID: productID,
                content: content,
                createdAt: createAt
            }).save();
        }

    } catch (err) {
        throw err;
    }

}

/**
 * add product to cart
 * @param productID {string}
 * @param userID {string}
 * @param quantity {number}
 * @returns {Promise<*>}
 */
module.exports.addToCart = async (productID, size, color, stock, userID = undefined, quantity = 1) => {
    try {
        console.log("---- add to cart ----");
        console.log("PROID: " + productID);
        console.log("USERID: " + userID);
        console.log("QUANTITY: " + quantity);
        console.log("COLOR: " + color);
        console.log("SIZE: " + size);
        console.log("stock: " + stock);


        if (userID) {
            let user = await userModel.findOne({ _id: userID });
            const product = await productModel.findOne({ _id: productID });

            if (user && product) {

                // product exist in cart
                let itemIdx = user.cart.findIndex(item => {
                    if (item.productID == productID && item.color == color && item.size == size)
                        return true;
                });

                console.log("user.cart: " + user.cart);
                console.log("ITEMIDX: " + itemIdx);

                if (itemIdx > -1) {
                    // product exist in cart, update quantity
                    user.cart[itemIdx].quantity += parseInt(quantity);

                    if (user.cart[itemIdx].quantity > stock) {
                        user.cart[itemIdx].quantity = stock;
                    }

                    user.cart[itemIdx].total = parseInt(user.cart[itemIdx].quantity) * parseFloat(product.price);
                } else {
                    // product not exist in cart, add new item
                    user.cart.push({
                        productID: productID,
                        quantity: parseInt(quantity),
                        color: color,
                        size: size,
                        total: Math.round(parseFloat(product.price) * parseInt(quantity) * 100) / 100
                    });
                }

                user.total = 0;

                for (let i = 0; i < user.cart.length; i++) {
                    const product_total = await productModel.findOne({ _id: user.cart[i].productID });
                    user.total += user.cart[i].quantity * product_total.price;
                }

                console.log("user.cart (2): " + user.cart);

                user.total = Math.round(parseFloat(user.total) * 100) / 100;

                user = await user.save();
            }
            return user;
        } else {
            console.log("not login");
            const product = await productModel.findOne({ _id: productID });

            if (product) {
                let cart = JSON.parse(ls.get('cart')) || [];
                console.log('----');
                console.log("cart:", cart);
                console.log('----');

                // product exist in cart
                let itemIdx = cart.findIndex(item => {
                    if (item.productID == productID && item.color == color && item.size == size)
                        return true;
                });

                if (itemIdx > -1) {
                    // product exist in cart, update quantity
                    cart[itemIdx].quantity += parseInt(quantity);

                    if (cart[itemIdx].quantity > stock) {
                        cart[itemIdx].quantity = stock;
                    }

                    cart[itemIdx].total = parseInt(cart[itemIdx].quantity) * parseFloat(product.price);
                } else {
                    // product not exist in cart, add new item
                    cart.push({
                        productID: productID,
                        quantity: parseInt(quantity),
                        color: color,
                        size: size,
                        total: Math.round(parseFloat(product.price) * parseInt(quantity) * 100) / 100
                    });
                }
                // console.log("cart update:", cart);

                let total = 0;

                for (let i = 0; i < cart.length; i++) {
                    const product_total = await productModel.findOne({ _id: cart[i].productID });
                    total += cart[i].quantity * product_total.price;
                }


                console.log("cart:", cart);

                // save local storage
                ls.set("cart", JSON.stringify(cart));
                ls.set("total", Math.round(parseFloat(total) * 100) / 100)

                console.log("total:", ls.get("total"));
            }
        }
    } catch (err) {
        throw err;
    }
}


/**
 * get number of product in cart
 * @param productID {string}
 * @param userID {string}
 * @param quantity {number}
 * @returns {Promise<*>}
 */
module.exports.getNumberOfProductInCart = async (userID = undefined) => {
    console.log('--- get number of product in cart ---');
    const products = await this.getAllProducts();
    let cart = undefined;
    let number = 0;

    if (userID) {
        let user = await userModel.findOne({ _id: userID });
        cart = user.cart;
    } else
        cart = JSON.parse(ls.get('cart')) || [];

    console.log("cart:", cart);

    cart.forEach(item => {
        number += parseInt(item.quantity);
    })

    console.log("number:", number);

    return number;
}