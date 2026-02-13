import Navbar from "../Navbar";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { apiClient } from "@/api/client";

function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({
        email: "",
        password: ""
    });
    const [loading, setLoading] = useState(false);
    const [submitError, setSubmitError] = useState("");

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };
    
    const handleLogin = async (e) => {
        e.preventDefault();
        const newErrors = { email: "", password: "" };

        if (email.trim() === "") {
            newErrors.email = "Email is required";
        } else if (!validateEmail(email)) {
            newErrors.email = "Email must be a valid email";
        }
        if (password === "") {
            newErrors.password = "Password is required";
        }

        setErrors(newErrors);
        setSubmitError("");

        if (!newErrors.email && !newErrors.password) {
            setLoading(true);
            try {
                console.log("Attempting to login:", { email: email.trim() });
                const { data } = await apiClient.post("/auth/login", {
                    email: email.trim(),
                    password,
                });
                console.log("Login successful:", data);
                
                if (data.access_token) {
                    localStorage.setItem("token", data.access_token);
                    localStorage.setItem("isLoggedIn", "true");
                    console.log("Token saved to localStorage:", localStorage.getItem("token") ? "Yes" : "No");
                    window.dispatchEvent(new Event("loginChange"));
                    console.log("Navigating to home page...");
                    navigate("/");
                } else {
                    console.error("No access_token in response:", data);
                    setSubmitError("Login successful but no token received. Please try again.");
                }
            } catch (err) {
                console.error("Login error:", err);
                console.error("Error response:", err.response);
                console.error("Error data:", err.response?.data);
                
                let message = "Login failed. Please try again.";
                if (err.response?.data?.error) {
                    message = err.response.data.error;
                } else if (err.response?.status === 0 || err.code === "ERR_NETWORK" || err.message?.includes("Network Error")) {
                    message = "Cannot connect to server. Please check if the server is running and try again.";
                } else if (err.message) {
                    message = err.message;
                }
                setSubmitError(message);
            } finally {
                setLoading(false);
            }
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
                        {submitError && (
                            <p className="text-xs text-red-500 text-center mt-4">{submitError}</p>
                        )}
                        <div className="flex justify-center">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-30 bg-brown-600 rounded-3xl text-white text-sm font-medium py-2 mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? "Logging in..." : "Log in"}
                            </button>
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