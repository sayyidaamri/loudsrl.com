/* Video blocks: play/pause when a <source> is provided */
(function () {
  "use strict";
  document.querySelectorAll("[data-video]").forEach(function (box) {
    var v = box.querySelector("video"), btn = box.querySelector(".video__play");
    btn.addEventListener("click", function () {
      if (!v.querySelector("source")) { box.classList.toggle("is-playing"); setTimeout(function () { box.classList.remove("is-playing"); }, 1600); return; }
      if (v.paused) { v.play(); box.classList.add("is-playing"); } else { v.pause(); box.classList.remove("is-playing"); }
    });
    v.addEventListener("click", function () { v.pause(); box.classList.remove("is-playing"); });
  });
})();
