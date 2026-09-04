"use client";

import { motion, useInView, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";

/* ====================================================================
   1. MANDALA DIVIDER · animated SVG kolam/mandala between sections
==================================================================== */
export function MandalaDivider({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-4 py-12 ${className}`}>
      <span className="h-px flex-1 max-w-[180px] bg-gradient-to-r from-transparent to-champagne/40" />
      <svg
        width="64"
        height="64"
        viewBox="0 0 100 100"
        className="animate-spin-slow text-champagne/60"
        aria-hidden
      >
        <g fill="none" stroke="currentColor" strokeWidth="0.8">
          <circle cx="50" cy="50" r="48" />
          <circle cx="50" cy="50" r="38" strokeDasharray="2 3" />
          <circle cx="50" cy="50" r="28" />
          {Array.from({ length: 12 }).map((_, i) => {
            const a = (i * 30 * Math.PI) / 180;
            return (
              <line
                key={i}
                x1={50 + 28 * Math.cos(a)}
                y1={50 + 28 * Math.sin(a)}
                x2={50 + 48 * Math.cos(a)}
                y2={50 + 48 * Math.sin(a)}
              />
            );
          })}
          {Array.from({ length: 8 }).map((_, i) => {
            const a = (i * 45 * Math.PI) / 180;
            return (
              <ellipse
                key={i}
                cx={50}
                cy={50}
                rx="6"
                ry="28"
                transform={`rotate(${i * 45} 50 50)`}
              />
            );
          })}
          <circle cx="50" cy="50" r="4" fill="currentColor" />
        </g>
      </svg>
      <span className="h-px flex-1 max-w-[180px] bg-gradient-to-l from-transparent to-champagne/40" />
    </div>
  );
}

/* ====================================================================
   2. GOLD FOIL TEXT · shimmering champagne gradient text
==================================================================== */
export function GoldFoilText({
  children,
  className = "",
  as: Tag = "span",
}: {
  children: ReactNode;
  className?: string;
  as?: React.ElementType;
}) {
  return (
    <Tag className={`text-gold-foil ${className}`}>
      {children}
    </Tag>
  );
}

/* ====================================================================
   3. GLASS CARD · frosted glass with gold border
==================================================================== */
export function GlassCard({
  children,
  className = "",
  hover = true,
}: {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}) {
  return (
    <div className={`card-luxe ${hover ? "hover:shadow-luxe-lg" : ""} ${className}`}>
      {children}
    </div>
  );
}

/* ====================================================================
   4. FLOATING DIYAS · particles drifting upward (canvas-based)
==================================================================== */
export function FloatingDiyas({ count = 14 }: { count?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = (canvas.width = canvas.offsetWidth);
    let h = (canvas.height = canvas.offsetHeight);

    const onResize = () => {
      w = canvas.width = canvas.offsetWidth;
      h = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener("resize", onResize);

    type P = { x: number; y: number; vy: number; vx: number; size: number; opacity: number; flicker: number };
    const particles: P[] = Array.from({ length: count }).map(() => ({
      x: Math.random() * w,
      y: h + Math.random() * h,
      vy: 0.3 + Math.random() * 0.6,
      vx: -0.2 + Math.random() * 0.4,
      size: 1.5 + Math.random() * 2.5,
      opacity: 0.3 + Math.random() * 0.5,
      flicker: Math.random() * Math.PI * 2,
    }));

    let raf = 0;
    const tick = () => {
      ctx.clearRect(0, 0, w, h);
      particles.forEach((p) => {
        p.y -= p.vy;
        p.x += p.vx + Math.sin(p.flicker) * 0.3;
        p.flicker += 0.03;
        if (p.y < -10) {
          p.y = h + 10;
          p.x = Math.random() * w;
        }
        const flick = 0.7 + Math.sin(p.flicker * 2) * 0.3;

        // glow
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 6);
        grad.addColorStop(0, `rgba(255, 179, 71, ${p.opacity * flick})`);
        grad.addColorStop(0.4, `rgba(212, 175, 55, ${p.opacity * 0.4 * flick})`);
        grad.addColorStop(1, "rgba(212, 175, 55, 0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 6, 0, Math.PI * 2);
        ctx.fill();

        // core
        ctx.fillStyle = `rgba(255, 230, 180, ${p.opacity * flick})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });
      raf = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, [count]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden
    />
  );
}

