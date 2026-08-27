/* فك تشفير بنك الأسئلة مع ربط الجهاز — لا يحتوي الأسئلة نفسها */
window.QIYAS_UNLOCK = function(code){
  var KEY = 'QIYAS7USD2026';
  var input = code.replace(/[\s-]/g,'').toLowerCase();
  if (input !== 'qiyas7usd2026') return {error: 'كود التفعيل غير صحيح'};

  // 1) معرف الجهاز — يتولد مرة وحدة ويحفظ (ينتقل مع الجهاز مو مع الملف)
  var DEVICE_KEY = 'qiyas_device_id_v1';
  var deviceId = localStorage.getItem(DEVICE_KEY);
  if (!deviceId) {
    deviceId = 'dev-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2,10);
    localStorage.setItem(DEVICE_KEY, deviceId);
  }

  // 2) التحقق من السيرفر — ربط المفتاح بالجهاز (يمنع النسخ لجهاز ثاني)
  var ACTIVATE_URL = 'https://fazza-adel.duckdns.org/activate/';
  var xhr = new XMLHttpRequest();
  xhr.open('POST', ACTIVATE_URL, false); // sync — ننتظر نتيجة الربط
  xhr.setRequestHeader('Content-Type', 'application/json');
  try {
    xhr.send(JSON.stringify({key: code, device_id: deviceId}));
    var resp = JSON.parse(xhr.responseText);
    if (!resp.ok) return {error: resp.message || 'فشل التفعيل'};
  } catch(e) {
    return {error: 'تعذر الاتصال بخادم التفعيل — تأكد من اتصالك بالإنترنت ثم أعد المحاولة'};
  }

  // 3) فك التشفير محلياً بعد الموافقة
  try {
    var raw = window.QIYAS_BANK_ENC;
    var bin = atob(raw);
    var bytes = new Uint8Array(bin.length);
    for (var i=0; i<bin.length; i++){
      bytes[i] = bin.charCodeAt(i) ^ KEY.charCodeAt(i % KEY.length);
    }
    var out = new TextDecoder('utf-8').decode(bytes);
    return JSON.parse(out);
  } catch(e) { return null; }
};
