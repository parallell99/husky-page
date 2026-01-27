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
  Upload,
  X,
  Image,
} from "lucide-react";
import { blogPosts as fallbackPosts } from "@/data/blogPost";
import { saveArticle, getArticleById } from "@/utils/articleStorage";

function CreateArticle() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = id !== undefined && id !== null;
  const articleId = id;
  const [formData, setFormData] = useState({
    thumbnail: null,
    category: "",
    author: "Admin User", // Default author name
    title: "",
    introduction: "",
    content: "",
    status: "Draft",
  });
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const MAX_INTRODUCTION_LENGTH = 200;

  // Load article data if editing
  useEffect(() => {
    if (isEditMode && articleId) {
      const existingArticle = getArticleById(articleId);
      if (existingArticle) {
        setFormData({
          thumbnail: existingArticle.thumbnail || null,
          category: existingArticle.category || "",
          author: existingArticle.author || "Admin User",
          title: existingArticle.title || "",
          introduction: existingArticle.introduction || "",
          content: existingArticle.content || "",
          status: existingArticle.status || "Draft",
        });
        if (existingArticle.thumbnailPreview) {
          setThumbnailPreview(existingArticle.thumbnailPreview);
        }
      } else {
        // If article not found, redirect back
        navigate("/dashboard");
      }
    }
  }, [articleId, isEditMode, navigate]);

  const menuItems = [
    { icon: FileText, label: "Article Management", active: false, path: "/dashboard" },
    { icon: FolderOpen, label: "Category Management", active: false, path: "/dashboard" },
    { icon: User, label: "Profile", active: false, path: "/dashboard" },
    { icon: Bell, label: "Notification", active: false, path: "/dashboard/notification" },
    { icon: KeyRound, label: "Reset Password", active: false, path: "/dashboard/reset-password" },
    { icon: LogOut, label: "Logout", active: false, path: "/dashboard" },
  ];

  // Extract unique categories from fallback posts
  const categories = [
    ...new Set(fallbackPosts.map((post) => post.category)),
  ].filter(Boolean).sort();

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

  const handleSaveDraft = () => {
    const articleData = {
      ...formData,
      status: "Draft",
      thumbnailPreview: thumbnailPreview,
      id: isEditMode ? parseInt(articleId) : undefined,
    };
    
    saveArticle(articleData);
    navigate(isEditMode ? "/dashboard?toast=updated" : "/dashboard?toast=draft");
  };

  const handlePublish = () => {
    const articleData = {
      ...formData,
      status: "Published",
      thumbnailPreview: thumbnailPreview,
      id: isEditMode ? parseInt(articleId) : undefined,
    };
    
    saveArticle(articleData);
    navigate(isEditMode ? "/dashboard?toast=updated" : "/dashboard?toast=published");
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
                className="bg-white hover:bg-brown-50 text-brown-600 border border-brown-300 rounded-lg px-6 py-2 h-auto shadow-sm"
              >
                Save as draft
              </Button>
              <Button
                onClick={handlePublish}
                className="bg-brown-600 hover:bg-brown-500 text-white rounded-lg px-6 py-2 h-auto shadow-sm"
              >
                Save and publish
              </Button>
            </div>
          </div>

          {/* Form */}
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
                value={formData.category}
                onValueChange={(value) =>
                  setFormData({ ...formData, category: value })
                }
              >
                <SelectTrigger className="w-full bg-white border-brown-300 text-brown-600 rounded-lg">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
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
        </div>
      </main>
    </div>
  );
}

export default CreateArticle;
