/* Coordination placeholders, NOT surveyed equipment or certified installation. */
window.BC_WORKSHOP_INTERIOR=(T,h,data,annex)=>{
  const {box,planBox,slab,sign,tube,M}=h,g={};
  for(const k of ['baseline','proposed','overhead','guides']){g[k]=new T.Group();g[k].name='WORKSHOP-STUDY-'+k.toUpperCase();g[k].userData={status:data.status,source:data.sources};}
  const floor=annex.floorLevel,green=new T.MeshStandardMaterial({color:'#b4cc59',roughness:.66}),steel=new T.MeshStandardMaterial({color:'#6c7475',roughness:.55,metalness:.35}),mat=new T.MeshStandardMaterial({color:'#48504c',roughness:.95}),paint=new T.MeshStandardMaterial({color:'#d4d9d1',roughness:.9}),light=new T.MeshStandardMaterial({color:'#f2f4e9',emissive:'#eef0e4',emissiveIntensity:.45});
  function mark(text,x,y,width,parent=g.guides,bg='#344a50'){const o=sign(text,x,floor+.034,-y,width,.42,0,parent,'#f3f5ed',bg);o.rotation.x=-Math.PI/2;return o;}
  function line(x0,y0,x1,y1,parent=g.baseline,colour=paint){const o=box((x0+x1)/2,floor+.018,-(y0+y1)/2,Math.hypot(x1-x0,y1-y0),.014,.06,colour,parent);o.rotation.y=Math.atan2(y1-y0,x1-x0);return o;}
  const owner=data.ownerLayout;
  // D01 PDF27 / item26 is a visual reference, not approved supplier artwork.
  // Row40 replaces the old Thai HV wall plaque; row41 adds an M/E plaque to
  // the existing empty service workbay, without changing its floor or equipment.
  const ownerSigns=data.ownerCommentSignage??[];
  function ownerStationSign(q){
    const [x,y]=q.xy,gr=new T.Group();gr.name=q.id;gr.position.set(x,q.height,-y);gr.rotation.y=q.rotationRadians??0;
    gr.userData={...q,kind:'owner-workshop-station-sign',heightDatum:'world-centre elevation',artworkStatus:'Schematic redraw of D01 PDF27 / item26; approved smart artwork, fonts, coating and mounting details required',supplierApproved:false,referenceThickness:.01};g.proposed.add(gr);
    const c=document.createElement('canvas');c.width=2000;c.height=560;const ctx=c.getContext('2d');ctx.scale(2,2);
    const black='#050505',lime='#c7da35',white='#ffffff';ctx.fillStyle=black;ctx.fillRect(0,0,1000,280);ctx.fillStyle=lime;ctx.fillRect(0,272,1000,8);
    // Rounded icon frame follows the reference composition; it is not an asset extraction.
    ctx.strokeStyle=lime;ctx.lineWidth=6;ctx.lineJoin='round';ctx.beginPath();ctx.moveTo(113,48);ctx.lineTo(251,48);ctx.quadraticCurveTo(269,48,269,66);ctx.lineTo(269,216);ctx.quadraticCurveTo(269,234,251,234);ctx.lineTo(113,234);ctx.quadraticCurveTo(95,234,95,216);ctx.lineTo(95,66);ctx.quadraticCurveTo(95,48,113,48);ctx.closePath();ctx.stroke();
    ctx.fillStyle=lime;
    if(q.station==='HV'){
      ctx.beginPath();[[170,71],[218,71],[195,126],[224,126],[157,213],[171,151],[143,151]].forEach(([px,py],i)=>i?ctx.lineTo(px,py):ctx.moveTo(px,py));ctx.closePath();ctx.fill();
    }else if(q.station==='M/E'){
      // Crossed spanner and screwdriver, distinct from the HV lightning icon.
      ctx.lineCap='round';ctx.lineWidth=19;ctx.beginPath();ctx.moveTo(153,111);ctx.lineTo(222,192);ctx.stroke();
      ctx.beginPath();[[122,78],[137,76],[144,93],[158,94],[164,82],[157,67],[175,74],[184,89],[181,109],[166,123],[146,121],[130,107]].forEach(([px,py],i)=>i?ctx.lineTo(px,py):ctx.moveTo(px,py));ctx.closePath();ctx.fill();
      ctx.lineWidth=9;ctx.beginPath();ctx.moveTo(159,172);ctx.lineTo(211,103);ctx.stroke();ctx.lineWidth=22;ctx.beginPath();ctx.moveTo(148,188);ctx.lineTo(174,154);ctx.stroke();
      ctx.beginPath();[[205,100],[219,76],[230,84],[216,107]].forEach(([px,py],i)=>i?ctx.lineTo(px,py):ctx.moveTo(px,py));ctx.closePath();ctx.fill();
    }
    ctx.fillStyle=white;ctx.font='500 76px Arial';ctx.textAlign='left';ctx.textBaseline='middle';ctx.fillText(q.label,323,143,642);
    const tx=new T.CanvasTexture(c);tx.colorSpace=T.SRGBColorSpace;
    const body=box(0,0,0,q.width,q.signHeight,.01,new T.MeshStandardMaterial({color:black,roughness:.75}),gr);body.name=q.id+'-10MM-REFERENCE-BODY';
    const face=new T.Mesh(new T.PlaneGeometry(q.width,q.signHeight),new T.MeshBasicMaterial({map:tx,toneMapped:false}));face.position.z=.0055;face.name=q.id+'-ENGLISH-CI-REFERENCE-FACE';gr.add(face);
    // Only draw a suspended connection when a canonical top elevation exists.
    // Wall fixings and unknown hanging attachment points are not invented.
    if(q.mount==='hanging'&&Number.isFinite(q.suspensionTopHeight)&&q.suspensionTopHeight>q.height+q.signHeight/2){
      for(const dx of [-q.width*.30,q.width*.30]){const hanger=tube([dx,q.signHeight/2,0],[dx,q.suspensionTopHeight-q.height,0],.003,steel,gr);hanger.name=q.id+'-SUSPENSION-PROXY';}
    }
    gr.userData.mountingGeometryVerified=false;
  }
  for(const q of ownerSigns)ownerStationSign(q);
  function physicalLift(q,parent){
    const [cx,cy]=q.centre,gr=new T.Group();gr.name=q.id;gr.userData={kind:'physical-lift',equipmentType:q.kind,physicalStationId:q.id,stationDesignation:q.designation??null,stationRole:q.role??null,roleStatus:q.roleStatus??'Owner station label; not equipment certification',physicalKindStatus:q.physicalKindStatus??null,status:q.status,supplier:null,equipmentDimensionsVerified:false};parent.add(gr);
    const part=(name,x,y,w,d,height,base,material=steel)=>{const o=planBox(x,y,w,d,height,material,base,gr);o.name=q.id+'-'+name;return o;};
    if(q.kind==='two-post')for(const side of [-1,1]){const x=cx+side*1.25;part('post-'+side,x,cy,.26,.32,2.85,floor);part('base-'+side,x,cy,.55,.65,.10,floor);part('carriage-'+side,x,cy,.28,.35,.28,floor+1.7);for(const dy of [-.85,.85]){const arm=part('arm-'+side+'-'+dy,(cx+x)/2,cy+dy,.95,.13,.10,floor+.24);arm.rotation.y=-side*.2;}}
    else if(q.kind==='four-post'){for(const dx of [-1.25,1.25])for(const dy of [-2.2,2.2])part('post-'+dx+'-'+dy,cx+dx,cy+dy,.22,.22,2.4,floor);for(const dx of [-.78,.78])part('runway-'+dx,cx+dx,cy,.52,4.8,.15,floor+.20);for(const dy of [-2.2,2.2])part('crossbeam-'+dy,cx,cy+dy,2.5,.20,.18,floor+.16);if(q.function==='wheel-alignment'){for(const dx of [-.78,.78])part('alignment-turnplate-'+dx,cx+dx,cy-1.45,.52,.55,.035,floor+.35,M.dark);gr.userData.function=q.function;}}
    else if(q.kind==='wheel-alignment'){for(const dx of [-.78,.78]){part('alignment-runway-'+dx,cx+dx,cy,.60,4.8,.16,floor+.16);part('turnplate-'+dx,cx+dx,cy-1.45,.55,.55,.035,floor+.32,M.dark);}gr.userData.mechanism='unspecified; low-runway symbol, not supplier mechanism';}
    else throw Error('Unknown workshop equipment type');
    const [x0,y0,x1,y1]=q.allocation;line(x0,y0,x0,y1,parent);line(x1,y0,x1,y1,parent);
    const generic=q.kind==='two-post'?'2-POST':q.kind==='four-post'?'4-POST':'ALIGNMENT';
    mark(q.designation||generic,cx,y0+.38,3.5);
    if(q.role)mark(q.role,cx,y0+.86,3.7);
    return gr;
  }
  for(const q of owner.equipment.ownerExisting)physicalLift(q,g.baseline);
  for(const q of owner.equipment.proposedAdditional)physicalLift(q,g.proposed);
  for(const b of data.smartBays.filter(b=>owner.smartOverlays.some(q=>q.id===b.id))){const bg=new T.Group();bg.name=b.id;bg.userData={...b,status:data.status,clearanceApproved:false};g.proposed.add(bg);const cx=(b.xMin+b.xMax)/2,cy=(b.yMin+b.yMax)/2;
    slab([[b.xMin+.06,b.yMin+.06],[b.xMax-.06,b.yMin+.06],[b.xMax-.06,b.yMax-.08],[b.xMin+.06,b.yMax-.08]],floor+.006,.01,new T.MeshStandardMaterial({color:b.type==='HV'?'#82917b':'#8a9490',roughness:.96}),bg);
    line(b.xMin,b.yMin,b.xMax,b.yMin,bg,green);line(b.xMin,b.yMin,b.xMin,b.yMax,bg,green);line(b.xMax,b.yMin,b.xMax,b.yMax,bg,green);
    const use=owner.smartOverlays.find(q=>q.id===b.id);bg.userData.physicalLiftRef=use.physicalLiftRef;bg.userData.useStatus=use.status;mark(b.label,cx,b.yMin+.45,3.7,bg,'#273331');
    if(!ownerSigns.some(q=>q.station===b.type)){const s=sign(b.type==='HV'?'HV · ช่องงานแรงดันสูง':'M/E · ช่องงานทั่วไป',cx,3.0,-(b.yMax-.15),3.6,.35,0,bg,'#d7e797','#202826');s.name=b.id+'-LOCAL-LANGUAGE-SIGN-STUDY';}
    if(b.type==='HV'){
      const matProxy=planBox(cx,cy-.25,2.7,3.6,.014,mat,floor+.02,bg);matProxy.name='HV-INSULATING-MAT-PLACEHOLDER';matProxy.userData=data.hvProtection;
      // Illustrative barrier with access opening; no safety dimension is certified.
      for(const x of [b.xMin+.22,b.xMax-.22])for(const y of [b.yMin+.35,cy,b.yMax-.25]){planBox(x,y,.065,.065,1.0,green,floor,bg);}
      for(const x of [b.xMin+.22,b.xMax-.22])for(const ht of [.48,.96])tube([x,floor+ht,-(b.yMin+.35)],[x,floor+ht,-(b.yMax-.25)],.024,green,bg);
    }
  }
  // The owner confirms a marked EMPTY service workbay, not an extra M/E hoist.
  const service=owner.smartServiceWorkbay;
  if(service){const empty=new T.Group();empty.name=service.id;empty.userData={...service,kind:'floor-marking-only-workbay'};g.proposed.add(empty);const [x0,y0,x1,y1]=service.bounds,orange=new T.MeshStandardMaterial({color:'#df8c42',roughness:.9});for(const [a,b] of [[[x0,y0],[x1,y0]],[[x1,y0],[x1,y1]],[[x1,y1],[x0,y1]],[[x0,y1],[x0,y0]]])line(...a,...b,empty,orange);mark('smart SERVICE · EMPTY WORKBAY',(x0+x1)/2,y0+.45,x1-x0-.25,empty,'#805229');}
  // Three simple location proxies here. CH-SHOWROOM reuses the existing
  // SHARED-EV model in scene.js; never duplicate it as a fifth charger.
  for(const q of owner.chargingPoints??[]){if(q.id==='CH-SHOWROOM')continue;const [x,y]=q.centre,cg=new T.Group();cg.name=q.id;cg.position.set(x,q.floorLevel,-y);cg.userData={...q,kind:'owner-charging-location-proxy',hardwareSpecified:false,electricalApproval:false};g.proposed.add(cg);const body=planBox(0,0,.28,.22,1.05,M.white,0,cg);body.name=q.id+'-GENERIC-LOCATION-PROXY';body.userData={isSpecifiedCharger:false,status:q.status};const direction=q.faceDirection==='positive-y'?1:-1,face=planBox(0,direction*.12,.17,.025,.20,M.dark,.69,cg);face.name=q.id+'-GENERIC-FACE';const label=sign('EV · HARDWARE TBC',0,.025,-direction*.45,2.25,.30,0,cg,'#f3f5ed','#344a50');label.rotation.x=-Math.PI/2;}
  // Shared general tools and dedicated smart diagnostic / special-tool placeholders.
  for(const [name,x,y,colour] of [['GENERAL TOOLS · SHARED MB',5.7,24.2,steel],['smart SPECIAL TOOLS',5.7,26.1,green]]){
    planBox(x,y,1.25,.65,1.02,colour,floor,g.proposed);for(const z of [.28,.54,.8])planBox(x,y-.333,1.08,.025,.025,M.dark,floor+z,g.proposed);mark(name,x,y-1.1,4,g.proposed);
  }
  for(const [name,y,colour] of [['MB PARTS',37.1,steel],['smart PARTS',39.7,green]]){
    for(const x of [3.2,6.5]){for(const dx of [-.5,.5])planBox(x+dx,y,.065,.065,2.2,steel,floor,g.proposed);for(const z of [.2,.75,1.3,1.85]){planBox(x,y,1.1,1.8,.07,colour,floor+z,g.proposed);for(const dy of [-.5,.3])planBox(x,y+dy,.6,.48,.32,M.white,floor+z+.07,g.proposed);}}
    mark(name,4.8,y,2.5,g.proposed);
  }
  const sr=data.serviceReception;
  slab([[sr.xMin,sr.yMin],[sr.xMax,sr.yMin],[sr.xMax,sr.yMax],[sr.xMin,sr.yMax]],floor,.3,M.stone,g.baseline);
  // Owner rectangles establish programme, not surveyed walls, doors or AC.
  function reservation(q,text,colour){const [x0,y0,x1,y1]=q.bounds,outline=new T.Group();outline.name=q.id;outline.userData={...q,kind:'owner-reservation',isPhysicalWall:false};g.guides.add(outline);const ink=new T.MeshBasicMaterial({color:colour,depthTest:false});for(const [a,b] of [[[x0,y0],[x1,y0]],[[x1,y0],[x1,y1]],[[x1,y1],[x0,y1]],[[x0,y1],[x0,y0]]])line(...a,...b,outline,ink);const label=mark(text,(x0+x1)/2,(y0+y1)/2,Math.min(7,x1-x0),outline);label.material.depthTest=false;label.renderOrder=10;}
  reservation(owner.reservations.walkway,'ทางเดิน · WALKWAY','#6f9da2');
  reservation(owner.reservations.csOffice,'Customer Service Office','#6f9da2');
  const csParking=owner.reservations.parking.find(q=>q.id==='OWNER-R27-P1');
  reservation(csParking,(csParking.code||'MB-S03')+' · PARKING','#eeeeea');
  const csPaint=new T.Group();csPaint.name='CUSTOMER-SERVICE-PARKING-PAINT';csPaint.userData={kind:'owner-requested-parking-paint',count:1,capacityCertified:false};g.baseline.add(csPaint);
  const [px0,py0,px1,py1]=owner.reservations.parking.find(q=>q.id==='OWNER-R27-P1').bounds;
  for(const [a,b] of [[[px0,py0],[px1,py0]],[[px1,py0],[px1,py1]],[[px1,py1],[px0,py1]],[[px0,py1],[px0,py0]]])line(...a,...b,csPaint);
  mark('DIAGNOSIS · ตำแหน่งรอยืนยัน',6,29.4,6);
  // Fixture proxies follow LP32 orientation; no photometric calculation implied.
  for(let x=9;x<40;x+=4)for(const y of [25.25,38.75]){const o=planBox(x,y,.11,5.8,.06,light,4.7,g.overhead);o.name='LP32-LINEAR-LIGHT-PROXY';}
  mark('CENTRAL AISLE · GRID B–C 7.00m · SWEPT PATH TBC',24,32,22);
  mark('EXISTING: 8 TWO-POST + 2 FOUR-POST = 10 LIFTS',20,20.2,22);
  g.baseline.userData.ownerPhysicalLiftCount=owner.equipment.ownerExisting.length;g.proposed.userData.additionalPhysicalLiftCount=owner.equipment.proposedAdditional.length;
  g.guides.userData.ownerAnnotationResolutions=owner.ownerAnnotationResolutions??null;
  for(const [name,y] of [['A',42],['B',35.5],['C',28.5],['D',22],['E',16]])mark(name+' · '+y.toFixed(2),-1.1,y,2);
  return g;
};
