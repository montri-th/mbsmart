/* Progressive enhancement: source JSON remains accessible without this script. */
(()=>{'use strict';const host=document.getElementById('requirement-groups');
const areas={display:'พื้นที่แสดง smart',aftersales:'พื้นที่ใช้ร่วม / Aftersales',exterior:'ภายนอกและที่จอดรถ',workshop:'Workshop',operations:'ระบบงานและบุคลากร'};
const statuses={required:'ต้องมี',required_flexible:'ต้องมี · ยืดหยุ่นได้',shared_mb:'ใช้ร่วม MB',optional:'Optional',separate_mb:'แยกจาก MB'};
fetch('./assets/smart-review-matrix.json').then(r=>{if(!r.ok)throw Error('matrix');return r.json();}).then(data=>{
 for(const [key,label] of Object.entries(areas)){
  const details=document.createElement('details');details.className='requirement-group';details.dataset.scope=key==='display'?'showroom':key==='exterior'?'exterior':key==='workshop'?'workshop':key==='aftersales'?'showroom workshop':'showroom exterior workshop';const summary=document.createElement('summary');summary.textContent=label+' · '+data.rows.filter(r=>r.area===key).length+' รายการ';details.append(summary);
  for(const row of data.rows.filter(r=>r.area===key)){
   const article=document.createElement('article');article.className='requirement';const h=document.createElement('h3');h.textContent=row.id+' · '+row.title;article.append(h);
   const meta=document.createElement('p');meta.className='requirement-meta';meta.textContent=(statuses[row.standard]||row.standard)+' · PDF p'+row.sourcePages.join(', ')+(row.status==='waiver_pending'?' · WAIVER PENDING — รออนุมัติข้อยกเว้น':'');article.append(meta);
   for(const text of [row.requirement,row.v07Intent,row.review])if(text){const p=document.createElement('p');p.textContent=text;article.append(p);}
   const b=document.createElement('button');b.type='button';b.textContent='ให้ความเห็นข้อ '+row.id;b.addEventListener('click',()=>{const app=window.BC_EXPERIENCE,section=key==='display'?'showroom':key==='exterior'?'exterior':key==='workshop'?'workshop':app?.inspect().section||'showroom',view=section==='showroom'?'smart':section==='exterior'?'site':'workshop';if(app)app.activate({section,view,referenceKind:'model',referenceId:view});const field=document.getElementById('comment-text'),prefix='[smart requirement '+row.id+' — '+row.title+']\n',next=(field.value?field.value+'\n\n':'')+prefix;if(!field.value.includes(prefix)){if(next.length>field.maxLength){field.setCustomValidity('ข้อความเต็มแล้ว กรุณาคัดลอกเก็บหรือย่อข้อความก่อนเพิ่มหัวข้อ');field.reportValidity();return;}field.value=next;}field.dispatchEvent(new Event('input',{bubbles:true}));document.getElementById('comment-area').value=key==='display'?'smart':'general';document.getElementById('comment-area').dispatchEvent(new Event('change',{bubbles:true}));field.scrollIntoView({behavior:'auto',block:'center'});field.focus();});article.append(b);details.append(article);
  }host.append(details);
 }
 window.BC_EXPERIENCE?.scope();
}).catch(()=>{/* Preserve source link and the useful static review questions. */});})();
