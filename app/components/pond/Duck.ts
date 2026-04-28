import type { Duck, PondRect } from "./types";
import { randomRange } from "./utils";

export const createDuck = (id: number, x: number, y: number): Duck => ({
  id,
  x,
  y,
  angle: randomRange(0, Math.PI * 2),
  speed: randomRange(28, 48),
  turnCooldown: randomRange(0.7, 2.2),
  rippleCooldown: randomRange(0.04, 0.12),
});

const keepDuckInPond = (duck: Duck, pond: PondRect) => {
  const minX = pond.x + 16;
  const maxX = pond.x + pond.width - 16;
  const minY = pond.y + 16;
  const maxY = pond.y + pond.height - 16;

  if (duck.x < minX || duck.x > maxX) {
    duck.angle = Math.PI - duck.angle + randomRange(-0.35, 0.35);
    duck.x = Math.max(minX, Math.min(maxX, duck.x));
    duck.turnCooldown = randomRange(0.25, 0.65);
  }
  if (duck.y < minY || duck.y > maxY) {
    duck.angle = -duck.angle + randomRange(-0.35, 0.35);
    duck.y = Math.max(minY, Math.min(maxY, duck.y));
    duck.turnCooldown = randomRange(0.25, 0.65);
  }
};

export type DuckTickResult = {
  shouldEmitRipple: boolean;
  rippleX: number;
  rippleY: number;
};

export const updateDuck = (
  duck: Duck,
  delta: number,
  pond: PondRect
): DuckTickResult => {
  duck.turnCooldown -= delta;
  duck.rippleCooldown -= delta;

  if (duck.turnCooldown <= 0) {
    duck.angle += randomRange(-0.8, 0.8);
    duck.speed = randomRange(26, 44);
    duck.turnCooldown = randomRange(1.2, 2.8);
  }

  duck.x += Math.cos(duck.angle) * duck.speed * delta;
  duck.y += Math.sin(duck.angle) * duck.speed * delta;
  keepDuckInPond(duck, pond);

  if (duck.rippleCooldown <= 0) {
    duck.rippleCooldown = randomRange(0.18, 0.34);
    return {
      shouldEmitRipple: true,
      rippleX: duck.x - Math.cos(duck.angle) * 10,
      rippleY: duck.y - Math.sin(duck.angle) * 10,
    };
  }

  return { shouldEmitRipple: false, rippleX: 0, rippleY: 0 };
};

export const drawDuck = (ctx: CanvasRenderingContext2D, duck: Duck) => {
  ctx.save();
  ctx.translate(duck.x, duck.y);
  ctx.rotate(duck.angle);

  ctx.fillStyle = "#f0bf4e";
  ctx.beginPath();
  ctx.ellipse(0, 0, 12, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#f3c85a";
  ctx.beginPath();
  ctx.arc(9, -6, 5.4, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#df7f36";
  ctx.beginPath();
  ctx.moveTo(14, -6);
  ctx.lineTo(20, -4);
  ctx.lineTo(14, -2.4);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#2f2a24";
  ctx.beginPath();
  ctx.arc(10.6, -6.8, 1, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
};
