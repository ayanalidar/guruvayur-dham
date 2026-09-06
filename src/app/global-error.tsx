"use client";

import { RefreshCw, Home } from "lucide-react";

/**
 * Next.js Global Error Page (app/global-error.tsx)
 *
 * This catches errors that escape ALL other error boundaries — including
 * errors in the root layout itself. It replaces the entire HTML document.
 *
 * Must be a full HTML document (includes <html> and <body> tags).
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, backgroundColor: "#0F0A08", fontFamily: "system-ui, sans-serif" }}>
        <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: "1rem" }}>
          <div style={{ maxWidth: "28rem", textAlign: "center", color: "#F5F0E8" }}>
            <div style={{
              width: "5rem", height: "5rem", margin: "0 auto 1.5rem",
              borderRadius: "50%", border: "1px solid rgba(212,175,55,0.2)",
              backgroundColor: "rgba(212,175,55,0.05)",
              display: "grid", placeItems: "center",
            }}>
              <span style={{ fontSize: "2rem" }}>⚠</span>
            </div>
            <h1 style={{ fontSize: "1.875rem", fontWeight: 700, margin: "0 0 0.75rem" }}>
              Application Error
            </h1>
            <p style={{ fontSize: "0.875rem", color: "rgba(245,240,232,0.6)", margin: "0 0 1.5rem" }}>
              The application encountered a critical error. Please try refreshing the page.
              If the problem persists, contact us at +91-90908 20208.
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: "0.75rem" }}>
              <button
                onClick={reset}
                style={{
                  padding: "0.625rem 1.25rem", fontSize: "0.875rem", fontWeight: 600,
                  backgroundColor: "#D4AF37", color: "#0F0A08", border: "none",
                  borderRadius: "9999px", cursor: "pointer",
                }}
              >
                Try Again
              </button>
              <button
                onClick={() => { window.location.href = "/"; }}
                style={{
                  padding: "0.625rem 1.25rem", fontSize: "0.875rem", fontWeight: 600,
                  backgroundColor: "transparent", color: "#D4AF37",
                  border: "1px solid rgba(212,175,55,0.3)", borderRadius: "9999px",
                  cursor: "pointer",
                }}
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
