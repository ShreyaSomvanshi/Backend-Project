import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utilities/ApiError.js"
import {ApiResponse} from "../utilities/ApiResponse.js"
import {asyncHandler} from "../utilities/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    const userId = req.user?._id;
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    if (!userId) {
        throw new ApiError(401, "Unauthorized request.");
    }
    const stats = await Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "videoLikes"
            }
        },
        {
            $group: {
                _id: null,
                totalVideos: { $sum: 1 },
                totalViews: { $sum: "$views" },
                totalLikes: { $sum: { $size: "$videoLikes" } }
            }
        }
    ]);

    const totalSubscribers = await Subscription.countDocuments({
        channel: userId
    });

    const channelStats = {
        totalVideos: stats[0]?.totalVideos || 0,
        totalViews: stats[0]?.totalViews || 0,
        totalLikes: stats[0]?.totalLikes || 0,
        totalSubscribers: totalSubscribers || 0
    };

    return res.status(200)
    .json(new ApiResponse(200, channelStats, "Channel stats fetched successfully."));
})

const getChannelVideos = asyncHandler(async (req, res) => {
    const  channelId  = req.user?._id;
    // TODO: Get all the videos uploaded by the channel
    if (!channelId || !isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid Channel ID.");
    }

    const videos = await Video.find({
        owner: channelId,
        isPublished: true 
    }).sort({ createdAt: -1 }); 

    if (!videos) {
        throw new ApiError(500, "Error while fetching channel videos.");
    }

    return res.status(200).json(new ApiResponse(200, videos, "Channel videos fetched successfully."));
})

export {
    getChannelStats, 
    getChannelVideos
}