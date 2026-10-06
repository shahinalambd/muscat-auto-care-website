/* Muscat Auto Care — booking & contact forms (client-side validation, demo submit) */
(function () {
  "use strict";
  var phoneRe = /^\+?[0-9\s-]{7,16}$/;
  var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function today() {
    var d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 10);
  }

  function setError(field, msg) {
    var wrap = field.closest(".field");
    if (!wrap) return;
    var err = wrap.querySelector(".field__error");
    wrap.classList.toggle("has-error", !!msg);
    if (err) err.textContent = msg || "";
    var inputs = wrap.querySelectorAll("input, select, textarea");
    inputs.forEach(function (i) { i.setAttribute("aria-invalid", msg ? "true" : "false"); });
  }

  function check(el, form) {
    var v = (el.value || "").trim();
    var name = el.name;
    var req = el.hasAttribute("required");
    if (el.type === "radio") {
      var picked = form.querySelector('input[name="' + name + '"]:checked');
      setError(el, req && !picked ? T("Please choose a vehicle type.", "يرجى اختيار نوع المركبة.") : "");
      return !(req && !picked);
    }
    var msg = "";
    if (req && !v) msg = el.getAttribute("data-msg") || T("This field is required.", "هذا الحقل مطلوب.");
    else if (v && el.getAttribute("data-type") === "phone" && !phoneRe.test(v)) msg = T("Enter a valid phone number, e.g. +000 0000 0000.", "أدخل رقم هاتف صحيحاً، مثل ‎+000 0000 0000.");
    else if (v && el.type === "email" && !emailRe.test(v)) msg = T("Enter a valid email address.", "أدخل بريداً إلكترونياً صحيحاً.");
    else if (v && el.type === "date" && v < today()) msg = T("Please pick today or a later date.", "يرجى اختيار تاريخ اليوم أو تاريخ لاحق.");
    else if (v && el.hasAttribute("minlength") && v.length < +el.getAttribute("minlength")) msg = T("Please enter at least " + el.getAttribute("minlength") + " characters.", "يرجى إدخال " + el.getAttribute("minlength") + " أحرف على الأقل.");
    setError(el, msg);
    return !msg;
  }

  document.querySelectorAll("form[data-validate]").forEach(function (form) {
    var fields = form.querySelectorAll("input:not([type=checkbox]), select, textarea");
    var dateEl = form.querySelector('input[type="date"]');
    if (dateEl) dateEl.min = today();

    // Pre-select service from ?service=slug
    var svcSel = form.querySelector('select[name="service"]');
    var q = new URLSearchParams(location.search).get("service");
    if (svcSel && q) {
      var opt = svcSel.querySelector('option[data-slug="' + q + '"]');
      if (opt) svcSel.value = opt.value;
    }
    var pkg = new URLSearchParams(location.search).get("package");
    if (svcSel && pkg) {
      var popt = svcSel.querySelector('option[data-slug="' + pkg + '"]');
      if (popt) svcSel.value = popt.value;
    }

    // "WhatsApp same as phone"
    var same = form.querySelector("[data-same-as-phone]");
    var wa = form.querySelector('input[name="whatsapp"]');
    var ph = form.querySelector('input[name="phone"]');
    if (same && wa && ph) {
      same.addEventListener("change", function () {
        wa.disabled = same.checked;
        if (same.checked) { wa.value = ph.value; setError(wa, ""); }
      });
      ph.addEventListener("input", function () { if (same.checked) wa.value = ph.value; });
    }

    fields.forEach(function (el) {
      el.addEventListener("blur", function () { if (el.value) check(el, form); });
      el.addEventListener("input", function () {
        if (el.closest(".field") && el.closest(".field").classList.contains("has-error")) check(el, form);
      });
      el.addEventListener("change", function () { if (el.type === "radio") check(el, form); });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = true, firstBad = null, seenRadio = {};
      fields.forEach(function (el) {
        if (el.disabled) return;
        if (el.type === "radio") { if (seenRadio[el.name]) return; seenRadio[el.name] = true; }
        if (!check(el, form)) { ok = false; if (!firstBad) firstBad = el; }
      });
      if (!ok) { firstBad.focus(); return; }

      var btn = form.querySelector('button[type="submit"]');
      btn.disabled = true;
      var original = btn.innerHTML;
      btn.innerHTML = T("Sending…", "جارٍ الإرسال…");
      setTimeout(function () {
        var success = document.getElementById(form.getAttribute("data-success"));
        var data = new FormData(form);
        if (wa && wa.disabled) data.set("whatsapp", ph.value);

        // Build summary (demo only: nothing is sent)
        var summary = success && success.querySelector("[data-summary]");
        var lines = [];
        if (summary) {
          summary.innerHTML = "";
          var done = {};
          form.querySelectorAll("[data-summary-label]").forEach(function (el) {
            var key = el.name, val = data.get(key);
            if (!val || done[key]) return;
            done[key] = true;
            if (el.tagName === "SELECT") val = el.options[el.selectedIndex].text;
            var row = document.createElement("div");
            row.innerHTML = "<dt></dt><dd></dd>";
            row.children[0].textContent = el.getAttribute("data-summary-label");
            row.children[1].textContent = val;
            summary.appendChild(row);
            lines.push(el.getAttribute("data-summary-label") + ": " + val);
          });
        }
        form.hidden = true;
        if (success) {
          success.classList.add("is-visible");
          success.setAttribute("tabindex", "-1");
          success.focus();
        }
        btn.disabled = false;
        btn.innerHTML = original;
      }, 700);
    });

    var again = document.querySelector('[data-reset-form="' + form.id + '"]');
    if (again) again.addEventListener("click", function () {
      form.reset();
      form.hidden = false;
      if (wa) wa.disabled = false;
      var success = document.getElementById(form.getAttribute("data-success"));
      if (success) success.classList.remove("is-visible");
      var f = form.querySelector("input, select, textarea");
      if (f) f.focus();
    });
  });
})();
