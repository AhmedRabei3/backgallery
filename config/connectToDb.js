const mongoose = require("mongoose");

module.exports = async() => {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log('connected to mongo DB ^_^');
    } catch (error) {
        console.log(`connstion faild to db ${error}` )
    }
}