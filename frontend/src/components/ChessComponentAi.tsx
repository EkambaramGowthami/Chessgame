import { Chess } from "chess.js";
import { useEffect, useState,useRef } from "react";
import { Chessboard } from "react-chessboard";
import { useSearchParams } from "react-router-dom";

export const ChessComponentAi = () => {
  const [boardWidth,setBoardWidth] = useState(600);
  const successRef = useRef<HTMLAudioElement | null>(null);
  const moveSoundRef = useRef<HTMLAudioElement | null>(null);
  const dangerSound = useRef<HTMLAudioElement | null>(null);
  const [whiteMove, setWhiteMove] = useState<string[]>([]);
  const [blackMove, setBlackMove] = useState<string[]>([]);
  const [searchParams] = useSearchParams();
  const level = searchParams.get("level") || "newbie";
  const [chess] = useState(new Chess());
  const [fen, setFen] = useState("start");
  const [playColor] = useState("white");
  const [status, setStatus] = useState("");
  const makeAIMove = () => {
    if (chess.isGameOver()) return;
    const moves = chess.moves();
    if (moves.length == 0) return;
    let move;
    if (level === "newbie") {
      move = pickBasicMove(chess);
    }
    else if (level === "beginner") {
      move = pickReasonableMove(chess);
    }
    else if (level === "advanced") {
    
      move = pickBestMove(chess,3);
    }
    const result = chess.move(move);
    if(!result) return;
    setFen(chess.fen());
    setBlackMove(prev => [...prev, result.to]);
    moveSoundRef.current?.play();
    
    if (chess.isGameOver()) {
      if (chess.isCheckmate()) {
        dangerSound.current?.play();
       
        setStatus("Game Over! You lost. 🫣 AI wins.");
        successRef.current?.play();
      } else if (chess.isDraw()) {
        setStatus("Game Over! It's a draw. 🤝");
        successRef.current?.play();
      } else {
        setStatus("Game Over!");

      }
    } else {
      setStatus("Your move");
    }

  }
  const onDrop = (sourceSquare: string, targetSquare: string) => {
    const move = chess.move({
      from: sourceSquare,
      to: targetSquare,
      promotion: "q",
    });
    if (move == null) return false;
    setFen(chess.fen());
    moveSoundRef.current?.play();
    setWhiteMove(prev => [...prev, move.to]);
    if (chess.isGameOver()) {
      if (chess.isCheckmate()) {
        
        setStatus("Game Over! You win.");
        successRef.current?.play();
      } else if (chess.isDraw()) {
        setStatus("Game Over! It's a draw.");
        successRef.current?.play();
      } else {
        setStatus("Game Over!");
      }
    } else {
      setStatus("AI is thinking...");
      setTimeout(() => {
        makeAIMove();
      }, 100);
      return true;

    }


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
    setStatus("your move");
  }, []);
  useEffect(() => {
    moveSoundRef.current = new Audio("/sounds/ficha-de-ajedrez-34722.mp3");
    dangerSound.current = new Audio("/sounds/swoosh-sound-effect-for-fight-scenes-or-transitions-2-149890.mp3");
    successRef.current = new Audio("/sounds/success-340660.mp3");
  }, []);
  return (
    <div className="flex flex-col lg:flex-row min-h-screen w-screen bg-[#0E0E10] overflow-hidden">

    

      <div className="flex flex-col  lg:flex-row lg:justify-center  items-center w-screen min-h-screen text-white space-x-12 mt-0  bg-[#080808]">

        <div className="flex justify-center items-center flex-grow p-4">
          <div className="ml-12 flex justify-center items-center">
          <Chessboard
            position={fen}
            onPieceDrop={onDrop}
            boardOrientation={playColor}
            boardWidth={boardWidth}
            customDarkSquareStyle={{ backgroundColor: "#367c2b" }}
            customLightSquareStyle={{ backgroundColor: "#ffffff" }}
          /></div>
        </div>
        
        <div className="md:mt-4 bg-[#0E0E10] overflow-hidden rounded-xl h-[480px]">
          <div className="z-16 text-white text-center text-md relative top-2 flex justify-center items-center space-x-8">
            <img src="/symbol/reshot-icon-animals-DS2ZNXRHCE (1).svg" className="w-12 h-12" />
            <div>{status}</div>
          </div>
          <div className="w-full h-px bg-gray-400 relative top-16"></div>
          <div className="flex rounded-lg relative top-16 ">
            <div className="text-white text-center w-36 ">
              <p className="text-2xl text-white ">Black</p>
              <div className="w-full h-px bg-gray-400"></div>
              <ul className="list-disc overflow-y-scroll scrollbar-hide flex flex-col text-cente max-h-[260px]">
                {blackMove.map((move, index) => (
                  <li key={index} className="font-xl">{move}</li>
                ))}

              </ul>

            </div>
            <div className="w-px h-full bg-gray-400 "></div>
            <div className="text-white  text-center w-36 ">
              <p className="text-2xl text-white">white</p>
              <div className="w-full h-px bg-gray-400"></div>
              <ul className="list-disc overflow-y-scroll scrollbar-hide flex flex-col text-center max-h-[260px]">
                {whiteMove.map((move, index) => (
                  <li key={index} className="font-xl">{move}</li>
                ))}

              </ul>

            </div>
          </div>


        </div>
        {chess.isGameOver()==true && (
      <div className="absolute top-1/2 left-1/2 bg-[#14ae5c] bg-opacity-90 transform -translate-x-1/2 -translate-y-1/2 px-6 py-6 flex flex-col justify-center items-center text-black text-lg font-semibold rounded-lg shadow-lg mb-12" p-6>
     {chess.isCheckmate() ? (
      <>
        {chess.turn() === 'w' ? (
          <>
            <div className="text-2xl">🖤 AI Wins! 🏆</div>
            <div className="italic text-sm text-gray-800">
              "Every master was once a beginner. Keep going!" 💪
            </div>
          </>
        ) : (
          <>
            <div className="text-2xl">🤍 You Win! 🎉</div>
            <div className="italic text-sm text-gray-800">
              "Victory is sweetest when you've known defeat." ✨✨✨
            </div>
          </>
        )}
      </>
    ) : (
      <>
        <div className="text-2xl">🤝 Draw!</div>
        <div className="italic text-sm text-gray-800">
          "Sometimes, balance is the ultimate outcome." ⚖️
        </div>
      </>
    )}
  </div>
    )}




      </div>

    </div>

  )

}

