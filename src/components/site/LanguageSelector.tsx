"use client";

import { useState } from "react";
import { Globe, Check } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";
import { LANGUAGES, type Language } from "@/lib/i18n/translations";
import { cn } from "@/lib/utils";

export default function LanguageSelector({ className = "" }: { className?: string }) {
  const { lang, setLang } = useI18n();
  const [open, setOpen] = useState(false);

  const current = LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0];

  return (
    <div className={cn("relative", className)}>
      <button
        onClick={() => setOpen(!open)}
        className="grid h-10 w-10 place-items-center rounded-full border border-champagne/20 text-champagne transition-colors hover:bg-champagne/5"
        aria-label="Select language"
        title={current.label}
      >
        <Globe className="h-4 w-4" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-12 z-50 w-44 overflow-hidden rounded-xl border border-border bg-card shadow-luxe-lg">
            {LANGUAGES.map((l) => (
              <button
                key={l.code}
                onClick={() => {
                  setLang(l.code as Language);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center justify-between px-4 py-2.5 text-sm transition-colors hover:bg-muted",
                  lang === l.code ? "text-primary font-semibold" : "text-foreground/70"
                )}
              >
                <span className="flex items-center gap-2">
                  <span className="text-base">{l.flag}</span>
                  {l.label}
                </span>
                {lang === l.code && <Check className="h-4 w-4 text-primary" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
