// physics.js — ball integration and collision. Pure math + table geometry;
// scoring and missions are decided by hooks the game supplies.
import { PHYS, FLIPPER } from './config.js';

export function makeBall(x, y) {
  return { x, y, vx: 0, vy: 0, r: PHYS.ballR, rampT: -1, rampCd: 0, launching: false, trail: [] };
}

function closestOnSeg(px, py, ax, ay, bx, by) {
  const dx = bx - ax, dy = by - ay;
  const len2 = dx * dx + dy * dy;
  let t = len2 > 0 ? ((px - ax) * dx + (py - ay) * dy) / len2 : 0;
  t = Math.max(0, Math.min(1, t));
  return { x: ax + t * dx, y: ay + t * dy, t };
}

// Circle vs segment: push out and reflect the velocity component into the wall.
export function collideSeg(ball, seg) {
  const c = closestOnSeg(ball.x, ball.y, seg.x1, seg.y1, seg.x2, seg.y2);
  let nx = ball.x - c.x, ny = ball.y - c.y;
  const d = Math.hypot(nx, ny);
  if (d >= ball.r || d === 0) return null;
  nx /= d; ny /= d;
  ball.x = c.x + nx * ball.r; ball.y = c.y + ny * ball.r;
  const vn = ball.vx * nx + ball.vy * ny;
  if (vn < 0) {
    const e = seg.rest ?? PHYS.wallRest;
    ball.vx -= (1 + e) * vn * nx;
    ball.vy -= (1 + e) * vn * ny;
  }
  return { nx, ny };
}

// Circle vs circle (bumper-style). Returns the normal or null.
export function collideCircle(ball, cx, cy, cr, rest) {
  let nx = ball.x - cx, ny = ball.y - cy;
  const d = Math.hypot(nx, ny);
  const min = ball.r + cr;
  if (d >= min || d === 0) return null;
  nx /= d; ny /= d;
  ball.x = cx + nx * min; ball.y = cy + ny * min;
  const vn = ball.vx * nx + ball.vy * ny;
  if (vn < 0) {
    ball.vx -= (1 + rest) * vn * nx;
    ball.vy -= (1 + rest) * vn * ny;
  }
  return { nx, ny };
}

export function flipperTip(f) {
  return {
    x: f.pivot.x + Math.cos(f.angle) * FLIPPER.len,
    y: f.pivot.y + Math.sin(f.angle) * FLIPPER.len,
  };
}

export function updateFlipper(f, pressed, dt) {
  const target = pressed
    ? (f.upSign < 0 ? FLIPPER.activeL : FLIPPER.activeR)
    : (f.upSign < 0 ? FLIPPER.restL : FLIPPER.restR);
  const speed = pressed ? FLIPPER.upSpeed : FLIPPER.downSpeed;
  const prev = f.angle;
  const diff = target - f.angle;
  const step = Math.max(-speed * dt, Math.min(speed * dt, diff));
  f.angle += step;
  f.omega = dt > 0 ? (f.angle - prev) / dt : 0;
  f.pressed = pressed;
}

// Flipper collision: the flipper is a moving segment; its surface velocity
// (omega x radius) is what flicks the ball upward.
export function collideFlipper(ball, f) {
  const tip = flipperTip(f);
  const c = closestOnSeg(ball.x, ball.y, f.pivot.x, f.pivot.y, tip.x, tip.y);
  let nx = ball.x - c.x, ny = ball.y - c.y;
  const d = Math.hypot(nx, ny);
  if (d >= ball.r || d === 0) return false;
  nx /= d; ny /= d;
  ball.x = c.x + nx * ball.r; ball.y = c.y + ny * ball.r;
  // Surface velocity at the contact point.
  const rx = c.x - f.pivot.x, ry = c.y - f.pivot.y;
  const svx = -f.omega * ry, svy = f.omega * rx;
  const vrx = ball.vx - svx, vry = ball.vy - svy;
  const vn = vrx * nx + vry * ny;
  if (vn < 0) {
    ball.vx -= 1.3 * vn * nx;
    ball.vy -= 1.3 * vn * ny;
    // Extra flick while the flipper swings up.
    if (f.omega * f.upSign > 8) {
      ball.vx += nx * FLIPPER.flickBoost;
      ball.vy += ny * FLIPPER.flickBoost;
    }
  }
  return true;
}

function bezier(p0, p1, p2, t) {
  const u = 1 - t;
  return {
    x: u * u * p0.x + 2 * u * t * p1.x + t * t * p2.x,
    y: u * u * p0.y + 2 * u * t * p1.y + t * t * p2.y,
  };
}

