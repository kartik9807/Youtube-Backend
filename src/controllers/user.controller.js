// cookie setting
var options = {
        httpOnly:true, // blocks client-side JavaScript from accessing the cookie
        secure:true // Requires HTTPS (highly recommended)
}
const asyncHandler = require('../utils/asyncHandler.js')
const ApiError = require('../utils/ApiError.js')
const ApiResponse = require('../utils/ApiResponse.js')
const userModel = require('../models/user.model.js');
const uploadOnCloudinary = require('../utils/cloudinary.js')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')

const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const generateAccessAndRefreshToken = async (userID)=>{
    try {
        const user = await userModel.findById(userID);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave:false});
        return {accessToken,refreshToken};
    } catch (err) {
        console.log(err);
        throw new ApiError(500,"something went wrong while generating refresh and access token");
    }
}

const registerUser = asyncHandler(async (req,res)=>{
    //! STEPS
    // get user details from frontend using req.body
    // validation-not empty
    //check if user exist or not : username or email
    // check for images, avatar
    // upload to cloduinary 
    // create user object in db
    // remove password and refresh token from the response
    // check for user creation
    // return res

    //? getting data
    const {fullname,username,email,password} = req.body;
    if([fullname,username,email,password].some(field=>!field?.trim())){
        throw new ApiError(400,"All fields are required");
    }
    if(!regex.test(email)){
        throw new ApiError(400,"Invalid email format");
    }
    
    //? checking existingUser
    const existedUser = await userModel.findOne({
        $and: [{username},{email}]
    })
    if(existedUser) throw new ApiError(409,"User already exist");
    
    //? multer file to cloudinary
    console.log(req.files?.avatar);
    const avatarLocalPath = req.files?.avatar[0]?.path;
    let coverImageLocalPath;
    if(!avatarLocalPath) throw new ApiError(400,"Avatar file is required");
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0){
        coverImageLocalPath = req.files.coverImage[0].path;
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    if(!avatar) throw new ApiError(400,"Fail to upload avatar on cloudinary");

    const user = await userModel.create({
        fullname,
        username:username.toLowerCase(),
        email,
        password,
        avatar:avatar.url, 
        coverImage:coverImage?.url || ""   
    })
    const createdUser = await userModel.findById(user._id).select('-password -refreshToken');
    if(!createdUser) throw new ApiError(500,"something went wrong while registering user");
    return res.status(201).json(new ApiResponse(201,createdUser,"success"));

});

const loginUser = asyncHandler(async (req,res)=>{
    //! STEPS
    // take email password
    // check if user exist if not then redirect to register page
    // generate refresh token and access token 
    // make middleware to handle authorized operations using access token
    // relogin using refresh token
    // set cookie
    const {username,email,password} = req.body;
    if([username,email,password].some(field=>!field?.trim())){
        throw new ApiError(400,"All fields are required");
    }
    if(!regex.test(email)){
        throw new ApiError(400,"Invalid email format");
    }
    const userCheck = await userModel.findOne({$and:[{email},{username}]});
    if(!userCheck) throw new ApiError(404,"User not found");
    
    const isPasswordValid = await userCheck.isPasswordCorrect(password);
    if(!isPasswordValid) throw new ApiError(404,"Enter password is incorrect")
    
    const {accessToken,refreshToken} = await generateAccessAndRefreshToken(userCheck._id);
    //?

    const loggedUser = await userModel.findById(userCheck._id).select('-password -refreshToken');

    return res
    .status(200)
    .cookie('accessToken',accessToken,options)
    .cookie('refreshToken',refreshToken,options)
    .json(
        new ApiResponse(200,{user:loggedUser,refreshToken,accessToken},"User logged in successfully")
    )
});

const logoutUser = asyncHandler(async (req,res)=>{
    await userModel.findOneAndUpdate(req.user._id,{refreshToken:""},{new:true}); //! here updating it with undefined is not recommended as mongoDB ignore it
    // await userModel.findOneAndUpdate(req.user._id,{$unset:{refreshToken:undefined}},{new:true}); //! in this way it will completely remove the refreshToken field from the document instead of just setting it to an empty string 
    
    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(201,{},"logged out successfully"));
    
});

const refreshAccessToken = asyncHandler(async (req,res)=>{
    const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
    if(!incomingRefreshToken) throw new ApiError(401,"unauthorized request");
    
    try {
        const decoded = jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_KEY)
        const user = await userModel.findById(decoded?._id);
        if(!user) throw new ApiError(401,"Invalid Refresh Token");
    
        if(incomingRefreshToken !== user?.refreshToken) throw new ApiError(401,"Refresh Token is Expired");
    
        const {accessToken,refreshToken} = await generateAccessAndRefreshToken(decoded?._id);
        return res
        .status(200)
        .cookie('accessToken',accessToken,options)
        .cookie('refreshToken',refreshToken,options)
        .json(new ApiResponse(200,{accessToken,refreshToken},"Access Token refreshed successfully"));
    } catch (err) {
        throw new ApiError(401,err?.message);
    }
});

