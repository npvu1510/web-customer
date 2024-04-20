const productService = require("../../components/product/productService");
const userService = require("../../components/user/userService");
const pagination = require("../../public/js/paging");
const ls = require("local-storage");
const { memoryStorage } = require("multer");


/**
 * search name of product
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
exports.search = async (req, res) => {
    try {
        const payload = req.body.payload.trim();
        const search = await productService.getProductByName(payload);
        res.send({ payload: search });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/**
 * render product by field
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
exports.renderByField = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const getProducts = await productService.getProductByField(req.query.field, req.query.type);
        const products = pagination.paging(getProducts, page, 6);
        products.field = req.query.field;
        products.type = req.query.type;

        console.log("--- render by field ---");
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/**
 * add product to cart
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
exports.addToCart = async (req, res) => {
    try {
        console.log("--- add to cart ---");
        console.log("req.body: ", req.body);
        let number = 0;

        if (req.user) {
            req.session.user = await productService.addToCart(req.body.id, req.body.size, req.body.color, req.body.stock, req.user._id, req.body.quantity);
            req.session.number_product += parseInt(req.body.quantity);

            number = await productService.getNumberOfProductInCart(req.user._id)
        } else {
            await productService.addToCart(req.body.id, req.body.size, req.body.color, req.body.stock, undefined, req.body.quantity);
            console.log("add success");

            number = await productService.getNumberOfProductInCart()
        }

        res.send({ number });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

/**
 * post review
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
exports.postReview = async (req, res) => {
    try {
        //current user is unauthorized
        let current_user = null
        if (req.user)
            current_user = await userService.getUserByID(req.user._id)

        const content = req.body.content
        const productID = req.params.productID
        const createAt = Date.now();

        // review with empty content
        if (content.length === 0) {
            res.status(400).json({ message: "Content is required" })
            return;
        }

        //stranger review
        if (current_user == null) {
            //with empty content
            if (req.body.stranger_name.length === 0) {
                res.status(400).json({ message: "Name is required" })
                return;
            }

            //already review
            const isReview = await productService.getAllReviewByProductID(productID, req.body.stranger_name)
            if (isReview.length !== 0) {
                res.status(400).json({ message: "Each person can only rate the product once" })
                return;
            }
        }
        //authorized user review
        else {
            //authorized user has no full name
            if (current_user.fullname.length === 0) {
                res.status(400).json({ message: "Please update your full name in profile" })
                return;
            }

            //already review
            else {
                const isReview = await productService.getAllReviewByProductID(productID, null, current_user._id)
                if (isReview.length !== 0) {
                    res.status(400).json({ message: "Each person can only rate the product once" })
                    return;
                }
            }
        }

        //create review in mongo
        await productService.createReview(current_user, req.body.stranger_name, productID, content, createAt)

        //paging and slice data
        const all_reviews = await productService.getAllReviewByProductID(productID)
        const result = pagination.reviewPaging(all_reviews, 1)

        //author users in review list
        for (let i = 0; i < result.data.length; i++)
            if (result.data[i].userID != null) //authorized user
            {
                const author_user = await userService.getUserByID(result.data[i].userID)
                result.data[i].avatar = author_user.avatar_url
                result.data[i].fullname = author_user.fullname
            }

        res.send({ reviews: result.data, buffer: result.buffer })

    } catch (err) {
        res.status(500).json({ message: err.message })
    }

}

/**
 * load specific review page
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
exports.loadReviewPage = async (req, res) => {
    try {
        const productID = req.params.productID
        const page = parseInt(req.query.page || 1)

        //review list
        let reviews = await productService.getAllReviewByProductID(productID)

        //author users in review list
        for (let i = 0; i < reviews.length; i++)
            if (reviews[i].userID != null) //authorized user
            {
                const author_user = await userService.getUserByID(reviews[i].userID)
                reviews[i].avatar = author_user.avatar_url
                reviews[i].fullname = author_user.fullname
            }

        const result = pagination.reviewPaging(reviews, page)

        res.send({ reviews: result.data, buffer: result.buffer })

    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

exports.loadVariation = async (req, res) => {
    try {
        const product = await productService.getProductByID(req.params.productID)
        const variations = product.variation

        res.send({ variations: variations })
    } catch (e) {
        res.status(500).json({ message: e.message })
    }
}