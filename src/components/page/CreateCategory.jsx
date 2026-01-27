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
} from "lucide-react";
import { saveCategory, getCategoryById } from "@/utils/categoryStorage";

function CreateCategory() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = id !== undefined && id !== null;
  const [categoryName, setCategoryName] = useState("");

  const menuItems = [
    { icon: FileText, label: "Article Management", active: false, path: "/dashboard" },
    { icon: FolderOpen, label: "Category Management", active: true, path: "/dashboard/categories" },
    { icon: User, label: "Profile", active: false, path: "/dashboard" },
    { icon: Bell, label: "Notification", active: false, path: "/dashboard/notification" },
    { icon: KeyRound, label: "Reset Password", active: false, path: "/dashboard" },
    { icon: LogOut, label: "Logout", active: false, path: "/dashboard" },
  ];

  // Load category data if editing
  useEffect(() => {
    if (isEditMode && id) {
      const existingCategory = getCategoryById(id);
      if (existingCategory) {
        setCategoryName(existingCategory.name || "");
      } else {
        // If category not found, redirect back
        navigate("/dashboard/categories");
      }
    }
  }, [id, isEditMode, navigate]);

  const handleSave = () => {
    if (!categoryName.trim()) {
      return; // Don't save empty category
    }

    const categoryData = {
      id: isEditMode ? parseInt(id) : undefined,
      name: categoryName.trim(),
    };

    saveCategory(categoryData);
    navigate(
      isEditMode
        ? "/dashboard/categories?toast=updated"
        : "/dashboard/categories?toast=created"
    );
  };

  return (
    <div className="flex h-screen bg-brown-100 font-poppins">
      {/* Left Sidebar */}
      <aside className="w-64 bg-white border-r border-brown-300 flex flex-col shadow-sm">
        {/* Logo */}
        <div className="p-6 border-b border-brown-300 bg-brown-200">
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
                  onClick={() => navigate(item.path)}
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
                  onClick={() => navigate(item.path)}
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
              disabled={!categoryName.trim()}
              className="bg-brown-600 hover:bg-brown-500 text-white rounded-lg px-6 py-2 h-auto shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save
            </Button>
          </div>

          {/* Form */}
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
        </div>
      </main>
    </div>
  );
}

export default CreateCategory;
