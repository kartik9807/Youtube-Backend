const mongoose = require("mongoose"),{ isValidObjectId } = mongoose
const {Comment} = require("../models/comment.model.js")
const {ApiError} = require("../utils/ApiError.js")
const {ApiResponse} = require("../utils/ApiResponse.js")
const {asyncHandler} = require("../utils/asyncHandler.js")

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query
    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid video ID")
    }
    const pageNumber = parseInt(page)
    const limitNumber = parseInt(limit)
    const skip = (pageNumber-1) * limitNumber

    //* const comments = await Comment.find({video:videoId})
    // .sort({createdAt:-1})
    // .skip(skip)
    // .limit(limitNumber)
    // .populate("user","username fullname avatar")

    //? using aggregation pipeline
    const comments = await Comment.aggregate([
        {
            $match:{
                video:new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $lookup:{
                from:"users",
                localField:"owner",
                foreignField:"_id",
                as:"owner"
            }
        },{
            $unwind:"$owner"
        },
        {
            $addFields:{
                commentCount:{
                    $size:"$owner"
                }
            }
        },
        {
            $project:{
                content:1,
                createdAt:1,
                commentCount:1,
                owner:{
                    username:1,
                    avatar:1,
                }
            }
        },{
            $skip:skip
        },
        {
            $limit:limitNumber
        }
    ])
    return res.status(200).json(new ApiResponse(comments,"comments fetched successfully"))
})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const {content} = req.body;
    const {videoId} = req.params;
    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid id");
    }
    if(!content || content.trim() === ""){
        throw new ApiError(400,"please provide your content");
    }
    const newComment = await Comment.create({
        content,
        video:videoId,
        owner:req.user._id
    })
    return res.status(200).json(new ApiResponse(newComment,"comment added successfully"))   
})


const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const {newContent} = req.body;
    const {commentId} = req.params;
    if(!isValidObjectId(commentId)){
        throw new ApiError(400,"Invalid id");
    }
    if(!newContent || newContent.trim() === ""){
        throw new ApiError(400,"please provide your content");
    }
    const comment = await Comment.findById(commentId);
    if(comment.owner.toString() !== req.user._id.toString()){
        throw new ApiError(400,"You are not allowed to edit this comment");
    }
    comment.content = newContent;
    await comment.save();

    return res.status(200).json(new ApiResponse(comment,"comment updated successfully"))
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment

    const {commentId} = req.params;
    if(!isValidObjectId(commentId)){
        throw new ApiError(400,"Invalid id");
    }

    await Comment.findByIdAndDelete(commentId);
    return res.status(200).json(new ApiResponse(200,{},"deleted successfully"))
})

module.exports = {
    getVideoComments, 
    addComment, 
    updateComment,
    deleteComment
    }