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

  const handleGoogleLogin = () => {
    if (status.google) {
      // Real OAuth · redirect to NextAuth
      window.location.assign("/api/auth/signin/google");
    } else {
      // Demo mode · simulate OAuth
      toast.info("Demo mode: Add GOOGLE_CLIENT_ID to .env for real Google OAuth");
      // Simulate: create a demo OAuth user
      simulateOAuth("Google");
    }
  };

  const handleFacebookLogin = () => {
    if (status.facebook) {
      window.location.assign("/api/auth/signin/facebook");
    } else {
      toast.info("Demo mode: Add FACEBOOK_CLIENT_ID to .env for real Facebook OAuth");
      simulateOAuth("Facebook");
    }
  };

  const simulateOAuth = async (provider: string) => {
    // Create a demo OAuth user via our register API
    const demoEmail = `demo.${provider.toLowerCase()}@oauth.test`;
    const r = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: `Demo ${provider} User`,
        email: demoEmail,
        password: "oauthdemo123",
      }),
    });
    const j = await r.json();
    if (j.error && j.error.includes("already registered")) {
      // Login instead
      const loginR = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "guest", email: demoEmail, password: "oauthdemo123" }),
      });
      const loginJ = await loginR.json();
      if (loginJ.user) {
        toast.success(`Signed in with ${provider} (demo)`);
        navigate("/dashboard");
      }
    } else if (j.user) {
      toast.success(`Signed in with ${provider} (demo)`);
      navigate("/dashboard");
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
        <button
          onClick={handleGoogleLogin}
          className="flex items-center justify-center gap-2 rounded-xl border border-champagne/15 bg-ink/50 px-4 py-2.5 text-sm font-semibold text-ivory transition-all hover:border-champagne/30 hover:bg-champagne/5"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Google
        </button>

        <button
          onClick={handleFacebookLogin}
          className="flex items-center justify-center gap-2 rounded-xl border border-champagne/15 bg-ink/50 px-4 py-2.5 text-sm font-semibold text-ivory transition-all hover:border-champagne/30 hover:bg-champagne/5"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="#1877F2">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
          Facebook
        </button>
      </div>

      {status.demoMode && (
        <p className="mt-2 text-center text-[10px] text-ivory/40">
          Demo mode · buttons simulate OAuth. Add API keys to .env for real login.
        </p>
      )}
    </div>
  );
}
