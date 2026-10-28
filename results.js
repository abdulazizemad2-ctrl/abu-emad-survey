(function () {
  var URL_ = window.SURVEY_CONFIG.SCRIPT_URL;
  var FILTER = window.SURVEY_COLUMNS.find(function (c) { return c.q.filter; });
  var allRows = [];
  var filter = "الكل";

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function getKey() { try { return localStorage.getItem("survey_key") || ""; } catch (e) { return ""; } }
  function setKey(k) { try { k ? localStorage.setItem("survey_key", k) : localStorage.removeItem("survey_key"); } catch (e) {} }
  function pct(n, d) { return d ? Math.round((n / d) * 100) : 0; }

  function load(key) {
    var err = document.getElementById("loginErr");
    err.hidden = true;
    if (!URL_ || URL_.indexOf("http") !== 0) {
      err.textContent = "لم يتم وضع رابط السكربت في ملف questions.js بعد.";
      err.hidden = false; return;
    }
    var u = URL_ + "?key=" + encodeURIComponent(key);
    return fetch(u)
      .then(function (r) { return r.json(); })
      .catch(function () { return jsonp(u); })
      .then(function (d) {
        if (!d.ok) {
          setKey("");
          err.textContent = d.error === "unauthorized" ? "كلمة المرور غير صحيحة." : "صار خطأ في قراءة الردود: " + d.error;
          err.hidden = false;
          document.getElementById("loginBox").hidden = false;
          document.getElementById("dash").hidden = true;
          return;
        }
        setKey(key);
        allRows = d.rows || [];
        document.getElementById("loginBox").hidden = true;
        document.getElementById("dash").hidden = false;
        document.getElementById("updated").textContent = "آخر تحديث: " + new Date().toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" });
        render();
      })
      .catch(function () {
        // المتصفح منع الاتصال من هنا: نفتح صفحة النتائج من Google مباشرة
        setKey(key);
        location.href = URL_ + "?view=page&key=" + encodeURIComponent(key);
      });
  }

  // بديل للاتصال عبر وسم script عند منع المتصفح لطلب fetch
  function jsonp(u) {
    return new Promise(function (resolve, reject) {
      var cb = "abuEmadCb" + Date.now();
      var sc = document.createElement("script");
      var timer = setTimeout(function () { done(); reject(new Error("timeout")); }, 15000);
      function done() { clearTimeout(timer); try { delete window[cb]; } catch (e) { window[cb] = undefined; } sc.remove(); }
      window[cb] = function (d) { done(); resolve(d); };
      sc.onerror = function () { done(); reject(new Error("load")); };
      sc.src = u + "&callback=" + cb;
      document.body.appendChild(sc);
    });
  }

  function counts(rows, label, multi) {
    var m = {}, answered = 0;
    rows.forEach(function (r) {
      var v = String(r[label] == null ? "" : r[label]).trim();
      if (!v) return;
      answered++;
      (multi ? v.split("، ") : [v]).forEach(function (x) { x = x.trim(); if (x) m[x] = (m[x] || 0) + 1; });
    });
    return { map: m, answered: answered };
  }

  function bars(items, total, green) {
    var box = el("div", "bars");
    items.forEach(function (it) {
      var row = el("div", "bar-row");
      row.appendChild(el("div", "bar-label", it.label));
      row.appendChild(el("div", "bar-num", it.n + " (" + pct(it.n, total) + "%)"));
      var tr = el("div", "bar-track");
      var f = el("div", "bar-fill" + (green ? " green" : ""));
      f.style.width = pct(it.n, total) + "%";
      tr.appendChild(f); row.appendChild(tr);
      box.appendChild(row);
    });
    return box;
  }

  function card(title) {
    var s = el("section", "section");
    s.appendChild(el("div", "section-head", title));
    var b = el("div", "section-body");
    b.style.paddingBlock = "14px";
    s.appendChild(b);
    return { root: s, body: b };
  }

  function renderFilters() {
    var f = document.getElementById("filters");
    f.textContent = "";
    if (!FILTER) { f.hidden = true; return; }
    ["الكل"].concat(FILTER.q.options).forEach(function (o) {
      var b = el("button", null, o);
      b.type = "button";
      b.setAttribute("aria-pressed", String(o === filter));
      b.addEventListener("click", function () { filter = o; render(); });
      f.appendChild(b);
    });
  }

  function render() {
    renderFilters();
    var rows = filter === "الكل" || !FILTER ? allRows : allRows.filter(function (r) { return String(r[FILTER.label] || "").split("، ").indexOf(filter) !== -1; });
    var total = rows.length;

    // البطاقات العلوية
    var tiles = document.getElementById("tiles");
    tiles.textContent = "";
    function tile(label, value, sub) {
      var t = el("div", "tile");
      t.appendChild(el("div", "tile-label", label));
      t.appendChild(el("div", "tile-value", value));
      if (sub) t.appendChild(el("div", "tile-sub", sub));
      tiles.appendChild(t);
    }
    var col = function (k) { return window.SURVEY_COLUMNS.find(function (c) { return c.key === k; }).label; };
    var ov = rows.map(function (r) { return Number(r[col("overall")]); }).filter(function (x) { return x > 0; });
    var avg = ov.length ? (ov.reduce(function (a, b) { return a + b; }, 0) / ov.length).toFixed(1) : "–";
    var np = rows.map(function (r) { return r[col("nps")]; }).filter(function (x) { return x !== "" && x != null; }).map(Number);
    var prom = np.filter(function (x) { return x >= 9; }).length, det = np.filter(function (x) { return x <= 6; }).length;
    var nps = np.length ? Math.round(((prom - det) / np.length) * 100) : "–";
    var paidC = counts(rows, col("paid"));
    var support = (paidC.map["نعم أؤيد"] || 0) + (paidC.map["أؤيد إذا أضيفت مميزات جديدة"] || 0);
    tile("عدد الردود", String(total));
    tile("متوسط الاستفادة", avg === "–" ? avg : avg + " / 5", ov.length + " إجابة");
    tile("مؤشر التوصية (NPS)", String(nps), "من ‎-100 إلى ‎+100");
    tile("يؤيدون الرسوم الرمزية", paidC.answered ? pct(support, paidC.answered) + "%" : "–", "شامل المشروط بإضافات");

    var charts = document.getElementById("charts");
    charts.textContent = "";
    if (!total) {
      var c0 = card("لا توجد ردود");
      c0.body.appendChild(el("p", "empty", "ما وصل أي رد بعد" + (filter === "الكل" ? "." : " لهذه المادة.") + " انشر رابط الاستبيان وارجع هنا."));
      charts.appendChild(c0.root);
      return;
    }

    var n = 0;
    window.SURVEY.forEach(function (s) {
      s.questions.forEach(function (q) {
        n++;
        var c = card(n + ". " + q.label);
        if (q.type === "radio" || q.type === "checkbox") {
          var r = counts(rows, q.label, q.type === "checkbox");
          c.body.appendChild(el("div", "q-stats", r.answered + " من " + total + " أجابوا" + (q.type === "checkbox" ? " (يمكن اختيار أكثر من إجابة)" : "")));
          var items = q.options.map(function (o) { return { label: o, n: r.map[o] || 0 }; });
          if (q.type === "checkbox") items.sort(function (a, b) { return b.n - a.n; });
          c.body.appendChild(bars(items, r.answered, q.id === "paid" || q.id === "grade"));
        } else if (q.type === "scale") {
          var rs = counts(rows, q.label);
          var vals = [];
          Object.keys(rs.map).forEach(function (k) { for (var i = 0; i < rs.map[k]; i++) vals.push(Number(k)); });
          var a = vals.length ? (vals.reduce(function (x, y) { return x + y; }, 0) / vals.length).toFixed(1) : "–";
          c.body.appendChild(el("div", "q-stats", rs.answered + " إجابة · المتوسط " + a + " من " + q.max));
          var it2 = [];
          for (var v = q.max; v >= q.min; v--) it2.push({ label: String(v), n: rs.map[String(v)] || 0 });
          c.body.appendChild(bars(it2, rs.answered, true));
        } else if (q.type === "grid") {
          var wrap = el("div", "gtable-wrap");
          var t = el("table");
          var hr = el("tr");
          hr.appendChild(el("th", null, "البند"));
          q.options.forEach(function (o) { hr.appendChild(el("th", null, o)); });
          hr.appendChild(el("th", null, "ممتاز + جيد"));
          var thead = el("thead"); thead.appendChild(hr); t.appendChild(thead);
          var tb = el("tbody");
          q.rows.forEach(function (row) {
            var lbl = q.label + " - " + row.label;
            var rr = counts(rows, lbl);
            var tr = el("tr");
            tr.appendChild(el("td", null, row.label));
            q.options.forEach(function (o) { tr.appendChild(el("td", null, pct(rr.map[o] || 0, rr.answered) + "%")); });
            var good = (rr.map[q.options[0]] || 0) + (rr.map[q.options[1]] || 0);
            var g = el("td", null, rr.answered ? pct(good, rr.answered) + "%" : "–");
            g.style.fontWeight = "800"; g.style.color = "var(--green)";
            tr.appendChild(g);
            tb.appendChild(tr);
          });
          t.appendChild(tb); wrap.appendChild(t); c.body.appendChild(wrap);
        } else {
          var list = rows.map(function (r) { return String(r[q.label] || "").trim(); }).filter(Boolean);
          c.body.appendChild(el("div", "q-stats", list.length + " إجابة"));
          var tx = el("div", "texts");
          if (!list.length) tx.appendChild(el("p", "empty", "لا توجد إجابات."));
          list.slice().reverse().forEach(function (s2) { tx.appendChild(el("p", null, s2)); });
          c.body.appendChild(tx);
        }
        charts.appendChild(c.root);
      });
    });
  }

  document.getElementById("loginForm").addEventListener("submit", function (e) {
    e.preventDefault();
    load(document.getElementById("key").value.trim());
  });
  document.getElementById("refresh").addEventListener("click", function () { load(getKey()); });
  document.getElementById("logout").addEventListener("click", function () {
    setKey(""); allRows = [];
    document.getElementById("dash").hidden = true;
    document.getElementById("loginBox").hidden = false;
  });

  // صفحة مفتوحة من Google وفيها البيانات جاهزة
  if (window.__DATA__) {
    var d0 = window.__DATA__;
    document.getElementById("refresh").hidden = true;
    document.getElementById("logout").hidden = true;
    if (!d0.ok) {
      var e0 = document.getElementById("loginErr");
      e0.textContent = "كلمة المرور غير صحيحة.";
      e0.hidden = false;
      document.getElementById("loginForm").hidden = true;
      return;
    }
    allRows = d0.rows || [];
    document.getElementById("loginBox").hidden = true;
    document.getElementById("dash").hidden = false;
    document.getElementById("updated").textContent = "حدّث الصفحة لعرض الردود الجديدة";
    render();
    return;
  }

  var saved = getKey();
  if (saved) load(saved);
})();
