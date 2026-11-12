/* Contact — tabs (?c=business|startup|career), chips, dropdowns, attach, validation */
(function () {
  "use strict";
  var body = document.body, form = document.querySelector(".c-form");
  if (!form) return;
  var tabs = document.querySelectorAll(".c-tab"), panes = form.querySelectorAll("[data-pane]");

  function setTab(k, push) {
    if (!form.querySelector('[data-pane="' + k + '"]')) k = "business";
    body.dataset.tab = k;
    tabs.forEach(function (t) { t.classList.toggle("is-on", t.dataset.tab === k); t.setAttribute("aria-selected", t.dataset.tab === k); });
    panes.forEach(function (p) { p.hidden = p.dataset.pane !== k; });
    if (push) history.replaceState(null, "", "?c=" + k);
  }
  tabs.forEach(function (t) { t.addEventListener("click", function () { setTab(t.dataset.tab, true); }); });
  setTab(new URLSearchParams(location.search).get("c") || "business");

  // chips
  form.querySelectorAll(".chip").forEach(function (c) {
    c.addEventListener("click", function () { c.classList.toggle("is-on"); c.closest(".c-cell").classList.remove("is-error"); });
  });

  // dropdowns
  form.querySelectorAll(".dd").forEach(function (dd) {
    var btn = dd.querySelector(".dd__btn"), lbl = btn.querySelector("span");
    btn.addEventListener("click", function (e) { e.stopPropagation(); var open = !dd.classList.contains("is-open"); closeAll(); dd.classList.toggle("is-open", open); });
    dd.querySelectorAll(".dd__list button").forEach(function (o) {
      o.addEventListener("click", function () {
        dd.querySelectorAll(".dd__list button").forEach(function (x) { x.classList.remove("is-on"); });
        o.classList.add("is-on"); lbl.textContent = o.textContent; dd.dataset.value = o.textContent;
        dd.classList.remove("is-open"); dd.closest(".c-cell").classList.remove("is-error");
      });
    });
  });
  function closeAll() { form.querySelectorAll(".dd.is-open").forEach(function (d) { d.classList.remove("is-open"); }); }
  document.addEventListener("click", closeAll);
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeAll(); });

  // attach
  form.querySelectorAll(".attach input").forEach(function (inp) {
    inp.addEventListener("change", function () {
      var f = inp.files[0]; if (!f) return;
      inp.closest(".attach").querySelector(".attach__txt").textContent = f.name + " · " + Math.max(1, Math.round(f.size / 1024)) + " KB";
    });
  });

  form.addEventListener("input", function (e) { var c = e.target.closest(".c-cell"); if (c) c.classList.remove("is-error"); });

  // validation (no network request — demo)
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var pane = form.querySelector('[data-pane="' + body.dataset.tab + '"]'), ok = true;
    pane.querySelectorAll("[data-required]").forEach(function (c) {
      var t = c.dataset.required, bad;
      if (t === "chips") bad = !c.querySelector(".chip.is-on");
      else if (t === "dd") bad = !c.querySelector(".dd").dataset.value;
      else bad = !c.querySelector("input").value.trim();
      c.classList.toggle("is-error", bad); if (bad) ok = false;
    });
    var bar = form.querySelector(".c-bar"), mail = bar.querySelector("input");
    var mailOk = /^\S+@\S+\.\S+$/.test(mail.value);
    if (!mailOk) { ok = false; bar.classList.remove("is-error"); void bar.offsetWidth; bar.classList.add("is-error"); mail.placeholder = "Please enter a valid email"; }
    if (!ok) return;
    bar.classList.add("is-sent");
  });
})();
