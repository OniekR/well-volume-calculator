// Compatibility IIFE loader for environments that don't support module import (file://, older browsers)
(function () {
  try {
    if (typeof window === "undefined") return;
    if (window.VolumeCalc) return; // already present
    // Try synchronous XHR fetch & eval (works in JSDOM/file:// test env)
    try {
      var xhr = new XMLHttpRequest();
      xhr.open("GET", "./dist/keino.bundle.js", false);
      xhr.send(null);
      if (xhr && xhr.responseText) {
        (0, eval)(xhr.responseText);
        if (typeof VolumeCalc !== "undefined") {
          window.VolumeCalc = VolumeCalc;
          try {
            if (window.VolumeCalc && typeof window.VolumeCalc.init === "function")
              window.VolumeCalc.init();
          } catch (e) {}
          return;
        }
      }
    } catch (e) {
      /* ignore */
    }
    // Fallback: insert classic script to load the bundle synchronously
    var s = document.createElement("script");
    s.src = "./dist/keino.bundle.js";
    s.async = false;
    s.onload = function () {
      try {
        if (window.VolumeCalc && typeof window.VolumeCalc.init === "function")
          window.VolumeCalc.init();
      } catch (e) {}
    };
    document.head.appendChild(s);
  } catch (e) {
    /* ignore */
  }
})();
