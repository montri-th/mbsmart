/* Existing built context. Programme/attachment owner-confirmed, dimensions photo-fit.
 * Functional architectural geometry only; no source imagery or invented equipment.
 */
window.BC_BUILDING_ANNEXES=(T,h,data)=>{
  const {mesh,box,planBox,tube,slab,sign,M}=h;
  const groups={};for(const k of ['meeting','meetingRoof','workshop','workshopRoof','guides'])groups[k]=new T.Group();
  const {meeting,meetingRoof,workshop,workshopRoof,guides}=groups;
  meeting.name=data.meeting.id;meeting.userData={...data.meeting,notSalesArea:true};meetingRoof.name='SOUTH-MEETING-UPPER-SHELL';
  workshop.name=data.workshop.id;workshop.userData=data.workshop;workshopRoof.name='WORKSHOP-ROOF-AND-AWNING';guides.name='ANNEX-REVIEW-GUIDES';
  const metal=new T.MeshStandardMaterial({color:'#cecfc3',roughness:.62,metalness:.32});
  const blue=new T.MeshPhysicalMaterial({color:'#437c93',roughness:.22,metalness:.28,clearcoat:.7});
  const concrete=new T.MeshStandardMaterial({color:'#999c96',roughness:.88});
  const lineMat=new T.MeshStandardMaterial({color:'#7d8683',roughness:.62,metalness:.45});
  const batch=[],dummy=new T.Object3D();
  function rib(x,z,y,w,ht,d){dummy.position.set(x,z,-y);dummy.scale.set(w,ht,d);dummy.rotation.set(0,0,0);dummy.updateMatrix();batch.push(dummy.matrix.clone());}
  function wall(a,b,base,height,mat,group,thickness=.09){const len=Math.hypot(b[0]-a[0],b[1]-a[1]),o=box((a[0]+b[0])/2,base+height/2,-(a[1]+b[1])/2,len,height,thickness,mat,group);o.rotation.y=Math.atan2(b[1]-a[1],b[0]-a[0]);return o;}
  function surface(pts,mat,group){const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(pts.flatMap(p=>[p[0],p[2],-p[1]]),3));const idx=[];for(let i=1;i<pts.length-1;i++)idx.push(0,i,i+1);geo.setIndex(idx);geo.computeVertexNormals();const m=mat.clone();m.side=T.DoubleSide;return mesh(geo,m,group);}
  const r=data.meeting,a=r.frontArc,arc=Array.from({length:a.segments+1},(_,i)=>{const t=a.startRadians+(a.endRadians-a.startRadians)*i/a.segments;return [a.center[0]+a.radius*Math.cos(t),a.center[1]+a.radius*Math.sin(t)];});
  const outline=[...arc,...r.rearPoints];meeting.userData.renderedFootprint=outline;
  slab(outline,-.8,.68,M.column,meeting);slab(outline,-.12,.12,M.stone,meeting);
  // Curved glazing and tapered external side; shared X0 edge is a room partition.
  const external=[...r.rearPoints.slice(1),...arc];
  for(let i=0;i<external.length-1;i++){
    wall(external[i],external[i+1],.12,r.ceilingHeight-.12,M.glass,meeting,.024);
    for(const z of [.06,3.16])wall(external[i],external[i+1],z,.06,M.steel,meeting,.055);
    if(i<2||i%4===0)planBox(...external[i],.04,.04,3.2,M.dark,0,meeting);
    wall(external[i],external[i+1],3.2,.85,M.column,meetingRoof,.15);
    wall(external[i],external[i+1],4.05,1.45,blue,meetingRoof,.035);
    wall(external[i],external[i+1],5.5,1.7,M.column,meetingRoof,.16);
  }
  wall([0,8],r.rearPoints[1],0,3.2,M.white,meeting);
  for(const [y0,y1] of [[0,6.2],[7.3,8]])wall([0,y0],[0,y1],0,3.2,M.white,meeting);
  // Door remains a glazed leaf in a separate room, not an open continuation of Sales.
  wall([0,6.2],[0,7.3],0,2.4,M.glass,meeting,.028);wall([0,6.2],[0,7.3],2.4,.8,M.white,meeting);
  tube([.035,1,-6.45],[.035,1.3,-6.45],.018,M.steel,meeting);
  slab(outline,3.2,.12,M.white,meetingRoof);
  meetingRoof.userData={partOf:'CONTINUOUS-TALL-TOWER',masterCorner:r.masterTowerCorner,independentPodRoof:false};
  planBox(-1.85,2.55,1.15,2.55,.07,M.wood,.72,meeting);
  for(const y of [1.52,3.58])planBox(-1.85,y,.12,.12,.72,M.steel,0,meeting);
  for(const x of [-2.95,-.75])for(const y of [1.55,2.55,3.55]){
    planBox(x,y,.52,.55,.09,M.upholstery,.42,meeting);
    planBox(x+(x<-1.8?-.24:.24),y,.08,.55,.47,M.upholstery,.48,meeting);
    for(const dx of [-.19,.19])for(const dy of [-.2,.2])planBox(x+dx,y+dy,.028,.028,.42,M.steel,0,meeting);
  }
  const w=data.workshop,f=w.footprint,x0=f.xMin,x1=f.xMax,y0=f.yMin,y1=f.yMax,ry=w.ridgeY,aw=w.awning;
  // The roadside shell is independent of the retained operational grid and rear
  // parking canopy. Y limits/member sizes are photo-fit, not surveyed dimensions.
  const side=w.roadsideShell?.enabled?w.roadsideShell:null,rm=w.roadsideMasonry?.enabled?w.roadsideMasonry:null;
  const roofLevelAt=y=>y<=ry?w.eavesHeight+(w.ridgeHeight-w.eavesHeight)*(y-y0)/(ry-y0):w.ridgeHeight+(w.eavesHeight-w.ridgeHeight)*(y-ry)/(y1-ry);
  const sideX=y=>side&&y>=side.yMin&&y<=side.yMax?side.xMax:x1;
  slab(w.gridEnvelope,w.floorLevel-.14,.14,concrete,workshop);
  const westX=y=>y<=28.5?0:y<=35.5?(y-28.5)/7*1.11:1.11+(y-35.5)/6.5*.91;
  // Attached rear interface, not a detached pavilion. Unobserved interior left unprogrammed.
  for(const right of [false,true]){
    const xp=y=>right?sideX(y):westX(y),breaks=[...new Set([y0,22,28.5,35.5,y1,...(right&&side?[side.yMin,side.yMax]:[])])].sort((a,b)=>a-b);
    for(let i=1;i<breaks.length;i++){
      const ya=breaks[i-1],yb=breaks[i],outer=right&&side&&(ya+yb)/2>=side.yMin&&(ya+yb)/2<=side.yMax,xa=right?(outer?side.xMax:x1):westX(ya),xb=right?xa:westX(yb);
      if(!outer)wall([xa,ya],[xb,yb],w.floorLevel,1,concrete,workshop,.16);
      wall([xa,ya],[xb,yb],3.55,w.eavesHeight-3.55,metal,workshop,.16);
    }
    if(right&&side){
      for(const [ya,yb,x] of [[y0,side.yMin,x1],[side.yMin,side.yMax,side.xMax],[side.yMax,y1,x1]]){
        if(yb-ya<1e-6)continue;
        const ys=[ya,...(ry>ya&&ry<yb?[ry]:[]),yb],pts=[[x,ya,w.eavesHeight],...ys.map(y=>[x,y,roofLevelAt(y)]),[x,yb,w.eavesHeight]];
        surface(pts,metal,workshopRoof);
      }
    }else surface([[xp(y0),y0,w.eavesHeight],[xp(ry),ry,w.ridgeHeight],[xp(y1),y1,w.eavesHeight]],metal,workshopRoof);
    // Retain the former side column line as internal structure; do not move bays.
    for(const y of [y0,22,28.5,35.5,y1])planBox(right?x1:westX(y),y,.19,.19,4.4,M.steel,w.floorLevel,workshop);
    for(let y=y0;y<y1;y+=.7)for(let z=3.65;z<w.eavesHeight;z+=.23)rib(xp(y+.35),z,y+.35,.22,.028,.68);
    for(let y=y0+2;y<y1-2;y+=6){planBox(xp(y)+.012,y,.19,3.5,.48,blue,4.55,workshop);for(const yy of [y-1.75,y,y+1.75])planBox(xp(yy)+.016,yy,.23,.035,.56,M.steel,4.51,workshop);}
    // Ventilated lower bays; not solid storage or invented service equipment.
    for(let y=y0+.3;y<y1;y+=.38)if(!(right&&side&&y>=side.yMin&&y<=side.yMax))rib(xp(y),1.9,y,.055,2.45,.018);
    for(let y=y0;y<y1;y+=.7)if(!(right&&side&&y+.35>=side.yMin&&y+.35<=side.yMax))for(const z of [.6,1.1,1.6,2.1,2.6,3.1])rib(xp(y+.35),z,y+.35,.055,.02,.68);
  }
  wall([westX(y1),y1],[x1,y1],w.floorLevel,w.eavesHeight-w.floorLevel,metal,workshop);
  for(const [ya,yb,za,zb] of [[y0,ry,w.eavesHeight,w.ridgeHeight],[ry,y1,w.ridgeHeight,w.eavesHeight]]){
    const core=surface([[westX(ya),ya,za],[x1,ya,za],[x1,yb,zb],[westX(yb),yb,zb]],metal,workshopRoof);core.name='WORKSHOP-CORE-ROOF-'+ya+'-'+yb;core.userData={operationalGridUnchanged:true,bounds:[westX(ya),ya,x1,yb]};
    for(let x=Math.max(westX(ya),westX(yb));x<=x1;x+=.65)tube([x,za+.012,-ya],[x,zb+.012,-yb],.018,lineMat,workshopRoof);
  }
  if(side){
    const extension=new T.Group(),structure=new T.Group();extension.name='WORKSHOP-ROADSIDE-ROOF-EXTENSION';structure.name='WORKSHOP-ROADSIDE-STRUCTURE';workshopRoof.add(extension);workshop.add(structure);
    extension.userData={...side,kind:'main-roof-side-extension',operationalFootprintChanged:false,rearCanopyChanged:false,dimensionsMeasured:false};structure.userData={...side,painted:false,dimensionsMeasured:false};
    const cuts=[side.yMin,...(ry>side.yMin&&ry<side.yMax?[ry]:[]),side.yMax];
    for(let i=1;i<cuts.length;i++){
      const ya=cuts[i-1],yb=cuts[i],za=roofLevelAt(ya),zb=roofLevelAt(yb),roof=surface([[x1,ya,za],[side.xMax,ya,za],[side.xMax,yb,zb],[x1,yb,zb]],metal,extension);roof.name='WORKSHOP-ROADSIDE-ROOF-'+ya+'-'+yb;
      for(let x=x1+.65;x<=side.xMax;x+=.65)tube([x,za+.012,-ya],[x,zb+.012,-yb],.018,lineMat,extension);
    }
    for(const y of [side.yMin,side.yMax]){
      const end=wall([x1,y],[side.xMax,y],3.55,roofLevelAt(y)-3.55,metal,extension,.16);end.name='WORKSHOP-ROADSIDE-UPPER-RETURN-'+y;
    }
    for(const y of side.columnYs){
      const size=side.columnSize,post=planBox(side.xMax-size/2,y,size,size,w.eavesHeight-w.floorLevel,concrete,w.floorLevel,structure);post.name='WORKSHOP-ROADSIDE-COLUMN-'+y;
      post.userData={kind:'existing-main-roof-column-proxy',painted:false,dimensionsMeasured:false};
      const beam=box((x1+side.xMax)/2,w.eavesHeight-.175,-y,side.xMax-x1,.35,.28,concrete,structure);beam.name='WORKSHOP-ROADSIDE-CROSS-BEAM-'+y;
    }
    wall([side.xMax-side.columnSize/2,side.yMin],[side.xMax-side.columnSize/2,side.yMax],w.eavesHeight-.35,.35,concrete,structure,.28);
  }
  if(rm){
    const masonry=new T.Group();masonry.name='WORKSHOP-ROADSIDE-BREEZE-BLOCK-MASONRY';workshop.add(masonry);
    masonry.userData={...rm,kind:'roadside-boundary-breeze-block-masonry',paintScope:'interior-roadside-masonry-under-main-roof-only',interiorDirection:'plan-negative-X',sharesRoadsideFenceDatum:true,secondInsetWall:false,dimensionsMeasured:false};
    // Box face slots are +X,-X,+Y,-Y,+Z,-Z: paint only the physical inside face.
    // No overlay projects into the workshop or in front of the existing SC1 sign.
    const outside=new T.MeshStandardMaterial({color:rm.exteriorColor,roughness:.92}),inside=new T.MeshStandardMaterial({color:rm.interiorColor,roughness:.92});
    outside.name='ROADSIDE-MASONRY-EXTERIOR-UNCHANGED';inside.name='ROADSIDE-MASONRY-INTERIOR-DARK-GREY';
    const units=[],unit=(ya,yb,za,zb)=>{if(yb-ya<1e-6||zb-za<1e-6)return;dummy.position.set(rm.insideFaceX+rm.thickness/2,(za+zb)/2,-(ya+yb)/2);dummy.scale.set(rm.thickness,zb-za,yb-ya);dummy.rotation.set(0,0,0);dummy.updateMatrix();units.push(dummy.matrix.clone());};
    for(const [ya,yb] of rm.segments){
      unit(ya,yb,rm.baseLevel,rm.solidTop);
      const rows=Math.max(1,Math.round((rm.topLevel-rm.solidTop)/rm.blockHeight)),cols=Math.max(1,Math.round((yb-ya)/rm.blockWidth)),rowHeight=(rm.topLevel-rm.solidTop)/rows,colWidth=(yb-ya)/cols;
      // Short .28 x .08 m slots are an explicit photo-fit default, NOT a measured
      // brick product. Substantial solid faces distinguish masonry from the gate.
      const slotWidth=Math.min(rm.openingWidth??.28,colWidth-rm.web),slotHeight=Math.min(rm.openingHeight??.08,rowHeight-rm.web),horizontalWeb=rowHeight-slotHeight,verticalWeb=colWidth-slotWidth;
      for(let row=0;row<=rows;row++){const z=rm.solidTop+row*rowHeight;unit(ya,yb,Math.max(rm.solidTop,z-horizontalWeb/2),Math.min(rm.topLevel,z+horizontalWeb/2));}
      for(let col=0;col<=cols;col++){const y=ya+col*colWidth;unit(Math.max(ya,y-verticalWeb/2),Math.min(yb,y+verticalWeb/2),rm.solidTop,rm.topLevel);}
    }
    const blocks=new T.InstancedMesh(new T.BoxGeometry(1,1,1),[outside,inside,outside,outside,outside,outside],units.length);units.forEach((matrix,i)=>blocks.setMatrixAt(i,matrix));blocks.instanceMatrix.needsUpdate=true;blocks.castShadow=blocks.receiveShadow=true;blocks.name='WORKSHOP-ROADSIDE-MASONRY-UNITS';blocks.userData={paintedFace:'negative-X-only',insideFaceX:rm.insideFaceX,thicknessDirection:'positive-X-outward',dimensionsMeasured:false};masonry.add(blocks);
  }
  const passageRoof=surface([[aw.xMin,aw.yMin,aw.wallHeight],[aw.xMax,aw.yMin,aw.outerHeight],[aw.xMax,aw.yMax,aw.outerHeight],[aw.xMin,aw.yMax,aw.wallHeight]],metal,workshopRoof);passageRoof.name='WORKSHOP-LOW-CROSS-PASSAGE-CANOPY';passageRoof.userData={...aw,distinctFromMainRoof:true,dimensionsMeasured:false};
  for(let y=aw.yMin;y<=aw.yMax;y+=6){planBox(aw.xMax,y,.09,.09,aw.outerHeight-w.floorLevel,M.steel,w.floorLevel,workshop);tube([aw.xMin,aw.wallHeight,-y],[aw.xMax,aw.outerHeight,-y],.045,M.steel,workshopRoof);}
  wall([aw.xMax,aw.yMin],[aw.xMax,aw.yMax],aw.outerHeight-.14,.23,metal,workshopRoof,.05);
  // Retained lower cross-passage fascia; SC1 stays on the roadside fence datum.
  wall([aw.xMin,aw.yMin],[aw.xMax,aw.yMin],3.18,.36,metal,workshopRoof,.05);
  // Owner daytime photos confirm the low full-length rear parking cover. It is separate
  // from the lower cross-passage canopy; all member sizes and roof levels are visual
  // proxies, not a structural proposal or a measured headroom certificate.
  const rc=w.rearCanopy;
  if(rc?.render){
    const roofGroup=new T.Group(),supports=new T.Group();
    roofGroup.name=rc.id;roofGroup.userData={...rc,kind:'existing-photo-fit-rear-canopy'};workshopRoof.add(roofGroup);
    supports.name=rc.id+'-SUPPORTS';supports.userData={...rc,kind:'existing-photo-fit-rear-canopy-supports'};workshop.add(supports);
    const cover=surface([[rc.xMin,rc.wallY,rc.wallHeight],[rc.xMax,rc.wallY,rc.wallHeight],[rc.xMax,rc.outerY,rc.outerHeight],[rc.xMin,rc.outerY,rc.outerHeight]],metal,roofGroup);cover.name=rc.id+'-ROOF';cover.userData={kind:'continuous-rear-canopy-roof',bounds:[rc.xMin,rc.wallY,rc.xMax,rc.outerY],coveredParkingBounds:rc.coveredParkingBounds};
    const roofLevel=y=>rc.wallHeight+(y-rc.wallY)/(rc.outerY-rc.wallY)*(rc.outerHeight-rc.wallHeight);
    for(const x of rc.supportXs){
      const top=roofLevel(rc.supportY)-rc.trussDepth;
      const post=planBox(x,rc.supportY,.10,.10,top-rc.floorLevel,M.steel,rc.floorLevel,supports);post.name=rc.id+'-POST-X'+x;post.userData={kind:'rear-canopy-post',supportX:x,supportY:rc.supportY,baysPerSpan:rc.supportGrid?.baysPerSpan,measuredDimensions:false};
      const ya=rc.wallY,yb=rc.supportY,za=roofLevel(ya),zb=roofLevel(yb);
      tube([x,za-.04,-ya],[x,zb-.04,-yb],.035,M.steel,roofGroup);
      tube([x,za-rc.trussDepth,-ya],[x,zb-rc.trussDepth,-yb],.035,M.steel,roofGroup);
      for(let i=0;i<6;i++){const a=ya+(yb-ya)*i/6,b=ya+(yb-ya)*(i+1)/6;tube([x,roofLevel(a)-(i%2?rc.trussDepth:.04),-a],[x,roofLevel(b)-(i%2 ? .04 : rc.trussDepth),-b],.021,M.steel,roofGroup);}
    }
    // Continuous frontage chords make the photographed long canopy legible.
    // Their dimensions remain visual proxies; support locations come from the
    // owner-directed canonical grid, independently of the ten painted cells.
    const frontTop=roofLevel(rc.supportY)-.04,frontBottom=roofLevel(rc.supportY)-rc.trussDepth;
    for(const [name,z,radius] of [['TOP',frontTop,.035],['BOTTOM',frontBottom,.045]]){
      const beam=tube([rc.xMin,z,-rc.supportY],[rc.xMax,z,-rc.supportY],radius,M.steel,roofGroup);beam.name=rc.id+'-FRONT-CHORD-'+name;
    }
    for(let j=1;j<rc.supportXs.length;j++){
      const xa=rc.supportXs[j-1],xb=rc.supportXs[j];
      for(let i=0;i<6;i++){const a=xa+(xb-xa)*i/6,b=xa+(xb-xa)*(i+1)/6,brace=tube([a,i%2?frontBottom:frontTop,-rc.supportY],[b,i%2?frontTop:frontBottom,-rc.supportY],.021,M.steel,roofGroup);brace.name=rc.id+'-FRONT-WEB-'+j+'-'+i;}
    }
    for(let x=rc.xMin;x<=rc.xMax;x+=.65)tube([x,rc.wallHeight+.012,-rc.wallY],[x,rc.outerHeight+.012,-rc.outerY],.014,lineMat,roofGroup);
    const fascia=wall([rc.xMin,rc.outerY],[rc.xMax,rc.outerY],rc.outerHeight-.16,.22,metal,roofGroup,.06);fascia.name=rc.id+'-EAVE';
    for(const [side,x] of [['LEFT',rc.xMin],['RIGHT',rc.xMax]]){const edge=surface([[x,rc.wallY,rc.wallHeight-.16],[x,rc.outerY,rc.outerHeight-.16],[x,rc.outerY,rc.outerHeight+.06],[x,rc.wallY,rc.wallHeight+.06]],metal,roofGroup);edge.name=rc.id+'-END-FASCIA-'+side;}
  }
  // Existing steel stair, owner-confirmed in the REAR HALF of the former
  // top-right study cell. Compact return flights are a reversible visual proxy;
  // no new floor, door or certified access dimensions are inferred.
  const rs=w.rearStair;
  if(rs?.render){
    const stair=new T.Group();stair.name=rs.id;stair.userData={...rs,kind:'existing-steel-stair-proxy',isVehicleLift:false};workshop.add(stair);
    const [sx0,sy0,sx1,sy1]=rs.bounds,cx=(sx0+sx1)/2,n=rs.risersPerFlight,pad=.12,lowerY=sy0+pad,turnY=sy1-pad-rs.landingDepth,run=turnY-lowerY,stepDepth=run/n,rise=(rs.upperLandingLevel-rs.floorLevel)/(n*2),mid=rs.floorLevel+n*rise;
    const gap=.20,leftX=cx-(rs.flightWidth+gap)/2,rightX=cx+(rs.flightWidth+gap)/2;
    for(const [flight,x,reverse,base] of [[1,leftX,false,rs.floorLevel],[2,rightX,true,mid]]){
      for(let i=0;i<n;i++){const y=reverse?turnY-(i+.5)*stepDepth:lowerY+(i+.5)*stepDepth,z=base+(i+1)*rise,tread=planBox(x,y,rs.flightWidth,stepDepth,.055,M.steel,z-.055,stair);tread.name=rs.id+'-FLIGHT-'+flight+'-TREAD-'+(i+1);}
      for(const dx of [-rs.flightWidth/2+.045,rs.flightWidth/2-.045]){
        const startY=reverse?turnY:lowerY,endY=reverse?lowerY:turnY;
        tube([x+dx,base+.04,-startY],[x+dx,base+n*rise-.06,-endY],.04,lineMat,stair);
        tube([x+dx,base+.96,-startY],[x+dx,base+n*rise+.96,-endY],.023,M.steel,stair);
        for(let i=0;i<=n;i+=3){const y=reverse?turnY-i*stepDepth:lowerY+i*stepDepth,z=base+i*rise;tube([x+dx,z,-y],[x+dx,z+.96,-y],.023,M.steel,stair);}
      }
    }
    const landingWidth=rs.flightWidth*2+gap,landing=planBox(cx,turnY+rs.landingDepth/2,landingWidth,rs.landingDepth,.08,M.steel,mid-.08,stair);landing.name=rs.id+'-MID-LANDING';
    for(const x of [cx-landingWidth/2+.05,cx+landingWidth/2-.05]){planBox(x,sy1-pad-.05,.075,.075,mid-rs.floorLevel,M.steel,rs.floorLevel,stair);tube([x,mid+.96,-turnY],[x,mid+.96,-(sy1-pad)],.023,M.steel,stair);tube([x,mid,-(sy1-pad)],[x,mid+.96,-(sy1-pad)],.023,M.steel,stair);}
    tube([cx-landingWidth/2+.05,mid+.96,-(sy1-pad)],[cx+landingWidth/2-.05,mid+.96,-(sy1-pad)],.023,M.steel,stair);
  }
  // Sliding mesh leaves stacked at each side: internal workshop gate shown open.
  const gate=w.sideGate,gateGroup=new T.Group();gateGroup.name='INTERNAL-WORKSHOP-GATE-OPEN-PROXY';gateGroup.userData=gate;workshop.add(gateGroup);
  for(const gx of [gate.xMin,gate.xMax]){for(const dx of [0,.13]){planBox(gx+dx,gate.y,.07,1.6,gate.height,M.steel,w.floorLevel,gateGroup);for(let gy=gate.y-.8;gy<=gate.y+.8;gy+=.18)planBox(gx+dx,gy,.025,.025,gate.height,M.steel,w.floorLevel,gateGroup);}}
  if(batch.length){const b=new T.InstancedMesh(new T.BoxGeometry(1,1,1),lineMat,batch.length);batch.forEach((m,i)=>b.setMatrixAt(i,m));b.instanceMatrix.needsUpdate=true;b.name='WORKSHOP-RIBS-AND-SCREENS';workshop.add(b);}
  for(const [text,x,y,width] of [['MEETING ROOM · INTEGRAL TOWER',-1.9,4.9,3.2],['WORKSHOP · LEGACY GRID / STUDY',20,30,17]]){const o=sign(text,x,(y>16?w.floorLevel:0)+.025,-y,width,.55,0,guides,'#edf2ed','#41585a');o.rotation.x=-Math.PI/2;}
  return groups;
};
