export type Duck = {
  id: number;
  x: number;
  y: number;
  angle: number;
  speed: number;
  turnCooldown: number;
  rippleCooldown: number;
};

export type Ripple = {
  x: number;
  y: number;
  radius: number;
  alpha: number;
  growth: number;
  decay: number;
  lineWidth: number;
};

export type PondRect = {
  x: number;
  y: number;
  width: number;
  height: number;
  radius: number;
};
