import React, { useState, useEffect } from 'react';

const CheckMark = ({
  checked = false,
  onChange,
  disabled = false,
  size = 'md',
  label,
  displayNone = false,
  tooltip = null
}) => {
  const [isMounted, setIsMounted] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  const handleClick = () => {
    if (disabled) return;
    onChange(); // Let parent handle the state change
  };

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const checkmarkSize = {
    sm: 'w-2 h-3',
    md: 'w-2.5 h-4',
    lg: 'w-3 h-5'
  };

  return (
    <div
      className={`flex items-center gap-3 ${checked ? 'opacity-60 cursor-not-allowed' : ''}  ${displayNone ? 'hidden' : ''}`}
      onClick={!checked ? handleClick : null}
    >
      <div
        className="relative"
        onMouseEnter={() => tooltip && setShowTooltip(true)}
        onMouseLeave={() => tooltip && setShowTooltip(false)}
      >
        <div
          className={`
            relative flex items-center justify-center rounded-xl
            border-2 transition-all duration-200 ease-in-out
            ${sizeClasses[size]}
            ${checked ?
              'border-transparent bg-[#673AB7] dark:bg-[#BB86FC]' :
              'border-[#9E9E9E] dark:border-[#757575] bg-transparent'
            }
            ${!disabled && 'hover:shadow-md hover:scale-105'}
            focus:outline-none focus:ring-2 focus:ring-[#673AB7] dark:focus:ring-[#BB86FC]
          `}
        >
          {/* show tooltip only when checked */}
          {checked && (
            <svg
              className={`${checkmarkSize[size]} text-white dark:text-[#1E0336] transition-all duration-200 ${isMounted ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
                }`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </div>

        {checked && tooltip && showTooltip && (
          <div className="absolute z-10 bottom-2 md:bottom-5 left-full transform translate-x-2 ml-1 px-2 py-1 text-xs text-white bg-primary dark:bg-dark-primary rounded whitespace-nowrap font-bold">
            {tooltip}
            <div className="absolute top-1/2 right-full w-2 h-2 bg-primary dark:bg-dark-primary transform -translate-y-1/2 rotate-45"></div>
          </div>
        )}
      </div>

      {label && (
        <span className="text-[#1E1E1E] dark:text-[#E0E0E0] select-none">
          {label}
        </span>
      )}
    </div>
  );
};

export default CheckMark;