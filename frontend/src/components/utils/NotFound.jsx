import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MdHome, MdArrowBack, MdSearchOff } from 'react-icons/md';

function NotFound() {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 dark:from-dark-primary/5 dark:via-dark-background dark:to-dark-primary/10 flex items-center justify-center px-4 sm:px-6 md:px-8">
      <div className="max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl w-full text-center">
        {/* 404 Icon */}
        <div className="mb-6 sm:mb-8 md:mb-10">
          <div className="relative mx-auto w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 lg:w-56 lg:h-56">
            <div className="absolute inset-0 bg-primary/10 dark:bg-dark-primary/10 rounded-full animate-pulse"></div>
            <div className="absolute inset-4 bg-primary/20 dark:bg-dark-primary/20 rounded-full animate-ping"></div>
            <div className="absolute inset-8 bg-primary/30 dark:bg-dark-primary/30 rounded-full flex items-center justify-center">
              <MdSearchOff className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 text-primary dark:text-dark-primary" />
            </div>
          </div>
        </div>

        {/* 404 Text */}
        <div className="mb-6 sm:mb-8 md:mb-10">
          <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold text-primary dark:text-dark-primary mb-2 sm:mb-4 tracking-tight">
            404
          </h1>
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold text-onBackground dark:text-dark-onBackground mb-3 sm:mb-4 md:mb-6">
            Page Not Found
          </h2>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-neutral dark:text-dark-neutral leading-relaxed max-w-lg mx-auto px-2">
            Oops! The page you're looking for seems to have wandered off. 
            It might have been moved, deleted, or you entered the wrong URL.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 md:gap-6 justify-center items-center">
          <button
            onClick={handleGoHome}
            className="w-full sm:w-auto flex items-center justify-center gap-2 sm:gap-3 px-6 sm:px-8 md:px-10 py-3 sm:py-3.5 md:py-4 bg-primary hover:bg-primary/90 dark:bg-dark-primary dark:hover:bg-dark-primary/90 text-on-primary dark:text-dark-on-primary font-semibold rounded-lg sm:rounded-xl md:rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-lg text-sm sm:text-base md:text-lg"
          >
            <MdHome className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
            Go to Home
          </button>
          
          <button
            onClick={handleGoBack}
            className="w-full sm:w-auto flex items-center justify-center gap-2 sm:gap-3 px-6 sm:px-8 md:px-10 py-3 sm:py-3.5 md:py-4 bg-transparent hover:bg-primary/10 dark:hover:bg-dark-primary/10 text-primary dark:text-dark-primary font-semibold rounded-lg sm:rounded-xl md:rounded-2xl border-2 border-primary dark:border-dark-primary transition-all duration-300 hover:scale-105 text-sm sm:text-base md:text-lg"
          >
            <MdArrowBack className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
            Go Back
          </button>
        </div>

        {/* Additional Help Text */}
        <div className="mt-8 sm:mt-10 md:mt-12 lg:mt-16">
          <p className="text-xs sm:text-sm md:text-base text-neutral/70 dark:text-dark-neutral/70 leading-relaxed">
            If you believe this is an error, please contact our support team or try refreshing the page.
          </p>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-primary/5 dark:bg-dark-primary/5 rounded-full blur-xl animate-float hidden sm:block"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-primary/5 dark:bg-dark-primary/5 rounded-full blur-xl animate-float-delayed hidden sm:block"></div>
        <div className="absolute top-1/2 left-5 w-16 h-16 bg-primary/10 dark:bg-dark-primary/10 rounded-full blur-lg animate-pulse hidden md:block"></div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

export default NotFound;