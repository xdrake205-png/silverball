// render.js — all drawing: table, balls, HUD panel, and every screen.
// Layout: table x 0..840, side panel x 850..1260, reference resolution 1280x720.
import { W, H, PALETTE, MISSIONS } from './config.js';
import { flipperTip } from './physics.js';
import { missionProgress, currentMission, BONUSES } from './missions.js';

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function text(ctx, str, x, y, size, color, align = 'left', weight = 'bold') {
  ctx.font = `${weight} ${size}px system-ui, sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = color;
  ctx.fillText(str, x, y);
}

function wrapText(ctx, str, x, y, maxW, size, color, lh = 22) {
  ctx.font = `16px system-ui, sans-serif`;
  const words = str.split(' ');
  let line = '', yy = y;
  for (const w of words) {
    const test = line ? line + ' ' + w : w;
    if (ctx.measureText(test).width > maxW && line) {
      text(ctx, line, x, yy, size, color, 'left', 'normal');
      line = w; yy += lh;
    } else line = test;
  }
  if (line) text(ctx, line, x, yy, size, color, 'left', 'normal');
  return yy;
}

function heartPath(ctx, x, y, s) {
  ctx.beginPath();
  ctx.moveTo(x, y + s * 0.9);
  ctx.bezierCurveTo(x - s * 1.3, y, x - s * 0.6, y - s, x, y - s * 0.25);
  ctx.bezierCurveTo(x + s * 0.6, y - s, x + s * 1.3, y, x, y + s * 0.9);
  ctx.closePath();
}

function drawFlipper(ctx, f, color) {
  const tip = flipperTip(f);
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineCap = 'round';
  ctx.lineWidth = 16;
  ctx.shadowColor = color; ctx.shadowBlur = 10;
  ctx.beginPath(); ctx.moveTo(f.pivot.x, f.pivot.y); ctx.lineTo(tip.x, tip.y); ctx.stroke();
  ctx.restore();
  ctx.fillStyle = '#e8ecf7';
  ctx.beginPath(); ctx.arc(f.pivot.x, f.pivot.y, 9, 0, Math.PI * 2); ctx.fill();
}

function bezier2(p0, p1, p2, t) {
  const u = 1 - t;
  return {
    x: u * u * p0.x + 2 * u * t * p1.x + t * t * p2.x,
    y: u * u * p0.y + 2 * u * t * p1.y + t * t * p2.y,
  };
}

function drawBall(ctx, b) {
  // Trail: one tapered polyline (wide and faint at the tail, thin and bright
  // near the ball) — no overlapping circles, so it never smears into a blob.
  const tr = b.trail;
  if (tr.length > 1) {
    ctx.save();
    ctx.lineCap = 'round';
    for (let i = 1; i < tr.length; i++) {
      const f = i / tr.length; // 0 at tail, 1 at ball
      ctx.globalAlpha = f * 0.3;
      ctx.strokeStyle = '#c9d4e6';
      ctx.lineWidth = 2 + f * 7;
      ctx.beginPath();
      ctx.moveTo(tr[i - 1].x, tr[i - 1].y);
      ctx.lineTo(tr[i].x, tr[i].y);
      ctx.stroke();
    }
    ctx.restore();
  }
  ctx.globalAlpha = 1;
  // Bright rim + glow so the ball stays readable at full speed.
  ctx.save();
  ctx.shadowColor = '#e8f6ff'; ctx.shadowBlur = 14;
  const g = ctx.createRadialGradient(b.x - 4, b.y - 4, 1, b.x, b.y, b.r + 1);
  g.addColorStop(0, '#ffffff'); g.addColorStop(0.45, '#dfe6f5'); g.addColorStop(1, '#7d8aa5');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  ctx.strokeStyle = 'rgba(255,255,255,0.9)'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.95)';
  ctx.beginPath(); ctx.arc(b.x - 4, b.y - 4, 2.5, 0, Math.PI * 2); ctx.fill();
}

export function render(ctx, game) {
  const { table } = game;
  ctx.clearRect(0, 0, W, H);
  // Background.
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#1a0b3d'); bg.addColorStop(1, PALETTE.bg);
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
  const shake = game.juice.offset();
  ctx.save();
  ctx.translate(shake.x, shake.y);

  // Starfield.
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  for (const s of game.stars) { ctx.globalAlpha = s.a; ctx.fillRect(s.x, s.y, 2, 2); }
  ctx.globalAlpha = 1;

  // Playfield panel.
  ctx.fillStyle = '#1a0f3d';
  rr(ctx, 20, 10, 800, 700, 26); ctx.fill();
  ctx.strokeStyle = 'rgba(34,211,238,0.55)'; ctx.lineWidth = 3;
  rr(ctx, 20, 10, 800, 700, 26); ctx.stroke();

  // Decorative neon dots filling the empty playfield (visual only).
  ctx.fillStyle = '#22d3ee';
  for (const d of game.decorDots) { ctx.globalAlpha = Math.min(1, d.a * 1.6); ctx.fillRect(d.x - 1, d.y - 1, 2, 2); }
  ctx.globalAlpha = 1;

  // Marquee.
  text(ctx, '★ SILVERBALL ★', 420, 48, 30, PALETTE.neonAmber, 'center');
  text(ctx, 'SAVE THE LAST ARCADE', 420, 66, 13, PALETTE.dim, 'center');

  // Ramp arc (+ glow overlay and a travelling highlight while a ball rides it).
  ctx.strokeStyle = 'rgba(255,176,32,0.8)'; ctx.lineWidth = 10; ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(table.ramp.p0.x, table.ramp.p0.y);
  ctx.quadraticCurveTo(table.ramp.p1.x, table.ramp.p1.y, table.ramp.p2.x, table.ramp.p2.y);
  ctx.stroke();
  if (table.rampGlow > 0) {
    ctx.save();
    ctx.strokeStyle = PALETTE.neonAmber; ctx.lineWidth = 10 + table.rampGlow * 6;
    ctx.globalAlpha = 0.35 + table.rampGlow * 0.6;
    ctx.shadowColor = PALETTE.neonAmber; ctx.shadowBlur = 22 * table.rampGlow;
    ctx.beginPath();
    ctx.moveTo(table.ramp.p0.x, table.ramp.p0.y);
    ctx.quadraticCurveTo(table.ramp.p1.x, table.ramp.p1.y, table.ramp.p2.x, table.ramp.p2.y);
    ctx.stroke();
    const hp = bezier2(table.ramp.p0, table.ramp.p1, table.ramp.p2, 1 - table.rampGlow);
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.arc(hp.x, hp.y, 6, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
  ctx.strokeStyle = PALETTE.neonAmber; ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(table.ramp.p0.x, table.ramp.p0.y);
  ctx.quadraticCurveTo(table.ramp.p1.x, table.ramp.p1.y, table.ramp.p2.x, table.ramp.p2.y);
  ctx.stroke();
  text(ctx, 'RAMP', 120, 345, 12, PALETTE.neonAmber, 'center');

  // Walls / rails.
  ctx.strokeStyle = PALETTE.neonCyan; ctx.lineWidth = 3; ctx.lineCap = 'round';
  ctx.shadowColor = PALETTE.neonCyan; ctx.shadowBlur = 6;
  for (const w of table.walls) {
    ctx.beginPath(); ctx.moveTo(w.x1, w.y1); ctx.lineTo(w.x2, w.y2); ctx.stroke();
  }
  ctx.shadowBlur = 0;

  // Plunger lane label + power meter (drawn after the rails so it stays legible).
  // Dark pill behind the label so the top arc never shows through it.
  ctx.fillStyle = '#1a0f3d';
  rr(ctx, 762, 106, 46, 16, 6); ctx.fill();
  text(ctx, 'PLUNGE', 785, 118, 10, PALETTE.dim, 'center');
  if (game.state === 'serving') {
    ctx.fillStyle = '#2a1a5e'; rr(ctx, 772, 140, 26, 300, 6); ctx.fill();
    const h = 300 * game.plungePower;
    ctx.fillStyle = game.plungePower > 0.75 ? PALETTE.neonRed : PALETTE.neonAmber;
    rr(ctx, 772, 140 + 300 - h, 26, h, 6); ctx.fill();
    // Two short lines fit inside the 50px lane; one line overflows the table.
    text(ctx, 'HOLD', 785, 462, 11, PALETTE.cream, 'center');
    text(ctx, 'SPACE', 785, 478, 11, PALETTE.cream, 'center');
  }

  // Rollover lanes S-I-L.
  for (const l of table.lanes) {
    ctx.fillStyle = l.lit ? PALETTE.neonGreen : '#2a1a5e';
    ctx.shadowColor = l.lit ? PALETTE.neonGreen : 'transparent'; ctx.shadowBlur = l.lit ? 14 : 0;
    ctx.beginPath(); ctx.arc(l.x, l.y, l.r, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
    text(ctx, l.label, l.x, l.y + 5, 13, l.lit ? '#062b16' : PALETTE.dim, 'center');
  }

  // Spinner (passive sensor, left-mid field).
  {
    const sp = table.spinner;
    ctx.save();
    ctx.translate(sp.x, sp.y);
    ctx.fillStyle = '#2a1a5e';
    ctx.beginPath(); ctx.arc(0, 0, sp.r, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = PALETTE.neonCyan; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(0, 0, sp.r, 0, Math.PI * 2); ctx.stroke();
    ctx.rotate(sp.angle);
    ctx.strokeStyle = sp.spin > 0.5 ? '#ffffff' : PALETTE.neonCyan;
    ctx.lineWidth = 4; ctx.lineCap = 'round';
    ctx.shadowColor = PALETTE.neonCyan; ctx.shadowBlur = sp.spin > 0.5 ? 10 : 0;
    ctx.beginPath(); ctx.moveTo(-sp.r + 4, 0); ctx.lineTo(sp.r - 4, 0); ctx.stroke();
    ctx.restore();
    ctx.fillStyle = '#e8ecf7';
    ctx.beginPath(); ctx.arc(sp.x, sp.y, 3.5, 0, Math.PI * 2); ctx.fill();
    text(ctx, 'SPIN', sp.x, sp.y + sp.r + 13, 10, PALETTE.dim, 'center');
  }

  // Saucer (multiball lock).
  ctx.fillStyle = '#2a1a5e';
  ctx.beginPath(); ctx.arc(table.saucer.x, table.saucer.y, table.saucer.r, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = PALETTE.neonPink; ctx.lineWidth = 2; ctx.stroke();
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = i < table.saucer.locks ? PALETTE.neonPink : '#3b2a7a';
    ctx.beginPath(); ctx.arc(table.saucer.x - 14 + i * 14, table.saucer.y + 26, 4, 0, Math.PI * 2); ctx.fill();
  }
  text(ctx, 'LOCK', table.saucer.x, table.saucer.y + 5, 11, PALETTE.neonPink, 'center');

  // Bumpers.
  for (const b of table.bumpers) {
    const pulse = 1 + b.flash * 0.25;
    const g = ctx.createRadialGradient(b.x, b.y, 2, b.x, b.y, b.r * pulse);
    g.addColorStop(0, '#ffffff');
    g.addColorStop(0.4, PALETTE.neonCyan);
    g.addColorStop(1, '#0e7490');
    ctx.fillStyle = g;
    ctx.shadowColor = PALETTE.neonCyan; ctx.shadowBlur = 12 + b.flash * 22;
    ctx.beginPath(); ctx.arc(b.x, b.y, b.r * pulse, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
    // Shockwave ring while the hit flash is fresh.
    if (b.flash > 0.25) {
      ctx.strokeStyle = `rgba(34,211,238,${(b.flash - 0.25) * 0.8})`;
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(b.x, b.y, b.r + (1 - b.flash) * 22, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.fillStyle = '#062b36';
    ctx.beginPath(); ctx.arc(b.x, b.y, b.r * 0.45, 0, Math.PI * 2); ctx.fill();
  }

  // Arcade Heart — the focal point: soft glow, pulsing rings, charge pips.
  {
    const hx = table.heart.x, hy = table.heart.y;
    const glow = ctx.createRadialGradient(hx, hy, 4, hx, hy, 110);
    glow.addColorStop(0, 'rgba(255,79,216,0.28)');
    glow.addColorStop(0.55, 'rgba(255,79,216,0.10)');
    glow.addColorStop(1, 'rgba(255,79,216,0)');
    ctx.fillStyle = glow;
    ctx.beginPath(); ctx.arc(hx, hy, 110, 0, Math.PI * 2); ctx.fill();
    // Two expanding pulse rings.
    for (let k = 0; k < 2; k++) {
      const ph = ((game.time * 0.55 + k * 0.5) % 1);
      ctx.strokeStyle = `rgba(255,79,216,${0.35 * (1 - ph)})`;
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(hx, hy, 44 + ph * 30, 0, Math.PI * 2); ctx.stroke();
    }
    // Charge pips: mission 1 progress (or total heart hits, capped at 5).
    const m1 = game.ms.index === 0 ? game.ms.count.heart : Math.min(5, game.totalHeartHits);
    for (let i = 0; i < 5; i++) {
      const a = -Math.PI / 2 + (i / 5) * Math.PI * 2;
      const px = hx + Math.cos(a) * 56, py = hy + Math.sin(a) * 56;
      ctx.fillStyle = i < m1 ? PALETTE.neonPink : '#3b2a7a';
      ctx.shadowColor = i < m1 ? PALETTE.neonPink : 'transparent';
      ctx.shadowBlur = i < m1 ? 8 : 0;
      ctx.beginPath(); ctx.arc(px, py, 4, 0, Math.PI * 2); ctx.fill();
    }
    ctx.shadowBlur = 0;
  }
  const hp = 1 + table.heart.flash * 0.3 + Math.sin(game.time * 3) * 0.05;
  ctx.save();
  ctx.translate(table.heart.x, table.heart.y); ctx.scale(hp, hp);
  const hg = ctx.createRadialGradient(0, -6, 2, 0, 0, 40);
  hg.addColorStop(0, '#ff8fb0'); hg.addColorStop(0.5, PALETTE.neonPink); hg.addColorStop(1, '#a31368');
  ctx.fillStyle = hg;
  ctx.shadowColor = PALETTE.neonPink; ctx.shadowBlur = 16 + table.heart.flash * 30;
  heartPath(ctx, 0, 0, 22); ctx.fill();
  ctx.restore();
  ctx.shadowBlur = 0;
  text(ctx, '♥ HEART', table.heart.x, table.heart.y + 52, 12, PALETTE.neonPink, 'center');

  // Jackpot target.
  const jt = table.jackpotTarget;
  const armed = game.ms.jackpotArmed;
  ctx.fillStyle = armed ? PALETTE.neonAmber : '#3a2c12';
  ctx.shadowColor = armed ? PALETTE.neonAmber : 'transparent'; ctx.shadowBlur = armed ? 18 : 0;
  ctx.beginPath(); ctx.arc(jt.x, jt.y, jt.r + (armed ? Math.sin(game.time * 6) * 2 : 0), 0, Math.PI * 2); ctx.fill();
  ctx.shadowBlur = 0;
  text(ctx, '★', jt.x, jt.y + 5, 14, armed ? '#3a2503' : PALETTE.dim, 'center');
  text(ctx, armed ? 'JACKPOT!' : 'JACKPOT', jt.x, jt.y + 34, 11, armed ? PALETTE.neonAmber : PALETTE.dim, 'center');

  // Drop targets A-R-C (a hit target slides down as it falls).
  for (const t of table.targets) {
    const dy = t.drop * 10;
    ctx.save();
    ctx.translate(t.x, t.y + dy);
    ctx.rotate(t.drop * 0.12);
    ctx.fillStyle = t.down ? '#241a4d' : PALETTE.neonGreen;
    ctx.shadowColor = t.down ? 'transparent' : PALETTE.neonGreen; ctx.shadowBlur = t.down ? 0 : 10;
    rr(ctx, -13, -13, 26, 26, 6); ctx.fill();
    ctx.shadowBlur = 0;
    text(ctx, t.label, 0, 5, 13, t.down ? '#5a4d8f' : '#062b16', 'center');
    ctx.restore();
  }

  // Slingshots (flash-fill on kick).
  {
    const slingPath = (pts) => {
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]); ctx.lineTo(pts[1][0], pts[1][1]); ctx.lineTo(pts[2][0], pts[2][1]);
      ctx.closePath();
    };
    ctx.strokeStyle = PALETTE.neonCyan; ctx.lineWidth = 3;
    const fl = table.slingFlashL, fr = table.slingFlashR;
    if (fl > 0) { slingPath([[300, 545], [362, 575], [300, 605]]); ctx.fillStyle = `rgba(34,211,238,${fl * 0.45})`; ctx.fill(); }
    slingPath([[300, 545], [362, 575], [300, 605]]); ctx.stroke();
    if (fr > 0) { slingPath([[540, 545], [478, 575], [540, 605]]); ctx.fillStyle = `rgba(34,211,238,${fr * 0.45})`; ctx.fill(); }
    slingPath([[540, 545], [478, 575], [540, 605]]); ctx.stroke();
  }

  // Flippers.
  drawFlipper(ctx, table.flipperL, '#ffb020');
  drawFlipper(ctx, table.flipperR, '#ffb020');

  // Balls.
  for (const b of game.balls) drawBall(ctx, b);

  // Particles.
  game.particles.draw(ctx);
  ctx.restore();

  drawPanel(ctx, game);
  if (game.banner) drawBanner(ctx, game);
  if (game.state === 'title') drawTitle(ctx, game);
  if (game.state === 'paused') drawPause(ctx, game);
  if (game.state === 'bonus') drawBonus(ctx, game);
  if (game.state === 'victory') drawVictory(ctx, game);
  if (game.state === 'gameover') drawGameOver(ctx, game);
}

function drawPanel(ctx, game) {
  const x = 850, w = 410;
  ctx.fillStyle = PALETTE.panel;
  rr(ctx, x, 20, w, 680, 18); ctx.fill();
  ctx.strokeStyle = PALETTE.panelEdge; ctx.lineWidth = 2;
  rr(ctx, x, 20, w, 680, 18); ctx.stroke();

  text(ctx, 'WIN: finish all 8 missions', x + 20, 50, 15, PALETTE.neonGreen);
  text(ctx, 'LOSE: all 3 balls drained', x + 20, 70, 15, PALETTE.neonRed);

  text(ctx, 'SCORE', x + 20, 104, 14, '#c9c2ea');
  text(ctx, String(Math.floor(game.score)).replace(/\B(?=(\d{3})+(?!\d))/g, ','), x + 20, 142, 36, PALETTE.cream);
  text(ctx, `BEST ${String(Math.floor(game.best)).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`, x + 20, 168, 14, PALETTE.neonAmber);

  // Combo.
  const comboW = 150;
  ctx.fillStyle = '#241a4d'; rr(ctx, x + 20, 182, comboW, 16, 8); ctx.fill();
  if (game.combo > 1) {
    ctx.fillStyle = PALETTE.neonPink;
    rr(ctx, x + 20, 182, comboW * Math.min(1, game.comboTimer / 3.5), 16, 8); ctx.fill();
  }
  text(ctx, `COMBO x${game.combo}`, x + 184, 196, 16, game.combo > 1 ? PALETTE.neonPink : '#c9c2ea');
  if (game.doubleUntil > game.time) text(ctx, 'DOUBLE SCORE!', x + 20, 220, 14, PALETTE.neonAmber);

  // Mission card.
  const m = currentMission(game.ms);
  const prog = missionProgress(game.ms);
  ctx.fillStyle = '#241a4d'; rr(ctx, x + 20, 230, 370, 122, 12); ctx.fill();
  if (m) {
    text(ctx, `MISSION ${m.id}/8 — ${m.name}`, x + 34, 258, 16, PALETTE.neonCyan);
    wrapText(ctx, m.desc, x + 34, 284, 342, 15, PALETTE.cream);
    ctx.fillStyle = '#12082b'; rr(ctx, x + 34, 322, 342, 12, 6); ctx.fill();
    if (prog.frac > 0.02) {
      ctx.fillStyle = PALETTE.neonCyan; rr(ctx, x + 34, 322, 342 * Math.min(1, prog.frac), 12, 6); ctx.fill();
    }
    text(ctx, prog.text, x + 34, 348, 13, '#c9c2ea');
  } else {
    text(ctx, 'ALL MISSIONS COMPLETE!', x + 34, 300, 18, PALETTE.neonGreen);
  }

  // Arcade Heart charge (total heart hits this run).
  const hearts = game.totalHeartHits || 0;
  text(ctx, `ARCADE HEART  ♥ ${hearts}`, x + 20, 378, 15, PALETTE.neonPink);

  // Balls.
  text(ctx, 'BALLS', x + 20, 408, 14, '#c9c2ea');
  const totalBalls = game.ballsLeft + game.balls.length;
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = i < totalBalls ? '#e8ecf7' : '#3b2a7a';
    ctx.beginPath(); ctx.arc(x + 90 + i * 30, 402, 10, 0, Math.PI * 2); ctx.fill();
  }
  if (game.ballSave) text(ctx, 'BALL SAVE ARMED', x + 200, 408, 13, PALETTE.neonGreen);
  if (game.ms.multiball) text(ctx, '★ MULTIBALL ★', x + 20, 436, 16, PALETTE.neonPink);
  text(ctx, `LOCKS ${game.table.saucer.locks}/3`, x + 240, 436, 14, '#c9c2ea');

  // Mission list — one column, all 8 missions, 14px, current one highlighted.
  text(ctx, 'MISSIONS', x + 20, 464, 14, '#c9c2ea');
  MISSIONS.forEach((mm, i) => {
    const done = i < game.ms.index;
    const cur = i === game.ms.index && !game.ms.done;
    const y = 486 + i * 20;
    if (cur) {
      ctx.fillStyle = '#2a1a5e';
      rr(ctx, x + 14, y - 15, 382, 19, 9); ctx.fill();
    }
    text(ctx, `${done ? '✓' : cur ? '▶' : '·'} ${mm.id}. ${mm.name}`, x + 20, y, 14, done ? PALETTE.neonGreen : cur ? PALETTE.neonCyan : '#b3abd9', 'left', done ? 'bold' : 'normal');
  });

  // Controls footer.
  ctx.fillStyle = '#12082b'; rr(ctx, x + 20, 644, 370, 46, 10); ctx.fill();
  text(ctx, 'Z / ←  left flipper      / / →  right flipper', x + 34, 663, 14, PALETTE.cream, 'left', 'normal');
  text(ctx, 'SPACE plunge · P pause · M mute · R restart', x + 34, 683, 14, PALETTE.cream, 'left', 'normal');
}

function drawBanner(ctx, game) {
  const b = game.banner;
  ctx.fillStyle = 'rgba(13,6,32,0.82)';
  rr(ctx, 240, 300, 800, 96, 16); ctx.fill();
  ctx.strokeStyle = PALETTE.neonAmber; ctx.lineWidth = 2;
  rr(ctx, 240, 300, 800, 96, 16); ctx.stroke();
  text(ctx, b.text, 640, 342, 34, PALETTE.neonAmber, 'center');
  text(ctx, b.sub, 640, 374, 16, PALETTE.cream, 'center');
}

function overlay(ctx) {
  ctx.fillStyle = 'rgba(10,4,28,0.93)';
  ctx.fillRect(0, 0, W, H);
}

// Title-only dim: much lighter than the shared overlay so the pinball table
// shows through behind the title screen (visual only; victory, bonus, pause
// and game-over keep the shared 0.93 overlay untouched).
function titleOverlay(ctx) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, 'rgba(10,4,28,0.80)');
  g.addColorStop(0.35, 'rgba(10,4,28,0.55)');
  g.addColorStop(0.75, 'rgba(10,4,28,0.55)');
  g.addColorStop(1, 'rgba(10,4,28,0.72)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
}

function button(ctx, rect, label, sub = '', primary = true) {
  ctx.fillStyle = primary ? PALETTE.neonAmber : '#2a1a5e';
  rr(ctx, rect.x, rect.y, rect.w, rect.h, 12); ctx.fill();
  ctx.strokeStyle = primary ? '#ffd97a' : PALETTE.panelEdge; ctx.lineWidth = 2;
  rr(ctx, rect.x, rect.y, rect.w, rect.h, 12); ctx.stroke();
  text(ctx, label, rect.x + rect.w / 2, rect.y + rect.h / 2 + (sub ? 2 : 8), 26, primary ? '#3a2503' : PALETTE.cream, 'center');
  if (sub) text(ctx, sub, rect.x + rect.w / 2, rect.y + rect.h - 12, 13, primary ? '#3a2503' : PALETTE.dim, 'center', 'normal');
}

function drawTitle(ctx, game) {
  titleOverlay(ctx);
  text(ctx, 'SILVERBALL', 640, 112, 84, PALETTE.neonAmber, 'center');
  text(ctx, '— SAVE THE LAST ARCADE —', 640, 146, 20, PALETTE.neonCyan, 'center');
  text(ctx, 'The old arcade is going dark. Wake the Arcade Heart, finish 8 missions,', 640, 180, 18, PALETTE.cream, 'center', 'normal');
  text(ctx, 'and bring the lights back — before your last ball drains.', 640, 202, 18, PALETTE.cream, 'center', 'normal');

  // GOAL / WIN / LOSE.
  const box = (x, label, body, color) => {
    ctx.fillStyle = '#1d0f45'; rr(ctx, x, 230, 280, 94, 12); ctx.fill();
    ctx.strokeStyle = color; ctx.lineWidth = 2; rr(ctx, x, 230, 280, 94, 12); ctx.stroke();
    text(ctx, label, x + 16, 258, 16, color);
    wrapText(ctx, body, x + 16, 284, 248, 15, '#ffffff');
  };
  box(180, 'GOAL', 'Wake the Arcade Heart and complete all 8 missions.', PALETTE.neonCyan);
  box(500, 'WIN', 'Finish mission 8, Final Revival. Grade S/A/B by score.', PALETTE.neonGreen);
  box(820, 'LOSE', 'All 3 balls drain before the arcade wakes.', PALETTE.neonRed);

  // How to play (3 steps).
  text(ctx, 'HOW TO PLAY', 640, 352, 18, PALETTE.cream, 'center');
  const step = (x, n, title, body) => {
    ctx.fillStyle = '#1d0f45'; rr(ctx, x, 366, 280, 96, 12); ctx.fill();
    text(ctx, `${n}. ${title}`, x + 16, 394, 16, PALETTE.neonAmber);
    wrapText(ctx, body, x + 16, 420, 248, 15, '#ffffff');
  };
  step(180, 1, 'PLUNGE', 'Hold SPACE to charge, release to launch the ball up the lane.');
  step(500, 2, 'FLIP', 'Z / ← left flipper, / / → right flipper. Keep the ball alive!');
  step(820, 3, 'COMPLETE', 'Hit bumpers, ramps, targets and the Heart to finish missions.');

  // The 8 missions (two rows of chips — the campaign at a glance).
  text(ctx, 'THE 8 MISSIONS', 640, 490, 15, PALETTE.neonCyan, 'center');
  MISSIONS.forEach((mm, i) => {
    const col = i % 4, row = Math.floor(i / 4);
    const cx = 85 + col * 280, cy = 500 + row * 24;
    ctx.fillStyle = '#241a5e'; rr(ctx, cx, cy, 270, 20, 10); ctx.fill();
    ctx.strokeStyle = PALETTE.panelEdge; ctx.lineWidth = 1; rr(ctx, cx, cy, 270, 20, 10); ctx.stroke();
    text(ctx, `${mm.id}. ${mm.name}`, cx + 135, cy + 14, 13, '#ffffff', 'center', 'normal');
  });

  // Controls + features.
  text(ctx, 'Z / ←  ·  / / →  flip   •   SPACE plunge   •   P pause   •   M mute   •   R restart   •   Mouse: click table sides to flip', 640, 568, 15, PALETTE.cream, 'center', 'normal');
  text(ctx, '8 MISSIONS  •  MULTIBALL  •  COMBOS TO x8  •  JACKPOT  •  BEST SCORE SAVED', 640, 592, 15, PALETTE.neonCyan, 'center');
  text(ctx, `BEST SCORE: ${String(Math.floor(game.best)).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`, 640, 616, 18, PALETTE.neonAmber, 'center');

  game.ui.startBtn = { x: 490, y: 632, w: 300, h: 56 };
  button(ctx, game.ui.startBtn, '▶  START GAME', 'ENTER or CLICK');
}

function drawPause(ctx, game) {
  overlay(ctx);
  text(ctx, 'PAUSED', 640, 280, 64, PALETTE.cream, 'center');
  text(ctx, 'Take a breath. The Heart waits.', 640, 320, 17, PALETTE.dim, 'center', 'normal');
  game.ui.resumeBtn = { x: 490, y: 360, w: 300, h: 56 };
  game.ui.pauseRestartBtn = { x: 490, y: 430, w: 300, h: 56 };
  game.ui.pauseTitleBtn = { x: 490, y: 500, w: 300, h: 56 };
  button(ctx, game.ui.resumeBtn, 'RESUME', 'P or CLICK');
  button(ctx, game.ui.pauseRestartBtn, 'RESTART RUN', 'R', false);
  button(ctx, game.ui.pauseTitleBtn, 'QUIT TO TITLE', '', false);
}

function drawBonus(ctx, game) {
  overlay(ctx);
  text(ctx, 'MISSION COMPLETE!', 600, 150, 40, PALETTE.neonAmber, 'center');
  const m = MISSIONS[game.ms.index - 1];
  if (m) text(ctx, `${m.id}. ${m.name} — bonus +${(1000 * m.id).toLocaleString()} pts`, 640, 190, 18, PALETTE.cream, 'center', 'normal');
  const next = MISSIONS[game.ms.index];
  if (next) text(ctx, `NEXT: MISSION ${next.id}/8 — ${next.name}`, 640, 216, 15, PALETTE.neonCyan, 'center', 'normal');
  text(ctx, 'CHOOSE A BONUS — click or press 1 · 2 · 3', 640, 244, 16, PALETTE.neonCyan, 'center');
  game.ui.bonusRects = [];
  BONUSES.forEach((b, i) => {
    const x = 250 + i * 270;
    const rect = { x, y: 280, w: 240, h: 180 };
    game.ui.bonusRects.push(rect);
    ctx.fillStyle = '#1d0f45'; rr(ctx, rect.x, rect.y, rect.w, rect.h, 14); ctx.fill();
    ctx.strokeStyle = PALETTE.neonCyan; ctx.lineWidth = 2; rr(ctx, rect.x, rect.y, rect.w, rect.h, 14); ctx.stroke();
    text(ctx, `[ ${i + 1} ]`, rect.x + rect.w / 2, rect.y + 40, 16, PALETTE.dim, 'center');
    text(ctx, b.name, rect.x + rect.w / 2, rect.y + 84, 20, PALETTE.neonAmber, 'center');
    wrapText(ctx, b.desc, rect.x + 20, rect.y + 116, rect.w - 40, 14, PALETTE.cream);
  });
}

function statGrid(ctx, game, y0) {
  const stats = [
    ['MISSIONS', `${game.ms.done ? 8 : game.ms.index}/8`],
    ['BEST COMBO', `x${game.ms.bestCombo}`],
    ['ACCURACY', `${game.accuracy()}%`],
    ['BALLS LEFT', `${game.ballsLeft + game.balls.length}`],
    ['TIME', game.fmtTime(game.runTime)],
    ['BALLS DRAINED', `${game.drained}`],
  ];
  stats.forEach((s, i) => {
    const x = 340 + (i % 3) * 220;
    const y = y0 + Math.floor(i / 3) * 64;
    ctx.fillStyle = '#1d0f45'; rr(ctx, x, y, 200, 52, 10); ctx.fill();
    text(ctx, s[1], x + 100, y + 26, 24, PALETTE.cream, 'center');
    text(ctx, s[0], x + 100, y + 44, 11, PALETTE.dim, 'center');
  });
}

function drawVictory(ctx, game) {
  overlay(ctx);
  text(ctx, 'THE ARCADE LIVES AGAIN!', 600, 130, 44, PALETTE.neonAmber, 'center');
  text(ctx, 'The Heart is awake. Every light in the arcade is back on.', 640, 168, 17, PALETTE.cream, 'center', 'normal');
  // Grade circle.
  ctx.fillStyle = '#1d0f45';
  ctx.beginPath(); ctx.arc(640, 260, 62, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = PALETTE.neonAmber; ctx.lineWidth = 4; ctx.stroke();
  text(ctx, game.grade, 640, 282, 64, PALETTE.neonAmber, 'center');
  text(ctx, game.gradeTitle, 640, 348, 18, PALETTE.neonCyan, 'center');
  text(ctx, 'FINAL SCORE', 640, 396, 14, PALETTE.dim, 'center');
  text(ctx, String(Math.floor(game.score)).replace(/\B(?=(\d{3})+(?!\d))/g, ','), 640, 440, 48, PALETTE.cream, 'center');
  if (game.score >= game.best && game.score > 0) text(ctx, '★ NEW BEST SCORE ★', 640, 472, 16, PALETTE.neonGreen, 'center');
  statGrid(ctx, game, 500);
  game.ui.againBtn = { x: 440, y: 640, w: 200, h: 56 };
  game.ui.victoryTitleBtn = { x: 660, y: 640, w: 200, h: 56 };
  button(ctx, game.ui.againBtn, 'PLAY AGAIN', 'R');
  button(ctx, game.ui.victoryTitleBtn, 'TITLE', 'T', false);
}

function drawGameOver(ctx, game) {
  overlay(ctx);
  text(ctx, 'THE ARCADE GOES DARK', 580, 150, 40, PALETTE.neonRed, 'center');
  text(ctx, 'The last ball drained. The Heart fades… but the arcade remembers you.', 640, 192, 17, PALETTE.cream, 'center', 'normal');
  const m = currentMission(game.ms);
  if (m) text(ctx, `You reached mission ${m.id}/8 — ${m.name}`, 640, 226, 18, PALETTE.neonCyan, 'center');
  text(ctx, 'FINAL SCORE', 640, 300, 14, PALETTE.dim, 'center');
  text(ctx, String(Math.floor(game.score)).replace(/\B(?=(\d{3})+(?!\d))/g, ','), 640, 346, 48, PALETTE.cream, 'center');
  if (game.score >= game.best && game.score > 0) text(ctx, '★ NEW BEST SCORE ★', 640, 378, 16, PALETTE.neonGreen, 'center');
  text(ctx, `BEST ${String(Math.floor(game.best)).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`, 640, 410, 16, PALETTE.neonAmber, 'center');
  statGrid(ctx, game, 450);
  game.ui.retryBtn = { x: 440, y: 600, w: 200, h: 56 };
  game.ui.overTitleBtn = { x: 660, y: 600, w: 200, h: 56 };
  button(ctx, game.ui.retryBtn, 'RETRY', 'R');
  button(ctx, game.ui.overTitleBtn, 'TITLE', 'T', false);
}
