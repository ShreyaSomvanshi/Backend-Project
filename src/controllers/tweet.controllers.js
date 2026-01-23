import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const {content} = req.body;
    if(!content){
        throw new ApiError(400,"Please enter tweet content.")
    }

    const owner = req.user?._id;
    if(!owner||!isValidObjectId(owner)){
        throw new ApiError(401,"This request is not authorized")
    }

    const tweet =  await Tweet.create({
        content,
        owner
    })

    if(!tweet){
        throw new ApiError(500,"Something went wrong while publishing tweet.")
    }

    return res.status(201).json(new ApiResponse(201,tweet,"Tweet published successfully."))

})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const { userId } = req.params;

    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user ID");
    }

    const tweets = await Tweet.find({ owner: userId }).sort({ createdAt: -1 });

    return res.status(200).json(new ApiResponse(200, tweets, "User tweets fetched successfully."));
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const {tweetId}= req.params;
    const {newContent} = req.body;

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400,"Invalid Tweet")
    }

    if(!newContent){
        throw new ApiError(400,"Enter content to update tweet.")
    }

    const tweet = await Tweet.findById(tweetId)
    if (!tweet) {
        throw new ApiError(404,"Tweet not found.")
    }

    if (tweet.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "You are not authorized to delete this tweet.");
    }

    const updatedTweet = await Tweet.findByIdAndUpdate(tweetId,
        {
            $set:{
                content:newContent
            }
        },{new:true}
    )

    return res.status(200).json(new ApiResponse(200,updatedTweet,"Tweet updated successfully."))
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const {tweetId}= req.params;

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400,"Invalid Tweet")
    }

    const tweet = await Tweet.findById(tweetId)
    
    if (!tweet) {
        throw new ApiError(404,"Tweet not found.")
    }
    
    if (tweet.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "You are not authorized to delete this tweet.");
    }

    const deletedTweet = await Tweet.findByIdAndDelete(tweetId)

    if (!deletedTweet) {
        throw new ApiError(500,"Failed to delete tweet.")
    }

    return res.status(200).json(new ApiResponse(200,{},"Tweet deleted successfully."))
})

    
export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}