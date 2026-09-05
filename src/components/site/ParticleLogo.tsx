"use client";

import { useEffect, useRef } from "react";

/**
 * ParticleLogo
 *
 * Renders the Guruvayur Dham logo with an animated halo of gold/champagne
 * particles orbiting it. Aesthetic reference: academy.guardianx.cloud
 * (logo with violet drop-shadow + radial-gradient halo), adapted to this
 * site's gold-on-ink palette.
 *
 * Particles are rendered on a <canvas> overlay sized to match the logo box.
 * They orbit in 3 rings (inner / mid / outer) at different speeds and radii,
 * with subtle size + opacity flicker for a "living" feel.
 *
 * Props:
 *   - size: pixel size of the logo box (default 96)
 *   - glow: hex/rgb glow color (default "#D4AF37" = gold)
 *   - particleCount: total particles across all rings (default 48)
 *   - logoSrc: logo image src (default "/logo-large.png")
 */

type Particle = {
  ring: number; // 0=inner, 1=mid, 2=outer
  angle: number; // radians
  speed: number; // radians per frame
  radius: number; // px from center
  size: number; // px radius
  baseOpacity: number; // 0..1
  flickerPhase: number; // 0..2π
  flickerSpeed: number;
};

export default function ParticleLogo({
  size = 96,
  glow = "#D4AF37",
  particleCount = 48,
  logoSrc = "/logo-large.png",
  className = "",
}: {
  size?: number;
  glow?: string;
  particleCount?: number;
  logoSrc?: string;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // HiDPI: scale canvas to devicePixelRatio for crisp particles
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    // Initialize particles in 3 rings
    const rings = [
      { radius: size * 0.42, count: Math.round(particleCount * 0.25), speed: 0.012 },
      { radius: size * 0.55, count: Math.round(particleCount * 0.4), speed: -0.008 },
      { radius: size * 0.72, count: Math.round(particleCount * 0.35), speed: 0.005 },
    ];
    const parts: Particle[] = [];
    rings.forEach((ring, ringIdx) => {
      for (let i = 0; i < ring.count; i++) {
        parts.push({
          ring: ringIdx,
          angle: (i / ring.count) * Math.PI * 2 + Math.random() * 0.4,
          speed: ring.speed * (0.7 + Math.random() * 0.6),
          radius: ring.radius + (Math.random() - 0.5) * size * 0.04,
          size: 0.6 + Math.random() * 1.6,
          baseOpacity: 0.35 + Math.random() * 0.45,
          flickerPhase: Math.random() * Math.PI * 2,
          flickerSpeed: 0.02 + Math.random() * 0.04,
        });
      }
    });
    particlesRef.current = parts;

    const cx = size / 2;
    const cy = size / 2;

    const render = () => {
      ctx.clearRect(0, 0, size, size);

      // Soft pulsing radial halo behind logo
      const haloRadius = size * 0.5;
      const pulse = 0.5 + Math.sin(Date.now() * 0.0015) * 0.15;
      const halo = ctx.createRadialGradient(cx, cy, 0, cx, cy, haloRadius);
      halo.addColorStop(0, `rgba(212, 175, 55, ${0.25 * pulse})`);
      halo.addColorStop(0.5, `rgba(212, 175, 55, ${0.1 * pulse})`);
      halo.addColorStop(1, "rgba(212, 175, 55, 0)");
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(cx, cy, haloRadius, 0, Math.PI * 2);
      ctx.fill();

      // Draw orbiting particles with glow
      for (const p of parts) {
        p.angle += p.speed;
        p.flickerPhase += p.flickerSpeed;
        const x = cx + Math.cos(p.angle) * p.radius;
        const y = cy + Math.sin(p.angle) * p.radius;
        const flicker = 0.6 + Math.sin(p.flickerPhase) * 0.4;
        const opacity = p.baseOpacity * flicker;

        // Soft glow around each particle (radial gradient)
        const glowRadius = p.size * 3.5;
        const grad = ctx.createRadialGradient(x, y, 0, x, y, glowRadius);
        grad.addColorStop(0, `rgba(245, 215, 130, ${opacity})`);
        grad.addColorStop(0.4, `rgba(212, 175, 55, ${opacity * 0.5})`);
        grad.addColorStop(1, "rgba(212, 175, 55, 0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, glowRadius, 0, Math.PI * 2);
        ctx.fill();

        // Bright core
        ctx.fillStyle = `rgba(255, 235, 175, ${opacity})`;
        ctx.beginPath();
        ctx.arc(x, y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [size, glow, particleCount]);

  return (
    <div
      className={`relative ${className}`}
      style={{ width: size, height: size, perspective: 400 }}
      aria-label="Guruvayur Dham"
      role="img"
    >
      {/* Particle canvas (orbits the logo) */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
        style={{ width: size, height: size }}
      />

      {/* Logo image with gold drop-shadow glow (like academy.guardianx.cloud) */}
      <div
        className="absolute inset-0 grid place-items-center"
        style={{ filter: `drop-shadow(0 0 12px ${glow}80)` }}
      >
        <img
          src={logoSrc}
          alt="Guruvayur Dham"
          className="object-contain"
          style={{ width: size * 0.6, height: size * 0.6 }}
          draggable={false}
        />
      </div>

      {/* Soft radial halo behind logo (CSS, doesn't depend on JS) */}
      <div
        aria-hidden
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(212,175,55,0.18), transparent 65%)",
          filter: "blur(8px)",
          zIndex: -1,
        }}
      />
    </div>
  );
}
