import Navbar from "../Navbar";
import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff, User, RotateCcw, Loader2 } from "lucide-react";
import axios from "axios";
import { API_BASE_URL } from "@/api/client";

const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
};

function MemberResetPassword() {
    const location = useLocation();
    const navigate = useNavigate();
    const [showSavedPopup, setShowSavedPopup] = useState(false);
    const [showConfirmPopup, setShowConfirmPopup] = useState(false);
    const [userProfile, setUserProfile] = useState({
        name: "",
        username: "",
        email: "",
        profileImage: null,
    });
    const [profileLoading, setProfileLoading] = useState(true);
    const [resetLoading, setResetLoading] = useState(false);
    const [resetError, setResetError] = useState("");

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

    // โหลดข้อมูล user จริงจาก API
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            setProfileLoading(false);
            return;
        }
        axios
            .get(`${API_BASE_URL}/auth/get-user`, { headers: getAuthHeaders(), timeout: 5000 })
            .then((res) => {
                const u = res.data?.user ?? res.data;
                setUserProfile({
                    name: u?.name ?? "",
                    username: u?.username ?? "",
                    email: u?.email ?? "",
                    profileImage: u?.profilePic ?? u?.profile_pic ?? null,
                });
            })
            .catch(() => {
                const stored = localStorage.getItem("user_profile");
                if (stored) {
                    try {
                        const p = JSON.parse(stored);
                        setUserProfile({
                            name: p.name || "",
                            username: p.username || "",
                            email: p.email || "",
                            profileImage: p.profileImage ?? p.profile_pic ?? null,
                        });
                    } catch (_) {}
                }
            })
            .finally(() => setProfileLoading(false));
    }, []);

    const getUserDisplayName = () => {
        return userProfile?.name || userProfile?.username || "User";
    };

    const getUserAvatar = () => {
        return userProfile?.profileImage || null;
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

    const handleConfirmResetPassword = async () => {
        setResetLoading(true);
        setResetError("");
        try {
            await axios.put(
                `${API_BASE_URL}/auth/reset-password`,
                {
                    oldPassword: currentPassword,
                    newPassword: newPassword,
                },
                {
                    headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
                    timeout: 10000,
                }
            );
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            setShowConfirmPopup(false);
            setShowSavedPopup(true);
            setTimeout(() => setShowSavedPopup(false), 3000);
        } catch (err) {
            const msg = err.response?.data?.error || err.message || "Failed to reset password.";
            setResetError(msg);
            if (err.response?.status === 401) {
                setTimeout(() => {
                    setShowConfirmPopup(false);
                    navigate("/login");
                }, 1500);
            }
        } finally {
            setResetLoading(false);
        }
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
                            {profileLoading ? (
                                <div className="w-16 h-16 rounded-full bg-brown-200 animate-pulse flex items-center justify-center">
                                    <User className="w-8 h-8 text-brown-400" />
                                </div>
                            ) : getUserAvatar() ? (
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

                        {resetError && (
                            <p className="text-sm text-red-600">{resetError}</p>
                        )}
                        {/* Reset Password Button */}
                        <button
                            type="submit"
                            className="w-full bg-brown-600 hover:bg-brown-700 text-white font-medium py-3 px-6 rounded-full text-sm transition-colors shadow-md mt-8"
                        >
                            Reset Password
                        </button>
                    </form>
                </div>
            </div>

            {/* Saved Popup */}
            {showSavedPopup && (
                <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
                    <div className="bg-brown-600 text-white text-center px-6 py-3 rounded-full shadow-lg pointer-events-auto transform transition-all duration-300 ease-in-out animate-bounce">
                        <p className="text-sm font-medium">Saved</p>
                        <p className="text-xs">Your password has been reset.</p>
                    </div>
                </div>
            )}

            {/* Confirm Reset Password Popup */}
            {showConfirmPopup && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/30">
                    <div className="bg-white rounded-2xl p-6 max-w-sm w-[90%] shadow-lg">
                        <h3 className="text-lg font-semibold text-brown-600 mb-4 text-center">Confirm</h3>
                        <p className="text-sm text-brown-500 mb-4 text-center">
                            Are you sure you want to reset your password?
                        </p>
                        {resetError && (
                            <p className="text-sm text-red-600 mb-4 text-center">{resetError}</p>
                        )}
                        <div className="flex gap-3">
                            <button
                                onClick={() => { setShowConfirmPopup(false); setResetError(""); }}
                                disabled={resetLoading}
                                className="flex-1 bg-white border border-brown-300 text-brown-600 px-4 py-2 rounded-full text-sm font-medium hover:bg-brown-100 transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmResetPassword}
                                disabled={resetLoading}
                                className="flex-1 bg-brown-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-brown-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {resetLoading ? <Loader2 className="animate-spin" size={18} /> : "Confirm"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default MemberResetPassword;
