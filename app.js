(() => {
  "use strict";

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = matchMedia("(pointer: fine)").matches;
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  // Split headings into characters so they can rise in one by one.
  $$("[data-split], #wordmark").forEach((el) => {
    const text = el.textContent;
    el.setAttribute("aria-label", text);
    el.innerHTML = [...text]
      .map((c, i) => `<span class="ch" aria-hidden="true" style="--i:${i}">${c}</span>`)
      .join("");
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
  const cbText = zh
    ? { working: "正在工作", turn: "轮到你确认", ok: "已批准", handoff: "上下文快满了，准备交接", idle: "空闲" }
    : { working: "Working", turn: "Your turn", ok: "Approved", handoff: "Context almost full, handing off", idle: "Idle" };

  async function codeBuddy(el, alive) {
    const status = $("#cb-status", el);
    const ctx = $("#cb-ctx", el);
    const label = $("#cb-label", el);
    const ring = $("#cb-ring", el);
    const setCtx = (pct) => {
      ring.style.strokeDashoffset = String(578 * (1 - pct / 100));
      ctx.textContent = `CTX ${pct}%`;
    };
    const state = (name, menu, text) => {
      el.className = `demo cb st-${name}`;
      status.textContent = menu;
      label.textContent = text;
    };
    if (reduced) {
      state("alert", "Claude Code · Your turn", cbText.turn);
      setCtx(58);
      return;
    }
    while (alive()) {
      state("focus", "Claude Code · working", cbText.working);
      setCtx(34);
      await sleep(400);
      setCtx(58);
      await sleep(2200);
      if (!alive()) return;
      state("alert", "Claude Code · Your turn", cbText.turn);
      await sleep(2000);
      el.classList.add("tap");
      await sleep(350);
      state("happy", "Claude Code · approved", cbText.ok);
      await sleep(1500);
      if (!alive()) return;
      state("focus", "Claude Code · working", cbText.working);
      setCtx(86);
      await sleep(2000);
      state("handoff", "Claude Code · working", cbText.handoff);
      el.classList.add("st-focus");
      await sleep(2200);
      if (!alive()) return;
      state("sleep", "Claude Code · idle", cbText.idle);
      setCtx(12);
      await sleep(2400);
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
