/**
 * سكربت حفظ ردود استبيان ملخصات أبو عماد في Google Sheets
 * - doPost: يستقبل الرد من صفحة الاستبيان ويضيفه كصف جديد
 * - doGet:  يرجّع كل الردود لصفحة النتائج (فقط مع كلمة المرور الصحيحة)
 */

// غيّر كلمة المرور هذي لكلمة سرية خاصة فيك، وهي اللي تدخلها في صفحة النتائج
const ADMIN_KEY = 'CHANGE_ME_123';
const SHEET_NAME = 'الردود';

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

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const data = JSON.parse(e.postData.contents);
    const answers = Array.isArray(data.answers) ? data.answers : [];
    const sh = getSheet_();
    let headers = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];

    // أضف عمود لأي سؤال جديد غير موجود
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
      if (/^[=+\-@]/.test(v)) v = "'" + v; // منع تنفيذ معادلات من الردود
      if (idx > 0) row[idx] = v;
    });
    sh.appendRow(row);
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  const key = e && e.parameter ? e.parameter.key : '';
  if (key !== ADMIN_KEY) return json_({ ok: false, error: 'unauthorized' });
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
  return json_({ ok: true, headers: headers, rows: rows });
}
