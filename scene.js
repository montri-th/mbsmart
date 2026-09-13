/* Benz Chitchai, owner-directed B / 3B, v09 exterior comparison. Metres. Plan (x,y) => world (x,height,-y).
 * All vertical dimensions and product meshes are schematic. Manual references are in layout.js.
 * Material colours deliberately represent the photographed physical surfaces, not UI theme tokens.
 */
(() => {
  'use strict';
  const T=window.THREE, root=document.getElementById('bc-interior'), host=document.getElementById('viewport');
  const dataset=window.BC_LAYOUT;
  let renderer;
  try{renderer=new T.WebGLRenderer({antialias:true,alpha:false,preserveDrawingBuffer:true,powerPreference:'high-performance'});}catch(e){document.getElementById('loading').hidden=true;document.getElementById('no-webgl').hidden=false;return;}
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.6));renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=.88;renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;host.appendChild(renderer.domElement);
  renderer.domElement.setAttribute('role','img');renderer.domElement.setAttribute('aria-label','โมเดลโชว์รูม 3 มิติ หมุนด้วยเมาส์หรือเลือกมุมกล้องจากปุ่มด้านบน');
  const scene=new T.Scene();scene.background=new T.Color('#d4dce0');
  const camera=new T.PerspectiveCamera(58,1,.08,500), target=new T.Vector3();
  const shell=new T.Group(), overhead=new T.Group(), dynamic=new T.Group(), markings=new T.Group(), reviewMarker=new T.Group(), peopleGroup=new T.Group();scene.add(shell,overhead,dynamic,markings,reviewMarker,peopleGroup);
  let state=dataset.states.find(s=>s.mode==='handover'), mode='handover', activeView='interior', labelsOn=false, dirty=true, acOn=false, peopleOn=true, contextOn=true, upperOn=false, occludersOn=true;
  const modeNames={handover:'Vehicle handover',consulting:'Consulting area',lounge:'Customer waiting annex'};
  let exteriorScheme=dataset.defaultExteriorScheme;
  const material=new Map(), labelItems=[];
  let seed=710;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  function texture(kind){const c=document.createElement('canvas');c.width=c.height=512;const g=c.getContext('2d');
    if(kind==='stone'){const im=g.createImageData(512,512);for(let i=0;i<im.data.length;i+=4){const n=rand(),v=174+(rand()-.5)*38+(n>.986?44:n<.04?-43:0);im.data[i]=v;im.data[i+1]=v+1;im.data[i+2]=v+1;im.data[i+3]=255;}g.putImageData(im,0,0);for(let i=0;i<10000;i++){g.fillStyle=rand()>.5?'rgba(255,255,255,.17)':'rgba(27,33,35,.18)';g.fillRect(rand()*512,rand()*512,rand()*2+.4,rand()*2+.4);}}
    if(kind==='wood'){g.fillStyle='#746050';g.fillRect(0,0,512,512);for(let j=0;j<650;j++){g.strokeStyle=`rgba(${rand()>.5?'31,18,8':'186,151,111'},${.03+rand()*.15})`;g.lineWidth=.3+rand()*1.6;const y=rand()*512;g.beginPath();g.moveTo(0,y);for(let x=0;x<=512;x+=8)g.lineTo(x,y+Math.sin(x*.02+j)*rand()*3);g.stroke();}}
    if(kind==='fabric'){const im=g.createImageData(512,512);for(let y=0;y<512;y++)for(let x=0;x<512;x++){let i=(y*512+x)*4,v=104+(rand()-.5)*30+((x+y)%3===0?10:0);im.data[i]=v;im.data[i+1]=v*.91;im.data[i+2]=v*.92;im.data[i+3]=255;}g.putImageData(im,0,0);}
    const tx=new T.CanvasTexture(c);tx.colorSpace=T.SRGBColorSpace;tx.wrapS=tx.wrapT=T.RepeatWrapping;tx.anisotropy=Math.min(renderer.capabilities.getMaxAnisotropy(),8);return tx;
  }
  const granite=texture('stone'), woodTx=texture('wood'), fabricTx=texture('fabric');
  const M={stone:new T.MeshPhysicalMaterial({map:granite,color:'#b8bbbd',roughness:.23,metalness:.02,clearcoat:.65,clearcoatRoughness:.15}),column:new T.MeshStandardMaterial({map:granite,color:'#b4b9b9',roughness:.48}),white:new T.MeshStandardMaterial({color:'#f4f2ed',roughness:.76}),wood:new T.MeshStandardMaterial({map:woodTx,color:'#a28c79',roughness:.42}),dark:new T.MeshStandardMaterial({color:'#191e21',roughness:.4}),blackStone:new T.MeshPhysicalMaterial({color:'#263139',roughness:.21,clearcoat:.4}),steel:new T.MeshStandardMaterial({color:'#a8afb1',metalness:.86,roughness:.23}),upholstery:new T.MeshStandardMaterial({color:'#24272a',roughness:.8}),fabric:new T.MeshStandardMaterial({map:fabricTx,color:'#7e7478',roughness:1}),glass:new T.MeshPhysicalMaterial({color:'#b4d4d5',metalness:.02,roughness:.09,transparent:true,opacity:.16,depthWrite:false,side:T.DoubleSide}),optionalGlass:new T.MeshPhysicalMaterial({color:'#93c6ce',metalness:.02,roughness:.07,transparent:true,opacity:.23,depthWrite:false,side:T.DoubleSide}),platform:new T.MeshPhysicalMaterial({color:'#e6e5e0',roughness:.29,clearcoat:.35}),green:new T.MeshStandardMaterial({color:'#d9ed96',emissive:'#c9ea88',emissiveIntensity:.5,roughness:.45}),tileJoint:new T.MeshStandardMaterial({color:'#7d8588',roughness:.95})};
  for(const [k,m] of Object.entries(M)){m.envMapIntensity=.42;material.set(k,m);}
  function mesh(geo,mat,parent=shell){const o=new T.Mesh(geo,mat);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
  function box(x,y,z,w,h,d,mat,parent=shell){const o=mesh(new T.BoxGeometry(w,h,d),mat,parent);o.position.set(x,y,z);return o;}
  function planBox(x,y,w,d,h,mat,base=0,parent=shell){return box(x,base+h/2,-y,w,h,d,mat,parent);}
  function sphere(x,y,z,r,mat,parent=shell,sx=1,sy=1,sz=1){const o=mesh(new T.SphereGeometry(r,24,14),mat,parent);o.position.set(x,y,z);o.scale.set(sx,sy,sz);return o;}
  function cylinder(x,y,z,r,h,mat,parent=shell){const o=mesh(new T.CylinderGeometry(r,r,h,20),mat,parent);o.position.set(x,y,z);return o;}
  function tube(a,b,r,mat,parent=shell){const av=new T.Vector3(...a),bv=new T.Vector3(...b),dir=bv.clone().sub(av);const o=mesh(new T.CylinderGeometry(r,r,dir.length(),12),mat,parent);o.position.copy(av.add(bv).multiplyScalar(.5));o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),dir.normalize());return o;}
  function slab(poly,height,thickness,mat,parent=shell){const s=new T.Shape();poly.forEach((p,i)=>i?s.lineTo(p[0],p[1]):s.moveTo(p[0],p[1]));s.closePath();const o=mesh(new T.ExtrudeGeometry(s,{depth:thickness,bevelEnabled:false}),mat,parent);o.rotation.x=-Math.PI/2;o.position.y=height;return o;}
  function plaque(text,w,h,fg='#e9ece9',bg='#20272b'){const c=document.createElement('canvas');c.width=Math.max(256,Math.round(w*250));c.height=Math.max(64,Math.round(h*250));const g=c.getContext('2d');g.fillStyle=bg;g.fillRect(0,0,c.width,c.height);g.fillStyle=fg;g.font=`500 ${Math.round(c.height*.4)}px Arial`;g.textAlign='center';g.textBaseline='middle';g.fillText(text,c.width/2,c.height/2,c.width*.9);const tx=new T.CanvasTexture(c);tx.colorSpace=T.SRGBColorSpace;return new T.MeshBasicMaterial({map:tx,side:T.DoubleSide});}
  function sign(text,x,y,z,w,h,rotation=0,parent=shell,fg,bg){const o=mesh(new T.PlaneGeometry(w,h),plaque(text,w,h,fg,bg),parent);o.position.set(x,y,z);o.rotation.y=rotation;o.castShadow=false;return o;}
  function floorLabel(text,x,y,w,parent=markings){const o=sign(text,x,.018,-y,w,.45,0,parent,'#465d5b','#d5e8d8');o.rotation.x=-Math.PI/2;return o;}
  const smart=window.BC_SMART(T,{mesh,box,tube,planBox,slab,sign,sphere,cylinder,M});
  function addLabel(text,x,y,z,warn=false){const el=document.createElement('span');el.className='model-label'+(warn?' warning':'');el.textContent=text;document.getElementById('labels-layer').appendChild(el);labelItems.push({el,point:new T.Vector3(x,y,z)});}
  // Lighting and an authored indoor reflection environment; no scanned HDR or source photos leave the project.
  const env=new T.Scene();env.background=new T.Color('#707c88');const eroom=new T.Mesh(new T.BoxGeometry(80,30,45),new T.MeshBasicMaterial({color:'#b4babe',side:T.BackSide}));env.add(eroom);
  for(const [x,y,z,w,h,d] of [[0,10,-21,72,13,.1],[-39,8,0,.1,12,36],[0,14,0,48,.1,10],[10,6,21,30,9,.1]]){const e=new T.Mesh(new T.BoxGeometry(w,h,d),new T.MeshBasicMaterial({color:new T.Color(5,5,4.8)}));e.position.set(x,y,z);env.add(e);}const pmrem=new T.PMREMGenerator(renderer);scene.environment=pmrem.fromScene(env,.12,.1,140).texture;
  scene.add(new T.HemisphereLight('#f1f8ff','#6e706e',.8));scene.add(new T.AmbientLight('#f3efe9',.12));
  const sun=new T.DirectionalLight('#fff6e4',1.6);sun.position.set(-5,17,15);sun.target.position.set(18,0,-6);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-35,right:35,top:22,bottom:-22,near:1,far:90});sun.shadow.bias=-.0002;sun.shadow.normalBias=.035;scene.add(sun,sun.target);
  const fill=new T.DirectionalLight('#d9edff',.55);fill.position.set(45,10,-6);scene.add(fill);
  // Existing plan and material character, with explicitly assumed heights.
  slab(state.floor,-.12,.12,M.stone);
  const siteHelpers={mesh,box,planBox,sphere,cylinder,tube,slab,sign,M,floor:state.floor};
  const site=window.BC_SITE(T,siteHelpers,dataset.site),exterior=window.BC_EXTERIOR_MASSING(T,siteHelpers,dataset.site.upperBuilding);
  const smartExterior=window.BC_EXTERIOR_DESIGN(T,siteHelpers,dataset.exterior,dataset.site);
  const annexes=window.BC_BUILDING_ANNEXES(T,siteHelpers,dataset.site.annexes);
  const workshopStudy=window.BC_WORKSHOP_INTERIOR(T,siteHelpers,dataset.site.workshopStudy,dataset.site.annexes.workshop);
  shell.add(annexes.meeting);overhead.add(annexes.meetingRoof);
  const contextRoot=new T.Group();contextRoot.name='EXTERIOR-CONTEXT-v09';scene.add(contextRoot);
  contextRoot.add(site.ground,site.objects,site.occluders,site.guides,exterior.upper,exterior.facade,exterior.canopy,smartExterior.proposed,smartExterior.context,annexes.workshop,annexes.workshopRoof,annexes.guides);
  contextRoot.add(...Object.values(workshopStudy));
  function updateContext(){contextRoot.visible=contextOn;exterior.upper.visible=upperOn;site.occluders.visible=occludersOn;site.guides.visible=labelsOn;smartExterior.proposed.visible=exteriorScheme==='proposed';
    annexes.workshopRoof.visible=upperOn;annexes.guides.visible=labelsOn;
    workshopStudy.proposed.visible=exteriorScheme==='proposed';workshopStudy.overhead.visible=upperOn&&exteriorScheme==='proposed';workshopStudy.guides.visible=labelsOn&&exteriorScheme==='proposed';
    for(const o of dynamic.children)if(o.userData.type==='window-logo')o.visible=exteriorScheme==='proposed'||!['site','siteplan','frontage'].includes(activeView);
    document.getElementById('exterior-scheme').value=exteriorScheme;document.getElementById('exterior-status').textContent=exteriorScheme==='proposed'?'ข้อเสนอ smart / WiW HV + M/E · รอ MB/smart และวิศวกรอนุมัติ':'อาคารเดิม · ห้องประชุมใต้ tower เดียวกัน · กริดจากแบบเก่า / ผิวอาคารเทียบภาพ';
    document.getElementById('site-context').checked=contextOn;document.getElementById('upper-building').checked=upperOn;document.getElementById('site-occluders').checked=occludersOn;dirty=true;}
  function setExteriorScheme(value){if(!['existing','proposed'].includes(value))return false;exteriorScheme=value;updateContext();updateCaption();document.dispatchEvent(new CustomEvent('bc:exteriorchange',{detail:{exteriorScheme:value}}));return true;}
  const floorShape=new T.Shape();state.floor.forEach((p,i)=>i?floorShape.lineTo(...p):floorShape.moveTo(...p));floorShape.closePath();
  const floorReflection=new window.BC_Reflector(new T.ShapeGeometry(floorShape),{textureWidth:1024,textureHeight:1024,color:'#aaaeb0',clipBias:.002,multisample:0});floorReflection.rotation.x=-Math.PI/2;floorReflection.position.y=.009;floorReflection.material.transparent=true;floorReflection.material.depthWrite=false;floorReflection.material.fragmentShader=floorReflection.material.fragmentShader.replace('color ), 1.0','color ), 0.23');floorReflection.renderOrder=1;shell.add(floorReflection);
  const inside=(x,y)=>x>=0&&x<=40&&y>=0&&y<=16&&!(x>24&&y<2.5);
  for(let x=0;x<=40.01;x+=.8)for(const [a,b] of x>24?[[2.5,16]]:[[0,16]])box(x,.002,-(a+b)/2,.009,.004,b-a,M.tileJoint);
  for(let y=0;y<=16.01;y+=.8){const max=y<2.5?24:40;box(max/2,.003,-y,max,.004,.009,M.tileJoint);}
  for(const c of state.columns){const x=c.x+c.w/2,y=c.y+c.h/2;planBox(x,y,c.w,c.h,7.1,M.column);for(const z of [.28,.48,2.95,3.15,6.3,6.5])planBox(x,y,c.w+.012,c.h+.012,.105,M.blackStone,z);}
  function glassWall(x1,y1,x2,y2,height=3.2,parent=shell,mat=M.glass,bottom=0,frame=true){const len=Math.hypot(x2-x1,y2-y1),g=new T.Group();parent.add(g);g.position.set((x1+x2)/2,bottom,-(y1+y2)/2);g.rotation.y=Math.atan2(y2-y1,x2-x1);box(0,height/2,0,len,height,.024,mat,g);if(frame){box(0,.04,0,len,.07,.08,M.dark,g);box(0,height-.04,0,len,.07,.08,M.dark,g);for(let p=-len/2;p<=len/2+.01;p+=Math.min(2,len))box(p,height/2,0,.038,height,.055,M.dark,g);box(len/2,height/2,0,.038,height,.055,M.dark,g);}return g;}
  glassWall(0,0,24,0,7);glassWall(0,8,0,16,7);glassWall(0,0,0,8,3.8,overhead,M.glass,3.2);glassWall(40,2.5,40,16,3.18);glassWall(32,2.5,40,2.5,3.18);
  // Low-side upper glazing closes the photographic facade only; interior room plan is unchanged.
  glassWall(24,2.5,40,2.5,3.82,exterior.facade,M.glass,3.18);glassWall(40,2.5,40,16,3.82,exterior.facade,M.glass,3.18);
  // Entrance recess: front glazing and a central assumed opening, not verified vehicle access.
  glassWall(24,2.5,26.6,2.5,3.18);glassWall(29.8,2.5,32,2.5,3.18);sign('ENTRANCE',28.2,2.82,-2.45,2.4,.29,0);
  // The former three floating entrance blocks are replaced by the separate photo-based exterior stair in site.js.
  // A01/A04 photo-traced room enclosure. The former south door gaps were not evidenced.
  planBox(18,15.94,20,.13,3.18,M.white);
  planBox(8,11.60,.13,.20,3.18,M.white);planBox(8,14.4,.13,3.2,3.18,M.white);
  glassWall(8,11.7,8,12.8,3.18); // Hall-side admin door candidate, width not surveyed.
  tube([7.95,1,-12.1],[7.95,1.3,-12.1],.018,M.steel);
  planBox(16,14.4,.13,3.2,3.18,M.white);
  // Unlabelled NW core; do not call this a lift/store without evidence.
  planBox(9.15,13.9,2.3,.13,3.18,M.white);planBox(10.3,14.95,.13,2.1,3.18,M.white);
  for(const [a,b] of [[8,16],[19.5,26]]){planBox((a+b)/2,11.5,b-a,.13,.72,M.wood);glassWall(a,11.5,b,11.5,2.43,shell,M.glass,.72);}
  // Living front recess differs between plan issues: low frame, access left open.
  planBox(17.75,12.8,3.5,.13,.78,M.wood);planBox(19.5,12.15,.13,1.3,.78,M.wood);
  const roundedManager=[];for(let i=0;i<=16;i++){const a=(-90+i*90/16)*Math.PI/180;roundedManager.push([26+2*Math.cos(a),13.5+2*Math.sin(a)]);}
  for(let i=0;i<roundedManager.length-1;i++){const a=roundedManager[i],b=roundedManager[i+1],dx=b[0]-a[0],dy=b[1]-a[1],len=Math.hypot(dx,dy),g=new T.Group();g.position.set((a[0]+b[0])/2,0,-(a[1]+b[1])/2);g.rotation.y=Math.atan2(dy,dx);shell.add(g);box(0,.36,0,len,.72,.13,M.wood,g);glassWall(...a,...b,2.43,shell,M.glass,.72,false);}
  glassWall(28,13.5,28,16,3.18);sign('LIVING / MANAGER',22.4,2.55,-11.41,3.5,.3,0);sign('SERVICE  →',30,2.65,-15.85,3.05,.46,0);
  // C-return main stair: three separate flights + two landings, not a north/south run.
  // Counts / levels below are visual assumptions only. Stair section, headroom and upper exit TBC.
  const stairGroup=new T.Group();stairGroup.name='STAIR-C-LEGACY';stairGroup.userData={source:'A01/A04',status:'photo-traced plan; vertical geometry assumed'};shell.add(stairGroup);
  const rise=.178,run=2/8;for(let i=0;i<8;i++)planBox(6.3-(i+.5)*run,13.15,run,1.5,(i+1)*rise,M.stone,0,stairGroup);
  planBox(3.45,13.15,1.7,1.5,8*rise,M.stone,0,stairGroup);
  for(let i=0;i<4;i++)planBox(3.45,13.9+(i+.5)*.175,1.7,.175,(9+i)*rise,M.stone,0,stairGroup);
  planBox(3.45,15.3,1.7,1.4,12*rise,M.stone,0,stairGroup);
  for(let i=0;i<8;i++)planBox(4.3+(i+.5)*run,15.3,run,1.4,(13+i)*rise,M.stone,0,stairGroup);
  curveStairRail([[6.3,.95,12.43],[4.3,8*rise+.95,12.43],[2.65,8*rise+.95,12.43],[2.65,12*rise+.95,15.95],[4.3,12*rise+.95,15.95],[6.3,20*rise+.95,15.95]]);
  function curveStairRail(p){for(let i=0;i<p.length-1;i++){const a=p[i],b=p[i+1];tube([a[0],a[1],-a[2]],[b[0],b[1],-b[2]],.024,M.steel,stairGroup);tube([a[0],a[1]-.9,-a[2]],[a[0],a[1],-a[2]],.021,M.steel,stairGroup);}}
  // Independent rear transition, shown beyond E only as context; rise direction also assumed.
  planBox(7.15,16.5,1.7,1,.08,M.stone);for(let i=0;i<6;i++)planBox(7.15,17+(i+.5)*1.7/6,1.7,1.7/6,(i+1)*.12,M.stone);
  sign('REAR LEVEL CHANGE · TBC',7.15,1.1,-18.7,2.1,.24,0);
  // Mezzanine / fascia and railings, hidden only for cutaway review.
  // Mezzanine opening over the returning stair, rather than a slab through the stair.
  const mezz=new T.Shape();mezz.moveTo(0,8);mezz.lineTo(40,8);mezz.lineTo(40,16.2);mezz.lineTo(0,16.2);mezz.closePath();const stairVoid=new T.Path();stairVoid.moveTo(2.5,12.3);stairVoid.lineTo(2.5,16.1);stairVoid.lineTo(6.4,16.1);stairVoid.lineTo(6.4,12.3);stairVoid.closePath();mezz.holes.push(stairVoid);const ms=mesh(new T.ExtrudeGeometry(mezz,{depth:.28,bevelEnabled:false}),M.white,overhead);ms.rotation.x=-Math.PI/2;ms.position.y=3.28;planBox(20,8.03,40,.16,.72,M.white,3.28,overhead);
  planBox(6.35,15.3,.10,1.4,.28,M.stone,3.28,stairGroup); // Visual top-exit bridge; landing/headroom require measured stair section.
  for(let x=0;x<=40;x+=2)tube([x,3.56,-8.03],[x,4.62,-8.03],.026,M.steel,overhead);
  for(const h of [3.86,4.2,4.6])tube([0,h,-8.03],[40,h,-8.03],.026,M.steel,overhead);
  planBox(20,15.88,40,.13,3.4,M.white,3.56,overhead);for(let x=0;x<40;x+=8)glassWall(x+.5,15.8,x+7.5,15.8,2.4,overhead,M.glass,4.15);
  // Under-mezzanine coffers and a high coffered hall.
  // Dedicated sealed flex-room ceiling; hidden with cutaway only, never an open-top AC enclosure.
  planBox(36,5.25,7.96,5.46,.12,M.white,3.15,overhead);
  for(let x=4;x<40;x+=8){planBox(x,10,7.4,3.3,.12,M.white,3.03,overhead);planBox(x,10,6.2,2.25,.07,M.dark,3.17,overhead);for(const yy of [8.45,11.55])planBox(x,yy,7.4,.16,.25,M.white,2.96,overhead);for(const xx of [x-3.65,x+3.65])planBox(xx,10,.16,3.3,.25,M.white,2.96,overhead);}
  for(let x=4;x<40;x+=8){planBox(x,4,7.5,7.5,.16,M.white,7.05,overhead);planBox(x,4,6.3,6.3,.10,M.dark,6.93,overhead);for(let q=-2.8;q<3;q+=.25){planBox(x+q,4,.04,6.1,.05,M.steel,6.85,overhead);planBox(x,4+q,6.1,.035,.05,M.steel,6.85,overhead);}}
  const ring=mesh(new T.TorusGeometry(2.45,.18,10,80),M.white,overhead);ring.rotation.x=Math.PI/2;ring.position.set(28,3.08,-4.75);
  for(const [x,y,h] of [[4,10,3],[12,10,3],[20,10,3],[28,10,3],[36,10,3],[4,4,6.85],[12,4,6.85],[20,4,6.85]]){
    const fixtureMat=new T.MeshBasicMaterial({color:'#fff6dc'});const o=cylinder(x,h,-y,.09,.03,fixtureMat,overhead);o.castShadow=false;const light=new T.PointLight('#fff1d7',7,10,2);light.position.set(x,h-.1,-y);scene.add(light);
  }
  // Existing room surfaces. Doors and new optional panels are modelled below per state.
  glassWall(32,8,32,10.2,3.15);glassWall(32,11.4,32,16,3.15);glassWall(32,16,40,16,3.15);planBox(36,12,7.6,7.6,.03,M.fabric,.008);sign('SERVICE LOUNGE',36,2.63,-15.9,3.1,.35,0);
  glassWall(32,10.2,32,11.4,3.15);tube([32.04,1,-10.45],[32.04,1.3,-10.45],.018,M.steel); // Existing lounge self-closing door assumed; survey hardware and clear width.
  function car(c,index,parent){if(c.brand==='smart')return smart.car(c,parent);const g=new T.Group();parent.add(g);g.name=c.id;g.userData={id:c.id,kind:'vehicle',brand:c.brand};const paint=new T.MeshPhysicalMaterial({color:c.brand==='smart'?'#e6e5dc':['#ebeae5','#161d24','#162128','#f0eee6','#bbc3ca'][index-1]||'#bec7ca',metalness:.55,roughness:.23,clearcoat:1,clearcoatRoughness:.16});const windows=new T.MeshPhysicalMaterial({color:'#132a32',metalness:.1,roughness:.14,clearcoat:1,flatShading:true});
    paint.envMapIntensity=.32;windows.envMapIntensity=.24;
    function loft(sections,mat){const verts=[],indices=[];for(const [x,w,b,t] of sections){const cross=[[-w*.82,b],[w*.82,b],[w,b+.13],[w,t-.12],[w*.84,t],[-w*.84,t],[-w,t-.12],[-w,b+.13]];for(const [z,y] of cross)verts.push(x,y,z);}for(let i=0;i<sections.length-1;i++)for(let j=0;j<8;j++){let a=i*8+j,b=i*8+(j+1)%8,k=(i+1)*8+j,d=(i+1)*8+(j+1)%8;indices.push(a,k,b,b,k,d);}for(let j=1;j<7;j++){indices.push(0,j,j+1);let a=(sections.length-1)*8;indices.push(a,a+j+1,a+j);}const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(verts,3));geo.setIndex(indices);geo.computeVertexNormals();return mesh(geo,mat,g);}
    loft([[-2.58,.77,.36,.86],[-2.25,.97,.35,1.02],[-1.1,1.01,.35,1.05],[.9,1,.35,1.06],[2.18,.94,.37,.91],[2.58,.74,.4,.77]],paint);
    loft([[-1.75,.77,.91,1.12],[-.99,.81,.99,1.7],[.65,.78,1,1.73],[1.52,.7,.99,1.13]],windows);
    box(-.1,1.737,0,1.55,.045,1.42,paint,g);for(const x of [-.8,.7])for(const z of [-.812,.812])box(x,1.36,z,.06,.65,.038,paint,g);
    for(const wx of [-1.63,1.64])for(const wz of [-.98,.98]){const wheel=mesh(new T.CylinderGeometry(.38,.38,.23,40),M.dark,g);wheel.rotation.x=Math.PI/2;wheel.position.set(wx,.39,wz);const rim=mesh(new T.CylinderGeometry(.285,.285,.245,32),M.steel,g);rim.rotation.x=Math.PI/2;rim.position.set(wx,.39,wz);for(let i=0;i<10;i++){const a=i*Math.PI/5;const spoke=box(wx+Math.cos(a)*.125,.39+Math.sin(a)*.125,wz+(wz>0?.128:-.128),.225,.028,.015,M.blackStone,g);spoke.rotation.z=a;}const hub=mesh(new T.CylinderGeometry(.068,.068,.26,20),M.steel,g);hub.rotation.x=Math.PI/2;hub.position.set(wx,.39,wz);}
    box(2.59,.65,0,.045,.25,1.1,M.dark,g);for(let z=-.48;z<=.49;z+=.08)box(2.618,.65,z,.018,.2,.014,M.steel,g);
    for(const z of [-.64,.64]){box(2.45,.88,z,.09,.06,.42,new T.MeshBasicMaterial({color:'#e6f8ff'}),g);box(-2.45,.86,z,.075,.055,.39,new T.MeshBasicMaterial({color:'#b84a41'}),g);box(.85,1.16,z>0?1.025:-1.025,.24,.12,.16,paint,g);}
    for(const x of [-.7,.75])for(const z of [-1.014,1.014])box(x,1.035,z,.18,.025,.025,M.steel,g);
    sign(c.brand==='smart'?'smart':c.id,2.645,.54,0,.42,.12,Math.PI/2,g,'#24343a','#e9eeed');
    const bounds=new T.Box3().setFromObject(g),size=bounds.getSize(new T.Vector3()),centre=bounds.getCenter(new T.Vector3());for(const child of g.children){child.position.x-=centre.x;child.position.z-=centre.z;}g.scale.x=c.l/size.x;g.scale.z=c.w/size.z;g.position.set(c.cx,c.brand==='smart'?.10:0,-c.cy);g.rotation.y=c.angle*Math.PI/180;return g;
  }
  function facing(q){if(Number.isFinite(q.facing))return q.facing;const tables=state.furniture.filter(f=>['table','consult-table'].includes(f.type)&&f.zone===q.zone);const near=tables.sort((a,b)=>Math.hypot(a.cx-q.cx,a.cy-q.cy)-Math.hypot(b.cx-q.cx,b.cy-q.cy))[0];return near?Math.atan2(near.cy-q.cy,near.cx-q.cx)*180/Math.PI+90:(q.angle||0);}
  function seat(q,parent){const g=new T.Group();g.userData={kind:'furniture',id:q.id};parent.add(g);g.position.set(q.cx,0,-q.cy);g.rotation.y=facing(q)*Math.PI/180;
    if(q.type==='sofa'||q.type==='armchair'){const w=q.w,d=q.h;box(0,.35,0,w,.32,d,M.upholstery,g);box(0,.68,-d*.39,w,.42,.18,M.upholstery,g);for(const x of [-w/2+.08,w/2-.08])box(x,.57,0,.16,.31,d,M.upholstery,g);const n=q.seats||1;for(let i=0;i<n;i++)box(-w/2+.16+(w-.32)*(i+.5)/n,.54,.04,(w-.34)/n-.02,.09,d*.63,M.upholstery,g);for(const x of [-w/2+.15,w/2-.15])for(const z of [-d/2+.15,d/2-.15])cylinder(x,.1,z,.035,.2,M.steel,g);if(q.id==='AS1')g.rotation.y=Math.PI;}
    else if(q.zone!=='smart-module'){
      // D02 pp143-144: black shell, truffle pad; four-point customer / five-point staff base.
      const brown=new T.MeshStandardMaterial({color:'#625046',roughness:.85});
      sphere(0,.49,0,.32,M.dark,g,1,.30,.9);sphere(0,.525,.015,.285,brown,g,1,.14,.85);
      const back=sphere(0,.67,-.21,.31,M.dark,g,1,.55,.24);back.rotation.x=-.12;
      sphere(0,.67,-.17,.285,brown,g,1,.47,.15);for(const x of [-.30,.30])sphere(x,.62,-.02,.15,M.dark,g,.25,.45,1.5);
      cylinder(0,.26,0,.038,.4,M.steel,g);const staff=q.role==='consultant'||q.zone==='counter-staff',n=staff?5:4;
      for(let i=0;i<n;i++){const a=i*Math.PI*2/n;const x=Math.cos(a)*.32,z=Math.sin(a)*.32;tube([0,.12,0],[x,.05,z],.025,M.steel,g);if(staff)sphere(x,.035,z,.036,M.dark,g);}
    }else{box(0,.47,0,.5,.07,.47,M.upholstery,g);box(0,.7,-.21,.48,.43,.065,M.upholstery,g);for(const x of [-.2,.2])for(const z of [-.17,.17])tube([x,.04,z],[x,.45,z],.017,M.steel,g);for(const x of [-.25,.25]){tube([x,.5,-.18],[x,.68,-.18],.014,M.steel,g);box(x,.68,0,.035,.03,.38,M.upholstery,g);}}
    return g;
  }
  function furniture(q,parent){if(q.zone==='smart-module'||q.type==='window-logo')return smart.furniture(q,parent);if(['chair','armchair','sofa'].includes(q.type))return seat(q,parent);const g=new T.Group();g.position.set(q.cx,0,-q.cy);g.rotation.y=(q.angle||0)*Math.PI/180;g.userData={id:q.id,type:q.type};parent.add(g);
    if(q.type==='table'){const smart=q.zone==='smart-module',round=q.round,h=q.tableHeight||(q.low?.65:.73);if(round){cylinder(0,h,0,q.w/2,.015,M.dark,g);cylinder(0,h/2,0,.045,h-.03,M.dark,g);cylinder(0,.025,0,q.w*.3,.04,M.dark,g);}else{box(0,.75,0,q.w,.065,q.h,smart?M.white:M.wood,g);for(const x of [-q.w/2+.1,q.w/2-.1])box(x,.36,0,.045,.72,q.h*.74,M.steel,g);} }
    else if(q.type==='consult-table'){
      // TA03 catalogue silhouette / D02 PDF155; shaped top and curved-down outer end.
      const poly=[[-q.w/2,-.48],[q.w/2,-.355],[q.w/2,.355],[-q.w/2,.48]];
      slab(poly,.735,.025,M.dark,g);box(-q.w/2+.025,.38,0,.055,.73,.92,M.dark,g);box(0,.713,0,q.w-.08,.023,.69,M.steel,g);
      box(.83,.6275,0,.10,.215,.50,M.steel,g); // Schematic support on sideboard; supplier connection detail remains TBC.
      box(.1,.815,0,.34,.025,.23,M.dark,g);sign('CONSULT',.1,.92,-.025,.30,.18,0,g);
    }
    else if(q.type==='sideboard'){box(0,.26,0,q.w,.52,q.h,M.steel,g);box(-q.w/2-.004,.26,0,.016,.49,q.h-.04,M.wood,g);}
    else if(q.type==='counter'){box(0,.51,0,q.w,1.02,q.h,M.wood,g);box(0,.52,q.h/2+.01,q.w-.15,.86,.025,M.blackStone,g);box(0,1.045,0,q.w+.05,.045,q.h+.08,M.blackStone,g);for(const x of [-1.6,1.6]){box(x,1.21,0,.52,.32,.055,M.dark,g);box(x,1.07,0,.2,.03,.2,M.steel,g);}sign('CHITCHAI',0,.62,q.h/2+.027,1.5,.19,0,g,'#e2e2dc','#293034');}
    else if(q.type==='background-wall'){box(0,1.27,0,q.w,2.54,q.h,M.platform,g);sign('smart',-.9,1.94,q.h/2+.018,1.6,.5,0,g,'#eef3f1','#929b97');for(const x of [-q.w/2+.05,q.w/2-.05])box(x,1.25,q.h/2+.015,.035,2.4,.025,M.green,g);}
    else if(q.type==='screen'){const isKit=q.id==='LED';const w=isKit?1.66:q.h,h=w*9/16;box(0,1.68,0,q.w,.98,q.h,M.dark,g);if(isKit){const o=sign('smart — open your mind',0,1.7,.077,w,h,0,g,'#e6eabe','#435150');}else{sign('CHITCHAI',.09,1.7,0,1.2,.68,Math.PI/2,g);}}
    else if(q.type==='charger'){box(0,.72,0,.22,1.44,.19,M.dark,g);box(0,1.05,.115,.26,.34,.07,M.white,g);const points=[new T.Vector3(.12,.91,.19),new T.Vector3(.3,.59,.15),new T.Vector3(.21,.38,.15),new T.Vector3(-.08,.51,.16),new T.Vector3(-.13,1,.16)];mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points),24,.016,7,false),M.dark,g);}
    else if(q.type==='price-stand'){box(0,.045,0,q.w,.08,q.h,M.steel,g);box(0,.51,0,.055,.93,.055,M.steel,g);const p=box(0,1.01,0,.27,.4,.035,M.dark,g);p.rotation.x=-.25;sign(q.id==='EP'?'smart':q.id.split('-')[0],0,1.06,.038,.22,.28,0,g,'#25333a','#edf0e9');}
    else if(q.type==='floor-lamp'){cylinder(0,.025,0,.2,.05,M.steel,g);cylinder(0,.83,0,.018,1.6,M.steel,g);const sh=mesh(new T.CylinderGeometry(.16,.26,.32,30),new T.MeshStandardMaterial({color:'#e8e2cf',emissive:'#dbd0a7',emissiveIntensity:.4}),g);sh.position.y=1.63;}
    else if(q.type==='cabinet'||q.type==='hospitality'){box(0,.48,0,q.w,.96,q.h,M.wood,g);box(0,.98,0,q.w+.03,.035,q.h+.03,M.blackStone,g);for(let x=-q.w/2+.25;x<q.w/2;x+=.55)box(x,.59,q.h/2+.008,.015,.45,.012,M.steel,g);}
    return g;
  }
  function module(state){smart.module(state,dynamic);}
  function person(p){
    const g=new T.Group();g.name=p.id;g.userData={kind:'person',pose:p.seat?'seated':p.pose,height:p.height};peopleGroup.add(g);
    const q=p.seat&&state.furniture.find(q=>q.id===p.seat),sit=!!q;
    const skin=new T.MeshStandardMaterial({color:p.skin,roughness:.78}),cloth=new T.MeshStandardMaterial({color:p.shirt,roughness:.95}),pants=new T.MeshStandardMaterial({color:p.pants,roughness:.92}),hair=new T.MeshStandardMaterial({color:'#302a26',roughness:1});
    const hip=sit?.58:.92,shoulder=hip+.49,head=shoulder+.22;
    sphere(0,hip+.26,0,.26,cloth,g,.83,1.14,.49);sphere(0,hip-.04,0,.20,pants,g,.88,.62,.63);
    cylinder(0,head-.13,0,.055,.10,skin,g);sphere(0,head+.015,0,.125,skin,g,.8,1.16,.88);sphere(0,head+.09,-.018,.126,hair,g,.82,.6,.86);sphere(0,head+.01,.112,.035,skin,g,.57,.65,.7);
    for(const side of [-1,1]){
      sphere(side*.106,head+.015,0,.025,skin,g,.5,1,.75);
      const knee=sit?[side*.12,.46,.39]:[side*.11,.49,side*(p.pose==='walk'?.14:.025)],ankle=sit?[side*.12,.10,.38]:[side*.11,.105,-side*(p.pose==='walk'?.13:.025)];
      tube([side*.115,hip-.08,0],knee,.085,pants,g);sphere(...knee,.082,pants,g);tube(knee,ankle,.062,pants,g);sphere(ankle[0],.065,ankle[2]+(sit?.02:.07),sit?.09:.13,M.dark,g,.55,.45,1.12);
      const elbow=sit?[side*.23,hip+.12,.23]:[side*.25,hip+.21,side*.025],hand=sit?[side*.17,hip+.13,.43]:p.pose==='gesture'&&side===1?[.48,hip+.31,.21]:[side*.23,hip-.03,.04];
      tube([side*.19,shoulder-.04,0],elbow,.063,cloth,g);sphere(...elbow,.065,cloth,g);tube(elbow,hand,.047,cloth,g);sphere(...hand,.052,skin,g,.65,1,.6);
    }
    if(sit)box(0,hip+.13,.38,.29,.025,.20,M.dark,g);
    g.scale.setScalar(p.height/1.78);g.position.set(q?q.cx:p.x,q?.zone==='smart-module'?.105:0,-(q?q.cy:p.y));g.rotation.y=(q?facing(q):(p.facing||0))*Math.PI/180;
  }
  function planter(x,y,r,h){const pot=new T.MeshStandardMaterial({color:'#323638',roughness:.85}),leaf=new T.MeshStandardMaterial({color:'#405d38',roughness:.82});const g=new T.Group();shell.add(g);g.position.set(x,0,-y);const m=mesh(new T.CylinderGeometry(r,r*.70,h,24),pot,g);m.position.y=h/2;cylinder(0,h,0,r*.88,.02,M.dark,g);for(let i=0;i<7;i++){const a=i*2.4,top=h+.55+(i%3)*.22,ex=Math.cos(a)*r*.9,ez=Math.sin(a)*r*.9;tube([0,h,0],[ex,top,ez],.009,leaf,g);for(let j=0;j<3;j++){const l=sphere(ex+Math.cos(a+j)*.12,top-j*.13,ez+Math.sin(a+j)*.12,.18,leaf,g,.6,.12,1.1);l.rotation.set(.4,a+j,.2);}}}
  // D02: selected consulting wood zones and black-glass reception front; retained footprints.
  const oak=new T.MeshStandardMaterial({map:woodTx,color:'#cbbba1',roughness:.63});
  planBox(17.05,10.15,17.1,3.2,.014,oak,.012);for(let y=8.55;y<11.75;y+=.20)for(let x=8.5+(Math.round(y*5)%2)*.6;x<25.5;x+=1.2)planBox(x+.6,y+.1,1.196,.196,.005,oak,.027);
  const blackGlass=new T.MeshPhysicalMaterial({color:'#10191f',roughness:.13,metalness:.1,clearcoat:1});planBox(11.65,11.475,6.1,.045,2.25,blackGlass,.75);for(let x=8.9;x<14.7;x+=.625)planBox(x,11.442,.008,.012,2.15,M.steel,.79);
  sign('Mercedes-Benz',11.65,2.42,-11.43,2.45,.29,0);sign('WELCOME  /  RECEPTION',11.65,1.92,-11.425,2.4,.17,0);
  smart.lighting(overhead,scene);
  // D03 optional paired planters, outside vehicles and service entry.
  planter(25.8,10.7,.30,.90);planter(26.55,10.7,.30,.68);planter(33.0,15.35,.30,.90);planter(33.72,15.35,.30,.68);
  // D02 LP vehicle/handover tracks: visual fixtures, not a calculated lux result.
  for(const [x,y,z] of [[12,1.65,5.8],[20,1.65,5.8],[12,6.65,5.8],[20,6.65,5.8],[36,5.25,3.0]]){planBox(x,y,4.3,.055,.07,M.dark,z,overhead);for(const dx of [-1.6,0,1.6]){const head=cylinder(x+dx,z-.14,-y,.085,.22,M.dark,overhead);head.rotation.z=dx*.12;cylinder(x+dx,z-.26,-y,.068,.008,new T.MeshBasicMaterial({color:'#fff4e2'}),overhead);}}
  function flexRoom(){
    if(mode==='lounge'&&acOn){glassWall(32,8,32.4,8,3.15,dynamic);glassWall(34.8,8,40,8,3.15,dynamic);planBox(35.02,8,.22,.60,3.10,M.optionalGlass,0,dynamic);}
    else{glassWall(32,8,40,8,3.15,dynamic);tube([33.3,1,-7.96],[33.3,1.3,-7.96],.018,M.steel,dynamic);}
    for(const [a,b] of [[2.5,2.7],[2.7,3.9],[3.9,4],[7.2,8]])glassWall(32,a,32,b,3.15,dynamic,M.optionalGlass);
    tube([32.04,1,-3.2],[32.04,1.3,-3.2],.018,M.steel,dynamic);
    if(acOn)glassWall(32,4,32,7.2,3.15,dynamic,M.optionalGlass);else for(let i=0;i<4;i++)planBox(32.13+i*.06,7.53,.034,.55,3.10,M.optionalGlass,0,dynamic);
    // Dedicated cassette installed in all modes; opening/closing AC is independent of use.
    planBox(36,5.25,1,1,.16,M.white,2.92,dynamic);planBox(36,5.25,.7,.7,.012,M.dark,2.912,dynamic);for(let i=-3;i<=3;i++)planBox(36+i*.1,5.25,.02,.62,.014,M.steel,2.9,dynamic);
    planBox(36.4,4.85,.035,.035,.012,new T.MeshBasicMaterial({color:acOn?'#79d8ad':'#a2a5a7'}),2.898,dynamic);
    // One permanent stone floor for all uses; only loose rugs/furniture change.
    if(mode==='lounge'){const rug=cylinder(36.3,.040,-5,1.34,.012,M.fabric,dynamic);rug.scale.z=.85;}
    sign(mode==='handover'?'VEHICLE HANDOVER':mode==='consulting'?'CONSULTING':'CUSTOMER WAITING',36,2.61,-7.96,3.4,.3,0,dynamic);
  }
  function line(points,color,parent=markings){const g=new T.BufferGeometry().setFromPoints(points.map(p=>new T.Vector3(...p)));const o=new T.Line(g,new T.LineBasicMaterial({color,transparent:true,opacity:.75}));parent.add(o);return o;}
  const acState={handover:false,consulting:true,lounge:true};
  const sharedMaterials=new Set(Object.values(M)),sharedTextures=new Set([granite,woodTx,fabricTx]);
  function clearGroup(group){const materials=new Set(),textures=new Set();while(group.children.length){const c=group.children[0];group.remove(c);c.traverse(o=>{o.geometry?.dispose();for(const m of (Array.isArray(o.material)?o.material:[o.material]))if(m&&!sharedMaterials.has(m))materials.add(m);});}for(const m of materials){if(m.map&&!sharedTextures.has(m.map))textures.add(m.map);m.dispose();}for(const tx of textures)tx.dispose();}
  function setMode(next){if(!dataset.states.some(s=>s.mode===next))return;mode=next;state=dataset.states.find(s=>s.mode===mode);acOn=acState[mode];clearGroup(dynamic);clearGroup(peopleGroup);flexRoom();module(state);state.cars.forEach((c,i)=>car(c,i,dynamic));state.furniture.forEach(q=>furniture(q,dynamic));state.people.forEach(person);peopleGroup.visible=peopleOn;
    document.getElementById('state-status').textContent=(mode==='handover'?'MB 5 แสดง + MB6 ส่งมอบ + smart 1':mode==='consulting'?'MB 5 + smart 1 · Consulting 3 ที่ + รับรอง 2 ที่':'MB 5 + smart 1 · ห้องแอร์เดิม 10 + ส่วนขยาย 8 ที่')+' · แอร์ Flex '+(acOn?'เปิด / กระจกปิด':'ปิด / ช่องรถเปิด');document.getElementById('mode').value=mode;document.getElementById('flex-ac').checked=acOn;
    root.querySelector('.issue').textContent='MB5 หน้า Entrance: หน้า–ท้าย 0.15 ม. / รอตรวจทางเดินและการเลี้ยวรถ';const tag=labelItems.find(q=>q.el.classList.contains('warning'));if(tag){const c=state.cars.find(c=>c.id==='MB5');tag.point.set(c.cx,2.3,-c.cy);tag.el.textContent='MB5 · Entrance / clearance HOLD';}updateContext();updateCaption();dirty=true;
  }
  function setAC(value){acState[mode]=!!value;setMode(mode);}
  // Review overlays are not proposed floor graphics.
  for(const x of [0,8,16,24,32,40]){line([[x,.025,0],[x,.025,-16]],'#b98738');floorLabel('LX'+x/8,x,16.6,1);}
  for(const [id,y] of [['H',0],['G',2.5],['F',8],['E',16]]){line([[0,.025,-y],[40,.025,-y]],'#b98738');floorLabel(id,-.65,y,.7);}
  const clearMat=new T.MeshBasicMaterial({color:'#c9e7d0',transparent:true,opacity:.22,depthWrite:false});planBox(30,12,4,8,.015,clearMat,.017,markings);floorLabel('SERVICE ACCESS — KEEP CLEAR',30,13.5,3.8,markings);
  const warningMat=new T.MeshBasicMaterial({color:'#efa554',transparent:true,opacity:.13,depthWrite:false});planBox(36,5.25,8,5.5,.01,warningMat,.025,markings);
  addLabel('3B · 8.65 × 6.63 m',4,2.95,-4);addLabel('ทางไป SERVICE · ไม่วาง ST',29.75,.8,-14);addLabel('MB5 · หน้า–ท้าย 0.15 m / HOLD',36.6,2.3,-5.25,true);addLabel('ห้องแอร์เดิม',36,2.2,-12);
  const presets={interior:{p:[27.9,2.05,-4.1],t:[9.4,1.42,-6.2],ceiling:true,title:'จากทางเข้า · มองสู่ smart และ counter เดิม'},smart:{p:[9.2,2.4,-3.9],t:[2.8,1.22,-5.2],ceiling:true,title:'smart Module 3B · ครบหนึ่งชุด'},handover:{p:[33.2,2.05,-2.8],t:[36.8,1.1,-7.4],ceiling:true,title:'Vehicle Handover · MB5 หันสู่ด้านหน้า entrance'},service:{p:[28.2,2.0,-6.7],t:[29.75,1.4,-15.5],ceiling:true,title:'ทางเข้า–ออกศูนย์บริการ · ยกเลิก ST'},overview:{p:[48,33,27],t:[20,0,-7.5],ceiling:false,title:'ภาพรวมสามมิติ · มุมตัดซ่อนฝ้าเพื่อดูผัง'},plan:{p:[20,49,-7.9],t:[20,0,-8],ceiling:false,title:'มองจากด้านบน · แกนยาว MB5 ตั้งฉาก'} };
  presets.interior.p=[28.6,2.15,-7.15];presets.interior.t=[10.2,1.42,-7.8];presets.handover.p=[32.35,2.35,-2.78];presets.handover.t=[36,1.1,-5.8];presets.handover.title='MB6 · ส่งมอบรถ หันหน้าไปทาง smart';presets.plan.title='ผัง v07 · Admin / บันได C-return / Flex 3 รูปแบบ';
  presets.smart={p:[10.5,2.45,-6.3],t:[3.4,1.05,-4.7],ceiling:true,title:'smart #5 Premium · Saturn Beige Matte / Shadow Black'};
  presets.handover.p=[33.5,2.2,3.2];presets.handover.t=[36,1.4,-5.2];
  addLabel('smart · Type 4 indoor-window logo / size TBC',35.97,2.85,-2.73);addLabel('MB wallbox เดิม · ใช้ร่วม / ตำแหน่งรอวัด',32.85,1.85,-7.45);
  presets.overview.p=[39,24,17];presets.plan.p=[20,26,-7.9];
  presets.plan.title='ผังภายใน v09 · คงผัง v07';
  presets.site={p:[83,54,63],t:[20,4,-17],ceiling:true,site:true,upper:true,title:'อาคารและโรงซ่อมเชื่อมด้านหลัง · ป้าย MB ตั้งฉากถนน / ห้องประชุมแยกจาก Sales'};
  presets.frontage={p:[24,7,39],t:[21,7,-3],ceiling:true,site:true,upper:true,title:'มองจากริมถนน · อาคารเดิมและลานด้านหน้า'};
  presets.siteplan={p:[22,86,-17],t:[22,-.6,-17.1],ceiling:false,site:true,upper:false,title:'ผังบริเวณ · ห้องประชุมแยก Sales / โรงซ่อมด้านหลัง / เส้นสีไม่ใช่แนวเขต'};
  presets.workshop={p:[49,29,-6],t:[23,0,-30],ceiling:false,site:true,upper:false,title:'โรงซ่อม · ผังเตรียม smart HV + M/E · อุปกรณ์เป็นข้อเสนอรออนุมัติ'};
  addLabel('ลานหน้าอาคาร · จากขอบแถบหน้าอาคาร 7.20 ม. / รอยืนยัน',16,.55,4.6,true);
  addLabel('ริมถนนสาธารณะ · แนวอ้างอิงภาพ / ไม่ใช่รังวัด',25,.1,10.6,true);
  addLabel('ลานด้านข้าง · ที่จอด smart 1 + 2 / รอตรวจโควตา MB',48,.3,-20,true);
  function updateCaption(){document.getElementById('view-title').textContent=activeView==='handover'?modeNames[mode]+' · แอร์ '+(acOn?'เปิด':'ปิด'):presets[activeView].title;}
  function setView(v){if(!Object.hasOwn(presets,v))return false;activeView=v;const p=presets[v];camera.fov=v==='handover'?65:58;camera.updateProjectionMatrix();camera.position.set(...p.p);target.set(...p.t);if(['plan','overview','site','siteplan','frontage'].includes(v)){const k=Math.max(1,(p.site?1.15:1.8)/camera.aspect);camera.position.sub(target).multiplyScalar(k).add(target);}camera.lookAt(target);overhead.visible=p.ceiling;document.getElementById('ceiling').checked=p.ceiling;upperOn=!!p.upper;if(p.site)contextOn=true;updateContext();root.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.view===v)));updateCaption();dirty=true;document.dispatchEvent(new CustomEvent('bc:viewchange',{detail:{view:v}}));return true;}
  function orbit(dx,dy){const v=camera.position.clone().sub(target),s=new T.Spherical().setFromVector3(v);s.theta-=dx*.006;s.phi=T.MathUtils.clamp(s.phi-dy*.006,.04,Math.PI/2+.05);camera.position.copy(target).add(new T.Vector3().setFromSpherical(s));camera.lookAt(target);dirty=true;}
  function zoom(f){const v=camera.position.clone().sub(target);v.multiplyScalar(f);v.clampLength(.6,290);camera.position.copy(target).add(v);dirty=true;}
  function pan(dx,dy){const distance=camera.position.distanceTo(target),right=new T.Vector3().setFromMatrixColumn(camera.matrix,0),up=new T.Vector3().setFromMatrixColumn(camera.matrix,1);const v=right.multiplyScalar(-dx*distance*.0018).add(up.multiplyScalar(dy*distance*.0018));camera.position.add(v);target.add(v);dirty=true;}
  const pointers=new Map();let lastPinch=0;
  renderer.domElement.addEventListener('contextmenu',e=>e.preventDefault());renderer.domElement.addEventListener('pointerdown',e=>{renderer.domElement.setPointerCapture(e.pointerId);pointers.set(e.pointerId,{x:e.clientX,y:e.clientY,button:e.button});});
  renderer.domElement.addEventListener('pointermove',e=>{const old=pointers.get(e.pointerId);if(!old)return;const dx=e.clientX-old.x,dy=e.clientY-old.y;pointers.set(e.pointerId,{x:e.clientX,y:e.clientY,button:old.button});if(pointers.size===2){const a=[...pointers.values()],d=Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y);if(lastPinch)zoom(lastPinch/d);lastPinch=d;}else if(old.button===2||e.shiftKey)pan(dx,dy);else orbit(dx,dy);});
  for(const event of ['pointerup','pointercancel'])renderer.domElement.addEventListener(event,e=>{pointers.delete(e.pointerId);lastPinch=0;});renderer.domElement.addEventListener('wheel',e=>{e.preventDefault();zoom(Math.exp(e.deltaY*.001));},{passive:false});
  root.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>setView(b.dataset.view)));document.getElementById('mode').addEventListener('change',e=>{setMode(e.target.value);updateCaption();});document.getElementById('ceiling').addEventListener('change',e=>{overhead.visible=e.target.checked;dirty=true;});document.getElementById('labels').addEventListener('change',e=>{labelsOn=e.target.checked;markings.visible=labelsOn;updateContext();});
  document.getElementById('site-context').addEventListener('change',e=>{contextOn=e.target.checked;updateContext();});document.getElementById('upper-building').addEventListener('change',e=>{upperOn=e.target.checked;if(upperOn)contextOn=true;updateContext();});document.getElementById('site-occluders').addEventListener('change',e=>{occludersOn=e.target.checked;updateContext();});
  document.getElementById('exterior-scheme').addEventListener('change',e=>setExteriorScheme(e.target.value));
  document.getElementById('flex-ac').addEventListener('change',e=>setAC(e.target.checked));document.getElementById('people').addEventListener('change',e=>{peopleOn=e.target.checked;peopleGroup.visible=peopleOn;dirty=true;});
  function resize(){const w=host.clientWidth,h=host.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();dirty=true;}
  new ResizeObserver(resize).observe(host);
  function draw(){if(dirty){renderer.render(scene,camera);for(const q of labelItems){const p=q.point.clone().project(camera);q.el.hidden=!labelsOn||p.z>1||p.z<0||Math.abs(p.x)>.93||Math.abs(p.y)>.9;q.el.style.left=((p.x+1)*.5*host.clientWidth)+'px';q.el.style.top=((-p.y+1)*.5*host.clientHeight)+'px';}dirty=false;}requestAnimationFrame(draw);}
  markings.visible=false;setMode('handover');resize();setView('site');draw();document.getElementById('loading').hidden=true;
  function setReviewLocation(q){
    while(reviewMarker.children.length){const o=reviewMarker.children[0];reviewMarker.remove(o);o.geometry?.dispose();o.material?.dispose();}
    if(q.type==='point'||q.type==='rectangle'){
      const mat=new T.MeshBasicMaterial({color:'#0078d6',transparent:true,opacity:.8,depthTest:false,depthWrite:false,side:T.DoubleSide});
      const ring=new T.Mesh(new T.RingGeometry(.27,.44,40),mat);ring.rotation.x=-Math.PI/2;ring.position.set(q.x,.16,-q.y);ring.renderOrder=20;reviewMarker.add(ring);
      if(q.type==='rectangle'){const rect=new T.Mesh(new T.PlaneGeometry(q.x2-q.x,q.y2-q.y),mat.clone());rect.material.opacity=.24;rect.rotation.x=-Math.PI/2;rect.position.set((q.x+q.x2)/2,.14,-(q.y+q.y2)/2);rect.renderOrder=19;reviewMarker.add(rect);}
    }dirty=true;
  }
  window.BC_VIEWER={setMode,setAC,setView,setExteriorScheme,setReviewLocation,setLabels(v){labelsOn=v;markings.visible=v;document.getElementById('labels').checked=v;updateContext();},setCeiling(v){overhead.visible=v;document.getElementById('ceiling').checked=v;dirty=true;},snapshot(){renderer.render(scene,camera);return renderer.domElement.toDataURL('image/jpeg',.94);},inspect(){return {revision:dataset.revision,mode,ac:acOn,exteriorScheme,people:peopleGroup.children.length,peopleVisible:peopleOn,view:activeView,site:{visible:contextRoot.visible,upper:exterior.upper.visible,occluders:site.occluders.visible,bounds:dataset.site.bounds,status:dataset.site.status},vehicles:dynamic.children.filter(o=>o.userData.kind==='vehicle').map(o=>({id:o.name,position:o.position.toArray(),rotation:o.rotation.y,bounds:new T.Box3().setFromObject(o).getSize(new T.Vector3()).toArray()})),ST:state.furniture.some(q=>q.id==='ST'),serviceReserve:state.serviceAccessReserve,ceiling:overhead.visible,glRenderer:renderer.getContext().getParameter(renderer.getContext().RENDERER),drawCalls:renderer.info.render.calls};},scene,camera};
})();
