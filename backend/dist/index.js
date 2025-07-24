"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const passport_1 = __importDefault(require("passport"));
const express_session_1 = __importDefault(require("express-session"));
const auth_1 = __importDefault(require("./routes/auth"));
require("./configs/password");
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = require("./db");
dotenv_1.default.config();
const jwtSecret = process.env.JWT_SECRET;
const chess_js_1 = require("chess.js");
const socket_io_1 = require("socket.io");
const http_1 = __importDefault(require("http"));
const cors_1 = __importDefault(require("cors"));
const VerifuUser_1 = require("./middlewares/VerifuUser");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: "http://localhost:5173",
    credentials: true,
}));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    }
});
const rooms = {};
io.on("connection", (socket) => {
    console.log("socket id :", socket.id);
    socket.on("createRoom", () => {
        const roomId = Math.random().toString(36).substring(2, 6);
        const chess = new chess_js_1.Chess();
        rooms[roomId] = { chess, players: [socket.id] };
        socket.join(roomId);
        socket.emit("roomCreated", { roomId, color: "white" });
    });
    socket.on("joinRoom", (roomId) => {
        const room = rooms[roomId];
        if (!room) {
            socket.emit("error", "room not found");
            return;
        }
        if (room.players.length >= 2) {
            socket.emit("error", "room full");
            return;
        }
        room.players.push(socket.id);
        socket.join(roomId);
        socket.emit("roomJoined", { roomId, color: "black" });
        io.to(roomId).emit("startGame", { fen: room.chess.fen() });
    });
    socket.on("move", (_a) => __awaiter(void 0, [_a], void 0, function* ({ roomId, move }) {
        var _b;
        const room = rooms[roomId];
        if (!room)
            return;
        try {
            const fromRank = move.from[1];
            const toRank = move.to[1];
            const piece = (_b = room.chess.get(move.from)) === null || _b === void 0 ? void 0 : _b.type;
            if (piece == "p" && ((fromRank == "7" && toRank == "8") || (fromRank == "2" && toRank == "1")) && !move.promotion) {
                move.promotion = "q";
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
                    checkmate: isCheckmate,
                    draw: isDraw
                });
                if (isCheckmate) {
                    const loserColor = room.chess.turn();
                    const winnerColor = loserColor == "w" ? "b" : "w";
                    const whiteSocketId = room.players[0];
                    const blackSocketId = room.players[1];
                    const winnerSocketId = winnerColor === "w" ? whiteSocketId : blackSocketId;
                    const loserSocketId = loserColor === "w" ? whiteSocketId : blackSocketId;
                    io.to(winnerSocketId).emit("GameOver", {
                        result: "Win",
                        message: "🎉 You win by checkmate! 🏆 Great job!"
                    });
                    io.to(loserSocketId).emit("GameOver", {
                        result: "lose",
                        message: "You lost by checkmate. But every loss is a lesson!"
                    });
                }
                else if (isDraw) {
                    for (const playerId of room.players) {
                        io.to(playerId).emit("GameOver", {
                            result: 'Draw',
                            message: "🤝 It's a draw! Well matched game."
                        });
                    }
                }
            }
            else {
                socket.emit("invalidMove");
            }
        }
        catch (err) {
            console.error("Invalid move attempted:", move, err);
            socket.emit("invalidMove");
        }
    }));
    socket.on("sendMessage", ({ roomId, messageChat, senderId }) => {
        io.to(roomId).emit("receivedMessage", ({
            messageChat,
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            senderId
        }));
    });
    socket.on('disconnect', () => {
        console.log("socket disconnect", socket.id);
        for (const [roomId, room] of Object.entries(rooms)) {
            room.players = room.players.filter(id => id !== socket.id);
            if (room.players.length == 0) {
                delete rooms[roomId];
            }
        }
    });
});
app.get("/", (req, res) => {
    console.log("chess board is connected to backend");
});
app.post("/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, email, password } = req.body;
    try {
        const existingUser = yield db_1.userModel.findOne({
            $or: [{ email }, { username }],
        });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        const newUser = new db_1.userModel({
            username,
            email,
            password: hashedPassword,
        });
        yield newUser.save();
        const token = jsonwebtoken_1.default.sign({ _id: newUser._id }, jwtSecret, {
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
    }
    catch (err) {
        res.status(500).json({ message: "Server error", error: err });
    }
}));
app.post("/signin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { usernameOremail, password } = req.body;
    try {
        const user = yield db_1.userModel.findOne({
            $or: [{ email: usernameOremail }, { username: usernameOremail }],
        });
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }
        const isMatch = yield bcrypt_1.default.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }
        const token = jsonwebtoken_1.default.sign({ _id: user._id }, jwtSecret, {
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
    }
    catch (err) {
        res.status(500).json({ message: "Server error", error: err });
    }
}));
app.get("/api/profile", VerifuUser_1.VerityUser, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user || !req.user._id) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    const user = yield db_1.userModel.findById(req.user._id).select("-password");
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ user });
}));
app.get("/test-auth", VerifuUser_1.VerityUser, (req, res) => {
    res.json({ message: "Authenticated", user: req.user });
});
app.use((0, express_session_1.default)({
    secret: jwtSecret,
    resave: false,
    saveUninitialized: false
}));
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
app.use("/auth", auth_1.default);
server.listen(3000, () => {
    console.log("server running on 3000 port");
});
