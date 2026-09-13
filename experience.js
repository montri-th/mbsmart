/* Presentation and review contexts only. Model geometry remains v09-r3. */
(()=>{'use strict';
 const $=id=>document.getElementById(id),query=new URLSearchParams(location.search);
 const sections={
  showroom:{title:'Showroom interior',description:'สัมผัสแรกที่สงบและพรีเมียม เชื่อม Mercedes-Benz กับ smart ภายในพื้นที่เดิม',views:['interior','smart','handover','overview','plan'],areas:['general','smart','handover','lounge','counter','mb-display','entrance','stair','other']},
  exterior:{title:'Exterior',description:'อ่านอาคารเดิมให้ชัด ต้อนรับ smart อย่างพอดี พร้อมลานหน้าอาคารที่เชื่อมถึงกัน',views:['site','frontage','siteplan'],areas:['general','exterior','parking','identity','entrance','other']},
  workshop:{title:'อู่ซ่อม',description:'มองเห็นภาพรวมการทำงาน และพื้นที่เฉพาะของ smart ที่เชื่อมกับศูนย์บริการเดิม',views:['workshop','workshop-detail','service'],areas:['general','workshop','hv','me','parts','service','other']}
 };
 const images=[
  {id:'showroom-arrival',section:'showroom',view:'interior',title:'ความประทับใจแรกจากทางเข้า',caption:'แสงนุ่มบนพื้นโทนเทาและแนวเสาเดิม นำสายตาผ่านพื้นที่ Mercedes-Benz ไปยัง smart โดยคงตำแหน่งรถและผังหลักจากโมเดล',note:'วัสดุและแสงเป็นการตีความ · ทางเดินและการนำรถเข้า–ออกยังต้องตรวจ'},
  {id:'showroom-smart',section:'showroom',view:'smart',title:'smart ในพื้นที่ที่เป็นตัวเอง',caption:'smart #5 โทนเบจ–หลังคาดำบนชุด Module 3B ขอบสีเงิน พื้นที่ปรึกษาข้างรถให้บรรยากาศใกล้ชิดและผ่อนคลาย',note:'ฐานและชุดเฟอร์นิเจอร์เป็น test fit · รอ supplier CAD และอนุมัติรายละเอียด'},
  {id:'exterior-aerial',section:'exterior',view:'site',title:'อาคารเดิม กับบทใหม่ที่เชื่อมถึงกัน',caption:'มุมสูงเผยความสัมพันธ์ของโชว์รูม อาคารชั้นบน ลานหน้าอาคาร และโรงซ่อมด้านหลัง โดยคงเอกลักษณ์ Mercedes-Benz และตำแหน่งศาลเจ้า',note:'มวลอาคาร ระดับและระยะถอยบางส่วนประมาณจากภาพ · ไม่ใช่ข้อมูลรังวัด'},
  {id:'exterior-street',section:'exterior',view:'frontage',title:'มองจากถนน เห็นการต้อนรับ',caption:'จังหวะอาคารกระจกและผิวอาคารเดิมรับแสงอ่อน พร้อมป้ายและลานที่ช่วยอ่านทางเข้าชัดขึ้น ข้อเสนอ smart อยู่ร่วมกับอัตลักษณ์ MB เดิม',note:'ป้าย ธง และการจัดที่จอด smart เป็นข้อเสนอรอตรวจและอนุมัติ'},
  {id:'workshop-overview',section:'workshop',view:'workshop',title:'เห็นระบบงาน ก่อนลงรายละเอียด',caption:'มุมตัดภาพรวมโรงซ่อมแสดงแถวช่องงาน พื้นที่สัญจรกลาง และความสัมพันธ์ของ MB กับ smart เพื่อช่วยคุยเรื่องการทำงานร่วมกัน',note:'จำนวนช่องและอุปกรณ์เป็นผังทดลอง ไม่ใช่สภาพติดตั้งจริงหรือแบบวิศวกรรม'},
  {id:'workshop-smart-bays',section:'workshop',view:'workshop-detail',title:'พื้นที่เฉพาะ สำหรับงาน smart',caption:'มองเข้าสู่ช่อง HV และ M/E ที่วางคู่กัน โทนเทาสะอาดกับจุดเน้นสีเขียวอ่อนช่วยแยกพื้นที่และอ่านตำแหน่งอุปกรณ์',note:'อุปกรณ์ HV ลิฟต์ ระบบไฟ และระยะปลอดภัยต้องตรวจโดยผู้รับผิดชอบก่อนใช้งาน'}
 ];
 const areaNames={exterior:'อาคารภายนอก / ลาน',parking:'ที่จอดรถ / ทางสัญจร',identity:'ป้าย / ธง / อัตลักษณ์',workshop:'ผังอู่ซ่อม',hv:'ช่อง smart HV',me:'ช่อง smart M/E',parts:'เครื่องมือ / อะไหล่'};
 for(const [value,label] of Object.entries(areaNames))$('comment-area').add(new Option(label,value));
 let current={section:'showroom',view:'interior',referenceKind:'artist-impression',referenceId:'showroom-arrival',experienceRevision:'v10'},changing=false;
 const remembered={};
 const sectionFor=view=>Object.keys(sections).find(k=>sections[k].views.includes(view));
 const labelFor=view=>document.querySelector(`[data-view="${view}"]`)?.textContent||view;
 function scope(){
  document.querySelectorAll('[data-view]').forEach(el=>{el.hidden=!sections[current.section].views.includes(el.dataset.view);});
  document.querySelectorAll('#comment-area option').forEach(o=>{o.hidden=!sections[current.section].areas.includes(o.value);o.disabled=o.hidden;});
  if(!sections[current.section].areas.includes($('comment-area').value))$('comment-area').value='general';
  document.querySelector('.mode-label').hidden=current.section!=='showroom'||current.referenceKind!=='model';
  const pinAllowed=current.section==='showroom'&&current.referenceKind==='model';
  document.querySelector('.location-details').hidden=!pinAllowed;
  document.querySelector('.location-readout').hidden=!pinAllowed;
  document.querySelectorAll('.model-hint,.statusline').forEach(el=>el.hidden=current.section!=='showroom');
  document.querySelector('.exterior-switch').hidden=current.section==='showroom';
  for(const id of ['flex-ac','ceiling'])$(id).closest('label').hidden=id==='flex-ac'&&current.section!=='showroom';
  document.querySelectorAll('.requirement-group[data-scope]').forEach(el=>{el.hidden=!el.dataset.scope.split(' ').includes(current.section);});
  document.querySelectorAll('.notes').forEach(el=>{el.hidden=el.id==='site-basis'?current.section==='showroom':current.section!=='showroom';});
  document.querySelectorAll('.review-questions p').forEach((el,i)=>{el.hidden=i===2?current.section!=='exterior':current.section!=='showroom';});
 }
 function renderGallery(){
  const host=$('impression-gallery');host.replaceChildren();
  for(const item of images.filter(i=>i.section===current.section)){
   const fig=document.createElement('figure');fig.id=item.id;fig.className='impression';
   const image=document.createElement('img');image.src=`./assets/impressions/${item.id}-v10.jpg`;image.alt=`Artist impression — ${item.title}`;image.width=1672;image.height=941;image.loading=item===images.find(i=>i.section===current.section)?'eager':'lazy';image.decoding='async';fig.append(image);
   const cap=document.createElement('figcaption'),h=document.createElement('h3');h.textContent=item.title;cap.append(h);
   for(const [className,text] of [['impression-description',item.caption],['impression-note',item.note]]){const p=document.createElement('p');p.className=className;p.textContent=text;cap.append(p);}
   const actions=document.createElement('div');actions.className='impression-actions';
   for(const [text,kind] of [['แสดงความคิดเห็นต่อภาพนี้','artist-impression'],['ดูมุมนี้ใน 3D','model']]){const button=document.createElement('button');button.type='button';button.textContent=text;button.dataset.image=item.id;button.dataset.referenceKind=kind;button.addEventListener('click',()=>{activate({section:item.section,view:item.view,referenceKind:kind,referenceId:kind==='model'?item.view:item.id});if(kind==='model')$('model-stage').scrollIntoView({block:'center',behavior:'instant'});else{$('comment-text').focus();document.querySelector('.review-panel').scrollIntoView({block:'nearest',behavior:'instant'});}});actions.append(button);}
   cap.append(actions);fig.append(cap);host.append(fig);
  }
 }
 function references(){const select=$('comment-reference');select.replaceChildren();
  for(const item of images.filter(i=>i.section===current.section))select.add(new Option('ภาพ · '+item.title,'artist-impression:'+item.id));
  for(const view of sections[current.section].views)select.add(new Option('3D · '+labelFor(view),'model:'+view));
  select.value=current.referenceKind+':'+current.referenceId;
 }
 function update(){
  $('site-focus-title').textContent=sections[current.section].title;$('section-description').textContent=sections[current.section].description;$('review-title').textContent='ความเห็น · '+sections[current.section].title;
  document.querySelectorAll('[data-section]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.section===current.section)));
  document.querySelectorAll('[data-medium]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.medium===current.referenceKind)));
  $('impression-gallery').hidden=current.referenceKind==='model';$('model-content').hidden=current.referenceKind!=='model';
  references();scope();
  document.querySelectorAll('[data-image][data-reference-kind="artist-impression"]').forEach(el=>{const selected=current.referenceKind==='artist-impression'&&el.dataset.image===current.referenceId;el.setAttribute('aria-pressed',String(selected));el.textContent=selected?'กำลังให้ความเห็นภาพนี้':'แสดงความคิดเห็นต่อภาพนี้';});
 }
 function activate(next,{url=true}={}){
  if(!Object.hasOwn(sections,next.section)||!sections[next.section].views.includes(next.view))return false;
  const ref=images.find(i=>i.id===next.referenceId&&i.section===next.section&&i.view===next.view);
  if(!['model','artist-impression'].includes(next.referenceKind)||(next.referenceKind==='model'?next.referenceId!==next.view:!ref))return false;
  document.dispatchEvent(new CustomEvent('bc:contextwillchange',{detail:{...current}}));
  remembered[current.section]={...current};const previousSection=current.section;current={...next,experienceRevision:'v10'};changing=true;
  if(previousSection!==current.section||!$('impression-gallery').children.length)renderGallery();
  update();
  if(current.referenceKind==='artist-impression'){
   $('mode').value='handover';$('mode').dispatchEvent(new Event('change'));$('flex-ac').checked=false;$('flex-ac').dispatchEvent(new Event('change'));$('exterior-scheme').value='proposed';$('exterior-scheme').dispatchEvent(new Event('change'));
  }
  window.BC_VIEWER?.setView(current.view);window.BC_VIEWER?.setCameraLocked(true);changing=false;
  if(url)syncURL();
  document.dispatchEvent(new CustomEvent('bc:contextchange',{detail:{...current}}));return true;
 }
 function syncURL(){const q=new URLSearchParams(location.search);for(const key of ['area','loc','x','y','x2','y2','medium','ref'])q.delete(key);for(const [key,value] of Object.entries({experience:'v10',section:current.section,view:current.view,referenceKind:current.referenceKind,referenceId:current.referenceId,mode:$('mode').value,ac:$('flex-ac').checked?'1':'0',exterior:$('exterior-scheme').value}))q.set(key,value);history.replaceState(null,'',location.pathname+'?'+q.toString()+location.hash);}
 document.querySelectorAll('[data-section]').forEach(button=>button.addEventListener('click',()=>{const s=button.dataset.section,item=images.find(i=>i.section===s);activate(remembered[s]||{section:s,view:item.view,referenceKind:'artist-impression',referenceId:item.id});}));
 document.querySelectorAll('[data-medium]').forEach(button=>button.addEventListener('click',()=>{const kind=button.dataset.medium,item=images.find(i=>i.section===current.section&&i.view===current.view)||images.find(i=>i.section===current.section);activate({...current,view:kind==='model'?current.view:item.view,referenceKind:kind,referenceId:kind==='model'?current.view:item.id});}));
 $('comment-reference').addEventListener('change',()=>{const [kind,id]=$('comment-reference').value.split(':'),item=images.find(i=>i.id===id);activate({...current,referenceKind:kind,referenceId:id,view:kind==='model'?id:item.view});});
 $('camera-lock').addEventListener('change',e=>{if(e.target.checked)window.BC_VIEWER?.setView(current.view);window.BC_VIEWER?.setCameraLocked(e.target.checked);});
 document.addEventListener('bc:viewchange',e=>{if(changing)return;const view=e.detail.view,section=sectionFor(view);if(section)activate({section,view,referenceKind:'model',referenceId:view});});
 window.BC_EXPERIENCE={inspect:()=>({...current,title:sections[current.section].title,referenceTitle:current.referenceKind==='model'?labelFor(current.view):images.find(i=>i.id===current.referenceId).title}),isChanging:()=>changing,activate,scope,syncURL,images,sections};
 const requestedView=query.get('view'),requestedSection=query.get('section'),viewSection=sectionFor(requestedView);
 const section=Object.hasOwn(sections,requestedSection)?requestedSection:(viewSection||'showroom');
 const view=sections[section].views.includes(requestedView)?requestedView:sections[section].views[0];
 const isCapture=query.get('capture')==='1',requestedKind=query.get('referenceKind')||query.get('medium'),requestedId=query.get('referenceId')||query.get('ref');const kind=isCapture||requestedKind==='model'||(requestedView&&!requestedKind)?'model':'artist-impression';
 const item=images.find(i=>i.section===section&&i.id===requestedId&&i.view===view)||images.find(i=>i.section===section&&i.view===view)||images.find(i=>i.section===section);
 activate({section,view:kind==='model'?view:item.view,referenceKind:kind,referenceId:kind==='model'?view:item.id},{url:false});
 if(isCapture&&window.BC_VIEWER)requestAnimationFrame(()=>requestAnimationFrame(()=>{const image=document.createElement('img');image.id='camera-capture-image';image.alt='ภาพนิ่งจากมุมโมเดล '+view;image.src=window.BC_VIEWER.snapshot();Object.assign(image.style,{position:'absolute',inset:'0',width:'100%',height:'100%'});$('model-stage').append(image);}));
})();
