/* Presentation v15. Geometry v09-r9; v11 comment contract preserves prior pins. */
(()=>{'use strict';
 const $=id=>document.getElementById(id),query=new URLSearchParams(location.search);
 const sections={
 showroom:{title:'Showroom interior',description:'สัมผัสแรกที่สงบและพรีเมียม เชื่อม Mercedes-Benz กับ smart ภายในพื้นที่เดิม',views:['interior','smart','handover','overview','plan'],areas:['general','smart','handover','lounge','counter','mb-display','entrance','stair','other']},
 exterior:{title:'Exterior',description:'อ่านอาคารเดิมให้ชัด ต้อนรับ smart อย่างพอดี พร้อมลานหน้าอาคารที่เชื่อมถึงกัน',views:['site','frontage','siteplan'],areas:['general','exterior','parking','identity','entrance','other']},
 workshop:{title:'Workshop',description:'ภาพเปิดหลังคาเพื่ออ่านพื้นที่ทำงานและส่วน smart ที่เชื่อมกับ Workshop เดิม ทางรถด้านข้างเปิดทะลุ ไม่มีประตู ตรวจรูปทรงหลังคาเต็มได้ในมุมภายนอก',views:['workshop','workshop-detail','service','workshop-plan'],areas:['general','workshop','hv','me','parts','service','other']}
 };
 const images=[
 {id:'showroom-arrival',section:'showroom',view:'interior',version:'v11',title:'ความประทับใจแรกจากทางเข้า',caption:'แสงนุ่มบนพื้นโทนเทาและแนวเสาเดิม นำสายตาผ่านรถ Mercedes-Benz ที่อ้างอิงภาพหน้างานไปยัง smart พื้นที่โปร่งเปิดให้เห็นความสัมพันธ์ของสองแบรนด์',note:'รูปทรงรถ แสงและวัสดุเป็นภาพตีความ · ใช้ผังและโมเดลตรวจตำแหน่ง ระยะ และทางสัญจร'},
 {id:'showroom-smart',section:'showroom',view:'smart',version:'v11',title:'smart ในพื้นที่ที่เป็นตัวเอง',caption:'smart #5 โทนเบจ–หลังคาดำบน Module 3B ผนัง backdrop ทรงคางหมูขอบมนตามภาพคู่มือ คู่กับโต๊ะปรึกษาทรงสี่เหลี่ยมและที่นั่งผู้ให้คำปรึกษา 1 / ลูกค้า 2 คน',note:'ความสอบและส่วนโค้งเทียบภาพ ไม่ใช่มิติผลิต · ฐานและเฟอร์นิเจอร์รอ supplier CAD และอนุมัติรายละเอียด'},
 {id:'exterior-aerial',section:'exterior',view:'site',title:'อาคารเดิม กับบทใหม่ที่เชื่อมถึงกัน',caption:'หลังคาใหญ่ Workshop ยื่นถึงเสาชิดรั้วริมถนน แยกจากกันสาดทางผ่านเตี้ยและหลังคาจอดหลัง Workshop ที่ยาวตลอดอาคาร ถนนเสม็ด–อ่างศิลาแสดง 6 เลน ไป 3 กลับ 3 ตามเจ้าของ',note:'บริบทเมืองและแสงเป็นภาพตีความ ไม่ใช่ภาพสำรวจ · ความกว้างเลน เกาะกลาง และขนาดโครงหลังคายังไม่ใช่ระยะวัดจริง · 10 คันตัวอย่าง / 26 ช่องภายนอก (38.5%) รวมส่วนที่ถูกบัง'},
 {id:'exterior-street',section:'exterior',view:'frontage',title:'มุมยกระดับด้านหน้า เห็นการต้อนรับ',caption:'ป้าย Mercedes-Benz ช่วงแรกและ Chitchai Chonburi ช่วงที่สามยกเหนือคานคอนกรีตดำต่อเนื่อง กระจกภายนอกไร้กรอบ ถอด smart pylon และธงเดี่ยวซ้ายออก คงธง smart 3 ต้น ห่างกัน 2.50 ม. ผืนธง MB 3 ต้นปรับเป็น1.20×4.50ม. เท่า smart',note:'smart 3 ต้น / MB 3 ต้น / ธงชาติ 2 ต้น · ป้าย smart care อยู่ด้านในรั้วระหว่าง MB-D02/MB-D03 หันเข้าหา Workshop · ภาพตีความ ไม่รับรองการยึด ระยะมองเห็นหรือ compliance'},
 {id:'workshop-overview',section:'workshop',view:'workshop',title:'เห็นระบบงาน ก่อนลงรายละเอียด',caption:'แนวที่ถอยจากริมถนนเปิดเชื่อมกับ Workshop โดยคงเสาและคานเดิม ป้าย M/E Station อยู่ที่ช่อง smart service พื้นว่าง ไม่มีลิฟต์หรืออุปกรณ์เพิ่ม ลิฟต์เดิมยังคงสองเสา 8 และสี่เสา 2 ชุด',note:'แถว 40–41 ปรับเฉพาะป้ายภาษาอังกฤษ · บันไดเหล็กเดิมอยู่ครึ่งช่องด้านหลัง · แนวต่อกับ CS ระดับพื้น และ diagnosis ยังรอตรวจ'},
 {id:'workshop-smart-bays',section:'workshop',view:'workshop-detail',title:'พื้นที่เฉพาะ สำหรับงาน smart',caption:'ป้าย High Voltage Station ติดผนังที่ช่อง HV เดิม ส่วนรั้วอิฐช่องลมริมถนนใต้หลังคาทาเทาเข้มเฉพาะหน้าที่หันเข้า Workshop ป้าย smart care คงจุดเดิมริมรั้ว ไม่ย้ายเข้าด้านใน',note:'สีเทาเข้มเป็นข้อเสนอ รอ MB ยืนยันสีและระบบสี · ผิวรั้วด้านถนน รั้วตะแกรง และโครงสร้างไม่เปลี่ยนสี · รูปแบบป้ายและอุปกรณ์ยังต้องตรวจรายละเอียดก่อนติดตั้ง'}
 ];
 images.push(
 {id:'showroom-handover',section:'showroom',view:'handover',title:'ช่วงเวลาส่งมอบที่เป็นส่วนตัว',caption:'MB6 คูเป้ Mercedes-AMG สีดำในห้องส่งมอบ กระจกหน้าใช้ป้าย smart Type 4 Illuminated หันออกถนน ไม่มีต้นไม้หน้าห้อง เมื่อส่งมอบให้ขยับ MB5 และปรับบันไดกลเป็น ramp นำ MB6 ผ่านช่องเดิม เลี้ยวซ้ายออก Entrance แล้วคืนบันไดเป็นขั้น',note:'จากในห้องจะเห็นด้านหลังป้าย ไม่ใช่หน้าเรืองแสง · รุ่นย่อยคูเป้ รายละเอียดติดตั้งป้าย ระยะเลี้ยวและความลาดยังรอตรวจ ไม่เพิ่มประตูรถใหม่'},
 {id:'showroom-overview',section:'showroom',view:'overview',title:'หนึ่งผัง สองอัตลักษณ์',caption:'ภาพตัดเปิดหลังคาเชื่อม smart Module 3B รถ Mercedes-Benz เคาน์เตอร์เดิม และห้องรับรอง ใช้กรอบ Autohaus Small พร้อม Sub Stage 2 จอ และลำดับประสบการณ์ Sales Step V',note:'ซ่อนฝ้าและบริบทภายนอกเพื่ออ่านผัง · อุปกรณ์แสดงเป็นข้อเสนอ ไม่ใช่การรับรองมาตรฐาน MB / smart'}
 );
 for(const item of images){item.version='v15';item.width=item.id==='exterior-street'?1671:1672;item.height=941;}
 const plans=[
 {id:'showroom-plan',section:'showroom',view:'plan',title:'Showroom interior · พื้นที่ปรับปรุง Smart SiS',caption:'ชุด smart Module 3B และโลโก้กระจกกลางแผ่น แยกจากพื้นที่ MB เดิม พร้อมจอ Small 2 จอ และลำดับส่งมอบผ่าน Entrance บันไดกลเดิม',note:'บันไดกลแสดงเป็นขั้นพร้อม anti-slip 3 ชิ้นต่อขั้น · ปรับเป็น ramp เฉพาะขนย้ายรถแล้วคืนเป็นขั้น · เส้นประคือขั้นตอนใช้งาน ไม่ใช่ ramp ถาวรหรือวงเลี้ยวรับรอง',width:2200,height:1720,highlights:['Autohaus Small / Sub Stage 2 จอ / Sales Step V','ขยับ MB5 + ปรับบันได → MB6 ผ่าน → เลี้ยวซ้ายลง ramp → คืนเป็นขั้น','ห้องส่งมอบและจุดชาร์จใช้ร่วม รอแบรนด์และระบบไฟตรวจ']},
 {id:'groundfloor-site-plan',section:'exterior',view:'siteplan',title:'ผังชั้นล่างทั้งหมด · อาคารและ Exterior',caption:'รวมโชว์รูม Workshop และลาน 26 ช่อง: ด้านหน้าขนานถนน 5 ติดอาคาร 2 ด้านเสม็ด–อ่างศิลา 4 มุมอาคาร 1 ด้านหลัง 10 และข้าง Workshop 4 ช่อง',note:'MB-S03 ภายในอยู่ข้างสำนักงาน CS แยกจาก 26 ช่องภายนอก · ระยะขอบกระบะต้นไม้ถึงด้านในรั้วหน้า 7.20 ม. ตามเจ้าของ; รัศมี R1.20 ม. เทียบภาพ ไม่ใช่รังวัด',width:2200,height:2520,highlights:['รถตัวอย่าง 10 / 26 ช่อง ≈ 40% เว้นบริเวณทางเข้าและจุดอัตลักษณ์','หลัง Workshop 10 ช่อง 2.5 × 5.0 ม. เว้นผนัง 1.0 ม. ใต้หลังคาตลอดแนว Workshop · เสาทุก 3 ช่อง','B1: S-D-01 Demo · B2: S-S-01 Sales · หลังช่อง 1: S-D-02 Demo','ไม่เพิ่มต้นไม้หรือแถบปลูกตามรั้วและทางเท้า']},
 {id:'workshop-plan',section:'workshop',view:'workshop-plan',title:'Workshop · smart Workshop-in-Workshop',caption:'ลิฟต์เดิมสองเสา 8 + สี่เสา 2 รวม 10 ชุด; smart HV ใช้ลิฟต์เดิม และ smart service เป็นพื้นว่างตีเส้น แยกสำนักงาน Customer Service ทางเดิน กับช่องจอด MB-S03',note:'บันไดเหล็กเดิมกินพื้นที่ประมาณครึ่งช่องด้านหลัง · จุดชาร์จ 4 ตำแหน่งรวมโชว์รูม ยังไม่กำหนดอุปกรณ์ · ไม่ใช่แบบวิศวกรรมหรือแบบอนุมัติ',width:2200,height:1970,highlights:['MB-4P-01 ตั้งศูนย์ / MB-4P-02 Active Reception','smart service ไม่มีลิฟต์หรืออุปกรณ์เพิ่ม · HV ไม่เพิ่มลิฟต์ซ้ำ','หลังช่อง 1 = S-D-02; ช่อง 2–10 = MB-C08–MB-C16 เรียงขวาไปซ้าย']}
 ];
 const staticItems=kind=>kind==='plan'?plans:images;
 const findReference=(kind,id)=>staticItems(kind).find(i=>i.id===id);
 const areaNames={exterior:'อาคารภายนอก / ลาน',parking:'ที่จอดรถ / ทางสัญจร',identity:'ป้าย / ธง / อัตลักษณ์',workshop:'ผัง Workshop',hv:'ช่อง smart HV',me:'smart service / M/E requirement',parts:'เครื่องมือ / อะไหล่'};
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
 const image=document.createElement('img');image.src=kind==='plan'?`./assets/plans/${item.id}-v15.svg`:`./assets/impressions/${item.id}-${item.version}.jpg`;image.alt=`${kind==='plan'?'ผัง Smart SiS':'Artist impression'} — ${item.title}`;image.width=item.width||1672;image.height=item.height||941;image.loading=item===items[0]?'eager':'lazy';image.decoding='async';fig.append(image);
 const cap=document.createElement('figcaption'),h=document.createElement('h3');h.textContent=item.title;cap.append(h);
 for(const [className,text] of [['impression-description',item.caption],['impression-note',item.note]]){const p=document.createElement('p');p.className=className;p.textContent=text;cap.append(p);}
 const actions=document.createElement('div');actions.className='impression-actions';
 if(item.highlights){const list=document.createElement('ul');list.className='plan-highlights';for(const text of item.highlights){const li=document.createElement('li');li.textContent=text;list.append(li);}cap.append(list);}
 for(const [text,referenceKind] of [['แสดงความคิดเห็นต่อภาพนี้',kind],['ดูมุมนี้ใน 3D','model']]){const button=document.createElement('button');button.type='button';button.textContent=text;button.dataset.image=item.id;button.dataset.referenceKind=referenceKind;button.addEventListener('click',()=>{activate({section:item.section,view:item.view,referenceKind,referenceId:referenceKind==='model'?item.view:item.id});if(referenceKind==='model')$('model-stage').scrollIntoView({block:'center',behavior:'instant'});else{$('comment-text').focus();document.querySelector('.review-panel').scrollIntoView({block:'nearest',behavior:'instant'});}});actions.append(button);}
 const downloads=kind==='plan'?[[`./assets/downloads/${item.id}-v15.png`,'ดาวน์โหลด Hi-res · PNG 4,400 px'],[`./assets/plans/${item.id}-v15.svg`,'ดาวน์โหลดเวกเตอร์ · SVG']]:[[`./assets/downloads/${item.id}-v15-hires.png`,`ดาวน์โหลด Hi-res · PNG ต้นฉบับ ${item.width.toLocaleString('en-US')} × ${item.height} px`]];
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
