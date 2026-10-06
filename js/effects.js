/* Muscat Auto Care — visual effects (all optional, skipped for reduced motion)
   bubbles canvas, 3D tilt, magnetic buttons, parallax, custom cursor, process progress */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (reduce) return;

  /* ---------- Soap bubbles ---------- */
  document.querySelectorAll("canvas.bubbles").forEach(function (cv) {
    var ctx = cv.getContext("2d"), dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W = 0, H = 0, list = [], running = false, raf = 0;
    var light = cv.hasAttribute("data-light");
    function size() {
      var r = cv.getBoundingClientRect(); W = r.width; H = r.height;
      cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.round(Math.min(26, Math.max(10, W / 55)));
      list = [];
      for (var i = 0; i < n; i++) list.push(make(true));
    }
    function make(anywhere) {
      var r = 4 + Math.random() * 22;
      return { x: Math.random() * W, y: anywhere ? Math.random() * H : H + r + Math.random() * 60, r: r,
               vy: .25 + Math.random() * .7, ph: Math.random() * 6.28, amp: .3 + Math.random() * .8 };
    }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < list.length; i++) {
        var b = list[i];
        b.y -= b.vy; b.ph += .015; b.x += Math.sin(b.ph) * b.amp * .4;
        if (b.y < -b.r * 2) list[i] = b = make(false);
        var g = ctx.createRadialGradient(b.x - b.r * .35, b.y - b.r * .35, b.r * .1, b.x, b.y, b.r);
        if (light) { g.addColorStop(0, "rgba(255,255,255,.55)"); g.addColorStop(.7, "rgba(255,255,255,.08)"); g.addColorStop(1, "rgba(255,255,255,.35)"); }
        else { g.addColorStop(0, "rgba(255,255,255,.9)"); g.addColorStop(.7, "rgba(120,200,255,.12)"); g.addColorStop(1, "rgba(26,92,255,.28)"); }
        ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, 6.283); ctx.fillStyle = g; ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    }
    size();
    window.addEventListener("resize", function () { clearTimeout(cv._t); cv._t = setTimeout(size, 200); });
    new IntersectionObserver(function (en) {
      if (en[0].isIntersecting && !running) { running = true; draw(); }
      else if (!en[0].isIntersecting && running) { running = false; cancelAnimationFrame(raf); }
    }).observe(cv);
  });

  /* ---------- Process line follows scroll ---------- */
  document.querySelectorAll(".process").forEach(function (p) {
    var line = p.querySelector(".process__line");
    var steps = p.querySelectorAll(".step");
    function upd() {
      var r = p.getBoundingClientRect();
      var prog = Math.max(0, Math.min(1, (window.innerHeight * 0.75 - r.top) / (r.height + window.innerHeight * 0.25)));
      if (line) line.style.setProperty("--p", prog.toFixed(3));
      steps.forEach(function (s, i) { s.classList.toggle("is-on", prog >= i / (steps.length - 1) - 0.02 || prog > .98); });
    }
    window.addEventListener("scroll", function () { requestAnimationFrame(upd); }, { passive: true });
    upd();
  });

  /* ---------- Parallax ---------- */
  var par = document.querySelectorAll("[data-parallax]");
  if (par.length) {
    var tick = false;
    function pupd() {
      par.forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.bottom < -200 || r.top > window.innerHeight + 200) return;
        var speed = parseFloat(el.getAttribute("data-parallax")) || 0.15;
        var c = r.top + r.height / 2 - window.innerHeight / 2;
        el.style.transform = "translate3d(0," + (-c * speed).toFixed(1) + "px,0)";
      });
      tick = false;
    }
    window.addEventListener("scroll", function () { if (!tick) { tick = true; requestAnimationFrame(pupd); } }, { passive: true });
    pupd();
  }

  /* ---------- Pinned horizontal showcase ---------- */
  document.querySelectorAll("[data-showcase]").forEach(function (sec) {
    var track = sec.querySelector(".showcase__track");
    var bar = sec.querySelector(".showcase__bar");
    var cur = sec.querySelector("[data-show-current]");
    var cards = track.children.length;
    var rtl = document.documentElement.dir === "rtl";
    var mq = window.matchMedia("(max-width: 900px)");
    function upd() {
      if (mq.matches) { track.style.transform = ""; return; }
      var r = sec.getBoundingClientRect();
      var total = sec.offsetHeight - window.innerHeight;
      var p = Math.max(0, Math.min(1, -r.top / total));
      var dist = track.scrollWidth - window.innerWidth;
      track.style.transform = "translate3d(" + ((rtl ? 1 : -1) * p * dist).toFixed(1) + "px,0,0)";
      if (bar) bar.style.setProperty("--p", p.toFixed(3));
      if (cur) cur.textContent = String(Math.min(cards, Math.floor(p * cards) + 1)).padStart(2, "0");
    }
    window.addEventListener("scroll", function () { requestAnimationFrame(upd); }, { passive: true });
    window.addEventListener("resize", upd);
    upd();
  });

  if (!fine) return; // pointer-only effects below

  /* ---------- 3D tilt ---------- */
  document.querySelectorAll("[data-tilt]").forEach(function (card) {
    card.addEventListener("pointermove", function (e) {
      var r = card.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      card.style.transition = "transform .15s linear, box-shadow .5s";
      card.style.transform = "perspective(900px) rotateX(" + (-y * 7).toFixed(2) + "deg) rotateY(" + (x * 9).toFixed(2) + "deg) translateY(-6px)";
    });
    card.addEventListener("pointerleave", function () {
      card.style.transition = "transform .6s cubic-bezier(.22,1,.36,1), box-shadow .5s";
      card.style.transform = "";
      setTimeout(function () { card.style.transition = ""; }, 600);
    });
  });

  /* ---------- Magnetic buttons ---------- */
  document.querySelectorAll("[data-magnetic]").forEach(function (b) {
    b.addEventListener("pointermove", function (e) {
      var r = b.getBoundingClientRect();
      var x = e.clientX - r.left - r.width / 2, y = e.clientY - r.top - r.height / 2;
      b.style.transform = "translate(" + (x * .22).toFixed(1) + "px," + (y * .3).toFixed(1) + "px)";
    });
    b.addEventListener("pointerleave", function () { b.style.transform = ""; });
  });

  /* ---------- Cursor ---------- */
  var ring = document.createElement("div"); ring.className = "cursor";
  var dot = document.createElement("div"); dot.className = "cursor-dot";
  document.body.appendChild(ring); document.body.appendChild(dot);
  var mx = 0, my = 0, rx = 0, ry = 0, shown = false;
  window.addEventListener("pointermove", function (e) {
    mx = e.clientX; my = e.clientY;
    dot.style.transform = "translate(" + mx + "px," + my + "px)";
    if (!shown) { shown = true; rx = mx; ry = my; ring.classList.add("is-on"); dot.classList.add("is-on"); loop(); }
  });
  document.addEventListener("mouseleave", function () { ring.classList.remove("is-on"); dot.classList.remove("is-on"); shown = false; });
  function loop() {
    rx += (mx - rx) * .18; ry += (my - ry) * .18;
    ring.style.transform = "translate(" + rx.toFixed(1) + "px," + ry.toFixed(1) + "px)";
    if (shown) requestAnimationFrame(loop);
  }
  document.addEventListener("pointerover", function (e) {
    ring.classList.toggle("is-hover", !!e.target.closest("a, button, .ba, label, select, [data-tilt]"));
  });
})();
