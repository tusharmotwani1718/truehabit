import React, { useState, useEffect } from 'react'

function ComingSoon() {
    const [animationClass, setAnimationClass] = useState('');

    useEffect(() => {
        // Add entrance animation after component mounts
        const timer = setTimeout(() => {
            setAnimationClass('animate-fade-in');
        }, 100);

        return () => clearTimeout(timer);
    }, []);

    return (
        <main className='overflow-y-hidden min-h-screen w-full mx-auto flex items-center justify-center px-4 sm:px-6 lg:px-8'>
            <div className={`max-w-4xl mx-auto text-center ${animationClass}`}>
                {/* Main Container */}
                <div className="relative">
                    {/* Background Decoration */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-primary/5 rounded-3xl blur-3xl transform -rotate-6 scale-110"></div>

                    {/* Content Card */}
                    <div className="relative  rounded-3xl p-8 sm:p-12 lg:p-16 shadow-2xl border border-gray-100 dark:border-gray-800">
                        {/* Icon/Illustration */}
                        <div className="mb-8 relative">
                            <div className="w-32 h-32 sm:w-40 sm:h-40 mx-auto bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center shadow-xl">
                                <svg className="w-16 h-16 sm:w-20 sm:h-20 text-on-primary animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>

                            {/* Floating Elements */}
                            <div className="absolute -top-4 -right-4 w-8 h-8 bg-secondary/20 dark:bg-dark-secondary/20 rounded-full animate-bounce"></div>
                            <div className="absolute -bottom-2 -left-6 w-6 h-6 bg-primary/20 dark:bg-dark-primary/20 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }}></div>
                            <div className="absolute top-1/2 -left-8 w-4 h-4 bg-secondary/30 dark:bg-dark-secondary/30 rounded-full animate-bounce" style={{ animationDelay: '1s' }}></div>
                        </div>

                        {/* Main Heading */}
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-onBackgorund dark:text-dark-onBackground mb-6 leading-tight">
                            <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
                                Coming Soon
                            </span>
                        </h1>

                        {/* Subtitle */}
                        <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-200 mb-8 max-w-2xl mx-auto leading-relaxed">
                            We're working hard to bring you something amazing. This feature is currently under development and will be available soon!
                        </p>

                        {/* Feature Highlights */}
                        <div className="grid sm:grid-cols-3 gap-6 mb-12">
                            <div className="flex flex-col items-center p-4 rounded-2xl bg-background dark:bg-dark-background">
                                <div className="w-12 h-12 bg-primary/10 dark:bg-dark-primary/20 rounded-xl flex items-center justify-center mb-3">
                                    <svg className="w-6 h-6 text-primary dark:text-dark-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                                <h3 className="font-semibold text-onBackgorund dark:text-dark-onBackground mb-1">Fast</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-200">Lightning quick performance</p>
                            </div>

                            <div className="flex flex-col items-center p-4 rounded-2xl bg-background dark:bg-dark-background">
                                <div className="w-12 h-12 bg-secondary/10 dark:bg-dark-secondary/20 rounded-xl flex items-center justify-center mb-3">
                                    <svg className="w-6 h-6 text-secondary dark:text-dark-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h3 className="font-semibold text-onBackgorund dark:text-dark-onBackground mb-1">Reliable</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-200">Built to last and perform</p>
                            </div>

                            <div className="flex flex-col items-center p-4 rounded-2xl bg-background dark:bg-dark-background">
                                <div className="w-12 h-12 bg-primary/10 dark:bg-dark-primary/20 rounded-xl flex items-center justify-center mb-3">
                                    <svg className="w-6 h-6 text-primary dark:text-dark-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                    </svg>
                                </div>
                                <h3 className="font-semibold text-onBackgorund dark:text-dark-onBackground mb-1">Intuitive</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-200">Easy and enjoyable to use</p>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* Custom CSS for animations */}
            <style jsx>{`
                @keyframes fade-in {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                .animate-fade-in {
                    animation: fade-in 0.8s ease-out;
                }
            `}</style>
        </main>
    )
}

export default ComingSoon