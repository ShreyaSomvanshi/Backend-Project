import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utilities/ApiError.js"
import {ApiResponse} from "../utilities/ApiResponse.js"
import {asyncHandler} from "../utilities/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    // TODO: toggle subscription
    const userId = req.user?._id

    if(!isValidObjectId(channelId)){
        throw new ApiError(400,"Invalid channel Id")
    }

    const channelOwner = await User.findById(channelId);
    if (!channelOwner) {
        throw new ApiError(404, "Channel not found");
    }

    if (channelId.toString() === userId.toString()) {
        throw new ApiError(400, "You cannot subscribe to your own channel.");
    }

    const subscribtionStatus = await Subscription.findOne({
        subscriber:userId,
        channel:channelId
    })

    if (subscribtionStatus) {
        await Subscription.findByIdAndDelete(subscribtionStatus._id);
        return res.status(200).json(new ApiResponse(200, { isSubscribed: false }, "Unsubscribed successfully"));
    } else {
        await Subscription.create({
            subscriber:userId,
            channel:channelId
        });
    
        return res.status(200).json(new ApiResponse(200, { isSubscribed: true }, "Subscribed successfully"));
    }
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {subscriberId} = req.params

    if(!isValidObjectId(channelId)){
        throw new ApiError(400,"Invalid channel Id")
    }

        const subscribers = await Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "subscriberDetails",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            fullName: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                subscriberDetails: { $first: "$subscriberDetails" }
            }
        },
        {
            $project: {
                subscriberDetails: 1,
                createdAt: 1
            }
        }
    ]);

    return res.status(200).json(new ApiResponse(200, subscribers, "Subscribers fetched successfully."));
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const {channelId } = req.params

    if(!isValidObjectId(subscriberId)){
        throw new ApiError(400,"Invalid subscriber Id")
    }

        const subscribedTo = await Subscription.aggregate([
        {
            $match: {
                subscriber: new mongoose.Types.ObjectId(subscriberId),
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as: "subscribedChannel",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            fullName: 1,
                            avatar: 1,
                        },
                    },
                ],
            },
        },
        {
            $addFields: {
                subscribedChannel: {
                    $first: "$subscribedChannel",
                },
            },
        },
        {
            $project: {
                subscribedChannel: 1,
                createdAt: 1,
            },
        },
    ]);

    return res.status(200).json(new ApiResponse(200,subscribedTo,"Subscribed channels fetched successfully"));
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}