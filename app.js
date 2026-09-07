(() => {
  "use strict";

  // Keep the region-neutral App Store address so visitors reach their local store.
  const residents = {
    lyrebird: {
      name: "琴鸟",
      role: "岛屿迎宾员",
      color: "#e5edd9",
      lines: [
        "欢迎来到 TokenDance！这里的每位居民，都来自生活里一个小小的需求。",
        "我听过什么就能唱什么，还会给旋律配一支舞。Token 和 Dance，就是这么来的。",
        "第一次来，可以先去记录花园或守护小屋。走累了，随时回来坐坐。",
      ],
      actions: [
        { label: "认识一位新朋友", action: "random" },
        { label: "看看我的护照", action: "passport" },
      ],
    },
    bee: {
      name: "蜜蜂",
      role: "every15min · 记录花园",
      color: "#f4e9c5",
      lines: [
        "嗡——欢迎来到记录花园。不必坚持写长日记，想起来时，记下一行就好。",
        "一天会慢慢攒成许多个十五分钟的小格子。回头看看，普通的日子也有自己的颜色。",
        "记录都留在你自己的设备里。我已经在 App Store 安家，可以随时带我回去啦。",
      ],
      actions: [
        {
          label: "App Store 下载 ↗",
          href: "https://apps.apple.com/app/id6801988119",
        },
        { label: "看看官网 ↗", href: "https://every15min.tokendance.life/" },
      ],
    },
    goldie: {
      name: "Goldie",
      role: "守守 · 守护小屋",
      color: "#f0e2ca",
      lines: [
        "汪！我是守守。我会帮你记住用药、发作、安全天数和复诊这些重要的小事。",
        "现实中的辅助犬也会陪伴癫痫朋友。我不替医生做决定，只把每天照顾好。",
        "资料不离开手机，也没有账号、广告和追踪。希望你在这里，感到一点安心。",
      ],
      actions: [
        {
          label: "认识守守 Goldie ↗",
          href: "https://goldie.tokendance.life/",
        },
        { label: "看看我的护照", action: "passport" },
      ],
    },
    otter: {
      name: "水獭",
      role: "Code Buddy · 代码工坊",
      color: "#e0eae5",
      lines: [
        "欢迎来工坊！我在做一个住在 macOS 菜单栏里的代码伙伴，伸手就能找到。",
        "零碎的代码小事可以交给我，让你的思路继续往前走。这颗蓝色代码石是我的好帮手。",
        "工坊还在打磨中。先盖一枚印章吧，等工具做好了，再请你回来试试。",
      ],
      actions: [
        { label: "认识一位新朋友", action: "random" },
        { label: "给园长写封信 ↗", href: "mailto:tonybingpoon@gmail.com" },
      ],
    },
    frog: {
      name: "青蛙",
      role: "广告拦截助手 · 清净池塘",
      color: "#e8edcf",
      lines: [
        "嘘——听听池塘的声音。广告、弹窗和追踪器这些烦人的飞虫，就交给我吧。",
        "我希望手机屏幕安静一点，把你的注意力，还给真正想看的内容。",
        "小屋还在搭建，广告拦截助手暂时没有开放。来都来了，一起在池塘边歇一会吧。",
      ],
      actions: [
        { label: "认识一位新朋友", action: "random" },
        { label: "看看我的护照", action: "passport" },
      ],
    },
  };
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];
  const keys = Object.keys(residents);
  const storageKey = "tokendance-stamps";
  const passport = $("#passport");
  const guide = $("#island-guide");
  let guideOpener;
  let visitingFromGuide = false;
  const next = $("#dialogue-next");
  const actions = $("#dialogue-actions");
  const tourButton = $("#tour-button");
  const soundButton = $("#sound-button");
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  let current = "lyrebird";
  let lineIndex = 0;
  let touring = false;
  let tourIndex = 0;
  let toastTimer;
  let passportOpener;
  let soundOn = false;
  let audio;
  let musicMaster;
  let musicTimer;
  let musicStep = 0;

  function readStamps() {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey));
      return Array.isArray(saved)
        ? [...new Set(saved.filter((id) => keys.includes(id)))]
        : [];
    } catch {
      return [];
    }
  }
  let stamps = readStamps();
  function saveStamps() {
    try {
      localStorage.setItem(storageKey, JSON.stringify(stamps));
    } catch {
      /* Browsing still works without storage. */
    }
  }
  function showToast(message) {
    clearTimeout(toastTimer);
    $("#toast").textContent = message;
    $("#toast").classList.add("show");
    toastTimer = setTimeout(() => $("#toast").classList.remove("show"), 3000);
  }
  function updatePassport() {
    $$(".stamp").forEach((stamp) => {
      const collected = stamps.includes(stamp.dataset.stamp);
      stamp.classList.toggle("is-collected", collected);
      stamp.querySelector("small").textContent = collected
        ? "已拜访 ✓"
        : "待拜访";
    });
    $("#stamp-count").textContent = `${stamps.length}/5`;
    $("#passport-progress").value = stamps.length;
    $("#passport-message").textContent =
      stamps.length === 5
        ? "全员见面完成！欢迎成为小岛的老朋友。"
        : `还有 ${5 - stamps.length} 位居民等着认识你。`;
    $("#reset-progress").disabled = stamps.length === 0;
  }
  function collect(id) {
    if (stamps.includes(id)) return;
    stamps.push(id);
    saveStamps();
    updatePassport();
    tone(720, 0.2);
    showToast(
      stamps.length === 5
        ? "五枚印章集齐了！小岛又多了一位老朋友。"
        : `收到「${residents[id].name}」的印章，已收集 ${stamps.length}/5`,
    );
  }
  function renderActions(items) {
    actions.replaceChildren();
    for (const item of items) {
      const element = document.createElement(item.href ? "a" : "button");
      element.textContent = item.label;
      if (item.href) {
        element.href = item.href;
        if (item.href.startsWith("https://")) {
          element.target = "_blank";
          element.rel = "noopener noreferrer";
        }
      } else {
        element.type = "button";
        element.dataset.action = item.action;
      }
      actions.append(element);
    }
  }
  function renderDialogue() {
    const resident = residents[current];
    $("#dialogue-name").textContent = resident.name;
    $("#dialogue-role").textContent = resident.role;
    $("#speaker-icon").setAttribute("href", `assets/icons.svg#${current}`);
    $("#speaker-avatar").style.background = resident.color;
    // Whole sentences keep screen readers from announcing every typed character.
    $("#dialogue-text").textContent = resident.lines[lineIndex];
    $("#dialogue-page").textContent = touring
      ? `散步第 ${tourIndex + 1} 站 / 5`
      : `${lineIndex + 1} / ${resident.lines.length}`;
    const lastLine = lineIndex === resident.lines.length - 1;
    next.hidden = lastLine && !touring;
    next.textContent =
      lastLine && touring
        ? tourIndex === keys.length - 1
          ? "完成散步 ✓"
          : "去下一站 ▸"
        : "下一句 ▸";
  }
  function focusDialogue() {
    const zone = $("#dialogue-zone");
    const rect = zone.getBoundingClientRect();
    zone.focus({ preventScroll: true });
    if (rect.bottom > innerHeight - 16 || rect.top < 12) {
      zone.scrollIntoView({
        behavior: reducedMotion.matches ? "instant" : "smooth",
        block: "center",
      });
    }
  }
  function visit(id, focus = true) {
    if (!residents[id]) return;
    current = id;
    lineIndex = 0;
    collect(id);
    $$(".map-spot").forEach((spot) => {
      const active = spot.dataset.resident === id;
      spot.classList.toggle("is-active", active);
      spot.setAttribute("aria-pressed", String(active));
    });
    renderActions(residents[id].actions);
    renderDialogue();
    tone(420, 0.12);
    if (focus) focusDialogue();
  }
  function stopTour() {
    touring = false;
    tourButton.setAttribute("aria-pressed", "false");
    tourButton.setAttribute("aria-label", "开始岛屿导览");
    tourButton.querySelector("span").textContent = "带我逛逛";
  }
  function randomResident() {
    stopTour();
    const unvisited = keys.filter(
      (id) => !stamps.includes(id) && id !== current,
    );
    const options = unvisited.length
      ? unvisited
      : keys.filter((id) => id !== current);
    visit(options[Math.floor(Math.random() * options.length)]);
  }
  $$("[data-resident]").forEach((element) =>
    element.addEventListener("click", () => {
      stopTour();
      if (guide.open) {
        visitingFromGuide = true;
        guide.close();
      }
      visit(element.dataset.resident);
    }),
  );
  function openGuide() {
    guideOpener = document.activeElement;
    guide.showModal();
    $("#guide-close").focus();
  }
  $("#guide-button").addEventListener("click", openGuide);
  $("#guide-close").addEventListener("click", () => guide.close());
  guide.addEventListener("close", () => {
    if (visitingFromGuide) {
      visitingFromGuide = false;
      $("#dialogue-zone").focus({ preventScroll: true });
    } else guideOpener?.focus({ preventScroll: true });
  });
  guide.addEventListener("click", (event) => {
    if (event.target !== guide) return;
    const rect = guide.getBoundingClientRect();
    if (
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom
    )
      guide.close();
  });
  $(".brand").addEventListener("click", (event) => {
    event.preventDefault();
    stopTour();
    visit("lyrebird");
  });
  next.addEventListener("click", () => {
    const lastLine = lineIndex === residents[current].lines.length - 1;
    if (lastLine && touring) {
      if (tourIndex < keys.length - 1) {
        tourIndex += 1;
        visit(keys[tourIndex], false);
      } else {
        stopTour();
        renderDialogue();
        showToast("散步结束啦。接下来，去喜欢的小屋坐坐吧。");
        actions.firstElementChild?.focus();
      }
      return;
    }
    if (lastLine) return;
    lineIndex += 1;
    renderDialogue();
    tone(500 + lineIndex * 70, 0.1);
    if (next.hidden) actions.firstElementChild?.focus();
  });
  tourButton.addEventListener("click", () => {
    if (touring) {
      stopTour();
      renderDialogue();
      showToast("导览已暂停，按自己的节奏逛逛吧。");
      return;
    }
    touring = true;
    tourIndex = 0;
    tourButton.setAttribute("aria-pressed", "true");
    tourButton.setAttribute("aria-label", "结束岛屿导览");
    tourButton.querySelector("span").textContent = "结束导览";
    visit(keys[0]);
  });
  function openPassport() {
    if (passport.open) return;
    passportOpener = document.activeElement;
    passport.showModal();
    $("#passport-close").focus();
  }
  $("#passport-button").addEventListener("click", openPassport);
  $("#passport-close").addEventListener("click", () => passport.close());
  passport.addEventListener("click", (event) => {
    if (event.target !== passport) return;
    const rect = passport.getBoundingClientRect();
    if (
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom
    )
      passport.close();
  });
  passport.addEventListener("close", () =>
    passportOpener?.focus({ preventScroll: true }),
  );
  actions.addEventListener("click", (event) => {
    const action = event.target.closest("[data-action]")?.dataset.action;
    if (action === "random") randomResident();
    if (action === "passport") openPassport();
    if (action === "guide") openGuide();
  });
  $("#reset-progress").addEventListener("click", () => {
    stamps = [];
    saveStamps();
    updatePassport();
    $("#passport-message").textContent = "护照翻到了新的一页。重新认识岛民吧！";
    $("#passport-close").focus();
  });
  window.addEventListener("storage", (event) => {
    if (event.key === storageKey || event.key === null) {
      stamps = readStamps();
      updatePassport();
    }
  });
  $("#shell-secret").addEventListener("click", (event) => {
    const shell = event.currentTarget;
    shell.disabled = true;
    shell.setAttribute("aria-label", "已捡到一枚贝壳");
    showToast("捡到一枚温暖的贝壳。把这份小幸运带回家吧。");
    tone(880, 0.3);
  });
  const notes = [
    "今天适合记录一个\n被忽略的小瞬间。",
    "小需求，也值得\n被认真对待。",
    "安静的软件，\n也可以很有力量。",
    "先照顾好今天，\n再想很远的以后。",
    "慢慢来，\n小岛总在这里。",
  ];
  let noteIndex = 0;
  $("#new-note").addEventListener("click", () => {
    noteIndex =
      (noteIndex + 1 + Math.floor(Math.random() * (notes.length - 1))) %
      notes.length;
    $("#daily-note").textContent = notes[noteIndex];
    tone(680, 0.15);
  });
  function tick() {
    const date = new Date();
    $("#clock").dateTime = date.toISOString();
    $("#clock").textContent = new Intl.DateTimeFormat("zh-CN", {
      month: "long",
      day: "numeric",
      weekday: "long",
    }).format(date);
    $("#clock-hour").textContent = new Intl.DateTimeFormat("zh-CN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(date);
  }

  // A quiet original synthesized loop. Audio only starts after an explicit click.
  function ensureAudio() {
    try {
      audio ||= new (window.AudioContext || window.webkitAudioContext)();
      return audio;
    } catch {
      return null;
    }
  }
  function tone(frequency, duration) {
    if (!soundOn || !audio || audio.state !== "running") return;
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.03, audio.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + duration);
    oscillator.connect(gain).connect(audio.destination);
    oscillator.start();
    oscillator.stop(audio.currentTime + duration);
    oscillator.onended = () => {
      oscillator.disconnect();
      gain.disconnect();
    };
  }
  const beat = 60 / 84;
  const barLength = beat * 4;
  function islandNote(
    frequency,
    start,
    duration,
    volume,
    instrument = "pluck",
  ) {
    if (!audio || !musicMaster) return;
    // Soft harmonic envelopes suggest a nylon string or a wooden marimba bar.
    const harmonics =
      instrument === "marimba"
        ? [
            [1, 1],
            [4, 0.075],
          ]
        : instrument === "bass"
          ? [[1, 1]]
          : [
              [1, 1],
              [2, 0.24],
              [3, 0.055],
            ];
    for (const [multiple, strength] of harmonics) {
      const oscillator = audio.createOscillator();
      const gain = audio.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = frequency * multiple;
      const decay = duration / Math.sqrt(multiple);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(volume * strength, start + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + decay);
      oscillator.connect(gain).connect(musicMaster);
      oscillator.start(start);
      oscillator.stop(start + decay + 0.02);
      oscillator.onended = () => {
        oscillator.disconnect();
        gain.disconnect();
      };
    }
  }
  function scheduleMusicBar(start = audio.currentTime + 0.05) {
    if (!soundOn || !musicMaster) return;
    const chords = [
      [293.66, 369.99, 440],
      [196, 246.94, 293.66],
      [246.94, 293.66, 369.99],
      [220, 329.63, 440],
    ];
    // An original, sparse D-major pentatonic tune; rests leave room for the island.
    const tunes = [
      [
        [0, 587.33],
        [1.5, 659.25],
        [2, 739.99],
        [3, 440],
      ],
      [
        [0.5, 493.88],
        [2, 587.33],
        [3.5, 440],
      ],
      [
        [0, 739.99],
        [1, 659.25],
        [2.5, 587.33],
      ],
      [
        [0.5, 493.88],
        [1.5, 440],
        [3, 369.99],
      ],
      [
        [0, 587.33],
        [1.5, 739.99],
        [2.5, 880],
        [3.5, 739.99],
      ],
      [
        [0.5, 659.25],
        [2, 587.33],
      ],
      [
        [0, 493.88],
        [1, 587.33],
        [2.5, 440],
      ],
      [
        [0.5, 369.99],
        [2, 329.63],
        [3, 293.66],
      ],
    ];
    const chord = chords[musicStep % chords.length];
    islandNote(chord[0] / 2, start, 1.1, 0.075, "bass");
    islandNote(chord[0] / 2, start + beat * 2, 0.8, 0.045, "bass");
    [0, 1.5, 2.5].forEach((position, i) => {
      chord.forEach((note, j) =>
        islandNote(
          note,
          start + position * beat + j * 0.025,
          0.7,
          i ? 0.026 : 0.035,
        ),
      );
    });
    tunes[musicStep % tunes.length].forEach(([position, note]) => {
      const swing = position % 1 ? 0.035 : 0;
      islandNote(note, start + position * beat + swing, 0.8, 0.055, "marimba");
    });
    musicStep += 1;
  }
  function stopMusic() {
    clearInterval(musicTimer);
    musicTimer = null;
    if (!musicMaster || !audio) return;
    const oldMaster = musicMaster;
    oldMaster.gain.cancelScheduledValues(audio.currentTime);
    oldMaster.gain.setTargetAtTime(0, audio.currentTime, 0.09);
    setTimeout(() => oldMaster.disconnect(), 550);
    musicMaster = null;
  }
  function startMusic() {
    if (!soundOn || !audio || document.hidden) return;
    stopMusic();
    musicMaster = audio.createGain();
    musicMaster.gain.value = 0.22;
    musicMaster.connect(audio.destination);
    let nextBar = audio.currentTime + 0.05;
    scheduleMusicBar(nextBar);
    nextBar += barLength;
    // Schedule against audio time to avoid a drifting setInterval rhythm.
    musicTimer = setInterval(() => {
      if (nextBar < audio.currentTime + 0.18) {
        nextBar = Math.max(nextBar, audio.currentTime + 0.02);
        scheduleMusicBar(nextBar);
        nextBar += barLength;
      }
    }, 80);
  }
  function updateSoundButton() {
    soundButton.setAttribute("aria-pressed", String(soundOn));
    soundButton.setAttribute(
      "aria-label",
      soundOn ? "暂停岛屿音乐" : "播放岛屿音乐",
    );
    soundButton.querySelector("span").textContent = soundOn
      ? "音乐开"
      : "音乐关";
  }
  soundButton.addEventListener("click", async () => {
    if (soundOn) {
      soundOn = false;
      stopMusic();
      updateSoundButton();
      return;
    }
    soundButton.disabled = true;
    try {
      const context = ensureAudio();
      if (!context) throw new Error("Audio unavailable");
      await context.resume();
      soundOn = true;
      startMusic();
      updateSoundButton();
    } catch {
      showToast("这次没能播放音乐，稍后再试试吧。");
    } finally {
      soundButton.disabled = false;
    }
  });
  document.addEventListener("visibilitychange", () => {
    if (!soundOn) return;
    if (document.hidden) stopMusic();
    else startMusic();
  });
  window.addEventListener("pagehide", stopMusic);
  window.addEventListener("pageshow", () => {
    if (soundOn && !musicTimer) startMusic();
  });
  updatePassport();
  tick();
  setInterval(tick, 30000);
})();
