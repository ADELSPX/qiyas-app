/* Local deterministic diagnostic logic for original training questions only. */
window.DIAGNOSTIC_IDS = ["QA001","QA007","QL001","QL007","QG001","QG004","QS001","VA001","VA005","VC001","VC005","VR001","VR006","VE001","VO001"];
let bank = (window.QIYAS_BANK && window.QIYAS_BANK.questions) || [];
let byId = Object.fromEntries(bank.map(q => [q.id, q]));
let questions = window.DIAGNOSTIC_IDS.map(id => byId[id]);
let cursor = 0, answers = {}, startedAt = 0, timer = null, elapsed = {};
const $ = id => document.getElementById(id);
const toArabic = n => String(n).replace(/[0-9]/g, d => "٠١٢٣٤٥٦٧٨٩"[d]);

function start() { $("landing").classList.add("hidden"); $("diagnostic").classList.add("active"); $("quizView").classList.remove("hidden"); $("resultView").classList.remove("active"); cursor=0; answers={}; elapsed={}; startedAt=Date.now(); if (timer) clearInterval(timer); timer=setInterval(renderTimer,1000); renderQuestion(); }
function exit() { clearInterval(timer); $("diagnostic").classList.remove("active"); $("landing").classList.remove("hidden"); window.scrollTo({top:0,behavior:"smooth"}); }
function renderTimer(){ const s=Math.floor((Date.now()-startedAt)/1000); $("timer").textContent=`${toArabic(Math.floor(s/60).toString().padStart(2,"0"))}:${toArabic((s%60).toString().padStart(2,"0"))}`; }
function renderQuestion(){ const q=questions[cursor]; $("counter").textContent=`${toArabic(cursor+1)} / ${toArabic(questions.length)}`; $("progressFill").style.width=`${(cursor/questions.length)*100}%`; $("qTopic").textContent=`${q.section} · ${q.topic}`; $("question").textContent=q.prompt; const p=$("passage"); p.textContent=q.passage||""; p.classList.toggle("hidden",!q.passage); $("options").innerHTML=q.options.map((opt,i)=>`<button class="option ${answers[q.id]===i?"selected":""}" data-index="${i}">${toArabic(i+1)}. ${opt}</button>`).join(""); document.querySelectorAll(".option").forEach(b=>b.onclick=()=>{answers[q.id]=Number(b.dataset.index); renderQuestion();}); $("prevBtn").style.visibility=cursor===0?"hidden":"visible"; $("nextBtn").textContent=cursor===questions.length-1?"اعرض التقرير ←":"التالي ←"; }
function next(){ const q=questions[cursor]; if (answers[q.id]===undefined){ alert("اختر إجابة قبل الانتقال."); return;} elapsed[q.id]=Math.max(1,(Date.now()-startedAt)/1000); if(cursor===questions.length-1) finish(); else {cursor++; startedAt=Date.now(); renderQuestion();} }
function prev(){if(cursor>0){cursor--; startedAt=Date.now(); renderQuestion();}}
function scoreGroup(items){return Object.entries(items).map(([name,v])=>({name,score:Math.round(v.correct/v.total*100),correct:v.correct,total:v.total})).sort((a,b)=>a.score-b.score);}
function finish(){ clearInterval(timer); $("quizView").classList.add("hidden"); $("resultView").classList.add("active"); let topics={}, sections={}, correct=0, times=[]; questions.forEach(q=>{const ok=answers[q.id]===q.answer_index; correct+=ok?1:0; (topics[q.topic]??={correct:0,total:0}).total++; (sections[q.section]??={correct:0,total:0}).total++; if(ok){topics[q.topic].correct++;sections[q.section].correct++;} if(elapsed[q.id]) times.push(elapsed[q.id]);}); const ts=scoreGroup(topics), ss=scoreGroup(sections), overall=Math.round(correct/questions.length*100), avg=times.length?times.reduce((a,b)=>a+b,0)/times.length:null, weak=ts.slice(0,3), strong=[...ts].sort((a,b)=>b.score-a.score).slice(0,2); const quant=ss.find(x=>x.name==="كمي")?.score||0, verbal=ss.find(x=>x.name==="لفظي")?.score||0; const pace=!avg?"غير مقاس":avg<28&&overall<70?"سريع يحتاج تهدئة":avg>70?"متأنٍ يحتاج ضبط وقت":"متوازن"; const paceAdvice=!avg?"أضف توقيتًا في المحاولة التالية حتى تحسن الأداة نصيحة إدارة الوقت.":pace==="سريع يحتاج تهدئة"?"خفف السرعة قليلًا وحدد المعطيات قبل اختيار الإجابة.":pace==="متأنٍ يحتاج ضبط وقت"?"علّم السؤال الصعب وانتقل إليه لاحقًا بدل استنزاف الوقت.":"حافظ على الإيقاع، وركز على تحليل الأخطاء حسب الموضوع."; $("resultTitle").textContent=`أجبت صحيحًا عن ${toArabic(correct)} من ${toArabic(questions.length)} — نتيجة تدريبية ${toArabic(overall)}٪`; $("resultNote").textContent="هذه نتيجة تدريبية لأسئلة المنتج الأصلية وليست درجة اختبار رسمي أو توقعًا للقبول."; $("metrics").innerHTML=`<div><b>أقوى موضوع</b><strong>${strong[0]?.name||"—"}</strong></div><div><b>أولوية مراجعة</b><strong>${weak[0]?.name||"—"}</strong></div><div><b>إيقاعك</b><strong>${pace}</strong></div>`; $("topics").innerHTML=ts.map(r=>`<div class="topic-line"><span>${r.name}</span><div class="bar"><i style="width:${r.score}%"></i></div><small>${toArabic(r.score)}٪</small></div>`).join(""); $("profile").innerHTML=`<p><b>الاتجاه:</b> ${quant-verbal>=15?"يميل للكمي":verbal-quant>=15?"يميل للفظي":"متوازن بين الكمي واللفظي"}.</p><p><b>إدارة الوقت:</b> ${paceAdvice}</p><p><b>تنبيه مراجعة:</b> ${weak.some(x=>["حساب","جبر","هندسة","إحصاء"].includes(x.name))?"راجع خطوات الحساب وتحويل المعطيات قبل الحل.":"جانب الحساب مستقر في هذه العينة."} ${weak.some(x=>["فهم المقروء","إكمال الجمل","تناظر لفظي","سلامة لغوية","الكلمة المختلفة"].includes(x.name))?"وراجع الكلمات الدالة والمطلوب في السؤال اللفظي.":"جانب الفهم اللفظي مستقر في هذه العينة."}</p>`; const plan=[...weak.map((x,i)=>({day:i+1,focus:x.name,text:`حل 8 تمارين أصلية في ${x.name}، ثم اكتب سبب كل خطأ.`})),{day:4,focus:"مراجعة الأخطاء",text:"أعد حل الأسئلة المخطئة دون التفسير ثم قارِن طريقتك."},{day:5,focus:"إدارة الوقت",text:"حل 10 أسئلة مختلطة بمؤقت وعلّم السؤال الذي تجاوز دقيقة وربع."},{day:6,focus:strong[0]?.name||"مراجعة",text:"ثبّت موضوعك الأقوى في 6 أسئلة قصيرة."},{day:7,focus:"اختبار قصير",text:"أعد التشخيص أو حل مجموعة مختلطة وقارن نتيجة اليوم الأول."}]; $("plan").innerHTML=plan.map(x=>`<div class="day"><b>اليوم ${toArabic(x.day)} · ${x.focus}</b><br>${x.text}</div>`).join(""); $("progressFill").style.width="100%"; }
function renderCoverage(){ const d=window.QIYAS_BANK.distribution; $("coverage").innerHTML=Object.entries(d).map(([topic,count])=>`<div class="coverage-row"><span>${topic}</span><div class="bar"><i style="width:${count/18*100}%"></i></div><span class="count">${toArabic(count)} سؤال</span></div>`).join("");}
$("startBtn").onclick=start; $("exitBtn").onclick=exit; $("nextBtn").onclick=next; $("prevBtn").onclick=prev; $("restartBtn").onclick=start;
window.__APP_READY = function(){
  if (window.QIYAS_BANK && window.QIYAS_BANK.questions) {
    var bank = window.QIYAS_BANK.questions;
    var byId2 = Object.fromEntries(bank.map(function(q){return [q.id,q];}));
    // rebuild questions from the unlocked bank
    window.__setBank(bank, byId2);
    renderCoverage();
  }
};
window.__setBank = function(bankArr, byIdMap){
  bank = bankArr;
  byId = byIdMap;
  questions = window.DIAGNOSTIC_IDS.map(function(id){ return byId[id]; });
};
// initial coverage only if bank already present (edge case: no lock)
if (window.QIYAS_BANK && window.QIYAS_BANK.questions) renderCoverage();
