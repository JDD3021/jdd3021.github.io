// Sends Edéda an email each time someone visits the site, via EmailJS
// (client-side, no backend needed - works on GitHub Pages).
// Setup instructions: see EMAILJS-SETUP.txt in the project root.
(function () {
  "use strict";

  // ---- Fill these in after creating your EmailJS account (see EMAILJS-SETUP.txt) ----
  var EMAILJS_PUBLIC_KEY = "LdJfcpYHIVMbAXfS6";
  var EMAILJS_SERVICE_ID = "service_iq612ea";
  var EMAILJS_TEMPLATE_ID = "template_191wlq5";
  // --------------------------------------------------------------------------------

  if (EMAILJS_PUBLIC_KEY.indexOf("YOUR_") === 0 || typeof emailjs === "undefined") return;
  emailjs.init(EMAILJS_PUBLIC_KEY);

  try {
    // Visit the site once with ?owner=1 to stop future alerts on this device/browser.
    var params = new URLSearchParams(location.search);
    if (params.get("owner") === "1") {
      localStorage.setItem("cv_owner", "1");
      return;
    }
    if (localStorage.getItem("cv_owner") === "1") return;
    // Only one alert per browser tab session, even if the visitor reloads or navigates around.
    if (sessionStorage.getItem("cv_visit_logged") === "1") return;
  } catch (e) {
    /* storage unavailable - fall through and send anyway */
  }

  var ua = navigator.userAgent || "";
  // Best-effort filter for common crawlers/bots and link-preview fetchers - not exhaustive.
  if (/bot|crawl|spider|slurp|facebookexternalhit|whatsapp|telegrambot|preview|lighthouse|headless/i.test(ua)) return;

  function send(geo) {
    try { sessionStorage.setItem("cv_visit_logged", "1"); } catch (e) {}
    emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
      visit_time: new Date().toLocaleString("fr-FR", { timeZone: "Africa/Lome" }) + " (heure du Togo)",
      page_url: location.href,
      referrer: document.referrer || "Direct / inconnu",
      user_agent: ua,
      language: navigator.language || "",
      screen_size: screen.width + "x" + screen.height,
      city: (geo && geo.city) || "Inconnu",
      region: (geo && geo.region) || "",
      country: (geo && geo.country_name) || "",
      ip: (geo && geo.ip) || ""
    });
  }

  fetch("https://ipapi.co/json/")
    .then(function (r) { return r.json(); })
    .then(function (geo) { send(geo); })
    .catch(function () { send(null); });
})();
