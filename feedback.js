/* Client review only: never changes the approved schematic geometry. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id), form = $('comment-form'), map = $('review-map');
  const areas = [...$('comment-area').options].map(o => o.value);
  const views = [...document.querySelectorAll('[data-view]')].map(b=>b.dataset.view);
  const revision=window.BC_LAYOUT.revision, modes=window.BC_LAYOUT.states.map(s=>s.mode), modeNames={handover:'Handover',consulting:'Consulting',lounge:'Waiting annex'};
  const endpoint = window.BC_FEEDBACK_CONFIG?.endpoint || '';
  const submissionEnabled=window.BC_LAYOUT.feedbackPolicy?.submissionEnabled===true&&window.BC_FEEDBACK_CONFIG?.submissionEnabled===true;
  const offlineNotice='ยังไม่พร้อมส่ง Google Sheet · ข้อความเป็นร่างในหน้านี้ กรุณาคัดลอกก่อนปิดหน้า';
  const endpointConfigured = /^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(endpoint);
  let validEndpoint=false, revisionWarning=''; // Fail closed until the live backend explicitly supports this revision.
  let location = {type:'area'}, tool = 'point', corner = null, cursor = {x:20,y:8};
  let keyboard = false, sending = false, pending = null, sequence = 0;
  let mapZoom=1, mapCenter={x:20,y:8}, drag=null;
  const uuid = () => crypto.randomUUID();
  let clientId = uuid();
  try {const saved = localStorage.getItem('bc-review-device');if (/^[0-9a-f-]{36}$/i.test(saved || '')) clientId = saved; else localStorage.setItem('bc-review-device', clientId);} catch (_) { /* Memory-only works on shared/restricted browsers. */ }
  const currentMode = () => $('mode').value;
  const currentExterior = () => $('exterior-scheme').value;
  const currentView = () => window.BC_EXPERIENCE?.inspect().view || window.BC_VIEWER?.inspect().view || document.querySelector('[data-view][aria-pressed=true]')?.dataset.view || 'interior';
  const experience = () => window.BC_EXPERIENCE?.inspect();
  const referenceFields = () => {const c=experience();return c?{experienceRevision:c.experienceRevision,section:c.section,referenceKind:c.referenceKind,referenceId:c.referenceId}:{};};
  const draftKey = () => JSON.stringify({...referenceFields(),mode:currentMode(),ac:$('flex-ac').checked,exterior:currentExterior()});
  const drafts=new Map();let activeDraftKey=draftKey(),restoring=true;
  function saveDraft(){drafts.set(activeDraftKey,{comment:$('comment-text').value,area:$('comment-area').value,location:{...location},corner:corner?{...corner}:null,pending,sequence,signature:comparable(payload())});}
  function restoreDraft(){activeDraftKey=draftKey();const draft=drafts.get(activeDraftKey);$('comment-text').value=draft?.comment||'';$('comment-area').value=draft?.area||'general';location=draft?.location?{...draft.location}:{type:'area'};corner=draft?.corner?{...draft.corner}:null;pending=draft?.pending||null;sequence++;$('comment-count').textContent=`${$('comment-text').value.length.toLocaleString('en-US')} / 3,000`;$('comment-text').setCustomValidity('');window.BC_EXPERIENCE?.scope();sync();if(!sending)status(validEndpoint?'พร้อมรับความเห็นในส่วนและมุมนี้':offlineNotice);}
  function contextChanged(){if(restoring||window.BC_EXPERIENCE?.isChanging())return;saveDraft();restoreDraft();window.BC_EXPERIENCE?.syncURL();}
  const inside = (x,y) => Number.isFinite(x) && Number.isFinite(y) && x>=0 && x<=40 && y>=0 && y<=16 && !(x>24 && y<2.5);
  const validLocation = q => q.type === 'area' || (['point','rectangle'].includes(q.type) && inside(q.x,q.y) && (q.type !== 'rectangle' || (inside(q.x2,q.y2) && inside(q.x2,q.y) && inside(q.x,q.y2) && q.x2-q.x>=.05 && q.y2-q.y>=.05)));
  const grid = (x,y) => `Lx${Math.min(4,Math.floor(x/8))}–${Math.min(5,Math.floor(x/8)+1)} / ${y<2.5?'G–H':y<8?'F–G':'E–F'}`;
  const coord = (x,y) => `X ${x.toFixed(2)}, Y ${y.toFixed(2)} ม.`;
  function status(text, state='') {$('submit-status').textContent=text;$('submit-status').dataset.state=state;}
  function changed() {sequence++;if(!sending) {pending=null;status((validEndpoint?'พร้อมรับความเห็น':offlineNotice)+(revisionWarning?' · '+revisionWarning:''));}}
  function element(tag, attrs={}, text='') {const el=document.createElementNS('http://www.w3.org/2000/svg',tag);Object.entries(attrs).forEach(([k,v])=>el.setAttribute(k,v));if(text)el.textContent=text;map.appendChild(el);return el;}
  function rect(x,y,w,h,attrs={}) {return element('rect',{x,y:16-y-h,width:w,height:h,...attrs});}
  function mapText(x,y,text,attrs={}) {return element('text',{x,y:16-y,'text-anchor':'middle',...attrs},text);}
  function drawMap() {
    map.replaceChildren();
    const vw=43/mapZoom,vh=20/mapZoom;
    map.setAttribute('viewBox',mapZoom===1?'-1.5 -1.5 43 20':`${mapCenter.x-vw/2} ${16-mapCenter.y-vh/2} ${vw} ${vh}`);
    map.style.touchAction=mapZoom===1?'manipulation':'none';
    $('reset-map').hidden=mapZoom===1;
    $('zoom-help').textContent=mapZoom===1?'เลือกจุด แล้วขยายเพื่อชี้ให้แม่นขึ้น':'ลากเพื่อเลื่อนผัง · แตะเพื่อเลือกจุด';
    const s=window.BC_LAYOUT.states.find(q=>q.mode===currentMode());
    element('polygon',{points:s.floor.map(p=>`${p[0]},${16-p[1]}`).join(' '),fill:'#eee',stroke:'#777','stroke-width':.12});
    rect(32,8,8,8,{fill:'#dce9ed',stroke:'#8d9b9f','stroke-width':.1});
    rect(32,2.5,8,5.5,{fill:currentMode()==='handover'?'#e5dfd5':'#dce9ed',stroke:'#999','stroke-width':.1});
    rect(28,8,4,8,{fill:'#e0e8df'});
    rect(8,11.5,8,4.5,{fill:'#d9d8d5',stroke:'#777','stroke-width':.1});
    rect(8,13.9,2.3,2.1,{fill:'#bdbdbb',stroke:'#777','stroke-width':.08});
    element('path',{d:'M16 0 H28 V2.5 A2 2 0 0 1 26 4.5 H16 Z',fill:'#dfdedb',stroke:'#777','stroke-width':.1});
    for(const [x,y,w,h] of [[4.3,12.4,2,1.5],[2.6,12.4,1.7,1.5],[2.6,13.9,1.7,.7],[2.6,14.6,1.7,1.4],[4.3,14.6,2,1.4]])rect(x,y,w,h,{fill:'#c8c8c8',stroke:'#777','stroke-width':.08});
    for(let i=1;i<8;i++)for(const y of [12.4,14.6])element('line',{x1:4.3+i*.25,x2:4.3+i*.25,y1:16-y,y2:16-y-(y===12.4?1.5:1.4),stroke:'#999','stroke-width':.05});
    for(let i=1;i<4;i++)element('line',{x1:2.6,x2:4.3,y1:2.1-i*.175,y2:2.1-i*.175,stroke:'#999','stroke-width':.05});
    element('polygon',{points:s.module.shape.map(p=>`${p[0]},${16-p[1]}`).join(' '),fill:'#dedfd7',stroke:'#7f856b','stroke-width':.12});
    for(const x of [0,8,16,24,32,40]) {element('line',{x1:x,x2:x,y1:0,y2:16,stroke:'#aaa','stroke-width':.05,'stroke-dasharray':'.3 .3'});mapText(x,16.6,`Lx${x/8}`,{class:'grid-label'});}
    for(const [name,y] of [['H',0],['G',2.5],['F',8],['E',16]]) {element('line',{x1:0,x2:40,y1:16-y,y2:16-y,stroke:'#aaa','stroke-width':.05,'stroke-dasharray':'.3 .3'});mapText(-.85,y-.2,name,{class:'grid-label'});}
    for(const c of s.columns)rect(c.x,c.y,c.w,c.h,{fill:'#555'});
    for(const q of s.furniture.filter(q=>['counter','table','sofa','armchair'].includes(q.type)))rect(q.cx-q.w/2,q.cy-q.h/2,q.w,q.h,{fill:q.type==='counter'?'#8b7663':'#aaa','fill-opacity':.6});
    for(const c of s.cars) {const r=rect(c.cx-c.l/2,c.cy-c.w/2,c.l,c.w,{rx:.3,fill:c.brand==='smart'?'#fafaf5':'#fbfbfb',stroke:'#555','stroke-width':.1,transform:`rotate(${-c.angle},${c.cx},${16-c.cy})`});r.setAttribute('aria-hidden','true');mapText(c.cx,c.cy-.2,c.id);}
    mapText(36,12,'LOUNGE');mapText(30,14,'SERVICE');mapText(4.4,14.1,'STAIR');mapText(12,14,'ADMIN');mapText(22,14,'LIVING / MANAGER');mapText(11.6,9.65,'COUNTER');mapText(28.2,.9,'ENTRANCE');mapText(4.4,10,'smart 3B');
    mapText(36,7.2,modeNames[currentMode()].toUpperCase());
    if(location.type==='rectangle') rect(location.x,location.y,location.x2-location.x,location.y2-location.y,{class:'range'});
    if(location.type!=='area')element('circle',{cx:location.x,cy:16-location.y,r:.45,class:'pin'});
    if(corner)element('circle',{cx:corner.x,cy:16-corner.y,r:.35,class:'pin'});
    if(keyboard)element('circle',{cx:cursor.x,cy:16-cursor.y,r:.65,class:'keyboard-cursor'});
  }
  function help() {$('map-help').textContent=tool==='point'?'แตะจุดบนผัง หรือใช้ปุ่มลูกศรแล้วกด Enter':corner?'แตะมุมตรงข้ามเพื่อจบพื้นที่ · Escape ยกเลิก':'แตะสองมุมตรงข้ามเพื่อวงพื้นที่ · ใช้ลูกศร + Enter ได้';}
  function sync() {
    drawMap();help();
    $('location-summary').textContent=location.type==='area'?'ยังไม่ระบุจุดเฉพาะ':location.type==='point'?`${grid(location.x,location.y)} · ${coord(location.x,location.y)}`:`${coord(location.x,location.y)} ถึง ${coord(location.x2,location.y2)}`;
    $('show-location').hidden=location.type==='area' || !window.BC_VIEWER;
    const viewLabel=document.querySelector(`[data-view="${currentView()}"]`)?.textContent||currentView();
    const c=experience();
    $('comment-context').textContent=(c?`${c.title} · ${c.referenceKind==='artist-impression'?'ภาพแนวคิด':'โมเดล 3D'}: ${c.referenceTitle} · `:'')+`ร่าง ${modeNames[currentMode()]} · แอร์ ${$('flex-ac').checked?'เปิด':'ปิด'} · โมเดล ${revision} · ${currentExterior()==='proposed'?'ข้อเสนอเพิ่มเติม':'ภายนอกเดิม'} · ${viewLabel}${location.type==='area'?'':' · หมุดภายในอาคาร'}`;
    window.BC_VIEWER?.setReviewLocation(location);
  }
  function pick(p) {
    if(!inside(p.x,p.y)) {$('map-help').textContent='เลือกจุดภายในขอบอาคารสีเทา';return;}
    if(tool==='rectangle' && !corner) {corner=p;drawMap();help();return;}
    const next=tool==='point'?{type:'point',...p}:{type:'rectangle',x:Math.min(corner.x,p.x),y:Math.min(corner.y,p.y),x2:Math.max(corner.x,p.x),y2:Math.max(corner.y,p.y)};
    if(!validLocation(next)) {$('map-help').textContent='พื้นที่ต้องอยู่ในอาคารและมีขนาดมากกว่า 5 ซม. กรุณาเลือกมุมตรงข้ามใหม่';return;}
    location=next;corner=null;changed();sync();
  }
  map.addEventListener('pointerdown',e=>{if(e.button!==0)return;map.setPointerCapture(e.pointerId);drag={id:e.pointerId,x:e.clientX,y:e.clientY,center:{...mapCenter},moved:false};});
  map.addEventListener('pointermove',e=>{if(!drag||e.pointerId!==drag.id)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(Math.hypot(dx,dy)>6)drag.moved=true;if(drag.moved&&mapZoom>1){const k=43/mapZoom/map.clientWidth;mapCenter={x:Math.max(0,Math.min(40,drag.center.x-dx*k)),y:Math.max(0,Math.min(16,drag.center.y+dy*k))};drawMap();}});
  map.addEventListener('pointerup',e=>{if(!drag||e.pointerId!==drag.id)return;const moved=drag.moved;drag=null;if(moved)return;const matrix=map.getScreenCTM();if(!matrix)return;const p=new DOMPoint(e.clientX,e.clientY).matrixTransform(matrix.inverse());keyboard=false;cursor={x:Math.round(p.x*100)/100,y:Math.round((16-p.y)*100)/100};pick({...cursor});});
  map.addEventListener('pointercancel',()=>{drag=null;});
  map.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Enter',' ','Escape'].includes(e.key))return;e.preventDefault();keyboard=true;const delta=e.shiftKey?.1:.5;if(e.key==='Escape'){corner=null;help();}else if(['Enter',' '].includes(e.key)){pick({...cursor});return;}else {cursor.x=Math.max(0,Math.min(40,cursor.x+(e.key==='ArrowRight'?delta:e.key==='ArrowLeft'?-delta:0)));cursor.y=Math.max(0,Math.min(16,cursor.y+(e.key==='ArrowUp'?delta:e.key==='ArrowDown'?-delta:0)));$('map-help').textContent=`เคอร์เซอร์ ${coord(cursor.x,cursor.y)} · Enter เพื่อเลือก`;}drawMap();});
  document.querySelectorAll('[data-loc-tool]').forEach(b=>b.addEventListener('click',()=>{tool=b.dataset.locTool;corner=null;document.querySelectorAll('[data-loc-tool]').forEach(q=>q.setAttribute('aria-pressed',String(q===b)));drawMap();help();}));
  $('zoom-map').addEventListener('click',()=>{mapZoom=2.5;mapCenter=location.type==='area'?{...cursor}:{x:location.x,y:location.y};drawMap();});
  $('reset-map').addEventListener('click',()=>{mapZoom=1;drawMap();});
  $('clear-location').addEventListener('click',()=>{location={type:'area'};corner=null;changed();sync();});
  $('show-location').addEventListener('click',()=>{const selected={...location};window.BC_VIEWER?.setView('plan');location=selected;corner=null;changed();sync();document.querySelector('.stage').scrollIntoView({block:'center',behavior:'instant'});});
  $('mode').addEventListener('change',()=>{if(experience())contextChanged();else{changed();sync();}});
  $('flex-ac').addEventListener('change',()=>{if(experience())contextChanged();else{changed();sync();}});
  document.addEventListener('bc:viewchange',()=>{if(!experience()){changed();sync();}});
  document.addEventListener('bc:exteriorchange',()=>{if(experience())contextChanged();else{changed();sync();}});
  document.addEventListener('bc:contextwillchange',()=>{if(!restoring)saveDraft();});
  document.addEventListener('bc:contextchange',()=>{if(!restoring)restoreDraft();});
  form.addEventListener('input',()=>{changed();$('comment-count').textContent=`${$('comment-text').value.length.toLocaleString('en-US')} / 3,000`;});
  function payload() {const c=experience(),artist=c?.referenceKind==='artist-impression';return {schema:1,id:uuid(),clientId,name:$('comment-name').value,team:$('comment-team').value,comment:$('comment-text').value,area:$('comment-area').value,location:c&&(c.section!=='showroom'||artist)?{type:'area'}:{...location},mode:artist?'handover':currentMode(),modelRevision:revision,ac:artist?false:$('flex-ac').checked,exteriorScheme:artist?'proposed':currentExterior(),view:currentView(),website:$('comment-website').value,...referenceFields()};}
  const comparable=p=>JSON.stringify({...p,id:''});
  form.addEventListener('submit',async e=>{
    e.preventDefault();if(sending || !submissionEnabled || !validEndpoint)return;
    if(!$('comment-text').value.trim()) {$('comment-text').setCustomValidity('กรุณาเขียนความเห็นก่อนส่ง');$('comment-text').reportValidity();return;}
    if(corner){status('กรุณาเลือกมุมตรงข้ามให้ครบ หรือล้างจุดก่อนส่ง','error');return;}
    const candidate=payload();
    if(!pending || comparable(pending)!==comparable(candidate))pending=candidate;
    const submission={...pending}, before=sequence, submittedDraftKey=activeDraftKey, controller=new AbortController(), timeout=setTimeout(()=>controller.abort(),30000);
    sending=true;$('submit-comment').disabled=true;$('submit-comment').textContent='กำลังบันทึก…';status('กำลังรอใบรับจากระบบ กรุณาอย่าปิดหน้านี้');
    try {
      const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'text/plain;charset=UTF-8'},body:JSON.stringify(submission),credentials:'omit',redirect:'follow',signal:controller.signal});
      if(!response.ok)throw Error('unconfirmed');
      const receipt=await response.json();
      if(receipt.ok!==true || receipt.id!==submission.id || !Number.isFinite(Date.parse(receipt.receivedAt)))throw Error(receipt.error || 'unconfirmed');
      const confirmedCurrent=experience()?activeDraftKey===submittedDraftKey&&comparable(payload())===comparable(submission):sequence===before;
      status(confirmedCurrent?`บันทึกแล้ว · เลขรับ ${receipt.id.slice(0,8)} · ทีมจะพิจารณาร่วมกันก่อนแก้แบบ`:`บันทึกความเห็นก่อนหน้าแล้ว · เลขรับ ${receipt.id.slice(0,8)} · ข้อความหรือบริบทที่แก้ระหว่างส่งยังไม่ได้บันทึก กรุณากดส่งอีกครั้ง`,'success');if(activeDraftKey===submittedDraftKey)pending=null;
      const stored=drafts.get(submittedDraftKey);if(stored?.signature===comparable(submission)){stored.comment='';stored.pending=null;}
      // Never clear a newer draft that was edited while the network was pending.
      if(confirmedCurrent){$('comment-text').value='';$('comment-count').textContent='0 / 3,000';}
    } catch(error) {
      const messages={rate_limited:'ส่งถี่เกินไป กรุณารอสักครู่แล้วลองอีกครั้ง',bad_request:'ข้อมูลบางส่วนไม่ถูกต้อง กรุณาตรวจข้อความและตำแหน่ง',conflict:'รหัสรายการนี้มีข้อมูลต่างกัน กรุณาแก้ข้อความแล้วส่งใหม่'};
      status(`${messages[error.message] || 'ยังยืนยันการบันทึกไม่ได้ กรุณาลองส่งอีกครั้ง'} · ข้อความยังอยู่ หากลองซ้ำด้วยข้อมูลเดิม ระบบจะไม่บันทึกซ้ำ`,'error');
    } finally {clearTimeout(timeout);sending=false;$('submit-comment').disabled=!submissionEnabled||!validEndpoint;$('submit-comment').textContent='ส่งความเห็น';}
  });
  $('comment-text').addEventListener('input',()=>$('comment-text').setCustomValidity(''));
  // Permalinks carry geometry context only, never private comment text or authors.
  const query=new URLSearchParams(window.location.search);
  const validNumericParam=k=>query.has(k)&&query.get(k).trim()!==''&&Number.isFinite(Number(query.get(k)));
  if(query.get('rev') && query.get('rev')!==revision)status('ลิงก์นี้อ้างอิงแบบคนละรุ่น กรุณาตรวจตำแหน่งก่อนส่ง','error');
  else {
    if(experience()?.referenceKind!=='artist-impression'&&modes.includes(query.get('mode'))) {$('mode').value=query.get('mode');$('mode').dispatchEvent(new Event('change'));}
    if(experience()?.referenceKind!=='artist-impression'&&['0','1'].includes(query.get('ac'))){$('flex-ac').checked=query.get('ac')==='1';$('flex-ac').dispatchEvent(new Event('change'));}
    if(areas.includes(query.get('area')))$('comment-area').value=query.get('area');
    const type=query.get('loc');
    if((!experience()||(experience().section==='showroom'&&experience().referenceKind==='model'))&&['point','rectangle'].includes(type)) {const q={type,x:Number(query.get('x')),y:Number(query.get('y'))};if(type==='rectangle'){q.x2=Number(query.get('x2'));q.y2=Number(query.get('y2'));}if(validNumericParam('x')&&validNumericParam('y')&&(type!=='rectangle'||validNumericParam('x2')&&validNumericParam('y2'))&&validLocation(q)){location=q;document.querySelector('.location-details').open=true;}}
    if(!experience()&&views.includes(query.get('view')))window.BC_VIEWER?.setView(query.get('view'));
    if(experience()?.referenceKind!=='artist-impression'&&['existing','proposed'].includes(query.get('exterior'))){$('exterior-scheme').value=query.get('exterior');$('exterior-scheme').dispatchEvent(new Event('change'));}
  }
  activeDraftKey=draftKey();restoring=false;window.BC_EXPERIENCE?.scope();sync();$('submit-comment').disabled=!validEndpoint;
  $('connection-notice').hidden=validEndpoint;
  status(validEndpoint?'พร้อมรับความเห็น':offlineNotice);
  if(query.get('rev') && query.get('rev')!==revision){revisionWarning='ลิงก์นี้อ้างอิงแบบคนละรุ่น จึงไม่คืนตำแหน่งเดิม กรุณาตรวจโมเดล '+revision;$('connection-notice').hidden=false;$('connection-notice').textContent=revisionWarning;status(revisionWarning,'error');}
  if(submissionEnabled&&endpointConfigured){
    status('กำลังตรวจว่าระบบรับความเห็นรองรับ '+revision+'…');
    const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),12000);
    fetch(endpoint,{credentials:'omit',signal:controller.signal}).then(r=>{if(!r.ok)throw Error('health');return r.json();}).then(h=>{
      const cap=h.experienceCapabilitiesByRevision?.v10,app=window.BC_EXPERIENCE;
      if(app&&(cap?.artistImpressionState?.mode!=='handover'||cap?.artistImpressionState?.ac!==false||cap?.artistImpressionState?.exteriorScheme!=='proposed'))throw Error('health');
      const viewSupport=app?Array.isArray(h.experienceRevisions)&&h.experienceRevisions.includes('v10')&&cap?.modelRevision===revision&&cap.pinSection==='showroom'&&cap.pinReferenceKind==='model'&&['model','artist-impression'].every(k=>cap.referenceKinds?.includes(k))&&Object.entries(app.sections).every(([key,s])=>cap.sections?.includes(key)&&Array.isArray(cap.viewsBySection?.[key])&&s.views.every(v=>cap.viewsBySection[key].includes(v)))&&Array.isArray(cap.artistImpressions)&&app.images.every(i=>cap.artistImpressions.some(r=>r.id===i.id&&r.section===i.section&&r.view===i.view))&&['exterior','parking','identity','workshop','hv','me','parts'].every(a=>h.additionalAreasByExperienceRevision?.v10?.includes(a)):Array.isArray(h.viewsByRevision?.[revision])&&views.every(v=>h.viewsByRevision[revision].includes(v));
      validEndpoint=h.ok===true&&h.schema===1&&h.service==='mbsmart-comments'&&Array.isArray(h.revisions)&&h.revisions.includes(revision)&&Array.isArray(h.modesByRevision?.[revision])&&modes.every(m=>h.modesByRevision[revision].includes(m))&&viewSupport&&Array.isArray(h.exteriorSchemesByRevision?.[revision])&&['existing','proposed'].every(s=>h.exteriorSchemesByRevision[revision].includes(s));
      $('submit-comment').disabled=!validEndpoint;$('connection-notice').hidden=validEndpoint&&!revisionWarning;
      if(validEndpoint&&revisionWarning)$('connection-notice').textContent=revisionWarning;
      if(!validEndpoint)$('connection-notice').textContent='เปิดตรวจแบบ '+revision+' ได้แล้ว — ยังไม่เปิดส่งความเห็นรุ่นนี้ ระหว่างรออัปเดตระบบ Google ของโครงการ ข้อความที่พิมพ์ยังไม่ถูกบันทึก กรุณาคัดลอกเก็บไว้ก่อนปิดหน้า';
      status((validEndpoint?'พร้อมรับความเห็น — ส่งแล้วจะได้รับเลขรับ':'ยังไม่เปิดส่งความเห็น '+revision+' — รออัปเดตระบบรับข้อมูล')+(revisionWarning?' · '+revisionWarning:''));
    }).catch(()=>{$('connection-notice').hidden=false;$('connection-notice').textContent='ยังตรวจการเชื่อมต่อไม่ได้ จึงยังไม่เปิดส่งความเห็น ข้อความไม่ถูกบันทึก กรุณาคัดลอกเก็บไว้ก่อนปิดหน้า';status('ยังยืนยันระบบรับความเห็นไม่ได้ — ลองโหลดหน้าใหม่ภายหลัง','error');}).finally(()=>clearTimeout(timeout));
  }
  // Read-only diagnostics for automated acceptance checks; no comment text is exposed.
  window.BC_REVIEW={inspect:()=>({location:{...location},area:$('comment-area').value,mode:currentMode(),ac:$('flex-ac').checked,modelRevision:revision,...referenceFields(),configured:validEndpoint,sending})};
})();
