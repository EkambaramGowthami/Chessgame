import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import passport from "passport";
import session from "express-session";
import router from "./routes/auth";
import "./configs/password";
import dotenv from 'dotenv';
import { userModel } from "./db";
dotenv.config();
const jwtSecret = process.env.JWT_SECRET as string;
import { Chess,Move, Square } from "chess.js";
import { Socket,Server } from "socket.io";
import http from "http";
import cors from "cors";
import { VerityUser } from "./middlewares/VerifuUser";
import cookieParser from "cookie-parser"; 


interface Room {
    chess : Chess,
    players : string[]
}
interface ClientToServerEvents {
    createRoom : () => void;
    joinRoom : (roomId:string) => void;
    move : (data:{roomId:string;move:{from:string;to:string;promotion?:string}})=>void;
    sendMessage : (data:{roomId:string,messageChat:string,senderId:string})=>void;
}
interface ServerToClientEvents {
    roomCreated : (data:{roomId:string,color:string})=>void;
    roomJoined :  (data:{roomId:string,color:string})=>void;
    startGame : (data:{fen:string})=>void;
    moveMade :(data:{
        move:Move;
        fen:string;
        gameOver:boolean;
        checkmate:boolean;
        draw:boolean;
    }) => void;
    GameOver : (data : {result:string,message:string})=>void;
    receivedMessage : (data : {messageChat:string,time:string,senderId:string})=>void;
    invalidMove : ()=>void;
    error : (msg:string)=>void;
}
const app=express();
const PORT = process.env.PORT || 3000;
app.use(
    cors({
      origin: "https://chessgame-the8thrank.onrender.com",
      credentials: true,
    })
  );
app.use(express.json());
app.use(cookieParser());
const server = http.createServer(app);
const io = new Server<ClientToServerEvents,ServerToClientEvents>(server,{
    cors:{
        origin:"*",
        methods:["GET","POST"],
    }

})
const rooms:Record<string,Room> = {};
io.on("connection",(socket:Socket<ClientToServerEvents,ServerToClientEvents>)=>{
    console.log("socket id :",socket.id);
    socket.on("createRoom",()=>{
        const roomId = Math.random().toString(36).substring(2,6);
        const chess = new Chess();
        rooms[roomId] = {chess,players:[socket.id]}
        socket.join(roomId);
        socket.emit("roomCreated",{roomId,color:"white"});

    });
    socket.on("joinRoom",(roomId:string)=>{
        const room = rooms[roomId];
        if(!room){
            socket.emit("error","room not found");
            return;

        } 
        if (room.players.length >= 2) {
            socket.emit("error", "room full");
            return;
        }
        room.players.push(socket.id);
        socket.join(roomId);
        socket.emit("roomJoined",{roomId,color:"black"});
        io.to(roomId).emit("startGame",{fen:room.chess.fen()});

    });
    socket.on("move",async ({ roomId,move })=>{
        const room = rooms[roomId];
        if(!room) return;
        
    try {
        const fromRank = move.from[1];
        const toRank = move.to[1];
        const piece = room.chess.get(move.from as Square)?.type;
        if(piece == "p" && ((fromRank=="7" && toRank=="8") || (fromRank=="2" && toRank=="1")) && !move.promotion){
            move.promotion="q"
        }
        const result = room.chess.move(move);
        if (result) {
            const fen = room.chess.fen();
            const gameOver = room.chess.isGameOver();
            const isDraw = room.chess.isDraw();
            const isCheckmate = room.chess.isCheckmate();
            io.to(roomId).emit("moveMade", {
                move: result,
                fen,
                gameOver,
                checkmate : isCheckmate,
                draw: isDraw
            });
            if(isCheckmate){
                const loserColor = room.chess.turn();
                const winnerColor = loserColor == "w" ? "b" : "w";
                const whiteSocketId = room.players[0];
                const blackSocketId = room.players[1];
                const winnerSocketId = winnerColor === "w" ? whiteSocketId : blackSocketId;
                const  loserSocketId = loserColor === "w" ? whiteSocketId : blackSocketId;
                io.to(winnerSocketId).emit("GameOver",{
                    result : "Win",
                    message: "🎉 You win by checkmate! 🏆 Great job!"
                })
                io.to(loserSocketId).emit("GameOver",{
                    result: "lose",
                    message: "You lost by checkmate. But every loss is a lesson!"
                })
               

            }else if(isDraw){
                for(const playerId of room.players){
                    io.to(playerId).emit("GameOver",{
                        result:'Draw',
                        message: "🤝 It's a draw! Well matched game."
                    })
                }
                
            }

        } else {
            socket.emit("invalidMove");
        }
    } catch (err) {
        console.error("Invalid move attempted:", move, err);
        socket.emit("invalidMove");
    }
     })
     socket.on("sendMessage",({ roomId,messageChat,senderId })=>{
        io.to(roomId).emit("receivedMessage",({
            messageChat,
            time : new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}),
            senderId
        }))

     })
     socket.on('disconnect',()=>{
        console.log("socket disconnect",socket.id);
        for(const [roomId,room] of Object.entries(rooms)){
            room.players=room.players.filter(id => id!==socket.id);
            if(room.players.length == 0){
                delete rooms[roomId];
            }
        }
     });
     

});
app.get("/",(req,res)=>{
    console.log("chess board is connected to backend");
 });
 app.post("/signup", async (req:any, res:any) => {
    const { username, email, password } = req.body;
  
    try {
      
      const existingUser = await userModel.findOne({
        $or: [{ email }, { username }],
      });
  
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }
 
      const hashedPassword = await bcrypt.hash(password, 10);
  
      const newUser = new userModel({
        username,
        email,
        password: hashedPassword,
      });
  
      await newUser.save();
  
      const token = jwt.sign({ _id: newUser._id }, jwtSecret, {
        expiresIn: "7d",
      });
  
      
      res.cookie("authToken", token, {
        httpOnly: true,
        sameSite: "lax", 
        secure: false,   
      });
      console.log("Cookies received:", req.cookies);
      res.status(201).json({
        message: "Signup successful",
        user: {
          username: newUser.username,
          email: newUser.email,
        },
      });
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err });
    }
  });

  app.post("/signin", async (req:any, res:any) => {
    const { usernameOremail, password } = req.body;
  
    try {
      const user = await userModel.findOne({
        $or: [{ email: usernameOremail }, { username: usernameOremail }],
      });
  
      if (!user) {
        return res.status(400).json({ message: "User not found" });
      }
  
      const isMatch = await bcrypt.compare(password, user.password!);
      if (!isMatch) {
        return res.status(400).json({ message: "Invalid credentials" });
      }
  
      const token = jwt.sign({ _id: user._id }, jwtSecret, {
        expiresIn: "7d",
      });
  
      res.cookie("authToken", token, {
        httpOnly: true,
        sameSite: "lax", 
        secure: false,   
      });
  
      res.status(200).json({
        message: "Signin successful",
        user: {
          username: user.username,
          email: user.email,
        },
      });
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err });
    }
  });
 app.get("/api/profile",VerityUser, async (req:any,res:any)=>{
    if (!req.user || !req.user._id) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    const user = await userModel.findById(req.user._id).select("-password");
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ user });

 })
 app.get("/test-auth", VerityUser, (req, res) => {
    res.json({ message: "Authenticated", user: req.user });
  });
 app.use(
    session({
        secret:jwtSecret,
        resave:false,
        saveUninitialized:false
    })
 );
 app.use(passport.initialize());
app.use(passport.session());
app.use("/auth",router);
server.listen(PORT, '0.0.0.0', () => {
  console.log(` Server running on port ${PORT}`);
});




