import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FileText,
  FolderOpen,
  User,
  Bell,
  KeyRound,
  LogOut,
  Upload,
  X,
  Camera,
} from "lucide-react";

function Profile() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    bio: "",
  });
  const [profileImage, setProfileImage] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const MAX_BIO_LENGTH = 120;

  const menuItems = [
    { icon: FileText, label: "Article Management", active: false, path: "/dashboard" },
    { icon: FolderOpen, label: "Category Management", active: false, path: "/dashboard/categories" },
    { icon: User, label: "Profile", active: true, path: "/dashboard/profile" },
    { icon: Bell, label: "Notification", active: false, path: "/dashboard/notification" },
    { icon: KeyRound, label: "Reset Password", active: false, path: "/dashboard/reset-password" },
    { icon: LogOut, label: "Logout", active: false, path: "/dashboard" },
  ];

  // Load profile data from localStorage
  useEffect(() => {
    const storedProfile = localStorage.getItem("user_profile");
    if (storedProfile) {
      try {
        const profile = JSON.parse(storedProfile);
        setFormData({
          name: profile.name || "",
          username: profile.username || "",
          email: profile.email || "",
          bio: profile.bio || "",
        });
        if (profile.profileImage) {
          setProfileImagePreview(profile.profileImage);
        }
      } catch (error) {
        console.error("Error loading profile:", error);
      }
    } else {
      // Set default values
      setFormData({
        name: "Admin User",
        username: "admin",
        email: "admin@example.com",
        bio: "",
      });
    }
  }, []);

  // Check for toast notification from URL params
  useEffect(() => {
    const toast = searchParams.get("toast");
    if (toast === "saved") {
      setShowToast(true);
      setSearchParams({}); // Clear URL params
      setTimeout(() => {
        setShowToast(false);
      }, 5000);
    }
  }, [searchParams, setSearchParams]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setProfileImage(null);
    setProfileImagePreview(null);
  };

  const handleSave = () => {
    // Save profile to localStorage
    const profileData = {
      ...formData,
      profileImage: profileImagePreview,
    };
    localStorage.setItem("user_profile", JSON.stringify(profileData));
    
    // Show toast and navigate
    navigate("/dashboard/profile?toast=saved");
  };

  return (
    <div className="flex h-screen bg-brown-100 font-poppins">
      {/* Left Sidebar */}
      <aside className="w-64 bg-white border-r border-brown-300 flex flex-col shadow-sm">
        {/* Logo */}
        <div className="p-6 border-b border-brown-300 bg-brown-200">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl font-semibold text-brown-600">hh</span>
            <span className="text-2xl font-semibold text-green">.</span>
          </div>
          <span className="text-orange text-sm font-medium">Admin Panel</span>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 flex flex-col justify-between p-4 bg-brown-200">
          <div className="space-y-1">
            {menuItems.slice(0, 5).map((item, index) => {
              const Icon = item.icon;
              return (
                <button
                  key={index}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    item.active
                      ? "bg-brown-300 text-brown-600"
                      : "text-brown-400 hover:bg-brown-300 hover:text-brown-600"
                  }`}
                >
                  <Icon size={18} />
                  <span className="whitespace-nowrap">{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Bottom Menu Items */}
          <div className="space-y-1 border-t border-brown-300 pt-4">
            {menuItems.slice(5).map((item, index) => {
              const Icon = item.icon;
              return (
                <button
                  key={index + 5}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    item.active
                      ? "bg-brown-300 text-brown-600"
                      : "text-brown-400 hover:bg-brown-300 hover:text-brown-600"
                  }`}
                >
                  <Icon size={18} />
                  <span className="whitespace-nowrap">{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-brown-100">
        <div className="p-8 max-w-4xl mx-auto">
          {/* Profile Card */}
          <div className="bg-white rounded-xl shadow-sm border border-brown-300 p-6">
            {/* Header with Save Button */}
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-semibold text-brown-600">
                Profile Settings
              </h1>
              <Button
                onClick={handleSave}
                className="bg-brown-600 hover:bg-brown-500 text-white rounded-lg px-6 py-2 h-auto shadow-sm"
              >
                Save
              </Button>
            </div>

            {/* Profile Image Section */}
            <div className="flex items-center gap-6 mb-6">
              <div className="relative">
                {profileImagePreview ? (
                  <div className="relative">
                    <img
                      src={profileImagePreview}
                      alt="Profile"
                      className="w-24 h-24 rounded-full object-cover border-2 border-brown-300"
                    />
                    <button
                      onClick={removeImage}
                      className="absolute -top-1 -right-1 p-1 bg-white rounded-full shadow-md hover:bg-brown-50 transition-colors"
                    >
                      <X size={14} className="text-brown-600" />
                    </button>
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-full bg-brown-200 border-2 border-brown-300 flex items-center justify-center">
                    <User className="w-12 h-12 text-brown-400" />
                  </div>
                )}
              </div>
              <div>
                <label className="cursor-pointer">
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                  <Button
                    type="button"
                    className="bg-white hover:bg-brown-50 text-brown-600 border border-brown-300 rounded-lg px-4 py-2 h-auto shadow-sm"
                    onClick={() => document.querySelector('input[type="file"]')?.click()}
                  >
                    <Upload size={16} className="mr-2" />
                    Upload profile picture
                  </Button>
                </label>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-brown-600 mb-2">
                  Name
                </label>
                <Input
                  type="text"
                  placeholder="Enter your name..."
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full bg-white border-brown-300 text-brown-600 placeholder:text-brown-400 rounded-lg"
                />
              </div>

              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-brown-600 mb-2">
                  Username
                </label>
                <Input
                  type="text"
                  placeholder="Enter your username..."
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  className="w-full bg-white border-brown-300 text-brown-600 placeholder:text-brown-400 rounded-lg"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-brown-600 mb-2">
                  Email
                </label>
                <Input
                  type="email"
                  placeholder="Enter your email..."
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full bg-white border-brown-300 text-brown-600 placeholder:text-brown-400 rounded-lg"
                />
              </div>

              {/* Bio */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-brown-600">
                    Bio
                  </label>
                  <span
                    className={`text-xs ${
                      formData.bio.length > MAX_BIO_LENGTH
                        ? "text-red-500"
                        : "text-brown-400"
                    }`}
                  >
                    {formData.bio.length}/{MAX_BIO_LENGTH}
                  </span>
                </div>
                <textarea
                  placeholder="Tell us about yourself..."
                  value={formData.bio}
                  onChange={(e) => {
                    if (e.target.value.length <= MAX_BIO_LENGTH) {
                      setFormData({ ...formData, bio: e.target.value });
                    }
                  }}
                  rows={5}
                  className="w-full px-4 py-3 bg-white border border-brown-300 text-brown-600 placeholder:text-brown-400 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-brown-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-6 right-6 bg-white border border-green rounded-lg shadow-lg p-4 flex items-center gap-4 min-w-[400px] max-w-[500px] z-50 animate-slide-up">
          <div className="flex-1">
            <p className="text-sm font-medium text-green">
              Saved profile: Your profile has been successfully updated
            </p>
          </div>
          <button
            onClick={() => setShowToast(false)}
            className="p-1 rounded-lg text-brown-400 hover:text-brown-600 hover:bg-brown-50 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      )}
    </div>
  );
}

export default Profile;
