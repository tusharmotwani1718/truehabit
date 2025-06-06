import React from 'react';

const ProgressBar = ({
  value = 65,
  max = 100,
  label = 'Progress',
  showValue = true,
  size = 'default',
  className = '',          // for overriding progress fill styles
  outerClassName = '',     // for background bar styles
  textClassName = '',      // for text color styles
}) => {
  const percentage = Math.min((value / max) * 100, 100);

  const sizeVariants = {
    sm: 'h-1.5',
    default: 'h-2.5',
    lg: 'h-3.5',
  };

  const heightClass = sizeVariants[size] || sizeVariants.default;

  // Default fill gradient using Tailwind's arbitrary value syntax
  const defaultFillClass = 'bg-gradient-to-r from-[#673AB7] to-[#673AB7] dark:from-[#BB86FC] dark:to-[#BB86FC]';

  // Default text color
  const defaultTextClass = 'text-[#673AB7] dark:text-[#BB86FC]';

  return (
    <div className="w-full space-y-2">
      {(label || showValue) && (
        <div className="flex justify-between items-center">
          {label && (
            <span className={`text-sm font-medium ${textClassName || defaultTextClass}`}>
              {label}
            </span>
          )}

          {showValue && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                {value}/{max}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${textClassName || defaultTextClass}`}>
                {Math.round(percentage)}%
              </span>
            </div>
          )}
        </div>
      )}

      <div className={`w-full rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 ${outerClassName}`}>
        <div
          className={`${heightClass} transition-all duration-300 ease-out rounded-full ${className || defaultFillClass}`}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
