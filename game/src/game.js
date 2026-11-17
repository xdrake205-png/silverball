// game.js — SILVERBALL state machine, loop, scoring, missions, win/lose.
// Owns the rules; physics.js owns collision, render.js owns drawing.
import { W, H, PHYS, SCORE, COMBO, BALLS_PER_GAME, GRADES, PALETTE } from './config.js';
import { buildTable } from './table.js';
import { makeBall, stepBalls, updateFlipper } from './physics.js';
import { createMissionState, currentMission, applyMissionEvent, advanceMission, resetPerBall, BONUSES } from './missions.js';
import { Particles, Juice } from './particles.js';
import { AudioSys } from './audio.js';
import { Input } from './input.js';
import { render } from './render.js';
import { makeRng } from './rng.js';

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.rng = makeRng(1337);
    this.stars = [];
    for (let i = 0; i < 90; i++) this.stars.push({ x: this.rng.range(24, 816), y: this.rng.range(14, 700), a: this.rng.range(0.15, 0.6) });
    // Decorative neon dots that fill the empty playfield (visual only, no
    // physics): a grid, kept clear of every feature and of the ramp arc.
    this.decorDots = [];
    {
      const keep = [
        [300, 220, 62], [420, 170, 62], [540, 220, 62], [420, 300, 72], [420, 430, 52],
        [700, 300, 50], [700, 350, 50], [700, 400, 50], [280, 100, 48], [420, 84, 48],
        [560, 100, 48], [660, 150, 56], [120, 300, 64], [200, 440, 56],
        [331, 625, 92], [508, 625, 92], [420, 48, 120],
      ];
      const arc = [];
      for (let t = 0; t <= 1.001; t += 0.1) {
        const u = 1 - t;
        arc.push([u * u * 120 + 2 * u * t * 80 + t * t * 420, u * u * 300 + 2 * u * t * 110 + t * t * 80]);
      }
      for (let gx = 70; gx <= 730; gx += 46) {
        for (let gy = 110; gy <= 650; gy += 46) {
          let ok = true;
          for (const [fx, fy, fr] of keep) {
            if (Math.hypot(gx - fx, gy - fy) < fr) { ok = false; break; }
          }
          if (ok) for (const [ax, ay] of arc) {
            if (Math.hypot(gx - ax, gy - ay) < 30) { ok = false; break; }
          }
          if (ok) this.decorDots.push({ x: gx, y: gy, a: this.rng.range(0.1, 0.28) });
        }
      }
    }
    this.audio = new AudioSys();
    this.particles = new Particles();
    this.juice = new Juice();
    this.table = buildTable();
    this.ui = {};
    this.time = 0;
    this.best = Number(localStorage.getItem('silverball_best') || 0);
    this.frozen = false;
    this.shotMode = false;
    this.input = new Input(canvas, {
      audioEnsure: () => this.audio.ensure(),
      onFlipper: () => { this.flips++; this.audio.flipper(); },
      onAction: (k) => this.onAction(k),
      onPlungeKey: (down) => { this.spacePlunge = down; },
      onPause: () => this.togglePause(),
      onMute: () => { this.audio.setMuted(!this.audio.muted); },
      onRestart: () => { if (this.state !== 'title') this.startGame(); },
      onTitle: () => { if (['victory', 'gameover', 'paused'].includes(this.state)) this.reset(); },
      onBonus: (n) => this.pickBonus(n - 1),
      onUIClick: (x, y) => this.onUIClick(x, y),
      onPointerUp: () => { this.mousePlunge = false; },
    });
    this.reset();
    this.last = performance.now();
    // Test/debug hooks for Playwright (also the debug HUD values, prototype-fast).
    this.test = {
      start: () => this.startGame(),
      launch: (p = 1) => { if (this.state === 'serving') { this.plungePower = p; this.plunge(p); } },
      flipL: () => { this.input.leftHeld = true; setTimeout(() => { this.input.leftHeld = false; }, 120); },
      flipR: () => { this.input.rightHeld = true; setTimeout(() => { this.input.rightHeld = false; }, 120); },
      completeMission: () => this.completeMission(),
      win: () => { this.ms.index = 7; this.completeMission(); },
      drain: () => { this.balls.forEach((b) => { b.gone = true; }); this.checkBalls(); },
      setScore: (n) => { this.score = n; },
      snapshot: () => ({
        state: this.state, score: Math.floor(this.score), best: this.best,
        mission: this.ms.index + 1, missionDone: this.ms.done,
        balls: this.balls.length, ballsLeft: this.ballsLeft,
        combo: this.combo, multiball: this.ms.multiball, locks: this.table.saucer.locks,
        ball: this.balls[0] ? { x: Math.round(this.balls[0].x), y: Math.round(this.balls[0].y), vx: Math.round(this.balls[0].vx), vy: Math.round(this.balls[0].vy) } : null,
      }),
    };
  }

  reset() {
    this.state = 'title';
    this.score = 0; this.streak = 0; this.combo = 1; this.comboTimer = 0;
    this.ballsLeft = BALLS_PER_GAME; this.balls = [];
    this.ms = createMissionState();
    this.doubleUntil = 0; this.ballSave = false;
    this.plungePower = 0; this.plunging = false; this.spacePlunge = false; this.mousePlunge = false;
    this.flips = 0; this.hits = 0; this.drained = 0; this.runTime = 0;
    this.totalHeartHits = 0;
    this.banner = null; this.bannerUntil = 0;
    this.grade = 'B'; this.gradeTitle = '';
    this.table = buildTable();
    this.particles = new Particles();
  }

  startGame() {
    this.audio.ensure();
    this.reset();
    this.serveBall();
  }

  start() {
    const loop = () => {
      requestAnimationFrame(loop);
      const now = performance.now();
      let dt = Math.min(0.033, (now - this.last) / 1000);
      this.last = now;
      const realDt = dt;
      this.juice.update(realDt);
      if (this.juice.isStopped()) dt *= 0.05;
      if (!this.frozen) this.update(dt, realDt);
      this.particles.update(dt);
      render(this.ctx, this);
    };
    requestAnimationFrame(loop);
  }

  update(dt, realDt) {
    this.time += realDt;
    const decay = (o) => { if (o.flash > 0) o.flash = Math.max(0, o.flash - dt * 3); };
    this.table.bumpers.forEach(decay);
    this.table.targets.forEach((t) => { decay(t); if (t.drop > 0) t.drop = Math.max(0, t.drop - dt * 2.2); });
    decay(this.table.heart); decay(this.table.jackpotTarget);
    // Visual-only animation state: sling flash, ramp glow, spinner spin.
    const t2 = this.table;
    if (t2.slingFlashL > 0) t2.slingFlashL = Math.max(0, t2.slingFlashL - dt * 3);
    if (t2.slingFlashR > 0) t2.slingFlashR = Math.max(0, t2.slingFlashR - dt * 3);
    if (t2.rampGlow > 0) t2.rampGlow = Math.max(0, t2.rampGlow - dt * 1.1);
    t2.spinner.angle += t2.spinner.spin * dt;
    t2.spinner.spin = Math.max(0, t2.spinner.spin - 2.5 * dt);
    if (this.banner && performance.now() > this.bannerUntil) this.banner = null;
    if (this.state !== 'playing' && this.state !== 'serving') return;
    if (this.state === 'playing') this.runTime += realDt;
    if (this.comboTimer > 0) {
      this.comboTimer -= dt;
      if (this.comboTimer <= 0) { this.streak = 0; this.combo = 1; }
    }
    updateFlipper(this.table.flipperL, this.input.leftHeld, dt);
    updateFlipper(this.table.flipperR, this.input.rightHeld, dt);
    if (this.state === 'serving') {
      if (this.spacePlunge || this.mousePlunge) {
        this.plunging = true;
        this.plungePower = Math.min(1, this.plungePower + dt * 1.4);
      } else if (this.plunging) {
        this.plunge(this.plungePower);
        this.plunging = false; this.plungePower = 0;
      }
    }
    const sub = PHYS.substeps;
    const hooks = this.hooks();
    for (let s = 0; s < sub; s++) stepBalls(this.balls, this.table, dt / sub, this.time, hooks);
    // Ball fell back down the lane: back to the plunger.
    if (this.state === 'playing' && this.balls.length === 1) {
      const b = this.balls[0];
      if (b.x > 765 && b.y > 620 && Math.hypot(b.vx, b.vy) < 90 && b.rampT < 0) {
        b.x = 785; b.y = 672; b.vx = 0; b.vy = 0; b.launching = true;
        this.state = 'serving';
      }
    }
    this.checkBalls();
  }

  serveBall() {
    if (this.ballsLeft <= 0) return this.gameOver();
    this.ballsLeft--;
    this.placePlungerBall();
  }

  placePlungerBall() {
    resetPerBall(this.ms);
    this.table.targets.forEach((t) => { t.down = false; });
    // Rollover lanes + jackpot arming persist across drains within the mission
    // (mission 5 fairness: lighting S-I-L is the hard part, the drain should
    // not erase it). Restore the table's lit state from the mission state.
    this.table.lanes.forEach((l, i) => { l.lit = this.ms.lanesLit[i]; });
    const b = makeBall(785, 672);
    b.launching = true;
    this.balls = [b];
    this.state = 'serving';
  }

  plunge(power) {
    const b = this.balls[0];
    if (!b || this.state !== 'serving') return;
    b.vy = -(PHYS.plungeBase + PHYS.plungeExtra * power);
    b.launching = true;
    this.state = 'playing';
    this.audio.launch();
    setTimeout(() => { if (b) b.launching = false; }, 1400);
  }

  checkBalls() {
    this.balls = this.balls.filter((b) => !b.gone);
    if (this.balls.length === 0 && (this.state === 'playing' || this.state === 'serving')) {
      if (this.ballSave) {
        this.ballSave = false;
        this.showBanner('BALL SAVE!', 'The arcade returns your ball.');
        this.placePlungerBall();
        return;
      }
      if (this.ms.multiball) { this.ms.multiball = false; this.table.saucer.locks = 0; }
      if (this.ballsLeft > 0) this.serveBall();
      else this.gameOver();
    } else if (this.ms.multiball && this.balls.length <= 1) {
      this.ms.multiball = false;
      this.table.saucer.locks = 0;
    }
  }

  addPoints(base, x, y) {
    // No points once the run has ended: a hook can still fire in the
    // remaining substeps of the frame that triggered victory, and those
    // points would land after saveBest() ran (score > best on the screen).
    if (this.state === 'victory' || this.state === 'gameover') return 0;
    const mult = this.doubleUntil > this.time ? 2 : 1;
    const pts = base * this.combo * mult;
    this.score += pts;
    this.hits++;
    this.streak++;
    this.comboTimer = COMBO.window;
    this.combo = Math.min(COMBO.max, Math.max(1, this.streak));
    if (x !== undefined) this.particles.text(x, y, `+${pts.toLocaleString()}`, '#fff3d6', 16);
    if (this.ms.multiball && currentMission(this.ms)?.key === 'multiball') {
      if (applyMissionEvent(this.ms, 'multiballScore', pts)) this.completeMission();
    }
    if (applyMissionEvent(this.ms, 'combo', this.combo)) this.completeMission();
    return pts;
  }

  completeMission() {
    const m = currentMission(this.ms);
    if (!m || this.state === 'bonus' || this.state === 'victory') return;
    const bonus = SCORE.missionBonus * m.id;
    this.score += bonus;
    this.audio.mission();
    this.particles.ring(420, 300, 40, PALETTE.neonAmber);
    this.juice.add(0.4);
    if (m.id === 8) { advanceMission(this.ms); this.victory(); return; }
    this.state = 'bonus';
  }

  pickBonus(i) {
    if (this.state !== 'bonus') return;
    const b = BONUSES[i];
    if (!b) return;
    this.audio.click();
    if (b.id === 'ball') this.ballsLeft = Math.min(5, this.ballsLeft + 1);
    if (b.id === 'double') this.doubleUntil = this.time + 30;
    if (b.id === 'save') this.ballSave = true;
    advanceMission(this.ms);
    // Keep the table in sync with the new mission: lanes unlit, targets up.
    // (Without this, lanes lit in an earlier mission stay lit on the table
    // while the mission state was reset, and can never light again.)
    this.table.lanes.forEach((l, i) => { l.lit = this.ms.lanesLit[i]; });
    this.table.targets.forEach((t) => { t.down = false; });
    if (!this.balls.length) this.serveBall();
    else this.state = 'playing';
  }

  startMultiball() {
    this.ms.multiball = true;
    this.ms.multiballScore = 0;
    this.audio.multiball();
    this.juice.hitStop(80);
    this.juice.add(0.6);
    this.showBanner('★ MULTIBALL! ★', 'Three balls in play — score 5,000 to finish the mission');
    const mk = (x, y, vx, vy) => { const b = makeBall(x, y); b.vx = vx; b.vy = vy; return b; };
    this.balls = [mk(400, 140, -120, 150), mk(520, 200, 140, 250), mk(660, 170, -60, 300)];
    this.state = 'playing';
  }

  victory() {
    this.state = 'victory';
    const g = GRADES.find((gg) => this.score >= gg.min) || GRADES[GRADES.length - 1];
    this.grade = g.grade; this.gradeTitle = g.title;
    this.saveBest();
    this.audio.victory();
  }

  gameOver() {
    this.state = 'gameover';
    this.saveBest();
    this.audio.defeat();
  }

  saveBest() {
    if (this.score > this.best) {
      this.best = Math.floor(this.score);
      localStorage.setItem('silverball_best', String(this.best));
    }
  }

  accuracy() { return this.flips > 0 ? Math.min(100, Math.round((this.hits / this.flips) * 100)) : 100; }
  fmtTime(s) { const m = Math.floor(s / 60), ss = Math.floor(s % 60); return `${m}:${String(ss).padStart(2, '0')}`; }
  showBanner(text, sub) { this.banner = { text, sub }; this.bannerUntil = performance.now() + 2200; }

  togglePause() {
    if (this.state === 'playing' || this.state === 'serving') { this.prevState = this.state; this.state = 'paused'; }
    else if (this.state === 'paused') { this.state = this.prevState || 'playing'; }
  }

  onAction(k) {
    if (this.state === 'title') { this.audio.ensure(); this.startGame(); }
    else if ((this.state === 'victory' || this.state === 'gameover') && k === 'Enter') this.startGame();
    else if (this.state === 'paused' && k === 'Enter') this.togglePause();
  }

  onUIClick(x, y) {
    const hit = (r) => r && x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
    const s = this.state;
    if (s === 'title' && hit(this.ui.startBtn)) { this.audio.ensure(); this.audio.click(); this.startGame(); return; }
    if (s === 'paused') {
      if (hit(this.ui.resumeBtn)) this.togglePause();
      else if (hit(this.ui.pauseRestartBtn)) this.startGame();
      else if (hit(this.ui.pauseTitleBtn)) this.reset();
      return;
    }
    if (s === 'bonus') {
      const i = (this.ui.bonusRects || []).findIndex((r) => hit(r));
      if (i >= 0) this.pickBonus(i);
      return;
    }
    if (s === 'victory') {
      if (hit(this.ui.againBtn)) this.startGame();
      else if (hit(this.ui.victoryTitleBtn)) this.reset();
      return;
    }
    if (s === 'gameover') {
      if (hit(this.ui.retryBtn)) this.startGame();
      else if (hit(this.ui.overTitleBtn)) this.reset();
      return;
    }
    if (s === 'serving' && x > 755) this.mousePlunge = true;
  }

  hooks() {
    return {
      onBumper: (i, ball) => {
        this.audio.bumper();
        this.particles.burst(ball.x, ball.y, 10, '#22d3ee', 240);
        this.particles.ring(ball.x, ball.y, 8, '#22d3ee');
        this.juice.add(0.12);
        this.addPoints(SCORE.bumper, ball.x, ball.y - 20);
        if (applyMissionEvent(this.ms, 'bumper')) this.completeMission();
      },
      onSpinner: (ball) => {
        this.audio.spinner();
        this.particles.burst(ball.x, ball.y, 3, '#22d3ee', 140);
        this.addPoints(SCORE.spinner, ball.x, ball.y - 18);
      },
      onHeart: (ball) => {
        this.audio.heart();
        this.totalHeartHits++;
        this.particles.ring(ball.x, ball.y, 16, '#ff4fd8');
        this.juice.add(0.25);
        this.addPoints(SCORE.heart, ball.x, ball.y - 30);
        if (applyMissionEvent(this.ms, 'heart')) this.completeMission();
      },
      onTarget: (i, ball) => {
        this.audio.target();
        this.particles.burst(ball.x, ball.y, 8, '#3dff8e', 200);
        this.addPoints(SCORE.target, ball.x, ball.y - 20);
        const down = this.table.targets.filter((t) => t.down).length;
        if (applyMissionEvent(this.ms, 'targets', down)) this.completeMission();
        if (down === 3 && applyMissionEvent(this.ms, 'targets', 'targetsDone')) this.completeMission();
      },
      onLane: (i, ball) => {
        this.audio.lane();
        this.ms.lanesLit[i] = true;
        this.addPoints(SCORE.lane, ball.x, ball.y - 20);
        if (this.ms.lanesLit.every(Boolean) && !this.ms.jackpotArmed) {
          this.ms.jackpotArmed = true;
          this.showBanner('JACKPOT ARMED!', 'Hit the gold star target for 5,000 pts');
          this.audio.jackpot();
        }
      },
      onJackpot: (ball) => {
        if (this.ms.jackpotArmed) {
          this.ms.jackpotArmed = false;
          this.table.lanes.forEach((l) => { l.lit = false; });
          this.ms.lanesLit = [false, false, false];
          this.audio.jackpot();
          this.juice.hitStop(60); this.juice.add(0.7);
          this.particles.ring(ball.x, ball.y, 36, '#ffb020');
          this.addPoints(SCORE.jackpot, ball.x, ball.y - 30);
          if (applyMissionEvent(this.ms, 'jackpot')) this.completeMission();
        } else {
          this.audio.target();
          this.addPoints(150, ball.x, ball.y - 20);
        }
      },
      onSling: (side, ball) => {
        this.audio.sling();
        this.particles.burst(ball.x, ball.y, 4, '#22d3ee', 160);
        this.addPoints(SCORE.sling, ball.x, ball.y - 20);
      },
      onRampStart: () => { this.audio.ramp(); this.table.rampGlow = 1; },
      onRampEnd: (ball) => {
        this.particles.burst(ball.x, ball.y, 12, '#ffb020', 220);
        this.addPoints(SCORE.ramp, ball.x, ball.y - 20);
        if (applyMissionEvent(this.ms, 'ramp')) this.completeMission();
      },
      onSaucer: (ball) => {
        if (this.ms.multiball) return null;
        if (this.table.saucer.locks >= 3) return null;
        this.table.saucer.locks++;
        this.audio.lock();
        this.particles.ring(this.table.saucer.x, this.table.saucer.y, 12, '#ff4fd8');
        ball.gone = true;
        if (this.table.saucer.locks >= 3) this.startMultiball();
        return 'capture';
      },
      onDrain: (ball) => {
        ball.gone = true;
        this.drained++;
        this.streak = 0; this.combo = 1; this.comboTimer = 0;
        this.audio.drain();
        this.juice.add(0.4);
        this.particles.burst(ball.x, 690, 16, '#ff5470', 200);
      },
    };
  }
}
