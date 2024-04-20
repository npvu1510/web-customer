const { default: mongoose } = require("mongoose");

const Schema = mongoose.Schema;

const product = new Schema({
    name: String,
    price: Number,
    brand: String,
    size: [String],
    color: [String],
    category: String,
    img: [String],
    SKU: String,
    introduction: String,
    infomation: String,
    createdAt: Date,
    variation:[{size: String, color: String, price: Number, stock: Number}]
}, {
    versionKey: false // You should be aware of the outcome after set to false
});

module.exports = mongoose.model('product', product, 'product');