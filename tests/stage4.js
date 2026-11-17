// Stage 4 comprehensive test for SILVERBALL (post-polish).
// Covers: boot, viewport, start, flippers, bounce, spinner, pause, mute,
// restart, gameover, multiball, bonus picks, FPS, 0 JS errors, 0 external reqs.
// Missions end-to-end are covered by stage2.js (run separately).
async (page) => {
  const errors = [];
  const external = [];
  page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('request', (r) => { if (!r.url().startsWith('http://localhost:8080')) external.push(r.url()); });
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const out = {};
  const snap = () => page.evaluate(() => window.__game.test.snapshot());
  const state = () => page.evaluate(() => {
    const g = window.__game;
    return {
      state: g.state, mission: g.ms.index + 1, score: Math.floor(g.score),
      balls: g.balls.length, ballsLeft: g.ballsLeft, combo: g.combo,
      multi: g.ms.multiball, locks: g.table.saucer.locks,
      muted: g.audio.muted, spin: g.table.spinner.spin,
      textsAlive: g.particles.texts.filter((t) => t.alive).length,
      flipL: g.table.flipperL.angle, flipR: g.table.flipperR.angle,
    };
  });
  const place = (x, y, vx, vy) => page.evaluate(([x, y, vx, vy]) => {
    const g = window.__game;
    if (!g.balls.length) return 'noball';
    const b = g.balls[0];
    b.x = x; b.y = y; b.vx = vx; b.vy = vy; b.rampT = -1; b.launching = false;
    if (g.state === 'serving') g.state = 'playing';
    return 'ok';
  }, [x, y, vx, vy]);

  await page.setViewportSize({ width: 1280, height: 720 });
  out.viewport = await page.evaluate(() => ({ w: innerWidth, h: innerHeight }));
  await page.goto('http://localhost:8080/index.html', { waitUntil: 'load' });
  await sleep(700);
  out.booted = await page.evaluate(() => !!window.__game);
  out.titleState = (await snap()).state;

  // Start + plunge.
  await page.keyboard.press('Enter');
  await sleep(400);
  await page.keyboard.down('Space'); await sleep(700); await page.keyboard.up('Space');
  await sleep(1000);
  out.afterPlunge = await snap();

  // Flipper responsiveness: time from keydown to full swing.
  const t0 = Date.now();
  await page.keyboard.down('z');
  let swingMs = -1;
  for (let i = 0; i < 20; i++) {
    await sleep(10);
    const a = await page.evaluate(() => window.__game.table.flipperL.angle);
    if (a < -0.4) { swingMs = Date.now() - t0; break; }
  }
  out.flipperSwingMs = swingMs;
  await page.keyboard.up('z');
  await sleep(200);
  const aR0 = await page.evaluate(() => window.__game.table.flipperR.angle);
  await page.keyboard.down('/');
  await sleep(120);
  const aR1 = await page.evaluate(() => window.__game.table.flipperR.angle);
  await page.keyboard.up('/');
  out.flipperRightMoves = aR0 !== aR1;

  // Bumper bounce: place ball on a bumper, score must rise.
  const s0 = (await state()).score;
  await place(300, 280, 0, -650);
  await sleep(500);
  const s1 = (await state()).score;
  out.bumperScores = s1 > s0;

  // Spinner: place ball through it, spin must rise and score must rise.
  const s2 = (await state()).score;
  await place(200, 440, 300, 0);
  await sleep(400);
  const st = await state();
  out.spinnerSpins = st.spin > 0;
  out.spinnerScores = st.score > s2;

  // Floating texts never pile up: hammer bumper hits, count alive texts.
  for (let i = 0; i < 12; i++) { await place(300, 280, 0, -650); await sleep(120); }
  const st2 = await state();
  out.textsAliveAfterBurst = st2.textsAlive;
  out.textsCapped = st2.textsAlive <= 24;

  // Pause / resume / mute.
  await page.keyboard.press('p'); await sleep(250);
  out.paused = (await snap()).state;
  await page.keyboard.press('p'); await sleep(250);
  out.resumed = (await snap()).state;
  await page.keyboard.press('m'); await sleep(150);
  out.mutedAfterM = (await state()).muted;
  await page.keyboard.press('m'); await sleep(150);
  out.unmutedAfterM2 = !(await state()).muted;

  // Mission 1 -> bonus -> pick 2 (DOUBLE SCORE), then pick 3 path via next mission.
  for (let i = 0; i < 8; i++) {
    const s = await state();
    if (s.mission !== 1) break;
    await place(420, 380, 0, -750); await sleep(450);
  }
  out.bonusState = (await snap()).state;
  await page.keyboard.press('2'); await sleep(400);
  const afterB2 = await state();
  out.afterBonus2 = { state: afterB2.state, mission: afterB2.mission, doubleActive: await page.evaluate(() => window.__game.doubleUntil > window.__game.time) };
  // Complete mission 2 -> bonus -> pick 3 (BALL SAVE).
  for (let i = 0; i < 40; i++) {
    const s = await state();
    if (s.mission !== 2) break;
    await place(300, 280, 0, -650); await sleep(350);
  }
  out.bonusState2 = (await snap()).state;
  await page.keyboard.press('3'); await sleep(400);
  out.afterBonus3 = { state: (await snap()).state, ballSave: await page.evaluate(() => window.__game.ballSave) };

  // Multiball: lock 3 balls via the saucer.
  for (let i = 0; i < 8; i++) {
    const s = await state();
    if (s.multi) break;
    if (s.state === 'serving') { await page.keyboard.down('Space'); await sleep(500); await page.keyboard.up('Space'); await sleep(700); }
    await place(660, 195, 0, -260); await sleep(600);
  }
  const sm = await state();
  out.multiball = sm.multi;
  out.ballsInMultiball = sm.balls;

  // Real-play FPS: 4s of rAF counting while balls are live.
  out.fps = await page.evaluate(() => new Promise((res) => {
    let n = 0; const t0 = performance.now();
    const tick = () => { n++; if (performance.now() - t0 < 4000) requestAnimationFrame(tick); else res(Math.round(n / 4)); };
    requestAnimationFrame(tick);
  }));

  // Real play: one plunge stays in play, ball bounds sane.
  await page.evaluate(() => window.__game.test.start());
  await sleep(300);
  await page.keyboard.down('Space'); await sleep(600); await page.keyboard.up('Space');
  const bounds = await page.evaluate(() => new Promise((res) => {
    const g = window.__game;
    let minX = 999, maxX = -999, minY = 999, maxY = -999, t0 = Date.now();
    const iv = setInterval(() => {
      for (const b of g.balls) {
        minX = Math.min(minX, b.x); maxX = Math.max(maxX, b.x);
        minY = Math.min(minY, b.y); maxY = Math.max(maxY, b.y);
      }
      if (Date.now() - t0 > 8000) { clearInterval(iv); res({ minX: Math.round(minX), maxX: Math.round(maxX), minY: Math.round(minY), maxY: Math.round(maxY), score: Math.floor(g.score), state: g.state }); }
    }, 100);
  }));
  out.play8s = bounds;

  // Restart, then lose (3 drains).
  await page.keyboard.press('r'); await sleep(400);
  out.afterRestart = await snap();
  for (let i = 0; i < 3; i++) {
    await page.evaluate(() => { const g = window.__game; g.test.drain(); });
    await sleep(350);
  }
  out.gameover = await snap();
  await page.screenshot({ path: '/home/hatch/workspace/makefun-best-game/silverball/tests/out/stage4-gameover.png' });

  out.errors = errors;
  out.externalRequests = external;
  return JSON.stringify(out, null, 1);
}
