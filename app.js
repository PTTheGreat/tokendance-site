(() => {
  "use strict";

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = matchMedia("(pointer: fine)").matches;
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  // Split headings into characters so they can rise in one by one. Characters
  // are grouped into unbreakable words so lines only wrap at spaces (or between
  // CJK characters, which may break anywhere).
  $$("[data-split], #wordmark").forEach((el) => {
    const text = el.textContent.trim();
    el.setAttribute("aria-label", text);
    let i = 0;
    const ch = (c) => `<span class="ch" style="--i:${i++}">${c}</span>`;
    const word = (w) => `<span class="w">${[...w].map(ch).join("")}</span>`;
    el.innerHTML = `<span aria-hidden="true">${text
      .split(/(\s+)/)
      .map((t) => {
        if (!t) return "";
        if (/^\s+$/.test(t)) return " ";
        return /[\u3000-\u9fff\uff00-\uffef]/.test(t) ? [...t].map(word).join("") : word(t);
      })
      .join("")}</span>`;
  });

  // Reveal on scroll.
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add("in");
        io.unobserve(e.target);
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
  );
  $$("[data-reveal], [data-split]").forEach((el) => io.observe(el));

  // Header: solid once scrolled, hidden while scrolling down.
  const header = $("#site-header");
  let lastY = scrollY;
  const onHeader = () => {
    const y = scrollY;
    header.classList.toggle("scrolled", y > 20);
    header.classList.toggle("hidden", y > 400 && y > lastY);
    lastY = y;
  };
  addEventListener("scroll", onHeader, { passive: true });
  onHeader();

  // Each stage is drawn on a fixed 440×500 canvas and scaled to its column.
  const fitStage = (stage) => stage.style.setProperty("--s", String(stage.clientWidth / 440));
  const ro = new ResizeObserver((list) => list.forEach((e) => fitStage(e.target)));
  $$(".stage").forEach((st) => {
    fitStage(st);
    ro.observe(st);
  });
  $$(".cal i").forEach((c, k) => c.style.setProperty("--k", k));

  // Runs `fn` with a token that goes stale as soon as another run starts.
  function runner() {
    let id = 0;
    return (fn) => {
      const mine = ++id;
      fn(() => mine === id);
    };
  }

  // ---------- Scene scripts that need JavaScript ----------
  const zh = document.documentElement.lang.startsWith("zh");
  const e15Lines = [
    ["09:30", "standup, pushed fix.", "#work"],
    ["10:12", "rabbit hole on CJK fonts.", "#yak"],
    ["12:42", zh ? "午饭，顺便散步。" : "lunch, then a walk.", "#lunch"],
    ["14:08", "refactor plan on a napkin.", "#work"],
  ];

  function e15Entry([t, text, tag]) {
    const li = document.createElement("li");
    li.innerHTML = `<span class="tm">${t}</span><span>${text}${tag ? `<u>${tag}</u>` : ""}</span>`;
    return li;
  }

  async function e15Typing(alive) {
    const log = $("#e15-log");
    const typing = $("#e15-typing");
    const count = $("#e15-count");
    if (reduced) {
      log.replaceChildren(...e15Lines.map(e15Entry));
      count.textContent = e15Lines.length;
      return;
    }
    while (alive()) {
      log.replaceChildren(e15Entry(["07:42", "inbox to 3. quiet morning.", "#wake"]));
      count.textContent = "1";
      for (const [i, e] of e15Lines.entries()) {
        const line = e[1] + (e[2] ? " " + e[2] : "");
        for (let c = 1; c <= line.length; c++) {
          if (!alive()) return;
          typing.textContent = line.slice(0, c);
          await sleep(35 + Math.random() * 45);
        }
        await sleep(350);
        if (!alive()) return;
        typing.textContent = "";
        log.append(e15Entry(e));
        count.textContent = String(i + 2);
        await sleep(700);
      }
      await sleep(1600);
    }
  }

  async function goldieSeizure(alive) {
    const wizard = zh
      ? [
          ["发作时间", ["刚刚", "今天早些时候", "选择时间"], 0],
          ["严重程度", ["轻微", "中等", "严重"], 1],
          ["发作时长", ["< 1 分钟", "1–2 分钟", "2–5 分钟", "> 5 分钟"], 1],
          ["可能诱因", ["睡眠不足", "漏服药物", "压力", "强光", "饮酒"], 0],
          ["意识状态", ["意识保持", "意识丧失"], 1],
        ]
      : [
          ["When did it happen?", ["Just now", "Earlier today", "Pick a time"], 0],
          ["How severe was it?", ["Mild", "Moderate", "Severe"], 1],
          ["How long did it last?", ["< 1 min", "1–2 min", "2–5 min", "> 5 min"], 1],
          ["Possible triggers", ["Lack of sleep", "Missed dose", "Stress", "Bright light", "Alcohol"], 0],
          ["Were you conscious?", ["Conscious", "Lost consciousness"], 1],
        ];
    const step = $("#g-step");
    const chips = $("#g-chips");
    const bars = $$(".s1 .wiz-bar i");
    const saved = $(".s1 .saved");
    const show = ([label, options, pick], i, chosen) => {
      step.textContent = label;
      step.style.animation = "none";
      void step.offsetWidth;
      step.style.animation = "";
      chips.innerHTML = options.map((o, k) => `<span class="${chosen && k === pick ? "on" : ""}">${o}</span>`).join("");
      bars.forEach((b, k) => b.classList.toggle("on", k <= i));
    };
    if (reduced) {
      show(wizard[4], 4, true);
      saved.classList.add("on");
      return;
    }
    while (alive()) {
      saved.classList.remove("on");
      for (const [i, w] of wizard.entries()) {
        if (!alive()) return;
        show(w, i, false);
        await sleep(650);
        if (!alive()) return;
        chips.children[w[2]].classList.add("on");
        await sleep(650);
      }
      saved.classList.add("on");
      await sleep(2200);
    }
  }

  async function e15Rhythm(alive) {
    const left = $("#e15-left");
    let s = 110;
    while (alive()) {
      left.textContent = `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
      if (reduced) return;
      await sleep(1000);
      s = s > 0 ? s - 1 : 899;
    }
  }

  function goldieDays(alive) {
    const out = $("#g-days");
    if (reduced) {
      out.textContent = "126";
      return;
    }
    const start = performance.now();
    (function tick(now) {
      if (!alive()) return;
      const t = Math.min((now - start - 300) / 2000, 1);
      out.textContent = String(Math.max(0, Math.round(126 * (1 - Math.pow(1 - Math.max(t, 0), 3)))));
      if (t < 1) requestAnimationFrame(tick);
    })(start);
  }

  const sceneScripts = {
    e15: { 0: e15Rhythm, 1: e15Typing },
    goldie: { 1: goldieSeizure, 2: goldieDays },
  };

  // ---------- Scroll stories: progress through the track picks the scene ----------
  const stories = $$("[data-story]").map((section) => ({
    name: section.dataset.story,
    track: $(".story-track", section),
    box: $(".stage-box", section),
    steps: $$(".story-steps li", section),
    dots: $$(".story-dots i", section),
    scene: -1,
    run: runner(),
  }));

  function onStories() {
    for (const st of stories) {
      const r = st.track.getBoundingClientRect();
      const n = st.steps.length;
      const p = Math.min(Math.max(-r.top / (r.height - innerHeight), 0), 0.999);
      const idx = Math.min(n - 1, Math.floor(p * n));
      if (idx === st.scene) continue;
      st.scene = idx;
      st.box.dataset.scene = String(idx);
      st.steps.forEach((li, i) => li.classList.toggle("is-on", i === idx));
      st.dots.forEach((d, i) => d.classList.toggle("is-on", i === idx));
      const script = sceneScripts[st.name][idx];
      st.run(script ? (alive) => script(alive) : () => {});
    }
  }
  addEventListener("scroll", onStories, { passive: true });
  addEventListener("resize", onStories);
  onStories();

  // ---------- Looping demos for the apps still in development ----------
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
    small: [0, 0, 0, 0, 0, 0, 0.185, 0],
    happy: [-0.2, 0.08, 0, -0.1, 0.2, 0.08, 0.085, 1],
    sleepy: [-0.2, -0.03, 0, 0.07, 0.2, -0.03, 0.075, 1],
    cross: [-0.12, -0.16, 0.2, 0, -0.12, 0.16, 0.08, 0],
  };
  const DOTS = ["round", "wide", "small"];
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
      if (key === "working") { this.variant = "read"; this.variantNext = rand(5, 7); }
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
            this.variantNext = this.variant === "read" ? rand(5, 8) : rand(2.6, 3.6);
            this.doBlink();
          }
          if (this.variant === "read") {
            // scan a line left to right, snap back, next line a touch lower
            const line = 1.45, ph = (t % line) / line;
            const yaw = ph < 0.8 ? -20 + 38 * (ph / 0.8) : 18 - 38 * ((ph - 0.8) / 0.2);
            const tap = Math.abs(Math.sin(t * 9.5));
            P.yaw = yaw; P.pitch = 15 + tap * 3 + Math.floor((t / line) % 3) * 1.5; P.roll = yaw * 0.08;
            P.y = tap * 0.018;
            this.want("round");
          } else {
            P.yaw = Math.sin(t * 0.9) * 16; P.pitch = -20; P.roll = Math.sin(t * 0.9) * 6;
            this.want("small");
          }
          break;
        }
        case "waiting": {
          const ph = s % 2.0;
          P.pitch = -4; P.yaw = Math.sin(t * 0.7) * 5; P.roll = Math.sin(t * 0.7) * 3;
          if (ph < 0.12) { P.sx = 1.07; P.sy = 0.91; }
          else if (ph < 0.38) { P.y = -0.18; P.sx = 0.96; P.sy = 1.05; }
          else if (ph < 0.5) { P.sx = 1.05; P.sy = 0.95; }
          break;
        }
        case "done": {
          const loop = s % 3.4;
          const hop = (h) => {
            const ph = loop - h;
            if (ph < 0 || ph > 0.62) return;
            if (ph < 0.1) { P.sx = 1.09; P.sy = 0.89; }
            else if (ph < 0.38) { P.y = -0.28; P.sx = 0.95; P.sy = 1.07; }
            else { P.sx = 1.05; P.sy = 0.95; }
          };
          hop(0.05); hop(0.8);
          P.pitch = -10; P.roll = Math.sin(loop * 6) * 8 * Math.max(0, 1 - loop / 2.4);
          break;
        }
        case "error": {
          const loop = s % 4.5;
          if (loop < 0.8) P.yaw = Math.sin(loop * 34) * 20 * (1 - loop / 0.8);
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
      if (this.state !== "sleep" && this.state !== "done") {
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

  const cbText = zh
    ? { working: "正在工作", turn: "轮到你确认", ok: "已批准", handoff: "上下文快满了，准备交接", idle: "空闲" }
    : { working: "Working", turn: "Your turn", ok: "Approved", handoff: "Context almost full, handing off", idle: "Idle" };

  async function codeBuddy(el, alive) {
    const status = $("#cb-status", el);
    const ctx = $("#cb-ctx", el);
    const label = $("#cb-label", el);
    const ring = $("#cb-ring", el);
    if (!el.faces) el.faces = [new BuddyFace($(".cb-face", el)), new BuddyFace($(".cb-icon", el), { template: "#e7e6e1" })];
    const faces = el.faces;
    const setCtx = (pct) => {
      ring.style.strokeDashoffset = String(578 * (1 - pct / 100));
      ctx.textContent = `CTX ${pct}%`;
    };
    const state = (name, face, menu, text) => {
      el.className = `demo cb st-${name}`;
      faces.forEach((f) => f.set(face));
      status.textContent = menu;
      label.textContent = text;
    };
    if (reduced) {
      state("waiting", "waiting", "Claude Code · Your turn", cbText.turn);
      setCtx(58);
      faces.forEach((f) => f.step(0, 0.5));
      return;
    }
    let last = performance.now();
    const frame = (now) => {
      if (!alive()) return;
      const dt = Math.min(0.033, (now - last) / 1000);
      last = now;
      faces.forEach((f) => f.step(now / 1000, dt));
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
    while (alive()) {
      state("working", "working", "Claude Code · working", cbText.working);
      setCtx(34);
      await sleep(400);
      setCtx(58);
      await sleep(3200);
      if (!alive()) return;
      state("waiting", "waiting", "Claude Code · Your turn", cbText.turn);
      await sleep(2400);
      el.classList.add("tap");
      await sleep(350);
      state("done", "done", "Claude Code · approved", cbText.ok);
      await sleep(2200);
      if (!alive()) return;
      state("working", "working", "Claude Code · working", cbText.working);
      setCtx(86);
      await sleep(2400);
      state("handoff", "working", "Claude Code · working", cbText.handoff);
      await sleep(2400);
      if (!alive()) return;
      state("sleep", "sleep", "Claude Code · idle", cbText.idle);
      setCtx(12);
      await sleep(3200);
    }
  }

  const demos = { codebuddy: codeBuddy };
  $$("[data-demo]").forEach((el) => {
    const run = runner();
    if (reduced) {
      codeBuddy(el, () => true);
      return;
    }
    new IntersectionObserver(([e]) => {
      if (e.isIntersecting) run((alive) => demos[el.dataset.demo](el, alive));
      else run(() => {});
    }, { threshold: 0.35 }).observe(el);
  });

  if (reduced) return;

  // ---------- Hero dot field ----------
  const canvas = $("#dots");
  const ctx = canvas.getContext("2d");
  const hero = $(".hero");
  const mouse = { x: -9999, y: -9999 };
  let dots = [];
  let heroVisible = true;

  function sizeCanvas() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const { width, height } = hero.getBoundingClientRect();
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const gap = width < 640 ? 24 : 30;
    dots = [];
    for (let y = gap / 2; y < height; y += gap)
      for (let x = gap / 2; x < width; x += gap) dots.push({ ox: x, oy: y, x, y });
  }

  function drawDots() {
    if (heroVisible) {
      const { width, height } = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, width, height);
      for (const d of dots) {
        const dx = d.ox - mouse.x;
        const dy = d.oy - mouse.y;
        const dist = Math.hypot(dx, dy);
        let tx = d.ox;
        let ty = d.oy;
        let k = 0;
        if (dist < 150) {
          k = 1 - dist / 150;
          const push = k * k * 34;
          tx += (dx / (dist || 1)) * push;
          ty += (dy / (dist || 1)) * push;
        }
        d.x += (tx - d.x) * 0.12;
        d.y += (ty - d.y) * 0.12;
        ctx.fillStyle = k > 0 ? `rgba(17,17,19,${0.16 + k * 0.6})` : "rgba(17,17,19,0.14)";
        ctx.beginPath();
        ctx.arc(d.x, d.y, 1.2 + k * 1.6, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    requestAnimationFrame(drawDots);
  }

  new IntersectionObserver(([e]) => (heroVisible = e.isIntersecting)).observe(hero);
  addEventListener("resize", sizeCanvas);
  hero.addEventListener("pointermove", (e) => {
    const r = hero.getBoundingClientRect();
    mouse.x = e.clientX - r.left;
    mouse.y = e.clientY - r.top;
  });
  hero.addEventListener("pointerleave", () => {
    mouse.x = mouse.y = -9999;
  });
  sizeCanvas();
  drawDots();

  // ---------- Magnetic buttons ----------
  if (finePointer) {
    $$(".magnetic").forEach((btn) => {
      btn.addEventListener("pointermove", (e) => {
        const r = btn.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        btn.style.transform = `translate(${x * 0.25}px, ${y * 0.35}px)`;
      });
      btn.addEventListener("pointerleave", () => (btn.style.transform = ""));
    });
  }
})();
