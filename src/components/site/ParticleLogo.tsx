"use client";

/**
 * ParticleLogo
 * ============
 * A canvas-based logo rebuilt from square particles sampled from an image.
 *
 * Behaviour mirrors the GuardianX particle-logo demo:
 *   1. ASSEMBLY  — particles fly in from a scattered ring outside the logo,
 *                  spring to their target positions with a staggered easing.
 *   2. IDLE      — subtle perlin-ish noise floating + opacity flicker so the
 *                  logo never feels static.
 *   3. MOUSE     — cursor repels nearby particles ("shatter"); they spring
 *                  back when the cursor leaves.
 *
 * Brand tuning (Guruvayur Dham):
 *   - Glow uses champagne/gold (rgba(212,175,55,...)) instead of purple/blue.
 *   - Square particles preserve the logo's true pixel colors.
 *
 * SSR-safe: the canvas only mounts on the client; if JS is disabled or the
 * image fails to load, a plain <img> fallback is rendered.
 *
 * Performance:
 *   - DPR capped at 2.
 *   - Particle count auto-scales with viewport width (mobile / tablet / desktop).
 *   - requestAnimationFrame is paused when the tab is hidden or the component
 *     unmounts; resize is debounced.
 *   - Honours `prefers-reduced-motion` (skips assembly + idle noise).
 */

import { useEffect, useRef, useState, type CSSProperties } from "react";

export interface ParticleLogoProps {
  /** Logo image URL. Must be same-origin or CORS-enabled for pixel sampling. */
  src?: string;
  /** Rendered size in CSS pixels (square). Default 256. */
  size?: number;
  /** Optional className for the wrapper div. */
  className?: string;
  /** Optional inline style for the wrapper div. */
  style?: CSSProperties;
  /** Enable mouse-shatter interaction. Default true. */
  interactive?: boolean;
  /** Show the soft glow behind particles. Default true. */
  showGlow?: boolean;
  /** Target particle count. If omitted, auto-scales with viewport. */
  particleCount?: number;
  /** Alt text for the fallback <img>. */
  alt?: string;
  /** Fallback image className (used if canvas is unavailable). */
  fallbackClassName?: string;
}

interface Particle {
  tx: number;
  ty: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  baseOpacity: number;
  opacity: number;
  delay: number;
  seed: number;
}

type Phase = "loading" | "assembling" | "idle";

const CONFIG = {
  sampleRes: 300,
  logoScale: 0.82,
  assemblyDuration: 2200,
  repelRadius: 110,
  repelStrength: 0.6,
};

function pickParticleCount(size: number): number {
  if (typeof window === "undefined") return 1100;
  const vw = window.innerWidth;
  // Mobile gets fewer particles for performance; desktop gets up to 2000.
  if (vw < 640 || size < 140) return 650;
  if (vw < 1024 || size < 220) return 1100;
  return 2000;
}

