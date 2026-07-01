/* ===========================================================
   BUILD SOURCE — main.js
   Shared behavior across all pages: header scroll state,
   mobile nav, scroll-reveal, WhatsApp FAB, active nav link.
   =========================================================== */

(function () {
  "use strict";

  // ---- Business config (single source of truth, edit here) ----
  window.BS_CONFIG = {
    businessName: "Build Source",
    tagline: "Finishing Material",
    slogan: "Built for Quality, Delivered for You",
    phone: "+251 911 388 498",
    phoneHref: "tel:+251911388498",
    whatsapp: "+251 901 028 789",
    whatsappHref: "https://wa.me/251901028789",
    email: "Buildsoursetrading@gmail.com",
    address: "Addis Ababa, Ethiopia",
    tiktokHref: "https://www.tiktok.com/@buildsourcetrading?_r=1&_t=ZS-97U4F4zvS5d",
    mapsHref: "https://maps.app.goo.gl/7VUdG9PiHASHposQ7",
    supabaseUrl: "https://spdfwignzaejnnptbidt.supabase.co",
    supabaseAnonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwZGZ3aWduemFlam5ucHRiaWR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI2MTg1MjUsImV4cCI6MjA5ODE5NDUyNX0.4SFmJDg15Y9TTU0MkIcwD_os9446DU8GyayOdW6szcY",
    formspreeEndpoint: "https://formspree.io/f/xkolbqng"
  };

  document.addEventListener("DOMContentLoaded", function () {
    initHeader();
    initMobileNav();
    initActiveLink();
    initFadeUp();
    initWhatsAppFab();
    initYear();
  });

  function initHeader() {
    var header = document.querySelector(".site-header");
    if (!header) return;
    function onScroll() {
      if (window.scrollY > 24) header.classList.add("is-scrolled");
      else header.classList.remove("is-scrolled");
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  function initMobileNav() {
    var toggle = document.querySelector(".nav-toggle");
    var links = document.querySelector(".nav-links");
    if (!toggle || !links) return;
    toggle.addEventListener("click", function () {
      var isOpen = links.classList.toggle("is-open");
      toggle.classList.toggle("is-open", isOpen);
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
      document.body.style.overflow = isOpen ? "hidden" : "";
    });
    links.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        links.classList.remove("is-open");
        toggle.classList.remove("is-open");
        document.body.style.overflow = "";
      });
    });
  }

  function initActiveLink() {
    var path = window.location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".nav-links a[data-page]").forEach(function (a) {
      if (a.getAttribute("data-page") === path) a.classList.add("is-active");
    });
  }

  function initFadeUp() {
    var els = document.querySelectorAll(".fade-up");
    if (!els.length) return;
    if (!("IntersectionObserver" in window)) {
      els.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }
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
    els.forEach(function (el) { observer.observe(el); });
  }

  function initWhatsAppFab() {
    if (document.querySelector(".wa-fab")) return;
    var a = document.createElement("a");
    a.href = window.BS_CONFIG.whatsappHref;
    a.className = "wa-fab";
    a.target = "_blank";
    a.rel = "noopener";
    a.setAttribute("aria-label", "Chat with Build Source on WhatsApp");
    a.innerHTML =
      '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
      '<path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.6 15.36 3.48 16.84L2.05 22L7.36 20.6C8.78 21.39 10.39 21.81 12.04 21.81C17.5 21.81 21.95 17.36 21.95 11.9C21.95 9.26 20.92 6.78 19.05 4.9C17.18 3.02 14.69 2 12.04 2ZM12.04 20.15C10.56 20.15 9.12 19.76 7.85 19.02L7.5 18.81L4.55 19.6L5.36 16.73L5.13 16.36C4.32 15.05 3.89 13.5 3.89 11.91C3.89 7.39 7.53 3.75 12.05 3.75C14.24 3.75 16.29 4.6 17.83 6.14C19.37 7.69 20.2 9.72 20.2 11.91C20.19 16.42 16.55 20.15 12.04 20.15ZM16.56 13.91C16.31 13.78 15.06 13.17 14.83 13.08C14.6 13 14.43 12.96 14.27 13.21C14.1 13.46 13.62 14.02 13.47 14.19C13.32 14.36 13.18 14.38 12.94 14.26C11.39 13.48 10.38 12.87 9.36 11.13C9.11 10.7 9.6 10.73 10.05 9.81C10.13 9.64 10.09 9.5 10 9.34C9.91 9.18 9.5 8.13 9.32 7.7C9.14 7.27 8.96 7.33 8.83 7.32C8.7 7.31 8.55 7.31 8.4 7.31C8.25 7.31 8 7.37 7.79 7.59C7.58 7.81 7 8.36 7 9.46C7 10.56 7.85 11.62 7.97 11.78C8.09 11.94 9.59 14.38 11.95 15.34C13.99 16.16 14.41 15.99 14.86 15.95C15.31 15.91 16.34 15.35 16.55 14.74C16.76 14.13 16.76 13.61 16.69 13.5C16.62 13.39 16.81 14.04 16.56 13.91Z" fill="white"/>' +
      "</svg>";
    document.body.appendChild(a);
  }

  function initYear() {
    document.querySelectorAll("[data-year]").forEach(function (el) {
      el.textContent = new Date().getFullYear();
    });
  }

  // Truck SVG injected wherever .truck-icon-mount exists
  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".truck-icon").forEach(function (mount) {
      mount.innerHTML =
        '<svg width="64" height="34" viewBox="0 0 64 34" fill="none" xmlns="http://www.w3.org/2000/svg">' +
        '<rect x="2" y="10" width="34" height="16" rx="1.5" fill="#3FA34D"/>' +
        '<rect x="36" y="14" width="16" height="12" rx="1.5" fill="#D8D4C8"/>' +
        '<rect x="40" y="16" width="9" height="6" fill="#EFF4FB"/>' +
        '<circle cx="13" cy="28" r="4" fill="#1C1F26"/>' +
        '<circle cx="13" cy="28" r="1.6" fill="#D8D4C8"/>' +
        '<circle cx="45" cy="28" r="4" fill="#1C1F26"/>' +
        '<circle cx="45" cy="28" r="1.6" fill="#D8D4C8"/>' +
        '<rect x="5" y="13" width="20" height="2" fill="white" opacity="0.85"/>' +
        "</svg>";
    });
  });
})();

/* ---- Luxury scroll-reveal ---- */
(function () {
  var selectors = [
    '.product-card', '.why-card', '.value-card', '.service-card',
    '.testimonial-card', '.project-card', '.contact-info-item',
    '.section-head', '.fade-up', '.step', '.hero-meta-item'
  ];
  var els = document.querySelectorAll(selectors.join(','));
  els.forEach(function (el, i) {
    el.classList.add('lux-reveal');
    var delay = i % 4;
    if (delay > 0) el.classList.add('lux-reveal-delay-' + delay);
  });
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add('is-visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });
  els.forEach(function (el) { io.observe(el); });
})();
