// Speechless product page: hold the pad to play the example. It is a drawing
// that types ready-made sentences. It never asks for the microphone.
(() => {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const hero = $("#sp-hero");
  const pad = $("#sp-pad");
  const text = $("#sp-text");
  if (!hero || !window.SpeechlessPad) return;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  document.documentElement.classList.add("js");

  const dots = new window.SpeechlessPad($("canvas", pad));
  const lines = JSON.parse(text.dataset.lines);
  let next = 0, run = 0, pressed = false;

  const step = (s) => (s ? (hero.dataset.step = s) : delete hero.dataset.step);
  const show = (i) => {
    text.textContent = lines[i].text;
    text.lang = lines[i].lang || document.documentElement.lang;
  };

  // Down: the pad lights up. Up: it works for a moment, then the text is in.
  function down(x, y) {
    run++;
    const me = run;
    pressed = true;
    text.textContent = "";
    dots.ripple(x, y);
    dots.set("listening");
    step("hold");
    setTimeout(() => run === me && pressed && step("talk"), 450);
  }
  async function up() {
    if (!pressed) return;
    pressed = false;
    const me = run;
    dots.set("working");
    step("go");
    await sleep(reduced ? 0 : 900);
    if (run !== me) return;
    show(next);
    next = (next + 1) % lines.length;
    dots.set("idle");
    await sleep(1400);
    if (run === me) step("");
  }
  async function play(ms) {
    const r = pad.getBoundingClientRect();
    down(r.width / 2, r.height / 2);
    const me = run;
    await sleep(reduced ? 0 : ms);
    if (run === me) up();
  }

  pad.addEventListener("pointerdown", (e) => {
    if (e.button) return;
    const r = pad.getBoundingClientRect();
    if (reduced) return;
    try { pad.setPointerCapture(e.pointerId); } catch {}
    down(e.clientX - r.left, e.clientY - r.top);
  });
  for (const ev of ["pointerup", "pointercancel", "lostpointercapture"]) pad.addEventListener(ev, up);
  pad.addEventListener("contextmenu", (e) => e.preventDefault());
  // Keyboard, VoiceOver, or reduced motion: one press plays it through.
  pad.addEventListener("click", (e) => {
    if (e.detail === 0 || reduced) play(1800);
  });

  // Once by itself, then it waits for you.
  if (!reduced)
    new IntersectionObserver(([e], o) => {
      if (!e.isIntersecting) return;
      o.disconnect();
      setTimeout(() => run === 0 && play(2600), 900);
    }, { threshold: 0.4 }).observe(pad);
})();
