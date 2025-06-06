import React from 'react';

const Spinner = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'h-5 w-5',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  return (
    <div 
      className={`inline-block ${sizeClasses[size]} animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite] ${className}`}
      style={{ 
        borderColor: 'var(--color-primary)',
        borderRightColor: 'transparent'
      }}
      role="status"
    >
      <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
        Loading...
      </span>
    </div>
  );
};

// Dark mode variant
export const SpinnerDark = ({ size = 'md', className = '' }) => {
  return (
    <div className="dark">
      <Spinner 
        size={size} 
        className={className}
        style={{
          borderColor: 'var(--color-dark-primary)',
          borderRightColor: 'transparent'
        }}
      />
    </div>
  );
};

// Usage examples:
export const SpinnerExamples = () => {
  return (
    <div className="flex items-center justify-center gap-4 p-8">
      <Spinner size="sm" />
      <Spinner />
      <Spinner size="lg" />
      <SpinnerDark size="md" />
    </div>
  );
};

export default Spinner;