// Step every ball once (dt seconds). Hooks report events; the game scores them.
// hooks: onBumper(i), onHeart(), onTarget(i), onLane(i), onSaucer(ball)->'capture'|null,
//        onJackpot(), onSling(side), onRampStart(), onRampEnd(), onDrain(ball)
export function stepBalls(balls, table, dt, now, hooks) {
  for (const ball of balls) {
    if (ball.rampCd > 0) ball.rampCd -= dt;
    if (ball.rampT >= 0) {
      // Scripted ramp ride: follow the arc, then re-enter play at the top.
      ball.rampT += dt / 0.9;
      if (ball.rampT >= 1) {
        ball.rampT = -1;
        ball.x = table.ramp.p2.x; ball.y = table.ramp.p2.y;
        ball.vx = 260; ball.vy = 220;
        ball.rampCd = 1.0;
        hooks.onRampEnd && hooks.onRampEnd(ball);
      } else {
        const p = bezier(table.ramp.p0, table.ramp.p1, table.ramp.p2, ball.rampT);
        ball.x = p.x; ball.y = p.y;
        ball.vx = 0; ball.vy = 0;
      }
      continue;
    }

    ball.vy += PHYS.gravity * dt;
    ball.x += ball.vx * dt;
    ball.y += ball.vy * dt;
    const sp = Math.hypot(ball.vx, ball.vy);
    if (sp > PHYS.maxSpeed) {
      ball.vx *= PHYS.maxSpeed / sp; ball.vy *= PHYS.maxSpeed / sp;
    }
    ball.trail.push({ x: ball.x, y: ball.y });
    if (ball.trail.length > 12) ball.trail.shift();

    // Walls (slingshots kick on contact).
    for (const w of table.walls) {
      const hit = collideSeg(ball, w);
      if (hit && w.sling) {
        if (w.sling === 'left') table.slingFlashL = 1; else table.slingFlashR = 1;
        ball.vx += (w.sling === 'left' ? 260 : -260);
        ball.vy += 120;
        hooks.onSling && hooks.onSling(w.sling, ball);
      }
    }
    // One-way gate at the plunger lane mouth: a playfield ball cannot re-enter
    // the lane through the gap between the arc and the divider top (y<155);
    // a launched ball (launching) passes through to the left.
    if (ball.x + ball.r > 755 && ball.y < 155 && ball.vx > 0 && !ball.launching) {
      ball.x = 755 - ball.r;
      ball.vx = -Math.abs(ball.vx) * 0.4;
    }
    // Flippers.
    collideFlipper(ball, table.flipperL);
    collideFlipper(ball, table.flipperR);
    // Bumpers: hard kick away.
    table.bumpers.forEach((b, i) => {
      const hit = collideCircle(ball, b.x, b.y, b.r, 0.2);
      if (hit) {
        const s = Math.max(640, Math.hypot(ball.vx, ball.vy) * 1.05);
        ball.vx = hit.nx * s + ball.vx * 0.15;
        ball.vy = hit.ny * s + ball.vy * 0.15;
        b.flash = 1;
        hooks.onBumper && hooks.onBumper(i, ball);
      }
    });
    // Arcade Heart: bouncy.
    if (collideCircle(ball, table.heart.x, table.heart.y, table.heart.r, 0.9)) {
      table.heart.flash = 1;
      hooks.onHeart && hooks.onHeart(ball);
    }
    // Jackpot target.
    if (collideCircle(ball, table.jackpotTarget.x, table.jackpotTarget.y, table.jackpotTarget.r, 0.7)) {
      table.jackpotTarget.flash = 1;
      hooks.onJackpot && hooks.onJackpot(ball);
    }
    // Drop targets.
    table.targets.forEach((t, i) => {
      if (t.down) return;
      if (collideCircle(ball, t.x, t.y, t.r, 0.6)) {
        t.down = true; t.flash = 1; t.drop = 1;
        hooks.onTarget && hooks.onTarget(i, ball);
      }
    });
    // Spinner: passive sensor — spins on pass-through, never deflects.
    {
      const sp = table.spinner;
      if (sp.cd > 0) sp.cd -= dt;
      const d = Math.hypot(ball.x - sp.x, ball.y - sp.y);
      if (d < sp.r + ball.r && sp.cd <= 0) {
        sp.spin = Math.min(14, 4 + Math.hypot(ball.vx, ball.vy) / 220);
        sp.cd = 0.3;
        hooks.onSpinner && hooks.onSpinner(ball);
      }
    }
    // Rollover lanes.
    table.lanes.forEach((l, i) => {
      if (l.lit) return;
      const d = Math.hypot(ball.x - l.x, ball.y - l.y);
      if (d < l.r + ball.r) {
        l.lit = true;
        hooks.onLane && hooks.onLane(i, ball);
      }
    });
    // Saucer (multiball lock).
    if (Math.hypot(ball.x - table.saucer.x, ball.y - table.saucer.y) < table.saucer.r + ball.r) {
      const res = hooks.onSaucer && hooks.onSaucer(ball);
      if (res !== 'capture') collideCircle(ball, table.saucer.x, table.saucer.y, table.saucer.r, 0.8);
    }
    // Ramp mouth: fast enough and the ball rides the arc.
    if (ball.rampT < 0 && ball.rampCd <= 0) {
      const d = Math.hypot(ball.x - table.ramp.mouth.x, ball.y - table.ramp.mouth.y);
      const speed = Math.hypot(ball.vx, ball.vy);
      if (d < table.ramp.mouth.r + ball.r && speed > PHYS.rampMinSpeed) {
        ball.rampT = 0;
        hooks.onRampStart && hooks.onRampStart(ball);
      }
    }
    // Drain.
    if (ball.y - ball.r > PHYS.drainY) hooks.onDrain && hooks.onDrain(ball);
  }
}
