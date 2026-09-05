"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/lib/theme-context";
import { motion } from "framer-motion";

export default function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className={`grid h-10 w-10 place-items-center rounded-full border border-champagne/20 text-champagne transition-colors hover:bg-champagne/5 ${className}`}
    >
      <motion.div
        key={theme}
        initial={{ rotate: -90, opacity: 0 }}
        animate={{ rotate: 0, opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </motion.div>
    </button>
  );
}
