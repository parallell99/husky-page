import Navbar from "../Navbar";
import { useState } from "react";




function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    

    
    const handleLogin = (e) => {
        e.preventDefault();
        console.log(email, password);
   
    }

    

    return (
        <>
            <Navbar />
            <div className="flex flex-col items-center justify-center mt-20">
                <div className=" bg-brown-200 w-80 rounded-2xl p-5">
                    <h1 className="text-3xl font-semibold text-center pb-5">Login</h1>
                    <form onSubmit={handleLogin}>
                        <div className="flex flex-col gap-2">
                            <label htmlFor="email" className="text-sm font-medium text-brown-400 ">Email</label>
                            <input type="email" placeholder="Email" className="w-full p-2 rounded-md border border-brown-300 text-xs text-brown-400 " value={email} onChange={(e) => setEmail(e.target.value)} />
                            
                        </div>
                        <div className="flex flex-col gap-2">
                            <label htmlFor="password" className="text-sm font-medium text-brown-400 pt-5">Password</label>
                            <input type="password" placeholder="Password" className="w-full p-2 rounded-md border border-brown-300 text-xs text-brown-400" value={password} onChange={(e) => setPassword(e.target.value)} />
                           
                        </div>
                        <div className="flex justify-center">
                            <button type="submit" className="w-30 bg-brown-500 rounded-xl text-white text-sm font-medium py-2 mt-6">Log up</button>
                        </div>
                    </form>
                    <p className="text-xs text-center pt-5">Don’t have any account? <span className="text-brown-500 underline text-xs">Sign up</span></p>
                </div>
                
            </div>

        </>
    );
}

export default Login;