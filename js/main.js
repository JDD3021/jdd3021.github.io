(function () {
  "use strict";

  var header = document.getElementById("site-header");
  var menuToggle = document.getElementById("menu-toggle");
  var mainNav = document.getElementById("main-nav");
  var langToggle = document.getElementById("lang-toggle");
  var yearEl = document.getElementById("year");

  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // Theme switch (light default, dark alternate). The initial theme is set by
  // an inline script in <head> to avoid a flash; this wires up the button.
  var themeToggle = document.getElementById("theme-toggle");
  var THEME_LABELS = {
    en: { toDark: "Switch to dark theme", toLight: "Switch to light theme" },
    fr: { toDark: "Passer au thème sombre", toLight: "Passer au thème clair" }
  };

  function currentTheme() {
    return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
  }

  function updateThemeLabel() {
    if (!themeToggle) return;
    var labels = THEME_LABELS[document.documentElement.getAttribute("lang")] || THEME_LABELS.en;
    var label = currentTheme() === "dark" ? labels.toLight : labels.toDark;
    themeToggle.setAttribute("aria-label", label);
    themeToggle.setAttribute("title", label);
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    var meta = document.getElementById("meta-theme-color");
    if (meta) meta.setAttribute("content", theme === "dark" ? "#100B16" : "#FFFFFF");
    updateThemeLabel();
    try {
      localStorage.setItem("site-theme", theme);
    } catch (e) {
      /* localStorage unavailable - ignore */
    }
  }

  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      applyTheme(currentTheme() === "dark" ? "light" : "dark");
    });
    updateThemeLabel();
  }

  // Profile photo: reveal the real image only once it has actually loaded,
  // otherwise keep showing the monogram placeholder underneath it.
  document.querySelectorAll("[data-photo-fallback] img").forEach(function (img) {
    if (img.complete && img.naturalWidth > 0) {
      img.classList.add("is-loaded");
      return;
    }
    img.addEventListener("load", function () {
      img.classList.add("is-loaded");
    });
  });

  // Sticky header shadow on scroll
  function onScroll() {
    if (window.scrollY > 8) {
      header.classList.add("is-scrolled");
    } else {
      header.classList.remove("is-scrolled");
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Mobile menu toggle
  if (menuToggle && mainNav) {
    menuToggle.addEventListener("click", function () {
      var isOpen = mainNav.classList.toggle("is-open");
      menuToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
      menuToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
    });

    mainNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        mainNav.classList.remove("is-open");
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.setAttribute("aria-label", "Open menu");
      });
    });
  }

  // Navigation: dropdown groups (desktop) + highlight of the section in view
  var navGroups = Array.prototype.slice.call(document.querySelectorAll(".nav-group"));
  var desktopNav = window.matchMedia("(min-width: 1101px)");
  var hoverCapable = window.matchMedia("(hover: hover)");

  function setGroupOpen(group, open) {
    group.classList.toggle("is-open", open);
    if (desktopNav.matches) {
      group.querySelector(".nav-group-toggle").setAttribute("aria-expanded", open ? "true" : "false");
    }
  }

  function closeGroups(except) {
    navGroups.forEach(function (g) {
      if (g !== except) setGroupOpen(g, false);
    });
  }

  // On small screens the groups are always expanded headings, not buttons
  function syncNavMode() {
    navGroups.forEach(function (g) {
      var toggle = g.querySelector(".nav-group-toggle");
      if (desktopNav.matches) {
        toggle.removeAttribute("tabindex");
        toggle.removeAttribute("aria-disabled");
        toggle.setAttribute("aria-expanded", g.classList.contains("is-open") ? "true" : "false");
      } else {
        setGroupOpen(g, false);
        toggle.setAttribute("tabindex", "-1");
        toggle.setAttribute("aria-disabled", "true");
        toggle.removeAttribute("aria-expanded");
      }
    });
  }

  navGroups.forEach(function (group) {
    var toggle = group.querySelector(".nav-group-toggle");

    toggle.addEventListener("click", function () {
      if (!desktopNav.matches) return;
      // With a mouse the hover already opened it; a click must not close it again
      var willOpen = hoverCapable.matches ? true : !group.classList.contains("is-open");
      closeGroups(group);
      setGroupOpen(group, willOpen);
    });
    group.addEventListener("mouseenter", function () {
      if (desktopNav.matches && hoverCapable.matches) {
        closeGroups(group);
        setGroupOpen(group, true);
      }
    });
    group.addEventListener("mouseleave", function () {
      if (desktopNav.matches && hoverCapable.matches) setGroupOpen(group, false);
    });
    group.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && group.classList.contains("is-open")) {
        setGroupOpen(group, false);
        toggle.focus();
      }
    });
    group.addEventListener("focusout", function (e) {
      if (desktopNav.matches && !group.contains(e.relatedTarget)) setGroupOpen(group, false);
    });
    group.querySelectorAll(".nav-submenu a").forEach(function (link) {
      link.addEventListener("click", function () { setGroupOpen(group, false); });
    });
  });

  document.addEventListener("click", function (e) {
    if (!e.target.closest || !e.target.closest(".nav-group")) closeGroups();
  });
  if (desktopNav.addEventListener) {
    desktopNav.addEventListener("change", syncNavMode);
  } else if (desktopNav.addListener) {
    desktopNav.addListener(syncNavMode);
  }
  syncNavMode();

  var spyTargets = [];
  Array.prototype.forEach.call(document.querySelectorAll(".nav-list a[href^='#']"), function (link) {
    var el = document.getElementById(link.getAttribute("href").slice(1));
    if (el) spyTargets.push({ link: link, el: el });
  });
  var spyTicking = false;

  function updateActiveSection() {
    spyTicking = false;
    if (!spyTargets.length) return;
    var line = (header ? header.offsetHeight : 72) + window.innerHeight * 0.3;
    var current = null;
    var best = -Infinity;
    spyTargets.forEach(function (t) {
      var top = t.el.getBoundingClientRect().top;
      if (top <= line && top > best) {
        best = top;
        current = t;
      }
    });
    // the last section is short: light it up once the page bottom is reached
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
      current = spyTargets[spyTargets.length - 1];
    }
    spyTargets.forEach(function (t) {
      var on = t === current;
      t.link.classList.toggle("is-active", on);
      if (on) {
        t.link.setAttribute("aria-current", "location");
      } else {
        t.link.removeAttribute("aria-current");
      }
    });
    navGroups.forEach(function (g) {
      g.querySelector(".nav-group-toggle").classList.toggle("is-active", !!g.querySelector("a.is-active"));
    });
  }

  function requestSpy() {
    if (!spyTicking) {
      spyTicking = true;
      window.requestAnimationFrame(updateActiveSection);
    }
  }
  window.addEventListener("scroll", requestSpy, { passive: true });
  window.addEventListener("resize", requestSpy);
  updateActiveSection();

  // Scroll reveal
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && revealEls.length) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach(function (el) { observer.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  // Language toggle (EN default, FR alternate)
  var STORAGE_KEY = "site-lang";
  var currentLang = "en";

  function applyLang(lang) {
    currentLang = lang;
    document.documentElement.setAttribute("lang", lang);

    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      var entry = window.I18N && window.I18N[key];
      if (entry && entry[lang]) {
        el.textContent = entry[lang];
      }
    });

    if (langToggle) {
      langToggle.textContent = lang === "en" ? "FR" : "EN";
      langToggle.setAttribute(
        "aria-label",
        lang === "en" ? "Switch to French" : "Switch to English"
      );
    }

    updateThemeLabel();

    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch (e) {
      /* localStorage unavailable - ignore */
    }
  }

  if (langToggle) {
    langToggle.addEventListener("click", function () {
      applyLang(currentLang === "en" ? "fr" : "en");
    });
  }

  var savedLang = null;
  try {
    savedLang = localStorage.getItem(STORAGE_KEY);
  } catch (e) {
    /* localStorage unavailable - ignore */
  }
  if (savedLang === "fr") {
    applyLang("fr");
  } else {
    applyLang("en");
  }

  // Image lightbox: any <img data-full="..."> opens its full-size version
  var zoomables = Array.prototype.slice.call(document.querySelectorAll("img[data-full]"));
  if (zoomables.length) {
    var LB_LABELS = {
      en: { close: "Close", prev: "Previous photo", next: "Next photo", open: "Enlarge photo" },
      fr: { close: "Fermer", prev: "Photo précédente", next: "Photo suivante", open: "Agrandir la photo" }
    };
    var lightbox = document.createElement("div");
    lightbox.className = "lightbox";
    lightbox.setAttribute("role", "dialog");
    lightbox.setAttribute("aria-modal", "true");
    lightbox.hidden = true;
    lightbox.innerHTML =
      '<button type="button" class="lightbox-btn lightbox-close">&times;</button>' +
      '<button type="button" class="lightbox-btn lightbox-nav lightbox-prev">&#8249;</button>' +
      '<button type="button" class="lightbox-btn lightbox-nav lightbox-next">&#8250;</button>' +
      '<figure class="lightbox-figure"><img class="lightbox-img" alt=""><figcaption class="lightbox-caption"></figcaption></figure>';
    document.body.appendChild(lightbox);

    var lbImg = lightbox.querySelector(".lightbox-img");
    var lbCaption = lightbox.querySelector(".lightbox-caption");
    var lbClose = lightbox.querySelector(".lightbox-close");
    var lbPrev = lightbox.querySelector(".lightbox-prev");
    var lbNext = lightbox.querySelector(".lightbox-next");
    var lbIndex = 0;
    var lbLastFocus = null;

    if (zoomables.length < 2) {
      lbPrev.hidden = true;
      lbNext.hidden = true;
    }

    function lbLabels() {
      return LB_LABELS[currentLang] || LB_LABELS.en;
    }

    function lbShow(index) {
      lbIndex = (index + zoomables.length) % zoomables.length;
      var source = zoomables[lbIndex];
      lbImg.src = source.getAttribute("data-full");
      lbImg.alt = source.alt;
      lbCaption.textContent = source.alt;
      var labels = lbLabels();
      lbClose.setAttribute("aria-label", labels.close);
      lbPrev.setAttribute("aria-label", labels.prev);
      lbNext.setAttribute("aria-label", labels.next);
      lightbox.setAttribute("aria-label", source.alt);
    }

    function lbOpen(index) {
      lbLastFocus = document.activeElement;
      lbShow(index);
      lightbox.hidden = false;
      document.body.classList.add("lightbox-open");
      requestAnimationFrame(function () { lightbox.classList.add("is-open"); });
      lbClose.focus();
    }

    function lbHide() {
      lightbox.classList.remove("is-open");
      lightbox.hidden = true;
      document.body.classList.remove("lightbox-open");
      lbImg.removeAttribute("src");
      if (lbLastFocus && lbLastFocus.focus) {
        lbLastFocus.focus();
      }
    }

    zoomables.forEach(function (img, i) {
      img.setAttribute("tabindex", "0");
      img.setAttribute("role", "button");
      img.addEventListener("click", function () { lbOpen(i); });
      img.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          lbOpen(i);
        }
      });
    });

    lbClose.addEventListener("click", lbHide);
    lbPrev.addEventListener("click", function () { lbShow(lbIndex - 1); });
    lbNext.addEventListener("click", function () { lbShow(lbIndex + 1); });
    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox || e.target.classList.contains("lightbox-figure")) {
        lbHide();
      }
    });

    document.addEventListener("keydown", function (e) {
      if (lightbox.hidden) return;
      if (e.key === "Escape") {
        lbHide();
      } else if (e.key === "ArrowLeft" && zoomables.length > 1) {
        lbShow(lbIndex - 1);
      } else if (e.key === "ArrowRight" && zoomables.length > 1) {
        lbShow(lbIndex + 1);
      } else if (e.key === "Tab") {
        var focusable = Array.prototype.filter.call(
          lightbox.querySelectorAll("button"),
          function (b) { return !b.hidden; }
        );
        var first = focusable[0];
        var last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    });
  }
})();
