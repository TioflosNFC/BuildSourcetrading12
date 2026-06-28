/* ===========================================================
   BUILD SOURCE — products.js
   Fetches products from Supabase 'products' table and renders
   them into any element with [data-products-grid].
   Table shape expected: id, name, price, image_url, category, created_at
   Falls back to a friendly empty state if Supabase isn't reachable yet.
   =========================================================== */

(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    var mounts = document.querySelectorAll("[data-products-grid]");
    if (!mounts.length) return;
    mounts.forEach(loadProductsInto);
  });

  function loadProductsInto(mount) {
    var limit = parseInt(mount.getAttribute("data-limit") || "0", 10);
    renderSkeleton(mount);

    if (!isSupabaseConfigured()) {
      renderEmpty(mount, "Products are loading", "Connect Supabase to show live products here.");
      return;
    }

    var query = window.bsClient
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (limit > 0) query = query.limit(limit);

    query.then(function (res) {
      if (res.error) {
        console.error("products fetch error:", res.error);
        renderEmpty(mount, "Couldn't load products", "Please refresh, or check back shortly.");
        return;
      }
      var rows = res.data || [];
      if (!rows.length) {
        renderEmpty(mount, "Products coming soon", "Our catalogue is being updated — check back shortly.");
        return;
      }
      mount.innerHTML = rows.map(renderProductCard).join("");
      if (window.bsReinitFadeUp) window.bsReinitFadeUp(mount);
      else reinitFadeUpLocal(mount);
    }).catch(function (err) {
      console.error("products fetch exception:", err);
      renderEmpty(mount, "Couldn't load products", "Please refresh, or check back shortly.");
    });
  }

  function renderProductCard(p) {
    var img = p.image_url
      ? '<img src="' + escapeAttr(p.image_url) + '" alt="' + escapeAttr(p.name) + '" loading="lazy">'
      : '<div class="product-img-placeholder" aria-hidden="true">' + iconSvg() + "</div>";
    var price = p.price ? '<span class="product-price">' + escapeHtml(p.price) + "</span>" : "";
    var category = p.category ? '<span class="product-tag">' + escapeHtml(p.category) + "</span>" : "";
    return (
      '<article class="card product-card fade-up">' +
      '<div class="product-thumb">' + img + "</div>" +
      category +
      "<h3>" + escapeHtml(p.name || "Untitled product") + "</h3>" +
      price +
      "</article>"
    );
  }

  function renderSkeleton(mount) {
    var n = parseInt(mount.getAttribute("data-limit") || "4", 10) || 4;
    var html = "";
    for (var i = 0; i < n; i++) {
      html += '<div class="card product-card"><div class="skeleton" style="height:140px;margin-bottom:1rem;"></div><div class="skeleton" style="height:18px;width:70%;margin-bottom:0.5rem;"></div><div class="skeleton" style="height:14px;width:40%;"></div></div>';
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

  function iconSvg() {
    return '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 9L12 3L21 9V20H3V9Z" stroke="#1554A8" stroke-width="1.5" stroke-linejoin="round"/><path d="M9 20V13H15V20" stroke="#1554A8" stroke-width="1.5"/></svg>';
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
