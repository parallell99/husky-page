import Navbar from "../Navbar";
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { User, RotateCcw } from "lucide-react";

function MemberPage() {
    const location = useLocation();
    const [showSavedPopup, setShowSavedPopup] = useState(false);
    const [userProfile, setUserProfile] = useState({
        name: "Moodeng ja",
        username: "moodeng",
        email: "",
        profileImage: null,
    });
    
    const [name, setName] = useState("John Doe");
    const [username, setUsername] = useState("johndoe");
    const [email, setEmail] = useState("john.doe@example.com");
    const [profileImage, setProfileImage] = useState("https://res.cloudinary.com/dcbpjtd1r/image/upload/v1728449784/my-blog-post/xgfy0xnvyemkklcqodkg.jpg");

    // Load user profile from localStorage
    useEffect(() => {
        const storedProfile = localStorage.getItem("user_profile");
        if (storedProfile) {
            try {
                const profile = JSON.parse(storedProfile);
                setUserProfile({
                    name: profile.name || "Moodeng ja",
                    username: profile.username || "moodeng",
                    email: profile.email || "",
                    profileImage: profile.profileImage || null,
                });
                // Update form fields if profile exists
                if (profile.name) setName(profile.name);
                if (profile.username) setUsername(profile.username);
                if (profile.email) setEmail(profile.email);
                if (profile.profileImage) setProfileImage(profile.profileImage);
            } catch (error) {
                console.error("Error loading profile:", error);
            }
        }
    }, []);

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


    const getUserDisplayName = () => {
        return userProfile?.name || "Moodeng ja";
    };

    const getUserAvatar = () => {
        return userProfile?.profileImage || profileImage;
    };

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-brown-200 pt-15 pb-10 px-4 lg:pt-25">
                <div className="max-w-md mx-auto">
                   

                    {/* User Profile Header Section */}

                    <div className="bg-white w-full p-4 mb-6 shadow-sm rounded-xl">
                         {/* Tab Navigation */}
                    <div className="flex gap-6 items-center mb-6 pt-4">
                        <Link
                            to="/member"
                            className={`flex items-center gap-2 text-sm font-semibold transition-colors ${
                                location.pathname === "/member"
                                    ? "text-brown-600 border-b-2 border-brown-600 pb-1"
                                    : "text-brown-400 hover:text-brown-600"
                            }`}
                        >
                            <User size={16} />
                            <span>Profile</span>
                        </Link>
                        <Link
                            to="/member/reset-password"
                            className={`flex items-center gap-2 text-sm font-semibold transition-colors ${
                                location.pathname === "/member/reset-password"
                                    ? "text-brown-600 border-b-2 border-brown-600 pb-1"
                                    : "text-brown-400 hover:text-brown-600"
                            }`}
                        >
                            <RotateCcw size={16} />
                            <span>Reset password</span>
                        </Link>
                    </div>
                        <div className="flex items-center gap-4">
                            {/* User Avatar */}
                            {getUserAvatar() ? (
                                <img
                                    src={getUserAvatar()}
                                    alt="User"
                                    className="w-16 h-16 rounded-full object-cover border-2 border-brown-300"
                                />
                            ) : (
                                <div className="w-16 h-16 rounded-full bg-brown-200 border-2 border-brown-300 flex items-center justify-center">
                                    <User className="w-8 h-8 text-brown-600" />
                                </div>
                            )}
                            
                            {/* Username */}
                            <div className="flex-1">
                                <p className="text-base font-semibold text-brown-600">
                                    {getUserDisplayName()}
                                </p>
                            </div>
                            
                            {/* Profile Indicator */}
                            <div className="flex items-center gap-3">
                                <div className="h-6 w-px bg-brown-300"></div>
                                <p className="text-base font-bold text-brown-600">
                                    Profile
                                </p>
                            </div>
                        </div>
                    </div>

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
        </>
    );
}

export default MemberPage;
