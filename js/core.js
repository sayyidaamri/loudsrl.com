/* =========================================================
   VOXA. — core interactions (vanilla JS)
   cursor · clock · nav · page transitions · scramble ·
   reveal · smooth scroll · scroll-driven marquee · menu
   ========================================================= */
(function () {
  "use strict";
  var body = document.body;
  var fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var V = (window.VOXA = window.VOXA || {});

  /* ---------- Fluid boot (tint per page, continues from previous page) ---------- */
  var canvas = document.querySelector(".fluid");
  if (canvas && window.Fluid) {
    var prev = null;
    try { prev = JSON.parse(sessionStorage.getItem("voxa-fluid") || "null"); } catch (e) {}
    var tint = JSON.parse(body.dataset.tint || "[0.06,0.06,0.08]");
    var hi = JSON.parse(body.dataset.hi || "[0.62,0.62,0.7]");
    Fluid.init(canvas, { tint: tint, hi: hi, from: prev, flat: +(body.dataset.flat || 0), intro: body.dataset.intro === "1" && !prev });
    V.fluid = Fluid;
  }

  /* ---------- Page transitions ---------- */
  body.classList.add("is-loading");
  requestAnimationFrame(function () { requestAnimationFrame(function () { body.classList.remove("is-loading"); }); });
  document.addEventListener("click", function (e) {
    var a = e.target.closest("a[href]");
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey) return;
    var href = a.getAttribute("href");
    if (!href || href[0] === "#" || a.target === "_blank" || /^(mailto:|tel:|https?:)/.test(href)) return;
    e.preventDefault();
    if (window.Fluid && Fluid.getState) try { sessionStorage.setItem("voxa-fluid", JSON.stringify(Fluid.getState())); } catch (er) {}
    body.classList.remove("menu-open");
    body.classList.add("is-leaving");
    setTimeout(function () { location.href = href; }, reduce ? 0 : 450);
  });
  window.addEventListener("pageshow", function (e) { if (e.persisted) body.classList.remove("is-leaving"); });

  /* ---------- Clock ---------- */
  var clocks = document.querySelectorAll("[data-clock]");
  function tick() {
    var s = new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZone: "Asia/Jakarta" });
    clocks.forEach(function (c) { c.textContent = s; });
  }
  tick(); setInterval(tick, 15000);

  /* ---------- Theme toggle (light chrome fluid) ---------- */
  document.querySelectorAll("[data-theme-toggle]").forEach(function (b) {
    b.addEventListener("click", function () {
      var on = document.documentElement.classList.toggle("fluid-light");
      if (window.Fluid) Fluid.setLight(on ? 1 : 0);
    });
  });

  /* ---------- Mobile menu ---------- */
  var burger = document.querySelector(".burger");
  if (burger) burger.addEventListener("click", function () {
    var open = body.classList.toggle("menu-open");
    burger.setAttribute("aria-expanded", open);
  });

  /* ---------- Cursor (dot + drawn ring on links) ---------- */
  if (fine) {
    var cur = document.createElement("div");
    cur.className = "cursor";
    cur.innerHTML = '<span class="cursor__dot"></span><svg class="cursor__ring" viewBox="0 0 48 48"><circle cx="24" cy="24" r="23"/></svg>';
    body.appendChild(cur);
    var x = innerWidth / 2, y = innerHeight / 2, cx = x, cy = y;
    addEventListener("pointermove", function (e) { x = e.clientX; y = e.clientY; cur.classList.remove("is-hidden"); }, { passive: true });
    document.addEventListener("pointerleave", function () { cur.classList.add("is-hidden"); });
    (function loop() { cx += (x - cx) * 0.22; cy += (y - cy) * 0.22; cur.style.transform = "translate3d(" + cx + "px," + cy + "px,0)"; requestAnimationFrame(loop); })();
    document.addEventListener("pointerover", function (e) {
      var t = e.target.closest("a, button, label, [data-cursor]");
      cur.classList.toggle("is-link", !!t && !t.matches(".nav a, .ctacard, [data-cursor='none']"));
    });
  }

  /* ---------- Scramble text ---------- */
  var GLYPHS = "abcdefghijklmnopqrstuvwxyz0123456789#%&*+=<>/";
  function scrambleWord(el, dur) {
    var final = el.dataset.final, start = performance.now();
    return new Promise(function (res) {
      (function step(now) {
        var k = Math.min((now - start) / dur, 1), out = "", reveal = Math.floor(k * final.length);
        for (var i = 0; i < final.length; i++) out += i < reveal || final[i] === " " ? final[i] : GLYPHS[(Math.random() * GLYPHS.length) | 0];
        el.textContent = out; el.style.opacity = Math.min(1, k * 3);
        if (k < 1) requestAnimationFrame(step); else res();
      })(start);
    });
  }
  V.scramble = function (el, opts) {
    opts = opts || {};
    if (!el.dataset.prepared) {
      var words = el.textContent.trim().split(/(\s+)/);
      el.innerHTML = "";
      words.forEach(function (w) {
        if (/^\s+$/.test(w)) { el.appendChild(document.createTextNode(" ")); return; }
        var s = document.createElement("span"); s.className = "w"; s.dataset.final = w; s.textContent = w; s.style.opacity = 0; el.appendChild(s);
      });
      el.dataset.prepared = 1;
    }
    el.classList.remove("is-pending");
    var ws = el.querySelectorAll(".w"), gap = opts.gap || 120, dur = opts.dur || 520;
    if (reduce) { ws.forEach(function (w) { w.textContent = w.dataset.final; w.style.opacity = 1; }); return Promise.resolve(); }
    var ps = [];
    ws.forEach(function (w, i) { ps.push(new Promise(function (r) { setTimeout(function () { scrambleWord(w, dur).then(r); }, i * gap); })); });
    return Promise.all(ps);
  };
  // auto-run scrambles on inner pages
  document.querySelectorAll("[data-scramble]:not([data-manual])").forEach(function (el, i) {
    el.classList.add("is-pending");
    setTimeout(function () { V.scramble(el, { gap: 70, dur: 600 }); }, 250 + i * 150);
  });

  /* ---------- Fade words (lead paragraphs) ---------- */
  document.querySelectorAll("[data-words]").forEach(function (el) {
    var parts = el.textContent.trim().split(/\s+/);
    el.innerHTML = parts.map(function (w, i) { return '<span style="opacity:0;transition:opacity .6s ' + (0.5 + i * 0.025).toFixed(3) + 's">' + w + "</span>"; }).join(" ");
    requestAnimationFrame(function () { requestAnimationFrame(function () { el.querySelectorAll("span").forEach(function (s) { s.style.opacity = 1; }); }); });
  });

  /* ---------- Reveal on scroll ---------- */
  var io = new IntersectionObserver(function (en) {
    en.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } });
  }, { threshold: 0.15 });
  document.querySelectorAll("[data-reveal]").forEach(function (el) { io.observe(el); });

  /* ---------- Smooth scroll (lerped wheel, desktop only) ---------- */
  var sy = scrollY, ty = scrollY, smoothing = false;
  if (fine && !reduce && !body.classList.contains("no-scroll")) {
    addEventListener("wheel", function (e) {
      if (e.ctrlKey || body.classList.contains("menu-open") || e.target.closest("[data-native-scroll]")) return;
      e.preventDefault();
      ty = Math.max(0, Math.min(document.documentElement.scrollHeight - innerHeight, ty + e.deltaY));
      if (!smoothing) { smoothing = true; sy = scrollY; requestAnimationFrame(smooth); }
    }, { passive: false });
    addEventListener("scroll", function () { if (!smoothing) { sy = ty = scrollY; } }, { passive: true });
  }
  function smooth() {
    sy += (ty - sy) * 0.1;
    if (Math.abs(ty - sy) < 0.5) { sy = ty; smoothing = false; }
    scrollTo(0, sy);
    if (smoothing) requestAnimationFrame(smooth);
  }
  V.scrollTo = function (y) { ty = y; if (!smoothing) { smoothing = true; sy = scrollY; requestAnimationFrame(smooth); } };

  /* ---------- Scroll-driven horizontal lines ---------- */
  var lines = [].slice.call(document.querySelectorAll("[data-bigline]"));
  function lineLoop() {
    var vh = innerHeight;
    lines.forEach(function (l) {
      var r = l.getBoundingClientRect(); if (r.bottom < -200 || r.top > vh + 200) return;
      var t = l.firstElementChild, p = (vh - r.top) / (vh + r.height); // 0..1
      var dist = t.scrollWidth - innerWidth;
      t.style.transform = "translate3d(" + (-p * dist * 1.05 + innerWidth * 0.15) + "px,0,0)";
    });
    requestAnimationFrame(lineLoop);
  }
  if (lines.length) requestAnimationFrame(lineLoop);

  /* ---------- Parallax images ---------- */
  var par = [].slice.call(document.querySelectorAll("[data-parallax]"));
  function parLoop() {
    var vh = innerHeight;
    par.forEach(function (img) {
      var r = img.parentElement.getBoundingClientRect(); if (r.bottom < 0 || r.top > vh) return;
      var p = (r.top + r.height / 2 - vh / 2) / vh;
      img.style.transform = "translate3d(0," + (-8 + p * -8).toFixed(2) + "%,0)";
    });
    requestAnimationFrame(parLoop);
  }
  if (par.length && !reduce) requestAnimationFrame(parLoop);

  /* ---------- Brand marquee duplicate ---------- */
  document.querySelectorAll(".brands__track").forEach(function (t) { t.innerHTML += t.innerHTML; });

  /* ---------- Year ---------- */
  document.querySelectorAll("[data-year]").forEach(function (y) { y.textContent = new Date().getFullYear(); });
})();
