import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
const mongooURL = process.env.MONGO_URL;
if(!mongooURL) console.log("mongo url not found");
mongoose.connect(mongooURL as string);
const UserSchema = new mongoose.Schema({
    username:{type:String,required:true,unique:true},
    email:{type:String,unique:true},
    password:{type:String,default:null},
    socketId: String, 
    googleId:{type:String,unique:true,sparse:true},
})
export const userModel = mongoose.model("User",UserSchema);
