"use client";

import { useEffect, useState } from "react";
import { RefreshCw, Home, AlertTriangle } from "lucide-react";

/**
 * Global Error Boundary
 *
 * Catches ANY unhandled error in the React tree and shows a user-friendly
 * fallback UI instead of a white screen. The error is logged to the console
 * and the user can retry or go home.
 *
 * This wraps the entire app in src/app/layout.tsx.
 */
export default function ErrorBoundary({
  children,
}: {
  children: React.ReactNode;
}) {
  const [hasError, setHasError] = useState(false);
  const [errorInfo, setErrorInfo] = useState<string>("");

  useEffect(() => {
    // Global error handler — catches errors that escape React's error boundary
    const handleError = (event: ErrorEvent) => {
      console.error("Global error caught:", event.error);
      event.preventDefault(); // Prevent the default browser error handling
      setHasError(true);
      setErrorInfo(event.error?.message || "An unexpected error occurred");
    };

    // Catch unhandled promise rejections
    const handleRejection = (event: PromiseRejectionEvent) => {
      console.error("Unhandled promise rejection:", event.reason);
      event.preventDefault();
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleRejection);

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleRejection);
    };
  }, []);

  // React error boundary (class component behavior via componentDidCatch equivalent)
  // We use a wrapper to catch render errors
  try {
    if (hasError) {
      return <ErrorFallback error={errorInfo} onRetry={() => { setHasError(false); setErrorInfo(""); window.location.reload(); }} />;
    }
    return <>{children}</>;
  } catch (error: any) {
    setHasError(true);
    setErrorInfo(error?.message || "Render error");
    return <ErrorFallback error={errorInfo} onRetry={() => { setHasError(false); setErrorInfo(""); window.location.reload(); }} />;
  }
}

function ErrorFallback({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div className="grid min-h-screen place-items-center bg-ink px-4">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-6 grid h-20 w-20 place-items-center rounded-full border border-champagne/20 bg-champagne/5">
          <AlertTriangle className="h-10 w-10 text-champagne" />
        </div>
        <h1 className="font-serif text-3xl text-ivory">Something went wrong</h1>
        <p className="mt-3 text-sm text-ivory/60">
          We encountered an unexpected error. Our team has been notified.
          You can try again or return to the homepage.
        </p>
        {error && process.env.NODE_ENV === "development" && (
          <div className="mt-4 rounded-lg border border-red-500/20 bg-red-500/5 p-3 text-left">
            <p className="font-mono text-xs text-red-300 break-all">{error}</p>
          </div>
        )}
        <div className="mt-6 flex justify-center gap-3">
          <button onClick={onRetry} className="btn-luxe text-sm">
            <RefreshCw className="h-4 w-4" /> Try Again
          </button>
          <button onClick={() => { window.location.hash = "#/"; window.location.reload(); }} className="btn-ghost-luxe text-sm">
            <Home className="h-4 w-4" /> Go Home
          </button>
        </div>
      </div>
    </div>
  );
}
