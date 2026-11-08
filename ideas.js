(function () {
  var W = "https://stock-ideas.riyasnazeer4.workers.dev";
  var LIST = [
    ["HINDUNILVR.NS", "Hindustan Unilever"],
    ["ITC.NS", "ITC"],
    ["NESTLEIND.NS", "Nestle India"],
    ["BRITANNIA.NS", "Britannia"],
    ["ASIANPAINT.NS", "Asian Paints"],
    ["TCS.NS", "TCS"],
    ["INFY.NS", "Infosys"],
    ["HDFCBANK.NS", "HDFC Bank"],
    ["ICICIBANK.NS", "ICICI Bank"],
    ["RELIANCE.NS", "Reliance"]
  ];
  var IK = "inv_idea_v1";
  var busy = false;
  var note = "";

  function dstr(t) {
    var d = new Date(t * 1000);
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }

  function pick(j) {
    var best = null, good = 0;
    LIST.forEach(function (p) {
      var q = j[p[0]];
      if (!q || !(q.price > 0) || !(q.a50 > 0) || !(q.a200 > 0) || !q.time) return;
      if (ago(dstr(q.time)) > 10) return;
      good++;
      var dip = (q.a50 - q.price) / q.a50 * 100;
      if (dip < 2 || dip > 12) return;
      if (q.price < q.a200) return;
      if (!best || dip > best.dip) {
        best = { s: p[0], n: p[1], price: q.price, dip: dip, fromHigh: (q.hi - q.price) / q.hi * 100 };
      }
    });
    return { good: good, idea: best };
  }

  async function run() {
    if (busy) return;
    busy = true;
    note = "Checking prices...";
    draw();
    try {
      var r = await fetch(W + "/?s=" + encodeURIComponent(LIST.map(function (p) { return p[0]; }).join(",")));
      if (!r.ok) throw new Error("http " + r.status);
      var j = await r.json();
      var res = pick(j);
      if (res.good < 5) {
        note = "Could not get enough fresh prices. Try again later.";
      } else {
        sv(IK, { d: tdy(), idea: res.idea, ok: res.good });
        note = "";
      }
    } catch (e) {
      note = "Could not reach the idea Worker. Check your internet and try again.";
    }
    busy = false;
    draw();
  }

  function draw() {
    var el = $("tlist");
    if (!el) return;
    var old = $("ideacard");
    if (old) old.remove();
    var c = mk("div", "card rc");
    c.id = "ideacard";
    c.appendChild(mk("span", "k optional", "Idea"));
    c.appendChild(mk("h3", "", "Weekly stock idea"));
    var s = ld(IK), S = getS();
    if (!s) {
      c.appendChild(mk("p", "", "No idea checked yet. Tap the button to check this week\u2019s idea."));
    } else if (!s.idea) {
      c.appendChild(mk("p", "", "No idea this week. None of the 10 big companies is a little cheaper than usual and still in a long-term uptrend. Doing nothing is fine."));
      c.appendChild(mk("p", "hint", "Checked on " + s.d + "."));
    } else {
      var i = s.idea, cap = sums().v * S.scap / 100;
      c.appendChild(mk("p", "", i.n + " (" + i.s + ") is about " + i.dip.toFixed(1) + "% below its 50-day average price, and still above its 200-day average. Last price \u20b9" + i.price.toFixed(2) + ". It is " + i.fromHigh.toFixed(0) + "% below its highest price in the past year."));
      c.appendChild(mk("p", "hint", "Your limit for one stock is " + S.scap + "% of all your money, about " + inr(cap) + " now. If you ever buy, your stop-loss rule is " + S.stopl + "% below what you paid."));
      c.appendChild(mk("p", "hint", "Checked on " + s.d + "."));
    }
    c.appendChild(mk("p", "cost", "This is an idea to research. It is not a buy order and not a promise of profit. A stock that looks cheaper can keep falling. You decide."));
    var bt = mk("button", "s", busy ? "Checking..." : "Check this week\u2019s idea now");
    bt.type = "button";
    bt.disabled = busy;
    bt.addEventListener("click", run);
    c.appendChild(bt);
    if (note) c.appendChild(mk("p", "hint", note));
    el.appendChild(c);
  }

  var orT = rT;
  rT = function () { orT(); draw(); };
  draw();
  var s0 = ld(IK);
  if (!s0 || ago(s0.d) >= 7) run();
})();
