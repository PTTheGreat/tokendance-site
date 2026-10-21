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
  const e15Lines = [
    ["09:30", "standup, pushed fix.", "#work"],
    ["10:12", "rabbit hole on CJK fonts.", "#yak"],
    ["12:42", "午饭，顺便散步。", "#lunch"],
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
    const watch = $("#g-watch");
    const chips = $$(".s1 .chips span");
    const saved = $(".s1 .saved");
    const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
    if (reduced) {
      watch.textContent = fmt(94);
      chips.forEach((c) => c.classList.add("on"));
      saved.classList.add("on");
      return;
    }
    while (alive()) {
      chips.forEach((c) => c.classList.remove("on"));
      saved.classList.remove("on");
      for (let s = 0; s <= 94 && alive(); s += 2) {
        watch.textContent = fmt(s);
        if (s === 30) chips[0].classList.add("on");
        if (s === 52) chips[1].classList.add("on");
        if (s === 70) chips[2].classList.add("on");
        if (s === 86) chips[3].classList.add("on");
        await sleep(45);
      }
      if (!alive()) return;
      saved.classList.add("on");
      await sleep(2600);
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
    e15: { 1: e15Typing },
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
  async function codeBuddy(el, alive) {
    const q = $("#cb-typing", el);
    const ask = "把这个日期解析改成 ISO 8601";
    while (alive()) {
      el.className = "demo cb";
      q.textContent = "";
      await sleep(700);
      el.classList.add("aim");
      await sleep(1000);
      el.classList.add("click");
      await sleep(200);
      el.classList.remove("click");
      el.classList.add("open");
      await sleep(500);
      for (let c = 1; c <= ask.length && alive(); c++) {
        q.textContent = ask.slice(0, c);
        await sleep(70);
      }
      await sleep(400);
      el.classList.add("code");
      await sleep(1400);
      el.classList.add("copied");
      await sleep(1200);
      el.classList.remove("open");
      el.classList.add("fixed");
      await sleep(2200);
    }
  }

  async function adBlock(el, alive) {
    const count = $("#ab-count", el);
    const ads = $$(".ad", el);
    while (alive()) {
      el.className = "demo ab";
      ads.forEach((a) => a.classList.remove("zap"));
      count.textContent = "已拦截 0";
      await sleep(600);
      el.classList.add("ads");
      await sleep(900);
      el.classList.add("popup");
      await sleep(1300);
      el.classList.add("scan");
      const targets = [ads[0], null, ads[1]];
      let n = 0;
      for (const t of targets) {
        await sleep(380);
        if (!alive()) return;
        if (t) t.classList.add("zap");
        else el.classList.remove("popup");
        count.textContent = `已拦截 ${++n}`;
        count.classList.add("bump");
        setTimeout(() => count.classList.remove("bump"), 250);
      }
      await sleep(3200);
    }
  }

  const demos = { codebuddy: codeBuddy, adblock: adBlock };
  $$("[data-demo]").forEach((el) => {
    const run = runner();
    if (reduced) {
      if (el.dataset.demo === "codebuddy") {
        el.classList.add("open", "code", "copied");
        $("#cb-typing", el).textContent = "把这个日期解析改成 ISO 8601";
      } else {
        $("#ab-count", el).textContent = "已拦截 3";
      }
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