function pickBasicMove(chess: Chess) {
  const moves = chess.moves({ verbose: true });
  const safeMoves = moves.filter((move) => {
    const clone = new Chess(chess.fen());
    clone.move(move);
    return !clone.inCheck();
  });
  const scoredMoves = safeMoves.map((move) => {
    let score = 0;
    if (move.captured) score += 1;
    if (["d4", "d5", "e4", "e5"].includes(move.to)) score += 0.5;
    return { move, score };
  });
  if (scoredMoves.length === 0) {
    return safeMoves[Math.floor(Math.random() * safeMoves.length)];
  }
  scoredMoves.sort((a, b) => b.score - a.score);
  const topMoves = scoredMoves.filter(m => m.score === scoredMoves[0].score);
  return topMoves[Math.floor(Math.random() * topMoves.length)].move;
}

function pickReasonableMove(chess: Chess) {
  const moves = chess.moves({ verbose: true });
  let bestScore = -Infinity;
  let bestMoves: typeof moves = [];
  for (const move of moves) {
    const clone = new Chess(chess.fen());
    clone.move(move);
    let score = 0;
    if (clone.isCheckmate()) return move;
    if (clone.inCheck()) continue;
    score += evaluateMaterial(clone);
    if (move.captured) {
      const pieceValues: Record<string, number> = { "p": 1, "n": 3, "b": 3, "r": 5, "q": 9 };
      score += pieceValues[move.captured] || 0.5;
    }
    if (["d4", "d5", "e4", "e5"].includes(move.to)) {
      score += 0.5;
    }
    if (["n", "b"].includes(move.piece)) {
      score += 0.5;
    }
    if (move.piece == "k" && chess.moveNumber() < 15) {
      score -= 1;
    }
    if (score > bestScore) {
      bestScore = score;
      bestMoves = [move];
    }
    else if (score === bestScore) {
      bestMoves.push(move);
    }

  }
  if (bestMoves.length > 0) {
    return bestMoves[Math.floor(Math.random() * bestMoves.length)];
  }
  return moves[Math.floor(Math.random() * moves.length)];

}
function evaluateMaterial(chess: Chess): number {
  const board = chess.board();
  let score = 0;
  const pieceValues: Record<string, number> = {
    "p": 1, "n": 3, "b": 3, "r": 5, "q": 9, "k": 0
  };
  for (const row of board) {
    for (const piece of row) {
      if (!piece) continue;
      const value = pieceValues[piece.type] || 0;
      score += piece.color === "b" ? value : -value;
    }
  }
  return -score;


}

