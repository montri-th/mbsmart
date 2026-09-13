'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict'),cp=require('child_process');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p)),load=p=>{const c={window:{}};vm.runInNewContext(read(p).toString(),c);return JSON.parse(JSON.stringify(c.window.BC_LAYOUT));};
const d=load('layout.js'),old=load('versions/v08/layout.js'),tests=[];function test(n,f){f();tests.push(n);}
const without=(o,keys)=>Object.fromEntries(Object.entries(o).filter(([k])=>!keys.includes(k)));
const near=(a,b,message)=>assert(Math.abs(a-b)<1e-8,message||`${a} != ${b}`);
const isMBStand=q=>/^MB[1-6]-EP$/.test(q.id);
const actorPositions={arrival:[30.65,4.9],'handover-specialist':[34.6,7.25],'handover-client':[35.75,7.15]};
const routeGeometry=[
 {id:'entrance-east-service',path:[[28.2,2.5],[28.2,3.25],[30.5,3.25],[30.5,10.2],[30.5,15.2]],planningWidth:1},
 {id:'mb5-rear-pedestrian',path:[[24,8.8],[26.15,9],[26.75,9.92],[27.4,10.2],[30.5,10.2]],planningWidth:1}
];
test('R4 revision preserves building and smart factory exactly',()=>{
 assert.equal(d.revision,'v09');assert.equal(d.iteration,'r4');
 for(const k of ['building','smartVehicle'])assert.deepEqual(d[k],old[k],k);
 assert(read('smart.js').equals(read('versions/v08/smart.js')),'smart factory bytes');
 assert.equal(d.states.length,old.states.length);
 assert.deepEqual(d.states.map(s=>s.mode),old.states.map(s=>s.mode));
 for(const s of d.states){const prior=old.states.find(q=>q.mode===s.mode);
  assert.deepEqual(without(s,['cars','furniture','people','routes','serviceAccessReserve']),without(prior,['cars','furniture','people','routes','serviceAccessReserve']),s.mode+' unchanged state structure');
  assert.deepEqual(s.module,prior.module,s.mode+' smart factory module');
 }
});
test('MB catalogue and car changes are limited to appearance and MB5 front reference',()=>{
 const models={MB1:['Mercedes-Benz GLS','gls'],MB2:['Mercedes-Benz GLC','glc'],MB3:['Mercedes-Benz E-Class','e-class'],MB4:['Mercedes-Benz GLC','glc-sport'],MB5:['Mercedes-Benz C-Class','c-class'],MB6:['Mercedes-AMG coupe · exact family unconfirmed','amg-coupe']};
 assert.deepEqual(d.mbVehicles.map(q=>q.id),Object.keys(models));
 const paints={MB1:'#11171b',MB2:'#eeeFEb',MB3:'#eceeea',MB4:'#f0f0eb',MB5:'#252a2e',MB6:'#101419'};
 const photos={MB1:'3',MB2:'3',MB3:'1,4',MB4:'2,4',MB5:'8',MB6:'6,9'};
 for(const meta of d.mbVehicles){
  assert.deepEqual(Object.keys(meta).sort(),['id','model','bodyStyle','paint','photoReference','familyConfirmed'].sort(),meta.id+' catalogue keys');
  assert.equal(meta.model,models[meta.id][0]);assert.equal(meta.bodyStyle,models[meta.id][1]);
  assert.equal(meta.paint,paints[meta.id]);assert.equal(meta.photoReference,'Showroom 260912 / '+photos[meta.id]);assert.equal(meta.familyConfirmed,meta.id!=='MB6');
 }
 for(const s of d.states){const prior=old.states.find(q=>q.mode===s.mode);
  assert.deepEqual(s.cars.map(c=>c.id),prior.cars.map(c=>c.id),s.mode+' car IDs/count/order');
  assert.equal(s.cars.filter(c=>c.brand==='MB').length,s.mode==='handover'?6:5);
  assert.equal(s.cars.filter(c=>c.brand==='smart').length,1);
  for(const oldCar of prior.cars){const car=s.cars.find(c=>c.id===oldCar.id);
   if(oldCar.brand!=='MB'){assert.deepEqual(car,oldCar,'smart car unchanged');continue;}
   const expected={...oldCar,...d.mbVehicles.find(c=>c.id===car.id)};
   if(car.id==='MB5'){
    Object.assign(expected,{cx:28.2,cy:6.9,angle:-90,frontCentre:[28.2,4.3],clearanceStatus:car.clearanceStatus});
    assert.match(car.clearanceStatus,/Owner review adopted/);assert.match(car.clearanceStatus,/Door line gap1\.80m/);assert.match(car.clearanceStatus,/HOLD/);
    const a=car.angle*Math.PI/180;near(car.cx+car.l/2*Math.cos(a),28.2);near(car.cy+car.l/2*Math.sin(a),4.3);near(car.cy-car.l/2*Math.sin(a),9.5);near(car.frontCentre[0],(26.6+29.8)/2);
   }
   assert.deepEqual(car,expected,s.mode+' '+car.id+' bounded authorized delta');
   assert.equal(car.l,5.2);assert.equal(car.w,2.1);
  }
 }
});
test('Non-MB-price furniture unchanged and every MB stand obeys RHD formula',()=>{
 for(const s of d.states){const prior=old.states.find(q=>q.mode===s.mode);
  assert.deepEqual(s.furniture.filter(q=>!isMBStand(q)),prior.furniture.filter(q=>!isMBStand(q)),s.mode+' non-MB-price furniture');
  const mbCars=s.cars.filter(q=>q.brand==='MB'),stands=s.furniture.filter(isMBStand);
  assert.equal(stands.length,s.mode==='handover'?6:5);assert.equal(new Set(stands.map(q=>q.id)).size,stands.length);
  assert.deepEqual(stands.map(q=>q.id).sort(),mbCars.map(q=>q.id+'-EP').sort());
  for(const stand of stands){const car=mbCars.find(q=>q.id+'-EP'===stand.id),before=prior.furniture.find(q=>q.id===stand.id);
   const permitted=['cx','cy','angle','corners','relocated','placement','note'];
   if(before)assert.deepEqual(without(stand,permitted),without(before,permitted),stand.id+' unchanged base/retained status');
   else{assert.equal(s.mode,'handover');assert.equal(stand.id,'MB6-EP');assert.deepEqual(without(stand,permitted),{id:'MB6-EP',type:'price-stand',w:.35,h:.35,zone:'MB-price',retained:false});}
   assert(!('corners' in stand),'stale pre-relocation stand corners');assert.equal(stand.w,.35);assert.equal(stand.h,.35);assert.equal(stand.angle,car.angle);assert.equal(stand.relocated,true);
   assert.match(stand.placement,/Driver right \/ RHD/);assert.match(stand.placement,/0\.30m behind front/);assert.match(stand.note,/verify actual stand and door clearances/);
   const a=car.angle*Math.PI/180,F=[Math.cos(a),Math.sin(a)],R=[Math.sin(a),-Math.cos(a)],delta=[stand.cx-car.cx,stand.cy-car.cy];
   near(delta[0]*F[0]+delta[1]*F[1],car.l/2-.30,stand.id+' longitudinal front-centre setback');
   near(delta[0]*R[0]+delta[1]*R[1],car.w/2+stand.h/2+.15,stand.id+' driver-right lateral gap');
  }
 }
});
test('Only the three coordinated people move; both old routes become exact planning paths',()=>{
 for(const s of d.states){const prior=old.states.find(q=>q.mode===s.mode);
  assert.deepEqual(s.people.map(q=>q.id),prior.people.map(q=>q.id),s.mode+' people count/order');
  for(const before of prior.people){const person=s.people.find(q=>q.id===before.id),xy=actorPositions[before.id];assert.deepEqual(person,xy?{...before,x:xy[0],y:xy[1]}:before,before.id+' position-only delta');}
  assert.deepEqual(prior.routes.map(q=>q.id),['entrance-east-service','service-approach-pedestrian'],'frozen route inventory');
  assert.deepEqual(s.routes.map(q=>without(q,['status'])),routeGeometry,s.mode+' routed geometry');
  for(const r of s.routes){assert.match(r.status,/pending|not.*certified/i);for(const k of ['x','y','w','h'])assert(!(k in r),r.id+' old rectangle leaked');}
  assert.deepEqual(without(s.serviceAccessReserve,['status']),{x:29.6,y:8,w:2.4,h:8});
  assert.match(s.serviceAccessReserve.status,/not certified/);
 }
 assert.deepEqual(d.decorativePlanters,[{x:25.15,y:10.05,radius:.3,height:.9,foliageRadius:.5},{x:26,y:10.7,radius:.3,height:.68,foliageRadius:.5},{x:33,y:15.35,radius:.3,height:.9,foliageRadius:.5},{x:33.72,y:15.35,radius:.3,height:.68,foliageRadius:.5}]);
});
test('Published v08 archive unchanged',()=>{for(const f of ['index.html','viewer.css','scene.js','smart.js','site.js','exterior-massing.js','review-guide.js','layout.js','feedback.js','feedback-config.js','assets/site-context.json'])assert(read('versions/v08/'+f).equals(cp.execFileSync('git',['show','506b3a4ecb2a580f4a7d2f050d3fa8aa6b63fcb3:'+f],{cwd:root,maxBuffer:10000000})),f);});
test('Existing 3 MB, 2 Thai flags, shrine, pylon and bounded curve',()=>{const a=d.site.existingInventory;assert.equal(a.filter(q=>q.type==='mercedes-banner').length,3);assert.equal(a.filter(q=>q.type==='thai-national-flag').length,2);assert.equal(a.filter(q=>q.id==='SHRINE').length,1);assert.equal(a.filter(q=>q.id==='MB-PYLON').length,1);assert.equal(d.site.corner.filletRadius,6);assert.equal(d.site.east.openingEnabled,false);assert.equal(d.site.front.gate.legacyPrintedWidth,8);assert.equal(d.site.front.gate.width,18.5);assert.equal(d.site.sources.find(s=>s.id==='N07').date,'2023-10');});
test('Manual envelopes; two reused side cells and one unassigned parking requirement',()=>{const p=d.exterior;assert.equal(p.pylon.height,4.515);assert.equal(p.pylon.width,1.466);assert.equal(p.flag.height,4.5);assert.equal(p.flag.width,1.2);assert.equal(p.parking.length,3);p.parking.forEach(b=>{assert.equal(b.width,2.8);assert.equal(b.length,5.5);});assert.deepEqual(p.parking.filter(b=>b.render).map(b=>b.existingBayId),['S-1','S-2']);const hold=p.parking.find(b=>b.id==='ST-P2');assert.equal(hold.render,false);assert.equal(hold.x,null);assert.equal(hold.y,null);assert.match(hold.status,/HOLD/);assert.equal(p.careLogo.width,2.07);assert.match(p.status,/NOT approved/);});
test('Canonical night-photo paint, mixed orientations, incomplete building fragment and honest occupancy',()=>{const p=JSON.parse(read('assets/parking-photo-fit.json'));assert.deepEqual(d.site.exteriorParking,{...p,level:d.site.levels.forecourt});assert.equal(p.siteCapacity,null);assert.equal(p.identifiedCompleteCells,5);assert.deepEqual(p.cells.map(c=>c.id),['F-D','F-T','C-P','S-1','S-2']);assert.equal(p.cells.filter(c=>c.orientation==='parallel-to-Sukhumvit').length,2);assert.equal(p.cells.filter(c=>c.orientation==='perpendicular-to-Sukhumvit').length,3);assert.equal(p.cars.length,2);assert.equal(p.illustrationOccupancy.ratio,.4);assert.match(p.illustrationOccupancy.scope,/NOT site occupancy/);assert.equal(p.paint.find(q=>q.id==='B-1-fragment').incomplete,true);assert(!p.paint.some(q=>q.points.every(a=>a[0]===16.8)));assert.deepEqual(p.paint.find(q=>q.id==='F-T-outline').points.at(-1),[34.4,-7.65]);const src=read('site.js').toString();assert(src.includes('data.exteriorParking.paint'));assert(!src.includes('[13.2,16.8,20.4,24,28.2,32.5,37.2]'));assert(read('assets/parking-photo-fit.json').equals(read('dist/assets/parking-photo-fit.json')));});
test('Owner R2 orientation and direction waiver remain explicit',()=>{for(const q of [d.site.markers.pylonData,d.site.markers.directionData])assert.equal(q.rotationRadians,Math.PI/2);assert.equal(d.exterior.directionBoard.enabled,false);const m=JSON.parse(read('assets/smart-review-matrix.json'));assert.equal(m.rows.find(r=>r.id==='4').status,'waiver_pending');assert.equal(m.rows.find(r=>r.id==='4').standard,'required_flexible');});
test('Meeting outside Sales and attached workshop are registered separately',()=>{const a=d.site.annexes;assert.equal(a.meeting.fitEnvelope.xMax,0);assert.equal(a.workshop.footprint.yMin,16);assert.equal(a.workshop.attachment.y,16);assert.equal(a.workshop.awning.xMin,a.workshop.footprint.xMax);assert.equal(d.site.rearClip.y,50);assert.equal(d.site.edgeControlPoints.at(-1)[1],30);assert.equal(d.exterior.serviceCanopy.replacedBy,'site.annexes.workshop.awning');});
test('Logo artwork uses all seven source path strings without generic-font substitution',()=>{const paths=JSON.parse(read('assets/smart-brand/logo-paths.json'));assert.equal(paths.paths.length,7);for(const p of paths.paths){const source=read('assets/smart-brand/'+(p.component==='symbol'?'smart-symbol-source.svg':'smart-wordmark-white-source.svg')).toString();assert(source.includes(p.d),'Original path absent from official source');}assert(read('smart-brand.js').toString().includes(JSON.stringify(paths)));for(const f of ['smart-brand.js','building-annexes.js','assets/building-annexes.json','assets/smart-brand/smart-stacked-white-pylon-study.svg'])assert(read(f).equals(read('dist/'+f)),f);});
test('Archived routes and twelve section-scoped scheme/feedback views',()=>{const html=read('index.html').toString(),fb=read('feedback.js').toString();assert(html.includes("['v04','v06','v07','v08'].includes(r)"));assert.equal((html.match(/data-view=/g)||[]).length,12);assert(html.includes('id="exterior-scheme"'));assert(fb.includes("exteriorScheme:artist?'proposed':currentExterior()"));assert(fb.includes('Array.isArray(h.exteriorSchemesByRevision?.[revision])'));assert(fb.includes('experienceCapabilitiesByRevision?.v11'));});
test('R4 retains canonical R3 drawing controls, continuous tower and workshop study',()=>{const s=d.site,a=s.annexes;assert.equal(d.iteration,'r4');assert.equal(s.legacyDrawingControls.letterGrid.A,42);assert.equal(s.legacyDrawingControls.numericGrid['3'],2.02);assert.equal(a.workshop.footprint.yMax,42);assert.equal(a.workshop.floorLevel,-.6);assert.equal(a.workshop.awning.xMax,49.2);assert.deepEqual(s.upperBuilding.masterCorner,a.meeting.masterTowerCorner);assert.equal(s.upperBuilding.masterCorner.frontY,-1.9);assert.equal(s.workshopStudy.smartBays.length,2);assert.deepEqual(s.workshopStudy,d.exterior.workshopStudy);for(const f of s.markers.flagData)assert.equal(f.xy[1],-7.75);assert.equal(s.markers.directionData.faces.reverseExit[0][0],'Exit');for(const f of ['workshop-interior.js','assets/legacy-drawing-controls.json','assets/workshop-study.json'])assert(read(f).equals(read('dist/'+f)),f);});
test('Current model, Mercedes and experience assets present in exact dist bytes',()=>{for(const f of ['index.html','viewer.css','scene.js','smart.js','mercedes-vehicles.js','experience.js','experience.css','site.js','shrine.js','exterior-design.js','exterior-massing.js','feedback.js','layout.js','assets/geometry-register.json','assets/presentation-v11.json','assets/exterior-proposal.json','assets/site-context.json','assets/smart-review-matrix.json'])assert(read(f).equals(read('dist/'+f)),f);});
test('Three native plans and three clean review maps retain exact dist parity',()=>{
 const p=JSON.parse(read('assets/presentation-v11.json'));assert.equal(p.geometryRevision,'v09-r4');
 assert.equal(p.plans.length,3);assert.equal(p.reviewMaps.length,3);
 assert.deepEqual(p.plans.map(q=>q.id).sort(),['groundfloor-site-plan','showroom-plan','workshop-plan'].sort());
 for(const q of [...p.plans,...p.reviewMaps]){assert(q.path.startsWith('assets/plans/')&&q.path.endsWith('.svg'));assert(read(q.path).equals(read('dist/'+q.path)),q.path);}
 const planDownloads=p.downloads.filter(q=>p.plans.some(p=>p.id===q.id));assert.equal(planDownloads.length,3);
 for(const q of planDownloads){assert(q.path.startsWith('assets/downloads/')&&q.path.endsWith('.png'));assert.equal(q.width,4400);assert(read(q.path).equals(read('dist/'+q.path)),q.path);}
 const walk=dir=>fs.readdirSync(path.join(root,dir),{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(dir+'/'+e.name):[dir+'/'+e.name]);
 const source=walk('assets/plans').sort(),built=walk('dist/assets/plans').map(p=>p.replace(/^dist\//,'')).sort();assert.deepEqual(built,source,'exact plan file inventory');
 for(const file of source)assert(read(file).equals(read('dist/'+file)),file);
 // Canonical parking geometry is checked separately, without claiming survey accuracy.
});
test('Deterministic revision generator replay is read-only',()=>{
 const writes=new Map(),allowed=new Set(['layout.js','assets/site-context.json'].map(p=>path.join(root,p)));
 const replayFS={readFileSync:fs.readFileSync.bind(fs),writeFileSync(file,data,options){const absolute=path.resolve(file);assert(allowed.has(absolute),'unexpected generator output '+absolute);writes.set(absolute,Buffer.isBuffer(data)?Buffer.from(data):Buffer.from(data,typeof options==='string'?options:'utf8'));}};
 const safeRequire=name=>{if(name==='fs')return replayFS;if(name==='path')return path;if(name==='vm')return vm;throw Error('Read-only replay needs an explicit safe dependency adapter for '+name);};
 const source=read('scripts/revise-layout-v09.cjs').toString();
 new vm.Script(source,{filename:'scripts/revise-layout-v09.cjs'}).runInNewContext({require:safeRequire,__dirname:path.join(root,'scripts'),console:{log(){}}});
 assert.equal(writes.size,allowed.size);
 for(const file of allowed)assert(writes.get(file)?.equals(fs.readFileSync(file)),path.relative(root,file)+' deterministic replay differs');
});
console.log(JSON.stringify({status:'PASS',revision:d.revision,tests:tests.length,names:tests,limitations:'Static/CPU checks only; no survey, GPU, device, engineering or compliance certification'},null,2));
