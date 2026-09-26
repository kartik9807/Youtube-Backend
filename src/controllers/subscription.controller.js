const mongoose = require("mongoose"),{isValidObjectId} = mongoose
const {User} = require("../models/user.model.js")
const { Subscription } = require("../models/subscription.model.js")
const {ApiError} = require("../utils/ApiError.js")
const {ApiResponse} = require("../utils/ApiResponse.js")
const {asyncHandler} = require("../utils/asyncHandler.js")
const subscriptionModel = require("../models/subscription.model.js")


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    const userId = req.user._id

    if(!isValidObjectId(channelId) || !isValidObjectId(userId)){
        throw new ApiError(400,"Invalid Id")
    }
    if(channelId == userId){
        throw new ApiError(400,"You cannot subscribed to your own channel")
    }
    // TODO: toggle subscription

    const existedSubscription = await Subscription.findOne({channel:channelId,subscriber:userId});
    if(existedSubscription){
        await Subscription.findByIdAndDelete(existedSubscription._id);
        return new ApiResponse(200,{},"removed subscription");
    }else{
        await Subscription.create({channel:channelId,subscriber:userId})
        return new ApiResponse(200,{},"subscription added");
    }
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID")
    }   

    //? this provide a list of subscriber , subscribed to channel
    // const subscribersList = await Subscription.find({channel:channelId}).populate("subscriber","username fullname avatar")

    //? using aggregation pipelines
    const subscribersList = await User.aggregate([
        {
            $match:{
                _id:new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup:{
                from:"subscriptions",
                localField:"_id",
                foreignField:"channel",
                as:"subscribersList"
            }
        },
        {
            $addFields:{
                subscriberCount:{
                    $size:"$subscribersList"
                }      
            }
        },
        {
            $project:{
                subscriberCount:1,
                subscribersList:{
                    $map:{
                        input:"$subscribersList",
                        as:"subscriber", //? as is used to give a name to the input field like we do in map function in js .map(subscirber=>{})
                        in:"$$subscriber.subscriber" //? $$ is aggregation variable to access the variable defined in as field
                    }
                }
            }
        }
    ])
    await User.populate(subscribersList,{path:"subscribersList",select:"username fullname avatar"})

    return res.status(200).json(new ApiResponse(subscribersList,"Subscribers list fetched successfully"))
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
    if (!isValidObjectId(subscriberId)) {
        throw new ApiError(400, "Invalid subscriber ID")
    }
    const subscribedChannels = await User.aggregate([
        {
            $match:{
                _id:new mongoose.Types.ObjectId(subscriberId)
            }
        },
        {
            $lookup:{
                from:"subscriptions",
                localField:"_id",
                foreignField:"subscriber",
                as:"subscribedChannels"
            }
        },
        {
            $addFields:{
                subChannelCount:{
                    $size:"$subscribedChannels"
                }
            }
        },
        {
            $project:{
                subscribedChannelCount:1,
                subscribedChannels:{
                    $map:{
                        input:"$subscribedChannels",
                        as:"channel",
                        in:"$$channel.channel"
                    }
                }
            }
        }
    ])
    await User.populate(subscribedChannels,{path:"subscribedChannels",select:"username fullname avatar"});
    
    return res.status(200).json(new ApiResponse(subscribedChannels,"Subscribed Channels fetched successfully"));
})

module.exports = {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}