import { useEffect } from "react";
import { useNavigate } from "react-router-dom"

export const OAuthSuccess = () =>{
    const navigate = useNavigate();
    useEffect(()=>{
        const params = new URLSearchParams(window.location.search);
        const token = params.get("token");
        // if(token){
        //     localStorage.setItem("authToken",token);
        //     navigate("/Chessgame");
        // }
        // else{
        //     navigate("/dashboard");
        // }
        navigate("/chessgame");
    },[]);
    return <div className="text-center text-2xl font-medium justify-center items-center">Loading......</div>
}