import React from 'react';

const CircularProgress = ({ value, max = 100, size = 32, showPercentage = true, label }) => {
  const radius = size * 0.4;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(value / max, 1);
  const offset = circumference * (1 - progress);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: `${size}px`, height: `${size}px` }}>
        <svg className="transform -rotate-90" width={size} height={size}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className="stroke-current text-gray-200 dark:text-gray-700"
            strokeWidth="4"
            fill="transparent"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className="stroke-current text-primary dark:text-dark-primary"
            strokeWidth="4"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
          />
        </svg>
        
        {showPercentage && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-primary dark:text-dark-primary font-semibold text-sm">
              {Math.round(progress * 100)}%
            </span>
          </div>
        )}
      </div>
      
      {label && (
        <span className="text-sm text-primary/80 dark:text-dark-primary/70">
          {label}
        </span>
      )}
    </div>
  );
};

export default CircularProgress;