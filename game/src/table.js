// table.js — the playfield: walls, bumpers, heart, targets, lanes, saucer, ramp, slings.
// Geometry only; rules live in game.js, collision math in physics.js.
import { FLIPPER } from './config.js';

export function buildTable() {
  const walls = [];
  const add = (x1, y1, x2, y2, rest = 0.4, sling = null) => walls.push({ x1, y1, x2, y2, rest, sling });

  // Left wall (top arc starts here).
  add(30, 200, 30, 690);
  // Top arc: half-ellipse, centre (420,200), rx 390, ry 180.
  // Steep at the lane (right end) so a launched ball is turned left into play.
  const cx = 420, cy = 200, rx = 390, ry = 180;
  let prev = null;
  for (let deg = 180; deg >= 0; deg -= 9) {
    const t = (deg * Math.PI) / 180;
    const p = { x: cx + rx * Math.cos(t), y: cy - ry * Math.sin(t) };
    if (prev) add(prev.x, prev.y, p.x, p.y);
    prev = p;
  }
  // Right outer wall + plunger lane divider + lane floor.
  add(810, 200, 810, 690);
  add(760, 150, 760, 690);
  add(760, 690, 810, 690, 0.3);
  // Inlane guides funnel the ball to the flippers.
  add(30, 470, 320, 615, 0.5);
  add(760, 470, 519, 615, 0.5);
  // Slingshots above the flippers (kick the ball on contact).
  add(300, 545, 362, 575, 1.1, 'left');
  add(362, 575, 300, 605, 1.1, 'left');
  add(540, 545, 478, 575, 1.1, 'right');
  add(478, 575, 540, 605, 1.1, 'right');

  return {
    walls,
    bumpers: [
      { x: 300, y: 220, r: 26, flash: 0 },
      { x: 420, y: 170, r: 26, flash: 0 },
      { x: 540, y: 220, r: 26, flash: 0 },
    ],
    heart: { x: 420, y: 300, r: 34, flash: 0 },
    jackpotTarget: { x: 420, y: 430, r: 16, flash: 0 },
    targets: [
      { x: 700, y: 300, r: 14, down: false, flash: 0, drop: 0, label: 'A' },
      { x: 700, y: 350, r: 14, down: false, flash: 0, drop: 0, label: 'R' },
      { x: 700, y: 400, r: 14, down: false, flash: 0, drop: 0, label: 'C' },
    ],
    lanes: [
      { x: 280, y: 100, r: 12, lit: false, label: 'S' },
      { x: 420, y: 84, r: 12, lit: false, label: 'I' },
      { x: 560, y: 100, r: 12, lit: false, label: 'L' },
    ],
    saucer: { x: 660, y: 150, r: 20, locks: 0 },
    // Spinner: passive sensor in the empty left-mid field. The ball passing
    // through spins it (visual + small points); it never deflects the ball,
    // so the core physics and missions are untouched.
    spinner: { x: 200, y: 440, r: 20, angle: 0, spin: 0, cd: 0 },
    slingFlashL: 0, slingFlashR: 0, rampGlow: 0,
    ramp: {
      mouth: { x: 120, y: 300, r: 32 },
      p0: { x: 120, y: 300 }, p1: { x: 80, y: 110 }, p2: { x: 420, y: 80 },
    },
    flipperL: { pivot: { ...FLIPPER.pivotL }, angle: FLIPPER.restL, omega: 0, pressed: false, upSign: -1 },
    flipperR: { pivot: { ...FLIPPER.pivotR }, angle: FLIPPER.restR, omega: 0, pressed: false, upSign: 1 },
  };
}
