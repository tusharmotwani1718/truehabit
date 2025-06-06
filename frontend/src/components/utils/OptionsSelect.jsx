import React from 'react';

const OptionSelect = ({
  options = [],
  selectedId,
  onSelect = () => {}
}) => {

  const handleSelect = (id) => {
    if (id !== selectedId) {  // prevent unnecessary reselect
      onSelect(id);
    }
  };

  return (
    <div className="w-full px-1">
      <div className="hidden md:flex justify-between items-center bg-on-primary dark:bg-dark-on-primary rounded-lg p-1 shadow-sm border border-gray-100">
        
        {options.map((option) => (
          
          <button
            key={option.id}
            onClick={() => handleSelect(option.id)}
            className={`px-6 py-3 rounded-md text-sm font-medium transition-all duration-200 flex-1 mx-1 ${
              selectedId === option.id
                ? 'bg-primary text-white shadow-md dark:bg-dark-primary'
                : 'bg-transparent text-gray-600 hover:bg-gray-50'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default OptionSelect;
