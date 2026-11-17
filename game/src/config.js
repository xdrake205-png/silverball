// config.js — SILVERBALL tuning constants, table geometry and mission data.
// All tuning lives here so a retune is a one-line change (prototype-fast).
export const W = 1280;
export const H = 720;

// Playfield: x 30..810, y 20..700. Right side is the plunger lane (x 760..810).
export const TABLE = {
  left: 30, right: 810, top: 20, bottom: 700,
  laneX: 760, laneRight: 810, laneTop: 150, floorY: 690, // top arc: ellipse centre (420,200) rx 390 ry 180; divider ends at laneTop, one-way gate covers y<155
};

// Physics tuning (prototype-fast: named constants at the top).
export const PHYS = {
  gravity: 1500,      // px/s^2
  ballR: 11,
  wallRest: 0.4,      // wall bounce
  maxSpeed: 1700,
  substeps: 4,        // fixed-step substeps per frame at 60fps (max 14px/step at 1700px/s: no tunnelling)
  drainY: 700,
  plungeBase: 750,    // min launch speed
  plungeExtra: 1150,  // added at full charge
  rampMinSpeed: 520,  // speed needed to enter the ramp
};

export const FLIPPER = {
  len: 74,
  pivotL: { x: 331, y: 625 },
  pivotR: { x: 508, y: 625 },
  restL: 0.49,            // +28 deg (down-right)
  restR: Math.PI - 0.49,  // 152 deg (down-left)
  activeL: -0.56,         // -32 deg (up-right)
  activeR: Math.PI + 0.56,// 212 deg (up-left)
  upSpeed: 26,            // rad/s when pressed (snappier flip, still stable)
  downSpeed: 12,          // rad/s when released
  flickBoost: 60,         // extra kick while swinging up
};

// Scoring (base points; multiplied by combo).
export const SCORE = {
  bumper: 100, sling: 50, target: 150, lane: 200,
  ramp: 500, heart: 250, jackpot: 5000, missionBonus: 1000, spinner: 25,
};

export const COMBO = { window: 3.5, max: 8 }; // streak of scoring hits within the window; combo = min(max, streak)
export const BALLS_PER_GAME = 3;

// Mission definitions — each has a DIFFERENT mechanic and target.
export const MISSIONS = [
  { id: 1, name: 'WAKE THE HEART', desc: 'Hit the Arcade Heart 5 times to wake it.',
    goal: 'Heart hits', target: 5, key: 'heart' },
  { id: 2, name: 'BUMPER RUSH', desc: 'Smash 25 bumpers before the ball drains.',
    goal: 'Bumper hits', target: 25, key: 'bumper' },
  { id: 3, name: 'RAMP RUNNER', desc: 'Ride the left ramp 3 times.',
    goal: 'Ramp runs', target: 3, key: 'ramp' },
  { id: 4, name: 'COMBO FEVER', desc: 'Build a x5 combo — keep scoring without a pause.',
    goal: 'Best combo', target: 5, key: 'combo' },
  { id: 5, name: 'JACKPOT', desc: 'Light all 3 rollover lanes (S-I-L), then hit the JACKPOT target.',
    goal: 'Jackpot', target: 1, key: 'jackpot' },
  { id: 6, name: 'TARGET LOCK', desc: 'Knock down all 3 drop targets A-R-C at once.',
    goal: 'Targets down', target: 3, key: 'targets' },
  { id: 7, name: 'MULTIBALL MAYHEM', desc: 'Lock 3 balls in the saucer, then score 5,000 during multiball.',
    goal: 'Multiball score', target: 5000, key: 'multiball' },
  { id: 8, name: 'FINAL REVIVAL', desc: 'One ball. Heart x3, bumpers x10, 1 ramp, all targets down.',
    goal: 'Revival', target: 4, key: 'final' },
];

export const GRADES = [
  { min: 150000, grade: 'S', title: 'ARCADE LEGEND' },
  { min: 100000, grade: 'A', title: 'HEART KEEPER' },
  { min: 0, grade: 'B', title: 'PINBALL FAN' },
];

export const PALETTE = {
  bg: '#12082b', panel: '#1d0f45', panelEdge: '#3b2a7a',
  neonCyan: '#22d3ee', neonPink: '#ff4fd8', neonAmber: '#ffb020',
  neonGreen: '#3dff8e', neonRed: '#ff5470', cream: '#fff3d6',
  ink: '#0d0620', silver: '#c9d4e6', dim: '#8f86b8',
};
