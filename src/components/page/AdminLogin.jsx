import Navbar from "../Navbar";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { apiClient } from "@/api/client";

function AdminLogin() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [submitError, setSubmitError] = useState("");
    const [errors, setErrors] = useState({
        email: "",
        password: ""
    });

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        const newErrors = { email: "", password: "" };
        if (email.trim() === "") newErrors.email = "Email is required";
        else if (!validateEmail(email)) newErrors.email = "Email must be a valid email";
        if (password === "") newErrors.password = "Password is required";
        setErrors(newErrors);
        setSubmitError("");

        if (newErrors.email || newErrors.password) return;

        setLoading(true);
        try {
            const { data } = await apiClient.post("/auth/login", {
                email: email.trim(),
                password,
            });
            if (!data.access_token) {
                setSubmitError("Login successful but no token received. Please try again.");
                setLoading(false);
                return;
            }
            localStorage.setItem("token", data.access_token);
            localStorage.setItem("isLoggedIn", "true");

            const userRes = await apiClient.get("/auth/get-user");
            const role = userRes.data?.role;
            if (role !== "admin") {
                localStorage.removeItem("token");
                localStorage.removeItem("isLoggedIn");
                window.dispatchEvent(new Event("loginChange"));
                setSubmitError("Only administrators can log in here.");
                setLoading(false);
                return;
            }

            window.dispatchEvent(new Event("loginChange"));
            navigate("/dashboard", { replace: true });
        } catch (err) {
            const msg = err.response?.data?.error || err.message || "Login failed. Please try again.";
            setSubmitError(msg);
        } finally {
            setLoading(false);
        }
    };

    

    return (
        <>
            <Navbar />
            <div className="flex flex-col items-center justify-center mt-20 lg:mt-40">
                <div className=" bg-brown-200 w-85 rounded-2xl p-5 py-10 lg:w-180 lg:p-20">
                    <h3 className="text-center text-[#F2B68C]">Admin Login</h3>
                    <h1 className="text-3xl font-semibold text-center pb-5">Login</h1>
                    {submitError && (
                        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">{submitError}</p>
                    )}
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
                            <button type="submit" disabled={loading} className="w-30 bg-brown-600 rounded-3xl text-white text-sm font-medium py-2 mt-6 disabled:opacity-60 flex items-center justify-center gap-2">
                                {loading ? <Loader2 className="animate-spin" size={18} /> : null}
                                {loading ? "Logging in..." : "Log in"}
                            </button>
                        </div>
                    </form>
                    
                </div>
                
            </div>

        </>
    );
}

export default AdminLogin;