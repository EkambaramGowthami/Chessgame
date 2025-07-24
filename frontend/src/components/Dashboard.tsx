import { Boxes } from "../components/ui/background-boxes";
import { useNavigate } from "react-router-dom";

import { Pawn } from "../symbols/Pawn";
import { useRef, useState } from "react";
import { Profile } from "../symbols/Profile";
import { useRecoilValue } from "recoil";

import { ProfilePage } from "./ProfilePage";
import { authUserAtom } from "../Atoms/userAtom";


export const Dashboard = () => {
    const navigate = useNavigate();
    const authUser = useRecoilValue(authUserAtom);
    const [profileClick, setProfileClick] = useState(false);
    const  secondPageRef = useRef<HTMLDivElement>(null);
     const handleSignup = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        navigate("/chessgame/signup");
    }
    const handleScrollSecondPage = () => {
        secondPageRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    
    return (
        <div className="bg-black text-white overflow-y-auto overflow-x-hidden">
            <div className="relative w-screen h-screen overflow-hidden bg-black flex flex-col items-center justify-center  ">

                <div className="absolute inset-0 w-full h-full bg-slate-900 z-10 opacity-40 [mask-image:radial-gradient(ellipse at center, white, transparent)] pointer-events-none" />

                <Boxes />

                <div className="flex justify-between items-center h-12 absolute top-0 left-0 w-full z-20   text-white font-normal text-sm">
                    <div className="w-fit font-sans text-lg tracking-wide font-medium bg-gradient-to-r from-green-600 via-lime-300 to-emerald-500 text-transparent bg-clip-text ml-4">
                        The8thRank
                    </div>
                    <nav className="flex justify-center items-center space-x-2 text-gray-500 mr-12 text-white">
                        {authUser ? (
                            <button className="bg-green-500 px-2 py-1 rounded-md text-sm" onClick={() => navigate("/chessgame")}>
                                Go to Game
                            </button>
                        ) : (
                            <button className="bg-green-500 px-2 py-1 rounded-md text-sm" onClick={handleSignup}>
                                Sign Up
                            </button>
                        )}
                        <div onClick={() => setProfileClick(!profileClick)}><Profile w="w-8" h="8" /></div>
                        {authUser && profileClick && (
                            <div className="absolute right-4 top-20 w-48 h-48 text-white rounded-2xl shadow-lg z-50">
                                <ProfilePage />
                            </div>
                        )}
                    </nav>

                </div>
                


                <div className="relative z-20 flex justify-center items-center p-8  md:p-2  text-white">
                    <div><Pawn w="w-180 sm:w-64" h="h-180 sm:h-64" /></div>
                    <div className="flex flex-col justify-center mt-4 md:mt-0 md:ml-8">
                        <div className="text-4xl md:text-6xl font-semibold mb-2">Play Chess</div>
                        <div className="text-gray-200 font-medium space-x-2">
                            <span className="italic text-2xl">Fall</span><span className="text-[#367c2b] text-3xl italic font-semibold">SEVEN</span><span className="italic text-2xl">times</span>
                        </div>
                        <div className="text-gray-200 font-medium space-x-2 text-center  md:text-left">
                            <span className="italic text-2xl">Stand</span><span className="italic text-2xl" >up</span><span className="text-[#367c2b] text-3xl italic font-semibold">Eight</span>
                        </div>

                    </div>

                </div>
                <div className="relative z-20 text-lg p-2 mt-2 w-fit rounded-xl mb-2 hover:bg-slate-900 bg-opacity-50 " onClick={handleScrollSecondPage}>Want to explore the legends of chess?</div>
            </div>
           
            <div ref={secondPageRef} className="relative w-screen  min-h-screen bg-black flex flex-col p-12">
                <h1 className="relative text-4xl font-bold text-center text-[#367c2b] mb-12">Top Chess Players in the world</h1>
                {[
                    {
                        name: "Magnus Carlsen",
                        country: "Norway",
                        desc: "Magnus Carlsen, a Norwegian chess grandmaster, became world champion in 2013 and held the title for a decade...",
                        image: "/chessPlayers/magnus-carlsen-crossed-arms-j0qbaj79g4e25yqk.jpg",
                    },
                    {
                        name: "Hikaru Nakamura",
                        country: "United States",
                        desc: "Hikaru Nakamura is an American chess grandmaster known for his aggressive style and dominance...",
                        image: "/chessPlayers/hikaru.jpg",
                    },
                    {
                        name: "Fabiano Caruana",
                        country: "United States",
                        desc: "Fabiano Caruana is an American chess grandmaster who challenged Magnus Carlsen for the World Championship in 2018...",
                        image: "/chessPlayers/fanalo.jpeg",
                    },
                    {
                        name: "Praggnanandhaa Rameshbabu",
                        country: "India",
                        desc: "Praggnanandhaa Rameshbabu is an Indian chess grandmaster who became one of the youngest GMs...",
                        image: "/chessPlayers/prag.jpeg",
                    },
                    {
                        name: "Gukesh Dommaraju",
                        country: "India",
                        desc: "Gukesh Dommaraju is an Indian chess grandmaster who became the youngest-ever World Chess Champion...",
                        image: "/chessPlayers/Gukesh.jpeg",
                    },
                    {
                        name: "Arjun Erigaisi",
                        country: "India",
                        desc: "Arjun Erigaisi is an Indian chess grandmaster who became one of the youngest to cross the 2800 rating mark...",
                        image: "/chessPlayers/Arjun.jpg",
                    },
                    {
                        name: "Nodirbek Abdusattorov",
                        country: "Uzbekistan",
                        desc: "Nodirbek Abdusattorov is an Uzbek grandmaster who became the youngest World Rapid Champion...",
                        image: "/chessPlayers/Nodirbe.jpg",
                    },
                    {
                        name: "Alireza Firouzja",
                        country: "France",
                        desc: "Alireza Firouzja is a French grandmaster who became the youngest player to surpass a 2800 FIDE rating...",
                        image: "/chessPlayers/alibi.jpeg",
                    },
                ].map((player, idx) => (
                    <div
                        key={idx}
                        className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6"
                    >
                        <div className={`flex ${idx % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} w-full`}>
                            <img src={player.image} className="w-36 h-36 rounded object-cover" alt={player.name} />
                            <div className="mt-4 md:mt-0 md:ml-6 space-y-2 w-full md:w-3/4 text-center md:text-left">
                                <div className="space-x-2 flex justify-center md:justify-start items-center">
                                    <span className="bg-[#367c2b] px-2 py-1 rounded-md text-sm">GM</span>
                                    <span className="text-2xl font-semibold">{player.name}</span>
                                </div>
                                <div className="text-md text-gray-500">{player.country}</div>
                                <div className="text-gray-400 text-sm">{player.desc}</div>
                            </div>
                        </div>
                    </div>
                ))}
                <footer className="w-full text-center py-4 text-sm text-gray-400 border-t border-gray-700 mt-12">
                    <div className="text-center text-white text-sm py-6">
                        <p className="font-semibold">Lumigow</p>
                        <p className="italic text-gray-400">Light. Code. Create.</p>
                    </div>
                </footer>

            </div>
        </div>
    );
};
