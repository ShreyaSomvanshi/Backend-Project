import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utilities/ApiError.js"
import {ApiResponse} from "../utilities/ApiResponse.js"
import {asyncHandler} from "../utilities/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body
    const userId = req.user?._id
    //TODO: create playlist
    if (!name||!description) {
        throw new ApiError(400,"Name and description are required.")
    }

    if (!userId||!isValidObjectId(userId)) {
        throw new ApiError(401,"Unauthorized Request.")
    }

    const playlist = await Playlist.create({
        name,
        description,
        owner:userId,
        videos: []
    })

    if (!playlist) {
        throw new ApiError(500, "Something went wrong while creating the playlist.");
    }

    return res.status(201).json(new ApiResponse(201,playlist,"Playlist created successfully."))
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    //TODO: get user playlists
        if (!userId || !isValidObjectId(userId)) {
        throw new ApiError(400, "Valid User ID is required.");
    }

    const playlists = await Playlist.find({ owner: userId });

    return res.status(200)
    .json(new ApiResponse(200, playlists, "User playlists fetched successfully."));
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id
    if(!playlistId||!isValidObjectId(playlistId)){
        throw new ApiError(400,"Valid playlist Id is required.")
    }

    const playlist = await Playlist.findById(playlistId)

    if (!playlist) {
        throw new ApiError(404,"PLaylist not found.")
    }

    return res.status(200).json(new ApiResponse(200,playlist,"Playlist fetched successfully."))
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    if (!playlistId||!isValidObjectId(playlistId)) {
        throw new ApiError(400,"Valid playlist Id is required.")
    }

    if (!videoId||!isValidObjectId(playlistId)) {
        throw new ApiError(400,"Valid video Id is required.")
    }

    const playlist = await Playlist.findByIdAndUpdate(playlistId,
        {
            $addToSet: { 
                videos: videoId,
            },
        },{new:true}
    )

    if (!playlist) {
        throw new ApiError(500,"Something went wrong while updating playlist.")
    }

    return res.status(200).json(new ApiResponse(200,playlist,"Video added to playlist successfully."))
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist
    if (!playlistId||!isValidObjectId(playlistId)) {
        throw new ApiError(400,"Valid playlist Id is required.")
    }

    if (!videoId||!isValidObjectId(videoId)) {
        throw new ApiError(400,"Valid video Id is required.")
    }

    const existingPlaylist = await Playlist.findById(playlistId);

    if (!existingPlaylist) {
        throw new ApiError(404,"Playlist not found.")
    }

    if (existingPlaylist.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "You do not have permission to remove videos to this playlist.");
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(playlistId,
        {
            $pull: { 
                videos: videoId,
            },
        },{new:true}
    )

    if (!updatedPlaylist) {
        throw new ApiError(500,"Somthing went wrong while removing video from playlist.")
    }

    return res.status(200)
    .json(new ApiResponse(200,updatedPlaylist,"Video removed from playlist successfully."))
})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist
    if (!playlistId||!isValidObjectId(playlistId)) {
        throw new ApiError(400,"Valid playlist Id is required.")
    }

    const existingPlaylist = await Playlist.findById(playlistId);

    if (!existingPlaylist) {
        throw new ApiError(404,"Playlist not found.")
    }

    if (existingPlaylist.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "You do not have permission to delete this playlist.");
    }

    const deletedPlaylist = await Playlist.findByIdAndDelete(playlistId)

    if (!deletedPlaylist) {
        throw new ApiError(500,"Something went wrong while deleting playlist.")
    }

    return res.status(200).json(new ApiResponse(200,{},"Playlist deleted successfully."))
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist

    if (!playlistId||!isValidObjectId(playlistId)) {
        throw new ApiError(400,"Valid playlist Id is required.")
    }

    if(!name||!description){
        throw new ApiError(400,"Name or Description is required.")
    }

    const existingPlaylist = await Playlist.findById(playlistId);

    if (!existingPlaylist) {
        throw new ApiError(404,"Playlist not found.")
    }

    if (existingPlaylist.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "You do not have permission to update this playlist.");
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(playlistId,
        {
            $set:{name:name,description:description}
        },
        {new:true}
    )

    if (!updatedPlaylist) {
        throw new ApiError(500,"Something went wrong while updated playlist.")
    }

    return res.status(200).json(new ApiResponse(200,updatedPlaylist,"Playlist updated successfully."))
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}