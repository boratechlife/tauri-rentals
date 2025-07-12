import { Component, ReactNode } from 'react';

// Add ErrorBoundary class above PropertyDetails component
export class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 text-center text-red-600">
          Something went wrong.
        </div>
      );
    }
    return this.props.children;
  }
}
