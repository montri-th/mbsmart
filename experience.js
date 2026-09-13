/* Presentation v11. Geometry v09-r4 includes owner review adoption. */
(()=>{'use strict';
 const $=id=>document.getElementById(id),query=new URLSearchParams(location.search);
 const sections={
  showroom:{title:'Showroom interior',description:'สัมผัสแรกที่สงบและพรีเมียม เชื่อม Mercedes-Benz กับ smart ภายในพื้นที่เดิม',views:['interior','smart','handover','overview','plan'],areas:['general','smart','handover','lounge','counter','mb-display','entrance','stair','other']},
  exterior:{title:'Exterior',description:'อ่านอาคารเดิมให้ชัด ต้อนรับ smart อย่างพอดี พร้อมลานหน้าอาคารที่เชื่อมถึงกัน',views:['site','frontage','siteplan'],areas:['general','exterior','parking','identity','entrance','other']},
  workshop:{title:'อู่ซ่อม',description:'มองเห็นภาพรวมการทำงาน และพื้นที่เฉพาะของ smart ที่เชื่อมกับศูนย์บริการเดิม',views:['workshop','workshop-detail','service','workshop-plan'],areas:['general','workshop','hv','me','parts','service','other']}
 };
 const images=[
  {id:'showroom-arrival',section:'showroom',view:'interior',version:'v11',title:'ความประทับใจแรกจากทางเข้า',caption:'แสงนุ่มบนพื้นโทนเทาและแนวเสาเดิม นำสายตาผ่านรถ Mercedes-Benz ที่อ้างอิงภาพหน้างานไปยัง smart พื้นที่โปร่งเปิดให้เห็นความสัมพันธ์ของสองแบรนด์',note:'รูปทรงรถ แสงและวัสดุเป็นภาพตีความ · ใช้ผังและโมเดลตรวจตำแหน่ง ระยะ และทางสัญจร'},
  {id:'showroom-smart',section:'showroom',view:'smart',version:'v11',title:'smart ในพื้นที่ที่เป็นตัวเอง',caption:'smart #5 โทนเบจ–หลังคาดำบนชุด Module 3B ขอบสีเงิน พื้นที่ปรึกษาข้างรถให้บรรยากาศใกล้ชิดและผ่อนคลาย',note:'ฐานและชุดเฟอร์นิเจอร์เป็น test fit · รอ supplier CAD และอนุมัติรายละเอียด'},
  {id:'exterior-aerial',section:'exterior',view:'site',version:'v11',title:'อาคารเดิม กับบทใหม่ที่เชื่อมถึงกัน',caption:'มุมสูงเชื่อมโชว์รูม ลานและอู่ซ่อม ช่องจอดเทียบภาพกลางคืน แยกแนวขนานสุขุมวิท ช่องตั้งฉากใกล้เสาโลโก้ แนวข้างอาคาร และเส้นบางส่วนติดตัวอาคาร',note:'ภาพตีความมุมมองและรายละเอียดเส้น ให้ยึดผังและโมเดล · smart เสนอใช้ช่องเดิมด้านข้าง 2 ช่อง ส่วนทดลองขับช่องที่สองรอจัดตำแหน่ง'},
  {id:'exterior-street',section:'exterior',view:'frontage',version:'v11',title:'มุมยกระดับด้านหน้า เห็นการต้อนรับ',caption:'ป้าย Mercedes-Benz ช่วงกระจกแรก และ Chitchai Chonburi ช่วงที่สาม อยู่บนแนวคานดำต่อเนื่องตามภาพใกล้จากเจ้าของ รถ E-Class สีขาวและ C-Class สีเข้มจอดขนานริมถนน เว้นมุมศาลและทางเข้า',note:'รถ 2 คันในช่องที่ระบุได้ครบ 5 ช่อง = 40% เฉพาะชุดอ้างอิงนี้ ไม่ใช่ทั้งไซต์ · ภาพตีความ ให้ยึดผังและโมเดลสำหรับตำแหน่งและระยะ'},
  {id:'workshop-overview',section:'workshop',view:'workshop',title:'เห็นระบบงาน ก่อนลงรายละเอียด',caption:'มุมตัดภาพรวมโรงซ่อมแสดงแถวช่องงาน พื้นที่สัญจรกลาง และความสัมพันธ์ของ MB กับ smart เพื่อช่วยคุยเรื่องการทำงานร่วมกัน',note:'จำนวนช่องและอุปกรณ์เป็นผังทดลอง ไม่ใช่สภาพติดตั้งจริงหรือแบบวิศวกรรม'},
  {id:'workshop-smart-bays',section:'workshop',view:'workshop-detail',title:'พื้นที่เฉพาะ สำหรับงาน smart',caption:'มองเข้าสู่ช่อง HV และ M/E ที่วางคู่กัน โทนเทาสะอาดกับจุดเน้นสีเขียวอ่อนช่วยแยกพื้นที่และอ่านตำแหน่งอุปกรณ์',note:'อุปกรณ์ HV ลิฟต์ ระบบไฟ และระยะปลอดภัยต้องตรวจโดยผู้รับผิดชอบก่อนใช้งาน'}
 ];
 images.push(
  {id:'showroom-handover',section:'showroom',view:'handover',version:'v11',title:'ช่วงเวลาส่งมอบที่เป็นส่วนตัว',caption:'คูเป้ Mercedes-AMG สีดำอ้างอิงรถที่ถ่ายหน้างาน อยู่ในห้องส่งมอบเชื่อมห้องรับรองผ่านกระจกใส พร้อมป้ายราคาริมหน้ารถฝั่งคนขับขวา',note:'ตระกูลและรุ่นย่อยของคูเป้ยังไม่ยืนยัน · ห้องส่งมอบและจุดชาร์จเดิมเป็นส่วนใช้ร่วมรอตรวจ'},
  {id:'showroom-overview',section:'showroom',view:'overview',version:'v11',title:'หนึ่งผัง สองอัตลักษณ์',caption:'ภาพตัดเปิดหลังคาเผยความสัมพันธ์ของ smart Module 3B รถ Mercedes-Benz เคาน์เตอร์เดิม และห้องรับรอง ช่วยอ่านภาพรวมการใช้งานก่อนลงรายละเอียด',note:'ซ่อนฝ้าและบริบทภายนอกเพื่ออธิบายผัง · จำนวนรถและทางสัญจรเป็น test fit ไม่ใช่แบบอนุมัติ'}
 );
 const plans=[
  {id:'showroom-plan',section:'showroom',view:'plan',title:'Showroom interior · พื้นที่ปรับปรุง Smart SiS',caption:'แยกชุด smart Module 3B และองค์ประกอบใหม่ออกจากผัง Mercedes-Benz เดิม พร้อมชี้จุดใช้ร่วมที่ต้องยืนยันก่อนดำเนินการ',note:'สีเขียว = เสนอเพิ่มสำหรับ smart · สีเทา = ส่วนเดิม / คงไว้ · เส้นประสีอำพัน = ใช้ร่วม / รอการตรวจ',width:2200,height:1450,highlights:['ชุด Module 3B และจุดปรึกษาข้างรถ','โลโก้กระจกและอุปกรณ์นำเสนอ smart','ห้องส่งมอบและ MB wallbox ใช้ร่วม รออนุมัติ']},
  {id:'groundfloor-site-plan',section:'exterior',view:'siteplan',title:'ผังชั้นล่างทั้งหมด · อาคารและ Exterior',caption:'อ่านโชว์รูม อู่ซ่อม และภายนอกร่วมกัน แนวสีขาวเทียบภาพกลางคืนเป็นหลายรูปแบบ ไม่ใช่แถวช่องจอดซ้ำกันทั้งลาน',note:'ภาพไม่ครอบคลุมจำนวนที่จอดทั้งหมด · ระยะสีตีเส้น ขอบเขต ระดับและทางเลี้ยวต้องสำรวจ',width:2200,height:1900,highlights:['smart ใช้ช่องด้านข้างเดิม 2 ช่องเป็นข้อเสนอ ไม่ตีเส้นซ้ำ','ทดลองขับช่องที่สองยังไม่มีตำแหน่งยืนยัน ไม่กีดทางเข้าอู่','คงป้าย MB ธง ศาลและเส้นช่องติดอาคารที่ภาพเห็นบางส่วน']},
  {id:'workshop-plan',section:'workshop',view:'workshop-plan',title:'อู่ซ่อม · smart Workshop-in-Workshop',caption:'เน้นช่อง HV และ M/E สำหรับ smart พร้อมพื้นที่เครื่องมือ อะไหล่ และงานรับรถที่เชื่อมกับศูนย์บริการ Mercedes-Benz เดิม',note:'ตำแหน่งและอุปกรณ์เป็นข้อเสนอ · ยังต้องตรวจงานระบบ ลิฟต์ ระยะปลอดภัย และข้อกำหนด MB / smart',width:2200,height:1530,highlights:['ช่อง smart HV และ M/E อย่างละ 1 ช่อง','เครื่องมือเฉพาะและการแยกชั้นอะไหล่ MB / smart','ช่องงาน MB และทางสัญจรเป็นผังทดลอง รอตรวจ']}
 ];
 const staticItems=kind=>kind==='plan'?plans:images;
 const findReference=(kind,id)=>staticItems(kind).find(i=>i.id===id);
 const areaNames={exterior:'อาคารภายนอก / ลาน',parking:'ที่จอดรถ / ทางสัญจร',identity:'ป้าย / ธง / อัตลักษณ์',workshop:'ผังอู่ซ่อม',hv:'ช่อง smart HV',me:'ช่อง smart M/E',parts:'เครื่องมือ / อะไหล่'};
 for(const [value,label] of Object.entries(areaNames))$('comment-area').add(new Option(label,value));
 let current={section:'showroom',view:'interior',referenceKind:'artist-impression',referenceId:'showroom-arrival',experienceRevision:'v11'},changing=false;
 const remembered={};
 const sectionFor=view=>Object.keys(sections).find(k=>sections[k].views.includes(view));
 const labelFor=view=>document.querySelector(`[data-view="${view}"]`)?.textContent||view;
 function scope(){
  document.querySelectorAll('[data-view]').forEach(el=>{el.hidden=!sections[current.section].views.includes(el.dataset.view);});
  document.querySelectorAll('#comment-area option').forEach(o=>{o.hidden=!sections[current.section].areas.includes(o.value);o.disabled=o.hidden;});
  if(!sections[current.section].areas.includes($('comment-area').value))$('comment-area').value='general';
  document.querySelector('.mode-label').hidden=current.section!=='showroom'||current.referenceKind!=='model';
  document.querySelector('.location-details').hidden=false;
  document.querySelector('.location-readout').hidden=false;
  document.querySelectorAll('.model-hint,.statusline').forEach(el=>el.hidden=current.section!=='showroom');
  document.querySelector('.exterior-switch').hidden=current.section==='showroom';
  for(const id of ['flex-ac','ceiling'])$(id).closest('label').hidden=id==='flex-ac'&&current.section!=='showroom';
  document.querySelectorAll('.requirement-group[data-scope]').forEach(el=>{el.hidden=!el.dataset.scope.split(' ').includes(current.section);});
  document.querySelectorAll('.notes').forEach(el=>{el.hidden=el.id==='site-basis'?current.section==='showroom':current.section!=='showroom';});
  document.querySelectorAll('.review-questions p').forEach((el,i)=>{el.hidden=i===2?current.section!=='exterior':current.section!=='showroom';});
 }
 function renderGallery(){
  const host=$('impression-gallery');host.replaceChildren();
  const kind=current.referenceKind==='plan'?'plan':'artist-impression',items=staticItems(kind).filter(i=>i.section===current.section);
  for(const item of items){
   const fig=document.createElement('figure');fig.id=item.id;fig.className='impression'+(kind==='plan'?' plan-board':'');
   const image=document.createElement('img');image.src=kind==='plan'?`./assets/plans/${item.id}-v11.svg`:`./assets/impressions/${item.id}-${item.version||'v10'}.jpg`;image.alt=`${kind==='plan'?'ผัง Smart SiS':'Artist impression'} — ${item.title}`;image.width=item.width||1672;image.height=item.height||941;image.loading=item===items[0]?'eager':'lazy';image.decoding='async';fig.append(image);
   const cap=document.createElement('figcaption'),h=document.createElement('h3');h.textContent=item.title;cap.append(h);
   for(const [className,text] of [['impression-description',item.caption],['impression-note',item.note]]){const p=document.createElement('p');p.className=className;p.textContent=text;cap.append(p);}
   const actions=document.createElement('div');actions.className='impression-actions';
   if(item.highlights){const list=document.createElement('ul');list.className='plan-highlights';for(const text of item.highlights){const li=document.createElement('li');li.textContent=text;list.append(li);}cap.append(list);}
   for(const [text,referenceKind] of [['แสดงความคิดเห็นต่อภาพนี้',kind],['ดูมุมนี้ใน 3D','model']]){const button=document.createElement('button');button.type='button';button.textContent=text;button.dataset.image=item.id;button.dataset.referenceKind=referenceKind;button.addEventListener('click',()=>{activate({section:item.section,view:item.view,referenceKind,referenceId:referenceKind==='model'?item.view:item.id});if(referenceKind==='model')$('model-stage').scrollIntoView({block:'center',behavior:'instant'});else{$('comment-text').focus();document.querySelector('.review-panel').scrollIntoView({block:'nearest',behavior:'instant'});}});actions.append(button);}
   const downloads=kind==='plan'?[[`./assets/downloads/${item.id}-v11.png`,'ดาวน์โหลด Hi-res · PNG 4,400 px'],[`./assets/plans/${item.id}-v11.svg`,'ดาวน์โหลดเวกเตอร์ · SVG']]:[[`./assets/downloads/${item.id}-hires.png`,'ดาวน์โหลด Hi-res · PNG ต้นฉบับ']];
   for(const [href,text] of downloads){const a=document.createElement('a');a.href=href;a.download=href.split('/').pop();a.className='download-link';a.textContent=text;actions.append(a);}
   cap.append(actions);fig.append(cap);host.append(fig);
  }
 }
 function references(){const select=$('comment-reference');select.replaceChildren();
  for(const item of images.filter(i=>i.section===current.section))select.add(new Option('ภาพ · '+item.title,'artist-impression:'+item.id));
  for(const item of plans.filter(i=>i.section===current.section))select.add(new Option('ผัง · '+item.title,'plan:'+item.id));
  for(const view of sections[current.section].views)select.add(new Option('3D · '+labelFor(view),'model:'+view));
  select.value=current.referenceKind+':'+current.referenceId;
 }
 function update(){
  $('site-focus-title').textContent=sections[current.section].title;$('section-description').textContent=sections[current.section].description;$('review-title').textContent='ความเห็น · '+sections[current.section].title;
  document.querySelectorAll('[data-section]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.section===current.section)));
  document.querySelectorAll('[data-medium]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.medium===current.referenceKind)));
  $('impression-gallery').hidden=current.referenceKind==='model';$('model-content').hidden=current.referenceKind!=='model';
  references();scope();
  document.querySelector('.concept-note').textContent=current.referenceKind==='plan'?'ผัง Smart SiS · เน้นส่วนที่เสนอปรับปรุงบนพิกัดโมเดล สีและหมายเลขใช้เพื่อการทบทวน ไม่ใช่แบบอนุมัติ':'Artist impression · ภาพแนวคิดจากมุมโมเดล แสงและวัสดุเป็นการตีความด้วย AI ไม่ใช่ภาพหน้างานหรือแบบอนุมัติ';
  document.querySelectorAll('[data-image]').forEach(el=>{if(el.dataset.referenceKind==='model')return;const selected=current.referenceKind===el.dataset.referenceKind&&el.dataset.image===current.referenceId;el.setAttribute('aria-pressed',String(selected));el.textContent=selected?'กำลังให้ความเห็นภาพนี้':'แสดงความคิดเห็นต่อภาพนี้';});
 }
 function activate(next,{url=true}={}){
  if(!Object.hasOwn(sections,next.section)||!sections[next.section].views.includes(next.view))return false;
  const ref=staticItems(next.referenceKind).find(i=>i.id===next.referenceId&&i.section===next.section&&i.view===next.view);
  if(!['model','artist-impression','plan'].includes(next.referenceKind)||(next.referenceKind==='model'?next.referenceId!==next.view:!ref))return false;
  document.dispatchEvent(new CustomEvent('bc:contextwillchange',{detail:{...current}}));
  remembered[current.section]={...current};const previousSection=current.section,previousKind=current.referenceKind;current={...next,experienceRevision:'v11'};changing=true;
  if(previousSection!==current.section||previousKind!==current.referenceKind||!$('impression-gallery').children.length)renderGallery();
  update();
  if(current.referenceKind!=='model'){
   $('mode').value='handover';$('mode').dispatchEvent(new Event('change'));$('flex-ac').checked=false;$('flex-ac').dispatchEvent(new Event('change'));$('exterior-scheme').value='proposed';$('exterior-scheme').dispatchEvent(new Event('change'));
  }
  window.BC_VIEWER?.setView(current.view);window.BC_VIEWER?.setCameraLocked(true);changing=false;
  document.dispatchEvent(new CustomEvent('bc:contextchange',{detail:{...current}}));
  if(url)syncURL();return true;
 }
 function syncURL(){const q=new URLSearchParams(location.search),review=window.BC_REVIEW?.inspect();for(const key of ['area','loc','x','y','x2','y2','medium','ref'])q.delete(key);for(const [key,value] of Object.entries({experience:'v11',section:current.section,view:current.view,referenceKind:current.referenceKind,referenceId:current.referenceId,mode:$('mode').value,ac:$('flex-ac').checked?'1':'0',exterior:$('exterior-scheme').value}))q.set(key,value);if(review){q.set('area',review.area);if(review.location.type!=='area'){q.set('loc',review.location.type);for(const key of ['x','y','x2','y2'])if(Number.isFinite(review.location[key]))q.set(key,review.location[key]);}}history.replaceState(null,'',location.pathname+'?'+q.toString()+location.hash);}
 document.querySelectorAll('[data-section]').forEach(button=>button.addEventListener('click',()=>{const s=button.dataset.section,item=images.find(i=>i.section===s);activate(remembered[s]||{section:s,view:item.view,referenceKind:'artist-impression',referenceId:item.id});}));
 document.querySelectorAll('[data-medium]').forEach(button=>button.addEventListener('click',()=>{const kind=button.dataset.medium,item=staticItems(kind).find(i=>i.section===current.section&&i.view===current.view)||staticItems(kind).find(i=>i.section===current.section);activate({...current,view:kind==='model'?current.view:item.view,referenceKind:kind,referenceId:kind==='model'?current.view:item.id});}));
 $('comment-reference').addEventListener('change',()=>{const [kind,id]=$('comment-reference').value.split(':'),item=findReference(kind,id);if(kind!=='model'&&!item)return;activate({...current,referenceKind:kind,referenceId:id,view:kind==='model'?id:item.view});});
 $('camera-lock').addEventListener('change',e=>{if(e.target.checked)window.BC_VIEWER?.setView(current.view);window.BC_VIEWER?.setCameraLocked(e.target.checked);});
 document.addEventListener('bc:viewchange',e=>{if(changing)return;const view=e.detail.view,section=sectionFor(view);if(section)activate({section,view,referenceKind:'model',referenceId:view});});
 window.BC_EXPERIENCE={inspect:()=>({...current,title:sections[current.section].title,referenceTitle:current.referenceKind==='model'?labelFor(current.view):findReference(current.referenceKind,current.referenceId).title}),isChanging:()=>changing,activate,scope,syncURL,images,plans,sections};
 const requestedView=query.get('view'),requestedSection=query.get('section'),viewSection=sectionFor(requestedView);
 const section=Object.hasOwn(sections,requestedSection)?requestedSection:(viewSection||'showroom');
 const view=sections[section].views.includes(requestedView)?requestedView:sections[section].views[0];
 const isCapture=query.get('capture')==='1',requestedKind=query.get('referenceKind')||query.get('medium'),requestedId=query.get('referenceId')||query.get('ref');const kind=isCapture||requestedKind==='model'||(requestedView&&!requestedKind)?'model':requestedKind==='plan'?'plan':'artist-impression';
 const item=staticItems(kind).find(i=>i.section===section&&i.id===requestedId&&i.view===view)||staticItems(kind).find(i=>i.section===section&&i.view===view)||staticItems(kind).find(i=>i.section===section);
 activate({section,view:kind==='model'?view:item.view,referenceKind:kind,referenceId:kind==='model'?view:item.id},{url:false});
 if(isCapture&&window.BC_VIEWER)requestAnimationFrame(()=>requestAnimationFrame(()=>{const image=document.createElement('img');image.id='camera-capture-image';image.alt='ภาพนิ่งจากมุมโมเดล '+view;image.src=window.BC_VIEWER.snapshot();Object.assign(image.style,{position:'absolute',inset:'0',width:'100%',height:'100%'});$('model-stage').append(image);}));
})();
