/* ==========================================================
   BUILD SOURCE — main.js
   Cinematic animation engine + shared site logic
   ========================================================== */
(function () {
  "use strict";

  /* ---- Config ---- */
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
    initWhatsApp();
    initWordSplit();
    initCinematicReveal();
    initCounters();
    initParallax();
    initSlideshow();
    initLuxuryReveal();
  });

  /* ---- Sticky header ---- */
  function initHeader() {
    var header = document.querySelector(".site-header");
    if (!header) return;
    function onScroll() {
      header.classList.toggle("is-scrolled", window.scrollY > 60);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---- Mobile nav ---- */
  function initMobileNav() {
    var toggle = document.getElementById("nav-toggle");
    var links = document.getElementById("nav-links");
    if (!toggle || !links) return;
    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open);
    });
    links.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        links.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---- WhatsApp float ---- */
  function initWhatsApp() {
    var a = document.querySelector(".wa-float");
    if (a) a.href = window.BS_CONFIG.whatsappHref;
  }

  /* ---- Word-by-word split animation ---- */
  function initWordSplit() {
    document.querySelectorAll("[data-word-split]").forEach(function (el) {
      var words = el.textContent.trim().split(/\s+/);
      el.innerHTML = words.map(function (w, i) {
        return '<span class="cin-word" style="animation-delay:' + (i * 0.08) + 's">' + w + '&nbsp;</span>';
      }).join("");
    });
  }

  /* ---- Cinematic zoom-fade reveal on scroll ---- */
  function initCinematicReveal() {
    var els = document.querySelectorAll("[data-cin]");
    if (!els.length) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          var el = e.target;
          var delay = el.dataset.cinDelay || 0;
          setTimeout(function () { el.classList.add("cin-visible"); }, parseFloat(delay) * 1000);
          io.unobserve(el);
        }
      });
    }, { threshold: 0.12 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---- Number counter ---- */
  function initCounters() {
    var els = document.querySelectorAll("[data-count]");
    if (!els.length) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        var target = parseFloat(el.dataset.count);
        var suffix = el.dataset.countSuffix || "";
        var duration = 1800;
        var start = null;
        function step(ts) {
          if (!start) start = ts;
          var progress = Math.min((ts - start) / duration, 1);
          var ease = 1 - Math.pow(1 - progress, 3);
          el.textContent = Math.round(ease * target) + suffix;
          if (progress < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
        io.unobserve(el);
      });
    }, { threshold: 0.5 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---- Parallax hero ---- */
  function initParallax() {
    var hero = document.querySelector("[data-parallax]");
    if (!hero) return;
    window.addEventListener("scroll", function () {
      var y = window.scrollY;
      hero.style.setProperty("--parallax-y", y * 0.4 + "px");
    }, { passive: true });
  }

  /* ---- Hero slideshow ---- */
  function initSlideshow() {
    var wrap = document.querySelector("[data-slideshow2]");
    if (!wrap) return;
    var slides = wrap.querySelectorAll("[data-slide2]");
    var dotsHost = wrap.querySelector("[data-slide2-dots]");
    var idx = 0;
    if (!slides.length) return;
    slides.forEach(function (_, i) {
      var dot = document.createElement("button");
      dot.className = "hb2-dot" + (i === 0 ? " is-active" : "");
      dot.setAttribute("aria-label", "Slide " + (i + 1));
      dot.addEventListener("click", function () { goTo(i); resetTimer(); });
      dotsHost.appendChild(dot);
    });
    var dots = dotsHost.querySelectorAll(".hb2-dot");
    function goTo(i) {
      slides[idx].classList.remove("is-active");
      dots[idx].classList.remove("is-active");
      idx = (i + slides.length) % slides.length;
      slides[idx].classList.add("is-active");
      dots[idx].classList.add("is-active");
    }
    var prev = wrap.querySelector("[data-slide2-prev]");
    var next = wrap.querySelector("[data-slide2-next]");
    if (prev) prev.addEventListener("click", function () { goTo(idx - 1); resetTimer(); });
    if (next) next.addEventListener("click", function () { goTo(idx + 1); resetTimer(); });
    var timer = setInterval(function () { goTo(idx + 1); }, 5000);
    function resetTimer() { clearInterval(timer); timer = setInterval(function () { goTo(idx + 1); }, 5000); }
  }

  /* ---- Legacy luxury reveal (lux-reveal class) ---- */
  function initLuxuryReveal() {
    var selectors = [
      ".product-card", ".why-card", ".value-card", ".service-card",
      ".testimonial-card", ".project-card", ".contact-info-item",
      ".section-head", ".fade-up", ".step", ".hero-meta-item"
    ];
    var els = document.querySelectorAll(selectors.join(","));
    els.forEach(function (el, i) {
      if (el.hasAttribute("data-cin")) return;
      el.classList.add("lux-reveal");
      var delay = i % 4;
      if (delay > 0) el.classList.add("lux-reveal-delay-" + delay);
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("is-visible");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.1 });
    els.forEach(function (el) { io.observe(el); });
  }

})();

