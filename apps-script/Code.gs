const ADMIN_KEY = 'CHANGE_ME_123';
const SHEET_NAME = 'الردود';
const SITE = 'https://abdulazizemad2-ctrl.github.io/abu-emad-survey/';

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
    sh.appendRow(['وقت الإرسال']);
    sh.setFrozenRows(1);
    sh.setRightToLeft(true);
  }
  return sh;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function saveAnswers_(answers) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const sh = getSheet_();
    const headers = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
    answers.forEach(function (pair) {
      const label = String(pair[0]).slice(0, 200);
      if (headers.indexOf(label) === -1) {
        sh.getRange(1, headers.length + 1).setValue(label);
        headers.push(label);
      }
    });
    const row = headers.map(function () { return ''; });
    row[0] = new Date();
    answers.forEach(function (pair) {
      const idx = headers.indexOf(String(pair[0]).slice(0, 200));
      let v = String(pair[1] == null ? '' : pair[1]).slice(0, 2000);
      if (/^[=+\-@]/.test(v)) v = "'" + v;
      if (idx > 0) row[idx] = v;
    });
    sh.appendRow(row);
  } finally {
    lock.releaseLock();
  }
}

function doPost(e) {
  const isForm = e && e.parameter && e.parameter.payload;
  try {
    const data = JSON.parse(isForm ? e.parameter.payload : e.postData.contents);
    saveAnswers_(Array.isArray(data.answers) ? data.answers : []);
    if (isForm) return thanksPage_();
    return json_({ ok: true });
  } catch (err) {
    if (isForm) return HtmlService.createHtmlOutput('<p dir="rtl" style="font-family:sans-serif">صار خطأ في حفظ ردك، حاول مرة ثانية.</p>');
    return json_({ ok: false, error: String(err) });
  }
}

function readData_() {
  const sh = getSheet_();
  const values = sh.getDataRange().getValues();
  const headers = values.shift() || [];
  const rows = values.map(function (r) {
    const o = {};
    headers.forEach(function (h, i) {
      o[h] = r[i] instanceof Date ? r[i].toISOString() : r[i];
    });
    return o;
  });
  return { ok: true, headers: headers, rows: rows };
}

function doGet(e) {
  const p = (e && e.parameter) || {};
  const okKey = p.key === ADMIN_KEY;
  if (p.view === 'page') return resultsPage_(okKey ? readData_() : { ok: false });
  if (!okKey) return out_({ ok: false, error: 'unauthorized' }, e);
  return out_(readData_(), e);
}

function out_(obj, e) {
  const cb = e && e.parameter ? e.parameter.callback : '';
  if (cb && /^[A-Za-z_$][\w$]{0,60}$/.test(cb)) {
    return ContentService.createTextOutput(cb + '(' + JSON.stringify(obj) + ');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return json_(obj);
}

// صفحة النتائج تُعرض من Google مباشرة إذا منع المتصفح الاتصال من GitHub
function resultsPage_(data) {
  const v = Date.now();
  const html =
    '<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8">' +
    '<base target="_top">' +
    '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&display=swap">' +
    '<link rel="stylesheet" href="' + SITE + 'style.css?v=' + v + '">' +
    '<link rel="stylesheet" href="' + SITE + 'results.css?v=' + v + '">' +
    '</head><body><main class="wrap">' +
    '<header class="hero"><h1>نتائج الاستبيان</h1><p>الحقوق – المستوى الأول · الردود والإحصائيات</p></header>' +
    '<section class="section" id="loginBox"><form class="login" id="loginForm"><input type="password" id="key" hidden>' +
    '<button class="btn" type="submit" hidden>عرض</button></form><div id="loginErr" class="notice error" hidden style="margin:18px"></div></section>' +
    '<div id="dash" hidden style="display:flex;flex-direction:column;gap:18px">' +
    '<div class="toolbar"><button class="btn" id="refresh" type="button">تحديث</button>' +
    '<button class="btn ghost" id="logout" type="button">خروج</button><span class="updated" id="updated"></span></div>' +
    '<div class="filters" id="filters" role="group" aria-label="تصفية حسب المادة"></div>' +
    '<div class="tiles" id="tiles"></div><div id="charts" style="display:flex;flex-direction:column;gap:18px"></div></div>' +
    '</main>' +
    '<script>window.__DATA__ = ' + JSON.stringify(data).replace(/</g, '\\u003c') + ';</script>' +
    '<script src="' + SITE + 'questions.js?v=' + v + '"></script>' +
    '<script src="' + SITE + 'results.js?v=' + v + '"></script>' +
    '</body></html>';
  return HtmlService.createHtmlOutput(html)
    .setTitle('نتائج الاستبيان – ملخصات أبو عماد')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function thanksPage_() {
  const html =
    '<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><base target="_top">' +
    '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;800&display=swap">' +
    '<link rel="stylesheet" href="' + SITE + 'style.css">' +
    '</head><body><main class="wrap"><section class="section done">' +
    '<h2>وصلنا ردك، شكرًا لك!</h2>' +
    '<p>رأيك راح يساعدنا نقدّم لك ملخصات أفضل. بالتوفيق في بقية الفصل 📚</p>' +
    '</section><p class="footer">ملخصات أبو عماد… ملخصاتنا تخدمك</p></main></body></html>';
  return HtmlService.createHtmlOutput(html)
    .setTitle('شكرًا لك – ملخصات أبو عماد')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}
