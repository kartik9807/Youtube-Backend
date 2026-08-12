const mongoose = require("mongoose");
const {DB_NAME} = require('../constants.js');
// const asyncHandler = require('../utils/asyncHandler.js')
const connectDB = async()=>{
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error(`MongoDB connection failed ${error}`);
        throw error;
    }
}
// const connectDB = asyncHandler(async function name(req,res){
//     await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
//     console.log('MongoDb connected successfully');
// })
module.exports = connectDB;