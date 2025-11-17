import React from 'react';

class ErrorBoundary extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  componentDidCatch(error, info) {
    console.warn('ErrorBoundary caught an error in Fight UI:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary-fallback" role="alert" aria-label="Rendering error">
          Something went wrong while rendering the fight. Please try reloading.
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;