/* ====================================================================
   5. OM WATERMARK · giant faint ॐ rotating slowly behind content
==================================================================== */
export function OmWatermark({
  className = "",
  size = "20rem",
}: {
  className?: string;
  size?: string;
}) {
  return (
    <div
      className={`pointer-events-none absolute select-none font-serif text-champagne/[0.04] ${className}`}
      style={{ fontSize: size, lineHeight: 1 }}
      aria-hidden
    >
      <span className="inline-block animate-spin-slow">ॐ</span>
    </div>
  );
}

/* ====================================================================
   6. MAGNETIC BUTTON · attracts toward cursor on hover
==================================================================== */
export function MagneticButton({
  children,
  href,
  onClick,
  variant = "luxe",
  className = "",
  strength = 0.3,
}: {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: "luxe" | "ghost";
  className?: string;
  strength?: number;
}) {
  const ref = useRef<HTMLAnchorElement | HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 200, damping: 15 });
  const sy = useSpring(y, { stiffness: 200, damping: 15 });

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const dx = e.clientX - (rect.left + rect.width / 2);
    const dy = e.clientY - (rect.top + rect.height / 2);
    x.set(dx * strength);
    y.set(dy * strength);
  };
  const onLeave = () => {
    x.set(0);
    y.set(0);
  };

  const cls = variant === "luxe" ? "btn-luxe" : "btn-ghost-luxe";
  const content = (
    <motion.span
      style={{ x: sx, y: sy }}
      className={`${cls} ${className}`}
    >
      {children}
    </motion.span>
  );

  if (href) {
    return (
      <a
        ref={ref as React.RefObject<HTMLAnchorElement>}
        href={href}
        target={href.startsWith("http") ? "_blank" : undefined}
        rel="noopener noreferrer"
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        className="inline-block"
      >
        {content}
      </a>
    );
  }
  return (
    <button
      ref={ref as React.RefObject<HTMLButtonElement>}
      onClick={onClick}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className="inline-block"
    >
      {content}
    </button>
  );
}

/* ====================================================================
   7. COUNT UP · animates numbers from 0 to target when in view
==================================================================== */
export function CountUp({
  to,
  suffix = "",
  prefix = "",
  duration = 2,
  decimals = 0,
}: {
  to: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  decimals?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const [val, setVal] = useState(to); // Start at target value (no 0 flash)
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (!inView || hasAnimated) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHasAnimated(true);
    setVal(0); // Reset to 0 only when animation starts
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / (duration * 1000));
      const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      setVal(to * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, duration, hasAnimated]);

  return (
    <span ref={ref}>
      {prefix}
      {val.toLocaleString("en-IN", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </span>
  );
}

/* ====================================================================
   8. TILT CARD · 3D tilt following mouse
==================================================================== */
export function TiltCard({
  children,
  className = "",
  maxTilt = 8,
  glare = true,
}: {
  children: ReactNode;
  className?: string;
  maxTilt?: number;
  glare?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const gx = useMotionValue(50);
  const gy = useMotionValue(50);

  const srx = useSpring(rx, { stiffness: 200, damping: 18 });
  const sry = useSpring(ry, { stiffness: 200, damping: 18 });
  const glareBg = useTransform(
    [gx, gy],
    ([x, y]) => `radial-gradient(circle at ${x}% ${y}%, rgba(255,255,255,0.10), transparent 50%)`
  );

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    ry.set((px - 0.5) * 2 * maxTilt);
    rx.set(-(py - 0.5) * 2 * maxTilt);
    gx.set(px * 100);
    gy.set(py * 100);
  };
  const onLeave = () => {
    rx.set(0);
    ry.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{
        rotateX: srx,
        rotateY: sry,
        transformStyle: "preserve-3d",
        perspective: 1000,
      }}
      className={`relative ${className}`}
    >
      {children}
      {glare && (
        <motion.div
          className="pointer-events-none absolute inset-0 rounded-[inherit]"
          style={{ background: glareBg }}
        />
      )}
    </motion.div>
  );
}

