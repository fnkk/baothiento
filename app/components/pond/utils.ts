import type { PondRect } from "./types";

export const randomRange = (min: number, max: number) =>
  Math.random() * (max - min) + min;

export const getPondRect = (
  viewportWidth: number,
  viewportHeight: number
): PondRect => {
  const width = Math.min(viewportWidth * 0.88, 1180);
  const height = Math.min(viewportHeight * 0.82, 700);
  return {
    x: (viewportWidth - width) / 2,
    y: (viewportHeight - height) / 2,
    width,
    height,
    radius: Math.min(width, height) * 0.08,
  };
};

export const isPointInRoundedRect = (px: number, py: number, rect: PondRect) => {
  const { x, y, width, height, radius } = rect;
  const rx = Math.max(x + radius, Math.min(px, x + width - radius));
  const ry = Math.max(y + radius, Math.min(py, y + height - radius));
  const dx = px - rx;
  const dy = py - ry;
  return (
    dx * dx + dy * dy <= radius * radius ||
    (px >= x + radius &&
      px <= x + width - radius &&
      py >= y &&
      py <= y + height) ||
    (py >= y + radius &&
      py <= y + height - radius &&
      px >= x &&
      px <= x + width)
  );
};

export const drawRoundedRectPath = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) => {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
};
