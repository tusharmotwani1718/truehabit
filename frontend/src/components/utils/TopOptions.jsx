import React, { useState } from 'react';
import { MdAdd, MdMenu } from 'react-icons/md';
import { motion, AnimatePresence } from 'framer-motion';

function TopOptions({
  options = [],
  className = ""
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isMobile = window.innerWidth < 640;

  // For single option, we'll show either a floating button (mobile) or the regular option (desktop)
  const singleOption = options[0];

  return (
    <div className={`relative flex justify-end my-4 sm:my-6 ${className}`}>
      {/* Desktop View - Always visible */}
      <div className="hidden sm:block">
        <OptionButton 
          option={singleOption}
          className="px-4 py-2 rounded-lg bg-primary dark:bg-dark-primary text-white hover:bg-primary/90 dark:hover:bg-dark-primary/90 transition-colors"
        />
      </div>

      {/* Mobile View - Floating action button */}
      <div className="sm:hidden">
        <AnimatePresence>
          {isMobileMenuOpen ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 bottom-full mb-2 z-10"
            >
              <OptionButton
                option={singleOption}
                className="px-4 py-2 rounded-lg bg-primary dark:bg-dark-primary text-white shadow-lg"
                onClick={() => setIsMobileMenuOpen(false)}
              />
            </motion.div>
          ) : null}
        </AnimatePresence>

        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-3 rounded-full bg-primary dark:bg-dark-primary text-white shadow-lg hover:bg-primary/90 dark:hover:bg-dark-primary/90 transition-colors"
          aria-label="Add habit"
        >
          <MdAdd size={24} />
        </button>
      </div>
    </div>
  );
}

const OptionButton = ({ option, className, onClick }) => {
  const handleClick = (e) => {
    option.onClick?.();
    onClick?.();
  };

  return (
    <button
      onClick={handleClick}
      className={`flex items-center gap-2 font-medium ${className} ${option.disabled && 'pointer-events-none opacity-50'}`}
      disabled={option.disabled}
    >
      {option.optionIcon}
      {option.optionName}
    </button>
  );
};

export default TopOptions;