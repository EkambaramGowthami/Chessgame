import React,{ useEffect, useRef, useState } from "react"
import axios from "axios";
import { useRecoilState } from "recoil";
import { authUserAtom, signinAtom, userAtom } from "../Atoms/userAtom";
import { useNavigate } from "react-router-dom";
export const Signup = () => {
    const navigate=useNavigate();
    const [user,setUser] = useRecoilState(userAtom);
    const [AuthUser,setAuthUser] = useRecoilState(authUserAtom);
    const [login, setLogin] = useState(false);
    const [open,setOpen]=useState(true);
    const [signinuser,setSigninUser]=useRecoilState(signinAtom);
    const handleChange = (e : React.ChangeEvent<HTMLInputElement>)=>{
        const {name,value}=e.target;
        setUser(prev => ({
            ...prev,
            [name]:value,
        }));
        
    }
    useEffect(() => {
        axios.get("http://localhost:3000/test-auth", { withCredentials: true })
          .then((res) => console.log("Authenticated:", res.data))
          .catch((err) => console.error("Auth failed:", err.response?.data || err));
      }, []);
    const handleSigninChange = (e : React.ChangeEvent<HTMLInputElement>)=>{
        const {name,value}=e.target;
        setSigninUser(prev => ({
            ...prev,
            [name]:value,
        }));
    }



    const handleCreateAccount = async () => {
        try {
            const response = await axios.post("http://localhost:3000/signup", {
               username:user.username,
                email:user.email,
                password:user.password
            },
            {
                withCredentials:true,
            }
        );
            const userData=response.data.user;

            setUser({username: "", email: "", password:""})
            setAuthUser(userData);
            navigate("/chessgame");

            console.log("your are signed up", response.data);
            setOpen(false);
            

        } catch (error) {
            console.log("signup failed", error.message);
        }


    }
    const handleLogin = async () => {
        try {
          const response = await axios.post(
            "http://localhost:3000/signin",
            {
              usernameOremail: signinuser.userOremail,
              password: signinuser.password,
            },
            {
              withCredentials: true,
            }
          );
          const userData = response.data.user;
      
          if (userData) {
            setAuthUser(userData);
            navigate("/chessgame");
            console.log("You are signed in", userData);
          }
      
          setSigninUser({ userOremail: "", password: "" });
          setLogin(false);
        } catch (error: any) {
          console.log("Signin failed", error.response?.data || error.message || error);
        }
      };
      
    return (
        <div className="w-screen h-screen bg-[#080808] flex flex-col justify-center items-center">
            {login === true ? 
                (<div className="w-96 rounded-xl bg-[#0E0E10] shadow-2xl text-white p-6 space-y-1 font-light">
                    <h1 className="text-4xl font-normal text-center text-[#367c2b]">Sign in</h1>
                    <label className="text-md ">Username or Email:</label>
                    <input type="text" placeholder="Username Or Email" name="userOremail" value={signinuser.userOremail} onChange={handleSigninChange} className="px-12 py-2 rounded-lg text-black" />
                    <label className="text-md ">Password:</label>
                    <input type="password" placeholder="password" name="password" value={signinuser.password} onChange={handleSigninChange} className="px-12 py-2 rounded-lg text-black" />
                    <label className="text-[#0E0E10]">click here to signin</label>
                    <button className="w-full py-2 mt-4 bg-[#367c2b] rounded-lg text-white" onClick={handleLogin}>Sign in</button>

                        
                </div>)
            :
                (<div className="w-96 rounded-xl bg-[#0E0E10] shadow-2xl text-white p-6 space-y-1 font-light">
                    <h1 className="text-4xl font-normal text-center text-[#367c2b]">Sign up</h1>
                    <label className="text-md ">Username:</label>
                    <input type="text" placeholder="Username" name="username" value={user.username} onChange={handleChange} className="px-12 py-2 rounded-lg text-black" />
                    <label className="text-md ">Email:</label>
                    <input type="text" placeholder="Email" name="email" value={user.email} onChange={handleChange} className="px-12 py-2 rounded-lg text-black" />
                    <label className="text-md ">Password:</label>
                    <input type="password" placeholder="Password" name="password" value={user.password} onChange={handleChange} className="px-12 py-2 rounded-lg text-black" />
                    <label className="text-[#0E0E10]">click here to signup</label>
                    <button className="w-full py-2 mt-4 bg-[#367c2b] rounded-lg text-white" onClick={handleCreateAccount}>Sign up</button>
                    <p className="text-center py-2"><span>Already have an account? </span><span className="text-blue-500" onClick={()=>setLogin(true)}>Signin</span></p>
                    <p className="text-center">Or</p>
                    <div className="w-full py-2 flex justify-center items-center rounded-2xl shadow-3xl hover:bg-[#353839]" onClick={() => { window.location.href="http://localhost:3000/auth/google";}}>
                        <span><img src="/symbol/7123025_logo_google_g_icon.png" className="w-10 h-10"/></span>
                        <span>Continue with Google</span>

                    </div>




                </div>
                
                
                )}

        </div>
        



    )
}






