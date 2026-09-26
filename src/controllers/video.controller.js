const mongoose = require("mongoose"),{isValidObjectId} = mongoose
const {Video} = require("../models/video.model.js")
const {User} = require("../models/user.model.js")
const {ApiError} = require("../utils/ApiError.js")
const {ApiResponse} = require("../utils/ApiResponse.js")
const {asyncHandler} = require("../utils/asyncHandler.js")
const {uploadOnCloudinary} = require("../require(tils/cloudinary.js")


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy="createdAt", sortType="desc", userId } = req.query
    //TODO: get all videos based on query, sort, pagination
    
    const pageNumber = parseInt(page)
    const limitNumber = parseInt(limit)
    const skip = (pageNumber - 1) * limitNumber 
    
    const sortOptions = { [sortBy]: sortType === "asc" ? 1 : -1 }
    const filterMatch = {
        owner:new mongoose.Types.ObjectId(userId)
    }
    if(query){
        filterMatch.title={
            $regex:query, //* use to match any query found in the title
            $options:"i" //* case insensitive
        }
    }

    const allvideos = await Video.aggregate([
        {
            $match:{
                ...filterMatch,
                isPublished:true
            }
        },
        {
            $sort:sortOptions
        },
        {
            $skip:skip
        },
        {
            $limit:limitNumber
        },
        {
            $lookup:{
                from:"users",
                localField:"owner",
                foreignField:"_id",
                as:"owner"
            }
        },
        {
            $addFields:{
                videoCount:{
                    $size:"$owner"
                }
            }
        },
        {
            $unwind:"$owner"
        },
        {
            $project:{
                videoCount:1,
                title:1,
                videoFile:1,
                description:1,
                thumbnail:1,
                duration:1,
                createdAt:1,
                owner:{
                    username:1,
                    fullname:1,
                    avatar:1
                }
            }
        }
    ])
    return res.status(200).json(new ApiResponse(allvideos,"All videos fetched successfully"))
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    if([title,description].some(field=>!field?.trim())){
        throw new ApiError(400,"All fields are required");
    }
    // TODO: get video, upload to cloudinary, create video
    console.log(req.files?.avatar);

    //* videoFile
    let videoFileLocalPath;
    if(req.files && Array.isArray(req.files.videoFile) && req.files.videoFile.length>0){
        videoFileLocalPath = req.file?.videoFile[0]?.path;
    }
    const videoFile = await uploadOnCloudinary(videoFileLocalPath);
    
    //* thumbnail
    let thumbnailLocalPath;
    if(req.files && Array.isArray(req.files.thumbnail) && req.files.thumbnail.length>0){
        thumbnailLocalPath = req.file?.thumbnail[0]?.path;
    }
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
    
    if(!videoFile) throw new ApiError(400,"Fail to upload video file on cloudinary");
    if(!thumbnail) throw new ApiError(400,"Fail to upload thumbnail on cloudinary");

    const video = await Video.create({
        videoFile:videoFile?.url,
        thumbnail:thumbnail?.url,
        title,
        description,
        duration:videoFile?.duration,
        owner:req.user._id
    })
    return res.status(200).json(new ApiResponse(200,video,"published video successfully"))
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id

    if(!isValidObjectId(videoId)) {
        throw new ApiError(400,"Invalid video ID")
    }
    const video = await Video.findById(videoId).populate("owner","username fullname avatar")
    if(!video){
        throw new ApiError(404,"Video not found")
    }
    return res.status(200).json(new ApiResponse(video,"Video fetched successfully"))
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

    const { title, description} = req.body
    if([title,description].some(field=>!field?.trim())){
        throw new ApiError(400,"All fields are required");
    }
    let thumbnailLocalPath;
    if(req.files && Array.isArray(req.files.thumbnail) && req.files.thumbnail.length>0){
        thumbnailLocalPath = req.file?.thumbnail[0]?.path;
    }
    const video = await Video.findById(videoId)
    if(!video){
        throw new ApiError(400,"video not found")
    }
    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not allowed to update this video");
    }
    const thumbnail = thumbnailLocalPath ? await uploadOnCloudinary(thumbnailLocalPath) : video.thumbnail;

    video.title = title;
    video.description=description
    video.thumbnail = thumbnail?.url || thumbnail
    await video.save()
    return res.status(200).json(new ApiResponse(200,{},"video updated successfully"))
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
    if(!isValidObjectId(videoId)) {
        throw new ApiError(400,"Invalid video ID")
    }
    const video = await Video.findById(videoId);
    if(!video){
        throw new ApiError(404,"Video not found")
    }
    if(video.owner.toString() !== req.user._id.toString()){
        throw new ApiError(403,"You are not allowed to delete this video")
    }
    await Video.findByIdAndDelete(videoId)
    return res.status(200).json(new ApiResponse({},"Video deleted successfully"))
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if(!isValidObjectId(videoId)) {
        throw new ApiError(400,"Invalid video ID")
    }
    const video = await Video.findById(videoId)
    if(!video){
        throw new ApiError(400,"video not found")
    }
    if(video.owner.toString() !== req.user._id){
        throw new ApiError(400,"you are not allowed to toggle publish satus")
    }
    if(video.isPublished){
        video.isPublished = false
        await video.save()
        return res.status(200).json(new ApiResponse({},"Video unpublished successfully"))
    }else{
        video.isPublished = true
        await video.save()
        return res.status(200).json(new ApiResponse({},"Video published successfully"))
    }
})

module.exports = {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}