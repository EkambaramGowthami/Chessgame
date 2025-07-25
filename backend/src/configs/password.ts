import passport from "passport";
import { Strategy as GoogleStratagy } from "passport-google-oauth20";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { userModel } from "../db"; 
dotenv.config();
passport.use(
    new GoogleStratagy({
        clientID:process.env.GOOGLE_CLIENT_ID!,
        clientSecret:process.env.GOOGLE_CLIENT_SECRET!,
        callbackURL: "https://chessgame-backend-428c.onrender.com/auth/google/callback",
        
    },
    async (accessToken,refreshToken,profile,done)=>{
        try{
            const existingUser = await userModel.findOne({googleId:profile.id});
            if(existingUser) return done(null,existingUser);
            const newUser = await userModel.create({
                googleId: profile.id,
                    username: profile.displayName,
                    email: profile.emails?.[0].value,
                    avatar: profile.photos?.[0].value,
                    currentRating: 1200,
                    gamesPlayed: 0,
                    wins: 0,
                    losses: 0,
                    draws: 0,
                    ratingHistory: [{ rating: 1200 }],
            });
            done(null,newUser);
        }
        catch(err){
            done(err,false);
        }

    }
)
);
passport.serializeUser((user:any,done:any)=>{
    done(null,user.id);
});
passport.deserializeUser(async (id,done)=>{
    const user=await userModel.findOne({_id:id});
    done(null,user);
});
