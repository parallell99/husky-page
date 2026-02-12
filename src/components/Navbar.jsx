import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bell, User, RotateCcw, LogOut, ChevronDown } from "lucide-react";

function Navbar() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const dropdownRef = useRef(null);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const notificationDropdownRef = useRef(null);

  // Check login status from localStorage
  useEffect(() => {
    const checkLoginStatus = () => {
      const loginStatus = localStorage.getItem("isLoggedIn");
      const profile = localStorage.getItem("user_profile");
      
      setIsLoggedIn(loginStatus === "true");
      
      if (profile) {
        try {
          setUserProfile(JSON.parse(profile));
        } catch (error) {
          console.error("Error parsing user profile:", error);
        }
      } else {
        // Default profile if none exists
        setUserProfile({
          name: "Moodeng ja",
          username: "moodeng",
          email: "",
          profileImage: null,
        });
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

  // Listen for notification updates
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "notifications") {
        setNotifications(loadNotifications());
      }
    };
    const handleNotificationUpdate = () => {
      setNotifications(loadNotifications());
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("notificationUpdate", handleNotificationUpdate);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("notificationUpdate", handleNotificationUpdate);
    };
  }, []);

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
    localStorage.removeItem("isLoggedIn");
    setIsLoggedIn(false);
    setShowDropdown(false);
    // Trigger custom event for Navbar update
    window.dispatchEvent(new Event("loginChange"));
    navigate("/");
  };

  const getUserDisplayName = () => {
    if (userProfile?.name) {
      return userProfile.name;
    }
    return "Moodeng ja";
  };

  const getUserAvatar = () => {
    if (userProfile?.profileImage) {
      return userProfile.profileImage;
    }
    return null;
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

  const getNotificationCountDisplay = () => {
    const count = notifications.length;
    if (count <= 0) return null;
    if (count > 99) return "99+";
    return count.toString();
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

  const handleNotificationClick = (notification) => {
    setShowNotificationDropdown(false);
    setIsOpen(false);
    if (notification.postId) {
      navigate(`/post/${notification.postId}#comments`);
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
            {/* Notification Icon with Dropdown */}
            <div className="relative" ref={notificationDropdownRef}>
              <button
                onClick={() => setShowNotificationDropdown(!showNotificationDropdown)}
                className="relative p-2 text-brown-600 hover:text-brown-800 transition-colors "
              >
                <Bell size={20} />
                {/* Notification count badge */}
                {notifications.length > 0 && (
                  <span className="absolute top-0 right-0 min-w-[18px] h-[18px] bg-red-500 text-white text-xs font-semibold rounded-full flex items-center justify-center px-1">
                    {getNotificationCountDisplay()}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotificationDropdown && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-brown-200 overflow-hidden z-50 max-h-[400px] overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-6 text-center">
                      <span className="text-sm text-brown-400">No notifications</span>
                    </div>
                  ) : (
                    <div className="divide-y divide-brown-200">
                      {notifications.map((notification) => (
                        <button
                          key={notification.id}
                          onClick={() => handleNotificationClick(notification)}
                          className="w-full text-left px-4 py-3 hover:bg-brown-50 transition-colors flex items-start gap-3"
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
                        </button>
                      ))}
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
                className="relative p-2 text-brown-600 hover:text-brown-800 transition-colors max-lg:hidden"
              >
                <Bell size={18} />
                {/* Notification count badge */}
                {notifications.length > 0 && (
                  <span className="absolute top-0 right-0 min-w-[16px] h-[16px] bg-red-500 text-white text-[10px] font-semibold rounded-full flex items-center justify-center px-0.5">
                    {getNotificationCountDisplay()}
                  </span>
                )}
              </button>

              {/* Notification Dropdown - Mobile */}
              {showNotificationDropdown && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-brown-200 overflow-hidden z-50 max-h-[400px] overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-6 text-center">
                      <span className="text-sm text-brown-400">No notifications</span>
                    </div>
                  ) : (
                    <div className="divide-y divide-brown-200">
                      {notifications.map((notification) => (
                        <button
                          key={notification.id}
                          onClick={() => handleNotificationClick(notification)}
                          className="w-full text-left px-4 py-3 hover:bg-brown-50 transition-colors flex items-start gap-3"
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
                        </button>
                      ))}
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
                      
                      {/* Notification Bell */}
                      <div className="relative" ref={notificationDropdownRef}>
                        <button
                          onClick={() => setShowNotificationDropdown(!showNotificationDropdown)}
                          className="relative p-2 text-brown-600 hover:text-brown-800 transition-colors"
                        >
                          <Bell size={20} />
                          {/* Notification count badge */}
                          {notifications.length > 0 && (
                            <span className="absolute top-0 right-0 min-w-[18px] h-[18px] bg-red-500 text-white text-xs font-semibold rounded-full flex items-center justify-center px-1">
                              {getNotificationCountDisplay()}
                            </span>
                          )}
                        </button>

                        {/* Notification Dropdown - Mobile Hamburger Menu */}
                        {showNotificationDropdown && (
                          <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-brown-200 overflow-hidden z-50 max-h-[400px] overflow-y-auto">
                            {notifications.length === 0 ? (
                              <div className="px-4 py-6 text-center">
                                <span className="text-sm text-brown-400">No notifications</span>
                              </div>
                            ) : (
                              <div className="divide-y divide-brown-200">
                                {notifications.map((notification) => (
                                  <button
                                    key={notification.id}
                                    onClick={() => handleNotificationClick(notification)}
                                    className="w-full text-left px-4 py-3 hover:bg-brown-50 transition-colors flex items-start gap-3"
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
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Menu Items */}
                  <div className="p-4 flex flex-col gap-2">
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
