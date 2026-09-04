"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    if (process.env.NODE_ENV !== "production" && window.location.hostname === "localhost") {
      // Register in dev too for testing, but suppress errors
    }
    const register = () => {
      navigator.serviceWorker
        .register("/sw.js")
        .catch(() => {
          // Silent fail — SW is a progressive enhancement
        });
    };
    if (document.readyState === "complete") register();
    else window.addEventListener("load", register);
  }, []);

  return null;
}
