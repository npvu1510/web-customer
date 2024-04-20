const cartService = require("../../components/cart/cartService")
const userService = require("../../components/user/userService");
const productService = require("../../components/product/productService");
const ls = require("local-storage");

exports.getProducts = async (req, res) => {
    try {
        let products;
        let cart
        console.log("--- get product --");

        if (req.user) {
            const user = await userService.getUserByID(req.user._id);
            products = await cartService.getProducts(user.cart);
            cart = user.cart;
        }
        else {
            cart = JSON.parse(ls.get('cart'));
            products = await cartService.getProducts(cart);
        }

        let total = 0;
        let number_products = 0;

        for (let i = 0; i < products.length; i++) {
            products[i].size = cart[i].size
            products[i].color = cart[i].color
            total = Math.round((total + products[i].total) * 100) / 100;
            number_products += parseInt(products[i].quantity);
        }

        req.session.number_product = number_products;
        res.send({ number_products, total, products });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}


exports.changeQuantity = async (req, res) => {
    try {
        console.log("---- chaneg quantity ----");
        console.log("req.pảrams: ", req.params);
        console.log("req.body: ", req.body);

        let products;
        let user = undefined;

        if (req.user) {
            user = await userService.getUserByID(req.user._id);
            products = user.cart;
        } else {
            products = JSON.parse(ls.get("cart"));
        }

        // console.log("products: ", products);

        let pro = await productService.getProductByID(req.params.productID);
        // console.log("pro:", pro);

        // product index in cart
        let itemIdx = products.findIndex(item => item.productID == req.params.productID && item.color == req.body.color && item.size == req.body.size);
        // console.log("itemIdx: ", itemIdx);

        let itemIdxStock = pro.variation.findIndex(item => item.size == req.body.size && item.color == req.body.color);
        // console.log("itemIdxStock: ", itemIdxStock);


        // product exist in cart, update quantity
        if (itemIdx > -1) {
            if (req.params.type === 'plus') {
                products[itemIdx].quantity += 1;

                if (products[itemIdx].quantity > pro.variation[itemIdxStock].stock) {
                    products[itemIdx].quantity = pro.variation[itemIdxStock].stock;
                    req.session.number_product -= 1;
                }

                req.session.number_product += 1;
            } else if (req.params.type === 'minus') {
                products[itemIdx].quantity -= 1;
                req.session.number_product -= 1;

            } else {
                console.log("--- type = undef --");
                let number = 0;
                products[itemIdx].quantity = parseInt(req.body.quantity);

                if (products[itemIdx].quantity > pro.variation[itemIdxStock].stock) {
                    products[itemIdx].quantity = pro.variation[itemIdxStock].stock;
                }

                console.log("products[itemIdx].quantity: ", products[itemIdx].quantity);

                products.forEach(product => {
                    number += product.quantity;
                })

                console.log("number: ", number);
                req.session.number_product = number;
            }

            if (products[itemIdx].quantity < 1) {
                products[itemIdx].quantity = 1;
                req.session.number_product += 1;
            }

            const product = await productService.getProductByID(req.params.productID);

            products[itemIdx].total = parseInt(products[itemIdx].quantity) * parseFloat(product.price);
        }

        let total = 0;

        for (let i = 0; i < products.length; i++) {
            total += parseFloat(products[i].total);
        }

        // round total
        total = Math.round(total * 100) / 100;

        // update
        if (req.user)
            await userService.updateCart(user._id, products, total);
        else
            ls.set("cart", JSON.stringify(products));

        let number_product = req.session.number_product;
        let product_quantity = products[itemIdx].quantity;
        let product_total = Math.round(products[itemIdx].total * 100) / 100;

        res.send({ number_product, total, product_quantity, product_total });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}


exports.deleteProduct = async (req, res) => {
    try {
        console.log("---- delete product ----");
        console.log("param:", req.params);
        console.log("body:", req.body);


        if (req.user) {
            const user = await cartService.deleteProduct(req.user._id, req.params.productID, req.body.color, req.body.size);
            res.send(user.cart);
        } else {
            await cartService.deleteProduct(undefined, req.params.productID, req.body.color, req.body.size);
            let cart = JSON.parse(ls.get("cart"));

            res.send(cart);
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

exports.applyCoupon = async (req, res) => {
    try {
        const promo = await cartService.getPromo(req.params.couponCODE);

        const now = new Date();

        if (promo === null) {
            res.send({ msg: "Invalid coupon", stt: false });
            return;
        }

        let msg = "";
        let status = false;
        let total = 0;

        promo.start_date = new Date(promo.start_date)
        promo.end_date = new Date(promo.end_date)

        if (promo.start_date.getTime() <= now.getTime() && promo.end_date.getTime() >= now.getTime()) {
            if (promo.slot === 0) {
                msg = "Promotion is discount ";
            } else {
                msg = "Apply promotion successfully";
                status = true;
                let products;

                if (req.user) {
                    const user = await userService.getUserByID(req.user._id);
                    products = user.cart;
                } else {
                    products = JSON.parse(ls.get("cart"));
                }

                for (let i = 0; i < products.length; i++) {
                    total += parseFloat(products[i].total);
                }
                let discount = parseInt(promo.level.replace("%", ""));
                // round total
                total = Math.round(- (total * discount / 100) * 100) / 100;

                req.session.promo = {
                    code: req.params.couponCODE,
                    discount: promo.level,
                    discount_total: total
                }
            }
        } else msg = "Promotion code is expired";

        res.send({ msg: msg, stt: status, total: total });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}