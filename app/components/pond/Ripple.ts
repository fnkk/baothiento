import type { Ripple } from "./types";
import { randomRange } from "./utils";

export const createRipple = (
  x: number,
  y: number,
  alpha = 0.55,
  growth = randomRange(24, 38),
  decay = randomRange(0.44, 0.62)
): Ripple => ({
  x,
  y,
  radius: randomRange(2, 6),
  alpha,
  growth,
  decay,
  lineWidth: randomRange(1.4, 2.4),
});

export const updateRipple = (ripple: Ripple, delta: number): boolean => {
  ripple.radius += ripple.growth * delta;
  ripple.alpha -= ripple.decay * delta;
  return ripple.alpha > 0;
};

export const drawRipple = (ctx: CanvasRenderingContext2D, ripple: Ripple) => {
  ctx.strokeStyle = `rgba(184, 220, 249, ${ripple.alpha})`;
  ctx.lineWidth = ripple.lineWidth;
  ctx.beginPath();
  ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
  ctx.stroke();
};
