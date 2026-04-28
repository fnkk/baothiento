import type { PondRect } from "./types";
import { drawRoundedRectPath, randomRange } from "./utils";

export type BackgroundOptions = {
  surfaceColor?: string;
  gradientStops?: [string, string, string];
  fogPuffCount?: number;
  grassCount?: number;
};

const DEFAULTS: Required<BackgroundOptions> = {
  surfaceColor: "#d9d6d3",
  gradientStops: ["#285f87", "#1f4f76", "#163f63"],
  fogPuffCount: 55,
  grassCount: 30,
};

export const drawBackground = (
  ctx: CanvasRenderingContext2D,
  pond: PondRect,
  viewportWidth: number,
  viewportHeight: number,
  options: BackgroundOptions = {}
) => {
  const opts = { ...DEFAULTS, ...options };

  ctx.clearRect(0, 0, viewportWidth, viewportHeight);
  ctx.fillStyle = opts.surfaceColor;
  ctx.fillRect(0, 0, viewportWidth, viewportHeight);

  drawRoundedRectPath(ctx, pond.x, pond.y, pond.width, pond.height, pond.radius);
  ctx.save();
  ctx.clip();

  const gradient = ctx.createLinearGradient(
    pond.x,
    pond.y,
    pond.x + pond.width,
    pond.y + pond.height
  );
  gradient.addColorStop(0, opts.gradientStops[0]);
  gradient.addColorStop(0.5, opts.gradientStops[1]);
  gradient.addColorStop(1, opts.gradientStops[2]);
  ctx.fillStyle = gradient;
  ctx.fillRect(pond.x, pond.y, pond.width, pond.height);

  for (let i = 0; i < opts.fogPuffCount; i += 1) {
    const puffX = randomRange(pond.x, pond.x + pond.width);
    const puffY = randomRange(pond.y, pond.y + pond.height);
    const puffR = randomRange(30, 85);
    const fog = ctx.createRadialGradient(
      puffX,
      puffY,
      puffR * 0.1,
      puffX,
      puffY,
      puffR
    );
    fog.addColorStop(0, "rgba(164, 216, 255, 0.09)");
    fog.addColorStop(1, "rgba(164, 216, 255, 0)");
    ctx.fillStyle = fog;
    ctx.beginPath();
    ctx.arc(puffX, puffY, puffR, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();

  ctx.strokeStyle = "rgba(255,255,255,0.15)";
  ctx.lineWidth = 3;
  drawRoundedRectPath(ctx, pond.x, pond.y, pond.width, pond.height, pond.radius);
  ctx.stroke();

  for (let i = 0; i < opts.grassCount; i += 1) {
    const x = randomRange(pond.x + 10, pond.x + pond.width - 10);
    const y =
      i % 2 === 0
        ? pond.y + randomRange(8, 22)
        : pond.y + pond.height - randomRange(8, 24);
    const h = randomRange(8, 22);
    ctx.strokeStyle = "rgba(114, 168, 111, 0.55)";
    ctx.lineWidth = randomRange(0.8, 1.8);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(
      x + randomRange(-4, 4),
      y - h * 0.45,
      x + randomRange(-5, 5),
      y - h
    );
    ctx.stroke();
  }
};
