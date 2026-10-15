/* ==========================================================================
   Renders the whole page from window.CONFIG (see config.js).
   No dependencies. Works from a plain file:// open.
   ========================================================================== */
(function () {
  "use strict";

  var C = window.CONFIG;
  if (!C) { console.error("CONFIG is missing. Load config.js before script.js."); return; }

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var coarsePointer = window.matchMedia("(pointer: coarse)").matches;

  /* Intrinsic sizes for every image role. Used for width/height + aspect-ratio so nothing shifts. */
  var SIZES = {
    hero: [1920, 1280],
    step: [800, 600],
    coach: [600, 800],
    member: [200, 200],
    wide: [1600, 900],
  };

  /* ---------- helpers ---------- */
  function esc(v) {
    return String(v == null ? "" : v).replace(/[&<>"']/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
    });
  }
  function fmt(tpl, vars) {
    return tpl.replace(/\{(\w+)\}/g, function (m, k) { return vars[k] == null ? "" : vars[k]; });
  }
  function fill(tpl, vars) { return esc(fmt(tpl, vars)); }
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function icon(name, fillStyle) {
    return '<i class="' + (fillStyle ? "ph-fill" : "ph") + " ph-" + esc(name) + '" aria-hidden="true"></i>';
  }
  function addressLine() {
    var a = C.location.address;
    return a.street + ", " + a.city + ", " + a.state + " " + a.zip;
  }

  /* An image inside an aspect-ratio box. If the file is missing, wireImages() swaps in a labelled placeholder. */
  function media(img, kind, o) {
    o = o || {};
    var s = SIZES[kind];
    var ar = o.ar || s[0] + " / " + s[1];
    return (
      '<div class="media ' + (o.cls || "") + '" style="--ar:' + ar + '">' +
      '<img src="' + esc(img.src) + '" alt="' + esc(img.alt) + '" width="' + s[0] + '" height="' + s[1] + '"' +
      (o.eager ? ' fetchpriority="high" decoding="async"' : ' loading="lazy" decoding="async"') +
      ' data-kind="' + kind + '">' +
      "</div>"
    );
  }
  /* A full-bleed background image (hero, final CTA). Its parent supplies the sizing. */
  function bgImage(img, kind, eager) {
    var s = SIZES[kind];
    return (
      '<img src="' + esc(img.src) + '" alt="' + esc(img.alt) + '" width="' + s[0] + '" height="' + s[1] + '"' +
      (eager ? ' fetchpriority="high" decoding="async"' : ' loading="lazy" decoding="async"') +
      ' data-kind="' + kind + '">'
    );
  }
  function markMissing(img) {
    var parent = img.parentElement;
    if (!parent || parent.querySelector(".img-ph")) return;
    var s = SIZES[img.dataset.kind] || [0, 0];
    var src = img.getAttribute("src");
    img.remove();
    parent.classList.add("is-missing");
    parent.insertAdjacentHTML(
      "beforeend",
      '<div class="img-ph" role="img" aria-label="Missing image: ' + esc(img.getAttribute("alt")) + '">' +
        '<i class="ph ph-image" aria-hidden="true"></i>' +
        "<strong>" + esc(src) + "</strong>" +
        "<span>" + s[0] + " x " + s[1] + " goes here</span>" +
      "</div>"
    );
  }
  function wireImages(root) {
    $$("img[data-kind]", root).forEach(function (img) {
      img.addEventListener("error", function () { markMissing(img); });
      if (img.complete && img.naturalWidth === 0) markMissing(img);
    });
  }

  /* ---------- theme + meta ---------- */
  function applyTheme() {
    var root = document.documentElement;
    if (C.theme && C.theme.accent) root.style.setProperty("--accent", C.theme.accent);
    var o = (C.theme && C.theme.overrides) || {};
    Object.keys(o).forEach(function (k) { root.style.setProperty(k, o[k]); });
    if (C.meta) {
      if (C.meta.title) document.title = C.meta.title;
      var d = $('meta[name="description"]');
      if (d && C.meta.description) d.setAttribute("content", C.meta.description);
    }
  }

  /* ---------- section renderers ---------- */
  function renderHeader() {
    var w = C.brand.wordmark;
    return (
      '<header class="site-header"><div class="container site-header__inner">' +
        '<a class="wordmark" href="#top" aria-label="' + esc(C.brand.name) + '">' +
          '<span class="wordmark__a">' + esc(w[0]) + "</span>" +
          (w[1] ? '<span class="wordmark__b">' + esc(w[1]) + "</span>" : "") +
        "</a>" +
        '<a class="btn btn--primary btn--sm" href="#book" data-book>' + esc(C.cta.label) + "</a>" +
      "</div></header>"
    );
  }

  function renderTrust() {
    var h = C.hero, out = "";
    if (h.rating) {
      out += '<li class="trust__item">' + icon("star", true) +
        '<span><span class="trust__strong">' + esc(h.rating.score) + "</span> from " +
        esc(h.rating.count) + " " + esc(h.rating.source) + "</span></li>";
    }
    if (h.members) {
      out += '<li class="trust__item">' + icon("users") +
        '<span><span class="trust__strong">' + esc(h.members.count) + "</span> " + esc(h.members.label) + "</span></li>";
    }
    return out ? '<ul class="trust">' + out + "</ul>" : "";
  }

  function field(name, type, extra) {
    var L = C.form.labels, P = C.form.placeholders || {};
    return (
      '<div class="field" data-field="' + name + '">' +
        '<label class="label" for="f-' + name + '">' + esc(L[name]) + "</label>" +
        '<input class="input" id="f-' + name + '" name="' + name + '" type="' + type + '" ' + extra +
          ' placeholder="' + esc(P[name] || "") + '" required aria-required="true" aria-describedby="err-' + name + '">' +
        '<p class="field-error" id="err-' + name + '" aria-live="polite" hidden></p>' +
      "</div>"
    );
  }

  function renderSlotPicker() {
    var days = C.schedule.days;
    var chips = days.map(function (d, i) {
      return (
        '<div class="chip"><input type="radio" id="d-' + i + '" name="slotDay" value="' + esc(d.day) + '" aria-label="' + esc(d.day) + '"' +
        (i === 0 ? " checked" : "") + '><label class="chip__label" for="d-' + i + '">' + esc(d.short) + "</label></div>"
      );
    }).join("");
    return (
      '<fieldset class="slot-picker" aria-describedby="err-slot">' +
        '<legend class="legend">' + esc(C.form.labels.slot) + "</legend>" +
        '<div class="days" role="group" aria-label="Day">' + chips + "</div>" +
        '<div class="times" id="times" role="group" aria-label="Time"></div>' +
        '<p class="field-error" id="err-slot" aria-live="polite" hidden></p>' +
      "</fieldset>"
    );
  }

  function renderBooking() {
    var f = C.form;
    return (
      '<div class="booking" id="book" aria-labelledby="book-title">' +
        '<div data-view="form">' +
          '<div class="booking__head">' +
            '<h2 class="display booking__title" id="book-title">' + esc(f.title) + "</h2>" +
            (f.intro ? '<p class="booking__intro">' + esc(f.intro) + "</p>" : "") +
          "</div>" +
          '<form id="booking-form" novalidate>' +
            '<div class="field-row">' +
              field("firstName", "text", 'autocomplete="given-name" autocapitalize="words" spellcheck="false" enterkeyhint="next"') +
              field("phone", "tel", 'autocomplete="tel" inputmode="tel" enterkeyhint="next"') +
            "</div>" +
            field("email", "email", 'autocomplete="email" inputmode="email" autocapitalize="off" spellcheck="false" enterkeyhint="done"') +
            renderSlotPicker() +
            '<div class="hp" aria-hidden="true"><label>Website <input type="text" name="website" tabindex="-1" autocomplete="off"></label></div>' +
            '<div class="form-alert" id="form-alert" role="alert" hidden>' +
              icon("warning-circle") +
              '<div class="form-alert__body"><p>' + esc(f.errors.submit) + "</p>" +
              '<button type="button" class="btn btn--ghost" id="retry-btn">' + esc(C.cta.retryLabel) + "</button></div>" +
            "</div>" +
            '<button class="btn btn--primary btn--lg btn--block" type="submit" id="submit-btn">' +
              '<i class="ph ph-circle-notch spinner" id="spinner" aria-hidden="true" hidden></i>' +
              '<span id="submit-label">' + esc(C.cta.submitLabel) + "</span>" +
            "</button>" +
            '<p class="microcopy">' + esc(C.cta.microcopy) + "</p>" +
          "</form>" +
        "</div>" +
        '<div data-view="success" hidden></div>' +
      "</div>"
    );
  }

  function renderHero() {
    var h = C.hero;
    var useVideo = C.heroVideo && !reduceMotion;
    var bg = useVideo
      ? '<video src="' + esc(C.heroVideo) + '" poster="' + esc(h.image.src) + '" autoplay muted loop playsinline preload="metadata" width="1920" height="1280" aria-hidden="true"></video>'
      : bgImage(h.image, "hero", true);
    return (
      '<section class="hero" id="top" aria-labelledby="hero-title">' +
        '<div class="hero__bg">' + bg + "</div>" +
        '<div class="hero__scrim"></div>' +
        '<div class="container hero__grid">' +
          '<div class="hero__copy">' +
            '<h1 class="display hero__title" id="hero-title">' + esc(h.headline) + "</h1>" +
            '<p class="hero__sub">' + esc(h.subtext) + "</p>" +
            renderTrust() +
          "</div>" +
          renderBooking() +
        "</div>" +
      "</section>"
    );
  }

  function renderProof() {
    var items = C.testimonials.map(function (t) {
      return (
        '<figure class="quote">' +
          '<blockquote><p class="quote__text">“' + esc(t.quote) + "”</p></blockquote>" +
          '<figcaption class="person">' +
            media(t.image, "member", { cls: "media--sm", ar: "1 / 1" }) +
            "<div><p class=\"person__name\">" + esc(t.name) + '</p><p class="person__tenure">' + esc(t.tenure) + "</p></div>" +
          "</figcaption>" +
        "</figure>"
      );
    }).join("");
    return '<section class="proof" aria-label="What members say"><div class="container proof__grid">' + items + "</div></section>";
  }

  function renderFirstClass() {
    var fc = C.firstClass;
    var steps = fc.steps.map(function (s) {
      return (
        '<li class="step">' + media(s.image, "step") +
          '<h3 class="step__label">' + esc(s.label) + "</h3>" +
          '<p class="step__text">' + esc(s.text) + "</p>" +
        "</li>"
      );
    }).join("");
    return (
      '<section class="section" id="first-class" data-reveal aria-labelledby="fc-title"><div class="container">' +
        '<div class="section-head"><h2 class="display" id="fc-title">' + esc(fc.title) + "</h2>" +
        (fc.intro ? "<p>" + esc(fc.intro) + "</p>" : "") + "</div>" +
        '<ol class="steps">' + steps + "</ol>" +
      "</div></section>"
    );
  }

  function renderSchedule() {
    var s = C.schedule;
    var cards = s.days.map(function (d) {
      var slots = d.slots.map(function (sl) {
        return (
          '<button type="button" class="slot-btn" data-day="' + esc(d.day) + '" data-time="' + esc(sl.time) + '"' +
          ' aria-label="Choose ' + esc(d.day) + " at " + esc(sl.time) + (sl.label ? ", " + esc(sl.label) : "") + '">' +
            '<span class="slot-btn__time">' + esc(sl.time) + "</span>" +
            (sl.label ? '<span class="slot-btn__label">' + esc(sl.label) + "</span>" : "") +
          "</button>"
        );
      }).join("");
      return (
        '<article class="day-card"><h3 class="display day-card__name">' + esc(d.day) + "</h3>" +
        '<div class="slots">' + slots + "</div></article>"
      );
    }).join("");
    return (
      '<section class="section section--surface" id="schedule" aria-labelledby="schedule-title"><div class="container">' +
        '<div class="section-head"><h2 class="display" id="schedule-title">' + esc(s.title) + "</h2>" +
        (s.intro ? "<p>" + esc(s.intro) + "</p>" : "") + "</div>" +
        '<div class="days-grid">' + cards + "</div>" +
      "</div></section>"
    );
  }

  function renderCoaches() {
    var co = C.coaches;
    var items = co.list.map(function (c) {
      return (
        '<article class="coach">' + media(c.image, "coach", { ar: "4 / 5" }) +
          '<h3 class="display coach__name">' + esc(c.name) + "</h3>" +
          '<p class="coach__focus">' + esc(c.focus) + "</p>" +
          '<p class="coach__line">' + esc(c.line) + "</p>" +
        "</article>"
      );
    }).join("");
    return (
      '<section class="section" id="coaches" data-reveal aria-labelledby="coaches-title"><div class="container">' +
        '<div class="section-head"><h2 class="display" id="coaches-title">' + esc(co.title) + "</h2></div>" +
        '<div class="coaches__grid">' + items + "</div>" +
      "</div></section>"
    );
  }

  function renderLocation() {
    var L = C.location;
    var line = addressLine();
    var dLat = 0.0045, dLng = 0.007;
    var osm = "https://www.openstreetmap.org/export/embed.html?bbox=" +
      [L.lng - dLng, L.lat - dLat, L.lng + dLng, L.lat + dLat].join("%2C") +
      "&layer=mapnik&marker=" + L.lat + "%2C" + L.lng;
    var map = L.mapImage
      ? media({ src: L.mapImage, alt: L.mapAlt }, "wide", { cls: "map" })
      : '<div class="media map"><iframe src="' + osm + '" title="' + esc("Map to " + C.brand.name) +
        '" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe></div>';
    var dir = "https://www.google.com/maps/dir/?api=1&destination=" + encodeURIComponent(line);
    var facts = L.facts.map(function (f) {
      return (
        '<li class="fact">' + icon(f.icon) +
          '<div><p class="fact__label">' + esc(f.label) + '</p><p class="fact__text">' + esc(f.text) + "</p></div>" +
        "</li>"
      );
    }).join("");
    return (
      '<section class="section section--surface location" id="location" data-reveal aria-labelledby="loc-title"><div class="container location__grid">' +
        "<div>" +
          '<h2 class="display" id="loc-title">' + esc(L.title) + "</h2>" +
          '<address class="address">' + esc(L.address.street) + "<br>" +
            esc(L.address.city + ", " + L.address.state + " " + L.address.zip) + "</address>" +
          '<a class="btn btn--ghost" href="' + dir + '" target="_blank" rel="noopener">' + esc(L.directionsLabel) +
            icon("arrow-up-right") + '<span class="sr"> (opens in a new tab)</span></a>' +
          '<ul class="facts">' + facts + "</ul>" +
        "</div>" +
        map +
      "</div></section>"
    );
  }

  function renderFinal() {
    var f = C.finalCta;
    return (
      '<section class="final" id="final" aria-labelledby="final-title">' +
        '<div class="final__bg">' + bgImage(f.image, "wide", false) + "</div>" +
        '<div class="final__scrim"></div>' +
        '<div class="container">' +
          '<h2 class="display" id="final-title">' + esc(f.title) + "</h2>" +
          "<p>" + esc(f.text) + "</p>" +
          '<a class="btn btn--primary btn--lg" href="#book" data-book>' + esc(C.cta.label) + icon("arrow-right") + "</a>" +
        "</div>" +
      "</section>"
    );
  }

  function renderFooter() {
    var F = C.footer, w = C.brand.wordmark;
    var hours = F.hours.map(function (h) {
      return "<div><dt>" + esc(h.days) + "</dt><dd>" + esc(h.hours) + "</dd></div>";
    }).join("");
    var socials = F.socials.map(function (s) {
      return '<a href="' + esc(s.url) + '" target="_blank" rel="noopener" aria-label="' + esc(s.label) + '">' + icon(s.icon) + "</a>";
    }).join("");
    return (
      '<footer class="footer"><div class="container footer__grid">' +
        '<div class="footer__brand"><span class="wordmark"><span class="wordmark__a">' + esc(w[0]) + "</span>" +
          (w[1] ? '<span class="wordmark__b">' + esc(w[1]) + "</span>" : "") + "</span>" +
          "<p>" + esc(addressLine()) + "</p>" +
          '<div class="socials">' + socials + "</div></div>" +
        '<div class="footer__contact"><h2>Contact</h2>' +
          '<a href="tel:' + esc(F.phone.replace(/[^\d+]/g, "")) + '">' + icon("phone") + esc(F.phone) + "</a><br>" +
          '<a href="mailto:' + esc(F.email) + '">' + icon("envelope-simple") + esc(F.email) + "</a></div>" +
        '<div><h2>Hours</h2><dl>' + hours + "</dl></div>" +
      "</div></footer>"
    );
  }

  function renderStickyBar() {
    return '<div class="sticky-cta" id="sticky-cta"><a class="btn btn--primary btn--lg btn--block" href="#book" data-book>' +
      esc(C.cta.label) + "</a></div>";
  }

  /* ---------- booking form ---------- */
  function initBooking() {
    var form = $("#booking-form");
    var card = $("#book");
    var btn = $("#submit-btn");
    var spinner = $("#spinner");
    var label = $("#submit-label");
    var alertBox = $("#form-alert");
    var timesEl = $("#times");
    var live = $("#live-region");
    var errors = C.form.errors;
    var status = "idle";
    var state = { day: C.schedule.days[0].day, time: "" };

    var validators = {
      firstName: function (v) { return v.trim().length >= 2 ? "" : errors.firstName; },
      phone: function (v) {
        var digits = v.replace(/\D/g, "");
        return digits.length >= 10 && digits.length <= 15 && !/[^\d\s()+.\-]/.test(v) ? "" : errors.phone;
      },
      email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? "" : errors.email; },
    };

    function announce(msg) { if (live) live.textContent = msg; }

    function setError(name, msg) {
      var input = form.elements[name];
      var out = $("#err-" + name);
      if (msg) {
        out.innerHTML = icon("warning-circle") + "<span>" + esc(msg) + "</span>";
        out.hidden = false;
        if (input) input.setAttribute("aria-invalid", "true");
      } else {
        out.hidden = true;
        out.textContent = "";
        if (input) input.removeAttribute("aria-invalid");
      }
    }

    function validateField(name) {
      var msg = validators[name](form.elements[name].value);
      setError(name, msg);
      return !msg;
    }

    function validateSlot() {
      var ok = !!(state.day && state.time);
      setError("slot", ok ? "" : errors.slot);
      return ok;
    }

    function dayObj(name) {
      return C.schedule.days.filter(function (d) { return d.day === name; })[0];
    }

    function renderTimes() {
      var d = dayObj(state.day);
      timesEl.innerHTML = d.slots.map(function (s, i) {
        return (
          '<div class="pill"><input type="radio" id="t-' + i + '" name="slotTime" value="' + esc(s.time) + '"' +
          (state.time === s.time ? " checked" : "") + '><label class="pill__label" for="t-' + i + '">' + esc(s.time) + "</label></div>"
        );
      }).join("");
    }

    function setSubmitting(on) {
      status = on ? "submitting" : status;
      btn.disabled = on;
      btn.setAttribute("aria-busy", on ? "true" : "false");
      spinner.hidden = !on;
      label.textContent = on ? C.cta.submittingLabel : C.cta.submitLabel;
    }

    /* Events */
    form.addEventListener("focusout", function (e) {
      var n = e.target && e.target.name;
      if (validators[n]) {
        if (validateField(n) && n === "phone") formatPhone(e.target);
      }
    });
    /* Never raises an error while typing. It only clears an error once the fix is in. */
    form.addEventListener("input", function (e) {
      var n = e.target && e.target.name;
      if (validators[n] && e.target.getAttribute("aria-invalid") === "true" && !validators[n](e.target.value)) setError(n, "");
    });
    form.addEventListener("change", function (e) {
      var n = e.target && e.target.name;
      if (n === "slotDay") {
        state.day = e.target.value;
        state.time = "";
        renderTimes();
        setError("slot", "");
      } else if (n === "slotTime") {
        state.time = e.target.value;
        setError("slot", "");
      }
    });
    form.addEventListener("submit", function (e) { e.preventDefault(); submit(); });
    $("#retry-btn").addEventListener("click", function () { submit(); });

    function formatPhone(input) {
      var d = input.value.replace(/\D/g, "");
      if (d.length === 11 && d.charAt(0) === "1") d = d.slice(1);
      if (d.length === 10 && !/[^\d\s()+.\-]/.test(input.value)) {
        input.value = "(" + d.slice(0, 3) + ") " + d.slice(3, 6) + "-" + d.slice(6);
      }
    }

    function submit() {
      if (status === "submitting") return;
      var names = ["firstName", "phone", "email"];
      var firstBad = null;
      names.forEach(function (n) { if (!validateField(n) && !firstBad) firstBad = form.elements[n]; });
      if (!validateSlot() && !firstBad) firstBad = form.querySelector('input[name="slotDay"]:checked') || form.querySelector('input[name="slotDay"]');
      if (firstBad) { firstBad.focus(); return; }

      formatPhone(form.elements.phone);

      /* Honeypot: bots fill it, people never see it. Pretend it worked and send nothing. */
      if (form.elements.website.value) { showSuccess(); return; }

      alertBox.hidden = true;
      setSubmitting(true);
      announce(C.cta.submittingLabel);

      var payload = {
        firstName: form.elements.firstName.value.trim(),
        phone: form.elements.phone.value.trim(),
        email: form.elements.email.value.trim(),
        slotDay: state.day,
        slotTime: state.time,
        gymName: C.brand.name,
        submittedAt: new Date().toISOString(),
        source: "website",
      };

      send(payload).then(function () {
        setSubmitting(false);
        status = "success";
        showSuccess(payload);
      }).catch(function (err) {
        console.error("[" + C.brand.name + "] Booking failed:", err);
        status = "error";
        setSubmitting(false);
        alertBox.hidden = false;
        announce(errors.submit);
        $("#retry-btn").focus();
      });
    }

    function send(payload) {
      if (!C.webhookUrl) {
        console.warn(
          "[" + C.brand.name + "] CONFIG.webhookUrl is empty, so this booking is SIMULATED. Nothing was sent. Payload:",
          payload
        );
        var failDemo = /(^|[?&])simulate=error(&|$)/.test(window.location.search); // add ?simulate=error to demo the error state
        return new Promise(function (resolve, reject) {
          setTimeout(function () { failDemo ? reject(new Error("Simulated failure (?simulate=error)")) : resolve(); }, 900);
        });
      }
      var ctrl = typeof AbortController === "function" ? new AbortController() : null;
      var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, 15000);
      return fetch(C.webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: ctrl ? ctrl.signal : undefined,
      }).then(function (res) {
        clearTimeout(timer);
        if (!res.ok) throw new Error("Webhook responded with HTTP " + res.status);
      }, function (err) { clearTimeout(timer); throw err; });
    }

    function showSuccess(payload) {
      var s = C.form.success;
      var p = payload || {
        firstName: form.elements.firstName.value.trim(),
        email: form.elements.email.value.trim(),
        slotDay: state.day,
        slotTime: state.time,
      };
      var view = $('[data-view="success"]', card);
      view.innerHTML =
        '<div class="success" id="success" tabindex="-1">' +
          '<i class="ph-fill ph-check-circle success__icon" aria-hidden="true"></i>' +
          '<h2 class="display success__title">' + fill(s.title, p) + "</h2>" +
          '<div class="success__slot"><p class="success__day">' + esc(p.slotDay) + '</p><p class="success__time">' + esc(p.slotTime) + "</p>" +
            '<p class="success__where">' + esc(C.brand.name + ", " + addressLine()) + "</p></div>" +
          '<p class="success__body">' + fill(s.body, p) + "</p>" +
          (s.note ? '<p class="success__note">' + esc(s.note) + "</p>" : "") +
        "</div>";
      $('[data-view="form"]', card).hidden = true;
      view.hidden = false;
      announce(fmt(s.title, p) + ". " + p.slotDay + " at " + p.slotTime);
      var panel = $("#success");
      panel.focus({ preventScroll: true });
      var r = card.getBoundingClientRect();
      if (r.top < 0 || r.bottom > window.innerHeight) card.scrollIntoView({ block: "start" });
    }

    /* Called by the schedule section and the CTAs */
    function pickSlot(day, time) {
      state.day = day;
      state.time = time;
      var radio = form.querySelector('input[name="slotDay"][value="' + day + '"]');
      if (radio) radio.checked = true;
      renderTimes();
      setError("slot", "");
    }

    renderTimes();
    return { pickSlot: pickSlot, form: form, card: card };
  }

  /* ---------- scrolling to the form ---------- */
  function goToForm(booking, opts) {
    opts = opts || {};
    var card = booking.card, form = booking.form;
    var header = $(".site-header").offsetHeight;
    var r = card.getBoundingClientRect();
    var fullyVisible = r.top >= header && r.bottom <= window.innerHeight;
    if (!fullyVisible) card.scrollIntoView({ block: "start" });
    var formView = $('[data-view="form"]', card);
    if (formView.hidden) return;
    if (opts.focus !== false && !coarsePointer) {
      var target = ["firstName", "phone", "email"].map(function (n) { return form.elements[n]; })
        .filter(function (el) { return !el.value; })[0];
      (target || $("#submit-btn")).focus({ preventScroll: true });
    }
  }

  /* ---------- page behaviours ---------- */
  function initSticky() {
    var bar = $("#sticky-cta");
    if (!("IntersectionObserver" in window)) return;
    var inView = { hero: true, final: false };
    function update() { bar.classList.toggle("is-visible", !inView.hero && !inView.final); }
    function watch(sel, key) {
      var el = $(sel);
      if (!el) return;
      new IntersectionObserver(function (entries) {
        inView[key] = entries[0].isIntersecting;
        update();
      }).observe(el);
    }
    watch("#top", "hero");
    watch("#final", "final");
  }

  function initReveal() {
    if (reduceMotion || !("IntersectionObserver" in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.06, rootMargin: "0px 0px -8% 0px" });
    $$("[data-reveal]").forEach(function (el) { el.classList.add("reveal"); io.observe(el); });
  }

  function initHeroVideo() {
    var v = $(".hero__bg video");
    if (!v) return;
    v.muted = true;
    v.addEventListener("error", function () {
      /* Video missing or unplayable: fall back to the still */
      var bg = v.parentElement;
      v.remove();
      bg.insertAdjacentHTML("afterbegin", bgImage(C.hero.image, "hero", true));
      wireImages(bg);
    });
    var p = v.play();
    if (p && p.catch) p.catch(function () { /* autoplay blocked: the poster stays */ });
  }

  /* ---------- boot ---------- */
  function boot() {
    applyTheme();
    var app = $("#app");
    app.innerHTML =
      renderHeader() +
      '<main id="main">' +
        renderHero() + renderProof() + renderFirstClass() + renderSchedule() +
        renderCoaches() + renderLocation() + renderFinal() +
      "</main>" +
      renderFooter() + renderStickyBar() +
      '<div class="sr" id="live-region" role="status" aria-live="polite"></div>';

    wireImages(app);
    initHeroVideo();
    var booking = initBooking();

    document.addEventListener("click", function (e) {
      var cta = e.target.closest("[data-book]");
      if (cta) { e.preventDefault(); goToForm(booking); return; }
      var slot = e.target.closest(".slot-btn");
      if (slot) {
        e.preventDefault();
        var formView = $('[data-view="form"]', booking.card);
        if (!formView.hidden) booking.pickSlot(slot.dataset.day, slot.dataset.time);
        goToForm(booking);
      }
    });

    initSticky();
    initReveal();
  }

  boot();
})();