/* ====================================================================
   9. MARQUEE · horizontal scrolling text strip
==================================================================== */
export function Marquee({
  items,
  className = "",
}: {
  items: string[];
  className?: string;
}) {
  const doubled = [...items, ...items];
  return (
    <div
      className={`relative flex overflow-hidden border-y border-champagne/10 bg-ink-soft/50 py-5 ${className}`}
    >
      <div className="flex animate-marquee whitespace-nowrap">
        {doubled.map((it, i) => (
          <span key={i} className="mx-8 inline-flex items-center gap-8">
            <span className="font-serif text-lg italic text-champagne/90">{it}</span>
            <span className="text-gold">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ====================================================================
   10. IMAGE REVEAL · clip-path curtain reveal on scroll
==================================================================== */
export function ImageReveal({
  src,
  alt,
  className = "",
  imgClassName = "",
  priority = false,
  sizes = "(max-width: 768px) 100vw, 50vw",
}: {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  priority?: boolean;
  sizes?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      initial={{ clipPath: "inset(0 100% 0 0)" }}
      animate={inView ? { clipPath: "inset(0 0% 0 0)" } : {}}
      transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
      className={`relative overflow-hidden ${className}`}
    >
      <motion.img
        src={src}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        className={`h-full w-full object-cover photo-cinematic ${imgClassName}`}
        initial={{ scale: 1.25 }}
        animate={inView ? { scale: 1 } : {}}
        transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
      />
    </motion.div>
  );
}

/* ====================================================================
   11. PAGE TRANSITION · wraps page content with fade/slide
==================================================================== */
export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* ====================================================================
   12. PAGE LOADER · mandala draw animation on initial load
==================================================================== */
export function PageLoader({ onDone }: { onDone?: () => void }) {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      setHidden(true);
      onDone?.();
    }, 1800);
    return () => clearTimeout(t);
  }, [onDone]);

  if (hidden) return null;

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-[100] grid place-items-center bg-ink"
    >
      <div className="relative grid place-items-center">
        <svg
          width="120"
          height="120"
          viewBox="0 0 100 100"
          className="text-champagne"
          aria-hidden
        >
          <g fill="none" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round">
            <circle cx="50" cy="50" r="48">
              <animate
                attributeName="stroke-dasharray"
                from="0 301.6"
                to="301.6 0"
                dur="1.4s"
                fill="freeze"
              />
            </circle>
            <circle cx="50" cy="50" r="38" strokeDasharray="2 3" opacity="0.6" />
            {Array.from({ length: 12 }).map((_, i) => {
              const a = (i * 30 * Math.PI) / 180;
              return (
                <line
                  key={i}
                  x1={50 + 28 * Math.cos(a)}
                  y1={50 + 28 * Math.sin(a)}
                  x2={50 + 48 * Math.cos(a)}
                  y2={50 + 48 * Math.sin(a)}
                  opacity="0.7"
                >
                  <animate
                    attributeName="opacity"
                    from="0"
                    to="0.7"
                    dur="0.6s"
                    begin={`${0.05 * i}s`}
                    fill="freeze"
                  />
                </line>
              );
            })}
            {Array.from({ length: 8 }).map((_, i) => (
              <ellipse
                key={i}
                cx="50"
                cy="50"
                rx="6"
                ry="28"
                transform={`rotate(${i * 45} 50 50)`}
                opacity="0.5"
              >
                <animate
                  attributeName="opacity"
                  from="0"
                  to="0.5"
                  dur="0.6s"
                  begin={`${0.4 + 0.05 * i}s`}
                  fill="freeze"
                />
              </ellipse>
            ))}
            <circle cx="50" cy="50" r="4" fill="currentColor" opacity="0">
              <animate
                attributeName="opacity"
                from="0"
                to="1"
                dur="0.4s"
                begin="1.2s"
                fill="freeze"
              />
            </circle>
          </g>
        </svg>
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="mt-6 font-serif text-sm uppercase tracking-[0.4em] text-champagne/80"
        >
          Guruvayur Dham
        </motion.p>
      </div>
    </motion.div>
  );
}

/* ====================================================================
   SECTION HEADER · eyebrow + title + subtitle with consistent luxury feel
==================================================================== */
export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  align = "center",
  className = "",
}: {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  align?: "center" | "left";
  className?: string;
}) {
  const alignCls = align === "center" ? "text-center mx-auto" : "text-left";
  return (
    <div className={`max-w-3xl ${alignCls} ${className}`}>
      {eyebrow && (
        <motion.span
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="section-eyebrow"
        >
          {eyebrow}
        </motion.span>
      )}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6, delay: 0.05 }}
        className="section-title mt-5"
      >
        {title}
      </motion.h2>
      {subtitle && (
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="section-subtitle mt-5"
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  );
}
