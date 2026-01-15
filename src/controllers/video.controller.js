import { asyncHandler } from "../utilities/asyncHandler.js";
import { ApiError } from "../utilities/ApiError.js";
import { User } from "../models/user.model.js";
import { Video } from "../models/video.model.js"
import { UploadOnCloudinary } from "../utilities/cloudinary.js"
import { ApiResponse } from "../utilities/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video
    if(!title||!description){
        throw new ApiError(400,"Title and description is required.")
    }

    const videoPath = req.files?.videoFile?.[0]?.path;
    if (!videoPath) {
        throw new ApiError(400,"Video is required.")
    }
    const videoFile = await UploadOnCloudinary(videoPath)
    if(!videoFile){
        throw new ApiError(500,"Something went wrong while uploading video file on cloudinary.")
    }
    
    const ThumbnailPath = req.files?.Thumbnail?.[0]?.path;
    if(!ThumbnailPath){
        throw new ApiError(400,"Thumbnail is required.")
    }
    const Thumbnail = await UploadOnCloudinary(ThumbnailPath);
    if(!Thumbnail){
        throw new ApiError(500,"Something went wrong while uploading image file on cloudinary")
    }

    const owner = req.user?._id;
    if (!owner) {
        throw new ApiError(401,"Unauthorized:User not logged in or invalid token.")
    }

    const video = await Video.create({
        title,
        description,
        videoFile:videoFile.url,
        Thumbnail:Thumbnail.url,
        owner,
        isPublished:true
    })

    if (!video) {
        throw new ApiError(500,"Something went wrong while publishing video.")
    }

    res.status(201).json(new ApiResponse(200,video,"Video  published successfully."))
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
    const video = await Video.findById(videoId)

    if(!video){
        throw new ApiError(404, "Video not found.")
    }

    const videoFile = video.videoFile;

    return res.status(200).json(new ApiResponse(200,{video,videoFile},"Video fetched successfully."))
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail
    const {title,description} = req.body;
    const ThumbnailPath = req.files?.Thumbnail?.[0]?.path;

    if (!title&&!description&&!ThumbnailPath) {
        throw new ApiError(400,"Please enter details to update.")
    }

    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(404,"Video not found.")
    }

    if (video.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this video.");
    }

    const updateFields = {};
    const oldThumbnailUrl = video.thumbnail;

    if (title) {
        updateFields.title = title;
    }
    if (description) {
        updateFields.description = description;
    }

    let newThumbnailUrl = null;
    if (ThumbnailPath) {
        newThumbnailUrl = await uploadOnCloudinary(ThumbnailPath)
    }

    if (!newThumbnailUrl) {
            throw new ApiError(500, "Failed to upload new thumbnail.");
    }
    updateFields.thumbnail = newThumbnailUrl.url;

    //delete old thumbnail from cloudinary

    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: updateFields
        },
        { new: true } 
    );

    return res.status(200).json(new ApiResponse(200,updatedVideo,"Video updated successfully."))

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(404,"Video not found.")
    }

    if (video.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this video.");
    }

    const oldThumbnailUrl = video.Thumbnail;
    const oldVideoUrl = video.videoFile;

    const deletedVideo = await Video.findByIdAndDelete(videoId)

    if (!deletedVideo) {
        throw new ApiError(500,"Failed to delete  video.")
    }

    //delete Thumbnail and Video from cloudinary

    return res.status(200).json(200,{},"Video deleted successfully.")
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    
    const video = await Video.findById(videoId)

    if(!video){
        throw new ApiError(404,"Video not found.")
    }

    if (video.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "You are not authorized to toggle the publish status of this video.");
    }
    
    if(video.isPublished){
        const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                isPublished:false
            }
        },
        { new: true } 

    );

        return res.status(200).json(new ApiResponse(200,updatedVideo,"Video Publish status toggles successfully."))
    }
    else{
        const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                isPublished:true
            }
        },
        { new: true } 

    );

        return res.status(200).json(new ApiResponse(200,updatedVideo,"Video Publish status toggles successfully."))
    }
})

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
})

export {
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
    getAllVideos
}
