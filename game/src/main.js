// main.js — boot: create the game, apply a deterministic shot scene if asked.
import { Game } from './game.js';
import { applyShot } from './shots.js';

const canvas = document.getElementById('game');
const game = new Game(canvas);
window.__game = game;

const params = new URLSearchParams(location.search);
const shot = params.get('shot');
if (shot) {
  game.shotMode = true;
  applyShot(game, shot, Number(params.get('seed') || 1));
}
game.start();

// Deterministic shot scenes: mark ready shortly after the first frames render.
if (shot) {
  setTimeout(() => { window.__shotReady = true; window.shotReady = true; }, 400);
}
