/* ==========================================================================
   Muscat Auto Care — main.js
   ------------------------------------------------------------------
   EDIT BUSINESS DETAILS HERE. Phone numbers on every page are
   rewritten from this object at load time.
   ========================================================================== */
window.SITE = {
  phoneDisplay: "+000 0000 0000",     // shown on the page (placeholder)
  phoneHref: "+00000000000",          // used in tel: links (placeholder)
  email: "hello@example.com",
  mapsUrl: "https://maps.app.goo.gl/oSj7RgoXAtoM51S8A"
};

var IS_AR = document.documentElement.lang === "ar";
window.T = function (en, ar) { return IS_AR ? ar : en; };

(function () {
  "use strict";
  var doc = document.documentElement;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  doc.classList.add("js");

  /* ---------- Contact links from config ---------- */
  document.querySelectorAll("[data-tel]").forEach(function (a) { a.href = "tel:" + SITE.phoneHref; });
  document.querySelectorAll("[data-tel-text]").forEach(function (el) { el.textContent = SITE.phoneDisplay; });
  document.querySelectorAll("[data-email]").forEach(function (el) { el.textContent = SITE.email; });
  document.querySelectorAll("[data-maps]").forEach(function (a) { a.href = SITE.mapsUrl; a.target = "_blank"; a.rel = "noopener"; });
  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
  document.querySelectorAll("[data-lang-switch]").forEach(function (a) { if (location.search) a.href = a.getAttribute("href") + location.search; });

  /* ---------- Page transition curtain ---------- */
  var curtain = document.querySelector(".curtain");
  var reduceM = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (curtain && !reduceM) {
    document.addEventListener("click", function (e) {
      var a = e.target.closest("a[href]");
      if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
      if (a.target === "_blank" || a.hasAttribute("download") || a.hasAttribute("data-lightbox")) return;
      var url = new URL(a.href, location.href);
      if (url.origin !== location.origin || !/\.html$|\/$/.test(url.pathname)) return;
      if (url.pathname === location.pathname && url.hash) return;
      e.preventDefault();
      curtain.classList.add("is-in");
      setTimeout(function () { location.href = url.href; }, 520);
    });
    window.addEventListener("pageshow", function (e) { if (e.persisted) curtain.classList.remove("is-in"); });
  }

  /* ---------- Count-up numbers ---------- */
  if ("IntersectionObserver" in window) {
    var cio = new IntersectionObserver(function (en) {
      en.forEach(function (x) {
        if (!x.isIntersecting) return;
        cio.unobserve(x.target);
        var el = x.target, end = +el.getAttribute("data-count"), t0 = null;
        if (reduceM) return;
        function step(t) {
          if (!t0) t0 = t;
          var p = Math.min(1, (t - t0) / 1400), e2 = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(end * e2);
          if (p < 1) requestAnimationFrame(step);
        }
        el.textContent = "0";
        requestAnimationFrame(step);
      });
    }, { threshold: 0.6 });
    document.querySelectorAll("[data-count]").forEach(function (el) { cio.observe(el); });
  }

  /* ---------- Preloader ---------- */
  var pre = document.querySelector(".preloader");
  var start = performance.now();
  function finishLoad() {
    var wait = Math.max(0, (reduceMotion ? 0 : 650) - (performance.now() - start));
    setTimeout(function () {
      doc.classList.add("is-loaded");
      if (pre) {
        pre.classList.add("is-done");
        setTimeout(function () { pre.remove(); }, 700);
      }
    }, wait);
  }
  if (document.readyState === "complete") finishLoad();
  else window.addEventListener("load", finishLoad);
  setTimeout(finishLoad, 1500); // hard cap so slow images never hold the page

  /* ---------- Header on scroll + back-to-top progress ---------- */
  var header = document.querySelector(".site-header");
  var toTop = document.querySelector(".to-top");
  var bar = toTop ? toTop.querySelector(".ring__bar") : null;
  var CIRC = 144.5;
  var ticking = false;
  var progress = document.querySelector(".progress");
  var lastY = 0;
  function onScroll() {
    var y = window.scrollY;
    if (header) {
      header.classList.toggle("is-scrolled", y > 40);
      var drawerOpen = document.body.classList.contains("no-scroll");
      if (Math.abs(y - lastY) > 4 || y < 500) {
        header.classList.toggle("is-hidden", !drawerOpen && y > 500 && y > lastY);
      }
    }
    if (progress) {
      var mx = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.transform = "scaleX(" + (mx > 0 ? y / mx : 0) + ")";
    }
    if (Math.abs(y - lastY) > 4) lastY = y;
    if (toTop) {
      toTop.classList.toggle("is-visible", y > 600);
      var max = document.documentElement.scrollHeight - window.innerHeight;
      if (bar && max > 0) bar.style.strokeDashoffset = CIRC - (y / max) * CIRC;
    }
    ticking = false;
  }
  window.addEventListener("scroll", function () {
    if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  onScroll();
  if (toTop) toTop.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  });

  /* ---------- Mobile drawer ---------- */
  var toggle = document.querySelector(".menu-toggle");
  var drawer = document.getElementById("drawer");
  if (toggle && drawer) {
    var panel = drawer.querySelector(".drawer__panel");
    var lastFocus = null;
    function focusables() {
      return panel.querySelectorAll("a[href], button:not([disabled])");
    }
    function openDrawer() {
      lastFocus = document.activeElement;
      drawer.classList.add("is-open");
      drawer.removeAttribute("inert");
      drawer.setAttribute("aria-hidden", "false");
      toggle.setAttribute("aria-expanded", "true");
      document.body.classList.add("no-scroll");
      setTimeout(function () { var f = focusables(); if (f.length) f[0].focus(); }, 80);
    }
    function closeDrawer() {
      drawer.classList.remove("is-open");
      drawer.setAttribute("aria-hidden", "true");
      drawer.setAttribute("inert", "");
      toggle.setAttribute("aria-expanded", "false");
      document.body.classList.remove("no-scroll");
      if (lastFocus) lastFocus.focus();
    }
    toggle.addEventListener("click", function () {
      drawer.classList.contains("is-open") ? closeDrawer() : openDrawer();
    });
    drawer.querySelectorAll("[data-close-drawer]").forEach(function (el) { el.addEventListener("click", closeDrawer); });
    drawer.querySelectorAll(".drawer__list a").forEach(function (a) { a.addEventListener("click", closeDrawer); });
    document.addEventListener("keydown", function (e) {
      if (!drawer.classList.contains("is-open")) return;
      if (e.key === "Escape") closeDrawer();
      if (e.key === "Tab") {
        var f = focusables(), first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth > 1080 && drawer.classList.contains("is-open")) closeDrawer();
    });
  }

  /* ---------- Split headings into words ---------- */
  document.querySelectorAll("[data-split]").forEach(function (el) {
    var k = 0;
    function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(" ")); return; }
            var w = document.createElement("span"); w.className = "w";
            var i = document.createElement("span"); i.textContent = part; i.style.setProperty("--i", k++);
            w.appendChild(i); frag.appendChild(w);
          });
          n.parentNode.replaceChild(frag, n);
        } else if (n.nodeType === 1 && !n.classList.contains("w")) walk(n);
      });
    }
    el.setAttribute("aria-label", el.textContent.trim().replace(/\s+/g, " "));
    walk(el);
    el.querySelectorAll(".w").forEach(function (w) { w.setAttribute("aria-hidden", "true"); });
  });

  /* ---------- Scroll reveal ---------- */
  var revealTargets = document.querySelectorAll("[data-reveal], [data-split], .reveal-img, .line-reveal, [data-observe]");
  if ("IntersectionObserver" in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -10% 0px", threshold: 0.12 });
    revealTargets.forEach(function (el) { io.observe(el); });
  } else {
    revealTargets.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- Before / After comparison ---------- */
  document.querySelectorAll(".ba").forEach(function (ba) {
    var range = ba.querySelector(".ba__range");
    function set(v) {
      v = Math.max(0, Math.min(100, v));
      ba.style.setProperty("--pos", v + "%");
      if (range && +range.value !== Math.round(v)) range.value = Math.round(v);
    }
    if (range) range.addEventListener("input", function () { set(+range.value); });
    var dragging = false;
    function fromEvent(e) {
      var r = ba.getBoundingClientRect();
      set(((e.clientX - r.left) / r.width) * 100);
    }
    ba.addEventListener("pointerdown", function (e) {
      dragging = true;
      ba.setPointerCapture(e.pointerId);
      fromEvent(e);
    });
    ba.addEventListener("pointermove", function (e) { if (dragging) fromEvent(e); });
    ba.addEventListener("pointerup", function () { dragging = false; });
    ba.addEventListener("pointercancel", function () { dragging = false; });

    // gentle hint sweep the first time it comes into view
    if (!reduceMotion && "IntersectionObserver" in window && ba.hasAttribute("data-hint")) {
      var hio = new IntersectionObserver(function (en) {
        if (!en[0].isIntersecting) return;
        hio.disconnect();
        var t0 = null;
        function step(t) {
          if (!t0) t0 = t;
          var p = Math.min(1, (t - t0) / 1600);
          if (dragging) return;
          set(50 + Math.sin(p * Math.PI * 2) * 14 * (1 - p));
          if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      }, { threshold: 0.5 });
      hio.observe(ba);
    }
  });

  /* ---------- Testimonials carousel ---------- */
  document.querySelectorAll(".testi").forEach(function (t) {
    var track = t.querySelector(".testi__track");
    var slides = t.querySelectorAll(".testi__slide");
    var dotsWrap = t.querySelector(".testi__dots");
    var i = 0, timer = null, n = slides.length;
    var dots = [];
    slides.forEach(function (s, k) {
      s.setAttribute("aria-hidden", k === 0 ? "false" : "true");
      var d = document.createElement("button");
      d.className = "testi__dot";
      d.type = "button";
      d.setAttribute("aria-label", T("Show feedback " + (k + 1) + " of " + n, "عرض الرأي " + (k + 1) + " من " + n));
      d.addEventListener("click", function () { go(k); restart(); });
      dotsWrap.appendChild(d);
      dots.push(d);
    });
    function go(k) {
      i = (k + n) % n;
      track.style.transform = "translateX(" + (-100 * i) + "%)";
      slides.forEach(function (s, j) { s.setAttribute("aria-hidden", j === i ? "false" : "true"); });
      dots.forEach(function (d, j) { d.setAttribute("aria-current", j === i ? "true" : "false"); });
    }
    function restart() {
      clearInterval(timer);
      if (!reduceMotion) timer = setInterval(function () { go(i + 1); }, 7000);
    }
    var prev = t.querySelector("[data-testi-prev]"), next = t.querySelector("[data-testi-next]");
    if (prev) prev.addEventListener("click", function () { go(i - 1); restart(); });
    if (next) next.addEventListener("click", function () { go(i + 1); restart(); });
    t.addEventListener("mouseenter", function () { clearInterval(timer); });
    t.addEventListener("mouseleave", restart);
    var sx = null;
    t.addEventListener("touchstart", function (e) { sx = e.touches[0].clientX; }, { passive: true });
    t.addEventListener("touchend", function (e) {
      if (sx === null) return;
      var dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) > 45) { go(i + (dx < 0 ? 1 : -1)); restart(); }
      sx = null;
    });
    go(0); restart();
  });
})();
