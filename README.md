# SILVERBALL — Save the Last Arcade

A one-table pinball game for the Make.fun "Make the best game" bounty
(best-game-01). Vanilla JavaScript + HTML5 Canvas, fully offline, no libraries,
no network requests, all sound synthesized in code.

## Play

Open `game/index.html` in a desktop browser, or serve the folder:

```
node serve.ts        # http://localhost:8080
```

Controls: **Z / ←** left flipper, **/ / →** right flipper, **SPACE** hold to charge
the plunger and release to launch, **P** pause, **M** mute, **R** restart.
Mouse/touch: tap the left/right side of the table to flip; hold the plunger lane
to charge.

Goal: wake the Arcade Heart and finish all 8 missions before your 3 balls drain.
Win = mission 8 (Final Revival). Grade S/A/B by score. Best score is saved locally.

## Missions

1. Wake the Heart — hit the Arcade Heart 5x
2. Bumper Rush — 25 bumper hits
3. Ramp Runner — 3 ramp rides
4. Combo Fever — reach combo x5
5. Jackpot — light S-I-L lanes, then hit the gold target
6. Target Lock — knock down A-R-C targets at once
7. Multiball Mayhem — lock 3 balls, score 5,000 in multiball
8. Final Revival — one ball: Heart x3, bumpers x10, 1 ramp, all targets

After each mission, pick 1 of 3 bonuses: Extra Ball, Double Score (30s), Ball Save.

## Files (one job each)

- `game/src/config.js` — tuning constants, table geometry, mission data
- `game/src/rng.js` — seeded random
- `game/src/audio.js` — synth sound effects
- `game/src/physics.js` — ball integration and collisions
- `game/src/table.js` — playfield geometry
- `game/src/missions.js` — campaign progress and bonuses
- `game/src/particles.js` — particles, floating texts, trauma shake, hit-stop
- `game/src/render.js` — all drawing (table, HUD, screens)
- `game/src/input.js` — keyboard + mouse/touch
- `game/src/game.js` — state machine, loop, scoring, win/lose
- `game/src/shots.js` — deterministic screenshot scenes (?shot=)
- `game/src/main.js` — boot

## Deterministic screenshots

`game/index.html?shot=title|game|bonus|victory&seed=1` — sets `window.__shotReady`
when the scene is posed. Screenshots live in `screenshots/` (cover first by name).

## Polish (Tahap 3) — what changed

- **Table:** neon dot field fills the empty playfield; passive spinner sensor
  (left-mid field, +25 pts per pass, never deflects the ball); Arcade Heart is
  now the focal point (soft glow, two pulsing rings, 5 charge pips).
- **Ball:** tapered-polyline trail (no more smear) + bright rim and glow, so it
  stays readable at full speed. Floating score texts are capped, de-stacked
  (nearby texts are pushed up) and drawn with a dark outline.
- **Hit feedback:** bumper shockwave ring, drop targets slide down when hit,
  ramp glows with a travelling highlight, slingshots flash-fill, flipper press
  plays a sound (was silent), trauma shake toned down on drain/jackpot.
- **HUD:** mission list is now one column, all 8 missions at 14px with the
  current one highlighted; score/combo/balls/locks stay readable; controls
  footer no longer overlaps the list. Title screen shows all 8 missions as
  chips (full manual); bonus screen names the next mission.
- **Fixes found by testing:** points could land in the same frame after
  victory (score > saved best) — `addPoints` now returns 0 once the run has
  ended; "HOLD SPACE" label no longer overflows the plunger lane; overlay
  headings no longer collide with the dimmed HUD score.

## Testing (Tahap 4) — verified with Playwright, 1280x720

`tests/` holds the scripts (`stage1.js`, `stage2.js`, `stage4.js`,
`shots-final.js`). Final run, 17 Nov 2026:

- Stage 1 (state machine): boot, title → serving → playing, flipper moves,
  pause/resume, bonus pick, victory, restart, game over after 3 drains —
  all pass, 0 JS errors, 0 external requests.
