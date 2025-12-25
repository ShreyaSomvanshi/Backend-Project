import mongoose from "mongoose";
import {DB_NAME} from "../constants.js";

const connectDB= async ()=>{
    try{
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`\n MongoDB connected !! DB HOST:${connectionInstance.connection.host}`)
    }
    catch(error){
        console.log("MongoDB connection error", error)
        process.exit(1)
    }
}

export default connectDB;



/*
import express from "express";
const app=express()

(async()=>{
    try{
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("error",(error)=>{
            console.log("ERR:",error);
            throw error;
        })

        app.listen(process.env.PORT,()=>{
            console.log(`App is listening on port ${process.env.PORT}`)
        })
    }
    catch(error){
        console.error("ERROR:",error)
        throw error
    }
})()
*/