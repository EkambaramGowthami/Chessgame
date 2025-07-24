"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const mongooURL = process.env.MONGO_URL;
if (!mongooURL)
    console.log("mongo url not found");
mongoose_1.default.connect(mongooURL);
const UserSchema = new mongoose_1.default.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, unique: true },
    password: { type: String, default: null },
    socketId: String,
    googleId: { type: String, unique: true, sparse: true },
});
exports.userModel = mongoose_1.default.model("User", UserSchema);
