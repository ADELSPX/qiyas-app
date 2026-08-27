/* فك تشفير بنك الأسئلة — لا يحتوي الأسئلة نفسها */
window.QIYAS_UNLOCK = function(code){
  var KEY = 'QIYAS7USD2026';
  var input = code.replace(/[\s-]/g,'').toLowerCase();
  if (input !== 'qiyas7usd2026') return null;
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
