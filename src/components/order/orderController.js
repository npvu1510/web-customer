/*************************** GET methods ***************************/
/**
 * render order page
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
exports.render = async (req, res) => {
    try {
        res.render("order/views/order", {
            active: { Checkout: true },
            page: "order"
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
