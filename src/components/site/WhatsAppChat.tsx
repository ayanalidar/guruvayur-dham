"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";

type Message = {
  role: "bot" | "user";
  text: string;
  time: string;
};

const QUICK_REPLIES = [
  "Book a room",
  "Pooja list",
  "Darshan timings",
  "Check-in time",
  "Festival dates",
];

/**
 * WhatsAppChat — floating chat widget that connects to /api/whatsapp-bot.
 *
 * The bot handles intent recognition (booking, pooja, darshan, festivals, etc.)
 * and falls back to AI for general questions. Conversations are logged in the
 * Notifications table.
 *
 * The widget persists chat history in localStorage so a returning guest sees
 * their previous messages. Auto-opens after 8 seconds on first visit (once
 * per session) to encourage engagement.
 */
export default function WhatsAppChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const hasAutoOpened = useRef(false);

  // Load chat history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("gd-chat");
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch {}
    }
  }, []);

  // Save chat history to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("gd-chat", JSON.stringify(messages));
    }
  }, [messages]);

  // Auto-open after 8 seconds (once per session)
  useEffect(() => {
    if (hasAutoOpened.current) return;
    const seen = sessionStorage.getItem("gd-chat-autoopened");
    if (seen) return;
    const t = setTimeout(() => {
      if (messages.length === 0 && !open) {
        setOpen(true);
        setMessages([
          {
            role: "bot",
            text: "Namaskaram! 🙏 I'm your pilgrim assistant. How can I help you today?",
            time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
        sessionStorage.setItem("gd-chat-autoopened", "1");
      }
    }, 8000);
    hasAutoOpened.current = true;
    return () => clearTimeout(t);
  }, [open, messages.length]);

  // Auto-scroll to bottom on new message
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  // Track unread messages when widget is closed
  useEffect(() => {
    if (!open && messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.role === "bot") {
        setUnread((u) => u + 1);
      }
    } else if (open) {
      setUnread(0);
    }
  }, [messages, open]);

  const send = async (text?: string) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;

    const userMsg: Message = {
      role: "user",
      text: msg,
      time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const r = await fetch("/api/whatsapp-bot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: "guest-web-widget", message: msg }),
      });
      const j = await r.json();
      const botMsg: Message = {
        role: "bot",
        text: j.reply || "Sorry, I didn't catch that. Could you rephrase?",
        time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((m) => [...m, botMsg]);
    } catch {
      setMessages((m) => [
        ...m,
        {
          role: "bot",
          text: "I'm having trouble connecting right now. Please WhatsApp us directly at +91-90908 20208.",
          time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    }
    setLoading(false);
  };

  return (
    <>
      {/* Floating button */}
      <motion.button
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 1.5, type: "spring", stiffness: 260, damping: 20 }}
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-50 grid h-14 w-14 place-items-center rounded-full bg-green-500 text-white shadow-lg shadow-green-500/30 transition-transform hover:scale-110"
        aria-label={open ? "Close chat" : "Open chat"}
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X className="h-6 w-6" />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <MessageCircle className="h-6 w-6" fill="currentColor" />
            </motion.div>
          )}
        </AnimatePresence>
        {unread > 0 && !open && (
          <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {unread}
          </span>
        )}
        {/* Pulse ring */}
        {!open && (
          <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-green-500/40" />
        )}
      </motion.button>

      {/* Chat window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 z-50 flex h-[32rem] w-[22rem] flex-col overflow-hidden rounded-2xl border border-champagne/20 bg-ink shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-champagne/10 bg-ink-soft p-4">
              <div className="relative">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-green-500/20">
                  <MessageCircle className="h-5 w-5 text-green-400" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-ink bg-green-400" />
              </div>
              <div className="flex-1">
                <p className="font-serif text-sm font-semibold text-ivory">Guruvayur Dham Assistant</p>
                <p className="text-[10px] text-green-400">● Online · replies instantly</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-full text-ivory/50 hover:bg-champagne/10 hover:text-ivory"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-ink/50 p-4">
              {messages.length === 0 && (
                <div className="space-y-2">
                  <div className="rounded-2xl rounded-tl-sm bg-ink-card px-4 py-2.5 text-sm text-ivory/90">
                    Namaskaram! 🙏 I'm your pilgrim assistant. How can I help you today?
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {QUICK_REPLIES.map((q) => (
                      <button
                        key={q}
                        onClick={() => send(q)}
                        className="rounded-full border border-champagne/20 bg-champagne/5 px-3 py-1 text-[11px] text-champagne transition-colors hover:bg-champagne/15"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                      m.role === "user"
                        ? "rounded-br-sm bg-green-500 text-white"
                        : "rounded-tl-sm bg-ink-card text-ivory/90"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{m.text}</p>
                    <p className={`mt-1 text-[9px] ${m.role === "user" ? "text-green-100" : "text-ivory/30"}`}>
                      {m.time}
                    </p>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="rounded-2xl rounded-tl-sm bg-ink-card px-4 py-3">
                    <div className="flex gap-1">
                      <span className="h-2 w-2 animate-bounce rounded-full bg-ivory/40" style={{ animationDelay: "0ms" }} />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-ivory/40" style={{ animationDelay: "150ms" }} />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-ivory/40" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick replies (when chat has started) */}
            {messages.length > 0 && !loading && (
              <div className="flex flex-wrap gap-1.5 border-t border-champagne/10 bg-ink-soft px-3 py-2">
                {QUICK_REPLIES.slice(0, 3).map((q) => (
                  <button
                    key={q}
                    onClick={() => send(q)}
                    className="rounded-full border border-champagne/15 bg-champagne/5 px-2.5 py-1 text-[10px] text-champagne/80 transition-colors hover:bg-champagne/15"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="flex items-center gap-2 border-t border-champagne/10 bg-ink-soft p-3">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), send())}
                placeholder="Type a message..."
                className="flex-1 rounded-full border border-champagne/15 bg-ink px-4 py-2 text-sm text-ivory placeholder:text-ivory/30 focus:border-champagne/30 focus:outline-none"
                disabled={loading}
              />
              <button
                onClick={() => send()}
                disabled={loading || !input.trim()}
                className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-full bg-green-500 text-white transition-colors hover:bg-green-600 disabled:opacity-40"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
