const fs=require('fs'),path=require('path'),vm=require('vm');
const root=path.resolve(__dirname,'..'),ctx={window:{}};
const measureFrontAxle=require('./measure-mercedes-front-axle.cjs')(root);
vm.runInNewContext(fs.readFileSync(path.join(root,'versions/v08/layout.js'),'utf8'),ctx);
const d=JSON.parse(JSON.stringify(ctx.window.BC_LAYOUT));
if(d.revision!=='v08')throw Error('v09 must derive from frozen v08');
const c=JSON.parse(fs.readFileSync(path.join(root,'assets/existing-photo-fit.json'),'utf8'));
// Existing-photo-fit.json owns R3 current photograph controls; metres remain trials.
const s=d.site;s.revision='v09';s.purpose='Photo-reconciled existing context, separate from proposed smart exterior';
s.sources.push(...c.sources.filter(q=>q.id.startsWith('N')));s.ownerConfirmation=c.ownerConfirmation;
s.previousV08={edgeControlPoints:s.edgeControlPoints,gate:s.front.gate,sideOpening:s.east.serviceGapY};
s.corner=c.physicalEdgeCandidate;s.edgeControlPoints=c.physicalEdgeCandidate.points;s.edgeStatus=c.physicalEdgeCandidate.status;
s.front.gate={xMin:c.mainDrivewayCandidate.xMin,xMax:c.mainDrivewayCandidate.xMax,width:c.mainDrivewayCandidate.visualEnvelopeWidth,status:c.mainDrivewayCandidate.status,legacyPrintedWidth:8};
s.gateTransitions.frontInnerY=c.mainDrivewayCandidate.rampTopY;
s.east.openingEnabled=false;s.east.status='Continuous photographed fence through current crop; v08 side curb cut removed because not evidenced, not a claim about access beyond crop';
s.markers={pylon:c.preserveExisting.find(q=>q.id==='MB-PYLON').xy,pylonData:c.preserveExisting.find(q=>q.id==='MB-PYLON'),flags:c.preserveExisting.filter(q=>q.type==='mercedes-banner').map(q=>q.xy),flagData:c.preserveExisting.filter(q=>q.type.includes('flag')||q.type==='mercedes-banner'),shrine:c.preserveExisting.find(q=>q.id==='SHRINE'),directionSign:c.preserveExisting.find(q=>q.id==='EXISTING-DIRECTION').xy,status:c.confidenceRule};
s.markers.shrine.preliminaryPhotoEnvelope={terraceWidth:4.1,terraceDepth:4.1,terraceRise:.18,roofWidth:4.3,roofDepth:4.3,topAboveApron:4.6,status:'initial research candidate, superseded by authored mesh dimensions below; neither surveyed'};
Object.assign(s.markers.shrine,{terraceWidth:3.5,terraceDepth:3.2,terraceRise:.43,roofWidth:4,roofDepth:3.48,topAboveApron:4.79,renderedEnvelope:{width:3.9958,depth:3.706,height:4.79,rotationRadians:Math.PI,status:'authored mesh bounds, NOT measured shrine dimensions'}});
s.markers.directionData=c.preserveExisting.find(q=>q.id==='EXISTING-DIRECTION');
s.markers.directionData.faces={frontEntrance:[['Entrance','left'],['Parking','left'],['Sales','left'],['Service','left'],['Spare Parts','left']],reverseExit:[['Exit','left'],['Parking','right'],['Sales','right'],['Service','right'],['Spare Parts','right']]};
s.annexes=JSON.parse(fs.readFileSync(path.join(root,'assets/building-annexes.json'),'utf8'));
s.legacyDrawingControls=JSON.parse(fs.readFileSync(path.join(root,'assets/legacy-drawing-controls.json'),'utf8'));
s.workshopStudy=JSON.parse(fs.readFileSync(path.join(root,'assets/workshop-study.json'),'utf8'));
s.upperBuilding.masterCorner=s.annexes.meeting.masterTowerCorner;
s.upperBuilding.southBalcony={yMin:9,yMax:12.8,recessX:-.5,status:'Recessed south-side upper opening from current and June2024 photographs; dimensions approximate'};
s.upperBuilding.lowerWingFrontY=.6;
s.upperBuilding.signBeam={xMin:0,xMax:24,centreHeight:3.82,height:.64,depth:.24,worldZ:.04,letterWorldZ:.22,color:'#17191b',roughness:.86,metalness:0,source:'Owner close-up supplied14Sep2026: continuous opaque black concrete beam behind first/third facade lettering',status:'Observed continuity/material character; dimensions and structure not surveyed'};
s.frontDrain={insideOffset:.30,width:.30,visualDepth:.12,status:'Open channel inside fence seen in current photos; visible recess proxy, not drainage engineering'};
s.sources.push(...s.annexes.sources);s.bounds.yMax=s.annexes.contextCropY;
s.rearClip={y:s.annexes.contextCropY,status:'arbitrary expanded context crop, NOT rear property edge or measured A–H'};
// Keep photo-fitted street fence stopping at original observed crop, not extending an invented boundary.
s.limitations=s.limitations.filter(q=>!q.startsWith('X grid remains assumed'));
s.limitations.push('Rear workshop follows legacy E–A26m grid envelope / Y16–42; current as-built unverified. Street fence stops at observed Y30 context. Meeting room shares the tall tower corner, separate only in interior use from Sales.');
s.kerb=c.kerb;s.cameraMetadataWarning=c.cameraMetadataWarning;s.existingInventory=c.preserveExisting;
s.limitations=s.limitations.filter(q=>!q.startsWith('Street View is historical'));
s.limitations.push('Owner confirms current relative positions and 3 MB + 2 Thai flag count; ALL metric coordinates, heights, curve radius and levels remain photo-fit assumptions. One detail screenshot is October 2023, not June 2024.');
d.revision='v09';d.exterior=JSON.parse(fs.readFileSync(path.join(root,'assets/exterior-proposal.json'),'utf8'));d.defaultExteriorScheme='proposed';
d.iteration='r4';d.exterior.workshopStudy=s.workshopStudy;
// v11 review adoption: appearance is observed from the supplied 12 Sep showroom
// photographs, not a live stock feed or manufacturer CAD. Preserve planning boxes.
d.mbVehicles=[
 {id:'MB1',model:'Mercedes-Benz GLS',bodyStyle:'gls',paint:'#11171b',photoReference:'Showroom 260912 / 3',familyConfirmed:true},
 {id:'MB2',model:'Mercedes-Benz GLC',bodyStyle:'glc',paint:'#eeeFEb',photoReference:'Showroom 260912 / 3',familyConfirmed:true},
 {id:'MB3',model:'Mercedes-Benz E-Class',bodyStyle:'e-class',paint:'#eceeea',photoReference:'Showroom 260912 / 1,4',familyConfirmed:true},
 {id:'MB4',model:'Mercedes-Benz GLC',bodyStyle:'glc-sport',paint:'#f0f0eb',photoReference:'Showroom 260912 / 2,4',familyConfirmed:true},
 {id:'MB5',model:'Mercedes-Benz C-Class',bodyStyle:'c-class',paint:'#252a2e',photoReference:'Showroom 260912 / 8',familyConfirmed:true},
 {id:'MB6',model:'Mercedes-AMG coupe · exact family unconfirmed',bodyStyle:'amg-coupe',paint:'#101419',photoReference:'Showroom 260912 / 6,9',familyConfirmed:false}
];
d.vehicleAppearanceStatus='Photographed vehicle appearances; MB slot assignment is illustrative, not original photo order. Model year/trim unverified. 5.20 × 2.10 m planning envelopes retained, not physical vehicle specifications.';
d.decorativePlanters=[{x:25.15,y:10.05,radius:.30,height:.90,foliageRadius:.50},{x:26,y:10.7,radius:.30,height:.68,foliageRadius:.50},{x:33,y:15.35,radius:.30,height:.90,foliageRadius:.50},{x:33.72,y:15.35,radius:.30,height:.68,foliageRadius:.50}];
for(const state of d.states){
 const smartDesk=state.furniture.find(q=>q.id==='SC');
 Object.assign(smartDesk,{shape:'rectangular-slab-ended',round:false,finish:'pale wood',tableHeight:.766,source:'D01 Requirement summary for SMART Shop in Shop V3, PDF p20, legend7 and Module3B bill; p21 inset',dimensionStatus:'0.85 x1.60m and height are visual proxies; source gives desk type and chair count, not manufacturing dimensions',fidelityNote:'Rectangular consult desk with two full-width slab short-end supports; one advisor opposite two customers. Not a round cafe table or central pedestal. Owner requested recheck15Sep2026.'});
 for(const car of state.cars.filter(q=>q.brand==='MB'))Object.assign(car,d.mbVehicles.find(q=>q.id===car.id));
 const mb5=state.cars.find(q=>q.id==='MB5');Object.assign(mb5,{cx:28.2,cy:6.9,angle:-90,frontCentre:[28.2,4.3],clearanceStatus:'Owner review adopted: centred to entrance, adjusted setback. Door line gap1.80m; rear circulation and swept paths remain HOLD pending measured door swing and full route validation.'});
 for(const car of state.cars.filter(q=>q.brand==='MB')){
  let stand=state.furniture.find(q=>q.id===car.id+'-EP');
  if(!stand){stand={id:car.id+'-EP',type:'price-stand',w:.35,h:.35,zone:'MB-price',retained:false};state.furniture.push(stand);}
  const a=car.angle*Math.PI/180,forward=[Math.cos(a),Math.sin(a)],right=[Math.sin(a),-Math.cos(a)],long=car.l/2-.30,side=car.w/2+stand.w/2+.15;
  Object.assign(stand,{cx:+(car.cx+forward[0]*long+right[0]*side).toFixed(4),cy:+(car.cy+forward[1]*long+right[1]*side).toFixed(4),angle:car.angle,relocated:true,placement:'Driver right / RHD; centre 0.30m behind front; base edge0.15m outside planning vehicle envelope',note:'Owner review adopted; verify actual stand and door clearances'});
  if(/^MB[1-5]$/.test(car.id)){
   const axle=measureFrontAxle(car),offset=axle.frontAxleOffset,modelTyreGap=side-stand.h/2-axle.rightFrontTyreOuterOffset;
   if(!(modelTyreGap>0&&modelTyreGap<.30))throw Error(car.id+' model front-tyre-to-base lateral gap must be positive and below0.30m');
   Object.assign(stand,{cx:+(car.cx+forward[0]*offset+right[0]*side).toFixed(9),cy:+(car.cy+forward[1]*offset+right[1]*side).toFixed(9),angle:car.angle+90,
    placement:'Driver right / RHD; next to actual model front tyre; sign face points in vehicle-front direction; base edge0.15m outside planning vehicle envelope',
    alignment:{...axle,reference:'front-right-tyre',signFace:'vehicle-front',vehicleAngle:car.angle,planningEnvelopeGap:.15,modelTyreGap,
     manual:'RetailManual Vol2 Application Rules v2023: AD01 PDF190 / printed189; adjacent to front tyre, orientation parallel to vehicle main axis, lateral gap <30cm',
     ownerConfirmation:'15 September 2026: MB1–MB5 next to front right tyre; sign faces same direction as car front',
     supersedes:'Earlier approximate0.30m setback from vehicle front for MB1–MB5 only; MB6 unchanged',
     mainVisitorPathVerified:false,doorOpeningVerified:false,supplierFootprintVerified:false},
    note:'Owner-confirmed position and facing; verify actual stand and door clearances. Main visitor path and supplier stand footprint remain coordination items, not approved compliance.'});
  }
  delete stand.corners;
 }
 for(const q of state.furniture){if(q.type==='plant'||q.type==='planter'){if(Math.abs(q.cx-25.8)<.001&&Math.abs(q.cy-10.7)<.001){q.cx=25.15;q.cy=10.05;}else if(Math.abs(q.cx-26.55)<.001&&Math.abs(q.cy-10.7)<.001){q.cx=26;q.cy=10.7;}}}
 const arrival=state.people.find(q=>q.id==='arrival');if(arrival)Object.assign(arrival,{x:30.65,y:4.9});
 const specialist=state.people.find(q=>q.id==='handover-specialist');if(specialist)Object.assign(specialist,{x:34.6,y:7.25});
 const client=state.people.find(q=>q.id==='handover-client');if(client)Object.assign(client,{x:35.75,y:7.15});
 state.serviceAccessReserve={x:29.6,y:8,w:2.4,h:8,status:'Concept route east of relocated MB5; column/door projections and continuous accessible/egress width not certified'};
 state.routes=state.routes.filter(q=>!['entrance-east-service','service-approach-pedestrian'].includes(q.id));
 state.routes.push({id:'entrance-east-service',path:[[28.2,2.5],[28.2,3.25],[30.5,3.25],[30.5,10.2],[30.5,15.2]],planningWidth:1,status:'Concept east pedestrian route around MB5; actual door sweep and egress/accessibility validation pending'},
 {id:'mb5-rear-pedestrian',path:[[24,8.8],[26.15,9],[26.75,9.92],[27.4,10.2],[30.5,10.2]],planningWidth:1,status:'Illustrative rear route; conservative foliage pinch approx1.16m. Not a vehicle path or certified egress route'});
}
for(const q of s.existingInventory){
 if(q.id==='FACADE-MB')Object.assign(q,{xy:[4.05,-.22],width:7.55,textHeight:.93,centreHeight:3.85,positionStatus:'first glazed bay, near-frontal June2024 Street View checked13Sep2026; metric photo-fit only',typography:'raised serif lettering silhouette on continuous black concrete beam; supplier vector pending'});
 if(q.id==='FACADE-DEALER')Object.assign(q,{xy:[20,-.22],width:7.35,textHeight:.72,centreHeight:3.85,positionStatus:'third glazed bay before canopy, June2024 Street View checked13Sep2026; metric photo-fit only',typography:'raised sans-serif dealer lettering silhouette on continuous black concrete beam'});
}
d.reviewAdoptions={revision:'v11',ownerReviewDate:'2026-09-13',mb5:'Front-centre interpretation, aligned to entrance centreX28.2 with setback adjusted toY4.3',priceStands:'15Sep2026: MB1–MB5 at actual fitted front-right tyre, sign faces vehicle front; supersedes former0.30m nose setback for these five only. MB6 handover retains prior RHD front-right0.30m setback and facing. AD01 visitor-path, open-door and supplier-footprint coordination remain unverified.',status:'Adopted in model; not compliance approval'};
s.exteriorParking={...JSON.parse(fs.readFileSync(path.join(root,'assets/parking-photo-fit.json'),'utf8')),level:s.levels.forecourt};
d.limitations=d.limitations.map(q=>q.startsWith('MB5 circulation HOLD')?'MB5 owner relocation adopted; actual door swing, rear passage and vehicle swept path remain HOLD':q);
d.feedbackPolicy={submissionEnabled:true,reason:'Live backend must explicitly support v11 section, image/plan/model and point/rectangle contracts. Each review retains its section, reference, state and metric plan location; receipt verification is required.'};
d.limitations=d.limitations.filter(q=>!q.startsWith('Street View is historical'));
d.limitations.push('v09 separates reconstructed existing exterior from proposed smart additions. Proposed items are not compliance, engineering or supplier approvals.');
require('./apply-owner-review-v12.cjs')(d,JSON.parse(fs.readFileSync(path.join(root,'assets/owner-review-v12.json'),'utf8')));
fs.writeFileSync(path.join(root,'assets/site-context.json'),JSON.stringify(s,null,2)+'\n');
fs.writeFileSync(path.join(root,'assets/parking-photo-fit.json'),JSON.stringify(s.exteriorParking,null,2)+'\n');
fs.writeFileSync(path.join(root,'assets/workshop-study.json'),JSON.stringify(s.workshopStudy,null,2)+'\n');
fs.writeFileSync(path.join(root,'assets/exterior-proposal.json'),JSON.stringify(d.exterior,null,2)+'\n');
fs.writeFileSync(path.join(root,'layout.js'),'/* v09-r6 / v12 owner review adoption; v11 comment contract and archived coordinates preserved. */\nwindow.BC_LAYOUT = '+JSON.stringify(d,null,2)+';\n');
console.log('v09 layout generated; existing inventory separated from smart proposal');
