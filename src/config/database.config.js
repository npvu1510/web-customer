require('dotenv').config();
const mongoose = require('mongoose');

async function connect() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
    }
    catch (error) {
        console.error(error.message);
        process.exit(-1);
    }
}

module.exports = { connect };
