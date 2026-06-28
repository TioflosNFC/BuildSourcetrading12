/* ===========================================================
   BUILD SOURCE — contact.js
   Submits the contact form to Formspree via fetch, no reload.
   =========================================================== */

(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    var form = document.querySelector("[data-contact-form]");
    if (!form) return;

    var status = form.querySelector("[data-form-status]");
    var submitBtn = form.querySelector('button[type="submit"]');

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      clearStatus(status);

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      var endpoint = window.BS_CONFIG && window.BS_CONFIG.formspreeEndpoint;
      if (!endpoint) {
        showStatus(status, "error", "Form isn't connected yet — please reach us by phone or WhatsApp below.");
        return;
      }

      setLoading(submitBtn, true);

      var data = new FormData(form);

      fetch(endpoint, {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" }
      })
        .then(function (res) {
          if (res.ok) {
            form.reset();
            showStatus(status, "success", "Thanks — your message has been sent. We'll get back to you shortly.");
          } else {
            return res.json().then(function (body) {
              var msg = (body && body.errors && body.errors.map(function (e) { return e.message; }).join(", ")) || "Something went wrong sending your message.";
              showStatus(status, "error", msg + " Please try again, or contact us directly.");
            });
          }
        })
        .catch(function () {
          showStatus(status, "error", "Couldn't send your message. Please check your connection and try again.");
        })
        .finally(function () {
          setLoading(submitBtn, false);
        });
    });
  });

  function showStatus(el, kind, msg) {
    if (!el) return;
    el.textContent = msg;
    el.className = "form-status is-" + kind;
  }
  function clearStatus(el) {
    if (!el) return;
    el.textContent = "";
    el.className = "form-status";
  }
  function setLoading(btn, isLoading) {
    if (!btn) return;
    btn.disabled = isLoading;
    btn.textContent = isLoading ? "Sending…" : btn.getAttribute("data-default-label") || "Send message";
  }
})();
