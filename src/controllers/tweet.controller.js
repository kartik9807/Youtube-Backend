const mongoose = require("mongoose"),{ isValidObjectId } = mongoose
const {Tweet} = require("../models/tweet.model.js")
const {User} = require("../models/user.model.js")
const {ApiError} = require("../utils/ApiError.js")
const {ApiResponse} = require("../utils/ApiResponse.js")
const {asyncHandler} = require("../utils/asyncHandler.js")

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const {content} = req.body;
    if(!content || content.trim() === ""){
        throw new ApiError(400,"please provide your content");
    }

    const tweet = await Tweet.create({
        owner:req.user._id,
        content
    })
    return res.status(200).json(new ApiResponse(200,tweet,"tweet created successfully"))
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const {userId} = req.params;
    if(!isValidObjectId(userId)){
        throw new ApiError(400,"Invalid user ID")
    }
    const tweets = await Tweet.find({owner:userId}).populate("owner","username fullname avatar") 
    return res.status(200).json(new ApiResponse(tweets,"User tweets fetched successfully"))
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet

    const {tweetId} = req.params;
    const {newContent} = req.body;

    if(!newContent){
        throw new ApiError(400,"please provide your content")
    }
    if(!isValidObjectId(tweetId)){
        throw new ApiError(400,"Invalid tweet ID")
    }

    const tweet = await Tweet.findById(tweetId);
    if(tweet.owner.toString() !== req.user._id.toString()){
        throw new ApiError(400,"You are not allowed to edit this tweet");
    }
    tweet.content = newContent;
    await tweet.save();

    return res.status(200).json(new ApiResponse(tweet,"tweet updated successfully"))
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const {tweetId} = req.params;
    if(!isValidObjectId(tweetId)){
        throw new ApiError(400,"Invalid tweet ID")
    }
    const deletedTweet = await Tweet.findByIdAndDelete(tweetId)
    if(!deletedTweet){
        throw new ApiError(404,"Tweet not found")
    }
    return res.status(200).json(new ApiResponse({},"Tweet deleted successfully"))
})

module.exports = {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}