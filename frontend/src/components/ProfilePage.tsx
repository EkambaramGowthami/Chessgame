import { useSetRecoilState } from "recoil";
import { Profile } from "../symbols/Profile";
import { useEffect, useState } from "react";
import axios from "axios";
import { userAtom } from "../Atoms/userAtom";

const axiosInstance = axios.create({
  baseURL: "https://chessgame-backend-428c.onrender.com",
  withCredentials: true,
});

type User = {
  username: string;
  email: string;
  password: string;
};

const EMPTY_USER: User = {
  username: "",
  email: "",
  password: "",
};

export const ProfilePage = () => {
  const [user, setUser] = useState<User>(EMPTY_USER);
  const setAuthUser = useSetRecoilState(userAtom); 
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    axiosInstance.get("/api/profile")
      .then((res) => {
        const userData = (res as any).data.user as User;
        setUser(userData);
        setAuthUser(userData);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching profile:", err);
        setError("Failed to load profile. Please log in.");
        setAuthUser(EMPTY_USER);
        setLoading(false);
      });
  }, []);

  return (
    <div className="relative w-full bg-[#0d0d0d] text-white rounded-xl p-6 pt-12 shadow-3xl border border-[#1a1a1a] min-w-[12rem]">
      <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 z-20">
        <div className="rounded-full border-4 border-[#1f1f1f] p-1 bg-[#080808]">
          <Profile w="80" h="80" />
        </div>
      </div>

      <div className="text-center mt-6">
        {loading ? (
          <p className="text-blue-400 text-md mt-2">Loading profile...</p>
        ) : error ? (
          <p className="text-red-400 text-md mt-2">{error}</p>
        ) : user ? (
          <>
            <h2 className="text-xl font-bold text-[#3ddc84]">{user.username}</h2>
            <p className="text-sm text-gray-400">{user.email}</p>
          </>
        ) : (
          <p className="text-red-400 text-md mt-2">No user data available.</p>
        )}
      </div>
    </div>
  );
};
