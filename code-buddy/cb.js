// Code Buddy product page: every demo is driven by the app's own face.
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const zh = document.documentElement.lang.startsWith("zh");
  const reduced = window.BuddyFaceReduced;
  const Face = window.BuddyFace;
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  document.documentElement.classList.add("js");

  const T = zh
    ? {
        state: { idle: "待机", working: "干活", waiting: "等你", done: "完成", error: "出错", sleep: "睡觉" },
        hero: [
          ["working", "干活 · Claude Code · buddy"],
          ["waiting", "等你确认 · Claude Code · buddy"],
          ["working", "干活 · Claude Code · buddy"],
          ["done", "完成 · Claude Code · buddy"],
          ["idle", "待机"],
        ],
        pick: (a, s) => `${a} ${s === "waiting" ? "在等你" : s === "done" ? "做完了" : s === "error" ? "出错了" : s === "working" ? "在干活" : "没动静"}`,
        busy: (n) => `${n} 个在忙`,
        captions: {
          working: "助手在读代码、改代码。你可以去干别的。",
          waiting: "它停下来等你批准，小圆脸马上抬头看你。",
          done: "这一轮做完了，回来看结果。",
          idle: "没事的时候，它就安静地待着。",
        },
        term: [
          ["cmd", "把设置页加上深色模式"],
          ["run", "读取 src/settings.tsx", "working"],
          ["run", "修改 src/theme.ts"],
          ["ask", "允许修改 src/theme.ts 吗？ 1. 允许  2. 拒绝", "waiting"],
          ["you", "1", "working"],
          ["run", "运行 npm test"],
          ["ok", "✓ 12 个测试通过。完成。", "done"],
        ],
        periods: ["今天", "7 天", "30 天"],
      }
    : {
        state: { idle: "Idle", working: "Working", waiting: "Waiting", done: "Done", error: "Error", sleep: "Asleep" },
        hero: [
          ["working", "Working · Claude Code · buddy"],
          ["waiting", "Waiting for you · Claude Code · buddy"],
          ["working", "Working · Claude Code · buddy"],
          ["done", "Done · Claude Code · buddy"],
          ["idle", "Idle"],
        ],
        pick: (a, s) => `${a} ${s === "waiting" ? "needs you" : s === "done" ? "is done" : s === "error" ? "hit an error" : s === "working" ? "is working" : "is idle"}`,
        busy: (n) => `${n} busy`,
        captions: {
          working: "The agent is reading and editing code. Go do something else.",
          waiting: "It stops to ask for approval, and the face looks right up at you.",
          done: "The turn is finished. Come back and look.",
          idle: "When nothing is going on, it just hangs out.",
        },
        term: [
          ["cmd", "Add dark mode to the settings page"],
          ["run", "Read src/settings.tsx", "working"],
          ["run", "Edit src/theme.ts"],
          ["ask", "Allow edit to src/theme.ts?  1. Yes  2. No", "waiting"],
          ["you", "1", "working"],
          ["run", "Run npm test"],
          ["ok", "✓ 12 tests passed. Done.", "done"],
        ],
        periods: ["Today", "7 days", "30 days"],
      };

  // ---------- one animation loop for every face on screen ----------
  const faces = [];
  const visible = new Set();
  const addFace = (svg, opts) => {
    const f = new Face(svg, opts);
    f.el = svg;
    faces.push(f);
    io.observe(svg);
    return f;
  };
  const io = new IntersectionObserver((es) => es.forEach((e) => (e.isIntersecting ? visible.add(e.target) : visible.delete(e.target))), { rootMargin: "80px" });
  let last = performance.now();
  const tick = (now) => {
    const dt = Math.min(0.033, (now - last) / 1000);
    last = now;
    const t = now / 1000;
    for (const f of faces) if (visible.has(f.el)) f.step(t, dt);
    requestAnimationFrame(tick);
  };
  const settle = () => faces.forEach((f) => { for (let i = 0; i < 40; i++) f.step(i * 0.03, 0.03); });

  // Run a looping demo only while it is on screen.
  function loop(el, fn) {
    let on = false, running = false;
    new IntersectionObserver(([e]) => {
      on = e.isIntersecting;
      if (on && !running) {
        running = true;
        fn(() => on).finally(() => (running = false));
      }
    }, { threshold: 0.25 }).observe(el);
  }

  // ---------- reveal ----------
  const rio = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); rio.unobserve(e.target); } }), { threshold: 0.12 });
  $$(".cb-reveal").forEach((el) => rio.observe(el));

  // ---------- hero ----------
  const hero = $("#cb-hero-mac");
  const heroFace = addFace($(".big-face", hero));
  const heroIcon = addFace($(".mb-buddy svg", hero), { template: "#e7e6e1" });
  const heroPill = $(".cb-pill span", hero);
  const setHero = ([s, text]) => {
    hero.className = `cb-mac st-${s}`;
    heroFace.set(s);
    heroIcon.set(s);
    heroPill.textContent = text;
  };
  if (reduced) setHero(T.hero[1]);
  else
    loop(hero, async (alive) => {
      const hold = [3600, 3200, 2400, 3000, 2600];
      while (alive()) for (let i = 0; i < T.hero.length && alive(); i++) { setHero(T.hero[i]); await sleep(hold[i]); }
    });

  // ---------- terminal and face ----------
  const turn = $("#cb-turn");
  const termList = $("ol", turn);
  const turnFace = addFace($(".cb-watch .face", turn));
  const caption = $(".cb-watch p", turn);
  const setTurn = (s) => { turnFace.set(s); caption.textContent = T.captions[s]; };
  const line = (kind, text) => {
    const li = document.createElement("li");
    if (kind === "cmd") li.innerHTML = `<span class="p">&gt;</span> <span class="typed"></span>`;
    else if (kind === "run") li.innerHTML = `<span class="p">⏺</span> <span class="dim">${text}</span>`;
    else if (kind === "ask") li.innerHTML = `<span class="ask">${text}</span>`;
    else if (kind === "you") li.innerHTML = `<span class="p">&gt;</span> <span class="typed"></span>`;
    else li.innerHTML = `<span class="ok">${text}</span>`;
    termList.appendChild(li);
    return li;
  };
  const type = async (el, text, alive) => {
    const caret = document.createElement("span");
    caret.className = "caret";
    el.after(caret);
    for (const ch of text) { if (!alive()) break; el.textContent += ch; await sleep(zh ? 90 : 45); }
    caret.remove();
  };
  if (reduced) {
    T.term.forEach(([k, txt]) => { const li = line(k, txt); const ty = $(".typed", li); if (ty) ty.textContent = txt; });
    setTurn("done");
  } else
    loop(turn, async (alive) => {
      while (alive()) {
        termList.innerHTML = "";
        setTurn("idle");
        await sleep(900);
        for (const [kind, text, state] of T.term) {
          if (!alive()) return;
          const li = line(kind, text);
          if (kind === "cmd" || kind === "you") await type($(".typed", li), text, alive);
          if (state) setTurn(state);
          await sleep(kind === "ask" ? 3200 : kind === "ok" ? 3600 : 1300);
        }
      }
    });

  // ---------- several agents ----------
  const ag = $("#cb-agents");
  const agFace = addFace($(".who .face", ag));
  const agWhy = $(".who .why", ag);
  const agBusy = $(".busy", ag);
  const agIcon = addFace($(".mb-buddy svg", ag), { template: "#e7e6e1" });
  const rows = $$(".agent-row", ag);
  const RANK = { waiting: 5, error: 4, done: 3, working: 2, idle: 1, sleep: 0 };
  // states for Claude Code, Grok, Cursor, Codex at each beat
  const beats = [
    ["working", "working", "done", "idle"],
    ["working", "waiting", "done", "idle"],
    ["working", "working", "idle", "working"],
    ["done", "working", "idle", "working"],
    ["idle", "working", "working", "waiting"],
    ["working", "done", "working", "working"],
  ];
  const showBeat = (b) => {
    let pick = 0;
    b.forEach((s, i) => {
      const r = rows[i];
      r.className = `agent-row st-${s}`;
      $("span", r).textContent = `${T.state[s]} · ${r.dataset.project}`;
      if (RANK[s] > RANK[b[pick]]) pick = i;
    });
    rows[pick].classList.add("pick");
    agFace.set(b[pick]);
    agIcon.set(b[pick]);
    agWhy.textContent = T.pick(rows[pick].dataset.name, b[pick]);
    agBusy.textContent = T.busy(b.filter((s) => s === "working" || s === "waiting").length);
  };
  if (reduced) showBeat(beats[1]);
  else loop(ag, async (alive) => { while (alive()) for (const b of beats) { if (!alive()) return; showBeat(b); await sleep(2600); } });

  // ---------- six faces ----------
  const six = $$(".cb-faces li").map((li) => {
    const f = addFace($(".face", li));
    f.set(li.dataset.state);
    return [f, li.dataset.state];
  });
  if (!reduced)
    setInterval(() => six.forEach(([f, s]) => { if (s === "done" || s === "error") { f.set("idle"); setTimeout(() => f.set(s), 400); } }), 5200);

  // ---------- usage ----------
  const us = $("#cb-usage");
  const DATA = [
    { spend: 18.62, split: [17.32, 1.3, 0], tokens: "25.85M", req: "1,153", cache: "93%", bars: [40, 8, 3, 38, 66, 44, 72] },
    { spend: 96.4, split: [88.1, 8.3, 0], tokens: "141.2M", req: "6,830", cache: "91%", bars: [52, 30, 61, 44, 70, 58, 80] },
    { spend: 342.75, split: [310.2, 31.55, 1], tokens: "512.6M", req: "24,910", cache: "92%", bars: [60, 72, 55, 80, 66, 74, 90] },
  ];
  const money = (v) => "$" + v.toFixed(2);
  const countTo = async (el, to) => {
    const from = parseFloat(el.textContent.replace(/[^0-9.]/g, "")) || 0;
    const n = 24;
    for (let i = 1; i <= n; i++) { el.textContent = money(from + ((to - from) * i) / n); await sleep(22); }
  };
  const showPeriod = (k) => {
    const d = DATA[k];
    $$(".cb-tabs span", us).forEach((s, i) => s.classList.toggle("on", i === k));
    if (reduced) $(".cb-spend b", us).textContent = money(d.spend);
    else countTo($(".cb-spend b", us), d.spend);
    $(".cb-by-tool", us).textContent = `Claude Code ${money(d.split[0])} · Codex ${money(d.split[1])} · Grok ${money(d.split[2])}`;
    $$(".cb-bars i", us).forEach((b, i) => (b.style.height = d.bars[i] + "%"));
    const dd = $$(".cb-stats dd", us);
    dd[0].textContent = d.tokens;
    dd[1].textContent = d.req;
    dd[2].textContent = d.cache;
  };
  const meters = $$("#cb-meters .track i");
  const fillMeters = () => meters.forEach((m) => (m.style.width = m.dataset.v + "%"));
  if (reduced) { showPeriod(0); fillMeters(); }
  else {
    loop(us, async (alive) => { while (alive()) for (let k = 0; k < 3; k++) { if (!alive()) return; showPeriod(k); await sleep(3400); } });
    new IntersectionObserver(([e], o) => { if (e.isIntersecting) { fillMeters(); o.disconnect(); } }, { threshold: 0.3 }).observe($("#cb-meters"));
  }

  // ---------- styles and the closing face ----------
  $$(".cb-style .face").forEach((svg) => addFace(svg).set(svg.dataset.state || "working"));
  const fin = addFace($(".cb-final .face"));
  fin.set("idle");
  new IntersectionObserver(([e]) => { if (e.isIntersecting) { fin.set("done"); setTimeout(() => fin.set("idle"), 2600); } }, { threshold: 0.6 }).observe($(".cb-final .face"));

  if (reduced) settle();
  else requestAnimationFrame(tick);
})();
