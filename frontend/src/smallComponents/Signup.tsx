import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRecoilState } from "recoil";
import { signinAtom, userAtom, authUserAtom } from "../Atoms/userAtom";
import { useNavigate } from "react-router-dom";
interface user_Type {
    username:string,
    email:string,
    password:string
}
type SignupResponse = {
  user: user_Type;
};
export const Signup = () => {
  const navigate = useNavigate();
  const [user, setUser] = useRecoilState(userAtom);
  const [signinUser, setSigninUser] = useRecoilState(signinAtom);
  const [, setAuthUser] = useRecoilState(authUserAtom); // nullable

  const [login, setLogin] = useState(false);

 const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const { name, value } = e.target;
  if (!user) return;
  setUser({
    ...user,
    [name]: value,
  });
};

  useEffect(() => {
    axios
      .get("https://chessgame-backend-428c.onrender.com/test-auth", { withCredentials: true })
      .then((res) => console.log("Authenticated:", res.data))
      .catch((err) =>
        console.error("Auth failed:", (err as any).response?.data || err)
      );
  }, []);

 
const handleSigninChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const { name, value } = e.target;
  if (!signinUser) return;
  setSigninUser({
    ...signinUser,
    [name]: value,
  });
};


 const handleCreateAccount = async () => {
  try {
    if (!user) return;
    const response = await axios.post<SignupResponse>(
      "https://chessgame-backend-428c.onrender.com/signup",
      {
        username: user.username,
        email: user.email,
        password: user.password,
      },
      {
        withCredentials: true,
      }
    );
    setAuthUser(response.data.user); 
    setUser({ username: "", email: "", password: "" });
    navigate("/chessgame");
    console.log("You are signed up", response.data);
  } catch (error) {
    const err = error as any;
    console.log("Signup failed", err.response?.data || err.message);
  }
};
  const handleLogin = async () => {
    try {
      const response = await axios.post(
        "https://chessgame-backend-428c.onrender.com/signin",
        {
          usernameOremail: signinUser.userOremail,
          password: signinUser.password,
        },
        {
          withCredentials: true,
        }
      );
      const userData = (response.data as any).user;
      setAuthUser(userData);
      if (userData) {
        navigate("/chessgame");
        console.log("You are signed in", userData);
      }
      setSigninUser({ userOremail: "", password: "" });
      setLogin(false);
    } catch (error) {
      const err = error as any;
      console.log("Signin failed", err.response?.data || err.message);
    }
  };

  return (
    <div className="w-screen h-screen bg-[#080808] flex flex-col justify-center items-center">
      {login ? (
        <div className="w-96 rounded-xl bg-[#0E0E10] shadow-2xl text-white p-6 space-y-1 font-light">
          <h1 className="text-4xl font-normal text-center text-[#367c2b]">
            Sign in
          </h1>
          <label className="text-md">Username or Email:</label>
          <input
            type="text"
            placeholder="Username Or Email"
            name="userOremail"
            value={signinUser.userOremail}
            onChange={handleSigninChange}
            className="px-12 py-2 rounded-lg text-black"
          />
          <label className="text-md">Password:</label>
          <input
            type="password"
            placeholder="Password"
            name="password"
            value={signinUser.password}
            onChange={handleSigninChange}
            className="px-12 py-2 rounded-lg text-black"
          />
          <button
            className="w-full py-2 mt-4 bg-[#367c2b] rounded-lg text-white"
            onClick={handleLogin}
          >
            Sign in
          </button>
        </div>
      ) : (
        <div className="w-96 rounded-xl bg-[#0E0E10] shadow-2xl text-white p-6 space-y-1 font-light">
          <h1 className="text-4xl font-normal text-center text-[#367c2b]">
            Sign up
          </h1>
          <label className="text-md">Username:</label>
          <input
            type="text"
            placeholder="Username"
            name="username"
            value={user.username}
            onChange={handleChange}
            className="px-12 py-2 rounded-lg text-black"
          />
          <label className="text-md">Email:</label>
          <input
            type="text"
            placeholder="Email"
            name="email"
            value={user.email}
            onChange={handleChange}
            className="px-12 py-2 rounded-lg text-black"
          />
          <label className="text-md">Password:</label>
          <input
            type="password"
            placeholder="Password"
            name="password"
            value={user.password}
            onChange={handleChange}
            className="px-12 py-2 rounded-lg text-black"
          />
          <button
            className="w-full py-2 mt-4 bg-[#367c2b] rounded-lg text-white"
            onClick={handleCreateAccount}
          >
            Sign up
          </button>
          <p className="text-center py-2">
            <span>Already have an account? </span>
            <span className="text-blue-500 cursor-pointer" onClick={() => setLogin(true)}>
              Signin
            </span>
          </p>
          <p className="text-center">Or</p>
          <div
            className="w-full py-2 flex justify-center items-center rounded-2xl shadow-3xl hover:bg-[#353839] cursor-pointer"
            onClick={() => {
              window.location.href = "https://chessgame-backend-3y0j.onrender.com/auth/google";
            }}
          >
            <span>
              <img src="/symbol/7123025_logo_google_g_icon.png" className="w-10 h-10" />
            </span>
            <span className="ml-2">Continue with Google</span>
          </div>
        </div>
      )}
    </div>
  );
};
