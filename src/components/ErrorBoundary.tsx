"use client";

import React from "react";
import { logError } from "@/src/lib/logger";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    logError(error, {
      component: "ErrorBoundary",
      action: "componentDidCatch",
      extra: {
        componentStack: errorInfo.componentStack ?? undefined,
      },
    });
  }

  handleRetry = (): void => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render(): React.ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          role="alert"
          className="card flex flex-col items-center justify-center gap-4 p-8 text-center"
        >
          <h2 className="text-xl font-bold text-hc-fg">
            Something went wrong
          </h2>
          <p className="text-sm text-hc-fg">
            An unexpected error occurred. Please try again.
          </p>
          {this.state.error && (
            <p className="error-text" aria-live="polite">
              {this.state.error.message}
            </p>
          )}
          <button
            type="button"
            className="btn btn-primary"
            onClick={this.handleRetry}
            aria-label="Retry loading the content"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}