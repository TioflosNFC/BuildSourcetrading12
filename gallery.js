/* ===========================================================
   BUILD SOURCE — gallery.js
   Fetches projects from Supabase 'projects' table and renders
   them into [data-gallery-grid], with simple category filtering.
   Table shape expected: id, title, category, note, image_url, created_at
   =========================================================== */

(function () {
  "use strict";
  var allRows = [];

  document.addEventListener("DOMContentLoaded", function () {
    var mount = document.querySelector("[data-gallery-grid]");
    if (!mount) return;
    loadGallery(mount);
    initFilters(mount);
  });

  function loadGallery(mount) {
    renderSkeleton(mount);

    if (!isSupabaseConfigured()) {
      renderEmpty(mount, "Gallery is loading", "Connect Supabase to show project photos here.");
      return;
    }

    window.bsClient
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false })
      .then(function (res) {
        if (res.error) {
          console.error("gallery fetch error:", res.error);
          renderEmpty(mount, "Couldn't load gallery", "Please refresh, or check back shortly.");
          return;
        }
        allRows = res.data || [];
        if (!allRows.length) {
          renderEmpty(mount, "Gallery coming soon", "Project photos will appear here once added.");
          return;
        }
        renderRows(mount, allRows);
        buildFilterPills(allRows);
      })
      .catch(function (err) {
        console.error("gallery fetch exception:", err);
        renderEmpty(mount, "Couldn't load gallery", "Please refresh, or check back shortly.");
      });
  }

  function initFilters(mount) {
    var bar = document.querySelector("[data-gallery-filters]");
    if (!bar) return;
    bar.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-filter]");
      if (!btn) return;
      bar.querySelectorAll("[data-filter]").forEach(function (b) { b.classList.remove("is-active-filter"); });
      btn.classList.add("is-active-filter");
      var val = btn.getAttribute("data-filter");
      var filtered = val === "all" ? allRows : allRows.filter(function (r) { return r.category === val; });
      renderRows(mount, filtered);
    });
  }

  function buildFilterPills(rows) {
    var bar = document.querySelector("[data-gallery-filters]");
    if (!bar) return;
    var cats = Array.from(new Set(rows.map(function (r) { return r.category; }).filter(Boolean)));
    if (!cats.length) return;
    var html = '<button class="filter-pill is-active-filter" data-filter="all">All Projects</button>';
    cats.forEach(function (c) {
      html += '<button class="filter-pill" data-filter="' + escapeAttr(c) + '">' + escapeHtml(c) + "</button>";
    });
    bar.innerHTML = html;
  }

  function renderRows(mount, rows) {
    if (!rows.length) {
      renderEmpty(mount, "No projects in this category yet", "Try another filter.");
      return;
    }
    mount.innerHTML = rows.map(renderGalleryCard).join("");
    reinitFadeUpLocal(mount);
  }

  function renderGalleryCard(p) {
    var img = p.image_url
      ? '<img src="' + escapeAttr(p.image_url) + '" alt="' + escapeAttr(p.title) + '" loading="lazy">'
      : '<div class="product-img-placeholder" aria-hidden="true"></div>';
    var category = p.category ? '<span class="product-tag">' + escapeHtml(p.category) + "</span>" : "";
    var note = p.note ? "<p>" + escapeHtml(p.note) + "</p>" : "";
    return (
      '<article class="card gallery-card fade-up">' +
      '<div class="gallery-thumb">' + img + "</div>" +
      '<div class="gallery-card-body">' +
      category +
      "<h3>" + escapeHtml(p.title || "Project") + "</h3>" +
      note +
      "</div></article>"
    );
  }

  function renderSkeleton(mount) {
    var html = "";
    for (var i = 0; i < 6; i++) {
      html += '<div class="card gallery-card"><div class="skeleton" style="height:180px;margin-bottom:1rem;"></div><div class="skeleton" style="height:16px;width:60%;"></div></div>';
    }
    mount.innerHTML = html;
  }

  function renderEmpty(mount, title, body) {
    mount.innerHTML =
      '<div class="empty-state" style="grid-column:1/-1;"><h4>' +
      escapeHtml(title) +
      "</h4><p>" +
      escapeHtml(body) +
      "</p></div>";
  }

  function reinitFadeUpLocal(mount) {
    var els = mount.querySelectorAll(".fade-up");
    if (!("IntersectionObserver" in window)) {
      els.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    els.forEach(function (el) { observer.observe(el); });
  }

  function isSupabaseConfigured() {
    return (
      window.bsClient &&
      window.BS_CONFIG &&
      window.BS_CONFIG.supabaseAnonKey &&
      window.BS_CONFIG.supabaseAnonKey.indexOf("REPLACE_WITH") !== 0
    );
  }

  function escapeHtml(str) {
    return String(str || "").replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function escapeAttr(str) { return escapeHtml(str); }
})();
