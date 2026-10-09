const $=id=>document.getElementById(id);
const DEF={bed:"23:00",wake:"06:30",dur:7.5,caf:"Low",mood:"Neutral",ex:30,scr:45,stress:5,tired:5,shift:"day",wh:8,cm:1};
let history=[];
const KEY="sleepPredictorHistory";
try{history=JSON.parse(localStorage.getItem(KEY)||"[]")||[]}catch(e){history=[]}

function toMin(t){const[a,b]=t.split(":").map(Number);return a*60+b}
function autoDur(){
  if(!$("bed").value||!$("wake").value)return;
  let d=toMin($("wake").value)-toMin($("bed").value);if(d<=0)d+=1440;
  $("dur").value=(Math.round(d/15)/4);
}
["bed","wake"].forEach(i=>$(i).addEventListener("input",autoDur));
$("stress").oninput=()=>$("stv").textContent=$("stress").value;
$("tired").oninput=()=>$("tiv").textContent=$("tired").value;

const SHIFT_LABEL={day:"Day shift",night:"Night shift",rotating:"Rotating shifts",flex:"Flexible / remote",physical:"Physically demanding"};

function recommend(shift,busy,tired){
  let lo=7,hi=9;const why=[];
  if(shift==="physical"){lo+=.5;hi+=.5;why.push("physically demanding work needs more recovery time")}
  if(shift==="night"||shift==="rotating"){lo+=.5;why.push("shift work usually shortens and fragments sleep, so aim for the upper side")}
  if(busy>=11){lo-=0;why.push("a long work and commute day leaves a narrow sleep window, so protect it")}
  if(tired>=7){lo+=.5;hi+=.5;why.push("high tiredness suggests you are carrying sleep debt")}
  else if(tired<=2){hi-=.5}
  hi=Math.min(hi,10);
  return{lo,hi,why};
}

function predict(){
  const v={bed:$("bed").value,wake:$("wake").value,dur:+$("dur").value||0,caf:$("caf").value,mood:$("mood").value,
    ex:+$("ex").value||0,scr:+$("scr").value||0,stress:+$("stress").value,tired:+$("tired").value,shift:$("shift").value,
    wh:+$("wh").value||0,cm:+$("cm").value||0,intr:+document.querySelector('input[name=intr]:checked').value};
  const busy=v.wh+v.cm, rec=recommend(v.shift,busy,v.tired);
  const shiftWork=v.shift==="night"||v.shift==="rotating";
  let s=100;const tips=[],plan=[];
  // duration
  let dpen=0;
  if(v.dur<rec.lo){dpen=Math.min((rec.lo-v.dur)*12,40);tips.push(`You slept ${v.dur} h, below your recommended ${rec.lo}-${rec.hi} h. Move bedtime earlier by ${Math.ceil((rec.lo-v.dur)*60/15)*15} minutes.`)}
  else if(v.dur>rec.hi){dpen=Math.min((v.dur-rec.hi)*6,15);tips.push("You slept longer than your range. Keep a steady wake-up time, even on days off.")}
  s-=dpen;
  const cp={None:0,Low:3,Moderate:8,High:15}[v.caf];s-=cp;
  if(cp>=8)tips.push("Cut caffeine to before midday, or at least 8 hours before bed.");
  if(v.ex===0){s-=8;tips.push("Increase your exercise duration for better sleep. Even a 20-minute walk helps.")}
  else if(v.ex<20){s-=4;tips.push("Add a few more minutes of movement. Aim for 20-60 minutes a day.")}
  const sp=Math.min(v.scr/6,15);s-=sp;
  if(v.scr>=30)tips.push(`Try reducing screen time by ${Math.min(30,Math.round(v.scr/2))} minutes before bed, or switch to a book or audio.`);
  s-=v.stress*1.8;
  if(v.stress>=6)tips.push("Stress is high. Try 5 minutes of slow breathing or writing tomorrow's to-do list before bed.");
  s-={Happy:0,Neutral:2,Sad:6,Anxious:9}[v.mood];
  if(v.mood==="Anxious")tips.push("For pre-sleep anxiety, try a body scan or a worry journal earlier in the evening.");
  if(v.intr){s-=10;tips.push("For night wake-ups, keep the room cool and dark and avoid checking the time or your phone.")}
  if(v.tired>=7&&v.dur>=rec.lo){s-=6}else s-=v.tired*.5;
  if(!shiftWork){const h=toMin(v.bed||"23:00")/60;if(h>=0&&h<4){s-=5;tips.push("Going to bed after midnight shifts your body clock. Try for before 11:30 pm.")}}
  s=Math.max(0,Math.min(100,Math.round(s)));
  const q=s>=75?"Good":s>=50?"Average":"Poor";

  // smart recovery plan
  const debt=Math.max(0,rec.lo-v.dur);
  if(debt>=1){plan.push(debt>=2.5?"Large sleep debt: do not try to repay it in one night. Add 30-45 minutes of sleep per night over the next 3-4 nights.":"Repay your sleep debt gradually: go to bed 30 minutes earlier for the next few nights.")}
  if(v.tired>=7){plan.push(shiftWork?"Take a 20-30 minute nap before your shift starts. Avoid naps in the last 4 hours before your main sleep.":"If you need a nap, keep it to 20-30 minutes and before 3 pm.");
    plan.push("Get bright light and a short walk soon after waking to lift alertness naturally.")}
  if(v.tired>=7&&v.dur>=rec.lo&&q!=="Good")plan.push("You slept enough hours but feel very tired, so quality is the issue. Focus on the habits flagged above rather than sleeping longer.");
  if(v.tired>=8&&v.dur>=rec.lo+.5)plan.push("If heavy tiredness lasts more than 2 weeks despite enough sleep, check in with a doctor.");
  if(v.shift==="night")plan.push("After a night shift, wear sunglasses on the commute home, sleep in a dark, cool room and use blackout curtains or an eye mask.");
  if(v.shift==="rotating")plan.push("Keep wake-up time as steady as you can across rotations, and shift your schedule 1-2 hours per day instead of all at once.");
  if(v.shift==="physical")plan.push("Eat a protein-rich snack after work, stretch for 10 minutes and keep fluids up to support muscle recovery.");
  if(v.shift==="flex")plan.push("Set a fixed work end time and a shutdown ritual so work does not spill into your wind-down hour.");
  if(v.shift==="day"&&busy>=10)plan.push("With a "+busy+"-hour work and commute day, set a hard wind-down alarm 45 minutes before bed.");
  if(busy>=11)plan.push("Use your commute for something calming such as music or a podcast instead of work messages.");
  if(!plan.length)plan.push("You are on track. Keep your bedtime and wake-up times consistent, including days off.");

  const rec_={d:new Date().toLocaleDateString(undefined,{day:"numeric",month:"short"}),q,s,dur:v.dur,tired:v.tired,shift:v.shift};
  history.unshift(rec_);history=history.slice(0,30);
  try{localStorage.setItem(KEY,JSON.stringify(history))}catch(e){}
  render(q,s,rec,v,busy,tips,plan);renderHist();
}

