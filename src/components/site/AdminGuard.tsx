"use client";

import { useEffect, useState } from "react";
import { useHashRoute } from "@/lib/router";
import { Loader2, Lock, ShieldAlert } from "lucide-react";
import { GoldFoilText, MagneticButton } from "@/components/site/visuals";

/**
 * AdminGuard · wraps admin pages to check authentication.
 * If not logged in or not staff, redirects to login.
 * Shows loading state while checking.
 */
export default function AdminGuard({ children, roles = ["MANAGER", "RECEPTIONIST", "HOUSEKEEPING", "ACCOUNTANT"] }: {
  children: React.ReactNode;
  roles?: string[];
}) {
  const { navigate } = useHashRoute();
  const [status, setStatus] = useState<"checking" | "authenticated" | "unauthenticated" | "forbidden">("checking");
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/auth/session", { cache: "no-store" })
      .then(r => r.json())
      .then(j => {
        if (!active) return;
        if (!j.authenticated) {
          setStatus("unauthenticated");
        } else if (j.role === "GUEST") {
          setStatus("forbidden");
        } else if (!roles.includes(j.role) && !roles.includes("*")) {
          setStatus("forbidden");
        } else {
          setUser(j.user);
          setStatus("authenticated");
        }
      })
      .catch(() => {
        if (active) setStatus("unauthenticated");
      });
    return () => { active = false; };
  }, [roles]);

  if (status === "checking") {
    return (
      <div className="grid min-h-[80vh] place-items-center bg-ink pt-20">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-champagne" />
          <p className="mt-3 text-sm text-ivory/60">Verifying access…</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="grid min-h-[80vh] place-items-center bg-ink px-4 pt-20">
        <div className="max-w-md text-center">
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-full border border-champagne/20 bg-ink-card">
            <Lock className="h-10 w-10 text-champagne" />
          </div>
          <h2 className="mt-4 font-serif text-3xl text-ivory">Admin Access Required</h2>
          <p className="mt-2 text-sm text-ivory/60">
            You need to be logged in as a staff member to access this page.
          </p>
          <div className="mt-6">
            <MagneticButton onClick={() => navigate("/login")}>Go to Login</MagneticButton>
          </div>
        </div>
      </div>
    );
  }

  if (status === "forbidden") {
    return (
      <div className="grid min-h-[80vh] place-items-center bg-ink px-4 pt-20">
        <div className="max-w-md text-center">
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-full border border-red-500/30 bg-red-500/10">
            <ShieldAlert className="h-10 w-10 text-red-300" />
          </div>
          <h2 className="mt-4 font-serif text-3xl text-ivory">Access Forbidden</h2>
          <p className="mt-2 text-sm text-ivory/60">
            Your role doesn't have permission to access this page. Contact your manager if you believe this is an error.
          </p>
          <div className="mt-6">
            <MagneticButton variant="ghost" onClick={() => navigate("/")}>Back to Home</MagneticButton>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
