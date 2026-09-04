"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, Download, Smartphone, Check } from "lucide-react";

/**
 * PWAEnhancements — handles:
 * 1. Push notification subscription (asks permission, registers with server)
 * 2. Add to Home Screen prompt (iOS + Android)
 */
export default function PWAEnhancements() {
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [showPushPrompt, setShowPushPrompt] = useState(false);
  const [pushSubscribed, setPushSubscribed] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // ===== 1. CAPTURE BEFOREINSTALLPROMPT (Android/Chrome) =====
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Show prompt after 3 seconds (let user explore first)
      setTimeout(() => setShowInstallPrompt(true), 3000);
    };
    window.addEventListener("beforeinstallprompt", handler);

    // ===== 2. CHECK IF ALREADY INSTALLED =====
    if (window.matchMedia("(display-mode: standalone)").matches) {
      // Already installed — don't show install prompt
      return;
    }

    // ===== 3. iOS DETECT (no beforeinstallprompt on iOS) =====
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (isIOS) {
      // Show iOS install instructions after 5 seconds
      setTimeout(() => {
        const dismissed = localStorage.getItem("ios-install-dismissed");
        if (!dismissed) setShowInstallPrompt(true);
      }, 5000);
    }

    // ===== 4. PUSH NOTIFICATION PROMPT =====
    setTimeout(() => {
      const pushDismissed = localStorage.getItem("push-prompt-dismissed");
      if (!pushDismissed && "Notification" in window && Notification.permission === "default") {
        setShowPushPrompt(true);
      }
    }, 8000);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  // ===== INSTALL PROMPT HANDLER =====
  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setPushSubscribed(true);
      }
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
    } else {
      // iOS — show instructions
      setShowInstallPrompt(false);
      // The instructions are already shown in the prompt
    }
    localStorage.setItem("install-dismissed", "true");
  };

  // ===== PUSH SUBSCRIPTION HANDLER =====
  const handlePushSubscribe = async () => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setShowPushPrompt(false);
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setShowPushPrompt(false);
        localStorage.setItem("push-prompt-dismissed", "true");
        return;
      }

      const reg = await navigator.serviceWorker.ready;
      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
          "BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U" // demo key
        ),
      });

      // Send subscription to server
      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint: subscription.endpoint,
          keys: subscription.toJSON().keys,
        }),
      });

      setPushSubscribed(true);
      setShowPushPrompt(false);
    } catch (e) {
      // Silent fail — push is a progressive enhancement
      setShowPushPrompt(false);
    }
  };

  const dismissInstall = () => {
    setShowInstallPrompt(false);
    localStorage.setItem("install-dismissed", "true");
  };

  const dismissPush = () => {
    setShowPushPrompt(false);
    localStorage.setItem("push-prompt-dismissed", "true");
  };

  return (
    <>
      {/* Install Prompt */}
      <AnimatePresence>
        {showInstallPrompt && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-20 left-1/2 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 sm:bottom-6"
          >
            <div className="card-luxe p-5 shadow-luxe-lg">
              <button onClick={dismissInstall} className="absolute right-3 top-3 text-ivory/40 hover:text-ivory">
                <X className="h-4 w-4" />
              </button>
              <div className="flex items-start gap-3">
                <div className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-xl border border-champagne/20 bg-gradient-to-br from-champagne/15 to-transparent">
                  <Download className="h-6 w-6 text-champagne" />
                </div>
                <div className="flex-1">
                  <p className="font-serif text-base text-ivory">Install Guruvayur Dham</p>
                  <p className="mt-1 text-xs text-ivory/60">
                    {deferredPrompt
                      ? "Add to your home screen for quick access, offline booking, and push notifications."
                      : "Tap the Share button → 'Add to Home Screen' for the full app experience."}
                  </p>
                  <div className="mt-3 flex gap-2">
                    {deferredPrompt ? (
                      <button onClick={handleInstall} className="btn-luxe text-xs">
                        <Smartphone className="h-3.5 w-3.5" /> Install
                      </button>
                    ) : (
                      <button onClick={dismissInstall} className="btn-luxe text-xs">Got it</button>
                    )}
                    <button onClick={dismissInstall} className="btn-ghost-luxe text-xs">Not now</button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Push Notification Prompt */}
      <AnimatePresence>
        {showPushPrompt && !pushSubscribed && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-20 left-1/2 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 sm:bottom-6"
          >
            <div className="card-luxe p-5 shadow-luxe-lg">
              <button onClick={dismissPush} className="absolute right-3 top-3 text-ivory/40 hover:text-ivory">
                <X className="h-4 w-4" />
              </button>
              <div className="flex items-start gap-3">
                <div className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-xl border border-champagne/20 bg-gradient-to-br from-saffron/15 to-transparent">
                  <Bell className="h-6 w-6 text-saffron" />
                </div>
                <div className="flex-1">
                  <p className="font-serif text-base text-ivory">Stay Updated</p>
                  <p className="mt-1 text-xs text-ivory/60">
                    Get notified about festival alerts, booking confirmations, and special offers.
                  </p>
                  <div className="mt-3 flex gap-2">
                    <button onClick={handlePushSubscribe} className="btn-luxe text-xs">
                      <Bell className="h-3.5 w-3.5" /> Enable
                    </button>
                    <button onClick={dismissPush} className="btn-ghost-luxe text-xs">Not now</button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Push subscribed indicator (brief toast) */}
      <AnimatePresence>
        {pushSubscribed && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed bottom-20 left-1/2 z-50 -translate-x-1/2 sm:bottom-6"
            onAnimationComplete={() => setTimeout(() => setPushSubscribed(false), 3000)}
          >
            <div className="flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/15 px-4 py-2 text-sm text-green-300 backdrop-blur-md">
              <Check className="h-4 w-4" /> Push notifications enabled
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
