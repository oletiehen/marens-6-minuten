const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const store={get:(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}},set:(k,v)=>localStorage.setItem(k,JSON.stringify(v))};
const quotes=[
'„Du musst heute nicht alles lösen. Du darfst einfach anfangen.“',
'„Was du dir selbst zusprichst, formt den Raum, in dem du lebst.“',
'„Manchmal ist Klarheit nur der Mut, ehrlich hinzusehen.“',
'„Ein ruhiger Gedanke kann einen ganzen Tag verändern.“',
'„Dankbarkeit macht aus einem gewöhnlichen Moment etwas, das bleibt.“',
'„Du wächst auch an den Tagen, an denen es sich nicht danach anfühlt.“',
'„Nicht jeder Tag muss besonders sein, um Bedeutung zu haben.“',
'„Sei heute nicht strenger mit dir, als du es mit einem Menschen wärst, den du liebst.“',
'„Kleine Schritte sind kein Umweg. Sie sind der Weg.“',
'„Du darfst gleichzeitig dankbar sein und dir Veränderung wünschen.“',
'„Was heute schwer ist, muss nicht für immer schwer bleiben.“',
'„Deine Aufmerksamkeit ist kostbar. Gib sie dem, was wachsen soll.“'
];
const weekly=[
'Worüber hast du lange nicht gesprochen, obwohl es noch in dir arbeitet?',
'Welche Seite von dir bekommt im Alltag zu wenig Raum?',
'Was würdest du tun, wenn du niemandem etwas beweisen müsstest?',
'Welche Erinnerung aus deiner Familie möchtest du bewahren – und warum?',
'Woran möchtest du dich in einem Jahr über diese Zeit erinnern?',
'Welche Grenze würde dir gerade mehr Ruhe schenken?',
'Was bedeutet für dich ein wirklich gelungenes Leben?'
];
const morningFields=[['mood','Wie zufrieden fühlst du dich gerade?','range'],['grateful','Wofür bist du heute dankbar?','text'],['focus','Was würde diesen Tag zu einem guten Tag machen?','text'],['intention','Wie möchtest du heute mit dir selbst umgehen?','text']];
const eveningFields=[['mood','Wie zufrieden bist du mit deinem Tag?','range'],['win','Was war heute ein schöner oder guter Moment?','text'],['learn','Was hast du heute über dich oder dein Leben gelernt?','text'],['release','Was darf für heute hierbleiben?','text']];
function keyDate(d=new Date()){return d.toISOString().slice(0,10)}
function daySeed(){return Math.floor(new Date().setHours(0,0,0,0)/86400000)}
function init(){const d=new Date(); $('#datePill').textContent=d.toLocaleDateString('de-DE',{weekday:'short',day:'2-digit',month:'short'}); const h=d.getHours(); $('#greeting').textContent=`${h<12?'Guten Morgen':h<18?'Hallo':'Guten Abend'}, Maren.`; $('#dayPart').textContent=h<12?'ANKOMMEN · AUSRICHTEN':h<18?'KURZ BEI DIR EINSCHECKEN':'WÜRDIGEN · LOSLASSEN'; $('#quoteText').textContent=quotes[daySeed()%quotes.length]; $('#weeklyQuestion').textContent=weekly[Math.floor(daySeed()/7)%weekly.length]; bind(); refresh(); requestAnimationFrame(parallax)}
function bind(){let qi=daySeed()%quotes.length; $('#quoteCard').onclick=()=>{const el=$('#quoteText');el.style.opacity=0;el.style.transform='translateY(5px)';setTimeout(()=>{qi=(qi+1)%quotes.length;el.textContent=quotes[qi];el.style.opacity=1;el.style.transform='translateY(0)'},180)}; $$('[data-route]').forEach(b=>b.onclick=e=>{e.preventDefault();route(b.dataset.route)}); $$('[data-open]').forEach(b=>b.onclick=()=>openRitual(b.dataset.open)); $('#saveJournal').onclick=saveJournal; $('#saveRitual').addEventListener('click',saveRitual); window.addEventListener('scroll',()=>requestAnimationFrame(parallax),{passive:true})}
function route(name){$$('.view').forEach(v=>v.classList.toggle('active',v.dataset.view===name)); $$('.bottom-nav button').forEach(b=>b.classList.toggle('active',b.dataset.route===name)); location.hash=name; window.scrollTo({top:0,behavior:'smooth'}); refresh()}
function openRitual(type){const morning=type==='morgen'; $('#ritualDialog').dataset.type=type; $('#ritualEyebrow').textContent=morning?'MORGEN · CA. 3 MINUTEN':'ABEND · CA. 3 MINUTEN'; $('#ritualTitle').textContent=morning?'Wie möchtest du heute leben?':'Was darf von heute bleiben?'; const fields=morning?morningFields:eveningFields; $('#ritualFields').innerHTML=fields.map(([id,label,t])=>t==='range'?`<div class="ritual-field"><label>${label}</label><div class="mood-scale"><input id="r_${id}" type="range" min="1" max="10" value="7" oninput="this.nextElementSibling.value=this.value"><output>7</output></div></div>`:`<div class="ritual-field"><label for="r_${id}">${label}</label><textarea id="r_${id}" placeholder="Ein Gedanke reicht …"></textarea></div>`).join(''); $('#ritualDialog').showModal()}
function saveRitual(e){e.preventDefault(); const type=$('#ritualDialog').dataset.type, fields=type==='morgen'?morningFields:eveningFields, data={date:keyDate(),type,createdAt:Date.now()}; fields.forEach(([id])=>data[id]=$(`#r_${id}`).value); const all=store.get('maren_rituals',[]); const idx=all.findIndex(x=>x.date===data.date&&x.type===type); idx>=0?all[idx]=data:all.push(data); store.set('maren_rituals',all); $('#ritualDialog').close(); refresh()}
function saveJournal(){const text=$('#journalText').value.trim(); if(!text){$('#journalStatus').textContent='Ein Satz genügt – aber ganz leer kann ich ihn nicht speichern.';return} const entries=store.get('maren_journal',[]); entries.unshift({id:Date.now(),date:new Date().toISOString(),title:$('#journalTitle').value.trim(),text}); store.set('maren_journal',entries); $('#journalTitle').value='';$('#journalText').value='';$('#journalStatus').textContent='Gespeichert. Du kannst den Gedanken jetzt loslassen.';refresh()}
function refresh(){const rituals=store.get('maren_rituals',[]), entries=store.get('maren_journal',[]), today=keyDate(); $('#morningDot').classList.toggle('done',rituals.some(r=>r.date===today&&r.type==='morgen')); $('#eveningDot').classList.toggle('done',rituals.some(r=>r.date===today&&r.type==='abend')); $('#entryCount').textContent=`${entries.length} ${entries.length===1?'Eintrag':'Einträge'}`; $('#journalHistory').innerHTML=entries.length?entries.slice(0,8).map(e=>`<article class="history-item"><span>${new Date(e.date).toLocaleDateString('de-DE',{day:'2-digit',month:'long',year:'numeric'})}</span><h3>${escapeHtml(e.title||'Ohne Titel')}</h3><p>${escapeHtml(e.text)}</p></article>`).join(''):'<p class="lead">Noch keine Einträge. Dein erster Gedanke wartet nicht auf Perfektion.</p>'; const seven=[...Array(7)].map((_,i)=>{const d=new Date();d.setDate(d.getDate()-(6-i));const k=keyDate(d), rs=rituals.filter(r=>r.date===k), moods=rs.map(r=>+r.mood).filter(Boolean);return{d,k,count:rs.length,mood:moods.length?Math.round(moods.reduce((a,b)=>a+b,0)/moods.length):null}}); $('#sevenDays').innerHTML=seven.map(x=>`<div class="day-card ${x.k===today?'today':''}"><span>${x.d.toLocaleDateString('de-DE',{weekday:'short',day:'2-digit'})}</span><strong>${x.mood??'·'}</strong><span>${x.count}/2 Rituale</span></div>`).join(''); const moods=seven.map(x=>x.mood).filter(Boolean); $('#avgMood').textContent=moods.length?(moods.reduce((a,b)=>a+b,0)/moods.length).toFixed(1):'–'; $('#ritualCount').textContent=rituals.length; $('#journalCount').textContent=entries.length}
function parallax(){if(matchMedia('(prefers-reduced-motion: reduce)').matches)return; $$('.parallax').forEach(el=>{const r=el.getBoundingClientRect(),speed=+el.dataset.speed||.05; if(r.bottom>0&&r.top<innerHeight)el.style.transform=`translate3d(0,${(r.top-innerHeight/2)*speed}px,0)`})}
function escapeHtml(s){return s.replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
init();