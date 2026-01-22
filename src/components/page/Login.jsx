import Navbar from "../Navbar";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";



function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({
        email: "",
        password: ""
    });

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };
    
    const handleLogin = (e) => {
        e.preventDefault();
        
        const newErrors = {
            email: "",
            password: ""
        };

        // Validate email
        if (email.trim() === "") {
            newErrors.email = "Email is required";
        } else if (!validateEmail(email)) {
            newErrors.email = "Email must be a valid email";
        }

        // Validate password
        if (password === "") {
            newErrors.password = "Password is required";
        }

        setErrors(newErrors);

        // If no errors, proceed with login
        if (!newErrors.email && !newErrors.password) {
            console.log(email, password);
            // Here you would typically send the data to your backend
        }
    }

    

    return (
        <>
            <Navbar />
            <div className="flex flex-col items-center justify-center mt-20 lg:mt-40">
                <div className=" bg-brown-200 w-85 rounded-2xl p-5 py-10 lg:w-180 lg:p-20">
                    <h1 className="text-3xl font-semibold text-center pb-5">Login</h1>
                    <form onSubmit={handleLogin} noValidate>
                        <div className="flex flex-col gap-2">
                            <label htmlFor="email" className="text-sm font-medium text-brown-400 ">Email</label>
                            <input 
                                type="text" 
                                placeholder="Email" 
                                className={`w-full p-2 rounded-md border text-xs bg-white ${
                                    errors.email ? 'border-red-500 text-red-500' : 'border-brown-300 text-brown-400'
                                }`}
                                value={email} 
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    if (errors.email) {
                                        setErrors({...errors, email: ""});
                                    }
                                }} 
                            />
                            {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                        </div>
                        <div className="flex flex-col gap-2 pt-5">
                            <label htmlFor="password" className="text-sm font-medium text-brown-400">Password</label>
                            <div className="relative">
                                <input 
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Password" 
                                    className={`w-full p-2 pr-10 rounded-md border text-xs bg-white ${
                                        errors.password ? 'border-red-500 text-red-500' : 'border-brown-300 text-brown-400'
                                    }`}
                                    value={password} 
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        if (errors.password) {
                                            setErrors({...errors, password: ""});
                                        }
                                    }} 
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-brown-400 hover:text-brown-600"
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
                        </div>
                        <div className="flex justify-center">
                            <button type="submit" className="w-30 bg-brown-600 rounded-3xl text-white text-sm font-medium py-2 mt-6">Log up</button>
                        </div>
                    </form>
                    <p className="text-xs text-center pt-5">
                      Don’t have any account? <Link to="/signup" className="text-brown-500 underline text-xs font-semibold">Sign up</Link>
                    </p>
                </div>
                
            </div>

        </>
    );
}

export default Login;