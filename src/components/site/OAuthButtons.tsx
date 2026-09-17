"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useHashRoute } from "@/lib/router";
import { toast } from "sonner";

export default function OAuthButtons() {
  const { navigate } = useHashRoute();
  const [status, setStatus] = useState<any>(null);

  useEffect(() => {
    fetch("/api/oauth-status", { cache: "no-store" })
      .then(r => r.json())
      .then(setStatus);
  }, []);

  if (!status) return null;

  // If no OAuth providers are configured, don't show any buttons
  if (!status.google && !status.facebook) return null;

  const handleGoogleLogin = () => {
    if (status.google) {
      window.location.assign("/api/auth/signin/google");
    } else {
      toast.info("Google OAuth not configured");
    }
  };

  const handleFacebookLogin = () => {
    if (status.facebook) {
      window.location.assign("/api/auth/signin/facebook");
    } else {
      toast.info("Facebook OAuth not configured");
    }
  };

  return (
    <div>
      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-champagne/10" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-ink-card px-3 text-ivory/40">or continue with</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {status.google && (
          <button
            onClick={handleGoogleLogin}
            className="flex items-center justify-center gap-2 rounded-lg border border-champagne/15 bg-ink/50 px-4 py-2.5 text-sm font-medium text-ivory transition-all hover:border-champagne/30 hover:bg-ink"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Google
          </button>
        )}

        {status.facebook && (
          <button
            onClick={handleFacebookLogin}
            className="flex items-center justify-center gap-2 rounded-lg border border-champagne/15 bg-ink/50 px-4 py-2.5 text-sm font-medium text-ivory transition-all hover:border-champagne/30 hover:bg-ink"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="#1877F2">
              <path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.41 0 12.07C0 18.1 4.39 23.09 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.89v2.25h3.32l-.53 3.49h-2.8V24C19.61 23.09 24 18.1 24 12.07z" />
            </svg>
            Facebook
          </button>
        )}
      </div>
    </div>
  );
}
