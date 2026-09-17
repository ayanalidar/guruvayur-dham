"use client";

import { RefreshCw, Home } from "lucide-react";

/**
 * Next.js Error Page (app/error.tsx)
 *
 * Catches errors in the page-level React tree (inside layout).
 * Shows a fallback UI with retry + home buttons.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="grid min-h-screen place-items-center bg-ink px-4">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-6 grid h-20 w-20 place-items-center rounded-full border border-champagne/20 bg-champagne/5">
          <span className="font-serif text-3xl">⚠</span>
        </div>
        <h1 className="font-serif text-3xl text-ivory">Page Error</h1>
        <p className="mt-3 text-sm text-ivory/60">
          This page encountered an error. Try refreshing, or go back to the homepage.
        </p>
        {process.env.NODE_ENV === "development" && (
          <div className="mt-4 rounded-lg border border-red-500/20 bg-red-500/5 p-3 text-left">
            <p className="font-mono text-xs text-red-300 break-all">{error.message}</p>
          </div>
        )}
        <div className="mt-6 flex justify-center gap-3">
          <button onClick={reset} className="btn-luxe text-sm">
            <RefreshCw className="h-4 w-4" /> Try Again
          </button>
          <button onClick={() => { window.location.hash = "#/"; }} className="btn-ghost-luxe text-sm">
            <Home className="h-4 w-4" /> Go Home
          </button>
        </div>
      </div>
    </div>
  );
}
