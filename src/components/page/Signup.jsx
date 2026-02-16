import Navbar from "../Navbar";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import success from "../../assets/image/Frame_427321234.svg";
import { Eye, EyeOff } from "lucide-react";
import { apiClient } from "@/api/client";

function Signup() {
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({
        name: "",
        username: "",
        email: "",
        password: ""
    });
    const [signupSuccess, setSignupSuccess] = useState(false);
    const [emailConfirmationRequired, setEmailConfirmationRequired] = useState(false);
    const [loading, setLoading] = useState(false);
    const [submitError, setSubmitError] = useState("");

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleSignup = async (e) => {
        e.preventDefault();

        const newErrors = {
            name: "",
            username: "",
            email: "",
            password: ""
        };

        // Validate name
        if (name.trim() === "") {
            newErrors.name = "Name is required";
        }

        // Validate username
        if (username.trim() === "") {
            newErrors.username = "Username is required";
        } else if (username.length < 3) {
            newErrors.username = "Username must be at least 3 characters";
        }

        // Validate email
        if (email.trim() === "") {
            newErrors.email = "Email is required";
        } else if (!validateEmail(email)) {
            newErrors.email = "Email must be a valid email";
        }

        // Validate password
        if (password === "") {
            newErrors.password = "Password is required";
        } else if (password.length < 6) {
            newErrors.password = "Password must be at least 6 characters";
        }

        setErrors(newErrors);
        setSubmitError("");

        if (!newErrors.name && !newErrors.username && !newErrors.email && !newErrors.password) {
            setLoading(true);
            try {
                console.log("Attempting to register:", { email: email.trim(), username: username.trim() });
                const { data } = await apiClient.post("/auth/register", {
                    name: name.trim(),
                    username: username.trim(),
                    email: email.trim(),
                    password,
                });
                console.log("Registration successful:", data);
                
                // ถ้ามี access_token (email confirmation ปิด) ให้ login อัตโนมัติ
                if (data.access_token) {
                    localStorage.setItem("token", data.access_token);
                    localStorage.setItem("isLoggedIn", "true");
                    window.dispatchEvent(new Event("loginChange"));
                    console.log("Auto-logged in after registration");
                }
                
                setSignupSuccess(true);
                setEmailConfirmationRequired(data?.emailConfirmationRequired === true);
            } catch (err) {
                // console.error("Registration error:", err);
                // console.error("Error response:", err.response);
                // console.error("Error data:", err.response?.data);
                // console.error("Error message from server:", err.response?.data?.error);
                
                let message = "Registration failed. Please try again.";
                if (err.response?.data?.error) {
                    const errorText = err.response.data.error.toLowerCase();
                    if (errorText.includes("rate limit") || errorText.includes("rate_limit")) {
                        message = "Too many signup attempts. Please wait 30-60 minutes before trying again, or use a different email address.";
                    } else {
                        message = err.response.data.error;
                    }
                } else if (err.response?.status === 0 || err.code === "ERR_NETWORK" || err.message?.includes("Network Error")) {
                    message = "Cannot connect to server. Please check if the server is running and try again.";
                } else if (err.message) {
                    message = err.message;
                }
                console.error("Final error message to display:", message);
                setSubmitError(message);
            } finally {
                setLoading(false);
            }
        }
    }

    return (
        <>
            <Navbar />
            {signupSuccess ? (
                <div className="flex flex-col items-center justify-center mt-20 lg:mt-40">

                    <div className=" bg-brown-200 w-85 rounded-2xl p-5 py-10 flex justify-center items-center gap-5 flex-col lg:w-180 lg:p-20">
                        <img src={success} alt="success" className="w-20 h-20" />
                        <p className="text-xl font-semibold text-center pb-2">Registration success</p>
                        {emailConfirmationRequired && (
                            <p className="text-sm text-brown-600 text-center pb-4">Please check your email to confirm your account, then you can log in.</p>
                        )}
                        <div className="flex justify-center">
                            <button
                                onClick={() => {
                                    // Trigger event เพื่อให้ Navbar อัปเดตข้อมูล user
                                    window.dispatchEvent(new Event("loginChange"));
                                    navigate("/");
                                }}
                                className="w-30 bg-brown-600 rounded-3xl text-white text-sm font-medium py-2 px-6 flex items-center justify-center hover:bg-brown-700 transition-colors"
                            >
                                Continue
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center mt-20 lg:mt-40">
                    <div className=" bg-brown-200 w-85 rounded-2xl p-5 py-10 lg:w-180 lg:p-20">
                        <h1 className="text-3xl font-semibold text-center pb-5">Sign up</h1>
                        <form onSubmit={handleSignup} noValidate>
                            <div className="flex flex-col gap-2">
                                <label htmlFor="name" className="text-sm font-medium text-brown-400 ">Name</label>
                                <input
                                    type="text"
                                    placeholder="Full Name"
                                    className={`w-full p-2 rounded-md border text-xs bg-white ${errors.name ? 'border-red-500 text-red-500' : 'border-brown-300 text-brown-400'
                                        }`}
                                    value={name}
                                    onChange={(e) => {
                                        setName(e.target.value);
                                        if (errors.name) {
                                            setErrors({ ...errors, name: "" });
                                        }
                                    }}
                                />
                                {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                            </div>

                            <div className="flex flex-col gap-2 pt-5">
                                <label htmlFor="username" className="text-sm font-medium text-brown-400">Username</label>
                                <input
                                    type="text"
                                    placeholder="Username"
                                    className={`w-full p-2 rounded-md border text-xs bg-white ${errors.username ? 'border-red-500 text-red-500' : 'border-brown-300 text-brown-400'
                                        }`}
                                    value={username}
                                    onChange={(e) => {
                                        setUsername(e.target.value);
                                        if (errors.username) {
                                            setErrors({ ...errors, username: "" });
                                        }
                                    }}
                                />
                                {errors.username && <p className="text-xs text-red-500">{errors.username}</p>}
                            </div>

                            <div className="flex flex-col gap-2 pt-5">
                                <label htmlFor="email" className="text-sm font-medium text-brown-400">Email</label>
                                <input
                                    type="text"
                                    placeholder="Email"
                                    className={`w-full p-2 rounded-md border text-xs bg-white ${errors.email ? 'border-red-500 text-red-500' : 'border-brown-300 text-brown-400'
                                        }`}
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        if (errors.email) {
                                            setErrors({ ...errors, email: "" });
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
                                        className={`w-full p-2 pr-10 rounded-md border text-xs bg-white ${errors.password ? 'border-red-500 text-red-500' : 'border-brown-300 text-brown-400'
                                            }`}
                                        value={password}
                                        onChange={(e) => {
                                            setPassword(e.target.value);
                                            if (errors.password) {
                                                setErrors({ ...errors, password: "" });
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
                                    {loading ? "Signing up..." : "Sign up"}
                                </button>
                            </div>
                            <p className="text-xs text-center pt-5">
                                Already have an account? <Link to="/login" className="text-brown-500 underline text-xs font-semibold">Login</Link>
                            </p>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

export default Signup;