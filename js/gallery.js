/* Muscat Auto Care — gallery filter + accessible lightbox */
(function () {
  "use strict";
  var items = Array.prototype.slice.call(document.querySelectorAll("[data-lightbox]"));
  if (!items.length) return;

  /* ---------- Filters ---------- */
  var filters = document.querySelectorAll(".filter");
  var status = document.querySelector("[data-filter-status]");
  filters.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var cat = btn.getAttribute("data-filter");
      filters.forEach(function (b) { b.setAttribute("aria-pressed", b === btn ? "true" : "false"); });
      var shown = 0;
      items.forEach(function (it) {
        var match = cat === "all" || (it.getAttribute("data-cat") || "").split(" ").indexOf(cat) > -1;
        it.classList.toggle("is-hidden", !match);
        it.classList.remove("gallery-anim");
        if (match) { void it.offsetWidth; it.classList.add("gallery-anim"); shown++; }
      });
      if (status) status.textContent = T(shown + " photos shown", "عدد الصور المعروضة: " + shown);
    });
  });

  /* ---------- Lightbox ---------- */
  var lb = document.createElement("div");
  lb.className = "lightbox";
  lb.setAttribute("role", "dialog");
  lb.setAttribute("aria-modal", "true");
  lb.setAttribute("aria-label", T("Image viewer", "عارض الصور"));
  lb.setAttribute("aria-hidden", "true");
  lb.innerHTML =
    '<span class="lightbox__count" aria-live="polite"></span>' +
    '<figure class="lightbox__figure"><img class="lightbox__img" alt=""><figcaption class="lightbox__cap"></figcaption></figure>' +
    '<button class="lightbox__btn lightbox__prev" type="button" aria-label="' + T("Previous image", "الصورة السابقة") + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M15 5l-7 7 7 7"/></svg></button>' +
    '<button class="lightbox__btn lightbox__next" type="button" aria-label="' + T("Next image", "الصورة التالية") + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 5l7 7-7 7"/></svg></button>' +
    '<button class="lightbox__btn lightbox__close" type="button" aria-label="' + T("Close image viewer", "إغلاق عارض الصور") + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 6l12 12M18 6L6 18"/></svg></button>';
  document.body.appendChild(lb);
  var img = lb.querySelector(".lightbox__img");
  var cap = lb.querySelector(".lightbox__cap");
  var count = lb.querySelector(".lightbox__count");
  var list = [], idx = 0, lastFocus = null;

  function visibleItems() { return items.filter(function (it) { return !it.classList.contains("is-hidden"); }); }
  function show(k) {
    idx = (k + list.length) % list.length;
    var it = list[idx];
    img.classList.remove("is-ready");
    var next = new Image();
    next.onload = function () {
      img.src = next.src;
      img.alt = it.querySelector("img").alt;
      requestAnimationFrame(function () { img.classList.add("is-ready"); });
    };
    next.src = it.getAttribute("href");
    cap.innerHTML = "<b>" + (it.getAttribute("data-title") || "") + "</b>" + (it.getAttribute("data-desc") || "");
    count.textContent = (idx + 1) + " / " + list.length;
  }
  function open(it) {
    list = visibleItems();
    lastFocus = document.activeElement;
    lb.classList.add("is-open");
    lb.setAttribute("aria-hidden", "false");
    document.body.classList.add("no-scroll");
    show(list.indexOf(it));
    lb.querySelector(".lightbox__close").focus();
  }
  function close() {
    lb.classList.remove("is-open");
    lb.setAttribute("aria-hidden", "true");
    document.body.classList.remove("no-scroll");
    if (lastFocus) lastFocus.focus();
  }
  items.forEach(function (it) {
    it.addEventListener("click", function (e) { e.preventDefault(); open(it); });
  });
  lb.querySelector(".lightbox__prev").addEventListener("click", function () { show(idx - 1); });
  lb.querySelector(".lightbox__next").addEventListener("click", function () { show(idx + 1); });
  lb.querySelector(".lightbox__close").addEventListener("click", close);
  lb.addEventListener("click", function (e) { if (e.target === lb) close(); });
  document.addEventListener("keydown", function (e) {
    if (!lb.classList.contains("is-open")) return;
    if (e.key === "Escape") close();
    else if (e.key === "ArrowLeft") show(idx - 1);
    else if (e.key === "ArrowRight") show(idx + 1);
    else if (e.key === "Tab") {
      var f = lb.querySelectorAll("button"), first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  var sx = null;
  lb.addEventListener("touchstart", function (e) { sx = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener("touchend", function (e) {
    if (sx === null) return;
    var dx = e.changedTouches[0].clientX - sx;
    if (Math.abs(dx) > 50) show(idx + (dx < 0 ? 1 : -1));
    sx = null;
  });
})();
