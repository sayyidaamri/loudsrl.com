/* Industry hero — drag / swipe left (or click the ghost title) to go to the next industry */
(function () {
  "use strict";
  var hero = document.querySelector(".i-hero");
  if (!hero) return;
  requestAnimationFrame(function () { hero.classList.add("is-in"); });
  var next = hero.dataset.next, x0 = null, titles = hero.querySelector(".i-hero__titles");

  function go() {
    hero.classList.add("is-leave");
    setTimeout(function () {
      var a = document.createElement("a"); a.href = next; a.style.display = "none"; document.body.appendChild(a); a.click();
    }, 350);
  }
  hero.addEventListener("pointerdown", function (e) { if (e.target.closest("a")) return; x0 = e.clientX; hero.classList.add("is-drag"); hero.setPointerCapture(e.pointerId); });
  hero.addEventListener("pointermove", function (e) { if (x0 === null) return; var dx = Math.min(0, e.clientX - x0); titles.style.transition = "none"; titles.style.transform = "translateX(" + dx * 0.6 + "px)"; });
  function end(e) {
    if (x0 === null) return;
    var dx = e.clientX - x0; x0 = null; hero.classList.remove("is-drag");
    titles.style.transition = ""; titles.style.transform = "";
    if (dx < -80) go();
  }
  hero.addEventListener("pointerup", end); hero.addEventListener("pointercancel", end);
  hero.querySelector(".i-hero__t--next").addEventListener("click", function (e) { e.preventDefault(); e.stopPropagation(); go(); });
})();
