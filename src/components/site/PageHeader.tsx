"use client";

import { motion } from "framer-motion";
import { ChevronRight, type LucideIcon } from "lucide-react";
import { useHashRoute } from "@/lib/router";
import { GoldFoilText } from "@/components/site/visuals";

export interface Crumb {
  label: string;
  route?: string;
}

export default function PageHeader({
  eyebrow,
  title,
  subtitle,
  crumbs = [],
  icon: Icon,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  crumbs?: Crumb[];
  icon?: LucideIcon;
}) {
  const { navigate } = useHashRoute();

  return (
    <section className="relative overflow-hidden bg-ink-gradient pt-32 pb-16 lg:pt-40 lg:pb-20">
      {/* Decorative Om watermark */}
      <div className="pointer-events-none absolute -right-10 top-10 select-none font-serif text-[18rem] leading-none text-champagne/[0.04]">
        ॐ
      </div>
      {/* Glow */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-64 w-[600px] -translate-x-1/2 rounded-full bg-gold/8 blur-3xl" />

      <div className="container-x relative">
        {/* Breadcrumbs */}
        {crumbs.length > 0 && (
          <motion.nav
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6 flex items-center gap-2 text-xs text-ivory/50"
          >
            {crumbs.map((c, i) => (
              <span key={i} className="flex items-center gap-2">
                {i > 0 && <ChevronRight className="h-3 w-3" />}
                {c.route ? (
                  <button
                    onClick={() => navigate(c.route!)}
                    className="transition-colors hover:text-champagne"
                  >
                    {c.label}
                  </button>
                ) : (
                  <span className="text-champagne">{c.label}</span>
                )}
              </span>
            ))}
          </motion.nav>
        )}

        <div className="max-w-3xl">
          {eyebrow && (
            <motion.span
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="section-eyebrow"
            >
              {Icon && <Icon className="h-3.5 w-3.5" />}
              {eyebrow}
            </motion.span>
          )}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="section-title mt-5"
          >
            {title}
          </motion.h1>
          {subtitle && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="section-subtitle mt-5"
            >
              {subtitle}
            </motion.p>
          )}
        </div>
      </div>
    </section>
  );
}
