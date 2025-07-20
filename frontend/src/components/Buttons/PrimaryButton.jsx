import React from 'react';

function PrimaryButton({
  text = "Button",
  borderColor = "on-primary",
  hoverBorderColor = "primary",
  classes = "",
  width = "max",
  borderRadius = "sm",
  icon,
  background = true,
  border = false,
  disabled = false,
  ...props
}) {
  // Map border radius values to actual pixel values
  const radiusMap = {
    "none": "0",
    "sm": "0.25rem",
    "md": "0.375rem",
    "lg": "0.5rem",
    "xl": "0.75rem",
    "2xl": "1rem",
    "full": "9999px"
  };
  
  const actualRadius = radiusMap[borderRadius] || "0.25rem";
  
  // Width classes
  const widthClasses = {
    "auto": "w-auto",
    "max": "w-max",
    "full": "w-full",
  };
  
  const widthClass = widthClasses[width] || "w-max";
  
  return (
    <button
      className={`
        ${widthClass}
        relative px-4 py-1 md:px-6 md:py-1 
        ${background ? 'bg-primary text-on-primary dark:bg-dark-primary dark:text-dark-on-primary ' : 'bg-transparent'}
        ${border ? `border border-${borderColor}` : ""}
        group overflow-hidden
        transition-all duration-300 ease-out
        ${classes}
        ${disabled ? "opacity-50 cursor-not-allowed" : "hover:shadow-lg hover:scale-105"}
      `}
      style={{ borderRadius: actualRadius }}
      {...props}
    >
      {/* Background hover effect */}
      <span 
        className={`absolute inset-0 w-full h-full ${background ? 'bg-on-primary' : "" } opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out`}
      />
      
      {/* Content container */}
      <span className={`
        relative z-10 flex items-center justify-center gap-3 
        ${background ? "group-hover:text-primary" : "group-hover:text-gray-500"}
        transition-colors duration-300 ease-out
        text-sm md:text-base font-medium
      `}>
        <span>{text}</span>
        {icon && <span className="flex-shrink-0">{icon}</span>}
      </span>
      
      {/* Border animation on hover */}
      <span 
        className={`absolute inset-0 border border-transparent group-hover:border-${hoverBorderColor} transition-colors duration-300 ease-out`}
        style={{ borderRadius: actualRadius }}
      />
    </button>
  );
}

export default PrimaryButton;