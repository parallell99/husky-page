import Navbar from "../Navbar";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

function MemberPage() {
    const [activeTab, setActiveTab] = useState("profile"); // "profile" or "resetPassword"
    const [showSavedPopup, setShowSavedPopup] = useState(false);
    const [showConfirmPopup, setShowConfirmPopup] = useState(false);
    
    const [name, setName] = useState("John Doe");
    const [username, setUsername] = useState("johndoe");
    const [email, setEmail] = useState("john.doe@example.com");
    const [profileImage, setProfileImage] = useState("https://res.cloudinary.com/dcbpjtd1r/image/upload/v1728449784/my-blog-post/xgfy0xnvyemkklcqodkg.jpg");
    
    // Reset Password states
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordErrors, setPasswordErrors] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = (e) => {
        e.preventDefault();
        // Handle save logic here
        console.log("Saving profile:", { name, username, email });
        
        // Show saved popup
        setShowSavedPopup(true);
        
        // Hide popup after 2 seconds
        setTimeout(() => {
            setShowSavedPopup(false);
        }, 2000);
    };

    const handleResetPassword = (e) => {
        e.preventDefault();
        
        const newErrors = {
            currentPassword: "",
            newPassword: "",
            confirmPassword: ""
        };

        // Validate current password
        if (currentPassword.trim() === "") {
            newErrors.currentPassword = "Current password is required";
        }

        // Validate new password
        if (newPassword.trim() === "") {
            newErrors.newPassword = "New password is required";
        } else if (newPassword.length < 6) {
            newErrors.newPassword = "Password must be at least 6 characters";
        }

        // Validate confirm password
        if (confirmPassword.trim() === "") {
            newErrors.confirmPassword = "Please confirm your password";
        } else if (newPassword !== confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
        }

        setPasswordErrors(newErrors);

        // If no errors, show confirmation popup
        if (!newErrors.currentPassword && !newErrors.newPassword && !newErrors.confirmPassword) {
            setShowConfirmPopup(true);
        }
    };

    const handleConfirmResetPassword = () => {
        // Handle password reset logic here
        console.log("Resetting password");
        
        // Clear form
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        
        // Close confirmation popup
        setShowConfirmPopup(false);
        
        // Show saved popup
        setShowSavedPopup(true);
        setTimeout(() => {
            setShowSavedPopup(false);
        }, 2000);
    };

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-brown-200 pt-20 pb-10 px-4">
                <div className="flex gap-10 items-start justify-start mb-8 px-4 pt-5 ">
                    <h1 
                        onClick={() => setActiveTab("profile")}
                        className={`text-sm font-semibold cursor-pointer transition-colors ${
                            activeTab === "profile" 
                                ? "text-brown-600 border-b-2 border-brown-600 pb-1" 
                                : "text-brown-400 hover:text-brown-600"
                        }`}
                    >
                        👤 Profile
                    </h1>
                    <h1 
                        onClick={() => setActiveTab("resetPassword")}
                        className={`text-sm font-semibold cursor-pointer transition-colors ${
                            activeTab === "resetPassword" 
                                ? "text-brown-600 border-b-2 border-brown-600 pb-1" 
                                : "text-brown-400 hover:text-brown-600"
                        }`}
                    >
                        ↻ Reset Password
                    </h1>
                </div>
                <div className="max-w-md mx-auto">
                
                    {/* Profile Section */}
                    {activeTab === "profile" && (
                    <div className="mb-8">
                        
                        
                        {/* Profile Picture Section */}
                        <div className="flex flex-col items-center mb-8 pt-2">
                        <div className="relative mb-4">
                            <img
                                src={profileImage}
                                alt="Profile"
                                className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-md"
                            />
                        </div>
                        <label className="cursor-pointer">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                            />
                            <div className="text-sm text-brown-600 hover:text-brown-700 bg-white border border-brown-300 rounded-3xl px-4 py-2 font-medium">
                                Upload profile picture
                            </div>
                        </label>
                    </div>

                    {/* Form Section */}
                    <form onSubmit={handleSave} className="space-y-6">
                        {/* Name Field */}
                        <div className="flex flex-col gap-2">
                            <label htmlFor="name" className="text-sm font-medium text-brown-600">
                                Name
                            </label>
                            <input
                                type="text"
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full p-3 rounded-xl border border-brown-300 bg-white text-brown-600 text-sm focus:outline-none focus:ring-2 focus:ring-brown-400 focus:border-transparent transition-all"
                                placeholder="Enter your name"
                            />
                        </div>

                        {/* Username Field */}
                        <div className="flex flex-col gap-2">
                            <label htmlFor="username" className="text-sm font-medium text-brown-600">
                                Username
                            </label>
                            <input
                                type="text"
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full p-3 rounded-xl border border-brown-300 bg-white text-brown-600 text-sm focus:outline-none focus:ring-2 focus:ring-brown-400 focus:border-transparent transition-all"
                                placeholder="Enter your username"
                            />
                        </div>

                        {/* Email Field (Readonly) */}
                        <div className="flex flex-col gap-2">
                            <label htmlFor="email" className="text-sm font-medium text-brown-600">
                                Email
                            </label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                readOnly
                                disabled
                                className="w-full p-3 rounded-xl border border-brown-300 bg-brown-200 text-brown-400 text-sm cursor-not-allowed"
                                placeholder="your.email@example.com"
                            />
                        </div>

                        {/* Save Button */}
                        <button
                            type="submit"
                            className="w-full bg-brown-600 hover:bg-brown-700 text-white font-medium py-3 px-6 rounded-full text-sm transition-colors shadow-md mt-8"
                        >
                            Save
                        </button>
                    </form>
                    </div>
                    )}

                    {/* Reset Password Section */}
                    {activeTab === "resetPassword" && (
                    <div className="mb-8">
                        
                        <form onSubmit={handleResetPassword} className="space-y-6">
                            {/* Current Password Field */}
                            <div className="flex flex-col gap-2">
                                <label htmlFor="currentPassword" className="text-sm font-medium text-brown-600">
                                    Current Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showCurrentPassword ? "text" : "password"}
                                        id="currentPassword"
                                        value={currentPassword}
                                        onChange={(e) => {
                                            setCurrentPassword(e.target.value);
                                            if (passwordErrors.currentPassword) {
                                                setPasswordErrors({...passwordErrors, currentPassword: ""});
                                            }
                                        }}
                                        className={`w-full p-3 pr-10 rounded-xl border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brown-400 focus:border-transparent transition-all ${
                                            passwordErrors.currentPassword ? 'border-red-500 text-red-500' : 'border-brown-300 text-brown-600'
                                        }`}
                                        placeholder="Enter current password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-brown-400 hover:text-brown-600"
                                    >
                                        {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                {passwordErrors.currentPassword && (
                                    <p className="text-xs text-red-500">{passwordErrors.currentPassword}</p>
                                )}
                            </div>

                            {/* New Password Field */}
                            <div className="flex flex-col gap-2">
                                <label htmlFor="newPassword" className="text-sm font-medium text-brown-600">
                                    New Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showNewPassword ? "text" : "password"}
                                        id="newPassword"
                                        value={newPassword}
                                        onChange={(e) => {
                                            setNewPassword(e.target.value);
                                            if (passwordErrors.newPassword) {
                                                setPasswordErrors({...passwordErrors, newPassword: ""});
                                            }
                                        }}
                                        className={`w-full p-3 pr-10 rounded-xl border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brown-400 focus:border-transparent transition-all ${
                                            passwordErrors.newPassword ? 'border-red-500 text-red-500' : 'border-brown-300 text-brown-600'
                                        }`}
                                        placeholder="Enter new password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-brown-400 hover:text-brown-600"
                                    >
                                        {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                {passwordErrors.newPassword && (
                                    <p className="text-xs text-red-500">{passwordErrors.newPassword}</p>
                                )}
                            </div>

                            {/* Confirm Password Field */}
                            <div className="flex flex-col gap-2">
                                <label htmlFor="confirmPassword" className="text-sm font-medium text-brown-600">
                                    Confirm New Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        id="confirmPassword"
                                        value={confirmPassword}
                                        onChange={(e) => {
                                            setConfirmPassword(e.target.value);
                                            if (passwordErrors.confirmPassword) {
                                                setPasswordErrors({...passwordErrors, confirmPassword: ""});
                                            }
                                        }}
                                        className={`w-full p-3 pr-10 rounded-xl border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brown-400 focus:border-transparent transition-all ${
                                            passwordErrors.confirmPassword ? 'border-red-500 text-red-500' : 'border-brown-300 text-brown-600'
                                        }`}
                                        placeholder="Confirm new password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-brown-400 hover:text-brown-600"
                                    >
                                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                {passwordErrors.confirmPassword && (
                                    <p className="text-xs text-red-500">{passwordErrors.confirmPassword}</p>
                                )}
                            </div>

                            {/* Reset Password Button */}
                            <button
                                type="submit"
                                className="w-full bg-brown-600 hover:bg-brown-700 text-white font-medium py-3 px-6 rounded-full text-sm transition-colors shadow-md mt-8"
                            >
                                Reset Password
                            </button>
                        </form>
                    </div>
                    )}
                </div>
            </div>

            {/* Saved Popup */}
            {showSavedPopup && (
                <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
                    <div className="bg-brown-600 text-white text-center px-6 py-3 rounded-full shadow-lg pointer-events-auto transform transition-all duration-300 ease-in-out animate-bounce">
                        <p className="text-sm font-medium">Saved</p>
                        <p className="text-xs">Your changes have been saved.</p>
                    </div>
                </div>
            )}

            {/* Confirm Reset Password Popup */}
            {showConfirmPopup && (
                <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
                    <div className="bg-white rounded-2xl p-6 max-w-sm w-[90%] shadow-lg pointer-events-auto">
                        <h3 className="text-lg font-semibold text-brown-600 mb-4 text-center">Confirm</h3>
                        <p className="text-sm text-brown-500 mb-6 text-center">
                            Are you sure you want to reset your password?
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowConfirmPopup(false)}
                                className="flex-1 bg-white border border-brown-300 text-brown-600 px-4 py-2 rounded-full text-sm font-medium hover:bg-brown-100 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmResetPassword}
                                className="flex-1 bg-brown-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-brown-700 transition-colors"
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default MemberPage;
