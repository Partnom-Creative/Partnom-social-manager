"use client";

import { useEffect, useRef } from "react";

import { authAppearance } from "@/config/auth-appearance";
import { cn } from "@/lib/utils";

const MOUSE_OFFSCREEN = -9999;

type DotGridRuntimeProps = {
  spacing: number;
  glowRadius: number;
  dimOpacity: number;
  pushRadius: number;
  pushStrength: number;
  dotRgb: { r: number; g: number; b: number };
};

type InteractiveDotGridBackgroundProps = {
  className?: string;
  /** Override config — omit to use `authAppearance.dotGrid` */
  spacing?: number;
  glowRadius?: number;
  dimOpacity?: number;
  pushRadius?: number;
  pushStrength?: number;
  /** Ms of no movement before glow + force field stop (default from config) */
  idleMs?: number;
};

/**
 * Full-area dotted grid: brightens near the pointer + “force field”
 * (dots are displaced outward from the cursor). Defaults from
 * `src/config/auth-appearance.ts`.
 */
export function InteractiveDotGridBackground({
  className,
  spacing: spacingProp,
  glowRadius: glowRadiusProp,
  dimOpacity: dimOpacityProp,
  pushRadius: pushRadiusProp,
  pushStrength: pushStrengthProp,
  idleMs: idleMsProp,
}: InteractiveDotGridBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: MOUSE_OFFSCREEN, y: MOUSE_OFFSCREEN });
  const rafRef = useRef(0);
  const idleMsRef = useRef(idleMsProp ?? authAppearance.dotGrid.idleMs);
  idleMsRef.current = idleMsProp ?? authAppearance.dotGrid.idleMs;
  const propsRef = useRef<DotGridRuntimeProps>({
    spacing: authAppearance.dotGrid.spacing,
    glowRadius: authAppearance.dotGrid.glowRadius,
    dimOpacity: authAppearance.dotGrid.dimOpacity,
    pushRadius: authAppearance.dotGrid.pushRadius,
    pushStrength: authAppearance.dotGrid.pushStrength,
    dotRgb: { ...authAppearance.dotGrid.dotRgb },
  });

  propsRef.current = {
    spacing: spacingProp ?? authAppearance.dotGrid.spacing,
    glowRadius: glowRadiusProp ?? authAppearance.dotGrid.glowRadius,
    dimOpacity: dimOpacityProp ?? authAppearance.dotGrid.dimOpacity,
    pushRadius: pushRadiusProp ?? authAppearance.dotGrid.pushRadius,
    pushStrength: pushStrengthProp ?? authAppearance.dotGrid.pushStrength,
    dotRgb: authAppearance.dotGrid.dotRgb,
  };

  useEffect(() => {
    const canvasNode = canvasRef.current;
    if (!canvasNode) return;
    const ctx = canvasNode.getContext("2d");
    if (!ctx) return;

    let idleTimer: ReturnType<typeof setTimeout> | null = null;

    function resize() {
      const dpr = Math.min(typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1, 2);
      const parent = canvasNode.parentElement;
      const w = parent?.clientWidth ?? 0;
      const h = parent?.clientHeight ?? 0;
      if (w === 0 || h === 0) return;
      canvasNode.style.width = `${w}px`;
      canvasNode.style.height = `${h}px`;
      canvasNode.width = Math.floor(w * dpr);
      canvasNode.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function draw() {
      const {
        spacing: sp,
        glowRadius: gr,
        dimOpacity: dim,
        pushRadius: pr,
        pushStrength: ps,
        dotRgb,
      } = propsRef.current;
      const w = canvasNode.clientWidth;
      const h = canvasNode.clientHeight;
      if (w === 0 || h === 0) return;

      ctx.clearRect(0, 0, w, h);
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      for (let y = sp / 2; y < h; y += sp) {
        for (let x = sp / 2; x < w; x += sp) {
          const dx = x - mx;
          const dy = y - my;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const t = Math.max(0, 1 - dist / gr);
          const smooth = t * t * (3 - 2 * t);
          const alpha = dim + (1 - dim) * smooth;

          // Force field: push away from cursor (radial repulsion)
          let nx = 0;
          let ny = 0;
          if (dist > 0.5) {
            nx = dx / dist;
            ny = dy / dist;
          }
          const pushT = Math.max(0, 1 - dist / pr);
          const pushSmooth = pushT * pushT * (3 - 2 * pushT);
          const px = x + nx * ps * pushSmooth;
          const py = y + ny * ps * pushSmooth;

          ctx.fillStyle = `rgba(${dotRgb.r},${dotRgb.g},${dotRgb.b},${alpha})`;
          ctx.beginPath();
          ctx.arc(px, py, 1, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    function scheduleDraw() {
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = 0;
        draw();
      });
    }

    const onMove = (e: PointerEvent) => {
      if (idleTimer) {
        clearTimeout(idleTimer);
        idleTimer = null;
      }
      const rect = canvasNode.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
      scheduleDraw();
      idleTimer = setTimeout(() => {
        idleTimer = null;
        mouseRef.current = { x: MOUSE_OFFSCREEN, y: MOUSE_OFFSCREEN };
        scheduleDraw();
      }, idleMsRef.current);
    };

    resize();
    draw();

    const ro = new ResizeObserver(() => {
      resize();
      draw();
    });
    const parentEl = canvasNode.parentElement;
    if (parentEl) ro.observe(parentEl);

    window.addEventListener("pointermove", onMove, { passive: true });

    return () => {
      if (idleTimer) clearTimeout(idleTimer);
      window.removeEventListener("pointermove", onMove);
      ro.disconnect();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={cn("pointer-events-none absolute inset-0 z-0 h-full w-full", className)}
      aria-hidden
    />
  );
}
