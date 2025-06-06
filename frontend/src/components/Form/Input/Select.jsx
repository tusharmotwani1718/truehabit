import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const SelectInput = ({ 
  options = [], 
  label, 
  placeholder = "Select an option", 
  onChange, 
  value, 
  name,
  error,
  required = false,
  disabled = false,
  className = "" 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(value || null);
  
  const handleSelect = (option) => {
    setSelectedOption(option);
    setIsOpen(false);
    if (onChange) {
      onChange(option);
    }
  };

  const selectedLabel = selectedOption ? 
    options.find(opt => opt.value === selectedOption)?.label || placeholder : 
    placeholder;

  return (
    <div className={`relative w-full ${className}`}>
      {label && (
        <label 
          className="block text-sm font-medium text-gray-700 mb-1"
          htmlFor={name}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <button
          type="button"
          id={name}
          disabled={disabled}
          className={`relative w-full bg-white border rounded-lg py-2.5 pl-3 pr-10 text-left shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 sm:text-sm transition-all
            ${error ? 'border-red-500' : 'border-gray-300'} 
            ${disabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'cursor-pointer hover:border-purple-400'}`}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-labelledby={label}
        >
          <span className={`block truncate ${!selectedOption ? 'text-gray-500' : 'text-gray-900'}`}>
            {selectedLabel}
          </span>
          <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <ChevronDown 
              className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`} 
              aria-hidden="true" 
            />
          </span>
        </button>

        {isOpen && (
          <ul
            className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm"
            tabIndex={-1}
            role="listbox"
          >
            {options.length === 0 ? (
              <li className="text-gray-500 select-none py-2 px-3">No options available</li>
            ) : (
              options.map((option, index) => (
                <li
                  key={`${option.value}-${index}`}
                  className={`cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-purple-50 transition-colors
                    ${option.value === selectedOption ? 'bg-purple-100 text-purple-900' : 'text-gray-900'}`}
                  onClick={() => handleSelect(option.value)}
                  role="option"
                  aria-selected={option.value === selectedOption}
                >
                  <span className={`block truncate ${option.value === selectedOption ? 'font-medium' : 'font-normal'}`}>
                    {option.label}
                  </span>
                </li>
              ))
            )}
          </ul>
        )}
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};



export default SelectInput;