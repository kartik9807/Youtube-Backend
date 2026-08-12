const userModel = require("../models/user.model");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler.js");
const jwt = require('jsonwebtoken')

module.exports.isLoggedin = asyncHandler(async (req,_,next)=>{
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","");
        if(!token) throw new ApiError(401,"Unauthorized request or your session is expired");
        const decodedContent = jwt.verify(token,process.env.ACCESS_TOKEN_KEY);
        const user = await userModel.findById(decodedContent?._id).select('-password -refreshToken');
        if(!user) throw new ApiError(401,"Invalid Access Token");
        req.user = user;
        next();
    } catch (err) {
        throw new ApiError(401,err?.message || "Invalid Access Token")
    }
})