/* ===========================================================
   BUILD SOURCE — supabase-client.js
   Single shared Supabase client instance. Loaded via CDN script
   in each HTML page BEFORE this file:
   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js"></script>
   =========================================================== */

(function () {
  "use strict";
  if (!window.BS_CONFIG) {
    console.error("BS_CONFIG missing — load js/main.js before supabase-client.js");
    return;
  }
  if (typeof supabase === "undefined") {
    console.error("Supabase CDN script not loaded.");
    return;
  }
  window.bsClient = supabase.createClient(
    window.BS_CONFIG.supabaseUrl,
    window.BS_CONFIG.supabaseAnonKey
  );
})();
