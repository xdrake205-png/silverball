// missions.js — the 8-mission campaign: progress tracking and completion checks.
// Each mission has a different mechanic; progress resets per mission (count),
// per-ball counters reset when a new ball is served (perBall).
import { MISSIONS } from './config.js';

export const BONUSES = [
  { id: 'ball', name: 'EXTRA BALL', desc: '+1 ball in reserve. The arcade keeps one spare.' },
  { id: 'double', name: 'DOUBLE SCORE', desc: 'All points x2 for 30 seconds.' },
  { id: 'save', name: 'BALL SAVE', desc: 'Your next drain is forgiven — the ball comes back.' },
];

export function createMissionState() {
  return {
    index: 0,                 // current mission (0-based)
    count: { heart: 0, bumper: 0, ramp: 0 }, // per-mission counters
    perBall: { heart: 0, bumper: 0, ramp: 0 }, // reset on every serve
    lanesLit: [false, false, false],
    jackpotArmed: false,
    multiballScore: 0,
    multiball: false,
    bestCombo: 0,
    locks: 0,
    finalTargets: 0, // targets down in the current ball (mission 8)
    done: false,
  };
}

export function currentMission(ms) { return MISSIONS[ms.index] || null; }

export function resetPerBall(ms) {
  ms.perBall = { heart: 0, bumper: 0, ramp: 0 };
  ms.finalTargets = 0;
}

// Progress text + fraction for the HUD mission card.
export function missionProgress(ms) {
  const m = currentMission(ms);
  if (!m) return { text: 'ALL MISSIONS DONE', frac: 1 };
  const c = ms.count;
  switch (m.key) {
    case 'heart': return { text: `Heart hits ${c.heart}/${m.target}`, frac: c.heart / m.target };
    case 'bumper': return { text: `Bumper hits ${c.bumper}/${m.target}`, frac: c.bumper / m.target };
    case 'ramp': return { text: `Ramp runs ${c.ramp}/${m.target}`, frac: c.ramp / m.target };
    case 'combo': return { text: `Best combo x${ms.bestCombo} / x${m.target}`, frac: ms.bestCombo / m.target };
    case 'jackpot': return { text: ms.jackpotArmed ? 'JACKPOT ARMED — hit the gold target!' : `Light S-I-L lanes (${ms.lanesLit.filter(Boolean).length}/3)`, frac: ms.lanesLit.filter(Boolean).length / 3 };
    case 'targets': return { text: `Targets down — A R C`, frac: 0 };
    case 'multiball': return { text: ms.multiball ? `Multiball score ${Math.floor(ms.multiballScore)}/${m.target}` : `Lock balls in the saucer (${ms.locks}/3)`, frac: ms.multiball ? ms.multiballScore / m.target : ms.locks / 3 };
    case 'final': {
      const parts = [ms.perBall.heart >= 3, ms.perBall.bumper >= 10, ms.perBall.ramp >= 1];
      const n = parts.filter(Boolean).length;
      return { text: `One ball: Heart ${ms.perBall.heart}/3 · Bumpers ${ms.perBall.bumper}/10 · Ramp ${ms.perBall.ramp}/1`, frac: n / 3 };
    }
    default: return { text: '', frac: 0 };
  }
}

// Apply one event; returns true when the current mission completes.
export function applyMissionEvent(ms, ev, val = 1) {
  const m = currentMission(ms);
  if (!m || ms.done) return false;
  const c = ms.count;
  switch (m.key) {
    case 'heart':
      if (ev === 'heart') { c.heart++; ms.perBall.heart++; return c.heart >= m.target; }
      break;
    case 'bumper':
      if (ev === 'bumper') { c.bumper++; ms.perBall.bumper++; return c.bumper >= m.target; }
      break;
    case 'ramp':
      if (ev === 'ramp') { c.ramp++; ms.perBall.ramp++; return c.ramp >= m.target; }
      break;
    case 'combo':
      if (ev === 'combo') { ms.bestCombo = Math.max(ms.bestCombo, val); return ms.bestCombo >= m.target; }
      break;
    case 'jackpot':
      if (ev === 'jackpot') return true;
      break;
    case 'targets':
      if (ev === 'targets') return val >= m.target;
      break;
    case 'multiball':
      if (ev === 'multiballScore') { ms.multiballScore += val; return ms.multiballScore >= m.target; }
      break;
    case 'final': {
      // Every event re-checks the whole set: the player may finish the parts
      // in any order (targets first, then the ramp, ...), so no single event
      // may be the only trigger — otherwise the mission soft-locks.
      if (ev === 'heart') ms.perBall.heart++;
      if (ev === 'bumper') ms.perBall.bumper++;
      if (ev === 'ramp') ms.perBall.ramp++;
      if (ev === 'targets' && typeof val === 'number') ms.finalTargets = val;
      if (ev === 'targets' && val === 'targetsDone') ms.finalTargets = 3;
      return ms.perBall.heart >= 3 && ms.perBall.bumper >= 10 && ms.perBall.ramp >= 1 && ms.finalTargets >= 3;
    }
  }
  return false;
}

// Advance to the next mission after a completion.
export function advanceMission(ms) {
  ms.index++;
  ms.count = { heart: 0, bumper: 0, ramp: 0 };
  ms.lanesLit = [false, false, false];
  ms.jackpotArmed = false;
  ms.multiballScore = 0;
  ms.finalTargets = 0;
  if (ms.index >= MISSIONS.length) ms.done = true;
}