const currentPasswordChange = asyncHandler(async (req,res)=>{
    const {oldPassword,newPassword} = req.body;
    if([oldPassword,newPassword].some(field=>!field?.trim())) throw new ApiError(400,"All fields are required");
    
    const user = await userModel.findById(req.user?._id);
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
    if(!isPasswordCorrect) throw new ApiError(401,"Your entered Password is incorrect");

    user.password = newPassword;
    await user.save({validateBeforeSave:false});
    return res
    .status(200)
    .json(new ApiResponse(200,{},"Password updated successfully"))
})

const getCurrentUser = asyncHandler(async (req,res)=>{
    return res
    .status(200)
    .json(new ApiResponse(200,req.user,"Current User Fetched Successfully"))
})

const updateAccount = asyncHandler(async (req,res)=>{
    const {username,email,fullname} = req.body;
    if([username,email,fullname].some(field=>!field?.trim())) throw new ApiError(401,"All fields are required");
    
    const updatedUser = await userModel.findByIdAndUpdate(req.user?._id,{
        $set:{fullname,email,username}
    },{new:true,runValidators:true}).select('-password -refreshToken');

    return res
    .status(200)
    .json(new ApiResponse(200,updatedUser,"Account updated successfully"))
})

const updateImages = asyncHandler(async (req,res)=>{
    console.log(req.files)
    
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;
    if(!avatarLocalPath && !coverImageLocalPath) throw new ApiError(400,"At least one image is required to update");
    
    const avatar = avatarLocalPath ? await uploadOnCloudinary(avatarLocalPath) : req.user?.avatar;
    const coverImage = coverImageLocalPath ? await uploadOnCloudinary(coverImageLocalPath) : req.user?.coverImage;
    if(avatarLocalPath && !avatar) throw new ApiError(400,"Fail to upload avatar on cloudinary");
    if(coverImageLocalPath && !coverImage) throw new ApiError(400,"Fail to upload cover image on cloudinary");  
    
    const user = await userModel.findByIdAndUpdate(req.user?._id,{
        $set:{avatar:avatar?.url || avatar,coverImage:coverImage?.url || coverImage}
    },{new:true,runValidators:true}).select('-password -refreshToken');
    
    return res
    .status(200)
    .json(new ApiResponse(200,user,"Images updated successfully"))
})

const getUserChannelProfile = asyncHandler(async (req,res)=>{
    const {username} = req.params;
    if(!username) throw new ApiError(404,"Username not found");
    
    //? channel is an array
    const channel = await userModel.aggregate([
        { //? matching with the username so that we can do opertions on that documents only
            $match:{
                username: username?.toLowerCase()
            }
        },
        { //? counting subscriber 
            $lookup:{
                from:"subscriptions", // model name changes in the DB 
                localField:"_id", // local field name in userModel
                foreignField:"channel", // field name in subscriber model
                as:"subscribers"
            }
        },
        { //? counting subscribedTo
           $lookup:{
                from:"subscriptions", // model name changes in the DB 
                localField:"_id", // local field name in userModel
                foreignField:"subscriber", // field name in subscriber model
                as:"subscribedTo"
            } 
        },
        { //? field that has to be added in the userModel
            $addFields:{
                subscriberCount:{
                    $size:"$subscribers" // $ is used because it is a field
                },
                subscribedToCount:{
                    $size:"$subscribedTo" // $ is used because it is a field
                },
                isSubscribed:{
                    $cond:{
                        if:{$in:[req.user?._id,"$subscribers.subscriber"]}, // check if the user id is present in the subscriber list so that we can send true false to the frontend
                        then: true,
                        else:false
                    }
                }
            }
        },
        { //? finally what to get in the array of channel
            $project:{
                fullname:1,
                username:1,
                email:1,
                subscriberCount:1,
                subscribedToCount:1,
                isSubscribed:1,
                avatar:1,
                coverImage:1
            }
        }
    ])
    console.log(channel);
    if(!channel?.length) throw new ApiError(404,"channel does not exist");
    return res
    .status(200)
    .json(new ApiResponse(200,channel[0],"User channel profile is here"))
})

const getWatchHistory = asyncHandler(async (req,res)=>{
    const user = await userModel.aggregate([
        {
            $match:{
                //! _id:req.user._id 
                //?this will not work because by default when accessing _id mongodb provides string but in this 
                //? aggregation pipelines it provides the object id

                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup:{
                from:"videos",
                localField:"watchHistory",
                foreignField:"_id",
                as:"watchHistory",
                pipeline:[
                    {
                        $lookup:{
                            from:"user",
                            localField:"owner",
                            foreignField:"_id",
                            as:"owner",
                            pipeline:[
                                {
                                    $project:{
                                        username:1,
                                        fullname:1,
                                        avatar:1,
                                    }
                                }
                            ]
                        }
                    },
                    {   //? to get the first element of the array of ownerDetails because we know that there is only one owner for a video
                        //? this field is added in the video document so that we can access it easily in the frontend
                        //? $arrayElemAt is used to get the first element of the array
                        //? overwriting the existing owner field in the video with owner details so that we can access it easily in the frontend
                        $addFields:{
                            owner:{$arrayElemAt:["$owner",0]}
                        }
                    }
                ]
            } 
        }
    ]);
    return res
    .status(200)
    .json(new ApiResponse(200,user[0]?.watchHistory || [],"Watch history fetched successfully"))

})

module.exports = {getWatchHistory,getUserChannelProfile,registerUser,loginUser,logoutUser,refreshAccessToken,currentPasswordChange,getCurrentUser,updateAccount,updateImages}