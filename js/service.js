/* Muscat Auto Care — service-details.html renders any service from ?service=slug */
(function () {
  "use strict";
  var el = document.getElementById("svc-data");
  if (!el) return;
  var data = JSON.parse(el.textContent);
  var slug = new URLSearchParams(location.search).get("service");
  var s = data[slug];
  if (!s) return; // no / unknown slug: keep the default (Full Car Detailing)

  var check = '<svg class="ico" aria-hidden="true"><use href="#i-check-c"/></svg>';
  var tick = '<svg class="ico" aria-hidden="true"><use href="#i-check"/></svg>';
  function esc(t) { var d = document.createElement("div"); d.textContent = t; return d.innerHTML; }

  document.querySelectorAll("[data-svc]").forEach(function (n) {
    n.textContent = s[n.getAttribute("data-svc")];
  });
  var b = document.querySelector('[data-svc-list="benefits"]');
  if (b) b.innerHTML = s.benefits.map(function (x) { return "<li>" + check + "<span>" + esc(x) + "</span></li>"; }).join("");
  var inc = document.querySelector('[data-svc-list="included"]');
  if (inc) inc.innerHTML = s.included.map(function (x) { return "<li>" + tick + "<span>" + esc(x) + "</span></li>"; }).join("");

  document.querySelectorAll("[data-svc-bg] img, [data-svc-img] img").forEach(function (img) {
    img.srcset = s.imgs.srcset;
    img.src = s.imgs.src;
    img.width = s.imgs.w;
    img.height = s.imgs.h;
    img.alt = s.title;
  });
  var book = document.querySelector("[data-svc-book]");
  if (book) book.href = "booking.html?service=" + slug;
  document.querySelectorAll("[data-svc-link]").forEach(function (a) {
    if (a.getAttribute("data-svc-link") === slug) a.setAttribute("aria-current", "page");
    else a.removeAttribute("aria-current");
  });

  document.title = T(s.title + " in Muscat | Muscat Auto Care", s.title + " في مسقط | مسقط أوتو كير");
  var md = document.querySelector('meta[name="description"]');
  if (md) md.content = s.short;
})();
