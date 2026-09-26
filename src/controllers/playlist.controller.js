const mongoose= require("mongoose"),{isValidObjectId}  = mongoose;
const {Playlist} = require("../models/playlist.model.js")
const {ApiError} = require("../utils/ApiError.js")
const {ApiResponse} = require("../utils/ApiResponse.js")
const {asyncHandler} = require("../utils/asyncHandler.js")


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body
    //TODO: create playlist
    if([name,description].some(field=>!field?.trim())){
        throw new ApiError(400,"All fields are required");
    }
    const createplaylist = await Playlist.create({
        name,
        description,
        owner:req.user._id
    })
    return res.status(200).json(new ApiResponse(200,createplaylist,"playlist created"));
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    //TODO: get user playlists
    if(!isValidObjectId(userId)){
        throw new ApiError(400,"Invalid Id");
    }
    const playlists = await Playlist.find({owner:userId}).sort({createdAt:-1});
    if(!playlists){
        return res.status(200).json(new ApiResponse(200,{},"No playlist found"))
    }
    return res.status(200).json(new ApiResponse(200,playlists,"playlist fetched successfully"))
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id
    if(!isValidObjectId(playlistId)){
        throw new ApiError(400,"Invalid Id");
    }
    const playlist = await Playlist.findById(playlistId).populate("videos","thumbnail videoFile views title duration");
    
    return res.status(200).json(new ApiResponse(200,playlist,"playlist fetched successfully"))
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    if(!(isValidObjectId(playlistId) && isValidObjectId(videoId))){
        throw new ApiError(400,"Invalid Id")
    }
    const playlist = await Playlist.findById(playlistId);
    if(!playlist){
        throw new ApiError(400,"Playlist not found")
    }
    if(playlist.owner.toString() !== req.user._id){
        throw new ApiError(403,"You are not authorized to add video to these playlist")
    }
    if(playlist.videos.include(videoId)){
        return res.status(200).json(new ApiResponse(200,{},"Video already exist in your playlist"))
    }
    await playlist.videos.push(videoId);
    await playlist.save();
    return res.status(200).json(new ApiResponse(200,{},"Added video to playlist successfully"))
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist

    if(!(isValidObjectId(playlistId) && isValidObjectId(videoId))){
        throw new ApiError(400,"Invalid Id")
    }
    const playlist = await Playlist.findById(playlistId);
    if(!playlist){
        throw new ApiError(400,"Playlist not found")
    }
    if(playlist.owner.toString() !== req.user._id){
        throw new ApiError(403,"You are not authorized to remove video to these playlist")
    }
    if(!playlist.videos.include(videoId)){
        return res.status(200).json(new ApiResponse(200,{},"This video does not exist in your playlist"))
    }
    await playlist.videos.pull(videoId);
    await playlist.save();
    return res.status(200).json(new ApiResponse(200,{},"Removed video from playlist successfully"))
})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist
    if(!isValidObjectId(playlistId)){
        throw new ApiError(400,"Invalid Id");
    }
    const playlist = await Playlist.findById(playlistId);
    if(!playlist){
        throw new ApiError(400,"playlist not found");
    } 
    if(playlist.owner.toString() !== req.user._id){
        throw new ApiError(403,"you are not allowed to delete this playlist")
    }
    await Playlist.findByIdAndDelete(playlistId);
    return res.status(200).json(new ApiResponse(200,{},"playlist deleted successfully"))
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist
    if(!isValidObjectId(playlistId)){
        throw new ApiError(400,"Invalid Id")
    }
    if([name,description].some(field=>!field?.trim())){
        throw new ApiError(400,"All fields are required");
    }
    const playlist = await Playlist.findById(playlistId);
    if(!playlist){
        throw new ApiError(400,"playlist not found");
    }
    if(playlist.owner.toString() !== req.user._id){
        throw new ApiError(403,"you are not allowed to update this playlist")
    }
    playlist.name = name
    playlist.description = description
    await playlist.save();
    return res.status(200).json(new ApiResponse(200,playlist,"playlist updated successfully"))

})

module.exports = {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}