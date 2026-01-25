import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utilities/ApiError.js"
import {ApiResponse} from "../utilities/ApiResponse.js"
import {asyncHandler} from "../utilities/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid Video ID");
    }

    // Calculate skip value
    const skip = (page - 1) * limit;

    const comments = await Comment.find({ video: videoId })
        .populate("owner", "username avatar") 
        .sort("-createdAt")                   
        .skip(skip)
        .limit(parseInt(limit));

    return res.status(200).json(new ApiResponse(200, comments, "Comments fetched successfully."));

})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const {content} = req.body;
    const {videoId} = req.params;
    const owner = req.user?._id

    if(!content){
        throw new ApiError(400,"Please enter comment.")
    }

    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid video Id.")
    }

    if(!owner||!isValidObjectId(owner)){
        throw new ApiError(401,"Unauthorized Request.")
    }

    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found. You cannot comment on a non-existent video.");
    }

    const comment = await Comment.create({
        content,
        owner,
        video:videoId
    })

    return res.status(201).json(new ApiResponse(201,comment,"Comment published."))
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const {newContent} = req.body;
    const {commentId} = req.params;
    const owner = req.user?._id;

    if(!newContent){
        throw new ApiError(400,"Please enter content to update.")
    }

    if(!isValidObjectId(commentId)){
        throw new ApiError(400,"Invalid comment Id.")
    }

    if(!owner||!isValidObjectId(owner)){
        throw new ApiError(401,"Unauthorized Request.")
    }

    const updatedComment = await Comment.findByIdAndUpdate(commentId,
        {
            $set:{content:newContent}
        },{new:true}
    )
    if(!updatedComment){
        throw new ApiError(500,"something went wrong while updating Comment.")
    }

    return res.status(200).json(new ApiResponse(200,updatedTweet,"Comment updated successfully."))
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const {commentId} = req.params;
    const owner = req.user?._id;

    if(!isValidObjectId(commentId)){
        throw new ApiError(400,"Invalid comment Id.")
    }

    if(!owner||!isValidObjectId(owner)){
        throw new ApiError(401,"Unauthorized Request.")
    }

    const comment =await Comment.findById(commentId)
    if(!comment){
        throw new ApiError(404,"Comment not found.")
    }
    if (comment.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "You are not authorized to delete this comment.");
    }

    const deletedComment = await Comment.findByIdAndDelete(commentId)
    
    if (!deletedComment){
        throw new ApiError(500,"Failed to delete comment.")
    }

    return res.status(200).json(new ApiResponse(200,{},"Comment deleted successfully."))
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
    deleteComment
    }