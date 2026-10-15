/* ==========================================================================
   Renders every page from window.CONFIG (see config.js).
   Each HTML file is a tiny shell with <body data-page="...">.
   No dependencies. Works from a plain file:// open.
   ========================================================================== */
(function () {
  "use strict";

  var C = window.CONFIG;
  if (!C) { console.error("CONFIG is missing. Load config.js before script.js."); return; }

  var PAGE = document.body.getAttribute("data-page") || "home";
  var HAS_FORM = PAGE === "home" || PAGE === "schedule"; // pages that render the booking card
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var coarsePointer = window.matchMedia("(pointer: coarse)").matches;
  var canHover = window.matchMedia("(hover: hover)").matches;

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
  function bookHref() { return HAS_FORM ? "#book" : C.bookingPage + "#book"; }
  function bookLink(cls, extra) {
    return '<a class="btn btn--primary ' + cls + '" href="' + esc(bookHref()) + '" data-book>' + esc(C.cta.label) + (extra || "") + "</a>";
  }
  function moreLink(href, label) {
    return '<a class="more-link" href="' + esc(href) + '">' + esc(label) + icon("arrow-right") + "</a>";
  }
  function navHref(page) {
    var n = C.nav.filter(function (x) { return x.page === page; })[0];
    return n ? n.href : "index.html";
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
  /* A full-bleed background image (hero, page hero, final CTA). Its parent supplies the sizing. */
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
      img.addEventListener("load", function () { img.classList.add("is-loaded"); });
      img.addEventListener("error", function () { markMissing(img); });
      if (img.complete) {
        if (img.naturalWidth === 0) markMissing(img); else img.classList.add("is-loaded");
      }
    });
  }

  /* ---------- theme + meta ---------- */
  function applyTheme() {
    var root = document.documentElement;
    if (C.theme && C.theme.accent) root.style.setProperty("--accent", C.theme.accent);
    var o = (C.theme && C.theme.overrides) || {};
    Object.keys(o).forEach(function (k) { root.style.setProperty(k, o[k]); });
    var m = C.meta && C.meta[PAGE];
    if (m) {
      if (m.title) document.title = m.title;
      var d = $('meta[name="description"]');
      if (d && m.description) d.setAttribute("content", m.description);
    }
  }

  /* ---------- schedule helpers ---------- */
  function periodOf(time) {
    var m = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(time);
    if (!m) return C.schedule.periods[0].key;
    var h = parseInt(m[1], 10) % 12;
    if (/pm/i.test(m[3])) h += 12;
    return h < 11 ? "morning" : h < 16 ? "midday" : "evening";
  }
  function slotBtn(d, sl) {
    return (
      '<button type="button" class="slot-btn" data-day="' + esc(d.day) + '" data-time="' + esc(sl.time) + '"' +
      ' aria-label="Choose ' + esc(d.day) + " at " + esc(sl.time) + (sl.label ? ", " + esc(sl.label) : "") + '">' +
        '<span class="slot-btn__time">' + esc(sl.time) + "</span>" +
        (sl.label ? '<span class="slot-btn__label">' + esc(sl.label) + "</span>" : "") +
      "</button>"
    );
  }

  /* ---------- shared: header, final CTA, footer ---------- */
  function renderHeader() {
    var w = C.brand.wordmark;
    var links = C.nav.map(function (n) {
      return '<li><a href="' + esc(n.href) + '"' + (n.page === PAGE ? ' aria-current="page"' : "") + ">" + esc(n.label) + "</a></li>";
    }).join("");
    var mlinks = C.nav.map(function (n) {
      return '<li><a href="' + esc(n.href) + '"' + (n.page === PAGE ? ' aria-current="page"' : "") + "><span>" + esc(n.label) + "</span>" + icon("arrow-right") + "</a></li>";
    }).join("");
    var F = C.footer;
    return (
      '<header class="site-header"><div class="container site-header__inner">' +
        '<a class="wordmark" href="index.html" aria-label="' + esc(C.brand.name) + ', home">' +
          '<span class="wordmark__a">' + esc(w[0]) + "</span>" +
          (w[1] ? '<span class="wordmark__b">' + esc(w[1]) + "</span>" : "") +
        "</a>" +
        '<nav class="nav" aria-label="Main"><ul>' + links + "</ul></nav>" +
        '<div class="site-header__actions">' +
          bookLink("btn--sm") +
          '<button type="button" class="nav-toggle" id="nav-toggle" aria-expanded="false" aria-controls="mobile-nav" aria-label="Menu">' +
            icon("list") + "</button>" +
        "</div>" +
      "</div>" +
      '<nav class="mobile-nav" id="mobile-nav" aria-label="Menu" hidden><div class="container"><ul>' + mlinks + "</ul>" +
        '<div class="mobile-nav__foot"><a class="btn btn--ghost btn--block" href="tel:' + esc(F.phone.replace(/[^\d+]/g, "")) + '">' + icon("phone") + esc(F.phone) + "</a>" +
        "<p>" + esc(F.hours[0].days + ": " + F.hours[0].hours) + "</p></div></div></nav>" +
      "</header>"
    );
  }

  function renderFinal() {
    var f = C.finalCta;
    return (
      '<section class="final" id="final" aria-labelledby="final-title">' +
        '<div class="bg-photo">' + bgImage(f.image, "wide", false) + "</div>" +
        '<div class="bg-scrim"></div>' +
        '<div class="container">' +
          '<h2 class="display" id="final-title">' + esc(f.title) + "</h2>" +
          "<p>" + esc(f.text) + "</p>" +
          bookLink("btn--lg", icon("arrow-right")) +
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
    var links = C.nav.map(function (n) { return '<li><a href="' + esc(n.href) + '">' + esc(n.label) + "</a></li>"; }).join("");
    return (
      '<footer class="footer"><div class="container footer__grid">' +
        '<div class="footer__brand"><a class="wordmark" href="index.html"><span class="wordmark__a">' + esc(w[0]) + "</span>" +
          (w[1] ? '<span class="wordmark__b">' + esc(w[1]) + "</span>" : "") + "</a>" +
          "<p>" + esc(addressLine()) + "</p>" +
          '<div class="socials">' + socials + "</div></div>" +
        '<div><h2>Explore</h2><ul class="footer__links">' + links + "</ul></div>" +
        '<div class="footer__contact"><h2>Contact</h2>' +
          '<a href="tel:' + esc(F.phone.replace(/[^\d+]/g, "")) + '">' + icon("phone") + esc(F.phone) + "</a><br>" +
          '<a href="mailto:' + esc(F.email) + '">' + icon("envelope-simple") + esc(F.email) + "</a></div>" +
        '<div><h2>Hours</h2><dl>' + hours + "</dl></div>" +
      "</div></footer>"
    );
  }

  function renderStickyBar() {
    var note = C.cta.stickyTitle
      ? '<p class="sticky-cta__note"><strong>' + esc(C.cta.stickyTitle) + "</strong><span>" + esc(C.cta.stickySub || "") + "</span></p>"
      : "";
    return '<div class="sticky-cta' + (note ? " sticky-cta--note" : "") + '" id="sticky-cta">' + note + bookLink("btn--lg" + (note ? "" : " btn--block")) + "</div>";
  }

  /* Short photo header used by every page except Home */
  function renderPageHero(p) {
    return (
      '<section class="page-hero" id="top" aria-labelledby="page-title">' +
        '<div class="bg-photo">' + bgImage(p.image, "wide", true) + "</div>" +
        '<div class="bg-scrim"></div>' +
        '<div class="container">' +
          '<h1 class="display" id="page-title">' + esc(p.title) + "</h1>" +
          "<p>" + esc(p.intro) + "</p>" +
        "</div>" +
      "</section>"
    );
  }

  function renderFaqs(title, faqs) {
    var items = faqs.map(function (f) {
      return (
        '<details class="faq"><summary><span>' + esc(f.q) + "</span>" + icon("plus") + "</summary>" +
        "<p>" + esc(f.a) + "</p></details>"
      );
    }).join("");
    return (
      '<section class="section" aria-labelledby="faq-title"><div class="container faq-wrap">' +
        '<div class="section-head"><h2 class="display" id="faq-title">' + esc(title) + "</h2></div>" +
        '<div class="faqs">' + items + "</div>" +
      "</div></section>"
    );
  }

  /* ---------- booking card ---------- */
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

  function renderBooking(cls) {
    var f = C.form;
    return (
      '<div class="booking ' + (cls || "") + '" id="book" aria-labelledby="book-title">' +
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

  /* ---------- HOME sections ---------- */
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

  /* Interactive first class walkthrough: list of moments on one side, a big photo on the other */
  function renderStepper(opts) {
    opts = opts || {};
    var fc = C.firstClass;
    var tabs = fc.steps.map(function (s, i) {
      return (
        '<li><button type="button" class="stepper__item" role="tab" id="st-' + i + '" aria-controls="sp-' + i + '"' +
        ' aria-selected="' + (i === 0) + '" tabindex="' + (i === 0 ? 0 : -1) + '">' +
          '<span class="stepper__label">' + esc(s.label) + "</span>" +
          '<span class="stepper__text">' + esc(s.text) + "</span>" +
        "</button></li>"
      );
    }).join("");
    var panels = fc.steps.map(function (s, i) {
      return (
        '<div class="stepper__photo' + (i === 0 ? " is-active" : "") + '" role="tabpanel" id="sp-' + i + '" aria-labelledby="st-' + i + '">' +
          bgImage(s.image, "step", false) + "</div>"
      );
    }).join("");
    return (
      '<section class="section" id="first-class" aria-labelledby="fc-title"><div class="container">' +
        '<div class="section-head"><h2 class="display" id="fc-title">' + esc(fc.title) + "</h2>" +
        (fc.intro ? "<p>" + esc(fc.intro) + "</p>" : "") + "</div>" +
        '<div class="stepper">' +
          '<div class="stepper__stage">' + panels + "</div>" +
          '<ol class="stepper__list" role="tablist" aria-orientation="vertical" aria-label="' + esc(fc.title) + '">' + tabs + "</ol>" +
        "</div>" +
        (opts.more ? '<div class="section-more">' + moreLink(navHref("first-class"), fc.moreLabel) + "</div>" : "") +
      "</div></section>"
    );
  }

  /* Week board: days across, Morning / Midday / Evening down */
  function renderBoard() {
    var S = C.schedule, days = S.days;
    var head = days.map(function (d) { return '<th scope="col" class="display">' + esc(d.short) + "</th>"; }).join("");
    var rows = S.periods.map(function (p) {
      var any = false;
      var cells = days.map(function (d) {
        var sl = d.slots.filter(function (s) { return periodOf(s.time) === p.key; });
        if (!sl.length) return '<td class="is-empty"></td>';
        any = true;
        return '<td><div class="board__stack">' + sl.map(function (s) { return slotBtn(d, s); }).join("") + "</div></td>";
      }).join("");
      return any ? '<tr><th scope="row">' + esc(p.label) + "</th>" + cells + "</tr>" : "";
    }).join("");
    return (
      '<div class="board"><table class="board__table"><caption class="sr">Class times by day</caption>' +
        "<thead><tr><td></td>" + head + "</tr></thead><tbody>" + rows + "</tbody></table></div>"
    );
  }

  /* Day cards: the same slots for phones and tablets */
  function renderDayCards() {
    var cards = C.schedule.days.map(function (d) {
      return (
        '<article class="day-card"><h3 class="display day-card__name">' + esc(d.day) + "</h3>" +
        '<div class="slots">' + d.slots.map(function (s) { return slotBtn(d, s); }).join("") + "</div></article>"
      );
    }).join("");
    return '<div class="day-cards">' + cards + "</div>";
  }

  function renderScheduleHome() {
    var s = C.schedule;
    return (
      '<section class="section section--surface" id="schedule" aria-labelledby="schedule-title"><div class="container">' +
        '<div class="section-head"><h2 class="display" id="schedule-title">' + esc(s.title) + "</h2>" +
        (s.intro ? "<p>" + esc(s.intro) + "</p>" : "") + "</div>" +
        renderBoard() + renderDayCards() +
        '<div class="section-more">' + moreLink(navHref("schedule"), s.moreLabel) + "</div>" +
      "</div></section>"
    );
  }

  function renderCoachesHome() {
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
      '<section class="section" id="coaches" aria-labelledby="coaches-title"><div class="container">' +
        '<div class="section-head"><h2 class="display" id="coaches-title">' + esc(co.title) + "</h2></div>" +
        '<div class="coaches__grid">' + items + "</div>" +
        '<div class="section-more">' + moreLink(navHref("coaches"), co.moreLabel) + "</div>" +
      "</div></section>"
    );
  }

  /* Map + facts, used on Home (as a teaser) and on the Visit page */
  function renderMap() {
    var L = C.location;
    var dLat = 0.0045, dLng = 0.007;
    var osm = "https://www.openstreetmap.org/export/embed.html?bbox=" +
      [L.lng - dLng, L.lat - dLat, L.lng + dLng, L.lat + dLat].join("%2C") +
      "&layer=mapnik&marker=" + L.lat + "%2C" + L.lng;
    return L.mapImage
      ? media({ src: L.mapImage, alt: L.mapAlt }, "wide", { cls: "map" })
      : '<div class="media map"><iframe src="' + osm + '" title="' + esc("Map to " + C.brand.name) +
        '" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe></div>';
  }
  function directionsLink() {
    var dir = "https://www.google.com/maps/dir/?api=1&destination=" + encodeURIComponent(addressLine());
    return '<a class="btn btn--ghost" href="' + dir + '" target="_blank" rel="noopener">' + esc(C.location.directionsLabel) +
      icon("arrow-up-right") + '<span class="sr"> (opens in a new tab)</span></a>';
  }
  function renderFacts() {
    return '<ul class="facts">' + C.location.facts.map(function (f) {
      return (
        '<li class="fact">' + icon(f.icon) +
          '<div><p class="fact__label">' + esc(f.label) + '</p><p class="fact__text">' + esc(f.text) + "</p></div>" +
        "</li>"
      );
    }).join("") + "</ul>";
  }
  function renderAddress() {
    var a = C.location.address;
    return '<address class="address">' + esc(a.street) + "<br>" + esc(a.city + ", " + a.state + " " + a.zip) + "</address>";
  }

  function renderLocationHome() {
    var L = C.location;
    return (
      '<section class="section section--surface location" id="location" aria-labelledby="loc-title"><div class="container location__grid">' +
        "<div>" +
          '<h2 class="display" id="loc-title">' + esc(L.title) + "</h2>" +
          renderAddress() + directionsLink() + renderFacts() +
          '<div class="section-more section-more--tight">' + moreLink(navHref("visit"), L.moreLabel) + "</div>" +
        "</div>" +
        renderMap() +
      "</div></section>"
    );
  }

  /* ---------- SCHEDULE page ---------- */
  function renderScheduleRows() {
    var rows = C.schedule.days.map(function (d) {
      return (
        '<section class="day-row" aria-label="' + esc(d.day) + '"><h2 class="display day-row__name">' + esc(d.day) + "</h2>" +
        '<div class="slots slots--row">' + d.slots.map(function (s) { return slotBtn(d, s); }).join("") + "</div></section>"
      );
    }).join("");
    return '<div class="day-rows">' + rows + "</div>";
  }

  function renderSchedulePageBody() {
    var s = C.schedule;
    var types = s.classTypes.map(function (t) {
      return '<div class="type"><h3 class="type__label">' + esc(t.label) + '</h3><p class="type__text">' + esc(t.text) + "</p></div>";
    }).join("");
    return (
      '<section class="section" aria-label="Class times"><div class="container schedule-layout">' +
        '<div><div class="section-head"><h2 class="display">' + esc(s.title) + "</h2>" +
          (s.intro ? "<p>" + esc(s.intro) + "</p>" : "") + "</div>" + renderScheduleRows() +
          (s.durationNote ? '<p class="duration-note">' + icon("clock") + esc(s.durationNote) + "</p>" : "") +
        "</div>" +
        renderBooking("booking--sticky") +
      "</div></section>" +
      '<section class="section section--surface" aria-labelledby="types-title"><div class="container">' +
        '<div class="section-head"><h2 class="display" id="types-title">' + esc(s.classTypesTitle) + "</h2></div>" +
        '<div class="types">' + types + "</div>" +
      "</div></section>"
    );
  }

  /* ---------- FIRST CLASS page ---------- */
  function renderBring() {
    var b = C.firstClass.bring;
    var items = b.items.map(function (it) {
      return (
        '<li class="bring__item">' + icon(it.icon) +
          '<div><p class="bring__label">' + esc(it.label) + '</p><p class="bring__text">' + esc(it.text) + "</p></div></li>"
      );
    }).join("");
    return (
      '<section class="section section--surface" aria-labelledby="bring-title"><div class="container bring">' +
        '<div class="bring__copy"><div class="section-head"><h2 class="display" id="bring-title">' + esc(b.title) + "</h2>" +
          "<p>" + esc(b.intro) + "</p></div><ul class=\"bring__list\">" + items + "</ul></div>" +
        media(b.image, "step", { cls: "bring__photo" }) +
      "</div></section>"
    );
  }

  /* ---------- COACHES page ---------- */
  function renderProfiles() {
    var co = C.coaches;
    var items = co.list.map(function (c) {
      var creds = c.credentials.map(function (x) { return "<li>" + icon("check") + esc(x) + "</li>"; }).join("");
      return (
        '<article class="profile">' +
          media(c.image, "coach", { ar: "4 / 5", cls: "profile__photo" }) +
          '<div class="profile__body">' +
            '<p class="profile__focus">' + esc(c.focus) + "</p>" +
            '<h2 class="display profile__name">' + esc(c.name) + "</h2>" +
            '<p class="profile__bio">' + esc(c.bio) + "</p>" +
            '<h3 class="profile__sub">' + esc(co.credentialsTitle) + "</h3>" +
            '<ul class="profile__creds">' + creds + "</ul>" +
            '<p class="profile__ask">' + esc(c.ask) + "</p>" +
          "</div>" +
        "</article>"
      );
    }).join("");
    return '<section class="section" aria-label="Coaches"><div class="container profiles">' + items + "</div></section>";
  }

  /* ---------- MEMBERSHIPS page ---------- */
  function renderPlans() {
    var M = C.memberships;
    var plans = M.plans.map(function (p) {
      var feats = p.features.map(function (f) { return "<li>" + icon("check") + esc(f) + "</li>"; }).join("");
      return (
        '<article class="plan' + (p.featured ? " plan--featured" : "") + '">' +
          (p.tag ? '<p class="plan__tag">' + esc(p.tag) + "</p>" : "") +
          '<h3 class="display plan__name">' + esc(p.name) + "</h3>" +
          '<p class="plan__price"><span class="display">' + esc(p.price) + '</span> <span class="plan__per">' + esc(p.per) + "</span></p>" +
          '<p class="plan__blurb">' + esc(p.blurb) + "</p>" +
          '<ul class="plan__features">' + feats + "</ul>" +
          '<a class="btn ' + (p.featured ? "btn--primary" : "btn--ghost") + ' btn--block" href="' + esc(bookHref()) + '" data-book>' + esc(C.cta.label) + "</a>" +
        "</article>"
      );
    }).join("");
    var inc = M.included.map(function (i) {
      return '<li class="included__item">' + icon(i.icon) + "<span>" + esc(i.text) + "</span></li>";
    }).join("");
    return (
      '<section class="section" aria-labelledby="plans-title"><div class="container">' +
        '<div class="section-head"><h2 class="display" id="plans-title">' + esc(M.plansTitle) + "</h2></div>" +
        '<div class="plans">' + plans + "</div>" +
      "</div></section>" +
      '<section class="section section--surface" aria-labelledby="inc-title"><div class="container">' +
        '<div class="section-head"><h2 class="display" id="inc-title">' + esc(M.includedTitle) + "</h2></div>" +
        '<ul class="included">' + inc + "</ul>" +
      "</div></section>"
    );
  }

  /* ---------- VISIT page ---------- */
  function renderVisitBody() {
    var L = C.location, F = C.footer;
    var hours = F.hours.map(function (h) {
      return "<div><dt>" + esc(h.days) + "</dt><dd>" + esc(h.hours) + "</dd></div>";
    }).join("");
    return (
      '<section class="section" aria-labelledby="loc-title"><div class="container location__grid">' +
        "<div>" +
          '<h2 class="display" id="loc-title">' + esc(L.title) + "</h2>" +
          renderAddress() + directionsLink() + renderFacts() +
        "</div>" +
        renderMap() +
      "</div></section>" +
      '<section class="section section--surface" aria-labelledby="door-title"><div class="container door">' +
        media(L.entranceImage, "step", { cls: "door__photo" }) +
        '<div class="door__copy"><h2 class="display" id="door-title">' + esc(L.entranceTitle) + "</h2><p>" + esc(L.entranceText) + "</p></div>" +
      "</div></section>" +
      '<section class="section" aria-label="Hours and contact"><div class="container contact">' +
        '<div><h2 class="display contact__title">' + esc(L.hoursTitle) + '</h2><dl class="hours">' + hours + "</dl></div>" +
        '<div><h2 class="display contact__title">' + esc(L.contactTitle) + "</h2><p class=\"contact__text\">" + esc(L.contactText) + "</p>" +
          '<div class="contact__links">' +
            '<a class="btn btn--ghost" href="tel:' + esc(F.phone.replace(/[^\d+]/g, "")) + '">' + icon("phone") + esc(F.phone) + "</a>" +
            '<a class="btn btn--ghost" href="mailto:' + esc(F.email) + '">' + icon("envelope-simple") + esc(F.email) + "</a>" +
          "</div></div>" +
      "</div></section>"
    );
  }

  /* ---------- page registry ---------- */
  function renderBodyFor(page) {
    switch (page) {
      case "first-class":
        return renderPageHero(C.firstClass.page) + renderStepper() + renderBring() + renderFaqs(C.firstClass.faqsTitle, C.firstClass.faqs) + renderFinal();
      case "schedule":
        return renderPageHero(C.schedule.page) + renderSchedulePageBody() + renderFinal();
      case "coaches":
        return renderPageHero(C.coaches.page) + renderProfiles() + renderFinal();
      case "memberships":
        return renderPageHero(C.memberships.page) + renderPlans() + renderFaqs(C.memberships.faqsTitle, C.memberships.faqs) + renderFinal();
      case "visit":
        return renderPageHero(C.location.page) + renderVisitBody() + renderFinal();
      default:
        return renderHero() + renderProof() + renderStepper({ more: true }) + renderScheduleHome() + renderCoachesHome() + renderLocationHome() + renderFinal();
    }
  }

  /* ---------- booking form ---------- */
  function initBooking() {
    var form = $("#booking-form");
    if (!form) return null;
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

    /* ?day=Tuesday&time=6:00%20AM pre-selects a slot */
    var q = new URLSearchParams(window.location.search);
    var qd = dayObj(q.get("day") || "");
    if (qd && qd.slots.some(function (s) { return s.time === q.get("time"); })) pickSlot(qd.day, q.get("time"));

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
  function initMenu() {
    var toggle = $("#nav-toggle"), panel = $("#mobile-nav");
    if (!toggle || !panel) return;
    function set(open) {
      panel.hidden = !open;
      document.documentElement.classList.toggle("menu-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.innerHTML = icon(open ? "x" : "list");
    }
    toggle.addEventListener("click", function () { set(panel.hidden); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !panel.hidden) { set(false); toggle.focus(); }
    });
    window.matchMedia("(min-width: 70em)").addEventListener("change", function (e) { if (e.matches) set(false); });
  }

  function initStepper() {
    var root = $(".stepper");
    if (!root) return;
    var tabs = $$('[role="tab"]', root), panels = $$(".stepper__photo", root);
    function select(i, focus) {
      tabs.forEach(function (t, k) {
        t.setAttribute("aria-selected", k === i ? "true" : "false");
        t.tabIndex = k === i ? 0 : -1;
        panels[k].classList.toggle("is-active", k === i);
      });
      if (focus) tabs[i].focus();
    }
    tabs.forEach(function (t, i) {
      t.addEventListener("click", function () { select(i); });
      t.addEventListener("focus", function () { select(i); });
      if (canHover) t.addEventListener("mouseenter", function () { select(i); });
      t.addEventListener("keydown", function (e) {
        var k = e.key, n = tabs.length;
        if (k === "ArrowDown" || k === "ArrowRight") { e.preventDefault(); select((i + 1) % n, true); }
        else if (k === "ArrowUp" || k === "ArrowLeft") { e.preventDefault(); select((i - 1 + n) % n, true); }
        else if (k === "Home") { e.preventDefault(); select(0, true); }
        else if (k === "End") { e.preventDefault(); select(n - 1, true); }
      });
    });
  }

  function initSticky() {
    var bar = $("#sticky-cta");
    if (!bar || !("IntersectionObserver" in window)) return;
    var inView = { top: true, final: false, card: false };
    function update() { bar.classList.toggle("is-visible", !inView.top && !inView.final && !inView.card); }
    function watch(sel, key) {
      var el = $(sel);
      if (!el) return;
      new IntersectionObserver(function (entries) {
        inView[key] = entries[0].isIntersecting;
        update();
      }).observe(el);
    }
    watch("#top", "top");
    watch("#final", "final");
    if (PAGE !== "home") watch("#book", "card"); // on Home the card is part of the hero
  }

  /* Scroll reveal: every item rises in as it enters view; items arriving together are staggered. */
  var REVEAL = [
    ".proof .quote", ".section-head", ".stepper__stage", ".stepper__item", ".board .slot-btn", ".day-card", ".day-row",
    ".duration-note", ".coach", ".profile__photo", ".profile__body", ".plan", ".included__item", ".type", ".faq",
    ".fact", ".bring__item", ".bring__photo", ".door__photo", ".door__copy", ".contact > div", ".map", ".address",
    ".location__grid .btn", ".final .container > *", ".footer__grid > *", ".section-more"
  ].join(",");
  function initReveal() {
    if (reduceMotion || !("IntersectionObserver" in window)) return;
    var io = new IntersectionObserver(function (entries) {
      var n = 0;
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target, delay = Math.min(n++ * 70, 490);
        el.style.transitionDelay = delay + "ms";
        el.classList.add("is-in");
        io.unobserve(el);
        /* Drop the helper classes once settled, so hover and press transitions are not delayed */
        setTimeout(function () { el.classList.remove("rv", "is-in"); el.style.transitionDelay = ""; }, delay + 800);
      });
    }, { threshold: 0, rootMargin: "0px 0px -6% 0px" });
    $$(REVEAL).forEach(function (el) { el.classList.add("rv"); io.observe(el); });
  }

  /* On phones the plans are a swipe row: start with the featured plan in the middle */
  function initPlans() {
    var row = $(".plans"), f = $(".plan--featured");
    if (!row || !f || row.scrollWidth <= row.clientWidth) return;
    row.scrollLeft = f.offsetLeft - (row.clientWidth - f.offsetWidth) / 2;
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
      '<main id="main">' + renderBodyFor(PAGE) + "</main>" +
      renderFooter() + renderStickyBar() +
      '<div class="sr" id="live-region" role="status" aria-live="polite"></div>';

    wireImages(app);
    initHeroVideo();
    initMenu();
    initStepper();
    initPlans();
    var booking = initBooking();

    document.addEventListener("click", function (e) {
      var cta = e.target.closest("[data-book]");
      if (cta && booking) { e.preventDefault(); goToForm(booking); return; }
      var slot = e.target.closest(".slot-btn");
      if (slot && booking) {
        e.preventDefault();
        var formView = $('[data-view="form"]', booking.card);
        if (!formView.hidden) booking.pickSlot(slot.dataset.day, slot.dataset.time);
        goToForm(booking);
      }
    });

    initSticky();
    initReveal();

    /* Arriving with #book (from another page's CTA): content is rendered by script, so scroll once it exists */
    if (booking && window.location.hash === "#book") {
      requestAnimationFrame(function () { goToForm(booking, { focus: false }); });
    }
  }

  boot();
})();
