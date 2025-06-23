import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { GiHamburgerMenu } from 'react-icons/gi';
import { IoClose } from 'react-icons/io5';
import { motion, AnimatePresence } from 'framer-motion';
import PrimaryButton from '../Buttons/PrimaryButton';
import ModalWindow from '../../ant-design/ModalWindow';
import { useModal } from '../../context';
import { useDispatch, useSelector } from 'react-redux';
import { logout as logoutSlice } from '../../store/Slices/authSlice';
import ThemeToggler from '../ThemeBtn/Themetoggler';

function Header({ navList }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [navbarOpen, setNavbarOpen] = useState(false);

  const dispatch = useDispatch();
  const authStatus = useSelector(state => state.auth.authStatus);

  const toggleNavbar = () => {
    setNavbarOpen((prev) => !prev);
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const { openModal } = useModal();

  return (
    <>
      {/* Main Header */}
      <header
        className={`w-full backdrop-blur-sm sticky top-0 z-40 transition-all duration-300 ${isScrolled ? 'bg-on-primary/50 shadow-md dark:bg-dark-on-primary/40' : 'bg-primary/20 dark:bg-dark-primary/20'
          }`}
      >
        <div className="container mx-auto flex items-center justify-between p-4">
          {/* Logo */}
          <h2 className={`text-[1.3rem] md:text-2xl font-bold text-primary dark:text-dark-primary`}>trueHabit</h2>

          {/* Signup and Login Buttons (Visible on small screens) */}
          <div className="md:hidden flex gap-3">
            <PrimaryButton text="Signup" classes='rounded-2xl' onClick={() => { openModal("authModalSignup") }} />
            <PrimaryButton text="Login" classes='rounded-2xl' onClick={() => { openModal("authModalLogin") }} />
          </div>

          {/* Hamburger Icon */}
          <button
            className="md:hidden z-50"
            onClick={toggleNavbar}
            aria-label="Toggle Navbar"
          >
            {navbarOpen ? (
              <IoClose size={25} className="text-on-primary dark:text-dark-primary" />
            ) : (
              <GiHamburgerMenu size={25} className="text-primary dark:text-dark-primary" />
            )}
          </button>

          <ModalWindow />

          {/* Navbar for Medium and Larger Screens */}
          <nav className="hidden md:flex md:items-center md:gap-7">
            <ul className="flex gap-7 font-semibold text-md text-primary dark:text-dark-primary">
              {navList &&
                navList.map((navItem) => (
                  <li key={navItem.id}>
                    <NavLink
                      to={navItem.link}
                      className={({ isActive }) =>
                        `transition-colors ${isActive
                          ? 'text-[#816ea3] dark:text-[#8e7ca4] underline underline-offset-4 decoration-2'
                          : 'text-primary dark:text-dark-primary hover:text-[#725da7]'
                        } font-semibold`
                      }
                    >
                      {navItem.text}
                    </NavLink>
                  </li>
                ))}
            </ul>

            {/* Theme Toggler */}
            <ThemeToggler variant="default" />

            <div className="flex gap-5">
              <PrimaryButton text="Signup" onClick={() => { openModal("authModalSignup") }} />
              <PrimaryButton text="Login" onClick={() => { openModal("authModalLogin") }} />
              {authStatus && (
                <PrimaryButton text="Logout" onClick={() => dispatch(logoutSlice())} />
              )}
            </div>
          </nav>
        </div>
      </header>

      {/* Navbar for Small Screens (with animations) */}
      <AnimatePresence>
        {navbarOpen && (
          <>
            {/* Backdrop for Mobile */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={toggleNavbar}
            />

            {/* Mobile Navbar Container */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              style={{ backgroundColor: 'var(--primary-color, #725da7)' }}
              className="fixed inset-y-0 left-0 w-3/4 shadow-lg z-50 md:hidden"
            >
              <div className="h-[100svh] bg-on-primary dark:bg-dark-primary p-8 flex flex-col gap-10 z-50">
                {/* Logo */}
                <h2 className="text-2xl font-bold text-primary dark:text-white mb-8">trueHabit</h2>

                {/* Navigation Links */}
                <ul className="flex flex-col gap-10 font-semibold text-md text-primary dark:text-white">
                  {navList &&
                    navList.map((navItem) => (
                      <li key={navItem.id}>
                        <NavLink
                          to={navItem.link}
                          className={({ isActive }) =>
                            `transition-colors ${isActive
                              ? 'md:text-[#e6e0f0] dark:text-[#e6e0f0] md:underline md:underline-offset-4 md:decoration-2'
                              : 'md:text-white dark:text-white hover:text-[#e6e0f0]'
                            } font-bold`
                          }
                          onClick={toggleNavbar}
                        >
                          {navItem.text}
                        </NavLink>
                      </li>
                    ))}
                </ul>

                {/* Theme Toggler in mobile menu */}
                <ThemeToggler variant="mobile-menu" className="mr-2" />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export default Header;
