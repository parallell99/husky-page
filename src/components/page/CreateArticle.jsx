import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
  ArrowLeft,
  X,
  Image,
  Loader2,
} from "lucide-react";
import axios from "axios";
import { API_BASE_URL } from "@/api/client";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const buildCreateFormData = (formData, statusId) => {
  const fd = new FormData();
  fd.append("title", formData.title || "");
  fd.append("category_id", String(formData.category_id));
  fd.append("description", formData.introduction || "");
  fd.append("content", formData.content || "");
  fd.append("status_id", String(statusId));
  return fd;
};

const STATUS_DRAFT = 1;
const STATUS_PUBLISHED = 2;

function CreateArticle() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = id !== undefined && id !== null;
  const articleId = id;
  const [formData, setFormData] = useState({
    thumbnail: null,
    image: "", // URL จาก API (โหมดแก้ไข)
    category_id: 1,
    author: "Admin User",
    title: "",
    introduction: "",
    content: "",
    status_id: STATUS_DRAFT,
  });
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [categoriesList, setCategoriesList] = useState([]);
  const MAX_INTRODUCTION_LENGTH = 200;

  // โหลดรายการ category จาก API (ข้อมูลจริงจาก Supabase)
  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/categories`, { timeout: 5000 })
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : res.data?.data ?? res.data?.categories ?? [];
        setCategoriesList(list);
      })
      .catch((err) => console.error("Failed to load categories:", err));
  }, []);

  // โหลดบทความจาก API เมื่อเป็นโหมดแก้ไข
  useEffect(() => {
    if (!isEditMode || !articleId) return;
    let cancelled = false;
    setLoadError(null);
    setLoading(true);
    axios
      .get(`${API_BASE_URL}/posts/${articleId}`, { timeout: 5000 })
      .then((res) => {
        if (cancelled) return;
        const p = res.data;
        setFormData({
          thumbnail: null,
          image: p.image || "",
          category_id: p.category_id != null ? Number(p.category_id) : 1,
          author: "Admin User",
          title: p.title || "",
          introduction: p.description || "",
          content: p.content || "",
          status_id: p.status_id != null ? Number(p.status_id) : STATUS_DRAFT,
        });
        setThumbnailPreview(p.image || null);
      })
      .catch((err) => {
        if (cancelled) return;
        setLoadError(err.response?.status === 404 ? "Article not found." : err.message || "Failed to load article.");
        if (err.response?.status === 404) {
          setTimeout(() => navigate("/dashboard"), 1500);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [articleId, isEditMode, navigate]);

  const menuItems = [
    { icon: FileText, label: "Article Management", active: false, path: "/dashboard" },
    { icon: FolderOpen, label: "Category Management", active: false, path: "/dashboard/categories" },
    { icon: User, label: "Profile", active: false, path: "/dashboard/profile" },
    { icon: Bell, label: "Notification", active: false, path: "/dashboard/notification" },
    { icon: KeyRound, label: "Reset Password", active: false, path: "/dashboard/reset-password" },
    { icon: LogOut, label: "Logout", active: false, path: "/dashboard" },
  ];

  const categories = categoriesList.map((c) => ({ id: c.id, label: c.name || `Category ${c.id}` }));

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, thumbnail: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeThumbnail = () => {
    setFormData({ ...formData, thumbnail: null });
    setThumbnailPreview(null);
  };

  const handleSaveDraft = async () => {
    if (isEditMode) {
      setSaving(true);
      try {
        await axios.put(
          `${API_BASE_URL}/posts/${articleId}`,
          {
            title: formData.title,
            image: formData.image || thumbnailPreview || "",
            description: formData.introduction,
            content: formData.content,
            category_id: formData.category_id,
            status_id: STATUS_DRAFT,
          },
          { headers: { ...getAuthHeaders(), "Content-Type": "application/json" }, timeout: 5000 }
        );
        navigate("/dashboard?toast=updated");
      } catch (err) {
        console.error(err);
        setLoadError(err.response?.data?.message || err.message || "Failed to save.");
      } finally {
        setSaving(false);
      }
      return;
    }
    if (!formData.thumbnail || !(formData.thumbnail instanceof File)) {
      setLoadError("กรุณาอัปโหลดรูปภาพ (Thumbnail)");
      return;
    }
    setSaving(true);
    setLoadError(null);
    try {
      const fd = buildCreateFormData(formData, STATUS_DRAFT);
      fd.append("imageFile", formData.thumbnail);
      await axios.post(`${API_BASE_URL}/posts`, fd, {
        headers: getAuthHeaders(),
        timeout: 15000,
      });
      navigate("/dashboard?toast=draft");
    } catch (err) {
      console.error(err);
      setLoadError(err.response?.data?.message || err.message || "Failed to create post.");
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (isEditMode) {
      setSaving(true);
      try {
        await axios.put(
          `${API_BASE_URL}/posts/${articleId}`,
          {
            title: formData.title,
            image: formData.image || thumbnailPreview || "",
            description: formData.introduction,
            content: formData.content,
            category_id: formData.category_id,
            status_id: STATUS_PUBLISHED,
          },
          { headers: { ...getAuthHeaders(), "Content-Type": "application/json" }, timeout: 5000 }
        );
        navigate("/dashboard?toast=updated");
      } catch (err) {
        console.error(err);
        setLoadError(err.response?.data?.message || err.message || "Failed to publish.");
      } finally {
        setSaving(false);
      }
      return;
    }
    if (!formData.thumbnail || !(formData.thumbnail instanceof File)) {
      setLoadError("กรุณาอัปโหลดรูปภาพ (Thumbnail)");
      return;
    }
    setSaving(true);
    setLoadError(null);
    try {
      const fd = buildCreateFormData(formData, STATUS_PUBLISHED);
      fd.append("imageFile", formData.thumbnail);
      await axios.post(`${API_BASE_URL}/posts`, fd, {
        headers: getAuthHeaders(),
        timeout: 15000,
      });
      navigate("/dashboard?toast=published");
    } catch (err) {
      console.error(err);
      setLoadError(err.response?.data?.message || err.message || "Failed to create post.");
    } finally {
      setSaving(false);
    }
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
                onClick={() => navigate("/dashboard")}
                className="p-2 rounded-lg text-brown-400 hover:text-brown-600 hover:bg-white transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              <h1 className="text-2xl font-semibold text-brown-600">
                {isEditMode ? "Edit article" : "Create article"}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={handleSaveDraft}
                disabled={loading || saving}
                className="bg-white hover:bg-brown-50 text-brown-600 border border-brown-300 rounded-lg px-6 py-2 h-auto shadow-sm"
              >
                {saving ? <Loader2 className="animate-spin" size={18} /> : "Save as draft"}
              </Button>
              <Button
                onClick={handlePublish}
                disabled={loading || saving}
                className="bg-brown-600 hover:bg-brown-500 text-white rounded-lg px-6 py-2 h-auto shadow-sm"
              >
                {saving ? <Loader2 className="animate-spin" size={18} /> : "Save and publish"}
              </Button>
            </div>
          </div>

          {loadError && (
            <div className="mb-4 px-4 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {loadError}
            </div>
          )}

          {loading ? (
            <div className="bg-white rounded-xl shadow-sm border border-brown-300 p-12 flex flex-col items-center justify-center gap-3">
              <Loader2 className="animate-spin text-brown-400" size={32} />
              <span className="text-brown-500">Loading article...</span>
            </div>
          ) : (
          /* Form */
          <div className="bg-white rounded-xl shadow-sm border border-brown-300 p-6 space-y-6">
            {/* Thumbnail Upload */}
            <div>
              <label className="block text-sm font-medium text-brown-600 mb-2">
                Thumbnail Image
              </label>
              {thumbnailPreview ? (
                <div className="relative w-full h-64 rounded-lg overflow-hidden border border-brown-300">
                  <img
                    src={thumbnailPreview}
                    alt="Thumbnail preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={removeThumbnail}
                    className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-brown-50 transition-colors"
                  >
                    <X size={18} className="text-brown-600" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <label className="flex items-center justify-center w-48 h-32 border-2 border-dashed border-brown-300 rounded-lg cursor-pointer hover:bg-brown-50 transition-colors">
                    <div className="flex flex-col items-center justify-center p-4">
                      <Image className="w-8 h-8 mb-2 text-brown-400" />
                      <span className="text-xs text-brown-600 font-medium">Upload thumbnail image</span>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleThumbnailChange}
                    />
                  </label>
                  {!thumbnailPreview && (
                    <p className="text-sm text-brown-400">
                      Click to upload or drag and drop
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-brown-600 mb-2">
                Category
              </label>
              <Select
                value={String(formData.category_id)}
                onValueChange={(value) =>
                  setFormData({ ...formData, category_id: parseInt(value, 10) })
                }
              >
                <SelectTrigger className="w-full bg-white border-brown-300 text-brown-600 rounded-lg">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Author */}
            <div>
              <label className="block text-sm font-medium text-brown-600 mb-2">
                Author name
              </label>
              <Input
                type="text"
                value={formData.author}
                disabled
                className="w-full bg-brown-50 border-brown-300 text-brown-600 rounded-lg cursor-not-allowed"
              />
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-brown-600 mb-2">
                Title
              </label>
              <Input
                type="text"
                placeholder="Enter article title..."
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full bg-white border-brown-300 text-brown-600 placeholder:text-brown-400 rounded-lg"
              />
            </div>

            {/* Introduction */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-brown-600">
                  Introduction
                </label>
                <span className={`text-xs ${
                  formData.introduction.length > MAX_INTRODUCTION_LENGTH
                    ? "text-red-500"
                    : "text-brown-400"
                }`}>
                  {formData.introduction.length}/{MAX_INTRODUCTION_LENGTH}
                </span>
              </div>
              <textarea
                placeholder="Enter article introduction..."
                value={formData.introduction}
                onChange={(e) => {
                  if (e.target.value.length <= MAX_INTRODUCTION_LENGTH) {
                    setFormData({ ...formData, introduction: e.target.value });
                  }
                }}
                rows={4}
                className="w-full px-4 py-3 bg-white border border-brown-300 text-brown-600 placeholder:text-brown-400 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-brown-500 focus:border-transparent"
              />
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-brown-600 mb-2">
                Content
              </label>
              <textarea
                placeholder="Write your article content here... (Markdown supported)"
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                rows={25}
                className="w-full px-4 py-3 bg-white border border-brown-300 text-brown-600 placeholder:text-brown-400 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-brown-500 focus:border-transparent font-mono text-sm"
              />
            </div>
          </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default CreateArticle;
