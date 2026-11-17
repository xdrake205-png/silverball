// input.js — keyboard + mouse/touch input. Flippers are held state; actions are events.
export class Input {
  constructor(canvas, handlers) {
    this.handlers = handlers;
    this.leftHeld = false;
    this.rightHeld = false;
    this.keys = new Set();
    this._kd = (e) => this._onKey(e, true);
    this._ku = (e) => this._onKey(e, false);
    this._pd = (e) => this._onPointer(e, true);
    this._pu = (e) => this._onPointer(e, false);
    window.addEventListener('keydown', this._kd);
    window.addEventListener('keyup', this._ku);
    canvas.addEventListener('pointerdown', this._pd);
    window.addEventListener('pointerup', this._pu);
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  _onKey(e, down) {
    const k = e.key;
    if ([' ', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(k)) e.preventDefault();
    if (down && e.repeat) return;
    this.handlers.audioEnsure && this.handlers.audioEnsure();
    if (down) this.keys.add(k); else this.keys.delete(k);
    const left = k === 'z' || k === 'Z' || k === 'a' || k === 'A' || k === 'ArrowLeft';
    const right = k === '/' || k === "'" || k === 'ArrowRight' || k === ';';
    if (left) { this.leftHeld = down; if (down) this.handlers.onFlipper && this.handlers.onFlipper('left'); }
    if (right) { this.rightHeld = down; if (down) this.handlers.onFlipper && this.handlers.onFlipper('right'); }
    if (!down) {
      if (k === ' ') this.handlers.onPlungeKey && this.handlers.onPlungeKey(false);
      return;
    }
    if (k === ' ' || k === 'Enter') this.handlers.onAction && this.handlers.onAction(k);
    if (k === ' ') this.handlers.onPlungeKey && this.handlers.onPlungeKey(true);
    if (k === 'p' || k === 'P' || k === 'Escape') this.handlers.onPause && this.handlers.onPause();
    if (k === 'm' || k === 'M') this.handlers.onMute && this.handlers.onMute();
    if (k === 'r' || k === 'R') this.handlers.onRestart && this.handlers.onRestart();
    if (k === 't' || k === 'T') this.handlers.onTitle && this.handlers.onTitle();
    if (k === '1' || k === '2' || k === '3') this.handlers.onBonus && this.handlers.onBonus(Number(k));
  }

  _onPointer(e, down) {
    this.handlers.audioEnsure && this.handlers.audioEnsure();
    const canvas = e.target;
    if (!canvas || canvas.tagName !== 'CANVAS') return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (1280 / rect.width);
    const y = (e.clientY - rect.top) * (720 / rect.height);
    if (down) {
      this.handlers.onUIClick && this.handlers.onUIClick(x, y);
      // Table area flips: left half = left flipper, right half = right flipper.
      if (x < 420 && y > 40) { this.leftHeld = true; this.handlers.onFlipper && this.handlers.onFlipper('left'); }
      else if (x < 830 && y > 40) { this.rightHeld = true; this.handlers.onFlipper && this.handlers.onFlipper('right'); }
    } else {
      this.leftHeld = false; this.rightHeld = false;
      this.handlers.onPointerUp && this.handlers.onPointerUp();
    }
  }

}
