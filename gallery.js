var ALL_PROJECTS = [];
var ACTIVE_CAT = 'all';

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function renderProjects(projects) {
  var grid = document.getElementById('projectGrid');
  if (!grid) return;
  if (!projects || projects.length === 0) {
    grid.innerHTML = '<div class="cin-empty" style="grid-column:1/-1;">No projects in this category yet.</div>';
    return;
  }
  grid.innerHTML = projects.map(function(p) {
    var img = p.image_url
      ? '<img src="' + escapeHtml(p.image_url) + '" alt="' + escapeHtml(p.title) + '" loading="lazy">'
      : '<div style="width:100%;height:100%;background:linear-gradient(135deg,#0D1A2E,#1A3050);"></div>';
    return [
      '<div class="cin-gallery-item cin-scale" onclick="openLightbox(\'' + escapeHtml(p.image_url || '') + '\',\'' + escapeHtml(p.title) + '\')">',
      img,
      '<div class="cin-gallery-overlay">',
      '<div><h3>' + escapeHtml(p.title) + '</h3>',
      p.category ? '<p>' + escapeHtml(p.category) + (p.note ? ' — ' + escapeHtml(p.note) : '') + '</p>' : '',
      '</div></div></div>'
    ].join('');
  }).join('');

  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(e) {
      if (e.isIntersecting) { e.target.classList.add('cin-visible'); observer.unobserve(e.target); }
    });
  }, { threshold: 0.08 });
  grid.querySelectorAll('.cin-gallery-item').forEach(function(el) { observer.observe(el); });
}

function buildFilters(projects) {
  var row = document.getElementById('projectFilters');
  if (!row) return;
  var cats = ['all'].concat(
    projects.map(function(p) { return p.category; })
      .filter(function(c, i, a) { return c && a.indexOf(c) === i; })
  );
  row.innerHTML = cats.map(function(c) {
    return '<button class="pf-chip' + (c === 'all' ? ' active' : '') + '" data-cat="' + escapeHtml(c) + '">' + (c === 'all' ? 'All Projects' : escapeHtml(c)) + '</button>';
  }).join('');
  row.querySelectorAll('.pf-chip').forEach(function(btn) {
    btn.addEventListener('click', function() {
      row.querySelectorAll('.pf-chip').forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');
      ACTIVE_CAT = btn.dataset.cat;
      var filtered = ACTIVE_CAT === 'all' ? ALL_PROJECTS : ALL_PROJECTS.filter(function(p) { return p.category === ACTIVE_CAT; });
      renderProjects(filtered);
    });
  });
}

function openLightbox(src, caption) {
  if (!src) return;
  var lb = document.getElementById('lightbox');
  document.getElementById('lightboxImg').src = src;
  document.getElementById('lightboxCaption').textContent = caption || '';
  lb.classList.add('open');
}
function closeLightbox() {
  document.getElementById('lightbox').classList.remove('open');
}

async function loadProjects() {
  var grid = document.getElementById('projectGrid');
  if (!grid || !window.bsClient) return;
  grid.innerHTML = '<div class="cin-empty" style="grid-column:1/-1;"><span class="spinner"></span> Loading projects…</div>';
  try {
    var res = await window.bsClient.from('projects').select('*').order('created_at', { ascending: false });
    if (res.error) throw res.error;
    ALL_PROJECTS = res.data || [];
    if (!ALL_PROJECTS.length) {
      grid.innerHTML = '<div class="cin-empty" style="grid-column:1/-1;">No projects posted yet. Check back soon.</div>';
      return;
    }
    buildFilters(ALL_PROJECTS);
    renderProjects(ALL_PROJECTS);
  } catch(err) {
    grid.innerHTML = '<div class="cin-empty" style="grid-column:1/-1;">Couldn\'t load projects. Please refresh the page.</div>';
  }
}

document.addEventListener('DOMContentLoaded', loadProjects);
document.addEventListener('keydown', function(e) { if (e.key === 'Escape') closeLightbox(); });
