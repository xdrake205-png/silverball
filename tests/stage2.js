// Stage 2 verification: drive all 8 missions to completion by placing the ball
// with the test hooks and letting the real physics + rules run. No completeMission()
// shortcuts except the final win check. Returns a JSON summary.
async (page) => {
  const errors = [];
  page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const out = { missions: [], errors: [] };

  const state = () => page.evaluate(() => {
    const g = window.__game;
    return {
      state: g.state, mission: g.ms.index + 1, done: g.ms.done,
      count: g.ms.count, perBall: g.ms.perBall,
      lanes: g.ms.lanesLit, armed: g.ms.jackpotArmed,
      multi: g.ms.multiball, multiScore: Math.floor(g.ms.multiballScore),
      locks: g.table.saucer.locks, targets: g.table.targets.map((t) => t.down),
      balls: g.balls.length, ballsLeft: g.ballsLeft, score: Math.floor(g.score),
      bestCombo: g.ms.bestCombo, combo: g.combo,
    };
  });
  // Place the live ball at (x,y) with velocity, in playing state.
  const place = (x, y, vx, vy) => page.evaluate(([x, y, vx, vy]) => {
    const g = window.__game;
    if (!g.balls.length) return 'noball';
    const b = g.balls[0];
    b.x = x; b.y = y; b.vx = vx; b.vy = vy; b.rampT = -1; b.launching = false;
    if (g.state === 'serving') g.state = 'playing';
    return 'ok';
  }, [x, y, vx, vy]);
  // Wait until fn(state) is true or timeout; returns the final state.
  async function waitFor(check, timeoutMs = 20000, stepMs = 250) {
    const t0 = Date.now();
    let s = await state();
    while (Date.now() - t0 < timeoutMs) {
      if (check(s)) return s;
      await sleep(stepMs);
      s = await state();
    }
    return s;
  }
  // Complete the current mission's bonus screen if it appears.
  async function clearBonus() {
    let s = await state();
    if (s.state === 'bonus') {
      await page.keyboard.press('1');
      await sleep(400);
      s = await state();
    }
    return s;
  }

  await page.goto('http://localhost:8080/index.html', { waitUntil: 'load' });
  await sleep(600);
  await page.keyboard.press('Enter');
  await sleep(400);
  await page.keyboard.down('Space'); await sleep(700); await page.keyboard.up('Space');
  await sleep(1500);

  // M1 — WAKE THE HEART: 5 heart hits.
  for (let i = 0; i < 8; i++) {
    let s = await state();
    if (s.mission !== 1) break;
    await place(420, 380, 0, -750);
    await sleep(450);
  }
  out.missions.push({ id: 1, after: await clearBonus() });

  // M2 — BUMPER RUSH: 25 bumper hits.
  for (let i = 0; i < 40; i++) {
    let s = await state();
    if (s.mission !== 2) break;
    await place(300, 280, 0, -650);
    await sleep(350);
  }
  out.missions.push({ id: 2, after: await clearBonus() });

  // M3 — RAMP RUNNER: 3 ramp rides.
  for (let i = 0; i < 8; i++) {
    let s = await state();
    if (s.mission !== 3) break;
    await place(220, 300, -800, 0);
    await sleep(1400);
  }
  out.missions.push({ id: 3, after: await clearBonus() });

  // M4 — COMBO FEVER: reach combo x5 (rapid bumper hits).
  for (let i = 0; i < 20; i++) {
    let s = await state();
    if (s.mission !== 4) break;
    await place(300, 280, 0, -650);
    await sleep(300);
  }
  out.missions.push({ id: 4, after: await clearBonus() });

  // M5 — JACKPOT: light S-I-L, then hit the gold target.
  for (let attempt = 0; attempt < 2; attempt++) {
    await place(280, 55, 0, 320); await sleep(400);
    await place(420, 45, 0, 320); await sleep(400);
    await place(560, 55, 0, 320); await sleep(400);
    let s5 = await state();
    out.jackpotArmed = s5.armed;
    if (s5.armed) break;
  }
  await place(420, 480, 0, -550); await sleep(600);
  out.missions.push({ id: 5, after: await clearBonus() });

  // M6 — TARGET LOCK: knock down A-R-C (approach each target from the right).
  await place(745, 300, -400, 0); await sleep(600);
  await place(745, 350, -400, 0); await sleep(600);
  await place(745, 400, -400, 0); await sleep(700);
  out.missions.push({ id: 6, after: await clearBonus() });

  // M7 — MULTIBALL MAYHEM: lock 3 balls, score 5,000 in multiball.
  for (let i = 0; i < 6; i++) {
    let s = await state();
    if (s.multi) break;
    if (s.state === 'serving') { await page.keyboard.down('Space'); await sleep(500); await page.keyboard.up('Space'); await sleep(800); }
    await place(660, 195, 0, -260);
    await sleep(600);
  }
  let s7 = await state();
  out.multiballStarted = s7.multi;
  out.ballsInMultiball = s7.balls;
  // Score during multiball: heart hits with the combo multiplier.
  for (let i = 0; i < 30; i++) {
    let s = await state();
    if (s.mission !== 7 || !s.multi) break;
    if (!s.balls) break;
    await place(420, 380, 0, -750);
    await sleep(350);
  }
  out.missions.push({ id: 7, after: await clearBonus() });

  // M8 — FINAL REVIVAL: one ball, heart x3, bumpers x10, ramp x1, all targets.
  await page.evaluate(() => { const g = window.__game; g.ms.perBall = { heart: 0, bumper: 0, ramp: 0 }; });
  for (let i = 0; i < 5; i++) { await place(420, 380, 0, -750); await sleep(450); }
  for (let i = 0; i < 14; i++) { await place(300, 280, 0, -650); await sleep(350); }
  await place(220, 300, -800, 0); await sleep(1400);
  // Targets last; a serve mid-way resets them, so retry once if needed.
  for (let attempt = 0; attempt < 2; attempt++) {
    await place(745, 300, -400, 0); await sleep(600);
    await place(745, 350, -400, 0); await sleep(600);
    await place(745, 400, -400, 0); await sleep(800);
    const s = await state();
    if (s.state === 'victory' || s.targets.every(Boolean)) break;
  }
  let s8 = await state();
  out.finalState = s8;
  out.victory = s8.state === 'victory';
  out.errors = errors;
  return JSON.stringify(out, null, 1);
}
