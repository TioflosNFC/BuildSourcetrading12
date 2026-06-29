/* ===========================================================
   BUILD SOURCE — admin.js
   Admin panel: Supabase auth (email/password), CRUD for
   'products' and 'projects' tables, image upload to storage
   buckets 'product-images' and 'project-images'.
   This page is intentionally NOT linked from the main nav —
   reachable only by typing /admin.html directly.
   =========================================================== */

(function () {
  "use strict";

  var TABLE_CONFIG = {
    products: {
      table: "products",
      bucket: "product-images",
      fields: [
        { key: "name", label: "Product name", type: "text", required: true },
        { key: "price", label: "Price", type: "text", required: false, placeholder: "e.g. 1,200 ETB / sheet" },
        { key: "category", label: "Category", type: "text", required: false, placeholder: "e.g. Gypsum Board" }
      ],
      listColumns: ["image_url", "name", "category", "price"]
    },
    projects: {
      table: "projects",
      bucket: "project-images",
      fields: [
        { key: "title", label: "Project title", type: "text", required: true },
        { key: "category", label: "Category", type: "text", required: false, placeholder: "e.g. Office Ceiling" },
        { key: "note", label: "Note", type: "textarea", required: false }
      ],
      listColumns: ["image_url", "title", "category"]
    }
  };

  var state = {
    activeTab: "products",
    rows: { products: [], projects: [] },
    editingId: null,
    editingFile: null
  };

  document.addEventListener("DOMContentLoaded", function () {
    var keyMissing =
      !window.bsClient ||
      !window.BS_CONFIG ||
      !window.BS_CONFIG.supabaseAnonKey ||
      window.BS_CONFIG.supabaseAnonKey.indexOf("REPLACE_WITH") === 0;
    if (keyMissing) {
      renderFatalError();
      return;
    }
    checkSession();
    bindLoginForm();
    bindLogout();
    bindTabs();
    bindModal();
  });

  function renderFatalError() {
    var loginPane = document.querySelector("[data-login-pane]");
    var adminPane = document.querySelector("[data-admin-pane]");
    if (adminPane) adminPane.style.display = "none";
    if (loginPane) {
      loginPane.innerHTML =
        '<div class="empty-state"><h4>Admin isn\'t connected</h4><p>Supabase credentials are missing from js/main.js. Add the project URL and anon key, then reload.</p></div>';
    }
  }

  // ---------------- AUTH ----------------
  function checkSession() {
    window.bsClient.auth.getSession().then(function (res) {
      var session = res.data && res.data.session;
      toggleAuthUI(!!session);
      if (session) loadAllData();
    });

    window.bsClient.auth.onAuthStateChange(function (_event, session) {
      toggleAuthUI(!!session);
      if (session) loadAllData();
    });
  }

  function toggleAuthUI(isAuthed) {
    var loginPane = document.querySelector("[data-login-pane]");
    var adminPane = document.querySelector("[data-admin-pane]");
    var logoutBtn = document.querySelector("[data-logout]");
    if (loginPane) loginPane.style.display = isAuthed ? "none" : "block";
    if (adminPane) adminPane.style.display = isAuthed ? "block" : "none";
    if (logoutBtn) logoutBtn.style.display = isAuthed ? "inline-flex" : "none";
  }

  function bindLoginForm() {
    var form = document.querySelector("[data-login-form]");
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var email = form.querySelector('[name="email"]').value.trim();
      var password = form.querySelector('[name="password"]').value;
      var errorEl = form.querySelector("[data-login-error]");
      var btn = form.querySelector('button[type="submit"]');

      if (errorEl) { errorEl.textContent = ""; errorEl.style.display = "none"; }
      btn.disabled = true;
      btn.textContent = "Signing in…";

      window.bsClient.auth.signInWithPassword({ email: email, password: password })
        .then(function (res) {
          if (res.error) {
            if (errorEl) { errorEl.textContent = res.error.message; errorEl.style.display = "block"; }
          }
        })
        .catch(function () {
          if (errorEl) { errorEl.textContent = "Sign in failed. Please try again."; errorEl.style.display = "block"; }
        })
        .finally(function () {
          btn.disabled = false;
          btn.textContent = "Sign in";
        });
    });
  }

  function bindLogout() {
    var btn = document.querySelector("[data-logout]");
    if (!btn) return;
    btn.addEventListener("click", function () {
      window.bsClient.auth.signOut();
    });
  }

  // ---------------- TABS ----------------
  function bindTabs() {
    var tabs = document.querySelectorAll("[data-admin-tab]");
    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        var target = tab.getAttribute("data-admin-tab");
        state.activeTab = target;
        tabs.forEach(function (t) { t.classList.toggle("is-active-tab", t === tab); });
        document.querySelectorAll("[data-admin-panel]").forEach(function (panel) {
          panel.style.display = panel.getAttribute("data-admin-panel") === target ? "block" : "none";
        });
      });
    });

    document.querySelectorAll("[data-add-new]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        openModal(btn.getAttribute("data-add-new"), null);
      });
    });
  }

  // ---------------- DATA LOAD ----------------
  function loadAllData() {
    Object.keys(TABLE_CONFIG).forEach(function (key) {
      loadTable(key);
    });
  }

  function loadTable(key) {
    var cfg = TABLE_CONFIG[key];
    var listEl = document.querySelector('[data-admin-list="' + key + '"]');
    if (listEl) listEl.innerHTML = '<tr><td colspan="5"><div class="skeleton" style="height:40px;"></div></td></tr>';

    window.bsClient
      .from(cfg.table)
      .select("*")
      .order("created_at", { ascending: false })
      .then(function (res) {
        if (res.error) {
          console.error(key + " load error:", res.error);
          if (listEl) listEl.innerHTML = '<tr><td colspan="5">Couldn\'t load ' + key + ". " + escapeHtml(res.error.message) + "</td></tr>";
          return;
        }
        state.rows[key] = res.data || [];
        renderTable(key);
      });
  }

  function renderTable(key) {
    var cfg = TABLE_CONFIG[key];
    var listEl = document.querySelector('[data-admin-list="' + key + '"]');
    if (!listEl) return;
    var rows = state.rows[key];

    if (!rows.length) {
      listEl.innerHTML = '<tr><td colspan="5"><div class="empty-state"><h4>No ' + key + " yet</h4><p>Click \"Add new\" to create the first entry.</p></div></td></tr>";
      return;
    }

    listEl.innerHTML = rows.map(function (row) { return renderRow(key, cfg, row); }).join("");

    listEl.querySelectorAll("[data-edit-row]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = btn.getAttribute("data-edit-row");
        var row = rows.find(function (r) { return String(r.id) === String(id); });
        openModal(key, row || null);
      });
    });
    listEl.querySelectorAll("[data-delete-row]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = btn.getAttribute("data-delete-row");
        confirmDelete(key, id);
      });
    });
  }

  function renderRow(key, cfg, row) {
    var thumb = row.image_url
      ? '<img src="' + escapeAttr(row.image_url) + '" alt="" class="admin-thumb">'
      : '<div class="admin-thumb admin-thumb-empty"></div>';
    var titleField = key === "products" ? row.name : row.title;
    return (
      "<tr>" +
      "<td>" + thumb + "</td>" +
      "<td><strong>" + escapeHtml(titleField || "Untitled") + "</strong></td>" +
      "<td>" + escapeHtml(row.category || "—") + "</td>" +
      "<td>" + escapeHtml(key === "products" ? row.price || "—" : row.note || "—") + "</td>" +
      '<td class="admin-row-actions">' +
      '<button class="btn btn-secondary btn-sm" data-edit-row="' + row.id + '">Edit</button>' +
      '<button class="btn btn-sm btn-danger" data-delete-row="' + row.id + '">Delete</button>' +
      "</td>" +
      "</tr>"
    );
  }

  function confirmDelete(key, id) {
    var cfg = TABLE_CONFIG[key];
    if (!window.confirm("Delete this entry? This can't be undone.")) return;
    window.bsClient
      .from(cfg.table)
      .delete()
      .eq("id", id)
      .then(function (res) {
        if (res.error) {
          alert("Couldn't delete: " + res.error.message);
          return;
        }
        loadTable(key);
      });
  }

  // ---------------- MODAL (ADD/EDIT) ----------------
  function bindModal() {
    var modal = document.querySelector("[data-admin-modal]");
    if (!modal) return;
    modal.querySelectorAll("[data-modal-close]").forEach(function (btn) {
      btn.addEventListener("click", closeModal);
    });
    modal.addEventListener("click", function (e) {
      if (e.target === modal) closeModal();
    });

    var form = modal.querySelector("[data-modal-form]");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      submitModal();
    });

    var fileInput = modal.querySelector('[name="image_file"]');
    fileInput.addEventListener("change", function () {
      state.editingFile = fileInput.files && fileInput.files[0] ? fileInput.files[0] : null;
      var preview = modal.querySelector("[data-image-preview]");
      if (preview && state.editingFile) {
        preview.src = URL.createObjectURL(state.editingFile);
        preview.style.display = "block";
      }
    });
  }

  function openModal(key, row) {
    var modal = document.querySelector("[data-admin-modal]");
    if (!modal) return;
    var cfg = TABLE_CONFIG[key];
    state.activeTab = key;
    state.editingId = row ? row.id : null;
    state.editingFile = null;

    modal.setAttribute("data-modal-table", key);
    modal.querySelector("[data-modal-title]").textContent = (row ? "Edit " : "Add ") + (key === "products" ? "product" : "project");

    var fieldsHost = modal.querySelector("[data-modal-fields]");
    fieldsHost.innerHTML = cfg.fields
      .map(function (f) {
        var val = row ? escapeAttr(row[f.key] || "") : "";
        if (f.type === "textarea") {
          return (
            '<div class="form-field"><label>' + f.label + "</label>" +
            '<textarea name="' + f.key + '"' + (f.required ? " required" : "") + ">" + (row ? escapeHtml(row[f.key] || "") : "") + "</textarea></div>"
          );
        }
        return (
          '<div class="form-field"><label>' + f.label + "</label>" +
          '<input type="text" name="' + f.key + '" value="' + val + '"' +
          (f.placeholder ? ' placeholder="' + f.placeholder + '"' : "") +
          (f.required ? " required" : "") + "></div>"
        );
      })
      .join("");

    var preview = modal.querySelector("[data-image-preview]");
    if (preview) {
      if (row && row.image_url) {
        preview.src = row.image_url;
        preview.style.display = "block";
      } else {
        preview.style.display = "none";
        preview.src = "";
      }
    }
    modal.querySelector('[name="image_file"]').value = "";
    modal.querySelector("[data-modal-error]").textContent = "";
    modal.classList.add("is-open");
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    var modal = document.querySelector("[data-admin-modal]");
    if (!modal) return;
    modal.classList.remove("is-open");
    document.body.style.overflow = "";
  }

  function submitModal() {
    var modal = document.querySelector("[data-admin-modal]");
    var key = modal.getAttribute("data-modal-table");
    var cfg = TABLE_CONFIG[key];
    var form = modal.querySelector("[data-modal-form]");
    var errorEl = modal.querySelector("[data-modal-error]");
    var saveBtn = modal.querySelector('[data-modal-save]');

    var payload = {};
    cfg.fields.forEach(function (f) {
      payload[f.key] = form.querySelector('[name="' + f.key + '"]').value.trim();
    });

    errorEl.textContent = "";
    saveBtn.disabled = true;
    saveBtn.textContent = "Saving…";

    uploadImageIfNeeded(cfg.bucket)
      .then(function (imageUrl) {
        if (imageUrl) payload.image_url = imageUrl;

        var op;
        if (state.editingId) {
          op = window.bsClient.from(cfg.table).update(payload).eq("id", state.editingId);
        } else {
          op = window.bsClient.from(cfg.table).insert([payload]);
        }
        return op;
      })
      .then(function (res) {
        if (res.error) {
          errorEl.textContent = res.error.message;
          return;
        }
        closeModal();
        loadTable(key);
      })
      .catch(function (err) {
        errorEl.textContent = err.message || "Something went wrong saving this entry.";
      })
      .finally(function () {
        saveBtn.disabled = false;
        saveBtn.textContent = "Save";
      });
  }

  function uploadImageIfNeeded(bucket) {
    if (!state.editingFile) return Promise.resolve(null);
    var file = state.editingFile;
    var ext = file.name.split(".").pop();
    var path = Date.now() + "-" + Math.random().toString(36).slice(2) + "." + ext;

    return window.bsClient.storage
      .from(bucket)
      .upload(path, file, { cacheControl: "3600", upsert: false })
      .then(function (res) {
        if (res.error) throw res.error;
        var pub = window.bsClient.storage.from(bucket).getPublicUrl(path);
        return pub.data.publicUrl;
      });
  }

  function escapeHtml(str) {
    return String(str || "").replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function escapeAttr(str) { return escapeHtml(str); }
})();
