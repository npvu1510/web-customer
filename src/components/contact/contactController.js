/*************************** GET methods ***************************/
// Render contact page
exports.render = (req, res) => {
    res.render("contact/views/contact", {active: {Home:true}, page:"home"});
};