/* =============================================================
   CINEMATIC ENGINE — scroll reveal, word split, counter, parallax
   ============================================================= */
(function () {
  'use strict';

  /* ---- 1. ZOOM-FADE SCROLL REVEAL ---- */
  var cItems = document.querySelectorAll(
    '.cin, .product-card, .why-card, .value-card, .service-card, ' +
    '.testimonial-card, .project-card, .contact-info-item, ' +
    '.section-head, .fade-up, .step, .hero-meta-item, ' +
    '.cin-left, .cin-right, .cin-up, .cin-scale'
  );
  cItems.forEach(function (el, i) {
    if (!el.classList.contains('cin-left') && !el.classList.contains('cin-right') && !el.classList.contains('cin-scale')) {
      el.classList.add('cin-up');
    }
    el.style.transitionDelay = (i % 5) * 0.08 + 's';
  });
  var revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add('cin-visible');
        revealObserver.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });
  cItems.forEach(function (el) { revealObserver.observe(el); });

  /* ---- 2. WORD-BY-WORD HERO TEXT SPLIT ---- */
  document.querySelectorAll('[data-word-split]').forEach(function (el) {
    var words = el.textContent.trim().split(/\s+/);
    el.innerHTML = words.map(function (w, i) {
      return '<span class="word-wrap"><span class="word" style="transition-delay:' + (i * 0.09) + 's">' + w + '</span></span>';
    }).join(' ');
    setTimeout(function () {
      el.querySelectorAll('.word').forEach(function (w) { w.classList.add('word-in'); });
    }, 200);
  });

  /* ---- 3. LETTER-BY-LETTER FOR EYEBROW ---- */
  document.querySelectorAll('[data-char-split]').forEach(function (el) {
    var chars = el.textContent.trim().split('');
    el.innerHTML = chars.map(function (c, i) {
      return '<span class="char" style="transition-delay:' + (i * 0.035) + 's">' + (c === ' ' ? '&nbsp;' : c) + '</span>';
    }).join('');
    setTimeout(function () {
      el.querySelectorAll('.char').forEach(function (c) { c.classList.add('char-in'); });
    }, 100);
  });

  /* ---- 4. NUMBER COUNTER ---- */
  var countObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      var el = e.target;
      var target = parseFloat(el.dataset.count);
      var suffix = el.dataset.suffix || '';
      var duration = 1800;
      var start = null;
      function step(ts) {
        if (!start) start = ts;
        var progress = Math.min((ts - start) / duration, 1);
        var ease = 1 - Math.pow(1 - progress, 3);
        var current = target * ease;
        el.textContent = (Number.isInteger(target) ? Math.floor(current) : current.toFixed(1)) + suffix;
        if (progress < 1) requestAnimationFrame(step);
        else el.textContent = target + suffix;
      }
      requestAnimationFrame(step);
      countObserver.unobserve(el);
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('[data-count]').forEach(function (el) {
    countObserver.observe(el);
  });

  /* ---- 5. PARALLAX ON HERO ---- */
  var parallaxEls = document.querySelectorAll('[data-parallax]');
  if (parallaxEls.length && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    window.addEventListener('scroll', function () {
      var sy = window.scrollY;
      parallaxEls.forEach(function (el) {
        var speed = parseFloat(el.dataset.parallax) || 0.3;
        el.style.transform = 'translateY(' + (sy * speed) + 'px)';
      });
    }, { passive: true });
  }

  /* ---- 6. CURSOR GLOW (desktop only) ---- */
  if (window.innerWidth > 900) {
    var glow = document.createElement('div');
    glow.className = 'cursor-glow';
    document.body.appendChild(glow);
    document.addEventListener('mousemove', function (e) {
      glow.style.left = e.clientX + 'px';
      glow.style.top = e.clientY + 'px';
    });
  }

  /* ---- 7. SMOOTH SECTION TRANSITIONS ---- */
  var sectionObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      e.target.classList.toggle('section-in-view', e.isIntersecting);
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('section').forEach(function (s) {
    sectionObserver.observe(s);
  });

})();
