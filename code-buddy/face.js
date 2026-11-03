// Code Buddy's animated face, shared by the product pages. Same code as the
// homepage demo in /app.js.
(() => {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  // Code Buddy's face, ported from Buddy/macos/character (v5). The head is a
  // unit sphere: the eyes sit on its surface, so turning slides them across
  // the face and squeezes the far one. Every eye shape is one round-capped
  // stroke from p0 to p2 bending at p1, so a dot can stretch into ^ or > <.
  const SVGNS = "http://www.w3.org/2000/svg";
  const DEG = Math.PI / 180;
  const EYE = { ex: 0.34, ey: 0.04, ow: 1.0, oh: 1.08 };
  const SHAPES = {
    round: [0, 0, 0, 0, 0, 0, 0.22, 0],
    wide: [0, 0, 0, 0, 0, 0, 0.27, 0],
    happy: [-0.2, 0.08, 0, -0.1, 0.2, 0.08, 0.085, 1],
    sleepy: [-0.2, -0.03, 0, 0.07, 0.2, -0.03, 0.075, 1],
    cross: [-0.12, -0.16, 0.2, 0, -0.12, 0.16, 0.08, 0],
  };
  const DOTS = ["round", "wide"];
  const FACE_EYES = { idle: "round", working: "round", waiting: "wide", done: "happy", error: "cross", sleep: "sleepy" };
  const POSE = { yaw: 0, pitch: 0, roll: 0, x: 0, y: 0, sx: 1, sy: 1, sc: 1 };
  const SPRINGS = { yaw: [110, 0.78], pitch: [110, 0.78], roll: [90, 0.7], x: [120, 0.8], y: [200, 0.62], sx: [380, 0.5], sy: [380, 0.5], sc: [140, 0.7] };
  const rand = (a, b) => a + Math.random() * (b - a);
  const unit = (v) => { const l = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / l, v[1] / l, v[2] / l]; };
  let faceId = 0;

  function rotation(yaw, pitch, roll) {
    const cy = Math.cos(yaw * DEG), sy = Math.sin(yaw * DEG);
    const cp = Math.cos(pitch * DEG), sp = Math.sin(pitch * DEG);
    const cr = Math.cos(roll * DEG), sr = Math.sin(roll * DEG);
    const a = [[cy, 0, sy], [0, 1, 0], [-sy, 0, cy]];
    const b = [[1, 0, 0], [0, cp, sp], [0, -sp, cp]];
    const c = [[cr, -sr, 0], [sr, cr, 0], [0, 0, 1]];
    const mul = (A, B) => A.map((r) => [0, 1, 2].map((j) => r[0] * B[0][j] + r[1] * B[1][j] + r[2] * B[2][j]));
    return mul(c, mul(b, a));
  }
  const apply = (M, v) => [0, 1, 2].map((i) => M[i][0] * v[0] + M[i][1] * v[1] + M[i][2] * v[2]);

  function eyeFrame(side, M) {
    const v = unit([side * EYE.ex, EYE.ey, Math.sqrt(1 - EYE.ex * EYE.ex - EYE.ey * EYE.ey)]);
    const tx = unit([v[2], 0, -v[0]]);
    const ty = [v[1] * tx[2] - v[2] * tx[1], v[2] * tx[0] - v[0] * tx[2], v[0] * tx[1] - v[1] * tx[0]];
    const V = apply(M, v), X = apply(M, tx), Y = apply(M, ty);
    return { a: X[0], b: X[1], c: Y[0], d: Y[1], e: V[0], f: V[1], z: V[2] };
  }

  function strokePath(s, mirror) {
    const m = mirror ? -1 : 1;
    const [x0, y0, x1, y1, x2, y2, , arc] = s;
    const cx = x1 + arc * (x1 - (x0 + x2) / 2), cy = y1 + arc * (y1 - (y0 + y2) / 2);
    const tiny = Math.hypot(x2 - x0, y2 - y0) < 1e-4 && Math.hypot(cx - x0, cy - y0) < 1e-4 ? 1e-4 : 0;
    const f = (v) => Math.round(v * 10000) / 10000;
    return `M${f(m * x0)} ${f(y0)}Q${f(m * cx)} ${f(cy)} ${f(m * x2 + tiny)} ${f(y2)}`;
  }

  function svgEl(tag, attrs, parent) {
    const n = document.createElementNS(SVGNS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    parent.appendChild(n);
    return n;
  }

  // `template` draws a solid face with the eyes knocked out, like the macOS
  // menu bar icon; otherwise an orange face with white eyes.
  class BuddyFace {
    constructor(svg, { template = null, color = "#ff6a2b" } = {}) {
      this.template = template;
      this.R = template ? 92 : 70;
      this.amp = template ? 0.65 : 1;
      this.eyeScale = template ? 1.1 : 1;
      this.state = "idle";
      this.since = 0;
      this.clock = 0;
      this.pose = { ...POSE };
      this.vel = {};
      for (const k in POSE) this.vel[k] = 0;
      this.shapeKey = "round";
      this.shape = SHAPES.round.slice();
      this.shapeV = this.shape.map(() => 0);
      this.pending = null;
      this.blink = 0;
      this.blinkV = 0;
      this.blinkHold = 0;
      this.secondBlink = null;
      this.nextBlink = rand(1.2, 3);
      this.glance = { yaw: 0, pitch: 0, next: rand(0.8, 2.5) };
      this.variant = "read";
      this.variantNext = rand(5, 7);
      const id = "bf" + ++faceId;
      const defs = svgEl("defs", {}, svg);
      this.head = svgEl("g", {}, svg);
      if (template) {
        const mask = svgEl("mask", { id: id + "m", maskUnits: "userSpaceOnUse", x: -150, y: -150, width: 300, height: 300 }, defs);
        svgEl("rect", { x: -150, y: -150, width: 300, height: 300, fill: "#fff" }, mask);
        this.eyeG = [0, 1].map(() => svgEl("g", {}, mask));
        this.eyes = this.eyeG.map((g) => svgEl("path", { fill: "none", stroke: "#000", "stroke-linecap": "round" }, g));
        svgEl("circle", { r: this.R, fill: template, mask: `url(#${id}m)` }, this.head);
      } else {
        const clip = svgEl("clipPath", { id: id + "c" }, defs);
        svgEl("circle", { r: this.R }, clip);
        svgEl("circle", { r: this.R, fill: color }, this.head);
        const g = svgEl("g", { "clip-path": `url(#${id}c)` }, this.head);
        this.eyeG = [0, 1].map(() => svgEl("g", {}, g));
        this.eyes = this.eyeG.map((e) => svgEl("path", { fill: "none", stroke: "#fff", "stroke-linecap": "round" }, e));
      }
      this.step(0, 0.016);
    }

    set(key) {
      if (key === this.state) return;
      const from = this.state;
      this.state = key;
      this.since = 0;
      if (key === "working") { this.variant = "read"; this.variantNext = rand(6, 10); }
      if (from === "sleep") this.doBlink();
      this.want(FACE_EYES[key]);
    }

    // Dots morph into each other; other shapes swap behind a blink.
    want(key) {
      if (key === this.shapeKey || (DOTS.includes(key) && DOTS.includes(this.shapeKey))) {
        this.shapeKey = key;
        this.pending = null;
      } else this.pending = key;
    }

    doBlink(double) {
      if (this.pending) return;
      this.blinkHold = this.clock + 0.07;
      this.secondBlink = double ? this.clock + 0.23 : null;
    }

    behave(t, dt, P) {
      const s = this.since;
      switch (this.state) {
        case "idle": {
          const g = this.glance;
          g.next -= dt;
          if (g.next <= 0) {
            const home = Math.random() < 0.35;
            g.yaw = home ? 0 : rand(-26, 26);
            g.pitch = home ? 0 : rand(-16, 12);
            g.next = rand(1.8, 4.6);
          }
          P.yaw = g.yaw; P.pitch = g.pitch; P.roll = g.yaw * 0.18;
          P.sc = 1 + Math.sin(t * 1.7) * 0.012;
          break;
        }
        case "working": {
          this.variantNext -= dt;
          if (this.variantNext <= 0) {
            this.variant = this.variant === "read" && Math.random() < 0.6 ? "think" : "read";
            this.variantNext = this.variant === "read" ? rand(6, 10) : rand(2.5, 4);
          }
          if (this.variant === "read") {
            // scan a line left to right, glide back, next line a touch lower; the eyes stay
            const line = 2.4, ph = (t % line) / line;
            const yaw = ph < 0.75 ? -15 + 30 * (ph / 0.75) : 15 - 30 * ((ph - 0.75) / 0.25);
            P.yaw = yaw; P.pitch = 12 + Math.floor((t / line) % 3) * 1.5; P.roll = yaw * 0.06;
          } else {
            P.yaw = Math.sin(t * 0.6) * 10; P.pitch = -14; P.roll = Math.sin(t * 0.6) * 4;
          }
          break;
        }
        case "waiting": {
          // hop every 2 s at first, then every 6 s
          const ph = s < 12 ? s % 2.0 : (s - 12) % 6;
          P.pitch = -4; P.yaw = Math.sin(t * 0.7) * 5; P.roll = Math.sin(t * 0.7) * 3;
          if (ph < 0.12) { P.sx = 1.07; P.sy = 0.91; }
          else if (ph < 0.38) { P.y = -0.18; P.sx = 0.96; P.sy = 1.05; }
          else if (ph < 0.5) { P.sx = 1.05; P.sy = 0.95; }
          break;
        }
        case "done": {
          // two little hops, then stay pleased
          const hop = (h) => {
            const ph = s - h;
            if (ph < 0 || ph > 0.62) return;
            if (ph < 0.1) { P.sx = 1.09; P.sy = 0.89; }
            else if (ph < 0.38) { P.y = -0.28; P.sx = 0.95; P.sy = 1.07; }
            else { P.sx = 1.05; P.sy = 0.95; }
          };
          hop(0.05); hop(0.8);
          P.pitch = -10; P.roll = Math.sin(s * 6) * 8 * Math.max(0, 1 - s / 2.4);
          break;
        }
        case "error": {
          // shake it off once, then hang the head
          if (s < 0.8) P.yaw = Math.sin(s * 34) * 20 * (1 - s / 0.8);
          else { P.pitch = 12; P.y = 0.04; P.sy = 0.97; P.sx = 1.02; P.roll = -4; P.yaw = Math.sin(t * 0.8) * 4; }
          break;
        }
        case "sleep": {
          const b = Math.sin(t * 1.15);
          P.pitch = 14; P.roll = Math.sin(t * 0.5) * 4 - 3; P.yaw = -6;
          P.sc = 1 + b * 0.02; P.sy = 1 + b * 0.012; P.y = 0.04 + b * 0.008;
          break;
        }
      }
    }

    step(t, dt) {
      this.since += dt;
      this.clock += dt;
      const P = { ...POSE };
      this.behave(t, dt, P);
      if (reduced) for (const k of ["yaw", "pitch", "roll", "y"]) P[k] *= 0.3;
      P.x += (P.yaw / 20) * 0.07;
      P.y += (P.pitch / 20) * 0.06;

      if (this.secondBlink !== null && this.clock >= this.secondBlink) { this.secondBlink = null; this.doBlink(false); }
      if (this.state === "idle" || this.state === "working" || this.state === "waiting") {
        this.nextBlink -= dt;
        if (this.nextBlink <= 0) { this.doBlink(Math.random() < 0.22); this.nextBlink = rand(2.4, 5.4); }
      }

      // fixed 1/120 s sub-steps keep the stiff blink spring stable
      const n = Math.max(1, Math.ceil(dt * 120)), h = dt / n;
      const KB = 1500, CB = 2 * Math.sqrt(KB) * 0.9, KS = 240, CS = 2 * Math.sqrt(KS) * 0.85;
      for (let k = 0; k < n; k++) {
        for (const key in P) {
          const [K, z] = SPRINGS[key], C = 2 * Math.sqrt(K) * z;
          const scale = key === "sx" || key === "sy" || key === "sc";
          const still = this.template && (key === "x" || key === "y");
          const target = scale ? 1 + (P[key] - 1) * this.amp : still ? 0 : P[key] * this.amp;
          this.vel[key] += ((target - this.pose[key]) * K - this.vel[key] * C) * h;
          this.pose[key] += this.vel[key] * h;
        }
        const shut = this.pending || this.clock < this.blinkHold ? 1 : 0;
        this.blinkV += ((shut - this.blink) * KB - this.blinkV * CB) * h;
        this.blink += this.blinkV * h;
        if (this.pending && this.blink > 0.82) {
          // the eyes are shut: swap the shape while nobody can see
          this.shapeKey = this.pending;
          this.pending = null;
          this.blinkHold = 0;
          this.shape = SHAPES[this.shapeKey].slice();
          this.shapeV = this.shape.map(() => 0);
        }
        const tgt = SHAPES[this.shapeKey];
        for (let i = 0; i < tgt.length; i++) {
          this.shapeV[i] += ((tgt[i] - this.shape[i]) * KS - this.shapeV[i] * CS) * h;
          this.shape[i] += this.shapeV[i] * h;
        }
      }
      this.render();
    }

    render() {
      const p = this.pose, R = this.R;
      const open = 1 - Math.max(0, Math.min(1, this.blink)) * 0.9;
      // squash and stretch around the bottom of the face
      this.head.setAttribute("transform", `translate(${100 + p.x * R} ${100 + p.y * R + R}) scale(${p.sx * p.sc} ${p.sy * p.sc}) translate(0 ${-R})`);
      const M = rotation(p.yaw, p.pitch, p.roll);
      const d = [strokePath(this.shape, false), strokePath(this.shape, true)];
      [-1, 1].forEach((side, i) => {
        const F = eyeFrame(side, M);
        const wx = EYE.ow * this.eyeScale * (1 + (1 - open) * 0.14), hy = EYE.oh * this.eyeScale * open;
        this.eyeG[i].setAttribute("transform", `matrix(${F.a * R * wx} ${F.b * R * wx} ${F.c * R * hy} ${F.d * R * hy} ${F.e * R} ${F.f * R})`);
        this.eyes[i].setAttribute("d", d[i]);
        this.eyes[i].setAttribute("stroke-width", 2 * this.shape[6]);
        this.eyes[i].setAttribute("opacity", Math.max(0, Math.min(1, (F.z - 0.04) / 0.18)));
      });
    }
  }

  window.BuddyFace = BuddyFace;
  window.BuddyFaceReduced = reduced;
})();