function li(a){return a.map(t=>"<li>"+t.replace(/</g,"&lt;")+"</li>").join("")}
function render(q,s,rec,v,busy,tips,plan){
  $("out").innerHTML=`<h2>Your prediction</h2>
  <div class="result ${q}"><span class="badge">${q}</span>
  <div class="bar"><i style="width:${s}%"></i></div><div style="font-size:.85rem;color:var(--mute)">Sleep score ${s} / 100</div></div>
  <div class="range">Recommended sleep for you: <b>${rec.lo}-${rec.hi} hours</b><br>
  <span style="color:var(--mute)">${SHIFT_LABEL[v.shift]}, ${busy} h work and commute, tiredness ${v.tired}/10${rec.why.length?". Why: "+rec.why.join("; "):""}.</span></div>
  <h2 style="margin-top:16px">Tips for tonight</h2>${tips.length?"<ul>"+li(tips)+"</ul>":"<p class='empty'>Your habits look solid. Keep them up.</p>"}
  <h2 style="margin-top:16px">Smart recovery plan</h2><ul>${li(plan)}</ul>`;
}
function renderHist(){
  if(!history.length)return;
  const pts=history.slice(0,14).reverse();
  const w=300,h=60,step=pts.length>1?w/(pts.length-1):0;
  const path=pts.map((p,i)=>`${i?"L":"M"}${(i*step).toFixed(1)},${(h-4-p.s/100*(h-8)).toFixed(1)}`).join(" ");
  $("history").innerHTML=`<h2>Past predictions</h2>
  <svg class="spark" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" role="img" aria-label="Sleep score trend"><path d="${path}" fill="none" stroke="var(--acc)" stroke-width="2.5" vector-effect="non-scaling-stroke"/></svg>
  <div class="scroll"><table><tr><th>Date</th><th>Quality</th><th>Score</th><th>Slept</th><th>Tired</th><th>Schedule</th></tr>
  ${history.slice(0,8).map(p=>`<tr><td>${p.d}</td><td class="${p.q}"><b>${p.q}</b></td><td>${p.s}</td><td>${p.dur} h</td><td>${p.tired}/10</td><td>${SHIFT_LABEL[p.shift]}</td></tr>`).join("")}</table></div>`;
}
function reset(){
  Object.keys(DEF).forEach(k=>{$(k).value=DEF[k]});
  document.querySelector('input[name=intr][value="0"]').checked=true;
  $("stv").textContent=DEF.stress;$("tiv").textContent=DEF.tired;
  $("out").innerHTML='<h2>Your prediction</h2><p class="empty">Inputs reset. Choose Predict sleep quality when ready.</p>';
}
$("go").onclick=predict;$("reset").onclick=reset;
$("hist").onclick=()=>$("history").scrollIntoView({behavior:"smooth",block:"start"});
renderHist();
