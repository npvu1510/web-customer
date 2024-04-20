const { default: mongoose } = require("mongoose");

const Schema = mongoose.Schema;

const promotion = new Schema({
    code: String,
    level: String,
    slot: Number,
    start_date: Date,
    end_date: Date,
}, {
    versionKey: false // You should be aware of the outcome after set to false
});

module.exports = mongoose.model('promotion', promotion, 'promotion');