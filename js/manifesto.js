/* Manifesto — pixel-grid hero + principle hover */
(function () {
  "use strict";
  // ---- Pixel grid: squares that slowly swap shades ----
  var c = document.querySelector(".m-hero canvas");
  if (c) {
    var ctx = c.getContext("2d"), S = 113, cols, rows, cells = [];
    var shades = ["#3f2c4f", "#432f53", "#463357", "#4a375b", "#4f3d60", "#564666", "#5e4f6e"];
    var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    function setup() {
      var dpr = Math.min(devicePixelRatio || 1, 2);
      c.width = c.clientWidth * dpr; c.height = c.clientHeight * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      S = c.clientWidth < 768 ? 64 : 113;
      cols = Math.ceil(c.clientWidth / S) + 1; rows = Math.ceil(c.clientHeight / S) + 1;
      cells = [];
      for (var i = 0; i < cols * rows; i++) { var v = Math.random() * shades.length | 0; cells.push({ v: v, a: v, t: v }); }
    }
    function hex(h) { return [parseInt(h.substr(1, 2), 16), parseInt(h.substr(3, 2), 16), parseInt(h.substr(5, 2), 16)]; }
    var rgb = shades.map(hex);
    function col(f) { var i = Math.floor(f), k = f - i, a = rgb[i], b = rgb[Math.min(i + 1, rgb.length - 1)]; return "rgb(" + (a[0] + (b[0] - a[0]) * k | 0) + "," + (a[1] + (b[1] - a[1]) * k | 0) + "," + (a[2] + (b[2] - a[2]) * k | 0) + ")"; }
    var mx = -1, my = -1;
    c.parentElement.addEventListener("pointermove", function (e) { var r = c.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
    c.parentElement.addEventListener("pointerleave", function () { mx = my = -1; });
    var last = 0;
    function draw(now) {
      requestAnimationFrame(draw);
      if (now - last > 900 && !reduce) { last = now; for (var n = 0; n < cells.length * 0.08; n++) { var cell = cells[Math.random() * cells.length | 0]; cell.t = Math.random() * shades.length | 0; } }
      var ox = (c.clientWidth % S) / 2 - S / 2, oy = -S * 0.35;
      for (var y = 0; y < rows; y++) for (var x = 0; x < cols; x++) {
        var cell2 = cells[y * cols + x]; cell2.a += (cell2.t - cell2.a) * 0.03;
        var f = cell2.a, px = ox + x * S, py = oy + y * S;
        if (mx >= 0 && mx > px && mx < px + S && my > py && my < py + S) f = shades.length - 1;
        ctx.fillStyle = col(Math.max(0, Math.min(shades.length - 1, f)));
        ctx.fillRect(px, py, S, S);
      }
    }
    setup(); addEventListener("resize", setup); requestAnimationFrame(draw);
  }

  // ---- Principle lines: blur others, float images, show label ----
  var wrap = document.querySelector(".m-lines");
  if (!wrap) return;
  var floats = wrap.querySelectorAll(".m-float");
  wrap.querySelectorAll(".m-line").forEach(function (line) {
    line.addEventListener("pointerenter", function () {
      wrap.classList.add("is-hover"); line.classList.add("is-on");
      var keys = (line.dataset.imgs || "").split(",");
      var top = line.offsetTop + line.parentElement.offsetTop, j = 0;
      floats.forEach(function (f) {
        var on = keys.indexOf(f.dataset.k) > -1;
        if (on) {
          // first image: small, left & slightly below; second: larger, right & above the line
          var big = j === 1;
          f.style.width = (big ? 230 : 170) + "px"; f.style.height = (big ? 190 : 125) + "px";
          f.style.left = (big ? 60 + (j * 3) : 22 + (line.dataset.imgs.length % 5)) + "%";
          f.style.top = (top + (big ? -70 : 50)) + "px";
          j++;
        }
        f.classList.toggle("is-on", on);
      });
    });
    line.addEventListener("pointerleave", function () {
      wrap.classList.remove("is-hover"); line.classList.remove("is-on");
      floats.forEach(function (f) { f.classList.remove("is-on"); });
    });
  });
})();
