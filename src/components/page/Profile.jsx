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
} from "lucide-react";
import { apiClient } from "@/api/client";

function Profile() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    bio: "",
  });
  const [role, setRole] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const MAX_BIO_LENGTH = 120;

  const menuItems = [
    { icon: FileText, label: "Article Management", active: false, path: "/dashboard" },
    { icon: FolderOpen, label: "Category Management", active: false, path: "/dashboard/categories" },
    { icon: User, label: "Profile", active: true, path: "/dashboard/profile" },
    { icon: Bell, label: "Notification", active: false, path: "/dashboard/notification" },
    { icon: KeyRound, label: "Reset Password", active: false, path: "/dashboard/reset-password" },
    { icon: LogOut, label: "Logout", active: false, path: "/dashboard" },
  ];

  // โหลดข้อมูลโปรไฟล์จริงจาก API (รวม role admin)
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/admin-login");
      return;
    }
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError("");
        const { data } = await apiClient.get("/auth/get-user");
        setFormData({
          name: data.name || "",
          username: data.username || "",
          email: data.email || "",
          bio: "",
        });
        setRole(data.role || "");
        if (data.profilePic) {
          setProfileImagePreview(data.profilePic);
        }
      } catch (err) {
        console.error("Error loading profile:", err);
        setError(err.response?.data?.error || err.message || "โหลดโปรไฟล์ไม่สำเร็จ");
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("isLoggedIn");
          navigate("/admin-login");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [navigate]);

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
      const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
      if (!allowedTypes.includes(file.type)) {
        setError("กรุณาเลือกไฟล์รูปภาพ (JPEG, PNG, GIF, WebP)");
        return;
      }
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        setError("ขนาดไฟล์ไม่เกิน 5MB");
        return;
      }
      setProfileImageFile(file);
      setError("");
      const reader = new FileReader();
      reader.onloadend = () => setProfileImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setProfileImageFile(null);
    setProfileImagePreview(null);
  };

  const handleSave = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/admin-login");
      return;
    }
    try {
      setSaving(true);
      setError("");
      const form = new FormData();
      form.append("name", formData.name);
      form.append("username", formData.username);
      if (profileImageFile) {
        form.append("profileImage", profileImageFile);
      }
      const { data } = await apiClient.put("/users/profile", form);
      const newPic = data.user?.profilePic ?? profileImagePreview;
      setProfileImagePreview(newPic);
      setProfileImageFile(null);
      setShowToast(true);
      setSearchParams({ toast: "saved" });
      setTimeout(() => setShowToast(false), 5000);
    } catch (err) {
      const res = err.response?.data;
      setError(res?.error || res?.message || err.message || "บันทึกไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex h-screen bg-brown-100 font-poppins">
      {/* Left Sidebar */}
      <aside className="w-64 bg-white border-r border-brown-300 flex flex-col shadow-sm">
        {/* Logo - คลิกไปหน้า Home */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => navigate("/")}
          onKeyDown={(e) => e.key === "Enter" && navigate("/")}
          className="p-6 border-b border-brown-300 bg-brown-200 cursor-pointer hover:opacity-90"
        >
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
        <div className="p-8 w-full mx-auto">
          {loading ? (
            <div className="bg-white rounded-xl shadow-sm border border-brown-300 p-8 text-center">
              <p className="text-brown-600">กำลังโหลดโปรไฟล์...</p>
            </div>
          ) : (
          <>
          {/* Profile Card */}
          <div className="bg-white rounded-xl shadow-sm border border-brown-300 p-6">
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                {error}
              </div>
            )}
            {/* Header with Save Button */}
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-semibold text-brown-600">
                Profile Settings
              </h1>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-brown-600 hover:bg-brown-500 text-white rounded-lg px-6 py-2 h-auto shadow-sm disabled:opacity-60"
              >
                {saving ? "กำลังบันทึก..." : "Save"}
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

              {/* Email (read-only จากระบบ) */}
              <div>
                <label className="block text-sm font-medium text-brown-600 mb-2">
                  Email
                </label>
                <Input
                  type="email"
                  placeholder="Enter your email..."
                  value={formData.email}
                  readOnly
                  className="w-full bg-brown-100 border-brown-300 text-brown-600 rounded-lg cursor-not-allowed"
                />
              </div>

              {/* Role (ข้อมูลจริงจาก DB เช่น admin) */}
              <div>
                <label className="block text-sm font-medium text-brown-600 mb-2">
                  Role
                </label>
                <Input
                  type="text"
                  value={role ? role.charAt(0).toUpperCase() + role.slice(1) : ""}
                  readOnly
                  className="w-full bg-brown-100 border-brown-300 text-brown-600 rounded-lg cursor-not-allowed capitalize"
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
          </>
          )}
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
