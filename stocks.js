/* Automatic stock prices for Investment helper.
   Loads after the main script in index.html. Uses your own Cloudflare Worker.
   If the Worker fails, your typed "Worth now" numbers stay as they are. */
(function () {
  var W = "https://stock-prices.riyasnazeer4.workers.dev";
  var RX = /^[A-Z0-9&\-]{1,20}\.(NS|BO)$/;

  function dstr(t) {
    var d = new Date(t * 1000);
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }
  async function get(list) {
    var r = await fetch(W + "/?s=" + encodeURIComponent(list.join(",")));
    if (!r.ok) throw new Error("http " + r.status);
    return r.json();
  }
  // Returns the price date (yyyy-mm-dd) if the quote is usable, else null.
  function fresh(q, h) {
    if (!q || !(q.price > 0) || !q.time) return null;
    var d = dstr(q.time);
    if (ago(d) > 10) return null;
    if (h && h.d && d < h.d) return null;
    return d;
  }
  function refresh() {
    saveH(); rList(); rSum(); rMix();
    if (CV === "T") rT();
  }

  async function upd(m) {
    var el = $("stmsg");
    var xs = H.filter(function (h) { return h.t === "stock" && h.sy && h.u; });
    if (!xs.length) {
      if (m && el) el.textContent = "No stock has a stock code and a linked price yet. Add the code under the stock in your list, then tap Link price from code.";
      return;
    }
    var ok = 0, bad = 0;
    try {
      var j = await get(xs.map(function (h) { return h.sy; }));
      xs.forEach(function (h) {
        var q = j[h.sy], d = fresh(q, h);
        if (!d) { bad++; return; }
        h.v = Math.round(h.u * q.price * 100) / 100;
        h.nav = q.price;
        h.d = d;
        ok++;
      });
    } catch (e) { bad = xs.length; }
    if (ok) { sv("inv_swk_v1", { d: tdy() }); refresh(); }
    if (el) el.textContent = ok + " stock price(s) updated" + (bad ? ", " + bad + " could not be updated. Your typed worth is kept." : ".");
  }

  function symbox(h) {
    var b = mk("div", "pb"),
      l = mk("label", "", "Stock code (for automatic price)"),
      q = document.createElement("input"),
      bt = mk("button", "s", h.sy && h.u ? "Update price from code" : "Link price from code"),
      er = mk("p", "err"),
      ms = mk("p", "hint", h.sy
        ? "Stock code: " + h.sy + (h.u ? ". Its price updates by itself." : ". Tap the button to link the price.")
        : "Type the code with .NS (NSE) or .BO (BSE), like RELIANCE.NS. The app gets today\u2019s price and works out your shares from the worth you typed.");
    q.id = "sy" + h.id; q.type = "text"; q.value = h.sy || ""; q.placeholder = "RELIANCE.NS";
    q.autocapitalize = "characters"; l.htmlFor = q.id; bt.type = "button";
    q.addEventListener("input", function () { er.textContent = ""; });
    bt.addEventListener("click", async function () {
      er.textContent = "";
      var s = q.value.trim().toUpperCase();
      if (!RX.test(s)) { er.textContent = "Use a code ending in .NS or .BO, like RELIANCE.NS."; return; }
      if (!(h.v > 0)) { er.textContent = "Enter what it is worth now first. It must be more than 0."; return; }
      bt.disabled = true;
      try {
        var j = await get([s]), x = j[s], d = fresh(x, null);
        if (!d) {
          er.textContent = (x && x.error ? "No price found for that code. " : "No fresh price for that code. ") + "Check the code and try again.";
          bt.disabled = false; return;
        }
        if (h.u && h.sy === s) { h.v = Math.round(h.u * x.price * 100) / 100; }
        else { h.u = h.v / x.price; }
        h.sy = s; h.nav = x.price; h.d = d;
        sv("inv_swk_v1", { d: tdy() });
        refresh();
      } catch (e) {
        er.textContent = "Could not reach the price Worker. Check your internet and try again.";
        bt.disabled = false;
      }
    });
    b.appendChild(ms); b.appendChild(l); b.appendChild(q); b.appendChild(bt); b.appendChild(er);
    return b;
  }

  // Put the stock code box above the existing price box for stocks.
  var op = pbox;
  pbox = function (h, g) {
    var w = op(h, g);
    if (h.t !== "stock") return w;
    var c = document.createElement("div");
    c.appendChild(symbox(h)); c.appendChild(w);
    return c;
  };

  // Message line under the existing price message, and hook the existing button.
  var m = mk("p", "hint"); m.id = "stmsg";
  var um = $("upmsg");
  um.parentNode.insertBefore(m, um.nextSibling);
  $("upall").addEventListener("click", function () { m.textContent = "Updating stocks..."; upd(1); });

  rList();   // redraw so stocks show the new code box
  upd();     // update stock prices when the app opens
})();
