import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();


export const connectDB=async()=>{
    try{
        await mongoose.connect(process.env.MONGODB_URI)
        console.log("Successfully Connected to MONGODB")
    }
    catch(error){
        console.log("Error connecting Database ",error)
        process.exit(1)
    }
}