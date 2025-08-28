import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        errorInfo: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { 
            hasError: true, 
            error,
            errorInfo: null 
        };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
        this.setState({
            error,
            errorInfo
        });
    }

    private handleReset = () => {
        this.setState({ 
            hasError: false, 
            error: null,
            errorInfo: null 
        });
        window.location.reload();
    };

    private handleGoHome = () => {
        window.location.href = '/';
    };

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 dark:from-gray-900 dark:to-gray-800">
                    <div className="max-w-md w-full px-6 py-8">
                        <div className="text-center">
                            {/* Error Icon */}
                            <div className="mx-auto w-24 h-24 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                                <AlertTriangle className="h-12 w-12 text-red-600 dark:text-red-400" />
                            </div>
                            
                            {/* Error Message */}
                            <h2 className="mt-6 text-2xl font-semibold text-gray-900 dark:text-white">
                                Oops! Terjadi Kesalahan
                            </h2>
                            <p className="mt-4 text-gray-600 dark:text-gray-400">
                                Maaf, terjadi kesalahan yang tidak terduga. 
                                Silakan coba refresh halaman atau kembali ke beranda.
                            </p>
                            
                            {/* Error Details (Development Only) */}
                            {process.env.NODE_ENV === 'development' && this.state.error && (
                                <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-left">
                                    <p className="text-sm font-mono text-red-600 dark:text-red-400">
                                        {this.state.error.toString()}
                                    </p>
                                    {this.state.errorInfo && (
                                        <details className="mt-2">
                                            <summary className="cursor-pointer text-xs text-gray-500 dark:text-gray-400">
                                                Stack Trace
                                            </summary>
                                            <pre className="mt-2 text-xs text-gray-600 dark:text-gray-300 overflow-x-auto">
                                                {this.state.errorInfo.componentStack}
                                            </pre>
                                        </details>
                                    )}
                                </div>
                            )}
                            
                            {/* Action Buttons */}
                            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                                <Button 
                                    onClick={this.handleReset}
                                    variant="outline"
                                    className="inline-flex items-center"
                                >
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    Refresh Halaman
                                </Button>
                                <Button 
                                    onClick={this.handleGoHome}
                                    className="inline-flex items-center"
                                >
                                    <Home className="mr-2 h-4 w-4" />
                                    Ke Beranda
                                </Button>
                            </div>
                            
                            {/* Support Link */}
                            <div className="mt-8 text-sm text-gray-500 dark:text-gray-400">
                                <p>Jika masalah berlanjut, silakan</p>
                                <a 
                                    href="mailto:support@example.com" 
                                    className="text-blue-600 dark:text-blue-400 hover:underline"
                                >
                                    Hubungi Support
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

// HOC untuk membungkus komponen dengan Error Boundary
export function withErrorBoundary<P extends object>(
    Component: React.ComponentType<P>,
    fallback?: ReactNode
) {
    return (props: P) => (
        <ErrorBoundary fallback={fallback}>
            <Component {...props} />
        </ErrorBoundary>
    );
}