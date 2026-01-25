import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {Comment} from "../models/comment.model.js"
import {Tweet} from "../models/tweet.model.js"
import {Video} from "../models/video.model.js"
import {ApiError} from "../utilities/ApiError.js"
import {ApiResponse} from "../utilities/ApiResponse.js"
import {asyncHandler} from "../utilities/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video
    const userId = req.user?._id;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid Video ID");
    }

    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    const existingLike = await Like.findOne({
        video: videoId,
        likedBy: userId
    });

    if (existingLike) {
        await Like.findByIdAndDelete(existingLike._id);
        return res.status(200).json(new ApiResponse(200, { isLiked: false }, "Video unliked successfully"));
    } else {
        await Like.create({
            video: videoId,
            likedBy: userId
        });

        return res.status(200).json(new ApiResponse(200, { isLiked: true }, "Video liked successfully"));
    }
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment
    const userId = req.user?._id;

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment ID");
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }

    const existingLike = await Like.findOne({
        comment: commentId,
        likedBy: userId
    });

    if (existingLike) {
        await Like.findByIdAndDelete(existingLike._id);
        return res.status(200).json(new ApiResponse(200, { isLiked: false }, "Comment unliked successfully"));
    } else {
        await Like.create({
            comment: commentId,
            likedBy: userId
        });

        return res.status(200).json(new ApiResponse(200, { isLiked: true }, "Comment liked successfully"));
    }
})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet
    const userId = req.user?._id;

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid comment ID");
    }

    const tweet = await Tweet.findById(tweetId);
    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }

    const existingLike = await Like.findOne({
        tweet: tweetId,
        likedBy: userId
    });

    if (existingLike) {
        await Like.findByIdAndDelete(existingLike._id);
        return res.status(200).json(new ApiResponse(200, { isLiked: false }, "Tweet unliked successfully"));
    } else {
        await Like.create({
            tweet: tweetId,
            likedBy: userId
        });

        return res.status(200).json(new ApiResponse(200, { isLiked: true }, "Tweet liked successfully"));
    }
})

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
        const likes = await Like.find({ 
        likedBy: userId, 
        video: { $exists: true, $ne: null } 
    }).populate({
        path: "video",
        populate: {
            path: "owner",
            select: "username avatar"
        }
    });

    return res.status(200).json(new ApiResponse(200, likes, "Liked videos fetched."));
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}