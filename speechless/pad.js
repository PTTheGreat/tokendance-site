// Speechless's dot pad, drawn the way the keyboard draws it. Used by the
// product page and the homepage story. It only draws: nothing here listens.
(() => {
  "use strict";
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const TICK = 1 / 40;

  class Pad {
    constructor(canvas, { pitch = 13 } = {}) {
      this.canvas = canvas;
      this.g = canvas.getContext("2d");
      this.pitch = pitch;
      this.look = "idle";
      this.since = -9;
      this.now = 0;
      this.levels = new Array(96).fill(0); // newest first
      this.target = 0;
      this.shown = 0;
      this.voice = null;
      this.ripples = [];
      this.acc = 0;
      this.raf = 0;
      this.onScreen = true;
      new ResizeObserver(() => this.size()).observe(canvas);
      new IntersectionObserver(([e]) => {
        this.onScreen = e.isIntersecting;
        if (this.onScreen) this.wake();
      }).observe(canvas);
      this.size();
    }

    size() {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      this.w = this.canvas.clientWidth;
      this.h = this.canvas.clientHeight;
      this.canvas.width = this.w * dpr;
      this.canvas.height = this.h * dpr;
      this.g.setTransform(dpr, 0, 0, dpr, 0, 0);
      this.draw();
    }

    // "idle", "listening" or "working".
    set(look) {
      if (look === this.look) return;
      this.look = look;
      this.since = this.now;
      if (reduced) this.still();
      else this.wake();
    }

    ripple(x, y) {
      if (reduced) return;
      this.ripples.push([x, y, this.now]);
      this.wake();
    }

    // One frame that still reads, for reduced motion.
    still() {
      this.since = this.now - 9;
      const on = this.look === "listening";
      this.levels = this.levels.map((_, i) => (on ? 0.35 + 0.6 * Math.abs(Math.sin(i * 0.55 + 0.9)) : 0));
      this.draw();
    }

    wake() {
      if (this.raf || reduced) return;
      let last = performance.now();
      const frame = (now) => {
        const dt = Math.min(0.05, (now - last) / 1000);
        last = now;
        this.now += dt;
        this.acc += dt;
        for (; this.acc >= TICK; this.acc -= TICK) this.tick();
        this.draw();
        const quiet = this.look === "idle" && !this.ripples.length && this.now - this.since > 0.6 && this.levels.every((l) => l < 0.01);
        this.raf = quiet || !this.onScreen ? 0 : requestAnimationFrame(frame);
      };
      this.raf = requestAnimationFrame(frame);
    }

    tick() {
      if (this.look === "listening") this.target = Math.max(this.target, speech(this.now));
      this.shown += (this.target - this.shown) * (this.target > this.shown ? 0.6 : 0.22);
      this.target *= 0.86;
      this.levels.unshift(this.look === "listening" ? this.shown : 0);
      this.levels.pop();
      this.ripples = this.ripples.filter((r) => this.now - r[2] < 0.9);
    }

    draw() {
      const { g, w, h, pitch, now: t } = this;
      if (!w || !h) return;
      const cols = Math.floor(w / pitch), rows = Math.floor(h / pitch);
      const x0 = (w - (cols - 1) * pitch) / 2, y0 = (h - (rows - 1) * pitch) / 2;
      const mx = w / 2, my = y0 + Math.floor((rows - 2) / 2) * pitch;
      const fade = Math.min(1, (t - this.since) / 0.25);
      g.clearRect(0, 0, w, h);
      g.fillStyle = "#fff";
      const dot = (x, y, r, a) => {
        g.globalAlpha = a;
        g.beginPath();
        g.arc(x, y, r, 0, Math.PI * 2);
        g.fill();
      };
      for (let c = 0; c < cols; c++)
        for (let r = 0; r < rows; r++) {
          const x = x0 + c * pitch, y = y0 + r * pitch;
          const dx = x - mx, dy = y - my, d = Math.hypot(dx, dy);
          const away = Math.floor(Math.abs(dx) / pitch), off = Math.abs(dy) / pitch;
          const edge = Math.min(1, Math.min(x, w - x) / 46) * Math.min(1, Math.min(y, h - y) / 22 + 0.15);
          let v = 0.12 + 0.1 * Math.exp(-(d * d) / 9025);
          if (this.look === "listening") {
            // the voice runs outwards from the middle
            const lv = this.levels[Math.min(Math.floor((away * 3) / 2), this.levels.length - 1)];
            const wobble = 0.62 + 0.38 * Math.sin(away * 1.9 + t * 3.4);
            const taper = Math.pow(Math.max(0, 1 - away / (cols / 2 + 1)), 0.8);
            const lit = Math.max(0, Math.min(1, lv * wobble * taper * rows * 0.4 + 0.7 - off));
            v += 0.88 * lit * (0.25 + 0.75 * taper);
          } else if (this.look === "working") {
            const wave = Math.sin((dx + dy * 0.6) / 26 - t * 6.5);
            v += 0.5 * Math.max(0, wave) * Math.exp(-(d * d) / 14400);
          }
          for (const [rx, ry, born] of this.ripples) {
            const age = t - born, gap = Math.hypot(x - rx, y - ry) - age * 330;
            v += 0.5 * Math.exp(-(gap * gap) / 420) * Math.max(0, 1 - age / 0.75);
          }
          v = Math.min(1, v);
          dot(x, y, 1.05 + 2.3 * v, v * edge);
        }
      // "…": the one thing that says "touch here"
      const a = this.look === "idle" ? 0.95 * fade : 0.95 * (1 - fade);
      if (a > 0.01) for (const k of [-1, 0, 1]) dot(mx + k * 21, my, 6, a);
      g.globalAlpha = 1;
    }
  }

  // A made-up voice: syllables inside phrases.
  function speech(t) {
    const syllable = Math.pow(Math.max(0, Math.sin(t * 10.5 + 1.3 * Math.sin(t * 2.3))), 0.7);
    const phrase = Math.max(0.15, 0.62 + 0.5 * Math.sin(t * 1.9 - 0.6));
    return Math.min(1, syllable * phrase * (0.8 + 0.2 * Math.sin(t * 23)));
  }

  window.SpeechlessPad = Pad;
})();
