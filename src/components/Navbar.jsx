import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bell, User, RotateCcw, LogOut, ChevronDown, LayoutDashboard } from "lucide-react";
import { apiClient } from "@/api/client";

function Navbar() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const dropdownRef = useRef(null);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationsReadAt, setNotificationsReadAt] = useState(() =>
    localStorage.getItem("notifications_read_at")
  );
  const notificationDropdownRef = useRef(null);

  // Fetch user profile from Supabase API
  const fetchUserProfile = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setIsLoggedIn(false);
      setUserProfile(null);
      return;
    }

    try {
      setLoadingProfile(true);
      const { data } = await apiClient.get("/auth/get-user");
      setUserProfile({
        name: data.name || "",
        username: data.username || "",
        email: data.email || "",
        profileImage: data.profilePic || null,
        role: data.role || null,
      });
      setIsLoggedIn(true);
    } catch (err) {
      console.error("Error fetching user profile:", err);
      if (err.response?.status === 401) {
        // Token expired or invalid
        localStorage.removeItem("token");
        localStorage.removeItem("isLoggedIn");
        setIsLoggedIn(false);
        setUserProfile(null);
      }
    } finally {
      setLoadingProfile(false);
    }
  };

  // Check login status and fetch user profile
  useEffect(() => {
    const checkLoginStatus = () => {
      const loginStatus = localStorage.getItem("isLoggedIn");
      const token = localStorage.getItem("token");
      
      if (loginStatus === "true" && token) {
        setIsLoggedIn(true);
        fetchUserProfile();
      } else {
        setIsLoggedIn(false);
        setUserProfile(null);
      }
    };

    checkLoginStatus();
    
    // Listen for storage changes (for cross-tab updates)
    window.addEventListener("storage", checkLoginStatus);
    
    // Listen for custom login/logout events (for same-tab updates)
    const handleLoginChange = () => {
      checkLoginStatus();
    };
    window.addEventListener("loginChange", handleLoginChange);
    
    return () => {
      window.removeEventListener("storage", checkLoginStatus);
      window.removeEventListener("loginChange", handleLoginChange);
    };
  }, []);

  // Load notifications on mount
  useEffect(() => {
    setNotifications(loadNotifications());
  }, []);

  // ดึงแจ้งเตือนจาก API (ใช้ทั้งตอน login และเมื่อมีกิจกรรมใหม่ เช่น like)
  const fetchNotificationsFromApi = () => {
    apiClient.get("/notifications", { timeout: 10000 }).then((res) => {
      const raw = Array.isArray(res.data) ? res.data : res.data?.data || res.data?.notifications || [];
      const mapped = raw.map((n, i) => {
        const created = n.created_at ?? n.createdAt ?? n.date;
        const createdMs = created ? new Date(created).getTime() : 0;
        const hoursAgo = createdMs ? Math.max(0, Math.floor((Date.now() - createdMs) / (1000 * 60 * 60))) : 0;
        const nameFromUsers = n.actor_name ?? n.name ?? null;
        return {
          id: n.id ?? i + 1,
          type: n.type,
          text: n.text ?? n.message ?? "",
          postId: n.post_id ?? n.postId,
          post_id: n.post_id ?? n.postId,
          hoursAgo,
          created_at: created,
          name: nameFromUsers,
          actor_name: nameFromUsers,
        };
      });
      setNotifications(mapped);
      if (mapped.length > 0) localStorage.setItem("notifications", JSON.stringify(mapped));
    }).catch(() => {});
  };

  useEffect(() => {
    if (!isLoggedIn) return;
    fetchNotificationsFromApi();
  }, [isLoggedIn]);

  // Listen for notification updates (storage, อ่านแล้ว, หรือมีแจ้งเตือนใหม่ เช่น หลัง like)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "notifications") {
        setNotifications(loadNotifications());
      }
    };
    const handleNotificationUpdate = () => {
      setNotifications(loadNotifications());
    };
    const handleNotificationRead = () => {
      setNotificationsReadAt(localStorage.getItem("notifications_read_at"));
    };
    const handleNotificationsRefresh = () => {
      if (isLoggedIn) fetchNotificationsFromApi();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("notificationUpdate", handleNotificationUpdate);
    window.addEventListener("notificationRead", handleNotificationRead);
    window.addEventListener("notificationsRefresh", handleNotificationsRefresh);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("notificationUpdate", handleNotificationUpdate);
      window.removeEventListener("notificationRead", handleNotificationRead);
      window.removeEventListener("notificationsRefresh", handleNotificationsRefresh);
    };
  }, [isLoggedIn]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
      if (notificationDropdownRef.current && !notificationDropdownRef.current.contains(event.target)) {
        setShowNotificationDropdown(false);
      }
    };

    if (showDropdown || showNotificationDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown, showNotificationDropdown]);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("isLoggedIn");
    setIsLoggedIn(false);
    setUserProfile(null);
    setShowDropdown(false);
    // Trigger custom event for Navbar update
    window.dispatchEvent(new Event("loginChange"));
    navigate("/");
  };

  const getUserDisplayName = () => {
    if (userProfile?.name) {
      return userProfile.name;
    }
    if (userProfile?.username) {
      return userProfile.username;
    }
    return "User";
  };

  const getUserAvatar = () => {
    return userProfile?.profileImage || null;
  };

  // Notification helper functions
  const getDefaultNotifications = () => {
    return [
      {
        id: 1,
        avatar: null,
        text: "User commented on your article 'The Art of Mindfulness'",
        hoursAgo: 2,
        postId: 1,
      },
      {
        id: 2,
        avatar: null,
        text: "New follower: John Doe started following you",
        hoursAgo: 4,
        postId: null,
      },
      {
        id: 3,
        avatar: null,
        text: "Your article 'Cat Nutrition Guide' was published",
        hoursAgo: 6,
        postId: 2,
      },
      {
        id: 4,
        avatar: null,
        text: "User liked your article 'The Power of Habits'",
        hoursAgo: 12,
        postId: 3,
      },
      {
        id: 5,
        avatar: null,
        text: "Comment reply: Sarah replied to your comment",
        hoursAgo: 18,
        postId: 1,
      },
      {
        id: 6,
        avatar: null,
        text: "Your draft 'Future of Work' was auto-saved",
        hoursAgo: 24,
        postId: null,
      },
    ];
  };

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

  // admin แสดงเฉพาะแจ้งเตือน comment และ like
  const notificationsToShow =
    userProfile?.role === "admin"
      ? notifications.filter((n) => n.type === "comment" || n.type === "like")
      : notifications;

  // นับเฉพาะที่ยังไม่อ่าน (สร้างหลังเวลาที่เปิดหน้า Notification ล่าสุด)
  const unreadCount = (() => {
    const readAt = notificationsReadAt ? parseInt(notificationsReadAt, 10) : 0;
    if (!readAt) return notificationsToShow.length;
    return notificationsToShow.filter((n) => {
      const created = n.created_at ? new Date(n.created_at).getTime() : 0;
      return created > readAt;
    }).length;
  })();

  const getNotificationCountDisplay = () => {
    if (unreadCount <= 0) return null;
    if (unreadCount > 99) return "99+";
    return unreadCount.toString();
  };

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

  // แสดงแบบ "ชื่อ" (ตัวหนา) แล้วต่อด้วยกิจกรรม — รองรับทั้งรูปแบบใหม่และข้อความเก่าใน DB
  const renderNotificationText = (notificationOrText) => {
    const isObj = notificationOrText && typeof notificationOrText === "object";
    const text = (isObj ? notificationOrText?.text : notificationOrText) || "";
    const nameFromApi = isObj ? (notificationOrText?.actor_name ?? notificationOrText?.name) : null;
    let namePart = nameFromApi;
    let actionPart = text.trim();
    if (!namePart && text) {
      const dotSpace = ". ";
      const idx = text.indexOf(dotSpace);
      if (idx > 0) {
        namePart = text.slice(0, idx);
        actionPart = text.slice(idx + dotSpace.length);
      } else if (text.includes("มีคนคอมเม้นในบทความ")) {
        namePart = "Someone";
        actionPart = text.replace(/^มีคนคอมเม้นในบทความ\s*/, "commented on the article ");
      } else if (text.includes("มีบทความใหม่")) {
        namePart = "Admin";
        actionPart = text.replace(/^มีบทความใหม่\s*:?\s*/, "Published new article: ").trim() || "Published new article.";
      } else if (text.includes("มีคนกด like")) {
        namePart = "Someone";
        actionPart = text.replace(/^มีคนกด like\s*/, "liked the article ");
      }
    }
    if (namePart) {
      return (
        <span>
          <span className="font-semibold text-brown-800">{namePart}</span>
          {actionPart ? <> {" "}{actionPart}</> : null}
        </span>
      );
    }
    return text || "—";
  };

  const handleNotificationClick = (notification) => {
    setShowNotificationDropdown(false);
    setIsOpen(false);
    const postId = notification.postId ?? notification.post_id;
    if (postId) {
      navigate(`/post/${postId}#comments`);
    } else {
      navigate("/dashboard/notification");
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-brown-100 border-b border-brown-300 px-6 w-full h-[48px] lg:h-[80px] lg:px-20 z-40">
      <div className=" mx-auto flex justify-between items-center h-full">
        {/* Logo */}
       <Link to="/"> <div className=" text-2xl font-semibold lg:w-[44px] md:h-[44px] flex items-center justify-center">
            <span className="text-brown-600">hh</span>
            <span className="text-green text-2xl">.</span>
          </div>
        </Link>

        {/* Desktop Menu - Conditional Rendering */}
        {isLoggedIn ? (
          <div className="hidden lg:flex gap-4 items-center">
            {/* Notification - ทั้ง admin และ user โชว์ dropdown + คลิกรายการลิงก์ไป post/:id */}
            <div className="relative" ref={notificationDropdownRef}>
              <button
                onClick={() => setShowNotificationDropdown(!showNotificationDropdown)}
                className="relative p-2 text-brown-600 hover:text-brown-800 transition-colors"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 min-w-[18px] h-[18px] bg-red-500 text-white text-xs font-semibold rounded-full flex items-center justify-center px-1">
                    {getNotificationCountDisplay()}
                  </span>
                )}
              </button>
              {showNotificationDropdown && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-brown-200 overflow-hidden z-50 max-h-[400px] overflow-y-auto">
                  {notificationsToShow.length === 0 ? (
                    <div className="px-4 py-6 text-center">
                      <span className="text-sm text-brown-400">No notifications</span>
                    </div>
                  ) : (
                    <div className="divide-y divide-brown-200">
                      {notificationsToShow.map((notification) => {
                        const postId = notification.postId ?? notification.post_id;
                        const to = postId ? `/post/${postId}#comments` : "/dashboard/notification";
                        return (
                          <Link
                            key={notification.id}
                            to={to}
                            onClick={() => setShowNotificationDropdown(false)}
                            className="w-full text-left px-4 py-3 hover:bg-brown-50 transition-colors flex items-start gap-3"
                          >
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
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-brown-600">{renderNotificationText(notification)}</p>
                              <p className="text-xs text-orange mt-1">
                                {getRelativeTime(notification.hoursAgo)}
                              </p>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                  {userProfile?.role === "admin" && (
                    <div className="border-t border-brown-200 p-2">
                      <Link
                        to="/dashboard/notification"
                        onClick={() => setShowNotificationDropdown(false)}
                        className="block text-center text-sm font-medium text-brown-600 hover:text-brown-800 py-2"
                      >
                        ดูทั้งหมด
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* User Profile Section */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-brown-200 transition-colors"
              >
                {/* User Avatar */}
                {getUserAvatar() ? (
                  <img
                    src={getUserAvatar()}
                    alt="User"
                    className="w-8 h-8 rounded-full object-cover border border-brown-300"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-brown-200 border border-brown-300 flex items-center justify-center">
                    <User className="w-5 h-5 text-brown-600" />
                  </div>
                )}
                
                {/* Username */}
                <span className="text-sm font-medium text-brown-600">
                  {getUserDisplayName()}
                </span>
                
                {/* Dropdown Arrow */}
                <ChevronDown 
                  size={16} 
                  className={`text-brown-600 transition-transform ${
                    showDropdown ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Dropdown Menu */}
              {showDropdown && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-brown-200 overflow-hidden z-50">
                  {userProfile?.role === "admin" && (
                    <Link
                      to="/dashboard"
                      onClick={() => setShowDropdown(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200 border-b border-gray-100"
                    >
                      <LayoutDashboard size={16} className="text-brown-600" />
                      <span className="font-medium">Dashboard</span>
                    </Link>
                  )}
                  <Link
                    to="/member"
                    onClick={() => setShowDropdown(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200 border-b border-gray-100"
                  >
                    <User size={16} className="text-brown-600" />
                    <span className="font-medium">Profile</span>
                  </Link>
                  
                  <Link
                    to="/member/reset-password"
                    onClick={() => setShowDropdown(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200 border-b border-gray-100"
                  >
                    <RotateCcw size={16} className="text-brown-600" />
                    <span className="font-medium">Reset password</span>
                  </Link>
                  
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                  >
                    <LogOut size={16} className="text-brown-600" />
                    <span className="font-medium">Log out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="hidden lg:flex gap-3 items-center">
            <Link to="/login"><button className="bg-white border border-brown-600 text-brown-600 px-6 py-2 rounded-4xl text-sm font-medium cursor-pointer transition-all duration-200 hover:bg-brown-100 hover:border-brown-500 w-[127px] h-[48px]">
              Log in
            </button></Link>
            <Link to="/signup"><button className="bg-brown-600 border-none text-white px-6 py-2 rounded-4xl text-sm font-medium cursor-pointer transition-all duration-200 hover:bg-brown-500 w-[127px] h-[48px]">
              Sign up
            </button></Link>
          </div>
        )}

        {/* Mobile Menu - Notification & Hamburger */}
        <div className="lg:hidden flex items-center gap-2">
          {/* Notification Icon - Mobile */}
          {isLoggedIn && (
            <div className="relative" ref={notificationDropdownRef}>
              <button
                onClick={() => setShowNotificationDropdown(!showNotificationDropdown)}
                className="relative p-2 text-brown-600 hover:text-brown-800 transition-colors"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 min-w-[16px] h-[16px] bg-red-500 text-white text-[10px] font-semibold rounded-full flex items-center justify-center px-0.5">
                    {getNotificationCountDisplay()}
                  </span>
                )}
              </button>
              {showNotificationDropdown && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-brown-200 overflow-hidden z-50 max-h-[400px] overflow-y-auto">
                  {notificationsToShow.length === 0 ? (
                    <div className="px-4 py-6 text-center">
                      <span className="text-sm text-brown-400">No notifications</span>
                    </div>
                  ) : (
                    <div className="divide-y divide-brown-200">
                      {notificationsToShow.map((notification) => {
                        const postId = notification.postId ?? notification.post_id;
                        const to = postId ? `/post/${postId}#comments` : "/dashboard/notification";
                        return (
                          <Link
                            key={notification.id}
                            to={to}
                            onClick={() => setShowNotificationDropdown(false)}
                            className="w-full text-left px-4 py-3 hover:bg-brown-50 transition-colors flex items-start gap-3"
                          >
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
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-brown-600">{renderNotificationText(notification)}</p>
                              <p className="text-xs text-orange mt-1">
                                {getRelativeTime(notification.hoursAgo)}
                              </p>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                  {userProfile?.role === "admin" && (
                    <div className="border-t border-brown-200 p-2">
                      <Link
                        to="/dashboard/notification"
                        onClick={() => setShowNotificationDropdown(false)}
                        className="block text-center text-sm font-medium text-brown-600 hover:text-brown-800 py-2"
                      >
                        ดูทั้งหมด
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          
          {/* Hamburger Menu */}
          <button
            className="flex flex-col gap-1 items-center justify-center p-3 bg-transparent border-none cursor-pointer"
            aria-label="Menu"
            onClick={toggleMenu}
          >
            <span className="w-6 h-0.5 bg-brown-600 rounded-sm transition-all duration-300"></span>
            <span className="w-6 h-0.5 bg-brown-600 rounded-sm transition-all duration-300"></span>
            <span className="w-6 h-0.5 bg-brown-600 rounded-sm transition-all duration-300"></span>
          </button>
        </div>
        {isOpen ? (
          <div 
            className="lg:hidden fixed top-[48px] left-0 right-0 z-50 pointer-events-none"
          >
            <div 
              className="bg-white shadow-lg border-b border-brown-300 w-full pointer-events-auto"
            >
              {isLoggedIn ? (
                <>
                  {/* User Profile Section */}
                  <div className="px-6 py-4 border-b border-brown-200 bg-brown-50">
                    <div className="flex items-center gap-3">
                      {/* User Avatar */}
                      {getUserAvatar() ? (
                        <img
                          src={getUserAvatar()}
                          alt="User"
                          className="w-12 h-12 rounded-full object-cover border border-brown-300"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-brown-200 border border-brown-300 flex items-center justify-center">
                          <User className="w-6 h-6 text-brown-600" />
                        </div>
                      )}
                      
                      {/* Username */}
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-brown-600">
                          {getUserDisplayName()}
                        </p>
                      </div>
                      
                      {/* Notification Bell - โชว์ dropdown ทั้ง admin/user คลิกลิงก์ไป post/:id */}
                      <div className="relative" ref={notificationDropdownRef}>
                        <button
                          onClick={() => setShowNotificationDropdown(!showNotificationDropdown)}
                          className="relative p-2 text-brown-600 hover:text-brown-800 transition-colors"
                        >
                          <Bell size={20} />
                          {unreadCount > 0 && (
                            <span className="absolute top-0 right-0 min-w-[18px] h-[18px] bg-red-500 text-white text-xs font-semibold rounded-full flex items-center justify-center px-1">
                              {getNotificationCountDisplay()}
                            </span>
                          )}
                        </button>
                        {showNotificationDropdown && (
                          <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-brown-200 overflow-hidden z-50 max-h-[400px] overflow-y-auto">
                            {notificationsToShow.length === 0 ? (
                              <div className="px-4 py-6 text-center">
                                <span className="text-sm text-brown-400">No notifications</span>
                              </div>
                            ) : (
                              <div className="divide-y divide-brown-200">
                                {notificationsToShow.map((notification) => {
                                  const postId = notification.postId ?? notification.post_id;
                                  const to = postId ? `/post/${postId}#comments` : "/dashboard/notification";
                                  return (
                                    <Link
                                      key={notification.id}
                                      to={to}
                                      onClick={() => { setShowNotificationDropdown(false); setIsOpen(false); }}
                                      className="w-full text-left px-4 py-3 hover:bg-brown-50 transition-colors flex items-start gap-3"
                                    >
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
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-brown-600">{renderNotificationText(notification)}</p>
                                        <p className="text-xs text-orange mt-1">
                                          {getRelativeTime(notification.hoursAgo)}
                                        </p>
                                      </div>
                                    </Link>
                                  );
                                })}
                              </div>
                            )}
                            {userProfile?.role === "admin" && (
                              <div className="border-t border-brown-200 p-2">
                                <Link
                                  to="/dashboard/notification"
                                  onClick={() => { setShowNotificationDropdown(false); setIsOpen(false); }}
                                  className="block text-center text-sm font-medium text-brown-600 hover:text-brown-800 py-2"
                                >
                                  ดูทั้งหมด
                                </Link>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Menu Items */}
                  <div className="p-4 flex flex-col gap-2">
                    {userProfile?.role === "admin" && (
                      <Link 
                        to="/dashboard" 
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-brown-600 hover:bg-brown-100 transition-colors"
                      >
                        <LayoutDashboard size={18} className="text-brown-600" />
                        <span>Dashboard</span>
                      </Link>
                    )}
                    <Link 
                      to="/member" 
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-brown-600 hover:bg-brown-100 transition-colors"
                    >
                      <User size={18} className="text-brown-600" />
                      <span>Profile</span>
                    </Link>
                    
                    <Link 
                      to="/member/reset-password" 
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-brown-600 hover:bg-brown-100 transition-colors"
                    >
                      <RotateCcw size={18} className="text-brown-600" />
                      <span>Reset password</span>
                    </Link>
                    
                    <button 
                      onClick={() => {
                        handleLogout();
                        setIsOpen(false);
                      }}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-brown-600 hover:bg-brown-100 transition-colors"
                    >
                      <LogOut size={18} className="text-brown-600" />
                      <span>Log out</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="p-6 flex flex-col gap-3">
                  <Link to="/login" onClick={() => setIsOpen(false)}>
                    <button className="bg-white border border-brown-600 text-brown-600 px-6 py-2 rounded-4xl text-sm font-medium cursor-pointer transition-all duration-200 hover:bg-brown-100 hover:border-brown-500 w-full h-[48px]">
                      Log in
                    </button>
                  </Link>
                  <Link to="/signup" onClick={() => setIsOpen(false)}>
                    <button className="bg-brown-600 border-none text-white px-6 py-2 rounded-4xl text-sm font-medium cursor-pointer transition-all duration-200 hover:bg-brown-500 w-full h-[48px]">
                      Sign up
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </nav>
  );
}

export default Navbar;
