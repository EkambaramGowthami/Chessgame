import { useEffect, useRef, useState } from 'react'
import { Chessboard } from 'react-chessboard';
import { Chess } from "chess.js";

import { io ,Socket} from "socket.io-client";
import { Menu, Send } from 'lucide-react';

type ChatMessage = {
  senderId: string;
  messageChat: string;
  time?: string;
};
type RoomEventPayload = {
  roomId: string;
  color: "white" | "black";
};

type MoveEventPayload = {
  move: { from: string; to: string; promotion?: string; color: "w" | "b" };
  fen: string;
  gameOver: boolean;
  checkmate: boolean;
  draw: boolean;
};
export const ChessComponent = () => {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [menu, setMenu] = useState(false);
  const [openRoom, setOpenRoom] = useState(false);
  const [positions, setPositions] = useState(false);
  const [chat, setChat] = useState(false);

  const [messageChat, setMessageChat] = useState("");
  
const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState("");
  const [result, setResult] = useState("");

  const moveSoundRef = useRef<HTMLAudioElement | null>(null);
  const successRef = useRef<HTMLAudioElement | null>(null);
  const dangerSound = useRef<HTMLAudioElement | null>(null);
  const [whiteMoves, setWhiteMove] = useState<string[]>([]);
  const [blackMoves, setBlackMove] = useState<string[]>([]);
  const [socket] = useState<Socket>(() => io("https://chessgame-backend-3y0j.onrender.com"));
  const [roomId, setRoomId] = useState<string | null>(null);
  const [inputRoomId, setInputRoomId] = useState<string>("");
  const [color, setColor] = useState<"white" | "black" | null>(null);
  const [myTurn, setMyTurn] = useState(false);
  const [chess] = useState(new Chess());
  const [fen, setFen] = useState("start");
  const [status, setStatus] = useState<string>("");
  const [boardWidth, setBoardWidth] = useState(600);
  const handleChat = () => {
    setChat(!chat);
    setPositions(false);
    setOpenRoom(false);
  }
  const handleOpenRoom = () => {
    setOpenRoom(!openRoom);
    setPositions(false);
    setChat(false);
  }
  const handlePositions = () => {
    setPositions(!positions);
    setOpenRoom(false);
    setChat(false);
  }
  const createRoom = () => {
    socket.emit("createRoom");
  };
  const joinRoom = () => {
    if (!inputRoomId) {
      alert("Please enter a room ID to join.");
      return;
    }
    socket.emit("joinRoom", inputRoomId);
  };
  const onDrop = (sourceSquare: string, targetSquare: string) => {
    if (!myTurn) return false;

    socket.emit("move", {
      roomId: roomId!,
      move: { from: sourceSquare, to: targetSquare, promotion: 'q' },

    });

    setMyTurn(false);
    return true;
  };
  useEffect(() => {
    socket.on("roomCreated", ({ roomId, color }: RoomEventPayload) => {
      setRoomId(roomId);
      setColor(color);
      setStatus("Waiting for opponent to join...");
      setMyTurn(color === "white");
    });
    socket.on("roomJoined", ({ roomId, color }: RoomEventPayload) => {
      setRoomId(roomId);
      setColor(color);
      setStatus("Joined the room. Game will start shortly.");
      setMyTurn(color === "white");
    });
    socket.on("startGame", ({ fen }) => {
      setFen(fen);
      setStatus("Game started....");
      setChat(false);

    });
    socket.on("receivedMessage", (newMessage: ChatMessage) => {
      setMessages((prev) => [...prev, newMessage]);
    });

    socket.on("moveMade", ({ move, fen, gameOver, checkmate, draw }:MoveEventPayload) => {
      const result = chess.move(move);
      moveSoundRef.current?.play();
      setFen(fen);
      const myColourCode = color === "white" ? "w" : "b";
      if (!result) return;
      if (result.color === "w") setWhiteMove(prev => [...prev, result.to]);
      else setBlackMove(prev => [...prev, result.to]);
      const isMyTurnNow = move.color !== myColourCode;
      setMyTurn(isMyTurnNow);
      if (gameOver) {
        if (checkmate) {
          setStatus("Checkmate! Game Over.");
          successRef.current?.play();
        }
        else if (draw) {
          setStatus("Draw! Game Over.");
          successRef.current?.play();
        }
        else {
          setStatus("Game Over!....");
        }
      }
      else {
        setStatus(isMyTurnNow ? "Your turn" : "Opponent's turn");
      }
    });
    socket.on("invalidMove", () => {
      alert("Invalid move");
      setMyTurn(true);
    });
    socket.on("error", (msg) => {
      alert(msg);
    });
    socket.on("GameOver", ({ result, message }) => {
      setResult(result);
      setMessage(message);
    })
    return () => {
      socket.off("roomCreated");
      socket.off("roomJoined");
      socket.off("startGame");
      socket.off("moveMade");
      socket.off("invalidMove");
      socket.off("error");
      socket.off("receivedMessage")
    };
  }, [chess, color]);

  useEffect(() => {
    moveSoundRef.current = new Audio("/sounds/ficha-de-ajedrez-34722.mp3");
  }, []);
  useEffect(() => {
    dangerSound.current = new Audio("/sounds/swoosh-sound-effect-for-fight-scenes-or-transitions-2-149890.mp3");
  }, []);
  useEffect(() => {
    successRef.current = new Audio("/sounds/success-340660.mp3");
  }, []);
  const sendMessage = () => {
    if (messageChat.trim() === "") return;
    if (!roomId) {
      alert("You're not in a room.");
      return;
    }
    const senderId = socket.id;
    socket.emit("sendMessage", ({ roomId, messageChat, senderId }));
    setMessageChat("");
  }
  useEffect(() => {
    const updateBoardSize = () => {
      const width = window.innerWidth;
      if (width < 480) {
        setBoardWidth(300);
      } else if (width < 768) {
        setBoardWidth(400);
      } else if (width < 1024) {
        setBoardWidth(500);
      } else if (width < 1440) {
        setBoardWidth(600);
      } else {
        setBoardWidth(700);
      }
    };

    updateBoardSize();
    window.addEventListener("resize", updateBoardSize);
    return () => window.removeEventListener("resize", updateBoardSize);
  }, []);
  useEffect(() => {
    const handleOutSideClick = (event: MouseEvent) => {
      if (sidebarRef.current && event.target instanceof Node && !sidebarRef.current.contains(event.target)){
        setMenu(false);
      }
    }
    if (menu) {
      document.addEventListener("mousedown", handleOutSideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutSideClick);
    }

  }, [menu]);



  return (
    <>

      <div className="relative lg:grid lg:grid-cols-[16rem_1fr] w-screen min-h-screen ">

        <div className="flex lg:hidden text-left z-20 bg-[#0E0E10] p-2">
          <button onClick={() => setMenu(!menu)}>
            <Menu className="text-white w-6 h-6" />
          </button>
        </div>

        <div
          className={`
    fixed top-0 left-0 h-full w-64 bg-[#0E0E10] z-20 shadow-xl p-4 space-y-4
    transition-transform duration-300 transform
    ${menu ? 'translate-x-0' : '-translate-x-full'}
    lg:static lg:translate-x-0 lg:block lg:z-0
  `}
          ref={sidebarRef}>
          <h2 className="text-2xl font-semibold text-[#367c2b] mb-4">Game Controls</h2>

          <div className="bg-[#080808] p-4 rounded-lg text-md">
            <p
              className="px-full py-2 text-gray-500 hover:text-white hover:bg-[#353839] rounded-lg p-2"
              onClick={handleOpenRoom}
            >
              Create Room Space
            </p>
            <p
              className="px-full py-2 text-gray-500 hover:text-white hover:bg-[#353839] rounded-lg p-2"
              onClick={handlePositions}
            >
              Chessboard Coordinates
            </p>
            <p
              className="px-full py-2 text-gray-500 hover:text-white hover:bg-[#353839] rounded-lg p-2"
              onClick={handleChat}
            >
              Open Chat
            </p>
          </div>
        </div>


        <div className="flex flex-col overflow-y-auto lg:flex-row lg:justify-center items-center min-h-screen bg-[#080808] text-white overflow-hidden p-4 space-y-6 lg:p-8 lg:space-y-0 lg:space-x-12">


          <div>
            <Chessboard
              boardWidth={boardWidth}
              position={fen}
              onPieceDrop={onDrop}
              boardOrientation={color === 'black' ? 'black' : 'white'}
              customDarkSquareStyle={{ backgroundColor: '#367c2b' }}
              customLightSquareStyle={{ backgroundColor: '#ffffff' }}
            />
          </div>

          {positions && <div className="bg-[#0E0E10] shadow-6xl rounded-xl h-[480px] w-[300px] md:w-[280px] p-4">
            <div className="text-white text-center text-md mb-4 flex items-center space-x-4">
              <img src="/symbol/reshot-icon-animals-DS2ZNXRHCE (1).svg" className="w-12 h-12" />
              <div>{status}</div>
            </div>

            <div className="flex rounded-lg">
              <div className="text-white text-center w-36">
                <p className="text-2xl">Black</p>
                <ul className="list-disc overflow-y-auto overflow-hidden max-h-[260px]">
                  {blackMoves.map((move, index) => (
                    <li key={index}>{move}</li>
                  ))}
                </ul>
              </div>

              <div className='text-white w-2 h-full'></div>
              <div className="w-px h-full bg-gray-400 mx-2"></div>
              <div className="text-white text-center w-36">
                <p className="text-2xl">White</p>
                <ul className="list-disc overflow-y-auto overflow-hidden max-h-[260px]">
                  {whiteMoves.map((move, index) => (
                    <li key={index}>{move}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          }
          {openRoom && (
            <div className="w-full sm:p-8 md:w-[280px] p-6 rounded-2xl shadow-6xl bg-[#0E0E10] text-center space-y-4">
              <h2 className="text-2xl text-[#367c2b] font-bold">Multiplayer Chess</h2>
              <button
                onClick={createRoom}
                className="w-full bg-black text-white font-medium py-3 rounded-xl"
              >
                Create Game Room
              </button>
              {status && (
                <p className="text-sm text-white bg-black py-2 rounded-md">{status}</p>
              )}
              {roomId && (
                <div className="p-3 rounded-xl bg-red-100 border border-red-400 text-red-800">
                  <p className="font-medium">Room Code:</p>
                  <p className="text-lg font-bold">{roomId}</p>
                </div>
              )}
              <input
                type="text"
                placeholder="Enter Room ID"
                value={inputRoomId}
                onChange={(e) => setInputRoomId(e.target.value)}
                className="w-full border border-gray-300 p-3 rounded-xl text-black"
              />
              <button
                onClick={joinRoom}
                className="w-full bg-[#367c2b] text-white font-semibold py-3 rounded-xl"
              >
                Join Room
              </button>
            </div>
          )}
          {chat && (
            <div className="h-[60vh] md:h-screen w-full md:w-[350px] bg-black bg-opacity-80 border border-[#0E0E10] rounded-2xl shadow-6xl flex flex-col justify-between p-4 space-y-4 overflow-hidden">
              <div className="text-2xl font-semibold text-white text-center bg-[#0E0E10] rounded-lg shadow-md">
                Chat Room
              </div>

              <div
                className="h-full overflow-y-auto overflow-hidden bg-[#0E0E10] rounded-lg p-3 text-sm space-y-2"

              >
                {messages.map((msg, idx) => {
                  const isMe = msg.senderId === socket.id;
                  return (
                    <div className={`${isMe ? "text-right" : "text-left"}`} key={idx}>
                      <span className="text-green-500 font-bold">
                        {isMe ? "You" : "Opponent"}
                      </span>
                      : {msg.messageChat}
                      <span className="text-gray-400 ml-2 text-xs">{msg.time}</span>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center">
                <input
                  value={messageChat}
                  onChange={(e) => setMessageChat(e.target.value)}
                  type="text"
                  className="flex-1 bg-[#0E0E10] p-2 rounded-lg text-white w-full"
                  placeholder="Type your message..."
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                />
                <button
                  onClick={sendMessage}
                  className="text-white rounded-lg "
                >
                  <Send />
                </button>
              </div>
            </div>
          )}


          {result && (
            <div className="absolute top-1/2 left-1/2 bg-[#0E0E10] text-white shadow-6xl transform -translate-x-1/2 -translate-y-1/2 px-6 py-10 text-center rounded-lg w-[90%] sm:w-auto">
              {message}
            </div>
          )}
        </div>
      </div>

    </>

  );
};
