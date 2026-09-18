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
})();
