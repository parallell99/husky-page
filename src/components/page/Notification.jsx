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
} from "lucide-react";

function Notification() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  const getDefaultNotifications = () => {
    return [
      {
        id: 1,
        avatar: null,
        text: "User commented on your article 'The Art of Mindfulness'",
        hoursAgo: 2,
        postId: 1, // Default post ID for testing
      },
      {
        id: 2,
        avatar: null,
        text: "New follower: John Doe started following you",
        hoursAgo: 4,
        postId: null, // No associated post
      },
      {
        id: 3,
        avatar: null,
        text: "Your article 'Cat Nutrition Guide' was published",
        hoursAgo: 6,
        postId: 2, // Default post ID for testing
      },
      {
        id: 4,
        avatar: null,
        text: "User liked your article 'The Power of Habits'",
        hoursAgo: 12,
        postId: 3, // Default post ID for testing
      },
      {
        id: 5,
        avatar: null,
        text: "Comment reply: Sarah replied to your comment",
        hoursAgo: 18,
        postId: 1, // Default post ID for testing
      },
      {
        id: 6,
        avatar: null,
        text: "Your draft 'Future of Work' was auto-saved",
        hoursAgo: 24,
        postId: null, // No associated post
      },
    ];
  };

  // Load notifications from localStorage or use default
  const loadNotifications = () => {
    const storedNotifications = localStorage.getItem("notifications");
    if (storedNotifications) {
      try {
        return JSON.parse(storedNotifications);
      } catch (error) {
        console.error("Error loading notifications:", error);
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
        const postId = notification.postId || 
                       notification.articleId || 
                       notification.post_id || 
                       notification.article_id || 
                       notification.relatedPostId ||
                       notification.post?.id ||
                       notification.article?.id ||
                       null;

        return {
          id: notification.id || index + 1,
          avatar: avatar,
          text: text,
          hoursAgo: hoursAgo,
          postId: postId,
        };
      });

      if (mappedNotifications.length > 0) {
        setNotifications(mappedNotifications);
        setError(null); // Clear error if API succeeds
        
        // Save to localStorage for offline access
        localStorage.setItem("notifications", JSON.stringify(mappedNotifications));
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

  // Load notifications on mount
  useEffect(() => {
    // Set notifications from storage/fallback immediately for instant display
    setNotifications(loadNotifications());
    
    // Fetch from API in background (silently, without showing error)
    fetchNotifications(false);
  }, []);

  const handleView = (notificationId) => {
    // Find the notification by ID
    const notification = notifications.find((n) => n.id === notificationId);
    
    if (!notification) {
      console.error("Notification not found:", notificationId);
      return;
    }

    // Extract postId from notification
    const postId = notification.postId;

    // Navigate to post detail page with comment section hash
    if (postId) {
      navigate(`/post/${postId}#comments`);
    } else {
      // If no postId, log and do nothing (or navigate to home)
      console.log("Notification has no associated post:", notificationId);
      // Optionally navigate to home or show a message
      // navigate("/");
    }
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
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-brown-600">
              Notifications
            </h1>
          </div>

          {/* Notification List */}
          <div className="bg-white rounded-xl shadow-sm border border-brown-300 overflow-hidden">
            {notifications.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <span className="text-sm text-brown-400">
                  No notifications found.
                </span>
              </div>
            ) : (
              <div className="divide-y divide-brown-300">
                {notifications.map((notification, index) => (
                  <div
                    key={notification.id}
                    className="px-6 py-4 hover:bg-brown-50 transition-colors flex items-center gap-4"
                  >
                    {/* Avatar */}
                    <div className="shrink-0">
                      {notification.avatar ? (
                        <img
                          src={notification.avatar}
                          alt="User"
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-brown-200 border border-brown-300 flex items-center justify-center">
                          <User className="w-6 h-6 text-brown-400" />
                        </div>
                      )}
                    </div>

                    {/* Notification Content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-brown-600">
                        {notification.text}
                      </p>
                      <p className="text-xs text-orange mt-1">
                        {getRelativeTime(notification.hoursAgo)}
                      </p>
                    </div>

                    {/* View Link */}
                    <div className="shrink-0">
                      <button
                        onClick={() => handleView(notification.id)}
                        className="text-sm font-medium text-brown-600 hover:text-brown-800 transition-colors hover:underline cursor-pointer"
                      >
                        View
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default Notification;
