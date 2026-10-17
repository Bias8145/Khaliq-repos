import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
}

export class EnhancedErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    retryCount: 0
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    this.setState({ errorInfo });
    
    if (process.env.NODE_ENV === 'development') {
      console.group('🔍 Error Details');
      console.error('Message:', error.message);
      console.error('Stack:', error.stack);
      console.error('Component Stack:', errorInfo.componentStack);
      console.groupEnd();
    }
  }

  private handleRetry = () => {
    this.setState(prev => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prev.retryCount + 1
    }));
    
    if (this.state.retryCount >= 2) {
      window.location.reload();
    }
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private handleReportBug = () => {
    const errorDetails = encodeURIComponent(
      `Error: ${this.state.error?.message}\n\nStack: ${this.state.error?.stack}`
    );
    window.open(`mailto:bias.khaliq@gmail.com?subject=Bug Report&body=${errorDetails}`);
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md w-full bg-card border border-destructive/20 rounded-2xl p-8 shadow-xl text-center"
          >
            <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle size={32} aria-hidden="true" />
            </div>
            
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Something went wrong
            </h1>
            
            <p className="text-muted-foreground mb-6 text-sm">
              The application encountered an unexpected error. Please try again.
            </p>

            <div className="bg-secondary/50 p-4 rounded-lg text-left mb-6 overflow-auto max-h-32">
              <code className="text-xs text-destructive font-mono break-all">
                {this.state.error?.message}
              </code>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={this.handleRetry}
                className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2"
              >
                <RefreshCw size={18} aria-hidden="true" />
                {this.state.retryCount >= 2 ? 'Reload Page' : 'Try Again'}
              </button>
              
              <div className="flex gap-3">
                <button
                  onClick={this.handleGoHome}
                  className="flex-1 px-4 py-3 bg-secondary text-foreground rounded-xl font-bold hover:bg-secondary/80 transition-all flex items-center justify-center gap-2"
                >
                  <Home size={16} aria-hidden="true" />
                  Home
                </button>
                
                <button
                  onClick={this.handleReportBug}
                  className="flex-1 px-4 py-3 bg-secondary text-foreground rounded-xl font-bold hover:bg-secondary/80 transition-all flex items-center justify-center gap-2"
                >
                  <Bug size={16} aria-hidden="true" />
                  Report
                </button>
              </div>
            </div>

            {this.state.retryCount > 0 && (
              <p className="text-xs text-muted-foreground mt-4">
                Retry attempt: {this.state.retryCount}
              </p>
            )}
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}
