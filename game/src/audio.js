// audio.js — original synth sound effects (WebAudio, no audio files).
// Every sound is generated in code, so the game stays fully offline.
export class AudioSys {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.muted = false;
  }

  // Must be called from a user gesture at least once.
  ensure() {
    if (!this.ctx) {
      try {
        const AC = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AC();
        this.master = this.ctx.createGain();
        this.master.gain.value = 0.45;
        this.master.connect(this.ctx.destination);
      } catch (e) { this.ctx = null; }
    }
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
  }

  setMuted(m) { this.muted = m; if (this.master) this.master.gain.value = m ? 0 : 0.45; }

  tone({ f = 440, f2 = null, d = 0.1, type = 'sine', v = 0.5, when = 0 }) {
    if (!this.ctx || this.muted) return;
    const t0 = this.ctx.currentTime + when;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t0);
    if (f2) o.frequency.exponentialRampToValueAtTime(Math.max(1, f2), t0 + d);
    g.gain.setValueAtTime(v, t0);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + d);
    o.connect(g); g.connect(this.master);
    o.start(t0); o.stop(t0 + d + 0.02);
  }

  noise({ d = 0.15, f = 1200, v = 0.3, when = 0 }) {
    if (!this.ctx || this.muted) return;
    const t0 = this.ctx.currentTime + when;
    const len = Math.max(1, Math.floor(this.ctx.sampleRate * d));
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = this.ctx.createBufferSource(); src.buffer = buf;
    const flt = this.ctx.createBiquadFilter(); flt.type = 'bandpass'; flt.frequency.value = f;
    const g = this.ctx.createGain(); g.gain.value = v;
    src.connect(flt); flt.connect(g); g.connect(this.master);
    src.start(t0);
  }

  flipper() { this.tone({ f: 220, f2: 330, d: 0.05, type: 'square', v: 0.18 }); }
  bumper() { this.tone({ f: 180, f2: 90, d: 0.12, type: 'sine', v: 0.5 }); this.noise({ d: 0.06, f: 2400, v: 0.15 }); }
  sling() { this.tone({ f: 320, f2: 180, d: 0.07, type: 'triangle', v: 0.3 }); }
  target() { this.tone({ f: 660, d: 0.06, type: 'square', v: 0.25 }); }
  lane() { this.tone({ f: 520, f2: 780, d: 0.09, type: 'sine', v: 0.3 }); }
  spinner() { this.tone({ f: 700, f2: 980, d: 0.05, type: 'sine', v: 0.18 }); }
  ramp() { this.noise({ d: 0.35, f: 900, v: 0.25 }); this.tone({ f: 300, f2: 900, d: 0.35, type: 'sine', v: 0.2 }); }
  heart() { this.tone({ f: 523, d: 0.12, type: 'sine', v: 0.4 }); this.tone({ f: 784, d: 0.18, type: 'sine', v: 0.35, when: 0.08 }); }
  jackpot() {
    [523, 659, 784, 1047].forEach((f, i) => this.tone({ f, d: 0.16, type: 'square', v: 0.3, when: i * 0.07 }));
    this.noise({ d: 0.3, f: 3200, v: 0.2 });
  }
  drain() { this.tone({ f: 400, f2: 90, d: 0.5, type: 'sawtooth', v: 0.3 }); }
  launch() { this.tone({ f: 200, f2: 800, d: 0.25, type: 'sine', v: 0.3 }); }
  lock() { this.tone({ f: 392, d: 0.1, type: 'triangle', v: 0.35 }); this.tone({ f: 587, d: 0.14, type: 'triangle', v: 0.35, when: 0.09 }); }
  multiball() { [392, 523, 659, 784, 1047].forEach((f, i) => this.tone({ f, d: 0.14, type: 'square', v: 0.28, when: i * 0.06 })); }
  mission() { [523, 659, 784, 1047, 1319].forEach((f, i) => this.tone({ f, d: 0.18, type: 'triangle', v: 0.32, when: i * 0.08 })); }
  victory() { [523, 659, 784, 1047, 784, 1047, 1319].forEach((f, i) => this.tone({ f, d: 0.22, type: 'triangle', v: 0.32, when: i * 0.11 })); }
  defeat() { [392, 330, 262, 196].forEach((f, i) => this.tone({ f, d: 0.25, type: 'sine', v: 0.3, when: i * 0.14 })); }
  click() { this.tone({ f: 880, d: 0.04, type: 'square', v: 0.15 }); }
}
