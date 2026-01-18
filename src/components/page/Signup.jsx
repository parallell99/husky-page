import Navbar from "../Navbar";
import { Link } from "react-router-dom";
import { useState } from "react";
import success from "../../assets/image/Frame_427321234.svg";
function Signup() {
    const [name, setName] = useState("");
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState({
        name: "",
        username: "",
        email: "",
        password: ""
    });
    const [signupSuccess, setSignupSuccess] = useState(false);

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleSignup = (e) => {
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

        // If no errors, proceed with signup
        if (!newErrors.name && !newErrors.username && !newErrors.email && !newErrors.password) {
            console.log(name, username, email, password);
            // Here you would typically send the data to your backend
            setSignupSuccess(true);
        }
    }

    return (
        <>
            <Navbar />
            {signupSuccess ? (
                <div className="flex flex-col items-center justify-center mt-20 lg:mt-40">

                    <div className=" bg-brown-200 w-85 rounded-2xl p-5 py-10 flex justify-center items-center gap-5 flex-col lg:w-180 lg:p-20">
                        <img src={success} alt="success" className="w-20 h-20" />
                        <p className="text-xl font-semibold text-center pb-5">Registration success</p>
                        <div className="flex justify-center">
                            <button className="w-30 bg-brown-600 rounded-3xl text-white text-sm font-medium py-2 ">Continue</button>
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
                                <input
                                    type="password"
                                    placeholder="Password"
                                    className={`w-full p-2 rounded-md border text-xs bg-white ${errors.password ? 'border-red-500 text-red-500' : 'border-brown-300 text-brown-400'
                                        }`}
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        if (errors.password) {
                                            setErrors({ ...errors, password: "" });
                                        }
                                    }}
                                />
                                {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
                            </div>

                            <div className="flex justify-center">
                                <button type="submit" className="w-30 bg-brown-600 rounded-3xl text-white text-sm font-medium py-2 mt-6">Sign up</button>
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