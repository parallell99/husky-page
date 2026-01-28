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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

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
            {/* Notification Icon */}
            <Link to="/dashboard/notification" className="relative">
              <button className="p-2 text-brown-600 hover:text-brown-800 transition-colors">
                <Bell size={20} />
              </button>
              {/* Red notification badge */}
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </Link>

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
            <Link to="/dashboard/notification" className="relative">
              <button className="max-lg:hidden p-2 text-brown-600 hover:text-brown-800 transition-colors">
                <Bell size={18} />
              </button>
              {/* Red notification badge */}
              <span className="max-lg:hidden absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
            </Link>
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
                      <Link 
                        to="/dashboard/notification" 
                        onClick={() => setIsOpen(false)}
                        className="relative"
                      >
                        <button className="p-2 text-brown-600 hover:text-brown-800 transition-colors">
                          <Bell size={20} />
                        </button>
                        {/* Red notification badge */}
                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                      </Link>
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
