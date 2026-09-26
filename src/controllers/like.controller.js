const mongoose = require("mongoose"),{isValidObjectId} = mongoose
const {Like} = require("../models/like.model.js")
const {ApiError} = require("../utils/ApiError.js")
const {ApiResponse} = require("../utils/ApiResponse.js")
const {asyncHandler}  = require("../utils/asyncHandler.js")

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID")
    }   
    const existedLike = await Like.findOne({video:videoId,likedBy:req.user._id})
    if(existedLike){
        await Like.findByIdAndDelete(existedLike._id)
        return res.status(200).json(new ApiResponse({},"Removed like from video"));
    }else{
        const newLike = Like.create({video:videoId,likedBy:req.user._id})
        return res.status(200).json(new ApiResponse(newLike,"Like added to video"));
    }
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment ID")
    }   
    const existedCommentLike = await Like.findOne({comment:commentId,likedBy:req.user._id})
    if(existedCommentLike){
        await Like.findByIdAndDelete(existedCommentLike._id)
        return res.status(200).json(new ApiResponse({},"Removed like from comment"));
    }else{
        const newCommentLike = Like.create({comment:commentId,likedBy:req.user._id})
        return res.status(200).json(new ApiResponse(newCommentLike,"Like added to comment"));
    }
})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID")
    }   
    const existedTweetLike = await Like.findOne({tweet:tweetId,likedBy:req.user._id})
    if(existedTweetLike){
        await Like.findByIdAndDelete(existedTweetLike._id)
        return res.status(200).json(new ApiResponse({},"Removed like from tweet"));
    }else{
        const newTweetLike = Like.create({tweet:tweetId,likedBy:req.user._id})
        return res.status(200).json(new ApiResponse(newTweetLike,"Like added to tweet"));
    }
})

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos

    const likes = await Like.find({likedBy:req.user._id}).populate("video")
    const likedVideos = likes
    .filter(like=>like.video != null)
    .map(like=>like.video)

    return res.status(200).json(new ApiResponse(200,"Liked videos fetched successfully",likedVideos))
})

module.exports = {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}