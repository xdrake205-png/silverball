// shots.js — deterministic screenshot scenes (?shot=title|game|bonus|victory&seed=1).
// Fixed seed + frozen simulation so every capture is repeatable.
import { makeBall } from './physics.js';
import { makeRng } from './rng.js';

export function applyShot(game, shot, seed = 1) {
  game.rng = makeRng(seed);
  game.frozen = true; // freeze the simulation; the scene is posed, not played.
  if (shot === 'title') {
    game.state = 'title';
    return;
  }
  if (shot === 'victory') {
    game.startGame();
    game.score = 173420;
    game.best = Math.max(game.best, 173420);
    game.runTime = 367; game.flips = 412; game.hits = 389; game.drained = 2;
    game.ballsLeft = 1; game.ms.bestCombo = 8; game.ms.index = 8; game.ms.done = true;
    game.victory();
    return;
  }
  if (shot === 'bonus') {
    game.startGame();
    game.score = 48210; game.ms.index = 1; game.ms.bestCombo = 5;
    game.state = 'bonus';
    return;
  }
  // Cover (game): lively mid-play, mission 4, combo x5, two balls, lit lanes.
  game.startGame();
  game.score = 48210;
  game.best = Math.max(game.best, 48210);
  game.ms.index = 3; game.ms.bestCombo = 5;
  game.streak = 5; game.combo = 5; game.comboTimer = 3.0;
  game.totalHeartHits = 4;
  game.table.lanes[0].lit = true; game.table.lanes[1].lit = true;
  game.ms.lanesLit = [true, true, false];
  game.table.saucer.locks = 2;
  game.table.heart.flash = 1;
  game.table.bumpers[1].flash = 1;
  game.table.spinner.spin = 8;
  game.table.rampGlow = 0.85;
  game.table.slingFlashL = 0.8;
  const b1 = makeBall(380, 210); b1.vx = 180; b1.vy = -320;
  const b2 = makeBall(560, 420); b2.vx = -240; b2.vy = -180;
  b1.trail = [{ x: 360, y: 260 }, { x: 370, y: 240 }, { x: 380, y: 220 }];
  b2.trail = [{ x: 600, y: 460 }, { x: 580, y: 440 }, { x: 560, y: 420 }];
  game.balls = [b1, b2];
  game.state = 'playing';
  game.particles.burst(420, 170, 20, '#22d3ee', 240);
  game.particles.burst(420, 300, 14, '#ff4fd8', 200);
  game.particles.text(420, 260, '+500', '#fff3d6', 18);
  game.particles.text(560, 390, '+100', '#fff3d6', 16);
}
