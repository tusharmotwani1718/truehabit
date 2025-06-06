import { useEffect, useState } from 'react';

const ConfirmDialog = ({
  openStatus,
  onClose,
  onConfirm,
  title = "Are you sure?",
  description = "This action cannot be undone.",
  confirmText = "Confirm",
  cancelText = "Cancel",
  buttonLoading = false,
}) => {
  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (openStatus) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [openStatus, onClose]);

  if (!openStatus) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop with blur effect */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Dialog container with improved centering */}
      <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
        <div 
          className="relative transform overflow-hidden rounded-xl bg-white dark:bg-gray-800 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg border border-gray-200 dark:border-gray-700"
          style={{
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'
          }}
        >
          {/* Content */}
          <div className="bg-white dark:bg-gray-800 px-6 pb-6 pt-6">
            <div className="sm:flex sm:items-start">
              {/* Icon with gradient background */}
              <div className="mx-auto flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 dark:bg-dark-primary/20 sm:mx-0 sm:h-12 sm:w-12"
                style={{
                  background: 'linear-gradient(135deg, rgba(103, 58, 183, 0.1) 0%, rgba(140, 108, 197, 0.2) 100%)',
                  boxShadow: '0 0 0 2px rgba(103, 58, 183, 0.2) inset'
                }}
              >
                <svg
                  className="h-7 w-7 text-primary dark:text-dark-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              
              {/* Text content with improved typography */}
              <div className="mt-4 text-center sm:ml-5 sm:mt-0 sm:text-left">
                <h3 className="text-lg font-semibold leading-6 text-gray-900 dark:text-gray-100">
                  {title}
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {description}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Actions with refined buttons */}
          <div className="bg-gray-50 dark:bg-gray-900/50 px-6 py-4 sm:flex sm:flex-row-reverse sm:gap-3">
            {/* Confirm button with subtle gradient and animation */}
            <button
              type="button"
              className="inline-flex w-full justify-center items-center rounded-lg bg-primary dark:bg-dark-primary px-4 py-2.5 text-sm font-medium text-on-primary dark:text-dark-on-primary shadow-sm hover:bg-primary/90 dark:hover:bg-dark-primary/90 sm:w-auto disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 ease-in-out"
              onClick={onConfirm}
              disabled={buttonLoading}
              style={{
                background: buttonLoading ? '' : 'linear-gradient(to right, #673AB7, #8C6CC5)'
              }}
            >
              {buttonLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : confirmText}
            </button>
            
            {/* Cancel button with refined styling */}
            <button
              type="button"
              className="mt-3 inline-flex w-full justify-center rounded-lg bg-white dark:bg-gray-800 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 sm:mt-0 sm:w-auto disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200"
              onClick={onClose}
              disabled={buttonLoading}
            >
              {cancelText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;