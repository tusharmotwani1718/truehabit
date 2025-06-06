import React from 'react';
import { FaSun, FaMoon } from 'react-icons/fa';
import { useTheme } from '../../context';


const ThemeToggler = ({ className = '', variant = 'default' }) => {

  // theme context: 
  const { theme, toggleTheme } = useTheme();

  // Different styling based on where the toggler is used
  let buttonStyles = "";
  let iconStyles = "";

  if (variant === 'mobile-menu') {
    // For collapsed mobile menu - #ffffff in light mode, dark bg in dark mode
    buttonStyles = "bg-primary/20 dark:bg-white/20 hover:bg-primary/30 dark:hover:bg-white/30";
    iconStyles = "text-primary dark:text-white";
  } else if (variant === 'mobile-navbar') {
    // For small screen navbar - #673AB7 in light mode, #BB86FC in dark mode
    buttonStyles = "bg-white/20 dark:bg-white/20 hover:bg-white/30 dark:hover:bg-white/30";
    iconStyles = "text-white dark:text-black";
  } else {
    // Default for desktop navbar
    buttonStyles = "bg-primary/20 dark:bg-dark-primary/40 hover:bg-primary/30 dark:hover:bg-dark-primary/50";
    iconStyles = "text-primary dark:text-dark-primary";
  }

  return (
    <button
      aria-label="Toggle theme"
      className={`relative inline-flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 
      ${buttonStyles} 
      focus:outline-none focus:ring-2 focus:ring-primary/70 dark:focus:ring-white/70 ${className}`
      }
      onClick={toggleTheme}
    >


      {
      theme === 'dark' ? (
        <FaSun className={`absolute ${iconStyles} transform scale-100 transition-transform duration-300 ease-in-out`} size={18} />
      ) : (
        <FaMoon className={`absolute ${iconStyles} transform scale-100 transition-transform duration-300 ease-in-out`} size={18} />
      )
      }
    </button>
  );
};

export default ThemeToggler;