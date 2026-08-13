(function () {
  window.escapeHtml = function (v) {
    var s = String(v ?? "");
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  };

  // Dropdown-style item list for tables: compact button + floating popover overlay.
  window.renderItemsDropdown = function (items, pillClass) {
    var list = items || [];
    var cls = pillClass || "module-pill neutral";
    var countLabel = list.length + (list.length === 1 ? " item" : " items");
    return (
      '<button type="button" class="items-dropdown-btn" data-items="' + window.escapeHtml(JSON.stringify(list)) + '" data-pill-class="' + window.escapeHtml(cls) + '">' +
        "<span>" + countLabel + '</span><span class="items-dropdown-caret">▾</span>' +
      "</button>"
    );
  };

  // ── Popover internals ────────────────────────────────────────────────────────
  var _popover = null;

  function pillHtml(list, cls) {
    return list.map(function (i) {
      var label = i.type === "__custom__" && i.description ? i.description : i.type;
      var desc = i.description && i.type !== "__custom__" ? i.description : "";
      var lang = i.lang ? " [" + window.escapeHtml(i.lang) + "]" : "";
      return '<span class="' + cls + '">' + window.escapeHtml(label) + lang + (desc ? ' <small style="color:var(--muted)">(' + window.escapeHtml(desc) + ")</small>" : "") + "</span>";
    }).join("");
  }

  function closeItemsPopover() {
    if (_popover) _popover.classList.remove("open");
    document.querySelectorAll(".items-dropdown-btn.open").forEach(function (b) { b.classList.remove("open"); });
  }

  function openItemsPopover(btn) {
    var list = [];
    try { list = JSON.parse(btn.dataset.items || "[]"); } catch (e) { list = []; }
    var cls = btn.dataset.pillClass || "module-pill neutral";

    if (!_popover) {
      _popover = document.createElement("div");
      _popover.className = "items-popover";
      _popover.setAttribute("role", "menu");
      document.body.appendChild(_popover);
    }
    _popover.innerHTML = '<div class="items-popover-title">Items</div><div class="items-popover-list">' + (pillHtml(list, cls) || '<span style="color:var(--muted);font-size:0.78rem">—</span>') + "</div>";

    var r = btn.getBoundingClientRect();
    var pw = _popover.offsetWidth || 220;
    var ph = _popover.offsetHeight || 180;
    var left = Math.max(8, Math.min(r.left, window.innerWidth - pw - 8));
    var flip = r.bottom + 6 + ph > window.innerHeight - 8 && r.top - ph - 6 > 8;
    var top = flip ? r.top - ph - 6 : Math.max(8, Math.min(r.bottom + 6, window.innerHeight - ph - 8));

    _popover.style.left = left + "px";
    _popover.style.top = top + "px";
    _popover.classList.toggle("flip", flip);
    _popover.classList.add("open");
    btn.classList.add("open");
  }

  document.addEventListener("click", function (e) {
    if (!(e.target instanceof Element)) return;
    var btn = e.target.closest(".items-dropdown-btn");
    if (btn) {
      if (btn.classList.contains("open")) closeItemsPopover();
      else {
        closeItemsPopover();
        openItemsPopover(btn);
      }
      return;
    }
    if (_popover && _popover.classList.contains("open") && !e.target.closest(".items-popover")) closeItemsPopover();
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeItemsPopover();
  });

  window.addEventListener("scroll", closeItemsPopover, true);
  window.addEventListener("resize", closeItemsPopover);
})();
