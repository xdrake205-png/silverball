// particles.js — pooled particles, floating score texts, trauma shake, hit-stop.
// Pooled (no per-frame allocation) and visual-only: never moves bodies (game-feel).
export class Particles {
  constructor(max = 240) {
    this.pool = [];
    for (let i = 0; i < max; i++) this.pool.push({ alive: false, x: 0, y: 0, vx: 0, vy: 0, life: 0, max: 1, size: 2, color: '#fff', grav: 0 });
    this.texts = [];
    for (let i = 0; i < 24; i++) this.texts.push({ alive: false, x: 0, y: 0, life: 0, max: 1, str: '', color: '#fff', size: 16 });
  }

  burst(x, y, n, color, speed = 260, grav = 500) {
    let made = 0;
    for (const p of this.pool) {
      if (made >= n) break;
      if (p.alive) continue;
      const a = Math.random() * Math.PI * 2;
      const s = speed * (0.4 + Math.random() * 0.8);
      p.alive = true; p.x = x; p.y = y;
      p.vx = Math.cos(a) * s; p.vy = Math.sin(a) * s;
      p.life = p.max = 0.4 + Math.random() * 0.5;
      p.size = 2 + Math.random() * 3; p.color = color; p.grav = grav;
      made++;
    }
  }

  ring(x, y, n, color) {
    let made = 0;
    for (const p of this.pool) {
      if (made >= n) break;
      if (p.alive) continue;
      const a = (made / n) * Math.PI * 2;
      p.alive = true; p.x = x; p.y = y;
      p.vx = Math.cos(a) * 300; p.vy = Math.sin(a) * 300;
      p.life = p.max = 0.5; p.size = 3; p.color = color; p.grav = 0;
      made++;
    }
  }

  text(x, y, str, color = '#fff3d6', size = 20) {
    // Keep floating texts from stacking into one smear: if another live text
    // is near this spot, push the new one up; if the pool is full, recycle
    // the oldest (lowest remaining life) instead of dropping the new one.
    let ty = y;
    for (let k = 0; k < 3; k++) {
      let clash = false;
      for (const t of this.texts) {
        if (t.alive && Math.abs(t.x - x) < 34 && Math.abs(t.y - ty) < 20) { clash = true; break; }
      }
      if (!clash) break;
      ty -= 20;
    }
    let slot = null, oldest = null;
    for (const t of this.texts) {
      if (!t.alive) { slot = t; break; }
      if (!oldest || t.life < oldest.life) oldest = t;
    }
    const t = slot || oldest;
    if (!t) return;
    t.alive = true; t.x = x; t.y = ty; t.str = str; t.color = color; t.size = size;
    t.life = t.max = 0.8;
  }

  update(dt) {
    for (const p of this.pool) {
      if (!p.alive) continue;
      p.life -= dt;
      if (p.life <= 0) { p.alive = false; continue; }
      p.vy += p.grav * dt; p.x += p.vx * dt; p.y += p.vy * dt;
      p.vx *= (1 - 1.6 * dt); p.vy *= (1 - 0.4 * dt);
    }
    for (const t of this.texts) {
      if (!t.alive) continue;
      t.life -= dt; t.y -= 56 * dt;
      if (t.life <= 0) t.alive = false;
    }
  }

  draw(ctx) {
    for (const p of this.pool) {
      if (!p.alive) continue;
      ctx.globalAlpha = Math.max(0, p.life / p.max);
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
    }
    ctx.globalAlpha = 1;
    for (const t of this.texts) {
      if (!t.alive) continue;
      ctx.globalAlpha = Math.max(0, t.life / t.max);
      ctx.font = `bold ${t.size}px system-ui, sans-serif`;
      ctx.textAlign = 'center';
      // Dark outline keeps the text readable over bright table art and stops
      // overlapping texts from smearing into one blob.
      ctx.lineWidth = 4;
      ctx.strokeStyle = 'rgba(13,6,32,0.9)';
      ctx.strokeText(t.str, t.x, t.y);
      ctx.fillStyle = t.color;
      ctx.fillText(t.str, t.x, t.y);
    }
    ctx.globalAlpha = 1;
  }
}

// Trauma-based screen shake (game-feel): shake = trauma^2, summed sines, real-time decay.
export class Juice {
  constructor() {
    this.trauma = 0;
    this.t = 0;
    this.stopUntil = 0; // performance.now() ms; hit-stop window
    this.stopId = 0;
  }

  add(amount) { this.trauma = Math.min(1, this.trauma + amount); }

  // Hit-stop: freeze simulation briefly; newest call owns the restore (game-feel).
  hitStop(ms) {
    const id = ++this.stopId;
    this.stopUntil = performance.now() + ms;
    setTimeout(() => { if (id === this.stopId) this.stopUntil = 0; }, ms + 5);
  }

  isStopped() { return performance.now() < this.stopUntil; }

  update(realDt) {
    this.trauma = Math.max(0, this.trauma - 1.4 * realDt);
    this.t += realDt * 30;
  }

  offset() {
    const s = this.trauma * this.trauma;
    if (s <= 0.001) return { x: 0, y: 0 };
    return {
      x: 12 * s * Math.sin(this.t * 1.7),
      y: 8 * s * Math.sin(this.t * 2.3),
    };
  }
}
