// Stage 1 Playwright test for SILVERBALL (run via playwright-cli run-code).
// Returns a JSON summary; screenshots go to tests/out/.
async (page) => {
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message));
  const out = {};
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const snap = () => page.evaluate(() => window.__game ? window.__game.test.snapshot() : null);

  await page.goto('http://localhost:8080/index.html', { waitUntil: 'load' });
  await sleep(800);
  out.booted = await page.evaluate(() => !!window.__game);
  out.titleState = (await snap())?.state;
  await page.screenshot({ path: '/home/hatch/workspace/makefun-best-game/silverball/tests/out/stage1-title.png' });

  // Start the game.
  await page.keyboard.press('Enter');
  await sleep(500);
  out.afterEnter = await snap();

  // Plunge: hold Space 700ms, release.
  await page.keyboard.down('Space');
  await sleep(700);
  await page.keyboard.up('Space');
  await sleep(1200);
  out.afterPlunge = await snap();

  // Flippers: hold Z, check left flipper angle moves; same for /.
  const angleBefore = await page.evaluate(() => window.__game.table.flipperL.angle);
  await page.keyboard.down('z');
  await sleep(150);
  const angleDuring = await page.evaluate(() => window.__game.table.flipperL.angle);
  await page.keyboard.up('z');
  out.flipperMoves = angleBefore !== angleDuring;

  // Play a bit: flip randomly, watch the ball.
  for (let i = 0; i < 10; i++) {
    await page.keyboard.down(i % 2 ? 'z' : '/');
    await sleep(120);
    await page.keyboard.up(i % 2 ? 'z' : '/');
    await sleep(250);
  }
  out.afterPlay = await snap();
  await page.screenshot({ path: '/home/hatch/workspace/makefun-best-game/silverball/tests/out/stage1-game.png' });

  // Pause / resume.
  await page.keyboard.press('p');
  await sleep(300);
  out.paused = (await snap())?.state;
  await page.keyboard.press('p');
  await sleep(300);
  out.resumed = (await snap())?.state;

  // Mission complete -> bonus -> pick 1.
  await page.evaluate(() => window.__game.test.completeMission());
  await sleep(300);
  out.bonusState = (await snap())?.state;
  await page.keyboard.press('1');
  await sleep(300);
  out.afterBonus = await snap();

  // Win path.
  await page.evaluate(() => window.__game.test.win());
  await sleep(300);
  out.victory = await snap();
  await page.screenshot({ path: '/home/hatch/workspace/makefun-best-game/silverball/tests/out/stage1-victory.png' });

  // Restart, then lose path (drain 3 balls).
  await page.keyboard.press('r');
  await sleep(400);
  out.afterRestart = await snap();
  await page.evaluate(() => { const g = window.__game; g.test.drain(); });
  await sleep(300);
  await page.evaluate(() => { const g = window.__game; g.test.drain(); });
  await sleep(300);
  await page.evaluate(() => { const g = window.__game; g.test.drain(); });
  await sleep(400);
  out.gameover = await snap();
  await page.screenshot({ path: '/home/hatch/workspace/makefun-best-game/silverball/tests/out/stage1-gameover.png' });

  // External requests?
  out.externalRequests = await page.evaluate(() => performance.getEntriesByType('resource')
    .map((r) => r.name).filter((n) => !n.startsWith('http://localhost:8080')).length);
  out.errors = errors;
  return JSON.stringify(out, null, 1);
}
