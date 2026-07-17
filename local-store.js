(function () {
  var LS = localStorage;
  var S = {};

  S.get = function (key, def) {
    var v = LS.getItem(key);
    return v !== null ? v : def;
  };
  S.set = function (key, val) { LS.setItem(key, val); };
  S.remove = function (key) { LS.removeItem(key); };

  S.getJSON = function (key, def) {
    try { var v = LS.getItem(key); return v ? JSON.parse(v) : def; }
    catch (e) { return def; }
  };
  S.setJSON = function (key, val) { LS.setItem(key, JSON.stringify(val)); };

  S.getInvToken = function () {
    return {
      token: LS.getItem("reload_sarpras_token"),
      date: LS.getItem("reload_sarpras_token_date")
    };
  };
  S.saveInvToken = function (token, date) {
    LS.setItem("reload_sarpras_token_date", date);
    LS.setItem("reload_sarpras_token", token);
  };

  S.loadInvData = function (key, fallback) {
    try {
      var raw = LS.getItem(key);
      return raw ? JSON.parse(raw) : JSON.parse(JSON.stringify(fallback));
    } catch (e) {
      return JSON.parse(JSON.stringify(fallback));
    }
  };

  S.persistAllInventory = function (state) {
    if (!state) return;
    var keys = {
      items: "reload_sarpras_items",
      categories: "reload_sarpras_categories",
      kategoriList: "reload_sarpras_kategori_list",
      locations: "reload_sarpras_locations",
      units: "reload_sarpras_units",
      suppliers: "reload_sarpras_suppliers",
      transactions: "reload_sarpras_transactions",
      opnames: "reload_sarpras_opnames",
      discrepancies: "reload_sarpras_discrepancies"
    };
    for (var k in keys) LS.setItem(keys[k], JSON.stringify(state[k]));
  };

  S.getLanguage = function () { return LS.getItem("schoolos_language") || "en"; };
  S.setLanguage = function (lang) { LS.setItem("schoolos_language", lang); };
  S.getTheme = function () { return LS.getItem("schoolos_theme") || "dark"; };
  S.setTheme = function (mode) { LS.setItem("schoolos_theme", mode); };
  S.getBg = function () { return LS.getItem("schoolos_bg"); };
  S.setBg = function (value) { LS.setItem("schoolos_bg", value); };
  S.removeBg = function () { LS.removeItem("schoolos_bg"); };

  window.Store = S;
})();
