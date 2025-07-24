import dotenv from "dotenv";
import passport from "passport";
import express from "express";
import jwt from "jsonwebtoken";
dotenv.config();
const router = express.Router();
router.get("/google",passport.authenticate("google",{scope:["profile"],session:false}));
router.get("/google/callback",
    passport.authenticate("google",{session:false}),
    (req,res) => {
        const user = req.user as any;
        const token = jwt.sign({userId:user._id},process.env.JWT_SECRET!,{
            expiresIn:"7d"
        });
        res.redirect(`https://chessgame-the8thrank.onrender.com/oauth-success?token${token}`);


    }
)
export default router;
