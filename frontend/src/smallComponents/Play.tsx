import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Boxes } from "../components/ui/background-boxes";
import { SmallPawn } from "../symbols/SmallPawn";
import { Computer } from "../symbols/Computer";

export const Play = () => {
  const navigate = useNavigate();
  const [computerLevel, setComputerLevel] = useState<"selecting" | null>(null);

  const startGameWithComputer = (level: string) => {
    navigate(`/chessgame/start?level=${level}`);
  };

  const handlePlayWithFriend = () => {
    navigate("/chessgame/start/friend");
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black flex flex-col items-center justify-center">
      <div className="absolute inset-0 w-full h-full bg-slate-900 z-10 opacity-40 [mask-image:radial-gradient(ellipse at center, white, transparent)] pointer-events-none" />
      <Boxes />

      {computerLevel === "selecting" ? (
        <div className="flex flex-col justify-center items-center space-y-4 p-6 relative z-20">
          <div className="text-3xl font-semibold text-white">Options</div>
          <button
            className="text-white p-3 rounded bg-gray-700 w-96 bg-[#6B403C] bg-opacity-20 hover:bg-opacity-70 transform hover:-translate-y-2"
            onClick={() => startGameWithComputer("newbie")}
          >
            New to Chess
          </button>
          <button
            className="text-white p-3 rounded bg-gray-700 w-96 bg-[#6B403C] bg-opacity-20 hover:bg-opacity-70 transform hover:-translate-y-2"
            onClick={() => startGameWithComputer("beginner")}
          >
            Beginner
          </button>
          <button
            className="text-white p-3 rounded bg-gray-700 w-96 bg-[#6B403C] bg-opacity-20 hover:bg-opacity-70 transform hover:-translate-y-2"
            onClick={() => startGameWithComputer("advanced")}
          >
            Advanced
          </button>
        </div>
      ) : (
        <div className="flex flex-col justify-center items-center space-y-6 relative z-20">
          <div className="p-6 rounded-xl text-center shadow-lg">
            <button className="text-white text-lg font-medium bg-gradient-to-r from-[#06923E] to-[#78C841] px-10 py-2 rounded-xl shadow-md hover:shadow-emerald-500/50 transition-all duration-300 hover:-translate-y-1">
              Get Started
            </button>
          </div>

          <div
            className="ml-12 text-white font-medium text-xl bg-[#31572c] bg-opacity-30 rounded-xl flex justify-center items-center w-[380px] hover:bg-opacity-70 shadow-lg hover:shadow-[#31572c] transform hover:-translate-y-4 cursor-pointer"
            onClick={handlePlayWithFriend}
          >
            <div className="mr-4">
              <SmallPawn />
            </div>
            <div>Play with Friends</div>
          </div>

          <div
            className="text-white font-medium text-xl bg-[#403d39] bg-opacity-30 rounded-xl flex justify-center items-center w-[380px] hover:bg-opacity-70 shadow-lg hover:shadow-[#403d39] ml-12 transform hover:-translate-y-4 cursor-pointer"
            onClick={() => setComputerLevel("selecting")}
          >
            <div className="mr-4">
              <Computer />
            </div>
            <div>Play with Computer</div>
          </div>
        </div>
      )}
    </div>
  );
};
