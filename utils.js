(function () {
  window.escapeHtml = function (v) {
    var s = String(v ?? "");
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  };
})();
