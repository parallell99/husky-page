import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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

  const menuItems = [
    { icon: FileText, label: "Article Management", active: false, path: "/dashboard" },
    { icon: FolderOpen, label: "Category Management", active: false, path: "/dashboard/categories" },
    { icon: User, label: "Profile", active: false, path: "/dashboard/profile" },
    { icon: Bell, label: "Notification", active: true, path: "/dashboard/notification" },
    { icon: KeyRound, label: "Reset Password", active: false, path: "/dashboard" },
    { icon: LogOut, label: "Logout", active: false, path: "/dashboard" },
  ];

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

  // Load notifications from localStorage or use default
  useEffect(() => {
    const storedNotifications = localStorage.getItem("notifications");
    if (storedNotifications) {
      try {
        setNotifications(JSON.parse(storedNotifications));
      } catch (error) {
        console.error("Error loading notifications:", error);
        setNotifications(getDefaultNotifications());
      }
    } else {
      setNotifications(getDefaultNotifications());
    }
  }, []);

  const getDefaultNotifications = () => {
    return [
      {
        id: 1,
        avatar: null,
        text: "User commented on your article 'The Art of Mindfulness'",
        hoursAgo: 2,
      },
      {
        id: 2,
        avatar: null,
        text: "New follower: John Doe started following you",
        hoursAgo: 4,
      },
      {
        id: 3,
        avatar: null,
        text: "Your article 'Cat Nutrition Guide' was published",
        hoursAgo: 6,
      },
      {
        id: 4,
        avatar: null,
        text: "User liked your article 'The Power of Habits'",
        hoursAgo: 12,
      },
      {
        id: 5,
        avatar: null,
        text: "Comment reply: Sarah replied to your comment",
        hoursAgo: 18,
      },
      {
        id: 6,
        avatar: null,
        text: "Your draft 'Future of Work' was auto-saved",
        hoursAgo: 24,
      },
    ];
  };

  const handleView = (notificationId) => {
    // Navigate to relevant page based on notification
    console.log("View notification:", notificationId);
    // You can add navigation logic here based on notification type
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
        <div className="p-8 max-w-4xl mx-auto">
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
                      <p className="text-xs text-brown-400 mt-1">
                        {getRelativeTime(notification.hoursAgo)}
                      </p>
                    </div>

                    {/* View Link */}
                    <div className="shrink-0">
                      <button
                        onClick={() => handleView(notification.id)}
                        className="text-sm font-medium text-brown-600 hover:text-brown-800 transition-colors"
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
