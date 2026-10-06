/* Muscat Auto Care — hero slider (wipe transition, autoplay, pause on hover/focus, keyboard, swipe) */
(function () {
  "use strict";
  var hero = document.querySelector("[data-hero]");
  if (!hero) return;
  var slides = hero.querySelectorAll(".hero__slide");
  var dots = hero.querySelectorAll(".hero__dot");
  var current = hero.querySelector("[data-hero-current]");
  var nameEl = hero.querySelector("[data-hero-name]");
  var live = hero.querySelector("[data-hero-live]");
  var win = hero.querySelector(".hero__window");
  var DURATION = 6000;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var i = 0, timer = null, paused = false, n = slides.length;
  hero.style.setProperty("--slide-ms", DURATION + "ms");

  function hydrate(slide) {
    slide.querySelectorAll("img[data-srcset]").forEach(function (img) {
      img.setAttribute("srcset", img.getAttribute("data-srcset")); img.removeAttribute("data-srcset");
      img.src = img.getAttribute("data-src"); img.removeAttribute("data-src");
    });
  }
  window.addEventListener("load", function () { slides.forEach(hydrate); });

  function go(k) {
    var prev = i;
    i = (k + n) % n;
    hydrate(slides[i]);
    slides.forEach(function (s, j) {
      s.classList.remove("is-leaving");
      if (j === prev && j !== i) s.classList.add("is-leaving");
      s.classList.toggle("is-active", j === i);
      s.setAttribute("aria-hidden", j === i ? "false" : "true");
    });
    setTimeout(function () { slides[prev] && prev !== i && slides[prev].classList.remove("is-leaving"); }, 1150);
    dots.forEach(function (d, j) {
      d.classList.remove("is-active"); void d.offsetWidth;
      d.classList.toggle("is-active", j === i);
      d.setAttribute("aria-current", j === i ? "true" : "false");
    });
    if (current) current.textContent = String(i + 1).padStart(2, "0");
    var label = slides[i].getAttribute("data-label") || "";
    if (nameEl) {
      nameEl.classList.add("is-swapping");
      setTimeout(function () { nameEl.textContent = label; nameEl.classList.remove("is-swapping"); }, 350);
    }
    if (live) live.textContent = T("Slide " + (i + 1) + " of " + n + ": ", "الشريحة " + (i + 1) + " من " + n + ": ") + label;
  }
  function play() {
    clearTimeout(timer);
    if (reduce || paused) return;
    timer = setTimeout(function () { go(i + 1); play(); }, DURATION);
  }
  function pause() { paused = true; hero.classList.add("is-paused"); clearTimeout(timer); }
  function resume() { paused = false; hero.classList.remove("is-paused"); play(); }

  dots.forEach(function (d, j) { d.addEventListener("click", function () { if (j !== i) go(j); play(); }); });
  var pv = hero.querySelector("[data-hero-prev]"), nx = hero.querySelector("[data-hero-next]");
  if (pv) pv.addEventListener("click", function () { go(i - 1); play(); });
  if (nx) nx.addEventListener("click", function () { go(i + 1); play(); });

  var area = win || hero;
  if (window.matchMedia("(hover: hover)").matches) {
    area.addEventListener("mouseenter", pause);
    area.addEventListener("mouseleave", resume);
  }
  hero.addEventListener("focusin", function (e) { if (e.target.closest(".hero__nav")) pause(); });
  hero.addEventListener("focusout", function (e) { if (!hero.contains(e.relatedTarget)) resume(); });
  hero.addEventListener("keydown", function (e) {
    if (e.key === "ArrowLeft") { go(i - 1); }
    if (e.key === "ArrowRight") { go(i + 1); }
  });
  document.addEventListener("visibilitychange", function () { document.hidden ? clearTimeout(timer) : play(); });

  var sx = null, sy = null;
  area.addEventListener("touchstart", function (e) { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
  area.addEventListener("touchend", function (e) {
    if (sx === null) return;
    var dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) { go(i + (dx < 0 ? 1 : -1)); play(); }
    sx = sy = null;
  });

  // first slide is shown without a wipe
  slides[0].classList.add("is-active");
  dots[0] && dots[0].classList.add("is-active");
  play();
})();
