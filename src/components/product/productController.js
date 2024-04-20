const { reviewPaging } = require('../../public/js/paging.js');
const productService = require('./productService');
const userService = require('../user/userService');

/************************************* GET methods *************************************/
/**
 * render the product page
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
exports.render = async (req, res) => {
    try {
        res.render("product/views/products", {active: {Shop: true}});
    } catch (err) {
        res.status(500).json({message: err.message});
    }
};

/**
 * render product detail page
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
 exports.renderDetail = async (req, res) => {
    try {
        const productID = req.params.id

        //get product info
        const products = await productService.getProductByID(productID);

        //get totalPage by the number of reviews
        let reviews = await productService.getAllReviewByProductID(productID)

        //stranger visit check
        let stranger = true
        if (req.user)
            stranger = false

        //author users in review list
        for (let i=0; i<reviews.length; i++)
            if (reviews[i].userID != null) //authorized user
            {
                const author_user = await userService.getUserByID(reviews[i].userID)
                reviews[i].avatar = author_user.avatar_url
                reviews[i].fullname = author_user.fullname
            }

        const result = reviewPaging(reviews,1)
        const relatedProduct = await productService.getRelatedList(products.category);
        
        res.render("product/views/product_detail", {product: products, review: result.data, buffer: result.buffer, relatedProduct: relatedProduct , stranger: stranger});
    } catch (err) {
        res.status(500).json({message: err.message});
    }

};

/************************************* POST methods *************************************/
/**
 * add to cart
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
module.exports.addToCart = async (req, res) => {
    try{
        req.session.user = await productService.addToCart(req.body.id, req.user._id);
        req.session.number_product += 1;
        res.redirect('/product');
    }catch (err) {
        res.status(500).json({message: err.message});
    }
}