function evaluateBoard(chess: Chess): number {
  const board = chess.board();
  let score = 0;

  const pieceValues: Record<string, number> = {
    p: 100, n: 320, b: 330, r: 500, q: 900, k: 0
  };

  const centerSquares = new Set(['d4', 'd5', 'e4', 'e5']);

  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      const piece = board[i][j];
      if (!piece) continue;

      let value = pieceValues[piece.type];
      const square = String.fromCharCode(97 + j) + (8 - i);
      if (centerSquares.has(square)) value += 10;
      if (['n', 'b'].includes(piece.type)) value += 5;
      if (piece.type === 'k' && (i === 0 || i === 7) && (j === 6 || j === 2)) value += 30; 

      score += piece.color === 'w' ? value : -value;
    }
  }

  return score;
}

function minMax(chess:Chess,depth:number,alpha:number,beta:number,maximizingPlayer:boolean):number{
  if(depth===0 || chess.isGameOver()){
    if(chess.isCheckmate()) return maximizingPlayer ? -Infinity:Infinity;
    if(chess.isStalemate() || chess.isDraw()) return 0;
    else return evaluateBoard(chess);
  }
  const moves = chess.moves({verbose:true});
  if(maximizingPlayer){
    
    let maxEval = -Infinity;
    for(const move of moves){
      const clone=new Chess(chess.fen());
      clone.move(move);
      const maxEvalScore=minMax(clone,depth-1,alpha,beta,false);
      maxEval=Math.max(maxEval,maxEvalScore);
      alpha=Math.max(alpha,maxEval);
      if(beta<= alpha) break;
  }
  return maxEval;
}
  else {
    let minEval=Infinity;
    for(const move of moves){
      const clone = new Chess(chess.fen());
      clone.move(move);
      const minEvalScore=minMax(clone,depth-1,alpha,beta,true);
      minEval=Math.min(minEval,minEvalScore);
      beta=Math.min(beta,minEvalScore);
      if(beta <= alpha) break;

    }
    return minEval;
  }
  }



function pickBestMove(chess:Chess,depth:number){
  const moves = chess.moves({verbose:true});
  let bestScore= -Infinity;
  let bestMoves :typeof moves = [];
  for(const move of moves){
    const clone = new Chess(chess.fen());
    clone.move(move);
    const score = minMax(clone,depth,-Infinity,Infinity,false);
    if(score > bestScore){
      bestScore=score;
      bestMoves=[move];
    }
    else if(score === bestScore){
      bestMoves.push(move);
    }
  }
  return bestMoves.length > 0 ?
      (bestMoves[Math.floor(Math.random()*bestMoves.length)]) :
      (moves[Math.floor(Math.random()*moves.length)]);
}



