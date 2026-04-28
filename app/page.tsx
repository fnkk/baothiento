"use client";

import { useEffect, useRef } from "react";

type Duck = {
  id: number;
  x: number;
  y: number;
  angle: number;
  speed: number;
  turnCooldown: number;
  rippleCooldown: number;
};

type Ripple = {
  x: number;
  y: number;
  radius: number;
  alpha: number;
  growth: number;
  decay: number;
  lineWidth: number;
};

type PondRect = {
  x: number;
  y: number;
  width: number;
  height: number;
  radius: number;
};

const randomRange = (min: number, max: number) => Math.random() * (max - min) + min;

const isPointInRoundedRect = (px: number, py: number, rect: PondRect) => {
  const { x, y, width, height, radius } = rect;
  const rx = Math.max(x + radius, Math.min(px, x + width - radius));
  const ry = Math.max(y + radius, Math.min(py, y + height - radius));
  const dx = px - rx;
  const dy = py - ry;
  return dx * dx + dy * dy <= radius * radius || (px >= x + radius && px <= x + width - radius && py >= y && py <= y + height) || (py >= y + radius && py <= y + height - radius && px >= x && px <= x + width);
};

const getPondRect = (viewportWidth: number, viewportHeight: number): PondRect => {
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

const drawRoundedRectPath = (
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

export default function Home() {
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
    let pond = getPondRect(viewportWidth, viewportHeight);
    const ducks: Duck[] = [];
    const ripples: Ripple[] = [];

    const spawnRipple = (
      x: number,
      y: number,
      alpha = 0.55,
      growth = randomRange(24, 38),
      decay = randomRange(0.44, 0.62)
    ) => {
      ripples.push({
        x,
        y,
        radius: randomRange(2, 6),
        alpha,
        growth,
        decay,
        lineWidth: randomRange(1.4, 2.4),
      });
    };

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
      drawBackgroundLayer();
    };

    const drawBackgroundLayer = () => {
      backgroundCtx.clearRect(0, 0, viewportWidth, viewportHeight);
      backgroundCtx.fillStyle = "#d9d6d3";
      backgroundCtx.fillRect(0, 0, viewportWidth, viewportHeight);

      drawRoundedRectPath(backgroundCtx, pond.x, pond.y, pond.width, pond.height, pond.radius);
      backgroundCtx.save();
      backgroundCtx.clip();

      const gradient = backgroundCtx.createLinearGradient(pond.x, pond.y, pond.x + pond.width, pond.y + pond.height);
      gradient.addColorStop(0, "#285f87");
      gradient.addColorStop(0.5, "#1f4f76");
      gradient.addColorStop(1, "#163f63");
      backgroundCtx.fillStyle = gradient;
      backgroundCtx.fillRect(pond.x, pond.y, pond.width, pond.height);

      for (let i = 0; i < 55; i += 1) {
        const puffX = randomRange(pond.x, pond.x + pond.width);
        const puffY = randomRange(pond.y, pond.y + pond.height);
        const puffR = randomRange(30, 85);
        const fog = backgroundCtx.createRadialGradient(puffX, puffY, puffR * 0.1, puffX, puffY, puffR);
        fog.addColorStop(0, "rgba(164, 216, 255, 0.09)");
        fog.addColorStop(1, "rgba(164, 216, 255, 0)");
        backgroundCtx.fillStyle = fog;
        backgroundCtx.beginPath();
        backgroundCtx.arc(puffX, puffY, puffR, 0, Math.PI * 2);
        backgroundCtx.fill();
      }

      backgroundCtx.restore();

      backgroundCtx.strokeStyle = "rgba(255,255,255,0.15)";
      backgroundCtx.lineWidth = 3;
      drawRoundedRectPath(backgroundCtx, pond.x, pond.y, pond.width, pond.height, pond.radius);
      backgroundCtx.stroke();

      for (let i = 0; i < 30; i += 1) {
        const x = randomRange(pond.x + 10, pond.x + pond.width - 10);
        const y = i % 2 === 0 ? pond.y + randomRange(8, 22) : pond.y + pond.height - randomRange(8, 24);
        const h = randomRange(8, 22);
        backgroundCtx.strokeStyle = "rgba(114, 168, 111, 0.55)";
        backgroundCtx.lineWidth = randomRange(0.8, 1.8);
        backgroundCtx.beginPath();
        backgroundCtx.moveTo(x, y);
        backgroundCtx.quadraticCurveTo(x + randomRange(-4, 4), y - h * 0.45, x + randomRange(-5, 5), y - h);
        backgroundCtx.stroke();
      }
    };

    const drawDuck = (duck: Duck) => {
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

    const tick = (ts: number) => {
      const delta = Math.min(0.035, (ts - lastTs) / 1000);
      lastTs = ts;

      ctx.clearRect(0, 0, viewportWidth, viewportHeight);
      ctx.drawImage(backgroundLayer, 0, 0);

      for (const duck of ducks) {
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
          spawnRipple(
            duck.x - Math.cos(duck.angle) * 10,
            duck.y - Math.sin(duck.angle) * 10,
            randomRange(0.22, 0.34),
            randomRange(18, 28),
            randomRange(0.5, 0.68)
          );
          duck.rippleCooldown = randomRange(0.18, 0.34);
        }
      }

      for (let i = ripples.length - 1; i >= 0; i -= 1) {
        const r = ripples[i];
        r.radius += r.growth * delta;
        r.alpha -= r.decay * delta;
        if (r.alpha <= 0) {
          ripples.splice(i, 1);
          continue;
        }
        ctx.strokeStyle = `rgba(184, 220, 249, ${r.alpha})`;
        ctx.lineWidth = r.lineWidth;
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.stroke();
      }

      for (const duck of ducks) {
        drawDuck(duck);
      }

      ctx.fillStyle = "rgba(255,255,255,0.65)";
      ctx.font = "14px Arial, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("点击池塘添加鸭子", viewportWidth / 2, pond.y - 14);

      rafId = requestAnimationFrame(tick);
    };

    const onClick = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      if (!isPointInRoundedRect(x, y, pond)) return;

      ducks.push({
        id: duckId,
        x,
        y,
        angle: randomRange(0, Math.PI * 2),
        speed: randomRange(28, 48),
        turnCooldown: randomRange(0.7, 2.2),
        rippleCooldown: randomRange(0.04, 0.12),
      });
      duckId += 1;

      spawnRipple(x, y, 0.68, randomRange(38, 54), randomRange(0.5, 0.7));
      spawnRipple(x, y, 0.44, randomRange(22, 34), randomRange(0.44, 0.58));
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
  }, []);

  return (
    <main className="h-screen w-screen overflow-hidden bg-[#d9d6d3]">
      <canvas ref={canvasRef} className="h-full w-full cursor-pointer" />
    </main>
  );
}
