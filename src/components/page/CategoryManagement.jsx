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
  Plus,
  Search,
  Edit,
  Trash2,
  X,
  Loader2,
} from "lucide-react";
import axios from "axios";
import { API_BASE_URL } from "@/api/client";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

function CategoryManagement() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const menuItems = [
    { icon: FileText, label: "Article Management", active: false, path: "/dashboard" },
    { icon: FolderOpen, label: "Category Management", active: true, path: "/dashboard/categories" },
    { icon: User, label: "Profile", active: false, path: "/dashboard/profile" },
    { icon: Bell, label: "Notification", active: false, path: "/dashboard/notification" },
    { icon: KeyRound, label: "Reset Password", active: false, path: "/dashboard/reset-password" },
    { icon: LogOut, label: "Logout", active: false, path: "/dashboard" },
  ];

  const loadCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_BASE_URL}/categories`, { timeout: 5000 });
      const list = Array.isArray(res.data) ? res.data : res.data?.data ?? res.data?.categories ?? [];
      setCategories(list);
    } catch (err) {
      console.error("Failed to load categories:", err);
      setError(err.response?.data?.message || err.message || "Failed to load categories.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const toast = searchParams.get("toast");
    if (toast) {
      loadCategories();
      if (toast === "created") {
        setToastMessage("Create category: Category has been successfully created");
        setShowToast(true);
      } else if (toast === "updated") {
        setToastMessage("Category updated successfully");
        setShowToast(true);
      } else if (toast === "deleted") {
        setToastMessage("Category deleted successfully");
        setShowToast(true);
      }
      setSearchParams({});
      setTimeout(() => setShowToast(false), 5000);
    }
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    loadCategories();
  }, []);

  const handleDeleteClick = (categoryId) => {
    setDeleteConfirmId(categoryId);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmId) return;
    setDeleting(true);
    try {
      await axios.delete(`${API_BASE_URL}/categories/${deleteConfirmId}`, {
        headers: getAuthHeaders(),
        timeout: 5000,
      });
      setCategories((prev) => prev.filter((c) => c.id !== deleteConfirmId));
      setDeleteConfirmId(null);
      setToastMessage("Category deleted successfully");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 5000);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Failed to delete category.";
      setError(msg);
      setDeleteConfirmId(null);
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmId(null);
  };

  // Filter categories based on search
  const filteredCategories = categories.filter((category) => {
    const categoryName = category.name || category;
    return (
      searchQuery === "" ||
      categoryName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

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
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-semibold text-brown-600">
              Category management
            </h1>
            <Button
              onClick={() => navigate("/dashboard/categories/create")}
              className="bg-brown-600 hover:bg-brown-500 text-white rounded-full px-6 py-2 h-auto shadow-sm"
            >
              <Plus size={18} />
              <span>Create category</span>
            </Button>
          </div>

          {/* Search Bar */}
          <div className="bg-white rounded-xl p-4 mb-6 shadow-sm border border-brown-300">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-brown-400"
                  size={18}
                />
                <Input
                  type="text"
                  placeholder="Search categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white border-brown-300 text-brown-600 placeholder:text-brown-400 rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Category Table */}
          <div className="bg-white rounded-xl shadow-sm border border-brown-300 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-brown-100 border-b border-brown-300">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-brown-600">
                      Name
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-brown-600">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brown-300">
                  {loading ? (
                    <tr>
                      <td colSpan={2} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <Loader2 className="animate-spin text-brown-400" size={24} />
                          <span className="text-sm text-brown-400">Loading categories...</span>
                        </div>
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan={2} className="px-6 py-6 text-center">
                        <span className="text-sm text-red-600">{error}</span>
                        <button
                          type="button"
                          onClick={() => loadCategories()}
                          className="ml-2 text-sm text-brown-600 underline"
                        >
                          Retry
                        </button>
                      </td>
                    </tr>
                  ) : filteredCategories.length === 0 ? (
                    <tr>
                      <td colSpan={2} className="px-6 py-12 text-center">
                        <span className="text-sm text-brown-400">
                          No categories found.
                        </span>
                      </td>
                    </tr>
                  ) : (
                    filteredCategories.map((category) => {
                      const categoryName = category.name || category;
                      const categoryId = category.id;
                      return (
                        <tr
                          key={categoryId}
                          className="hover:bg-brown-50 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <span className="text-sm font-medium text-brown-600">
                              {categoryName}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-3">
                              <button
                                onClick={() => navigate(`/dashboard/categories/edit/${categoryId}`)}
                                className="p-2 rounded-lg text-brown-400 hover:text-brown-600 hover:bg-brown-100 transition-colors"
                                aria-label="Edit category"
                              >
                                <Edit size={18} />
                              </button>
                              <button
                                onClick={() => handleDeleteClick(categoryId)}
                                className="p-2 rounded-lg text-brown-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                                aria-label="Delete category"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-brown-600 mb-2">
              Delete category
            </h3>
            <p className="text-sm text-brown-400 mb-6">
              Do you want to delete this category?
            </p>
            <div className="flex items-center justify-end gap-3">
              <Button
                onClick={handleDeleteCancel}
                disabled={deleting}
                className="bg-white hover:bg-brown-50 text-brown-600 border border-brown-300 rounded-lg px-4 py-2 h-auto"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="bg-red-500 hover:bg-red-600 text-white rounded-lg px-4 py-2 h-auto"
              >
                {deleting ? <Loader2 className="animate-spin" size={18} /> : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-6 right-6 bg-white border border-green rounded-lg shadow-lg p-4 flex items-center gap-4 min-w-[400px] max-w-[500px] z-50 animate-slide-up">
          <div className="flex-1">
            <p className="text-sm font-medium text-green">{toastMessage}</p>
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

export default CategoryManagement;
