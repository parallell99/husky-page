import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "@/api/client";
import {
  FileText,
  FolderOpen,
  User,
  Bell,
  KeyRound,
  LogOut,
  MessageCircle,
  Newspaper,
  Heart,
} from "lucide-react";
import { apiClient } from "@/api/client";

const NOTIFICATION_TYPE = { NEW_ARTICLE: "new_article", COMMENT: "comment", LIKE: "like" };

function Notification() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState(null);

  const menuItems = [
    { icon: FileText, label: "Article Management", active: false, path: "/dashboard" },
    { icon: FolderOpen, label: "Category Management", active: false, path: "/dashboard/categories" },
    { icon: User, label: "Profile", active: false, path: "/dashboard/profile" },
    { icon: Bell, label: "Notification", active: true, path: "/dashboard/notification" },
    { icon: KeyRound, label: "Reset Password", active: false, path: "/dashboard/reset-password" },
    { icon: LogOut, label: "Logout", active: false, path: "/dashboard" },
  ];

  // Convert API timestamp to hoursAgo
  const convertTimestampToHoursAgo = (timestamp) => {
    if (!timestamp) return 0;
    
    let date;
    try {
      // Handle ISO string
      if (typeof timestamp === "string") {
        date = new Date(timestamp);
      }
      // Handle Unix timestamp (seconds or milliseconds)
      else if (typeof timestamp === "number") {
        // If timestamp is less than 1e12, assume seconds, else milliseconds
        date = new Date(timestamp < 1e12 ? timestamp * 1000 : timestamp);
      }
      // Handle Date object
      else if (timestamp instanceof Date) {
        date = timestamp;
      } else {
        return 0;
      }
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 0;
      }
      
      const now = new Date();
      const diffMs = now - date;
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      
      return Math.max(0, diffHours);
    } catch (err) {
      console.error("Error converting timestamp:", err);
      return 0;
    }
  };

  // Format relative time
  const getRelativeTime = (hoursAgo) => {
    if (hoursAgo < 1) {
      return "Just now";
    } else if (hoursAgo === 1) {
      return "1 hour ago";
    } else if (hoursAgo < 24) {
      return `${hoursAgo} hours ago`;
    } else {
      const daysAgo = Math.floor(hoursAgo / 24);
      return daysAgo === 1 ? "1 day ago" : `${daysAgo} days ago`;
    }
  };

  const getDefaultNotifications = () => [
    { id: 1, type: NOTIFICATION_TYPE.NEW_ARTICLE, text: "มีบทความใหม่: The Art of Mindfulness", hoursAgo: 1, postId: 1 },
    { id: 2, type: NOTIFICATION_TYPE.COMMENT, text: "มีคนคอมเม้นในบทความ 'The Art of Mindfulness'", hoursAgo: 2, postId: 1 },
    { id: 3, type: NOTIFICATION_TYPE.NEW_ARTICLE, text: "มีบทความใหม่: Cat Nutrition Guide", hoursAgo: 5, postId: 2 },
    { id: 4, type: NOTIFICATION_TYPE.COMMENT, text: "มีคนคอมเม้นในบทความ 'Cat Nutrition Guide'", hoursAgo: 8, postId: 2 },
  ];

  const getNotificationTypeDisplay = (type) => {
    switch (type) {
      case NOTIFICATION_TYPE.NEW_ARTICLE:
        return { icon: Newspaper, label: "บทความใหม่", bgClass: "bg-green-100 text-green-700" };
      case NOTIFICATION_TYPE.COMMENT:
        return { icon: MessageCircle, label: "คอมเม้น", bgClass: "bg-amber-100 text-amber-700" };
      case NOTIFICATION_TYPE.LIKE:
        return { icon: Heart, label: "Like", bgClass: "bg-rose-100 text-rose-700" };
      default:
        return { icon: Bell, label: "แจ้งเตือน", bgClass: "bg-brown-200 text-brown-600" };
    }
  };

  const normalizeNotificationType = (list) => {
    if (!Array.isArray(list)) return list;
    return list.map((n) => {
      if (n.type === NOTIFICATION_TYPE.NEW_ARTICLE || n.type === NOTIFICATION_TYPE.COMMENT || n.type === NOTIFICATION_TYPE.LIKE) return n;
      const t = (n.text || "").toLowerCase();
      const inferred = t.includes("like") ? NOTIFICATION_TYPE.LIKE
        : t.includes("คอมเม้น") || t.includes("comment") ? NOTIFICATION_TYPE.COMMENT
        : t.includes("บทความใหม่") || t.includes("new article") || t.includes("published") ? NOTIFICATION_TYPE.NEW_ARTICLE
        : null;
      return { ...n, type: n.type || inferred };
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("isLoggedIn");
    window.dispatchEvent(new Event("loginChange"));
    navigate("/");
  };

  // admin เห็นเฉพาะแจ้งเตือน comment และ like
  const displayNotifications = userRole === "admin"
    ? notifications.filter((n) => n.type === NOTIFICATION_TYPE.COMMENT || n.type === NOTIFICATION_TYPE.LIKE)
    : notifications;

  // เมื่อเปิดหน้านี้ = อ่านแล้ว → บันทึกเวลาอ่าน เพื่อให้ Navbar ซ่อนเลขแจ้งเตือน
  useEffect(() => {
    const readAt = Date.now().toString();
    localStorage.setItem("notifications_read_at", readAt);
    window.dispatchEvent(new Event("notificationRead"));
  }, []);

  const loadNotifications = () => {
    const stored = localStorage.getItem("notifications");
    if (stored) {
      try {
        return normalizeNotificationType(JSON.parse(stored));
      } catch (e) {
        return getDefaultNotifications();
      }
    }
    return getDefaultNotifications();
  };

  // Fetch notifications from API
  const fetchNotifications = async (showError = false) => {
    try {
      setLoading(true);
      if (showError) {
        setError(null);
      }

      const endpoint = `${API_BASE_URL}/notifications`;
      const response = await axios.get(endpoint, {
        timeout: 3000,
      });

      console.log("Success fetching notifications:", response.data);

      // Handle different response formats
      let notificationsData = [];
      if (response.data) {
        if (Array.isArray(response.data)) {
          notificationsData = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          notificationsData = response.data.data;
        } else if (response.data.notifications && Array.isArray(response.data.notifications)) {
          notificationsData = response.data.notifications;
        } else if (response.data.results && Array.isArray(response.data.results)) {
          notificationsData = response.data.results;
        } else {
          const values = Object.values(response.data);
          if (values.length > 0 && Array.isArray(values[0])) {
            notificationsData = values[0];
          }
        }
      }

      // Map API response to component's expected format
      const mappedNotifications = notificationsData.map((notification, index) => {
        // Extract text from various possible fields
        const text = notification.text || 
                     notification.message || 
                     notification.content || 
                     notification.description || 
                     "Notification";

        // Extract avatar from various possible fields
        const avatar = notification.avatar || 
                       notification.userAvatar || 
                       notification.user?.avatar || 
                       null;

        // Extract timestamp and convert to hoursAgo
        const timestamp = notification.createdAt || 
                          notification.timestamp || 
                          notification.date || 
                          notification.created_at;
        
        const hoursAgo = timestamp ? convertTimestampToHoursAgo(timestamp) : 0;

        // Extract post/article ID from various possible fields
        const postId = notification.postId ?? notification.post_id ?? notification.articleId ?? notification.article_id ?? notification.relatedPostId ?? notification.post?.id ?? notification.article?.id ?? null;
        const type = notification.type || notification.notification_type || null;

        return {
          id: notification.id || index + 1,
          type,
          avatar,
          text,
          hoursAgo,
          postId,
          created_at: timestamp || null,
        };
      });

      const normalized = normalizeNotificationType(mappedNotifications);
      setNotifications(normalized);
      setError(null);
      if (normalized.length > 0) {
        localStorage.setItem("notifications", JSON.stringify(normalized));
      } else {
        localStorage.removeItem("notifications");
      }
    } catch (err) {
      console.error("Error fetching notifications:", err);
      // Only show error if explicitly requested (e.g., on retry)
      if (showError) {
        let errorMessage = "Failed to load notifications from API. Showing local data.";
        if (err.response?.status === 404) {
          errorMessage = "Notifications endpoint not found. Showing local data.";
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

  // โหลด role ของ user (admin จะเห็นเฉพาะ comment + like)
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    apiClient.get("/auth/get-user").then((res) => {
      setUserRole(res.data?.role || null);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    setNotifications(loadNotifications());
    fetchNotifications(false);
  }, []);

  const handleView = (notification) => {
    const postId = notification.postId ?? notification.post_id;
    if (postId) {
      navigate(`/post/${postId}#comments`);
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
                  onClick={() => (item.label === "Logout" ? handleLogout() : navigate(item.path))}
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
                  onClick={() => (item.label === "Logout" ? handleLogout() : navigate(item.path))}
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
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-brown-600">
              Notifications
            </h1>
          </div>

          {/* Notification List */}
          <div className="bg-white rounded-xl shadow-sm border border-brown-300 overflow-hidden">
            {displayNotifications.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <span className="text-sm text-brown-400">
                  No notifications found.
                </span>
              </div>
            ) : (
              <div className="divide-y divide-brown-300">
                {displayNotifications.map((notification) => {
                  const typeDisplay = getNotificationTypeDisplay(notification.type);
                  const TypeIcon = typeDisplay.icon;
                  const hasPost = !!(notification.postId ?? notification.post_id);
                  return (
                    <div
                      key={notification.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => hasPost && handleView(notification)}
                      onKeyDown={(e) => hasPost && (e.key === "Enter" || e.key === " ") && handleView(notification)}
                      className={`px-6 py-4 hover:bg-brown-50 transition-colors flex items-center gap-4 ${hasPost ? "cursor-pointer" : ""}`}
                    >
                      <div className="shrink-0 flex flex-col items-center gap-1">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${typeDisplay.bgClass}`}>
                          <TypeIcon className="w-5 h-5" />
                        </div>
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${typeDisplay.bgClass}`}>
                          {typeDisplay.label}
                        </span>
                      </div>
                      {notification.avatar && (
                        <div className="shrink-0">
                          <img src={notification.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-brown-600">{notification.text}</p>
                        <p className="text-xs text-orange mt-1">{getRelativeTime(notification.hoursAgo)}</p>
                      </div>
                      {hasPost && (
                        <div className="shrink-0">
                          <span className="text-sm font-medium text-brown-600 hover:text-brown-800 transition-colors hover:underline">
                            View
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default Notification;
