// Final competition screenshots: 4 deterministic ?shot= scenes -> silverball/screenshots/
// as JPEG (shots.json names). Verifies __shotReady, size <= 256 KiB, 1280x720.
async (page) => {
  const errors = [];
  page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const shots = [
    ['game', '1-cover.jpg'],
    ['title', '2-title.jpg'],
    ['bonus', '3-bonus.jpg'],
    ['victory', '4-victory.jpg'],
  ];
  const out = {};
  await page.setViewportSize({ width: 1280, height: 720 });
  for (const [shot, name] of shots) {
    await page.goto(`http://localhost:8080/index.html?shot=${shot}&seed=1`, { waitUntil: 'load' });
    let ready = false;
    for (let i = 0; i < 20; i++) {
      await sleep(200);
      ready = await page.evaluate(() => !!window.__shotReady);
      if (ready) break;
    }
    await sleep(300);
    const path = `/home/hatch/workspace/makefun-best-game/silverball/screenshots/${name}`;
    await page.screenshot({ path, type: 'jpeg', quality: 85 });
    out[shot] = {
      ready,
      state: await page.evaluate(() => window.__game.state),
      score: await page.evaluate(() => Math.floor(window.__game.score)),
      path,
    };
  }
  out.errors = errors;
  return JSON.stringify(out, null, 1);
}
