import React from 'react';
import { PrimaryButton } from '../index.js';


class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }


  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
  }


  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI for the error
      return (
        <div className="error-fallback min-h-screen flex flex-col items-center justify-center">
          <h1 className='text-primary dark:text-dark-primary text-3xl sm:text-4xl md:text-5xl font-bold mb-4'>Oops! Something went wrong.</h1>
          <p>{this.state.error?.message || "An error occurred"}</p>
          <PrimaryButton
            text='Reload'
            onClick={() => window.location.reload()} />
        </div>
      );
    }

    // Normally, just render children in case of no error
    return this.props.children;
  }

}

export default ErrorBoundary;