import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  CheckCircle2,
  Loader2,
  X,
} from "lucide-react";
import axios from "axios";
import { API_BASE_URL } from "@/api/client";
import { blogPosts as fallbackPosts } from "@/data/blogPost";
import { getArticles, deleteArticle } from "@/utils/articleStorage";

function Dashboard() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Map fallback posts to articles format
  const getFallbackArticles = () => {
    return fallbackPosts.map((post, index) => ({
      id: post.id,
      title: post.title,
      category: post.category,
      status: index % 3 === 0 ? "Draft" : "Published", // Mix of Draft and Published
    }));
  };

  // Load articles from storage and merge with fallback
  const loadArticles = () => {
    const storedArticles = getArticles();
    const fallbackArticles = getFallbackArticles();
    
    // Merge stored articles with fallback, prioritizing stored
    const storedIds = new Set(storedArticles.map((a) => a.id));
    const merged = [...storedArticles, ...fallbackArticles.filter((a) => !storedIds.has(a.id))];
    
    return merged;
  };

  // Check for toast notification from URL params and refresh articles
  useEffect(() => {
    const toast = searchParams.get("toast");
    if (toast) {
      // Refresh articles list whenever toast appears
      setArticles(loadArticles());
      
      if (toast === "draft") {
        setToastMessage("Create article and saved as draft. You can publish article later.");
        setShowToast(true);
      } else if (toast === "published") {
        setToastMessage("Create article and published successfully.");
        setShowToast(true);
      } else if (toast === "deleted") {
        setToastMessage("Article deleted successfully.");
        setShowToast(true);
      } else if (toast === "updated") {
        setToastMessage("Article updated successfully.");
        setShowToast(true);
      }
      
      setSearchParams({}); // Clear URL params
      setTimeout(() => {
        setShowToast(false);
      }, 5000);
    }
  }, [searchParams, setSearchParams]);

  // Fetch articles from API (background fetch)
  const fetchArticles = async (showError = false) => {
    try {
      setLoading(true);
      if (showError) {
        setError(null);
      }
      
      const endpoint = `${API_BASE_URL}/posts`;
      const response = await axios.get(endpoint, {
        timeout: 5000,
      });
      if (response.data) {
        console.log("Fetched posts from API:", response.data);
      }

      // Handle different response formats
      let articlesData = [];
      if (response.data) {
        if (Array.isArray(response.data)) {
          articlesData = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          articlesData = response.data.data;
        } else if (response.data.posts && Array.isArray(response.data.posts)) {
          articlesData = response.data.posts;
        } else if (response.data.articles && Array.isArray(response.data.articles)) {
          articlesData = response.data.articles;
        } else if (response.data.results && Array.isArray(response.data.results)) {
          articlesData = response.data.results;
        } else {
          const values = Object.values(response.data);
          if (values.length > 0 && Array.isArray(values[0])) {
            articlesData = values[0];
          }
        }
      }

      // Map API response to our expected format (server: id, title, category_id, status_id)
      const statusLabels = { 1: "Draft", 2: "Published" };
      const mappedArticles = articlesData.map((article, index) => ({
        id: article.id || index + 1,
        title: article.title || article.name || "Untitled",
        category: article.category ?? (article.category_id != null ? `Category ${article.category_id}` : "Uncategorized"),
        status: article.status ?? statusLabels[article.status_id] ?? "Published",
      }));
        
      if (mappedArticles.length > 0) {
        setArticles(mappedArticles);
        setError(null); // Clear error if API succeeds
      }
    } catch (err) {
      console.error("Error fetching articles:", err);
      // Only show error if explicitly requested (e.g., on retry)
      if (showError) {
        let errorMessage = "Failed to load from API. Showing local data.";
        if (err.response?.status === 404) {
          errorMessage = "API endpoint not found. Showing local data.";
        } else if (err.response?.status === 500) {
          errorMessage = "Server error. Showing local data.";
        } else if (err.code === "ECONNABORTED") {
          errorMessage = "Request timeout. Showing local data.";
        } else if (err.code === "ERR_NETWORK" || err.message === "Network Error") {
          errorMessage = "Network error. Showing local data.";
        }
        setError(errorMessage);
        // Auto-hide error after 5 seconds
        setTimeout(() => {
          setError(null);
        }, 5000);
      }
    } finally {
      setLoading(false);
    }
  };

  // Load articles on mount
  useEffect(() => {
    // Set articles from storage/fallback immediately for instant display
    setArticles(loadArticles());
    
    // Fetch from API in background (silently, without showing error)
    fetchArticles(false);
  }, []);

  // Auto-hide error after loading completes
  useEffect(() => {
    if (!loading && error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 3000); // Hide error after 3 seconds
      return () => clearTimeout(timer);
    }
  }, [loading, error]);

  // Retry function for manual retry
  const handleRetry = () => {
    fetchArticles(true); // Show error on retry
  };

  // Extract unique categories from articles
  const categories = useMemo(() => {
    const uniqueCategories = [
      ...new Set(articles.map((article) => article.category)),
    ].filter(Boolean);
    return uniqueCategories.sort();
  }, [articles]);

  // Handle delete confirmation
  const handleDeleteClick = (articleId) => {
    setDeleteConfirmId(articleId);
  };

  const handleDeleteConfirm = () => {
    if (deleteConfirmId) {
      deleteArticle(deleteConfirmId);
      setDeleteConfirmId(null);
      navigate("/dashboard?toast=deleted");
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmId(null);
  };

  // Filter articles based on search and filters
  const filteredArticles = articles.filter((article) => {
    // Search filter - only by title
    const matchesSearch =
      searchQuery === "" ||
      article.title.toLowerCase().includes(searchQuery.toLowerCase());

    // Status filter
    const matchesStatus =
      statusFilter === "all" ||
      article.status.toLowerCase() === statusFilter.toLowerCase();

    // Category filter
    const matchesCategory =
      categoryFilter === "all" ||
      article.category.toLowerCase() === categoryFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const menuItems = [
    { icon: FileText, label: "Article Management", active: true, path: "/dashboard" },
    { icon: FolderOpen, label: "Category Management", active: false, path: "/dashboard/categories" },
    { icon: User, label: "Profile", active: false, path: "/dashboard/profile" },
    { icon: Bell, label: "Notification", active: false, path: "/dashboard/notification" },
    { icon: KeyRound, label: "Reset Password", active: false, path: "/dashboard/reset-password" },
    { icon: LogOut, label: "Logout", active: false, path: "/dashboard" },
  ];

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
              Article management
            </h1>
            <Button
              onClick={() => navigate("/dashboard/create")}
              className="bg-brown-600 hover:bg-brown-500 text-white rounded-full px-6 py-2 h-auto shadow-sm"
            >
              <Plus size={18} />
              <span>Create article</span>
            </Button>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl p-4 mb-6 shadow-sm border border-brown-300">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search Input */}
              <div className="flex-1 relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-brown-400"
                  size={18}
                />
                <Input
                  type="text"
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white border-brown-300 text-brown-600 placeholder:text-brown-400 rounded-lg"
                />
              </div>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48 bg-white border-brown-300 text-brown-600 rounded-lg">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>

              {/* Category Filter */}
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full md:w-48 bg-white border-brown-300 text-brown-600 rounded-lg">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category.toLowerCase()}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Article Table */}
          <div className="bg-white rounded-xl shadow-sm border border-brown-300 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-brown-100 border-b border-brown-300">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-brown-600">
                      Article title
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-brown-600">
                      Category
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-brown-600">
                      Status
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-brown-600">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brown-300">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center gap-3">
                          <Loader2 className="animate-spin text-brown-400" size={24} />
                          <span className="text-sm text-brown-400">Loading articles...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredArticles.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center gap-3">
                          {error && (
                            <span className="text-sm text-orange-500">{error}</span>
                          )}
                          <span className="text-sm text-brown-400">
                            No articles found.
                          </span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    <>
                      {error && (
                        <tr>
                          <td colSpan={4} className="px-4 py-2 bg-orange-50 border-b border-orange-200">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-orange-600">{error}</span>
                              <Button
                                onClick={handleRetry}
                                className="bg-orange-600 hover:bg-orange-500 text-white rounded-lg px-4 py-1 h-auto text-xs"
                                disabled={loading}
                              >
                                {loading ? (
                                  <>
                                    <Loader2 className="animate-spin mr-2 inline" size={14} />
                                    Retrying...
                                  </>
                                ) : (
                                  "Retry"
                                )}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      )}
                      {filteredArticles.map((article) => (
                      <tr
                        key={article.id}
                        className="hover:bg-brown-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <span className="text-sm font-medium text-brown-600">
                            {article.title}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-brown-400">
                            {article.category}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {article.status === "Published" ? (
                              <>
                                <CheckCircle2
                                  className="text-green"
                                  size={18}
                                />
                                <span className="text-sm font-medium text-green">
                                  {article.status}
                                </span>
                              </>
                            ) : (
                              <>
                                <div className="w-4 h-4 rounded-full bg-brown-400"></div>
                                <span className="text-sm font-medium text-brown-400">
                                  {article.status}
                                </span>
                              </>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-3">
                            <button
                              onClick={() => navigate(`/dashboard/edit/${article.id}`)}
                              className="p-2 rounded-lg text-brown-400 hover:text-brown-600 hover:bg-brown-100 transition-colors"
                              aria-label="Edit article"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(article.id)}
                              className="p-2 rounded-lg text-brown-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                              aria-label="Delete article"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                      ))}
                    </>
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
              Delete Article
            </h3>
            <p className="text-sm text-brown-400 mb-6">
              Are you sure you want to delete this article? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3">
              <Button
                onClick={handleDeleteCancel}
                className="bg-white hover:bg-brown-50 text-brown-600 border border-brown-300 rounded-lg px-4 py-2 h-auto"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeleteConfirm}
                className="bg-red-500 hover:bg-red-600 text-white rounded-lg px-4 py-2 h-auto"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-6 right-6 bg-white border border-brown-300 rounded-lg shadow-lg p-4 flex items-center gap-4 min-w-[400px] max-w-[500px] z-50 animate-slide-up">
          <div className="flex-1">
            <p className="text-sm font-medium text-brown-600">{toastMessage}</p>
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

export default Dashboard;
