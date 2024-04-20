const { default: mongoose } = require("mongoose");

const Schema = mongoose.Schema;

const order = new Schema({
    username: String,
    timestamp: Date,
    create_date: String,
    products: [{
        product_id: String,
        quantity: Number,
        size: String,
        color: String,
    }],
    promo: String,
    status: String,
    start_delivery: Date,
    end_delivery: Date,
    customer: {
        _id: String,
        fullname: String,
        address: String,
        phone: String,
        email: String
    }
}, {
    versionKey: false // You should be aware of the outcome after set to false
});

module.exports = mongoose.model('order', order, 'order');