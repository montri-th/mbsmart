'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict'),cp=require('child_process');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p)),load=p=>{const c={window:{}};vm.runInNewContext(read(p).toString(),c);return JSON.parse(JSON.stringify(c.window.BC_LAYOUT));};
const d=load('layout.js'),old=load('versions/v08/layout.js'),tests=[];function test(n,f){f();tests.push(n);}
const owner=JSON.parse(read('assets/owner-review-v12.json'));
const without=(o,keys)=>Object.fromEntries(Object.entries(o).filter(([k])=>!keys.includes(k)));
const near=(a,b,message)=>assert(Math.abs(a-b)<1e-8,message||`${a} != ${b}`);
const isMBStand=q=>/^MB[1-6]-EP$/.test(q.id);
const measureFrontAxle=require(path.join(root,'scripts/measure-mercedes-front-axle.cjs'))(root);
const actorPositions={arrival:[30.65,4.9],'handover-specialist':[34.6,7.25],'handover-client':[35.75,7.15]};
const routeGeometry=[
 {id:'entrance-east-service',path:[[28.2,2.5],[28.2,3.25],[30.5,3.25],[30.5,10.2],[30.5,15.2]],planningWidth:1},
 {id:'mb5-rear-pedestrian',path:[[24,8.8],[26.15,9],[26.75,9.92],[27.4,10.2],[30.5,10.2]],planningWidth:1}
];
test('R8 preserves building and smart module, with only audited rounded backdrop, logo artwork and handover metadata deltas',()=>{
 assert.equal(d.revision,'v09');assert.equal(d.iteration,'r8');assert.equal(d.designRevision,'v14');
 for(const k of ['building','smartVehicle'])assert.deepEqual(d[k],old[k],k);
 // Freeze every unrelated smart-factory byte. The verified Type4 branch is pinned
 // separately and assembled below; the other deltas are the audited backdrop, wall artwork and
 // naming/provenance of the existing rectangular slab-ended consult desk.
 let expected=read('versions/v08/smart.js').toString();
 const start=expected.indexOf("  if(q.type==='window-logo'){"),end=expected.indexOf("  }else if(q.type==='background-wall'){",start);
 assert(start>=0&&end>start,'Frozen smart logo branch anchors');
 const actual=read('smart.js').toString(),actualStart=actual.indexOf("  if(q.type==='window-logo'){"),actualEnd=actual.indexOf("  }else if(q.type==='background-wall'){",actualStart);
 assert(actualStart>=0&&actualEnd>actualStart,'Current Type4 branch anchors');
 const windowBranch=actual.slice(actualStart,actualEnd);
 assert.equal(require('crypto').createHash('sha256').update(windowBranch).digest('hex'),'11a44da0b8c5fdeac950d4ebccf3cfc5c64ee99edcd885ea588bd4eee81dec48','Reviewed solid Type4 branch: changed code requires a new geometric audit');
 expected=expected.slice(0,start)+windowBranch+expected.slice(end);
 const oldWall="   icon(g,-1.73,1.89,.092,.73,new T.MeshStandardMaterial({color:'#f8f8f3',emissive:'#eff3eb',emissiveIntensity:.8}));\n   sign('smart',-1.7,1.47,.095,.87,.25,0,g,'#ffffff','#a3a8a7');";
 assert(expected.includes(oldWall),'Frozen wall logo artwork anchor');
 expected=expected.replace(oldWall,"   const wallLogo=mesh(new T.PlaneGeometry(.73,.73*95/70),window.BC_SMART_BRAND_MATERIAL(T),g);wallLogo.position.set(-1.73,1.79,.095);wallLogo.castShadow=false;wallLogo.name='MODULE-LOGO-SOURCE-PATHS';");
 const frozenWallStart=expected.indexOf("  }else if(q.type==='background-wall'){"),frozenWallEnd=expected.indexOf("  }else if(q.type==='screen'){",frozenWallStart),wallStart=actual.indexOf("  }else if(q.type==='background-wall'){"),wallEnd=actual.indexOf("  }else if(q.type==='screen'){",wallStart);
 assert(frozenWallStart>=0&&frozenWallEnd>frozenWallStart&&wallStart>=0&&wallEnd>wallStart,'Backdrop branch boundaries');
 const wallBranch=actual.slice(wallStart,wallEnd);
 assert.equal(require('crypto').createHash('sha256').update(wallBranch).digest('hex'),'f34a9dc28f6afd5b17abc083cb83f4ea144576339814056954f981943029827c','Independently audited rounded-trapezoid branch; changes require a new geometry audit');
 expected=expected.slice(0,frozenWallStart)+wallBranch+expected.slice(frozenWallEnd);
 const oldDesk="   rb(0,.738,0,q.w-.016,.056,q.h-.016,.006,pale,g);\n   for(const z of [-q.h/2+.04,q.h/2-.04])box(0,.371,z,q.w,.712,.065,pale,g);";
 assert(expected.includes(oldDesk),'Frozen consult desk geometry anchor');
 expected=expected.replace(oldDesk,"   // D01 p20/21: rectangular pale-wood negotiation desk, not a cafe pedestal.\n   g.name='SMART-3B-CONSULT-DESK';g.userData={...g.userData,shape:'rectangular-slab-ended',finish:'pale wood',nominalPlanSize:[q.w,q.h],dimensionStatus:q.dimensionStatus};\n   const deskTop=rb(0,.738,0,q.w-.016,.056,q.h-.016,.006,pale,g);deskTop.name='SC-RECTANGULAR-TOP';\n   for(const [i,z] of [-q.h/2+.04,q.h/2-.04].entries()){const panel=box(0,.371,z,q.w,.712,.065,pale,g);panel.name='SC-SLAB-END-'+(i+1);}");
 assert.equal(actual,expected,'Only verified Type4, audited rounded backdrop/source wall-logo and same-geometry consult desk metadata allowed');
 const T=require(path.join(root,'vendor/three.min.js')),ctx={window:{}};
 for(const f of ['smart-brand.js','smart.js'])vm.runInNewContext(read(f).toString(),ctx);
 const mesh=(geo,mat,parent)=>{const o=new T.Mesh(geo,mat);parent.add(o);return o;};
 const M={dark:new T.MeshStandardMaterial(),steel:new T.MeshStandardMaterial()},factory=ctx.window.BC_SMART(T,{mesh,M,box:(x,y,z,w,h,depth,m,g)=>{const o=mesh(new T.BoxGeometry(w,h,depth),m,g);o.position.set(x,y,z);return o;}});
 for(const state of d.states){
  const q=state.furniture.find(q=>q.type==='window-logo'),parent=new T.Group(),g=factory.furniture(q,parent);parent.updateMatrixWorld(true);
  const letters=g.children.filter(o=>o.name.startsWith('TYPE4-RAISED-')),carriers=g.children.filter(o=>o.name.startsWith('TYPE4-VERTICAL-CARRIER-'));
  assert.equal(letters.length,7);assert.equal(carriers.length,2);assert.equal(g.children.length,9);
  for(const p of ctx.window.BC_SMART_BRAND_DATA.paths){const o=letters.find(o=>o.name==='TYPE4-RAISED-'+p.id);assert(o);assert.equal(o.geometry.type,'ExtrudeGeometry');assert(o.geometry.attributes.position.count>0);assert.equal(o.userData.sourcePathSha256,p.sourcePathSha256);assert.equal(o.userData.sourcePathUnmodified,true);assert.equal(o.userData.manufacturerCAD,false);assert.equal(o.material.length,3);assert(o.material.every(m=>!m.transparent));assert(o.material[0].emissiveIntensity>0);assert(o.geometry.groups.some(x=>x.materialIndex===2),'Physical rear cap');}
  for(const [i,o]of carriers.entries()){assert.equal(o.name,'TYPE4-VERTICAL-CARRIER-'+(i+1));const b=new T.Box3().setFromObject(o),size=b.getSize(new T.Vector3());assert(size.y>2&&size.x<.02&&size.z<.03);assert(b.max.z<-2.73,'Carriers behind solid logo');}
  const bounds=new T.Box3().setFromObject(g);assert(bounds.min.x>34&&bounds.max.x<36);assert(bounds.max.z<-2.512,'Inside the existing glass, no exterior frame');assert.equal(g.userData.illuminated,true);assert.equal(g.userData.backVisibleIndoors,true);assert.equal(g.userData.faceDirection,'outward-plan-negative-Y');assert.equal(g.userData.mountingApproval,false);assert.equal(g.userData.electricalSpecificationVerified,false);
  const desk=factory.furniture(state.furniture.find(q=>q.id==='SC'),new T.Group());assert(desk.getObjectByName('SC-RECTANGULAR-TOP'));for(const id of ['SC-SLAB-END-1','SC-SLAB-END-2'])assert(desk.getObjectByName(id));assert.equal(desk.userData.shape,'rectangular-slab-ended');
 }
 assert.equal(d.states.length,old.states.length);
 assert.deepEqual(d.states.map(s=>s.mode),old.states.map(s=>s.mode));
 for(const s of d.states){const prior=old.states.find(q=>q.mode===s.mode);
  assert.deepEqual(without(s,['cars','furniture','people','routes','serviceAccessReserve','handoverOperation']),without(prior,['cars','furniture','people','routes','serviceAccessReserve']),s.mode+' unchanged state structure');
  assert.deepEqual(s.handoverOperation,d.customerExperience.handover,s.mode+' owner operation metadata');
  assert.deepEqual(s.module,prior.module,s.mode+' smart factory module');
 }
});
test('R8 Module3B canonical rounded trapezoid reaches all three states without changing floor pose or furniture',()=>{
 const p=owner.module3BBackdrop;assert.equal(p.shape,'rounded-trapezoid-elevation');for(const [key,value]of Object.entries({bottomWidth:5.3,topWidth:4.9,height:2.5,bottomHeight:.06,thickness:.14,topCornerTrim:.3,bottomCornerTrim:.18}))near(p[key],value,key);assert.equal(p.supplierGeometryVerified,false);assert.match(p.dimensionStatus,/proxies/);
 const T=require(path.join(root,'vendor/three.min.js')),material=new T.MeshStandardMaterial(),ctx={T,window:{},M:{steel:material,dark:material},shell:new T.Group()};
 const helpers=['mesh','box','tube'].map(name=>{const line=read('scene.js').toString().split('\n').find(l=>l.trimStart().startsWith('function '+name+'('));assert(line);return line;}).join('\n');
 vm.runInNewContext(helpers+'\n'+read('smart.js').toString()+'\nwindow.BC_SMART_BRAND_MATERIAL=()=>M.steel; factory=window.BC_SMART(T,{mesh,box,tube,M});',ctx);
 let shapePoints;
 for(const state of d.states){const prior=old.states.find(s=>s.mode===state.mode),walls=state.furniture.filter(q=>q.type==='background-wall');assert.equal(walls.length,1);const q=walls[0],before=prior.furniture.find(q=>q.id==='W');assert.deepEqual(q.elevationProfile,p);assert.equal(q.shape,p.shape);assert.deepEqual(without(q,['elevationProfile','shape']),before);assert.deepEqual(state.module,prior.module);
  for(const id of ['SC-S','SC-C1','SC-C2','LED'])assert.deepEqual(state.furniture.find(q=>q.id===id),prior.furniture.find(q=>q.id===id),state.mode+' unchanged '+id);
  const g=ctx.factory.furniture(q,new T.Group()),wall=g.getObjectByName('SMART-3B-ROUNDED-TRAPEZOID-BACKDROP');assert(wall);assert.equal(wall.geometry.type,'ExtrudeGeometry');assert.equal(wall.geometry.parameters.options.bevelEnabled,false);assert.equal(wall.geometry.parameters.options.curveSegments,32);wall.geometry.computeBoundingBox();const b=wall.geometry.boundingBox;assert(Math.abs(b.max.y-b.min.y-2.5)<2e-6);assert(Math.abs(b.max.z-b.min.z-.14)<2e-6);near(wall.position.z,-.07);assert(b.max.x-b.min.x<5.3&&b.max.x-b.min.x>5.25,'Rounded control corners remove a small width');near(g.position.x,q.cx);near(g.position.z,-q.cy);near(g.position.y,.103);near(g.rotation.y,Math.PI/2);
  const outline=wall.geometry.parameters.shapes.getPoints(32).map(q=>[q.x,q.y]);if(shapePoints)assert.deepEqual(outline,shapePoints);else shapePoints=outline;assert.equal(g.children.filter(q=>q.geometry?.type==='BoxGeometry').length,7);
  const logo=g.getObjectByName('MODULE-LOGO-SOURCE-PATHS');assert(logo);near(logo.position.x,-1.73);near(logo.position.y,1.79);near(logo.position.z,.095);for(const v of wall.geometry.attributes.position.array)assert(Number.isFinite(v));
  const thinner=ctx.factory.furniture({...q,elevationProfile:{...p,thickness:.04}},new T.Group()).getObjectByName(wall.name);assert.deepEqual(thinner.geometry.parameters.shapes.getPoints(32).map(q=>[q.x,q.y]),outline,'Silhouette rounding independent of depth');
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
    assert.match(car.clearanceStatus,/temporarily move MB5 and its price stand/i);assert.match(car.clearanceStatus,/passes the vacated position, turns left/i);assert.match(car.clearanceStatus,/existing front Entrance ramp/);assert.match(car.clearanceStatus,/Swept path unverified/);
    const a=car.angle*Math.PI/180;near(car.cx+car.l/2*Math.cos(a),28.2);near(car.cy+car.l/2*Math.sin(a),4.3);near(car.cy-car.l/2*Math.sin(a),9.5);near(car.frontCentre[0],(26.6+29.8)/2);
   }
   assert.deepEqual(car,expected,s.mode+' '+car.id+' bounded authorized delta');
   assert.equal(car.l,5.2);assert.equal(car.w,2.1);
  }
 }
});
test('Furniture retains bounded SC and shared-charger confirmations, RHD stands and Type4 within panel X34–36',()=>{
 for(const s of d.states){const prior=old.states.find(q=>q.mode===s.mode);
  const expected=prior.furniture.filter(q=>!isMBStand(q)).map(q=>{
   if(q.id==='SMART-WINDOW-LOGO')return {...q,cx:35,status:d.exterior.facadeLogo.status,sizeEnvelope:[.98,1.32],depthProxy:.035,illuminated:true,installationType:4};
   if(q.id==='W')return {...q,elevationProfile:{...owner.module3BBackdrop},shape:owner.module3BBackdrop.shape};
   if(q.id==='SC')return {...q,shape:'rectangular-slab-ended',round:false,finish:'pale wood',tableHeight:.766,source:'D01 Requirement summary for SMART Shop in Shop V3, PDF p20, legend7 and Module3B bill; p21 inset',dimensionStatus:'0.85 x1.60m and height are visual proxies; source gives desk type and chair count, not manufacturing dimensions',fidelityNote:'Rectangular consult desk with two full-width slab short-end supports; one advisor opposite two customers. Not a round cafe table or central pedestal. Owner requested recheck15Sep2026.'};
   if(q.id==='SHARED-EV')return {...q,cx:33.7,cy:8,chargingPointRef:'CH-SHOWROOM',status:'Owner-confirmed existing charging point; annotation-fit location, not a new fifth charger. Hardware, mounting and power specifications pending.'};
   return q;
  });
  assert.deepEqual(s.furniture.filter(q=>!isMBStand(q)),expected,s.mode+' bounded non-MB-price furniture delta');
  const logo=s.furniture.find(q=>q.id==='SMART-WINDOW-LOGO');near(logo.cx,(34+36)/2);near(logo.cy,2.73);assert.match(logo.status,/frameless glass panel X34–36/);assert.match(logo.status,/separate raised source-path symbol\/wordmark and two slim vertical carriers/);assert.match(logo.status,/No fabricated LED power, CCT, return-depth or carrier engineering specification/);
  const ev=s.furniture.find(q=>q.id==='SHARED-EV'),point=owner.workshop.chargingPoints.find(q=>q.id==='CH-SHOWROOM');assert(point);assert.deepEqual([ev.cx,ev.cy],point.centre);assert.equal(ev.retained,true);assert.equal(s.furniture.filter(q=>q.chargingPointRef==='CH-SHOWROOM').length,1);
  const mbCars=s.cars.filter(q=>q.brand==='MB'),stands=s.furniture.filter(isMBStand);
  assert.equal(stands.length,s.mode==='handover'?6:5);assert.equal(new Set(stands.map(q=>q.id)).size,stands.length);
  assert.deepEqual(stands.map(q=>q.id).sort(),mbCars.map(q=>q.id+'-EP').sort());
  for(const stand of stands){const car=mbCars.find(q=>q.id+'-EP'===stand.id),before=prior.furniture.find(q=>q.id===stand.id);
   const permitted=['cx','cy','angle','corners','relocated','placement','note','alignment'];
   if(before)assert.deepEqual(without(stand,permitted),without(before,permitted),stand.id+' unchanged base/retained status');
   else{assert.equal(s.mode,'handover');assert.equal(stand.id,'MB6-EP');assert.deepEqual(without(stand,permitted),{id:'MB6-EP',type:'price-stand',w:.35,h:.35,zone:'MB-price',retained:false});}
   assert(!('corners' in stand),'stale pre-relocation stand corners');assert.equal(stand.w,.35);assert.equal(stand.h,.35);assert.equal(stand.relocated,true);
   assert.match(stand.placement,/Driver right \/ RHD/);assert.match(stand.note,/verify actual stand and door clearances/);
   const a=car.angle*Math.PI/180,F=[Math.cos(a),Math.sin(a)],R=[Math.sin(a),-Math.cos(a)],delta=[stand.cx-car.cx,stand.cy-car.cy];
   if(car.id==='MB6'){assert.equal(stand.alignment,undefined);assert.equal(stand.angle,car.angle);assert.match(stand.placement,/0\.30m behind front/);near(delta[0]*F[0]+delta[1]*F[1],car.l/2-.30,stand.id+' retained longitudinal setback');}
   else{const measured=measureFrontAxle(car),q=stand.alignment;assert(q);for(const [key,value]of Object.entries(measured))assert.deepEqual(q[key],value,stand.id+' reproduced '+key);assert.equal(q.reference,'front-right-tyre');assert.equal(q.signFace,'vehicle-front');assert.equal(q.vehicleAngle,car.angle);assert.equal(stand.angle,car.angle+90);assert.equal(q.mainVisitorPathVerified,false);assert.equal(q.doorOpeningVerified,false);assert.equal(q.supplierFootprintVerified,false);assert.match(q.manual,/AD01 PDF190 \/ printed189/);assert.match(q.ownerConfirmation,/15 September 2026/);near(delta[0]*F[0]+delta[1]*F[1],measured.frontAxleOffset,stand.id+' measured fitted front axle');near(q.modelTyreGap,car.w/2+.15-measured.rightFrontTyreOuterOffset);assert(q.modelTyreGap>0&&q.modelTyreGap<.30);}
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
test('Owner boundary fit retains five existing flags and places the MB broad face on side-building plane X40',()=>{
 const a=d.site.existingInventory,b=owner.exterior.boundary,s=d.site;
 assert.equal(a.filter(q=>q.type==='mercedes-banner').length,3);assert.equal(a.filter(q=>q.type==='thai-national-flag').length,2);assert.equal(a.filter(q=>q.id==='SHRINE').length,1);assert.equal(a.filter(q=>q.id==='MB-PYLON').length,1);
 near(s.corner.filletRadius,1.2);assert.deepEqual(s.corner.filletCentre,[48,-7.12]);near(s.front.apronEdgeY.value,-8.32);near(s.east.apronEdgeX,49.2);assert.equal(b.reference,'inside-face');near(b.retainingThickness,.22);assert.deepEqual(s.leftContextEdge,b.leftContextEdge);assert.match(s.corner.status,/visual trial.*not a measured radius/i);assert.match(s.corner.status,/inner fence radius, not outer road kerb radius/i);assert.equal(b.rearYIsBoundary,false);
 const planter=s.planting.frontBeds.find(q=>q[0]===.15);assert(planter,'Existing front planter datum');near(planter[1],-1.12);near(planter[1]-b.frontY,7.20,'Planter outer edge to declared inside-fence datum');near(s.annexes.workshop.awning.xMax,b.sideX,'Side canopy outer edge equals inside-fence datum');
 assert.equal(s.east.openingEnabled,false);assert.equal(s.front.gate.legacyPrintedWidth,8);near(s.front.gate.width,8.5);near(s.front.gate.xMin,-6);near(s.front.gate.xMax,2.5);near(s.front.gate.xMax-s.front.gate.xMin,s.front.gate.width);
 const p=s.markers.pylonData;assert.deepEqual(p.xy,owner.exterior.pylon.xy);near(p.xy[0],39.79);near(p.depth,.42);near(p.rotationRadians,Math.PI/2);near(p.outwardBroadFacePlaneX,40);near(p.xy[0]+p.depth/2,40);
 const mbFlags=s.markers.flagData.filter(q=>q.type==='mercedes-banner');assert.deepEqual(mbFlags.map(q=>q.xy),owner.exterior.markers.mercedesFlags.map(q=>q.xy));for(let i=1;i<mbFlags.length;i++)near(mbFlags[i].xy[0]-mbFlags[i-1].xy[0],2.5);assert.deepEqual(s.markers.flagData.filter(q=>q.type==='thai-national-flag').map(q=>q.xy),owner.exterior.markers.thaiFlags.map(q=>q.xy));
 assert.deepEqual(s.markers.directionSign,owner.exterior.markers.directionalBoardXY);assert.deepEqual(s.markers.shrine.xy,[46.65,-6.05]);near(s.markers.shrine.rotationRadians,Math.PI);assert.equal(s.road.topology,'T-junction');assert.equal(s.sources.find(q=>q.id==='N07').date,'2023-10');
});
test('Manual smart sign sizes and three owner-confirmed Demo/Sales allocations preserve backend reference IDs',()=>{
 const p=d.exterior;near(p.pylon.height,4.515);near(p.pylon.width,1.466);near(p.flag.height,4.5);near(p.flag.width,1.2);assert.equal(p.parking.length,3);
 assert.deepEqual([p.pylon.x,p.pylon.y],owner.exterior.smart.pylon.xy);assert.deepEqual([p.flag.x,p.flag.y],owner.exterior.smart.flag.xy);
 for(const [q,canonical]of [[p.pylon,owner.exterior.smart.pylon],[p.flag,owner.exterior.smart.flag]]){assert.equal(q.enabled,false);assert.equal(q.render,false);assert.equal(canonical.enabled,false);assert.equal(canonical.render,false);assert.match(q.status,/removed.*latest owner instruction15Sep2026/i);assert.match(q.status,/historical.*ID.*comment provenance/);}
 assert.deepEqual(p.additionalFlags.map(q=>q.id),['SF2','SF3','SF4']);assert.deepEqual(p.additionalFlags.map(q=>[q.x,q.y]),[[19.5,-7.57],[22,-7.57],[24.5,-7.57]]);for(const q of p.additionalFlags){assert.notEqual(q.enabled,false);assert.notEqual(q.render,false);near(q.width,1.2);near(q.height,4.5);}
 for(const q of d.site.markers.flagData.filter(q=>q.type==='mercedes-banner')){near(q.clothWidth,1.2);near(q.clothHeight,4.5);near(q.poleHeightAboveApron,7);}
 assert.deepEqual(p.parking.map(q=>q.id).sort(),['SC-P1','ST-P1','ST-P2']);assert.equal(p.parking.filter(q=>q.render!==false).length,3);
 const expected={'ST-P1':['B-1','S-D-01','Demo'],'SC-P1':['B-2','S-S-01','Sales'],'ST-P2':['OWNER-REAR-01','S-D-02','Demo']};
 for(const q of p.parking){const a=owner.exterior.parking.allocations.find(a=>a.referenceId===q.id);assert(a);assert.deepEqual([a.bayId,a.code,a.role],expected[q.id]);assert.notEqual(q.render,false);assert.equal(q.allocationReviewPending,false);assert.equal(q.bayId,a.bayId);assert.equal(q.code,a.code);assert.equal(q.role,a.role);assert.equal(q.label,a.label);assert.deepEqual(q.bounds,d.site.exteriorParking.cells.find(c=>c.id===a.bayId).bounds);assert(!/Customer/i.test(q.label));}
 near(p.careLogo.width,2.07);assert.match(p.status,/NOT approved/);
});
test('Owner photo-fit parking has 26 cells, 10 illustrative cars, mixed orientations and unique canonical paint',()=>{
 const p=JSON.parse(read('assets/parking-photo-fit.json'));assert.deepEqual(d.site.exteriorParking,{...p,level:d.site.levels.forecourt});assert.equal(p.revision,'owner-v14-r8');assert.equal(p.siteCapacity,null);assert.equal(p.identifiedCompleteCells,26);assert.equal(p.cells.length,26);assert.equal(new Set(p.cells.map(c=>c.id)).size,26);assert(!p.cells.some(c=>c.id==='OWNER-R27-P1'));
 for(const [prefix,key,orientation] of [['F-','roadsideFrontFive','parallel-to-Sukhumvit'],['B-','buildingParallelTwo','parallel-to-Sukhumvit'],['S-','sideFenceFour','parallel-to-Samet-Ang-Sila']]){
  const row=owner.exterior.parking[key],cells=p.cells.filter(c=>c.id.startsWith(prefix));assert.equal(cells.length,row.count);
  for(let i=0;i<cells.length;i++){const c=cells[i];assert.equal(c.id,prefix+(i+1));assert.equal(c.orientation,orientation);const expected=prefix==='S-'?[row.xMin,row.yMin+i*row.slotLength,row.xMax,row.yMin+(i+1)*row.slotLength]:[row.xMin+i*row.slotLength,row.yMin,row.xMin+(i+1)*row.slotLength,row.yMax];assert.deepEqual(c.bounds,expected);}
 }
 assert.equal(p.cells.filter(c=>c.id.startsWith('F-')).length,5);assert.equal(p.cells.filter(c=>c.id.startsWith('B-')).length,2);assert.equal(p.cells.filter(c=>c.id.startsWith('S-')).length,4);
 for(const c of p.cells){const sides=[c.bounds[2]-c.bounds[0],c.bounds[3]-c.bounds[1]].sort((a,b)=>a-b);near(sides[0],2.5,c.id+' bay width');near(sides[1],5,c.id+' bay length');}
 const overlaps=(a,b)=>Math.min(a[2],b[2])-Math.max(a[0],b[0])>1e-8&&Math.min(a[3],b[3])-Math.max(a[1],b[1])>1e-8;
 for(let i=0;i<p.cells.length;i++)for(let j=i+1;j<p.cells.length;j++)assert(!overlaps(p.cells[i].bounds,p.cells[j].bounds),p.cells[i].id+' overlaps '+p.cells[j].id);
 assert.equal(p.cars.length,10);assert.equal(new Set(p.cars.map(c=>c.id)).size,10);assert.equal(new Set(p.cars.map(c=>c.bayId)).size,10);for(const c of p.cars)assert(!['F-3','F-4','B-1','B-2','OWNER-REAR-01','C-P'].includes(c.bayId),'MB illustration blocks ramp or reserved Smart bay '+c.bayId);near(p.illustrationOccupancy.ratio,10/26);assert.equal(p.illustrationOccupancy.occupied,10);assert.equal(p.illustrationOccupancy.identifiedCompleteCells,26);assert.match(p.illustrationOccupancy.scope,/no certified.*capacity/i);
 for(const c of p.cars){const [x0,y0,x1,y1]=p.cells.find(q=>q.id===c.bayId).bounds;near(c.cx,(x0+x1)/2);near(c.cy,(y0+y1)/2);assert.equal(c.angle,x1-x0>y1-y0?0:90);assert.equal(c.brand,'MB');assert(['cclass','eclass','glc'].includes(c.profile));assert.notEqual(c.bayId,'C-P');assert.match(c.photoReference,/family appearance, not live stock/);const nativeLength={cclass:4.8,glc:4.75,eclass:5.05};near(c.l,nativeLength[c.profile],c.id+' photographed-family envelope must not shrink to fit');const a=c.angle*Math.PI/180,dx=Math.abs(Math.cos(a))*c.l+Math.abs(Math.sin(a))*c.w,dy=Math.abs(Math.sin(a))*c.l+Math.abs(Math.cos(a))*c.w;assert(dx<=x1-x0-.08&&dy<=y1-y0-.08,c.id+' does not fit inset');}
 const key=(a,b)=>[a,b].map(q=>q.map(n=>n.toFixed(4)).join(',')).sort().join('|'),expected=new Set(),actual=new Set();
 for(const c of p.cells){const [x0,y0,x1,y1]=c.bounds,pts=[[x0,y0],[x1,y0],[x1,y1],[x0,y1],[x0,y0]];for(let i=1;i<pts.length;i++)expected.add(key(pts[i-1],pts[i]));}
 for(const q of p.paint){assert.equal(q.points.length,2);assert.equal(q.source,'owner-review-v12');const k=key(...q.points);assert(!actual.has(k),'Duplicate paint '+k);actual.add(k);}
 assert.deepEqual([...actual].sort(),[...expected].sort());assert.equal(actual.size,expected.size);
 const src=read('site.js').toString();assert(src.includes('data.exteriorParking.paint'));assert(!src.includes('[13.2,16.8,20.4,24,28.2,32.5,37.2]'));assert(read('assets/parking-photo-fit.json').equals(read('dist/assets/parking-photo-fit.json')));
});
test('Owner R2 orientation and direction waiver remain explicit',()=>{for(const q of [d.site.markers.pylonData,d.site.markers.directionData])assert.equal(q.rotationRadians,Math.PI/2);assert.equal(d.exterior.directionBoard.enabled,false);const m=JSON.parse(read('assets/smart-review-matrix.json'));assert.equal(m.rows.find(r=>r.id==='4').status,'waiver_pending');assert.equal(m.rows.find(r=>r.id==='4').standard,'required_flexible');});
test('Meeting outside Sales and attached workshop are registered separately',()=>{const a=d.site.annexes;assert.equal(a.meeting.fitEnvelope.xMax,0);assert.equal(a.workshop.footprint.yMin,16);assert.equal(a.workshop.attachment.y,16);assert.equal(a.workshop.awning.xMin,a.workshop.footprint.xMax);assert.equal(d.site.rearClip.y,50);assert.equal(d.site.edgeControlPoints.at(-1)[1],42,'r8 roadside fence covers full workshop length');assert.equal(d.exterior.serviceCanopy.replacedBy,'site.annexes.workshop.awning');});
test('R8 roadside mass, inside-only paint, two English signs and Thai left-hand traffic are explicit',()=>{
 const a=d.site.annexes.workshop,m=a.roadsideMasonry,r=d.site.road.sametAngSila,w=d.site.workshopStudy;
 assert.deepEqual([a.roadsideShell.xMax,a.roadsideShell.yMin,a.roadsideShell.yMax],[49.2,22,42]);
 assert.deepEqual(m.segments,[[22,42]]);near(m.insideFaceX,49.2);assert.equal(m.interiorColor,'#45494b');assert.equal(m.exteriorColor,'#d7d8d1');assert.equal(m.brandColourApproval,false);
 assert.equal(w.ownerLayout.innerConnection.mostlyOpen,true);assert.deepEqual(w.ownerLayout.innerConnection.photoFitOpenY,[22,42]);assert.equal(w.ownerLayout.innerConnection.retainColumnsAndBeams,true);
 assert.deepEqual(w.ownerCommentSignage.map(q=>q.label),['High Voltage Station','M/E Station']);assert.equal(w.ownerCommentSignage.length,2);assert.deepEqual(w.ownerLayout.equipment.proposedAdditional,[]);
 assert.equal(r.totalLanes,6);assert.equal(r.lanesPerDirection,3);assert.equal(r.drivingSide,'left');assert.equal(r.nearCarriagewayPlanYDirection,1);assert.equal(r.farCarriagewayPlanYDirection,-1);
});
test('Logo artwork uses all seven source path strings without generic-font substitution',()=>{const paths=JSON.parse(read('assets/smart-brand/logo-paths.json'));assert.equal(paths.paths.length,7);for(const p of paths.paths){const source=read('assets/smart-brand/'+(p.component==='symbol'?'smart-symbol-source.svg':'smart-wordmark-white-source.svg')).toString();assert(source.includes(p.d),'Original path absent from official source');}assert(read('smart-brand.js').toString().includes(JSON.stringify(paths)));for(const f of ['smart-brand.js','building-annexes.js','assets/building-annexes.json','assets/smart-brand/smart-stacked-white-pylon-study.svg'])assert(read(f).equals(read('dist/'+f)),f);});
test('Archived routes and twelve section-scoped scheme/feedback views',()=>{const html=read('index.html').toString(),fb=read('feedback.js').toString();assert(html.includes("['v04','v06','v07','v08'].includes(r)"));assert.equal((html.match(/data-view=/g)||[]).length,12);assert(html.includes('id="exterior-scheme"'));assert(fb.includes("exteriorScheme:artist?'proposed':currentExterior()"));assert(fb.includes('Array.isArray(h.exteriorSchemesByRevision?.[revision])'));assert(fb.includes('experienceCapabilitiesByRevision?.v11'));});
test('R8 retains canonical R3 drawing controls and tower; owner workshop inventory replaces only unverified proxies',()=>{
 const s=d.site,a=s.annexes,w=s.workshopStudy.ownerLayout;assert.equal(d.iteration,'r8');assert.equal(s.legacyDrawingControls.letterGrid.A,42);assert.equal(s.legacyDrawingControls.numericGrid['3'],2.02);assert.equal(a.workshop.footprint.yMax,42);assert.equal(a.workshop.floorLevel,-.6);assert.equal(a.workshop.awning.xMax,49.2);assert.deepEqual(s.upperBuilding.masterCorner,a.meeting.masterTowerCorner);assert.equal(s.upperBuilding.masterCorner.frontY,-1.9);assert.equal(s.workshopStudy.smartBays.length,1);assert.deepEqual(s.workshopStudy,d.exterior.workshopStudy);const expected=JSON.parse(JSON.stringify(owner.workshop));for(const q of expected.reservations.parking){q.code=owner.exterior.parking.bayCodes[q.id];const refit=owner.exterior.parking.workshopSideRefits.find(r=>r.id===q.id);if(refit){q.bounds=refit.bounds.slice();q.status='Owner dimensioned 2.5×5m exterior photo-fit; owner code confirmed, manoeuvring unverified';}}assert.deepEqual(w,expected);assert.equal(s.markers.directionData.faces.reverseExit[0][0],'Exit');
 assert.equal(w.equipment.ownerExisting.length,10);assert.equal(new Set(w.equipment.ownerExisting.map(q=>q.id)).size,10);assert.equal(w.equipment.ownerExisting.filter(q=>q.kind==='two-post').length,8);assert.equal(w.equipment.ownerExisting.filter(q=>q.kind==='four-post').length,2);assert.equal(w.equipment.ownerExisting.filter(q=>q.kind==='wheel-alignment').length,0);assert.deepEqual(w.equipment.proposedAdditional,[]);
 const alignment=w.equipment.ownerExisting.find(q=>q.id==='WS-R32');assert.equal(alignment.designation,'MB-4P-01');assert.equal(alignment.kind,'four-post');assert.equal(alignment.function,'wheel-alignment');const service=w.smartServiceWorkbay;assert.equal(service.id,'SMART-SERVICE-WORKBAY');assert.deepEqual(service.bounds,[8,22,12,28.5]);assert.equal(service.renderStyle,'floor-marking-only');assert.equal(service.equipment,false);assert.equal(service.physicalLift,false);assert.deepEqual(w.existingRearStair.bounds,[36,38.75,40,42]);assert.equal(w.existingRearStair.measuredDimensions,false);assert.equal(w.chargingPoints.length,4);assert.equal(new Set(w.chargingPoints.map(q=>q.id)).size,4);
 const hv=w.smartOverlays.find(q=>q.id==='SMART-HV');assert.equal(hv.physicalLiftRef,'WS-R29');assert.equal(hv.renderOwnLift,false);assert.equal(w.equipment.ownerExisting.find(q=>q.id===hv.physicalLiftRef).kind,'two-post');assert.equal(s.workshopStudy.mbPlanningCells.render,false);
 const cs=w.reservations.csOffice;assert.equal(d.customerExperience.CS,'Customer Service');assert.match(cs.label,/Customer Service/);assert.equal(cs.renderWalls,false);assert.equal(cs.renderCeiling,false);assert.deepEqual(cs.doors,[]);assert.equal(cs.level,null);assert.equal(cs.ac,null);assert.equal(w.reservations.diagnosis.renderOldCabinet,false);assert.equal(w.reservations.diagnosis.newCentre,null);assert.equal(w.reservations.diagnosis.requiredFunctionRetained,true);
 assert.equal(w.reservations.parking.length,5);assert.deepEqual(w.reservations.parking.find(q=>q.id==='OWNER-R27-P1').bounds,[36.14,22.07,39.79,28.4]);assert(read('workshop-interior.js').toString().includes('CUSTOMER-SERVICE-PARKING-PAINT'));
 for(const f of ['workshop-interior.js','assets/legacy-drawing-controls.json','assets/workshop-study.json'])assert(read(f).equals(read('dist/'+f)),f);
});
test('Ten rear workshop bays retain 2.5×5m dimensions, 1m wall offset, right-to-left numbering and no crossed-out bays',()=>{
 const r=d.site.workshopStudy.ownerLayout.rearParking;assert.equal(r.count,10);assert.equal(r.bays.length,10);near(r.width,2.5);near(r.depth,5);near(r.offset,1);near(r.wallModelY,42);assert.equal(r.numberOrder,'right to left');assert.equal(r.crossedOutLeftCellsRendered,0);assert.equal(r.vehicleHeading,null);assert.match(r.approachStatus,/1m is wall offset, not vehicle aisle/);
 assert.deepEqual(r.bankBounds,[15,43,40,48]);assert.deepEqual(r.gapStrip,[15,42,40,43]);near(r.bankBounds[2],d.site.annexes.workshop.footprint.xMax,'Rear bank right END aligns with wall, not bay centre');
 for(let i=0;i<10;i++){const b=r.bays[i],c=d.site.exteriorParking.cells.find(q=>q.id===b.id);assert.equal(b.id,'OWNER-REAR-'+String(i+1).padStart(2,'0'));assert.equal(b.number,i+1);near(b.centre[0],38.75-i*2.5);near(b.centre[1],45.5);near(b.bounds[2]-b.bounds[0],2.5);near(b.bounds[3]-b.bounds[1],5);near(b.bounds[1]-r.wallModelY,1);assert.deepEqual(c.bounds,b.bounds);assert.equal(c.orientation,'long-axis-Y');}
 for(let i=1;i<10;i++){const code='MB-C'+String(i+7).padStart(2,'0');assert.equal(r.bays[i].code,code);assert.equal(d.site.exteriorParking.cells.find(c=>c.id===r.bays[i].id).code,code);}
 const cover=d.site.annexes.workshop.rearCanopy;assert.equal(cover.id,'EXISTING-REAR-PARKING-CANOPY');assert.equal(cover.render,true);near(cover.xMin,2.02);near(cover.xMax,40);near(cover.wallY,42);near(cover.outerY,48.3);near(cover.supportY,48.1);assert.deepEqual(cover.supportXs,[2.5,10,17.5,25,32.5,40]);assert.match(cover.status,/photo-fit|not measured/i);
 assert.equal(cover.roofScope,'full-rear-workshop-elevation');near(cover.xMax-cover.xMin,37.98,'Full workshop rear roof');assert.deepEqual(cover.coveredParkingBounds,r.bankBounds);near(r.bankBounds[0]-cover.xMin,12.98,'Roof extends left of ten-bay bank');
 const rearEdge=d.site.annexes.workshop.gridEnvelope.filter(p=>p[1]===cover.wallY).map(p=>p[0]);assert.equal(rearEdge.length,2);near(cover.xMin,Math.min(...rearEdge));near(cover.xMax,Math.max(...rearEdge));
 assert.equal(cover.supportXs.length,6);assert.deepEqual(cover.supportGrid.regularSupportXs,cover.supportXs);near(cover.supportGrid.anchorX,40);near(cover.supportGrid.bayWidth,r.width);assert.equal(cover.supportGrid.baysPerSpan,3);near(cover.supportGrid.nominalSpacing,7.5);
 for(let i=1;i<cover.supportXs.length;i++)near(cover.supportXs[i]-cover.supportXs[i-1],r.width*3,'Support every three paint cells');for(const number of [3,6,9])assert(cover.supportXs.includes(r.bays.find(q=>q.number===number).bounds[0]),'Post at three-cell division');
 near(cover.supportXs[0]-cover.xMin,.48);near(cover.xMax-cover.supportXs.at(-1),0);near(cover.supportGrid.leftEndOverhang,.48);near(cover.supportGrid.rightEndOverhang,0);assert.equal(cover.supportGrid.terminalPostAdded,false);assert.equal(cover.measuredDimensions,false);assert.equal(cover.structuralApproval,false);
 assert.deepEqual(cover,JSON.parse(read('assets/building-annexes.json')).workshop.rearCanopy,'Canonical full rear roof projection');
});
test('R8 actual annex factory renders one full rear roof and six posts outside all ten paint cells',()=>{
 const T=require(path.join(root,'vendor/three.min.js')),a=JSON.parse(read('assets/building-annexes.json')),m=new T.MeshStandardMaterial(),M=Object.fromEntries(['column','stone','steel','dark','white','glass','wood','upholstery'].map(k=>[k,m])),ctx={T,window:{},shell:new T.Group(),M,a};
 const helpers=['mesh','box','planBox','tube','slab'].map(name=>{const line=read('scene.js').toString().split('\n').find(l=>l.trimStart().startsWith('function '+name+'('));assert(line);return line;}).join('\n');
 vm.runInNewContext(helpers+'\nfunction sign(text,x,y,z,w,h,rotation=0,parent=shell){const o=mesh(new T.PlaneGeometry(w,h),M.white,parent);o.position.set(x,y,z);o.rotation.y=rotation;return o;}\n'+read('building-annexes.js').toString()+'\nresult=window.BC_BUILDING_ANNEXES(T,{mesh,box,planBox,tube,slab,sign,M},a);',ctx);
 const scene=new T.Group();scene.add(...Object.values(ctx.result));scene.updateMatrixWorld(true);const cover=a.workshop.rearCanopy,roof=scene.getObjectByName(cover.id+'-ROOF'),supports=scene.getObjectByName(cover.id+'-SUPPORTS');assert(roof&&supports);const bounds=new T.Box3().setFromObject(roof);for(const [n,v]of [[bounds.min.x,2.02],[bounds.max.x,40],[-bounds.max.z,42],[-bounds.min.z,48.3]])assert(Math.abs(n-v)<1e-5);assert.equal(roof.geometry.attributes.position.count,4);assert.equal(roof.geometry.index.count,6);
 const posts=supports.children.filter(q=>q.userData.kind==='rear-canopy-post');assert.equal(posts.length,6);assert.deepEqual(JSON.parse(JSON.stringify(posts.map(q=>q.position.x))),cover.supportXs);for(const p of posts){const b=new T.Box3().setFromObject(p),r=[b.min.x,-b.max.z,b.max.x,-b.min.z];assert(r[1]-48>.049);for(const cell of owner.workshop.rearParking.bays)assert(!(Math.min(r[2],cell.bounds[2])-Math.max(r[0],cell.bounds[0])>1e-6&&Math.min(r[3],cell.bounds[3])-Math.max(r[1],cell.bounds[1])>1e-6),p.name+' overlaps '+cell.id);}
});
test('Owner selects Small two-screen Sub Stage and confirms MB6 via vacated MB5 then left down existing Entrance ramp',()=>{
 const ce=d.customerExperience,op=ce.handover;assert.equal(ce.format,'Autohaus Small');assert.equal(ce.salesJourney,'Sales Step V');assert.equal(ce.subStageScreens,2);assert.equal(ce.ownerConfirmed,true);assert.equal(ce.CS,'Customer Service');assert.deepEqual(without(ce,['handover','sharedCharging']),without(owner.customerExperience,['handover']));
 assert.equal(ce.sharedCharging,'Four owner-confirmed charging points: showroom, Customer Service, rear workshop and rear parking. Existing SHARED-EV represents the showroom point; mounting, hardware, electrical capacity and specifications remain unverified.');assert.equal(d.exterior.sharedCharging,ce.sharedCharging);assert.deepEqual(owner.workshop.chargingPoints.map(q=>q.id).sort(),['CH-CS','CH-REAR-PARKING','CH-REAR-WORKSHOP','CH-SHOWROOM']);
 assert.deepEqual(without(op,['path','forecourtPath','forecourtRouteRender','forecourtPathSuperseded','forecourtRouteStatus','confirmedExitSequence']),owner.customerExperience.handover);assert.equal(op.newVehicleDoor,false);assert.match(op.sequence[0],/Temporarily move MB5/);assert.match(op.sequence[1],/switch Flex AC off/);assert.match(op.sequence[2],/vacated MB5 position/);assert.match(op.sequence[3],/Turn left.*existing front Entrance ramp/);assert.match(op.routeStatus,/swept path.*require site verification/);assert.equal(op.forecourtRouteRender,false);assert.equal(op.forecourtPathSuperseded,true);assert.match(op.forecourtRouteStatus,/HOLD/);assert.equal(op.confirmedExitSequence.length,4);
 assert.deepEqual(op.path,[[36,5.25],[32,5.25],[30,5.25],[28.2,5.25],[28.2,2.5],[28.2,-4.5]]);assert.deepEqual(op.forecourtPath,[[28.2,-4.5],[27,-5.9],[18,-5.9],[8,-5.9],[-1.75,-6.9],[-1.75,-13.5]]);
 const [a,b,c]=op.path.slice(2,5);assert((b[0]-a[0])*(c[1]-b[1])-(b[1]-a[1])*(c[0]-b[0])>0,'MB6 turn must be left in the plan frame');
 const r=d.site.entryRamp;assert.deepEqual(without(r,['status']),{xMin:26.6,xMax:29.8,yMin:-4.5,yMax:2.5});assert.match(r.status,/schematic pending measurement/);assert.equal(d.site.entrySteps.render,false);
 const src=read('scene.js').toString();assert(src.includes("[11.05,12.25].entries()"));assert(src.includes("display.name='SMALL-SUB-STAGE-SCREEN-'"));assert(src.includes("countPackage:2,approved:false"));assert(src.includes("guide.name=id;guide.userData={kind:'operating-sequence',sweptPathVerified:false"));assert(src.includes("handoverGuide.visible=mode==='handover'"));
});
test('Current model, Mercedes and experience assets present in exact dist bytes',()=>{for(const f of ['index.html','viewer.css','scene.js','smart.js','mercedes-vehicles.js','experience.js','experience.css','site.js','shrine.js','exterior-design.js','exterior-massing.js','feedback.js','layout.js','assets/geometry-register.json','assets/presentation-v11.json','assets/exterior-proposal.json','assets/site-context.json','assets/smart-review-matrix.json'])assert(read(f).equals(read('dist/'+f)),f);});
test('Three native plans and three clean review maps retain exact dist parity',()=>{
 const p=JSON.parse(read('assets/presentation-v11.json'));assert.equal(p.geometryRevision,'v09-r8');assert.equal(p.presentationRevision,'v14');assert.equal(p.experienceRevision,'v11');
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
test('Exterior review-map image preserves all 104 cell vertices at historical metric pin positions',()=>{
 const feedback=read('feedback.js').toString(),embedded=feedback.match(/const plot=section\(\)==='exterior'\?\[([^\]]+)\]:\[([^\]]+)\]/);assert(embedded,'actual embedded image rectangle');
 const plot=embedded[1].split(',').map(Number);assert.deepEqual(plot,[-14,58,-15.4,50.8]);
 const manifest=JSON.parse(read('assets/presentation-v11.json')),entry=manifest.reviewMaps.find(q=>q.id==='groundfloor-site-plan');assert(entry);assert.equal(entry.path,'assets/plans/groundfloor-site-plan-review-map-v14.svg');
 const map=read(entry.path).toString(),viewBox=map.match(/viewBox="([^"]+)"/)?.[1].split(/\s+/).map(Number),transform=map.match(/<g transform="matrix\(([^)]+)\)"/)?.[1].split(/\s+/).map(Number);assert(viewBox&&transform);assert.deepEqual(viewBox,[-14,-50.8,72,66.2]);assert.equal(transform.length,6);near(transform[1],0);near(transform[2],0);
 let vertices=0;const [vx,vy,vw,vh]=viewBox;
 for(const c of d.site.exteriorParking.cells){const tags=[...map.matchAll(new RegExp('<polygon[^>]*id="CELL-'+c.id+'"[^>]*>','g'))];assert.equal(tags.length,1,'Exactly one map cell '+c.id);const pts=tags[0][0].match(/points="([^"]+)"/)[1].split(' ').map(p=>p.split(',').map(Number)),[x0,y0,x1,y1]=c.bounds,expected=[[x0,y0],[x1,y0],[x1,y1],[x0,y1]];assert.equal(pts.length,4);
  pts.forEach(([px,py],i)=>{const x=px*transform[0]+py*transform[2]+transform[4],svgY=px*transform[1]+py*transform[3]+transform[5];const renderedX=plot[0]+(x-vx)*(plot[1]-plot[0])/vw,renderedY=16-plot[3]+(svgY-vy)*(plot[3]-plot[2])/vh;assert(Math.abs(renderedX-expected[i][0])<.0001&&Math.abs(renderedY-(16-expected[i][1]))<.0001,c.id+' pin/map misalignment');vertices++;});
 }
 assert.equal(vertices,104);
});
test('Deterministic revision generator replay is read-only',()=>{
 const writes=new Map(),allowed=new Set(['layout.js','assets/site-context.json','assets/building-annexes.json','assets/geometry-register.json','assets/parking-photo-fit.json','assets/workshop-study.json','assets/exterior-proposal.json'].map(p=>path.join(root,p)));
 const reads=new Set(),readable=new Set(['versions/v08/layout.js','mercedes-vehicles.js','assets/existing-photo-fit.json','assets/building-annexes.json','assets/legacy-drawing-controls.json','assets/workshop-study.json','assets/exterior-proposal.json','assets/parking-photo-fit.json','assets/owner-review-v12.json'].map(p=>path.join(root,p)));
 const replayFS={readFileSync(file,...args){const absolute=path.resolve(file);assert(readable.has(absolute),'unexpected generator input '+absolute);reads.add(absolute);return fs.readFileSync(absolute,...args);},writeFileSync(file,data,options){const absolute=path.resolve(file);assert(allowed.has(absolute),'unexpected generator output '+absolute);writes.set(absolute,Buffer.isBuffer(data)?Buffer.from(data):Buffer.from(data,typeof options==='string'?options:'utf8'));}};
 let projectionLoaded=false;
 const safeRequire=name=>{
  if(name==='fs')return replayFS;if(name==='path')return path;if(name==='vm')return vm;
  if(name==='./measure-mercedes-front-axle.cjs'){
   const module={exports:{}};const measureRequire=id=>{if(id==='node:fs')return replayFS;if(id==='node:path')return path;if(id==='node:vm')return vm;if(id==='node:crypto')return require('crypto');if(id==='node:assert/strict')return assert;if(id===path.join(root,'vendor/three.min.js'))return require(id);throw Error('Unexpected axle measurement dependency '+id);};
   new vm.Script(read('scripts/measure-mercedes-front-axle.cjs').toString(),{filename:'scripts/measure-mercedes-front-axle.cjs'}).runInNewContext({module,require:measureRequire});assert.equal(typeof module.exports,'function');return module.exports;
  }
  if(name==='./export-geometry.cjs'){
   const module={exports:{}};new vm.Script(read('scripts/export-geometry.cjs').toString(),{filename:'scripts/export-geometry.cjs'}).runInNewContext({module,require(){throw Error('Geometry export may not load filesystem/network dependencies');}});assert.equal(typeof module.exports,'function');return module.exports;
  }
  if(name==='./apply-owner-review-v12.cjs'){
   assert.equal(projectionLoaded,false,'owner projection must load exactly once');projectionLoaded=true;
   const module={exports:{}};new vm.Script(read('scripts/apply-owner-review-v12.cjs').toString(),{filename:'scripts/apply-owner-review-v12.cjs'}).runInNewContext({module,require(){throw Error('Owner projection may not load filesystem/network dependencies');}});assert.equal(typeof module.exports,'function');return module.exports;
  }
  throw Error('Read-only replay needs an explicit safe dependency adapter for '+name);
 };
 const source=read('scripts/revise-layout-v09.cjs').toString();
 new vm.Script(source,{filename:'scripts/revise-layout-v09.cjs'}).runInNewContext({require:safeRequire,__dirname:path.join(root,'scripts'),console:{log(){}}});
 assert.equal(projectionLoaded,true);assert.equal(reads.size,readable.size);for(const file of readable)assert(reads.has(file),'missing canonical input '+path.relative(root,file));
 assert.equal(writes.size,allowed.size);
 for(const file of allowed)assert(writes.get(file)?.equals(fs.readFileSync(file)),path.relative(root,file)+' deterministic replay differs');
});
console.log(JSON.stringify({status:'PASS',revision:d.revision,iteration:d.iteration,presentationRevision:d.designRevision,tests:tests.length,names:tests,limitations:'Static/CPU checks only; no survey, GPU, device, engineering or compliance certification'},null,2));
