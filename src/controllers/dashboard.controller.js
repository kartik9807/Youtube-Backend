const mongoose = require("mongoose")
const {Video} = require("../models/video.model.js")
const {Subscription} = require("../models/subscription.model.js")
const {Like} = require("../models/like.model.js")
const {ApiError} = require("../utils/ApiError.js")
const {ApiResponse} = require("../utils/ApiResponse.js")
const {asyncHandler} = require("../utils/asyncHandler.js")

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    
    const user_id = req.user._id;
    if(!user_id) throw new ApiError(404,"User not found");
    const subscriberCount = await Subscription.countDocuments({channel:user_id});
    
    const videoStats = await Video.aggregate([
        {
            $match:{
                owner:new mongoose.Types.ObjectId(user_id)
            }
        },
        //? to get video length we can simply count the length of this array videoStats.length
        { //? likes for that video
            $lookup:{
                from:"likes",
                localField:"_id",
                foreignField:"video",
                as:"likesCount"
            }
        },
        {
            $addFields:{
                likesCount:{
                    $size:"$likesCount"
                }
            }
        },
        {
            $project:{
                _id:1,
                title:1,
                views:1,
                thumbnail:1,
                description:1,
                duration:1,
                likesCount:1
            }
        }
    ])
    //?video stats will be a array of objects with each object containing the video details and likes count for that video
    const channelStats = {
        subscriberCount,
        totalVideos:videoStats.length,
        videoDetail:videoStats, //? detail for each video uploaded by the channel
        totalViews:videoStats.reduce((acc, video) => acc + video.views, 0), //? sum of total views of all videos
        totalLikes:videoStats.reduce((acc, video) => acc + video.likesCount, 0) //? sum of total likes of all videos
    }
    return res.status(200).json(new ApiResponse(200,"Channel stats fetched successfully",channelStats))
})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel

    const user_id = req.user._id;
    if(!user_id) throw new ApiError(404,"User not found");

    const videos = await Video.find({owner:user_id}).sort({createdAt:-1});
    return res.status(200).json(new ApiResponse(200,"Videos fetched successfully",videos)) 
})

module.exports = {
    getChannelStats, 
    getChannelVideos
    }