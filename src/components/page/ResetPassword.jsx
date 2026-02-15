import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FileText,
  FolderOpen,
  User,
  Bell,
  KeyRound,
  LogOut,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";
import axios from "axios";
import { API_BASE_URL } from "@/api/client";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

function ResetPassword() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const menuItems = [
    { icon: FileText, label: "Article Management", active: false, path: "/dashboard" },
    { icon: FolderOpen, label: "Category Management", active: false, path: "/dashboard/categories" },
    { icon: User, label: "Profile", active: false, path: "/dashboard/profile" },
    { icon: Bell, label: "Notification", active: false, path: "/dashboard/notification" },
    { icon: KeyRound, label: "Reset Password", active: true, path: "/dashboard/reset-password" },
    { icon: LogOut, label: "Logout", active: false, path: "/dashboard" },
  ];

  const handleResetClick = () => {
    if (formData.newPassword !== formData.confirmPassword) return;
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) return;
    if (formData.newPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }
    setError(null);
    setShowConfirmModal(true);
  };

  const handleConfirmReset = async () => {
    const currentP = (formData.currentPassword || "").trim();
    const newP = (formData.newPassword || "").trim();
    if (!newP || newP.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await axios.put(
        `${API_BASE_URL}/auth/reset-password`,
        { oldPassword: currentP, newPassword: newP },
        {
          headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
          timeout: 10000,
        }
      );
      setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setShowConfirmModal(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      const msg = err.response?.data?.error || err.message || "Failed to reset password.";
      setError(msg);
      if (err.response?.status === 401) {
        setTimeout(() => {
          setShowConfirmModal(false);
          navigate("/admin-login");
        }, 1500);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancelReset = () => {
    setShowConfirmModal(false);
    setError(null);
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
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
        <div className="p-8 w-full mx-auto">
          {error && (
            <div className="mb-4 px-4 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 px-4 py-2 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
              Password updated successfully.
            </div>
          )}
          {/* Profile Card */}
          <div className="bg-white rounded-xl shadow-sm border border-brown-300 p-6">
            {/* Header with Reset Button */}
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-semibold text-brown-600">
                Reset Password
              </h1>
              <Button
                onClick={handleResetClick}
                disabled={
                  !formData.currentPassword ||
                  !formData.newPassword ||
                  !formData.confirmPassword ||
                  formData.newPassword !== formData.confirmPassword
                }
                className="bg-brown-600 hover:bg-brown-500 text-white rounded-lg px-6 py-2 h-auto shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Reset password
              </Button>
            </div>

            {/* Form Fields */}
            <div className="space-y-6">
              {/* Current Password */}
              <div>
                <label className="block text-sm font-medium text-brown-600 mb-2">
                  Current password
                </label>
                <div className="relative">
                  <Input
                    type={showPasswords.current ? "text" : "password"}
                    placeholder="Enter your current password..."
                    value={formData.currentPassword}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        currentPassword: e.target.value,
                      })
                    }
                    className="w-full bg-white border-brown-300 text-brown-600 placeholder:text-brown-400 rounded-lg pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility("current")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-brown-400 hover:text-brown-600 transition-colors"
                  >
                    {showPasswords.current ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-brown-600 mb-2">
                  New password
                </label>
                <div className="relative">
                  <Input
                    type={showPasswords.new ? "text" : "password"}
                    placeholder="Enter your new password..."
                    value={formData.newPassword}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        newPassword: e.target.value,
                      })
                    }
                    className="w-full bg-white border-brown-300 text-brown-600 placeholder:text-brown-400 rounded-lg pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility("new")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-brown-400 hover:text-brown-600 transition-colors"
                  >
                    {showPasswords.new ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div>
                <label className="block text-sm font-medium text-brown-600 mb-2">
                  Confirm new password
                </label>
                <div className="relative">
                  <Input
                    type={showPasswords.confirm ? "text" : "password"}
                    placeholder="Confirm your new password..."
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        confirmPassword: e.target.value,
                      })
                    }
                    className={`w-full bg-white border-brown-300 text-brown-600 placeholder:text-brown-400 rounded-lg pr-10 ${
                      formData.confirmPassword &&
                      formData.newPassword !== formData.confirmPassword
                        ? "border-red-500"
                        : ""
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility("confirm")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-brown-400 hover:text-brown-600 transition-colors"
                  >
                    {showPasswords.confirm ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
                {formData.confirmPassword &&
                  formData.newPassword !== formData.confirmPassword && (
                    <p className="text-xs text-red-500 mt-1">
                      Passwords do not match
                    </p>
                  )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-brown-600 mb-2">
              Reset Password
            </h3>
            <p className="text-sm text-brown-400 mb-4">
              Do you want to reset your password?
            </p>
            {error && (
              <p className="text-sm text-red-600 mb-4 bg-red-50 px-3 py-2 rounded-lg">
                {error}
              </p>
            )}
            <div className="flex items-center justify-end gap-3">
              <Button
                onClick={handleCancelReset}
                disabled={loading}
                className="bg-white hover:bg-brown-50 text-brown-600 border border-brown-300 rounded-lg px-4 py-2 h-auto"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmReset}
                disabled={loading}
                className="bg-brown-600 hover:bg-brown-500 text-white rounded-lg px-4 py-2 h-auto"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : "Reset"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ResetPassword;
