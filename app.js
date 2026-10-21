(() => {
  "use strict";

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = matchMedia("(pointer: fine)").matches;

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

  // Header: solid after the hero starts scrolling, hidden while scrolling down.
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

  // ---------- every15min live terminal ----------
  const entries = [
    ["07:42", "inbox to 3. quiet morning.", "#wake"],
    ["08:18", "早上喝咖啡，把今天想记录的事写下来。", "#coffee"],
    ["09:30", "standup. pushed dashboard fix to staging.", "#work"],
    ["10:12", "rabbit hole on monospace CJK fallbacks.", "#yak"],
    ["11:20", "phone call w/ mom — 12 min.", ""],
    ["12:42", "午饭那一刻很适合变成一张小贴纸。", "#lunch"],
    ["14:08", "afternoon coffee, refactor plan on a napkin.", "#work"],
    ["15:06", "路上看到很好看的光，想把这一格留下来。", ""],
  ];
  const log = $("#term-log");
  const typing = $("#term-typing");
  const strip = $("#term-strip");
  const count = $("#t-count");
  const next = $("#t-next");
  const hours = new Set();

  function renderStrip() {
    let out = "";
    for (let h = 0; h < 24; h++) out += hours.has(h) ? "<b>▆</b>" : "·";
    strip.innerHTML = out;
  }

  function entryHtml([t, text, tag]) {
    const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
    return `<span class="tm">${t}</span><span>${esc(text)}${tag ? `<span class="tag">${tag}</span>` : ""}</span>`;
  }

  function staticTerminal() {
    entries.forEach((e) => {
      const li = document.createElement("li");
      li.innerHTML = entryHtml(e);
      $("#term-log").append(li);
      hours.add(parseInt(e[0], 10));
    });
    $("#t-count").textContent = entries.length;
    renderStrip();
  }

  if (reduced) {
    $$(".pills i").forEach((p) => p.classList.add("on"));
    $("#safe-days").textContent = "126";
    $("#ring-fg").style.strokeDashoffset = 540.4 * (1 - 126 / 180);
    staticTerminal();
    return;
  }

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
      for (let x = gap / 2; x < width; x += gap)
        dots.push({ ox: x, oy: y, x, y });
  }

  function drawDots() {
    if (heroVisible) {
      const { width, height } = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, width, height);
      for (const d of dots) {
        const dx = d.ox - mouse.x;
        const dy = d.oy - mouse.y;
        const dist = Math.hypot(dx, dy);
        const r = 150;
        let tx = d.ox;
        let ty = d.oy;
        let k = 0;
        if (dist < r) {
          k = 1 - dist / r;
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

  // ---------- Floating icons: cursor parallax + scroll drift ----------
  const icons = $$(".fi");
  let px = 0;
  let py = 0;
  let cx = 0;
  let cy = 0;
  addEventListener("pointermove", (e) => {
    px = (e.clientX / innerWidth - 0.5) * 2;
    py = (e.clientY / innerHeight - 0.5) * 2;
  });
  (function floatLoop() {
    cx += (px - cx) * 0.06;
    cy += (py - cy) * 0.06;
    const s = Math.min(scrollY / innerHeight, 1.2);
    icons.forEach((img, i) => {
      const depth = parseFloat(img.dataset.depth);
      const side = i % 2 ? 1 : -1;
      img.style.transform = `translate3d(${cx * depth * 40 + side * s * 160 * depth}px, ${
        cy * depth * 40 - s * 260 * depth
      }px, 0) scale(${1 + s * 0.25 * depth})`;
      img.style.opacity = String(1 - s * 0.9);
    });
    requestAnimationFrame(floatLoop);
  })();

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

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  let termStarted = false;

  async function runTerminal() {
    for (;;) {
      log.innerHTML = "";
      hours.clear();
      renderStrip();
      count.textContent = "0";
      let prev = null;
      for (const [i, e] of entries.entries()) {
        const line = e[1] + (e[2] ? " " + e[2] : "");
        for (let c = 1; c <= line.length; c++) {
          typing.textContent = line.slice(0, c);
          await sleep(18 + Math.random() * 32);
        }
        await sleep(380);
        typing.textContent = "";
        const minutes = (s) => parseInt(s, 10) * 60 + parseInt(s.slice(3), 10);
        if (prev && minutes(e[0]) - minutes(prev) > 45) {
          const gap = document.createElement("li");
          const m = minutes(e[0]) - minutes(prev);
          gap.className = "gap";
          gap.textContent = `gap ${Math.floor(m / 60)}h${String(m % 60).padStart(2, "0")}m`;
          log.append(gap);
        }
        const li = document.createElement("li");
        li.innerHTML = entryHtml(e);
        log.append(li);
        while (log.children.length > 9) log.firstElementChild.remove();
        prev = e[0];
        hours.add(parseInt(e[0], 10));
        renderStrip();
        count.textContent = String(i + 1);
        const nm = minutes(e[0]) + 15 - (minutes(e[0]) % 15);
        next.textContent = `${String(Math.floor(nm / 60)).padStart(2, "0")}:${String(nm % 60).padStart(2, "0")}`;
        await sleep(900);
      }
      await sleep(3000);
    }
  }

  renderStrip();
  new IntersectionObserver(([e]) => {
    if (e.isIntersecting && !termStarted) {
      termStarted = true;
      runTerminal();
    }
  }, { threshold: 0.3 }).observe($(".term"));

  // ---------- Sticky screenshot showcase ----------
  const showcase = $("#showcase");
  const shots = $$(".shot");
  const steps = $$("#steps li");
  const phone = $("#phone");
  function onShowcase() {
    if (innerWidth <= 900) return;
    const r = showcase.getBoundingClientRect();
    const total = r.height - innerHeight;
    const p = Math.min(Math.max(-r.top / total, 0), 0.999);
    const idx = Math.floor(p * shots.length);
    shots.forEach((s, i) => s.classList.toggle("is-on", i === idx));
    steps.forEach((s, i) => s.classList.toggle("is-on", i === idx));
    phone.style.setProperty("--ry", `${-14 + p * 28}deg`);
    phone.style.setProperty("--rx", `${6 - p * 6}deg`);
  }
  addEventListener("scroll", onShowcase, { passive: true });
  onShowcase();

  // ---------- Goldie: counter, ring, pills, icon follows cursor ----------
  const card = $("#goldie-card");
  new IntersectionObserver(([e], obs) => {
    if (!e.isIntersecting) return;
    obs.disconnect();
    const target = 126;
    $("#ring-fg").style.strokeDashoffset = 540.4 * (1 - target / 180);
    const start = performance.now();
    (function tick(now) {
      const t = Math.min((now - start) / 2000, 1);
      $("#safe-days").textContent = Math.round(target * (1 - Math.pow(1 - t, 3)));
      if (t < 1) requestAnimationFrame(tick);
    })(start);
    const pills = $$(".pills i");
    const taken = [0, 1, 2, 3, 4, 5, 7, 8, 9, 10, 11];
    taken.forEach((n, k) => setTimeout(() => pills[n].classList.add("on"), 400 + k * 110));
  }, { threshold: 0.4 }).observe(card);

  const gIcon = $("#goldie-icon");
  const goldie = $("#goldie");
  if (finePointer) {
    goldie.addEventListener("pointermove", (e) => {
      const r = gIcon.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) / innerWidth;
      const dy = (e.clientY - (r.top + r.height / 2)) / innerHeight;
      gIcon.style.transform = `translate(${dx * 30}px, ${dy * 30}px) rotate(${dx * 18}deg)`;
    });
    goldie.addEventListener("pointerleave", () => (gIcon.style.transform = ""));
  }

  // ---------- Spotlight + tilt cards ----------
  if (finePointer) {
    $$(".spot").forEach((card) => {
      card.addEventListener("pointermove", (e) => {
        const r = card.getBoundingClientRect();
        const x = e.clientX - r.left;
        const y = e.clientY - r.top;
        card.style.setProperty("--x", `${x}px`);
        card.style.setProperty("--y", `${y}px`);
        card.style.setProperty("--ty", `${(x / r.width - 0.5) * 8}deg`);
        card.style.setProperty("--tx", `${(0.5 - y / r.height) * 8}deg`);
      });
      card.addEventListener("pointerleave", () => {
        card.style.setProperty("--tx", "0deg");
        card.style.setProperty("--ty", "0deg");
      });
    });
  }
})();
