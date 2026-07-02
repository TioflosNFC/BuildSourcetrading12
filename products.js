/* =============================================================
   BUILD SOURCE — products.js
   Cinematic full-screen product showcase
   Table: products (id, name, price, image_url, category, description, created_at)
   ============================================================= */

var ALL_PRODUCTS = [];
var ACTIVE_CAT = 'all';

var ICONS = {
  default: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.4"><rect x="3" y="5" width="18" height="14" rx="1" stroke="currentColor"/><path d="M3 11H21" stroke="currentColor"/></svg>',
  ceiling: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.4"><path d="M3 8L12 4L21 8V18H3V8Z" stroke="currentColor"/></svg>',
  partition: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.4"><path d="M4 4V20M12 4V20M20 4V20" stroke="currentColor"/></svg>',
  waterproof: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.4"><path d="M12 3C12 3 6 10 6 14a6 6 0 0012 0c0-4-6-11-6-11z" stroke="currentColor"/></svg>',
  sound: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.4"><circle cx="12" cy="12" r="9" stroke="currentColor"/><path d="M8 14s1.5 2 4 2 4-2 4-2" stroke="currentColor"/></svg>',
  aluminum: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.4"><rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor"/><path d="M4 14L9 9L13 13L20 6" stroke="currentColor"/></svg>',
  cement: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.4"><path d="M4 21V8l8-5 8 5v13M4 21h16M9 21v-6h6v6" stroke="currentColor"/></svg>'
};

function getIcon(category) {
  if (!category) return ICONS.default;
  var c = category.toLowerCase();
  if (c.includes('ceiling')) return ICONS.ceiling;
  if (c.includes('partition')) return ICONS.partition;
  if (c.includes('water')) return ICONS.waterproof;
  if (c.includes('sound')) return ICONS.sound;
  if (c.includes('alum') || c.includes('armstrong')) return ICONS.aluminum;
  if (c.includes('cement')) return ICONS.cement;
  return ICONS.default;
}

function renderProducts(products) {
  var grid = document.getElementById('productShowcase');
  if (!grid) return;

  if (!products || products.length === 0) {
    grid.innerHTML = '<div class="cin-empty">No products found in this category.<br><a href="contact.html" style="color:var(--gold);">Contact us for current stock →</a></div>';
    return;
  }

  grid.innerHTML = products.map(function(p, i) {
    var num = String(i + 1).padStart(2, '0');
    var total = String(products.length).padStart(2, '0');

    var visual = p.image_url
      ? '<img class="cin-product-img" src="' + escapeHtml(p.image_url) + '" alt="' + escapeHtml(p.name || '') + '" loading="lazy">'
      : '<div class="cin-product-icon-box">' + getIcon(p.category) + '</div>';

    var price = p.price
      ? '<div class="cin-product-price">' + escapeHtml(p.price) + '</div>'
      : '<div class="cin-product-price tbd">Contact for price</div>';

    return [
      '<article class="cin-product" data-category="' + escapeHtml(p.category || '') + '">',
      '  <div class="cin-product-left">',
      '    <div class="cin-product-num">' + num + ' / ' + total + '</div>',
      '    <h2 class="cin-product-name">' + escapeHtml(p.name || '') + '</h2>',
      '    <div class="cin-product-divider"></div>',
      '    <p class="cin-product-desc">' + escapeHtml(p.description || 'Premium finishing material supplied and delivered across Addis Ababa.') + '</p>',
      '  </div>',
      '  <div class="cin-product-center">' + visual + '</div>',
      '  <div class="cin-product-right">',
      '    <div>',
      '      <div class="cin-product-price-label">Price</div>',
      price,
      '    </div>',
      p.category ? '<div class="cin-product-cat">' + escapeHtml(p.category) + '</div>' : '',
      '    <a href="https://wa.me/251901028789?text=Hi%2C%20I%20am%20interested%20in%20' + encodeURIComponent(p.name || 'your products') + '" target="_blank" rel="noopener" class="cin-product-cta">Request Quote →</a>',
      '  </div>',
      '</article>'
    ].join('');
  }).join('');

  // Trigger cinematic reveal for newly inserted products
  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(e) {
      if (e.isIntersecting) {
        e.target.classList.add('cin-visible');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });
  grid.querySelectorAll('.cin-product').forEach(function(el) { observer.observe(el); });
}

function buildFilters(products) {
  var row = document.getElementById('productFilters');
  if (!row) return;
  var cats = ['all'].concat(
    products.map(function(p) { return p.category; })
      .filter(function(c, i, a) { return c && a.indexOf(c) === i; })
  );
  row.innerHTML = cats.map(function(c) {
    return '<button class="pf-chip' + (c === 'all' ? ' active' : '') + '" data-cat="' + escapeHtml(c) + '">' + (c === 'all' ? 'All Products' : escapeHtml(c)) + '</button>';
  }).join('');
  row.querySelectorAll('.pf-chip').forEach(function(btn) {
    btn.addEventListener('click', function() {
      row.querySelectorAll('.pf-chip').forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');
      ACTIVE_CAT = btn.dataset.cat;
      var filtered = ACTIVE_CAT === 'all' ? ALL_PRODUCTS : ALL_PRODUCTS.filter(function(p) { return p.category === ACTIVE_CAT; });
      renderProducts(filtered);
    });
  });
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

async function loadProducts() {
  var grid = document.getElementById('productShowcase');
  if (!grid) return;
  grid.innerHTML = '<div class="cin-empty"><span class="spinner"></span> Loading products…</div>';

  try {
    var res = await window.bsClient.from('products').select('*').order('created_at', { ascending: false });
    if (res.error) throw res.error;
    ALL_PRODUCTS = res.data || [];

    if (ALL_PRODUCTS.length === 0) {
      grid.innerHTML = '<div class="cin-empty">No products listed yet.<br><a href="contact.html" style="color:var(--gold);">Contact us for current stock →</a></div>';
      return;
    }
    buildFilters(ALL_PRODUCTS);
    renderProducts(ALL_PRODUCTS);
  } catch (err) {
    console.error(err);
    grid.innerHTML = '<div class="cin-empty">Couldn\'t load products right now.<br>Please <a href="contact.html" style="color:var(--gold);">contact us directly</a> or try refreshing.</div>';
  }
}

document.addEventListener('DOMContentLoaded', loadProducts);
