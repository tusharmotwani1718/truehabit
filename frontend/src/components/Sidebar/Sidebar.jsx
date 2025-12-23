import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MdLogout,
  MdChevronLeft,
  MdChevronRight,
  MdDarkMode,
  MdLightMode
} from "react-icons/md";
import { useDispatch, useSelector } from 'react-redux';
import { logout as logoutSlice } from '../../store/Slices/authSlice';
import axios from 'axios';
import { useMessage, useTheme } from '../../context';
import { persistor } from '../../store/store.js';
import api from '../../helpers/refreshToken.js';



const Sidebar = ({ items }) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Use location to determine active route
  const location = useLocation();

  // theme:
  const { theme, toggleTheme } = useTheme();

  const changeTheme = () => {
    toggleTheme();
  }

  // Function to get initials from full name
  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const dispatch = useDispatch();
  const userID = useSelector(state => state.auth.userData?._id);

  const profilePicture = useSelector(state => state.auth.userData?.profilePicture);

  const { displayMessage } = useMessage();
  const userName = useSelector(state => state.auth.userData?.fullName);


  //  console.log(userID)

  const logoutUser = async () => {
    try {
      const response = await api.post(
        `/logout`,
        {},
        { withCredentials: true }
      );

      dispatch(logoutSlice(userID));
      persistor.purge();
      localStorage.removeItem('email_verification_status');
      setTimeout(() => navigate('/'), 100); // Short delay lets state settle
      // displayMessage('success', response.data.message);
    } catch (err) {
      logoutSlice(userID);
      persistor.purge();
      localStorage.removeItem('email_verification_status');
      setTimeout(() => navigate('/'), 100); // Short delay lets state settle
      // displayMessage('error', err.response?.data?.message ?? "Failed to logout");
    }
  };


  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Get responsive animation values
  const getResponsiveAnimation = () => {
    // For mobile screens (md and below)
    const mobileAnimation = {
      x: isMobileMenuOpen ? 0 : -288,
      width: 288
    };

    // For larger screens
    const desktopAnimation = {
      x: 0,
      width: isCollapsed ? 80 : 288
    };

    return { mobileAnimation, desktopAnimation };
  };

  const { mobileAnimation, desktopAnimation } = getResponsiveAnimation();

  return (
    <>
      {/* Mobile Menu Toggle Button - Only visible on small screens */}
      <motion.button
        className="md:hidden fixed top-4 left-4 z-50 rounded-full p-2 shadow-md bg-[#673AB7] dark:bg-[#3c3c3c]"
        onClick={toggleMobileMenu}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        {isMobileMenuOpen ?
          <MdChevronLeft size={20} className="text-white" /> :
          <MdChevronRight size={20} className="text-white" />
        }
      </motion.button>

      {/* Sidebar */}
      <motion.div
        initial={{
          width: window.innerWidth < 768 ? 288 : (isCollapsed ? 80 : 288),
          x: window.innerWidth < 768 ? (isMobileMenuOpen ? 0 : -288) : 0
        }}
        animate={{
          width: window.innerWidth < 768 ? 288 : (isCollapsed ? 80 : 288),
          x: window.innerWidth < 768 ? (isMobileMenuOpen ? 0 : -288) : 0
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="fixed left-0 top-0 z-40 flex flex-col h-screen bg-[#673AB7] text-[#BEADDD] dark:bg-[#121212] dark:text-[#E0E0E0] shadow-lg border-r border-primary dark:border-dark-primary"
      >
        {/* Toggle button - Only visible on larger screens */}
        <motion.button
          className="hidden md:block absolute -right-3 top-10 z-50 rounded-full p-1 shadow-md bg-white dark:bg-[#3c3c3c]"
          onClick={toggleSidebar}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {isCollapsed ?
            <MdChevronRight size={20} className="text-[#673AB7] dark:text-[#BB86FC]" /> :
            <MdChevronLeft size={20} className="text-[#673AB7] dark:text-[#BB86FC]" />
          }
        </motion.button>

        <div className='flex flex-col h-full pt-3 px-4'>
          {/* Logo area */}
          <div className="flex items-center mb-10 mt-12 md:mt-0">
            {(!isCollapsed || window.innerWidth < 768) && (
              <motion.h2
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className='text-3xl font-bold text-white'
              >
                trueHabit
              </motion.h2>
            )}
            {isCollapsed && window.innerWidth >= 768 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-10 h-10 rounded-full bg-white flex items-center justify-center"
              >
                <span className="text-[#673AB7] font-bold text-xl">T</span>
              </motion.div>
            )}
          </div>

          {/* Main menu */}
          <div className="flex">
            <ul className='flex flex-col gap-2 mb-4 w-full'>
              {items &&
                items.map((item) => {
                  // Check if current route matches this item's path
                  const isActive = location.pathname === item.path;

                  return (
                    <li key={item.name}>
                      <motion.div
                        className="relative"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Link
                          to={item.path || "/"}
                          className={`flex items-center gap-3 w-full rounded-lg py-3 px-4 transition-colors duration-200 
                          ${isActive
                              ? 'bg-[#ffffff] text-[#673AB7] dark:bg-[#BB86FC] dark:text-[#1E0336]'
                              : 'hover:bg-[#7C4DFF] hover:text-white dark:hover:bg-[#3c3c3c] dark:hover:text-[#BB86FC]'
                            }`}
                        >
                          <span className="text-center flex-shrink-0">{item.icon}</span>

                          {(!isCollapsed || window.innerWidth < 768) && (
                            <motion.span
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="font-medium whitespace-nowrap"
                            >
                              {item.name}
                            </motion.span>
                          )}

                          {(!isCollapsed || window.innerWidth < 768) && item.badge && (
                            <span className='py-0 px-2 bg-blue-700 ml-auto rounded-full text-xs font-normal text-white'>
                              {item.badge}
                            </span>
                          )}
                        </Link>

                        {/* Tooltip for collapsed mode - Only on desktop */}
                        {isCollapsed && window.innerWidth >= 768 && (
                          <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileHover={{ opacity: 1, x: 0 }}
                            className="absolute left-16 top-2 bg-gray-800 text-white px-3 py-2 rounded-md whitespace-nowrap z-10"
                          >
                            {item.name}
                            {item.badge && (
                              <span className='py-0 px-2 bg-blue-700 ml-2 rounded-full text-xs font-normal text-white'>
                                {item.badge}
                              </span>
                            )}
                          </motion.div>
                        )}
                      </motion.div>
                    </li>
                  );
                })}
            </ul>
          </div>

          {/* Theme toggle */}
          <motion.button
            onClick={changeTheme}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className={`mb-3 self-${(isCollapsed && window.innerWidth >= 768) ? 'center' : 'start'} rounded-full p-2 bg-[#5E35B1] dark:bg-[#3c3c3c]`}
          >
            {theme === "light" ? (
              <MdDarkMode size={22} className="text-[#BB86FC]" />
            ) : (
              <MdLightMode size={22} className="text-white" />
            )}
          </motion.button>

          {/* User profile */}
          <div className="border-t border-[#8C6CC5] dark:border-gray-700 pt-4">
            {(!isCollapsed || window.innerWidth < 768) ? (
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="font-bold text-white">{userName || "User"}</span>
                  <button
                    className="flex items-center gap-2 text-sm mt-2"
                    onClick={logoutUser}
                  >
                    <span>Logout</span>
                    <MdLogout size={16} />
                  </button>
                </div>
              </div>
            ) : (
              <motion.div
                className="relative flex justify-center"
                whileHover={{ scale: 1.1 }}
              >
                {
                  profilePicture ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-10 h-10 rounded-full bg-white flex items-center justify-center overflow-hidden"
                    >
                      <span className="w-full h-full flex items-center justify-center overflow-hidden">
                        <img src={profilePicture} alt="Profile" className="w-full h-full object-cover" />
                      </span>
                    </motion.div>
                  ) : (

                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-10 h-10 rounded-full bg-white flex items-center justify-center overflow-hidden"
                    >
                      <span className="w-full h-full flex items-center justify-center text-[#673AB7] font-bold text-sm border-2 border-primary dark:border-dark-primary shadow-lg rounded-full bg-gradient-to-br from-primary to-secondary dark:from-dark-primary dark:to-dark-secondary">
                        {getInitials(userName)}
                      </span>
                    </motion.div>

                  )
                }

                {/* Tooltip for profile - Only on desktop */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileHover={{ opacity: 1, x: 0 }}
                  className="absolute left-16 top-0 bg-gray-800 text-white px-3 py-2 rounded-md whitespace-nowrap z-10"
                >
                  {userName || "User"} - Logout
                </motion.div>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default Sidebar;