export default function ParticleLogo({
  src = "/guruyavur.png",
  size = 256,
  className = "",
  style,
  interactive = true,
  showGlow = true,
  particleCount,
  alt = "Guruvayur Dham logo",
  fallbackClassName = "",
}: ParticleLogoProps) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (failed) return;

    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    // Skip on servers / very old browsers.
    if (typeof window === "undefined") return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) {
      queueMicrotask(() => setFailed(true));
      return;
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    // Configure canvas resolution.
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;

    const targetCount =
      particleCount ?? pickParticleCount(size);

    let particles: Particle[] = [];
    let phase: Phase = "loading";
    let rafId = 0;
    let startTime = 0;

    const mouse = { x: 0, y: 0, active: false };

    // ---------------------------------------------------------------------
    // Build particles from the logo image by sampling non-transparent pixels.
    // ---------------------------------------------------------------------
    function buildParticles(img: HTMLImageElement) {
      if (!canvas) return;
      const renderSize = size;
      const sampleRes = CONFIG.sampleRes;

      // Offscreen sampling canvas.
      const off = document.createElement("canvas");
      off.width = sampleRes;
      off.height = sampleRes;
      const offCtx = off.getContext("2d", { willReadFrequently: true });
      if (!offCtx) {
        queueMicrotask(() => setFailed(true));
        return;
      }
      offCtx.drawImage(img, 0, 0, sampleRes, sampleRes);
      const data = offCtx.getImageData(0, 0, sampleRes, sampleRes).data;

      // Collect non-transparent candidates (step 2 → 1/4 of pixels).
      const candidates: Array<{
        x: number;
        y: number;
        r: number;
        g: number;
        b: number;
      }> = [];
      for (let y = 0; y < sampleRes; y += 2) {
        for (let x = 0; x < sampleRes; x += 2) {
          const i = (y * sampleRes + x) * 4;
          const a = data[i + 3];
          if (a > 60) {
            candidates.push({
              x: (x / sampleRes) * renderSize * dpr,
              y: (y / sampleRes) * renderSize * dpr,
              r: data[i],
              g: data[i + 1],
              b: data[i + 2],
            });
          }
        }
      }

      // Subsample to target count (Fisher-Yates shuffle).
      let chosen = candidates;
      if (candidates.length > targetCount) {
        for (let i = candidates.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
        }
        chosen = candidates.slice(0, targetCount);
      }

      const cx = (renderSize * dpr) / 2;
      const cy = (renderSize * dpr) / 2;
      const logoScale = CONFIG.logoScale;

      particles = chosen.map((c) => {
        const scaledTx = cx + (c.x - cx) * logoScale;
        const scaledTy = cy + (c.y - cy) * logoScale;

        // Start scattered in a ring around the logo.
        const angle = Math.random() * Math.PI * 2;
        const dist = renderSize * dpr * (0.55 + Math.random() * 0.35);
        const startX = cx + Math.cos(angle) * dist;
        const startY = cy + Math.sin(angle) * dist;

        const psz = (1.4 + Math.random() * 2.2) * dpr;
        const baseOpacity = 0.7 + Math.random() * 0.3;

        return {
          tx: scaledTx,
          ty: scaledTy,
          x: prefersReducedMotion ? scaledTx : startX,
          y: prefersReducedMotion ? scaledTy : startY,
          vx: 0,
          vy: 0,
          size: psz,
          color: `rgb(${c.r},${c.g},${c.b})`,
          baseOpacity,
          opacity: prefersReducedMotion ? baseOpacity : 0,
          delay: Math.random(),
          seed: Math.random() * 1000,
        };
      });

      startTime = performance.now();
      phase = prefersReducedMotion ? "idle" : "assembling";

      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(animate);
    }

    // ---------------------------------------------------------------------
    // Main animation loop.
    // ---------------------------------------------------------------------
    function animate() {
      if (!canvas || !ctx) return;
      if (particles.length === 0) {
        rafId = requestAnimationFrame(animate);
        return;
      }

      const now = performance.now();
      const assemblyElapsed = now - startTime;
      const assemblyDuration = CONFIG.assemblyDuration;
      const repelRadius = CONFIG.repelRadius * dpr;
      const repelStrength = CONFIG.repelStrength;
      const t = now * 0.001;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        let arrived = 1;
        if (phase === "assembling") {
          const particleStart = p.delay * assemblyDuration * 0.6;
          const particleDur = assemblyDuration * 0.55;
          const localT = (assemblyElapsed - particleStart) / particleDur;
          arrived = Math.max(0, Math.min(1, localT));
          const eased = 1 - Math.pow(1 - arrived, 3);
          p.opacity = p.baseOpacity * eased;
        }

        if (arrived > 0) {
          // Spring toward target position.
          const ax = (p.tx - p.x) * 0.08;
          const ay = (p.ty - p.y) * 0.08;
          p.vx += ax;
          p.vy += ay;

          // Idle noise — subtle floating.
          if (phase === "idle" || arrived > 0.8) {
            const noiseAmp = 1.1 * dpr;
            const nx =
              Math.sin(t * 0.8 + p.seed) *
              Math.cos(t * 0.5 + p.seed * 0.7) *
              noiseAmp;
            const ny =
              Math.cos(t * 0.7 + p.seed * 1.3) *
              Math.sin(t * 0.6 + p.seed * 0.5) *
              noiseAmp;
            p.vx += nx * 0.04;
            p.vy += ny * 0.04;

            // Opacity flicker.
            p.opacity =
              p.baseOpacity * (0.82 + Math.sin(t * 1.5 + p.seed) * 0.18);
          }

          // Mouse SHATTER.
          if (interactive && mouse.active) {
            const dx = p.x - mouse.x;
            const dy = p.y - mouse.y;
            const dist2 = dx * dx + dy * dy;
            if (dist2 < repelRadius * repelRadius && dist2 > 0.01) {
              const dist = Math.sqrt(dist2);
              const normalizedDist = dist / repelRadius;
              const shatterForce =
                normalizedDist < 0.4
                  ? (1 - normalizedDist / 0.4) * 18
                  : (1 - normalizedDist) * repelStrength * 4;
              p.vx += (dx / dist) * shatterForce;
              p.vy += (dy / dist) * shatterForce;

              if (normalizedDist < 0.5) {
                p.opacity = Math.min(1, p.opacity * 1.5);
              }
            }
            // Hover brightness.
            const hoverR = repelRadius * 1.8;
            if (dist2 < hoverR * hoverR) {
              p.opacity = Math.min(1, p.opacity * 1.25);
            }
          }

          // Damping.
          p.vx *= 0.84;
          p.vy *= 0.84;
        }

        p.x += p.vx;
        p.y += p.vy;

        // Draw square particle.
        const op = Math.max(0, Math.min(1, p.opacity));
        if (op < 0.02) continue;

        ctx.globalAlpha = op;
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
      }

      ctx.globalAlpha = 1;

      // Transition from assembling → idle.
      if (phase === "assembling" && assemblyElapsed > assemblyDuration + 300) {
        phase = "idle";
      }

      rafId = requestAnimationFrame(animate);
    }

    // ---------------------------------------------------------------------
    // Mouse tracking (only active when cursor is near the canvas).
    // ---------------------------------------------------------------------
    function onMouseMove(e: MouseEvent) {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const pad = 60;
      if (
        e.clientX < rect.left - pad ||
        e.clientX > rect.right + pad ||
        e.clientY < rect.top - pad ||
        e.clientY > rect.bottom + pad
      ) {
        mouse.active = false;
        return;
      }
      mouse.x = (e.clientX - rect.left) * dpr;
      mouse.y = (e.clientY - rect.top) * dpr;
      mouse.active = true;
    }

    function onMouseLeave() {
      mouse.active = false;
    }

    // ---------------------------------------------------------------------
    // Pause animation when tab is hidden.
    // ---------------------------------------------------------------------
    function onVisibilityChange() {
      if (document.hidden) {
        cancelAnimationFrame(rafId);
      } else if (phase !== "loading" && particles.length > 0) {
        rafId = requestAnimationFrame(animate);
      }
    }

    // ---------------------------------------------------------------------
    // Debounced resize handler — rebuild particles at new size.
    // ---------------------------------------------------------------------
    let resizeTimer: ReturnType<typeof setTimeout> | undefined;
    function onResize() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (document.hidden) return;
        const img = imgRef.current;
        if (img && img.complete && img.naturalWidth > 0) {
          buildParticles(img);
        }
      }, 300);
    }

    // ---------------------------------------------------------------------
    // Wire up listeners + start loading image.
    // ---------------------------------------------------------------------
    if (interactive) {
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseleave", onMouseLeave);
    }
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("resize", onResize);

    const img = imgRef.current;
    if (!img) {
      queueMicrotask(() => setFailed(true));
      return;
    }
    const handleLoad = () => buildParticles(img);
    const handleError = () => {
      console.error("[ParticleLogo] Failed to load image:", src);
      setFailed(true);
    };
    if (img.complete && img.naturalWidth > 0) {
      handleLoad();
    } else {
      img.addEventListener("load", handleLoad);
      img.addEventListener("error", handleError);
    }

    return () => {
      cancelAnimationFrame(rafId);
      if (interactive) {
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseleave", onMouseLeave);
      }
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("resize", onResize);
      if (resizeTimer) clearTimeout(resizeTimer);
      img.removeEventListener("load", handleLoad);
      img.removeEventListener("error", handleError);
    };
  }, [src, size, interactive, showGlow, particleCount, failed]);

  // If image failed to load, render a plain <img> fallback.
  if (failed) {
    return (
      <img
        src={src}
        alt={alt}
        className={fallbackClassName || className}
        style={style}
        draggable={false}
      />
    );
  }

  return (
    <div
      ref={wrapRef}
      className={`particle-logo relative ${className}`}
      style={{
        width: size,
        height: size,
        maxWidth: "100%",
        maxHeight: "100%",
        ...style,
      }}
      aria-label={alt}
      role="img"
    >
      {showGlow && (
        <div
          className="particle-logo__glow pointer-events-none absolute rounded-full"
          style={{
            inset: "8%",
            background:
              "radial-gradient(circle at 50% 45%, rgba(212,175,55,0.28), rgba(212,175,55,0.10) 40%, transparent 68%)",
            filter: "blur(28px)",
          }}
          aria-hidden
        />
      )}
      <canvas
        ref={canvasRef}
        className="relative block h-full w-full"
        style={{ zIndex: 1 }}
      />
      {/* Hidden <img> used as the source for pixel sampling. */}
      <img
        ref={imgRef}
        src={src}
        alt=""
        crossOrigin="anonymous"
        aria-hidden
        style={{ display: "none" }}
      />
    </div>
  );
}
