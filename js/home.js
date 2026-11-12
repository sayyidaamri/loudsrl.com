/* Home — intro sequence + industry hover panels + mobile industries */
(function () {
  "use strict";
  var body = document.body, V = window.VOXA || {};
  var fromInner = false;
  try { fromInner = !!sessionStorage.getItem("voxa-fluid"); } catch (e) {}
  var title = document.querySelector(".hero__title");

  // Intro: black → fluid zooms in → headline scramble → UI fades in.
  var t = fromInner ? [0, 300, 1200] : [250, 1900, 3400];
  setTimeout(function () { if (window.Fluid) Fluid.setIntro(1); }, t[0]);
  setTimeout(function () { V.scramble(title, { gap: 260, dur: 650 }); }, t[1]);
  setTimeout(function () { body.classList.add("is-ready"); }, t[2]);
  try { sessionStorage.removeItem("voxa-fluid"); } catch (e) {}

  // Hover panels
  var panels = {};
  document.querySelectorAll(".ipanel").forEach(function (p) { panels[p.dataset.ind] = p; });
  var timer;
  document.querySelectorAll(".ind-list a").forEach(function (a) {
    function on() {
      clearTimeout(timer);
      Object.keys(panels).forEach(function (k) { panels[k].classList.toggle("is-on", k === a.dataset.ind); });
      body.classList.add("is-focus");
    }
    function off() {
      timer = setTimeout(function () {
        Object.keys(panels).forEach(function (k) { panels[k].classList.remove("is-on"); });
        body.classList.remove("is-focus");
      }, 120);
    }
    a.addEventListener("pointerenter", on); a.addEventListener("focus", on);
    a.addEventListener("pointerleave", off); a.addEventListener("blur", off);
  });

  // Mobile: show/hide industries
  var pill = document.querySelector(".m-pill");
  if (pill) pill.addEventListener("click", function () {
    var open = body.classList.toggle("show-ind");
    pill.querySelector("span").textContent = open ? "Hide Industries" : "Show Industries";
    pill.setAttribute("aria-expanded", open);
  });
})();