- Stage 2 (all 8 missions end-to-end, real physics): M1→2 @15,400, M2→3
  @47,800, M3→4 @66,800, M4→5 @72,800, M5→6 @125,000 (jackpot armed),
  M6→7 @131,600, M7→8 @150,750 (multiball, 3 balls), M8→victory @229,200,
  best combo x8, 0 errors, no soft-lock. (Scores vary run to run with the
  real-time physics; an earlier full run finished at 312,350.)
- Stage 4 (comprehensive): flipper swing 47 ms, bumper/spinner score,
  floating texts capped at 6 alive after a 12-hit burst, pause, mute on/off,
  bonus picks 2 (Double Score active) and 3 (Ball Save armed), multiball
  (3 balls), 60 FPS, 8 s real play with the ball inside the table
  (x 61–785, y 43–679), restart, game over, 0 JS errors, 0 external requests.
- Screenshots (regenerated 17 Nov 2026, 21:12 WIB, from the final build):
  `1-cover.jpg` 101,332 B (playing, 48,210), `2-title.jpg` 140,684 B,
  `3-bonus.jpg` 66,805 B, `4-victory.jpg` 63,948 B — all 1280x720,
  `__shotReady=true`, each ≤256 KiB.

## Final visual polish

- Title screen: own overlay gradient (0.80 top → 0.55 middle → 0.72 bottom)
  so the pinball table stays clearly visible behind the text; GOAL/WIN/LOSE,
  HOW TO PLAY and controls enlarged (14→15 px), mission chips 12→13 px with
  a brighter fill, tagline 17→18 px, BEST SCORE 16→18 px.
- Readability: HUD labels dim `#8f86b8` → `#c9c2ea`, upcoming missions
  `#b3abd9`, footer controls 13→14 px, decorative neon dots 1.6x brighter,
  floating score texts 18→20 px with a 4 px dark outline.
- Victory, Bonus, Pause and Game Over screens unchanged. No physics,
  collision, scoring or mission-logic change in this polish pass.

## Final verification (12/12 PASS, 17 Nov 2026, ~21:13 WIB)

Re-run from scratch on the final build, Playwright + headless Chromium,
1280x720: boot + title→serving→playing; flippers L/R; ball bounce
(bumper/spinner score); all 8 missions → victory; no soft-lock / stuck ball /
collision bug; pause (P) + mute (M); bonus pick-1-of-3 (all three picks);
multiball (3 balls); restart (R) + game over after 3 drains; victory score ==
stored best score (explicit check: set 250,000 → victory 258,000 → saved best
258,000, exact); stable 1280x720 at 60 FPS during multiball; 0 JS errors and
0 external requests in every run. No code changed during verification.
Two known cosmetic notes: a faint shadow of the HUD score shows behind the
victory title, and the right HUD panel is slightly see-through behind the
brighter title overlay — text stays readable in both cases.

## Optimization (Tahap 5)

- Bundle: `game/` is 79,523 bytes in 13 files (target <150 KB) — far under the
  48 MiB gate and a tie-break advantage vs ~1 MB top-10 artifacts.
- Performance: 60 FPS measured in headless Chromium during live multiball
  play; particles pooled (240 + 24 texts, no per-frame allocation in the hot
  loop); physics unchanged (substeps 4, gravity 1500) and stable.
- Compatibility: vanilla JS + Canvas + WebAudio only, no libraries, no
  network requests, no external assets; plays offline in desktop Chrome.

## Submission

Entry for Make.fun "Make the best game" (best-game-01, $1,000 USDC, free
entry). Deadline: Wed 18 Nov 2026 18:00 UTC (Thu 19 Nov 2026 01:00 WIB).
Final verification 12/12 PASS (17 Nov 2026). Submission checklist, file list,
description, controls and the exact submit steps: see `SUBMISSION.md`.
Nothing has been submitted yet.

## License

MIT (see LICENSE).
