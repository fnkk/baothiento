"use client";

import { useEffect, useRef } from "react";
import { drawBackground } from "./Background";
import { createDuck, drawDuck, updateDuck } from "./Duck";
import { createRipple, drawRipple, updateRipple } from "./Ripple";
import type { Duck, PondRect, Ripple } from "./types";
import { getPondRect, isPointInRoundedRect, randomRange } from "./utils";

type PondCanvasProps = {
  className?: string;
  hint?: string;
};

export default function PondCanvas({
  className,
  hint = "点击池塘添加鸭子",
}: PondCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const backgroundLayer = document.createElement("canvas");
    const backgroundCtx = backgroundLayer.getContext("2d");
    if (!backgroundCtx) return;

    let rafId = 0;
    let duckId = 0;
    let lastTs = performance.now();
    let viewportWidth = window.innerWidth;
    let viewportHeight = window.innerHeight;
    let pond: PondRect = getPondRect(viewportWidth, viewportHeight);
    const ducks: Duck[] = [];
    const ripples: Ripple[] = [];

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      const displayWidth = window.innerWidth;
      const displayHeight = window.innerHeight;
      viewportWidth = displayWidth;
      viewportHeight = displayHeight;
      canvas.width = Math.floor(displayWidth * dpr);
      canvas.height = Math.floor(displayHeight * dpr);
      canvas.style.width = `${displayWidth}px`;
      canvas.style.height = `${displayHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      pond = getPondRect(viewportWidth, viewportHeight);
      backgroundLayer.width = displayWidth;
      backgroundLayer.height = displayHeight;
      drawBackground(backgroundCtx, pond, viewportWidth, viewportHeight);
    };

    const tick = (ts: number) => {
      const delta = Math.min(0.035, (ts - lastTs) / 1000);
      lastTs = ts;

      ctx.clearRect(0, 0, viewportWidth, viewportHeight);
      ctx.drawImage(backgroundLayer, 0, 0);

      for (const duck of ducks) {
        const result = updateDuck(duck, delta, pond);
        if (result.shouldEmitRipple) {
          ripples.push(
            createRipple(
              result.rippleX,
              result.rippleY,
              randomRange(0.22, 0.34),
              randomRange(18, 28),
              randomRange(0.5, 0.68)
            )
          );
        }
      }

      for (let i = ripples.length - 1; i >= 0; i -= 1) {
        const alive = updateRipple(ripples[i], delta);
        if (!alive) {
          ripples.splice(i, 1);
          continue;
        }
        drawRipple(ctx, ripples[i]);
      }

      for (const duck of ducks) {
        drawDuck(ctx, duck);
      }

      ctx.fillStyle = "rgba(255,255,255,0.65)";
      ctx.font = "14px Arial, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(hint, viewportWidth / 2, pond.y - 14);

      rafId = requestAnimationFrame(tick);
    };

    const onClick = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      if (!isPointInRoundedRect(x, y, pond)) return;

      ducks.push(createDuck(duckId, x, y));
      duckId += 1;

      ripples.push(
        createRipple(x, y, 0.68, randomRange(38, 54), randomRange(0.5, 0.7))
      );
      ripples.push(
        createRipple(x, y, 0.44, randomRange(22, 34), randomRange(0.44, 0.58))
      );
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    canvas.addEventListener("click", onClick);
    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resizeCanvas);
      canvas.removeEventListener("click", onClick);
    };
  }, [hint]);

  return (
    <canvas
      ref={canvasRef}
      className={className ?? "h-full w-full cursor-pointer"}
    />
  );
}
