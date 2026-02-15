import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FileText,
  FolderOpen,
  User,
  Bell,
  KeyRound,
  LogOut,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import axios from "axios";
import { API_BASE_URL } from "@/api/client";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

function CreateCategory() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = id !== undefined && id !== null;
  const [categoryName, setCategoryName] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const menuItems = [
    { icon: FileText, label: "Article Management", active: false, path: "/dashboard" },
    { icon: FolderOpen, label: "Category Management", active: true, path: "/dashboard/categories" },
    { icon: User, label: "Profile", active: false, path: "/dashboard/profile" },
    { icon: Bell, label: "Notification", active: false, path: "/dashboard/notification" },
    { icon: KeyRound, label: "Reset Password", active: false, path: "/dashboard/reset-password" },
    { icon: LogOut, label: "Logout", active: false, path: "/" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("isLoggedIn");
    window.dispatchEvent(new Event("loginChange"));
    navigate("/");
  };

  useEffect(() => {
    if (!isEditMode || !id) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    axios
      .get(`${API_BASE_URL}/categories/${id}`, { timeout: 5000 })
      .then((res) => {
        if (cancelled) return;
        setCategoryName(res.data?.name ?? "");
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.response?.status === 404 ? "Category not found." : err.message || "Failed to load category.");
        if (err.response?.status === 404) setTimeout(() => navigate("/dashboard/categories"), 1500);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [id, isEditMode, navigate]);

  const handleSave = async () => {
    if (!categoryName.trim()) return;
    setSaving(true);
    setError(null);
    try {
      if (isEditMode) {
        await axios.put(
          `${API_BASE_URL}/categories/${id}`,
          { name: categoryName.trim() },
          { headers: { ...getAuthHeaders(), "Content-Type": "application/json" }, timeout: 5000 }
        );
        navigate("/dashboard/categories?toast=updated");
      } else {
        await axios.post(
          `${API_BASE_URL}/categories`,
          { name: categoryName.trim() },
          { headers: { ...getAuthHeaders(), "Content-Type": "application/json" }, timeout: 5000 }
        );
        navigate("/dashboard/categories?toast=created");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to save category.");
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
          <div className="flex items-center gap-2">
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
                  onClick={() => (item.label === "Logout" ? handleLogout() : navigate(item.path))}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors hover:bg-brown-300 ${
                    item.active ? "bg-brown-300 text-brown-600" : "text-brown-400"
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
                  onClick={() => (item.label === "Logout" ? handleLogout() : navigate(item.path))}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors hover:bg-brown-300 ${
                    item.active ? "bg-brown-300 text-brown-600" : "text-brown-400"
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
        <div className="p-8 max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/dashboard/categories")}
                className="p-2 rounded-lg text-brown-400 hover:text-brown-600 hover:bg-white transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              <h1 className="text-2xl font-semibold text-brown-600">
                {isEditMode ? "Edit category" : "Create category"}
              </h1>
            </div>
            <Button
              onClick={handleSave}
              disabled={!categoryName.trim() || loading || saving}
              className="bg-brown-600 hover:bg-brown-500 text-white rounded-lg px-6 py-2 h-auto shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? <Loader2 className="animate-spin" size={18} /> : "Save"}
            </Button>
          </div>

          {error && (
            <div className="mb-4 px-4 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          {loading ? (
            <div className="bg-white rounded-xl shadow-sm border border-brown-300 p-12 flex flex-col items-center gap-3">
              <Loader2 className="animate-spin text-brown-400" size={32} />
              <span className="text-brown-500">Loading category...</span>
            </div>
          ) : (
          /* Form */
          <div className="bg-white rounded-xl shadow-sm border border-brown-300 p-6">
            <div>
              <label className="block text-sm font-medium text-brown-600 mb-2">
                Category name
              </label>
              <Input
                type="text"
                placeholder="Enter category name..."
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                className="w-full bg-white border-brown-300 text-brown-600 placeholder:text-brown-400 rounded-lg"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && categoryName.trim()) {
                    handleSave();
                  }
                }}
              />
            </div>
          </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default CreateCategory;
