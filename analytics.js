// Website analytics only (the TokenDance apps themselves collect nothing).
// Google Analytics 4 runs without cookies. GA4 has no setting that stops it
// writing its _ga cookies (client_storage: "none" is ignored), and it stops
// sending hits when it cannot read back what it wrote. So Google's analytics
// cookies are kept in memory for this page view only and never reach the
// browser's cookie store: every page view gets a fresh, unstored client id.
// Google signals and ad personalization are off.
(() => {
  const GA_ID = "G-QJ12DGWV31";
  const GOOGLE_COOKIE = /^\s*(_ga|_gid|_gat|_gcl)/;
  const native = Object.getOwnPropertyDescriptor(Document.prototype, "cookie");
  if (!native?.get || !native?.set) return;
  const memory = new Map();
  Object.defineProperty(document, "cookie", {
    configurable: true,
    get() {
      const own = native.get
        .call(document)
        .split(";")
        .map((pair) => pair.trim())
        .filter((pair) => pair && !GOOGLE_COOKIE.test(pair));
      return [...own, ...[...memory].map(([name, value]) => `${name}=${value}`)].join("; ");
    },
    set(value) {
      const text = String(value);
      if (!GOOGLE_COOKIE.test(text)) {
        native.set.call(document, text);
        return;
      }
      const [pair, ...attributes] = text.split(";");
      const eq = pair.indexOf("=");
      const name = pair.slice(0, eq).trim();
      const expired = attributes.some((attribute) => {
        const [key, ...rest] = attribute.split("=");
        const val = rest.join("=").trim();
        if (/^\s*max-age\s*$/i.test(key)) return Number(val) <= 0;
        if (/^\s*expires\s*$/i.test(key)) return Date.parse(val) <= Date.now();
        return false;
      });
      if (expired) memory.delete(name);
      else memory.set(name, pair.slice(eq + 1).trim());
    },
  });
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () {
    window.dataLayer.push(arguments);
  };
  window.gtag("js", new Date());
  window.gtag("config", GA_ID, {
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
  });
  const tag = document.createElement("script");
  tag.async = true;
  tag.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(tag);
})();
