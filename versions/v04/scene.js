/* Benz Chitchai, original B / 3B, v04. Metres. Plan (x,y) => world (x,height,-y).
 * All vertical dimensions and product meshes are schematic. Data source: layout-v04.json.
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
  const camera=new T.PerspectiveCamera(58,1,.08,220), target=new T.Vector3();
  const shell=new T.Group(), overhead=new T.Group(), dynamic=new T.Group(), markings=new T.Group(), reviewMarker=new T.Group();scene.add(shell,overhead,dynamic,markings,reviewMarker);
  let state=dataset.states.find(s=>s.mode==='handover'), mode='handover', activeView='interior', labelsOn=false, dirty=true;
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
  function addLabel(text,x,y,z,warn=false){const el=document.createElement('span');el.className='model-label'+(warn?' warning':'');el.textContent=text;document.getElementById('labels-layer').appendChild(el);labelItems.push({el,point:new T.Vector3(x,y,z)});}
  // Lighting and an authored indoor reflection environment; no scanned HDR or source photos leave the project.
  const env=new T.Scene();env.background=new T.Color('#707c88');const eroom=new T.Mesh(new T.BoxGeometry(80,30,45),new T.MeshBasicMaterial({color:'#b4babe',side:T.BackSide}));env.add(eroom);
  for(const [x,y,z,w,h,d] of [[0,10,-21,72,13,.1],[-39,8,0,.1,12,36],[0,14,0,48,.1,10],[10,6,21,30,9,.1]]){const e=new T.Mesh(new T.BoxGeometry(w,h,d),new T.MeshBasicMaterial({color:new T.Color(5,5,4.8)}));e.position.set(x,y,z);env.add(e);}const pmrem=new T.PMREMGenerator(renderer);scene.environment=pmrem.fromScene(env,.12,.1,140).texture;
  scene.add(new T.HemisphereLight('#f1f8ff','#6e706e',.8));scene.add(new T.AmbientLight('#f3efe9',.12));
  const sun=new T.DirectionalLight('#fff6e4',1.6);sun.position.set(-5,17,15);sun.target.position.set(18,0,-6);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-35,right:35,top:22,bottom:-22,near:1,far:90});sun.shadow.bias=-.0002;sun.shadow.normalBias=.035;scene.add(sun,sun.target);
  const fill=new T.DirectionalLight('#d9edff',.55);fill.position.set(45,10,-6);scene.add(fill);
  // Existing plan and material character, with explicitly assumed heights.
  slab(state.floor,-.12,.12,M.stone);slab([[-2,-3],[42,-3],[42,18],[-2,18]],-.36,.15,new T.MeshStandardMaterial({color:'#929b9e',roughness:.9}));
  const floorShape=new T.Shape();state.floor.forEach((p,i)=>i?floorShape.lineTo(...p):floorShape.moveTo(...p));floorShape.closePath();
  const floorReflection=new window.BC_Reflector(new T.ShapeGeometry(floorShape),{textureWidth:1024,textureHeight:1024,color:'#aaaeb0',clipBias:.002,multisample:0});floorReflection.rotation.x=-Math.PI/2;floorReflection.position.y=.009;floorReflection.material.transparent=true;floorReflection.material.depthWrite=false;floorReflection.material.fragmentShader=floorReflection.material.fragmentShader.replace('color ), 1.0','color ), 0.23');floorReflection.renderOrder=1;shell.add(floorReflection);
  const inside=(x,y)=>x>=0&&x<=40&&y>=0&&y<=16&&!(x>24&&y<2.5);
  for(let x=0;x<=40.01;x+=.8)for(const [a,b] of x>24?[[2.5,16]]:[[0,16]])box(x,.002,-(a+b)/2,.009,.004,b-a,M.tileJoint);
  for(let y=0;y<=16.01;y+=.8){const max=y<2.5?24:40;box(max/2,.003,-y,max,.004,.009,M.tileJoint);}
  for(const c of state.columns){const x=c.x+c.w/2,y=c.y+c.h/2;planBox(x,y,c.w,c.h,7.1,M.column);for(const z of [.28,.48,2.95,3.15,6.3,6.5])planBox(x,y,c.w+.012,c.h+.012,.105,M.blackStone,z);}
  function glassWall(x1,y1,x2,y2,height=3.2,parent=shell,mat=M.glass,bottom=0,frame=true){const len=Math.hypot(x2-x1,y2-y1),g=new T.Group();parent.add(g);g.position.set((x1+x2)/2,bottom,-(y1+y2)/2);g.rotation.y=Math.atan2(y2-y1,x2-x1);box(0,height/2,0,len,height,.024,mat,g);if(frame){box(0,.04,0,len,.07,.08,M.dark,g);box(0,height-.04,0,len,.07,.08,M.dark,g);for(let p=-len/2;p<=len/2+.01;p+=Math.min(2,len))box(p,height/2,0,.038,height,.055,M.dark,g);box(len/2,height/2,0,.038,height,.055,M.dark,g);}return g;}
  glassWall(0,0,24,0,7);glassWall(0,0,0,16,7);glassWall(40,2.5,40,16,3.18);glassWall(32,2.5,40,2.5,3.18);
  // Entrance recess: front glazing and a central assumed opening, not verified vehicle access.
  glassWall(24,2.5,26.6,2.5,3.18);glassWall(29.8,2.5,32,2.5,3.18);sign('ENTRANCE',28.2,2.82,-2.45,2.4,.29,0);
  for(const y of [.8,1.6,2.4]){planBox(28.2,y,3.2,.8,.11,M.stone,-.36+y*.075);}
  // Back offices and the service opening remain clear.
  planBox(17.75,15.94,19.5,.12,3.18,M.white);planBox(8.06,14,.12,4,3.18,M.white);planBox(27.44,14,.12,4,3.18,M.white);
  for(const [a,b] of [[8,14.8],[16.2,23],[24.3,27.5]]){planBox((a+b)/2,12,b-a,.13,.6,M.wood);glassWall(a,12,b,12,2.53,shell,M.glass,.6);}
  sign('CHITCHAI CHONBURI',20.2,2.58,-11.89,4.4,.3,0);sign('SERVICE  →',29.75,2.65,-15.85,3.05,.46,0);
  // Stair volume only; exact tread and landing dimensions not surveyed.
  planBox(1.0,14.35,.15,3.3,3.4,M.white);planBox(6.9,14.35,.15,3.3,3.4,M.white);
  for(let i=0;i<12;i++)planBox(4.4,12.85+i*.24,3,.24,(i+1)*.24,M.stone);
  // Mezzanine / fascia and railings, hidden only for cutaway review.
  planBox(20,12,40,8,.28,M.white,3.28,overhead);planBox(20,8.03,40,.16,.72,M.white,3.28,overhead);
  for(let x=0;x<=40;x+=2)tube([x,3.56,-8.03],[x,4.62,-8.03],.026,M.steel,overhead);
  for(const h of [3.86,4.2,4.6])tube([0,h,-8.03],[40,h,-8.03],.026,M.steel,overhead);
  planBox(20,15.88,40,.13,3.4,M.white,3.56,overhead);for(let x=0;x<40;x+=8)glassWall(x+.5,15.8,x+7.5,15.8,2.4,overhead,M.glass,4.15);
  // Under-mezzanine coffers and a high coffered hall.
  for(let x=4;x<40;x+=8){planBox(x,10,7.4,3.3,.12,M.white,3.03,overhead);planBox(x,10,6.2,2.25,.07,M.dark,3.17,overhead);for(const yy of [8.45,11.55])planBox(x,yy,7.4,.16,.25,M.white,2.96,overhead);for(const xx of [x-3.65,x+3.65])planBox(xx,10,.16,3.3,.25,M.white,2.96,overhead);}
  for(let x=4;x<40;x+=8){planBox(x,4,7.5,7.5,.16,M.white,7.05,overhead);planBox(x,4,6.3,6.3,.10,M.dark,6.93,overhead);for(let q=-2.8;q<3;q+=.25){planBox(x+q,4,.04,6.1,.05,M.steel,6.85,overhead);planBox(x,4+q,6.1,.035,.05,M.steel,6.85,overhead);}}
  const ring=mesh(new T.TorusGeometry(2.45,.18,10,80),M.white,overhead);ring.rotation.x=Math.PI/2;ring.position.set(28,3.08,-4.75);
  for(const [x,y,h] of [[4,10,3],[12,10,3],[20,10,3],[28,10,3],[36,10,3],[4,4,6.85],[12,4,6.85],[20,4,6.85]]){
    const fixtureMat=new T.MeshBasicMaterial({color:'#fff6dc'});const o=cylinder(x,h,-y,.09,.03,fixtureMat,overhead);o.castShadow=false;const light=new T.PointLight('#fff1d7',7,10,2);light.position.set(x,h-.1,-y);scene.add(light);
  }
  // Existing room surfaces. Doors and new optional panels are modelled below per state.
  glassWall(32,8,32,10.2,3.15);glassWall(32,11.4,32,16,3.15);glassWall(32,16,40,16,3.15);planBox(36,12,7.6,7.6,.03,M.fabric,.008);sign('SERVICE LOUNGE',36,2.63,-15.9,3.1,.35,0);
  function car(c,index,parent){const g=new T.Group();parent.add(g);g.name=c.id;g.userData={id:c.id,kind:'vehicle',brand:c.brand};const paint=new T.MeshPhysicalMaterial({color:c.brand==='smart'?'#e6e5dc':['#ebeae5','#161d24','#162128','#f0eee6','#bbc3ca'][index-1]||'#bec7ca',metalness:.55,roughness:.23,clearcoat:1,clearcoatRoughness:.16});const windows=new T.MeshPhysicalMaterial({color:'#132a32',metalness:.1,roughness:.14,clearcoat:1,flatShading:true});
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
    const size=new T.Box3().setFromObject(g).getSize(new T.Vector3());g.scale.x=c.l/size.x;g.scale.z=c.w/size.z;g.position.set(c.cx,c.brand==='smart'?.10:0,-c.cy);g.rotation.y=c.angle*Math.PI/180;return g;
  }
  function seat(q,parent){const g=new T.Group();parent.add(g);g.position.set(q.cx,0,-q.cy);const tables=state.furniture.filter(f=>f.type==='table'&&f.zone===q.zone);const nearest=tables.sort((a,b)=>Math.hypot(a.cx-q.cx,a.cy-q.cy)-Math.hypot(b.cx-q.cx,b.cy-q.cy))[0];let angle=q.angle||0;if(nearest)angle=Math.atan2(nearest.cy-q.cy,nearest.cx-q.cx)*180/Math.PI+90;g.rotation.y=angle*Math.PI/180;
    if(q.type==='sofa'||q.type==='armchair'){const w=q.w,d=q.h;box(0,.35,0,w,.32,d,M.upholstery,g);box(0,.68,-d*.39,w,.42,.18,M.upholstery,g);for(const x of [-w/2+.08,w/2-.08])box(x,.57,0,.16,.31,d,M.upholstery,g);const n=q.seats||1;for(let i=0;i<n;i++)box(-w/2+.16+(w-.32)*(i+.5)/n,.54,.04,(w-.34)/n-.02,.09,d*.63,M.upholstery,g);for(const x of [-w/2+.15,w/2-.15])for(const z of [-d/2+.15,d/2-.15])cylinder(x,.1,z,.035,.2,M.steel,g);if(q.id==='AS1')g.rotation.y=Math.PI;}
    else{box(0,.47,0,.5,.07,.47,M.upholstery,g);box(0,.7,-.21,.48,.43,.065,M.upholstery,g);for(const x of [-.2,.2])for(const z of [-.17,.17])tube([x,.04,z],[x,.45,z],.017,M.steel,g);for(const x of [-.25,.25]){tube([x,.5,-.18],[x,.68,-.18],.014,M.steel,g);box(x,.68,0,.035,.03,.38,M.upholstery,g);}}
    return g;
  }
  function furniture(q,parent){if(['chair','armchair','sofa'].includes(q.type))return seat(q,parent);const g=new T.Group();g.position.set(q.cx,0,-q.cy);g.rotation.y=(q.angle||0)*Math.PI/180;g.userData={id:q.id,type:q.type};parent.add(g);
    if(q.type==='table'){const smart=q.zone==='smart-module',round=q.round;if(round){cylinder(0,.74,0,q.w/2,.055,M.white,g);cylinder(0,.36,0,.055,.7,M.steel,g);cylinder(0,.035,0,.28,.045,M.blackStone,g);}else{box(0,.75,0,q.w,.065,q.h,smart?M.white:M.wood,g);for(const x of [-q.w/2+.1,q.w/2-.1])box(x,.36,0,.045,.72,q.h*.74,M.steel,g);} }
    else if(q.type==='counter'){box(0,.51,0,q.w,1.02,q.h,M.wood,g);box(0,.52,q.h/2+.01,q.w-.15,.86,.025,M.blackStone,g);box(0,1.045,0,q.w+.05,.045,q.h+.08,M.blackStone,g);for(const x of [-1.6,1.6]){box(x,1.21,0,.52,.32,.055,M.dark,g);box(x,1.07,0,.2,.03,.2,M.steel,g);}sign('CHITCHAI',0,.62,q.h/2+.027,1.5,.19,0,g,'#e2e2dc','#293034');}
    else if(q.type==='background-wall'){box(0,1.27,0,q.w,2.54,q.h,M.platform,g);sign('smart',-.9,1.94,q.h/2+.018,1.6,.5,0,g,'#eef3f1','#929b97');for(const x of [-q.w/2+.05,q.w/2-.05])box(x,1.25,q.h/2+.015,.035,2.4,.025,M.green,g);}
    else if(q.type==='screen'){const isKit=q.id==='LED';const w=isKit?1.66:q.h,h=w*9/16;box(0,1.68,0,q.w,.98,q.h,M.dark,g);if(isKit){const o=sign('smart — open your mind',0,1.7,.077,w,h,0,g,'#e6eabe','#435150');}else{sign('CHITCHAI',.09,1.7,0,1.2,.68,Math.PI/2,g);}}
    else if(q.type==='charger'){box(0,.72,0,.22,1.44,.19,M.dark,g);box(0,1.05,.115,.26,.34,.07,M.white,g);const points=[new T.Vector3(.12,.91,.19),new T.Vector3(.3,.59,.15),new T.Vector3(.21,.38,.15),new T.Vector3(-.08,.51,.16),new T.Vector3(-.13,1,.16)];mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points),24,.016,7,false),M.dark,g);}
    else if(q.type==='price-stand'){box(0,.045,0,q.w,.08,q.h,M.steel,g);box(0,.51,0,.055,.93,.055,M.steel,g);const p=box(0,1.01,0,.27,.4,.035,M.dark,g);p.rotation.x=-.25;sign(q.id==='EP'?'smart':q.id.split('-')[0],0,1.06,.038,.22,.28,0,g,'#25333a','#edf0e9');}
    else if(q.type==='floor-lamp'){cylinder(0,.025,0,.2,.05,M.steel,g);cylinder(0,.83,0,.018,1.6,M.steel,g);const sh=mesh(new T.CylinderGeometry(.16,.26,.32,30),new T.MeshStandardMaterial({color:'#e8e2cf',emissive:'#dbd0a7',emissiveIntensity:.4}),g);sh.position.y=1.63;}
    else if(q.type==='cabinet'||q.type==='hospitality'){box(0,.48,0,q.w,.96,q.h,M.wood,g);box(0,.98,0,q.w+.03,.035,q.h+.03,M.blackStone,g);for(let x=-q.w/2+.25;x<q.w/2;x+=.55)box(x,.59,q.h/2+.008,.015,.45,.012,M.steel,g);}
    return g;
  }
  function module(state){slab(state.module.shape,.018,.065,M.platform,dynamic);slab(state.module.carpet,.09,.014,M.fabric,dynamic);const p=state.module.shape;for(let i=0;i<p.length;i++){const a=p[i],b=p[(i+1)%p.length];tube([a[0],.09,-a[1]],[b[0],.09,-b[1]],.018,M.green,dynamic);}}
  function line(points,color,parent=markings){const g=new T.BufferGeometry().setFromPoints(points.map(p=>new T.Vector3(...p)));const o=new T.Line(g,new T.LineBasicMaterial({color,transparent:true,opacity:.75}));parent.add(o);return o;}
  function setMode(next){mode=next;state=dataset.states.find(s=>s.mode===mode);while(dynamic.children.length){const child=dynamic.children[0];dynamic.remove(child);child.traverse(o=>{if(o.geometry)o.geometry.dispose();});}module(state);state.cars.forEach((c,i)=>car(c,i,dynamic));state.furniture.forEach(q=>furniture(q,dynamic));
    if(mode==='handover'){glassWall(32,8,40,8,3.15,dynamic);}
    else{glassWall(32,8,32.4,8,3.15,dynamic);glassWall(34.8,8,40,8,3.15,dynamic);glassWall(32,2.5,32,2.7,3.15,dynamic,M.optionalGlass);glassWall(32,3.9,32,8,3.15,dynamic,M.optionalGlass);glassWall(32,2.7,32,3.9,3.15,dynamic,M.optionalGlass);planBox(34.94,8,.25,.55,3.12,M.optionalGlass,0,dynamic);planBox(37.5,7.87,1.05,.25,.3,M.white,2.6,dynamic);}
    document.getElementById('state-status').textContent=mode==='handover'?'MB 4 แสดง + 1 Handover · smart 1 / 3B · ห้องแอร์เดิม 10 ที่':'MB 5 แสดง + smart 1 / 3B · ห้องแอร์เดิม 10 + ส่วนขยาย 8 ที่ · ที่เก็บ furniture นอกโมเดลรอยืนยัน';document.getElementById('mode').value=mode;
    const note=mode==='handover'?'MB5: หน้า–ท้าย ~15 ซม. / รอตรวจระยะใช้งาน':'MB5 ช่องแสดง: ท้ายชิดแนว service ~5 ซม. / รอตรวจ circulation';root.querySelector('.issue').textContent=note;const tag=labelItems.find(q=>q.el.classList.contains('warning'));if(tag){const c=state.cars.find(c=>c.id==='MB5');tag.point.set(c.cx,2.3,-c.cy);tag.el.textContent=mode==='handover'?'MB5 · หน้า–ท้าย 0.15 m / HOLD':'MB5 · ชิด service 0.05 m / HOLD';}dirty=true;
  }
  // Review overlays are not proposed floor graphics.
  for(const x of [0,8,16,24,32,40]){line([[x,.025,0],[x,.025,-16]],'#b98738');floorLabel('LX'+x/8,x,16.6,1);}
  for(const [id,y] of [['H',0],['G',2.5],['F',8],['E',16]]){line([[0,.025,-y],[40,.025,-y]],'#b98738');floorLabel(id,-.65,y,.7);}
  const clearMat=new T.MeshBasicMaterial({color:'#c9e7d0',transparent:true,opacity:.22,depthWrite:false});planBox(29.75,12,4.5,8,.015,clearMat,.017,markings);floorLabel('SERVICE ACCESS — KEEP CLEAR',29.75,13.5,4,markings);
  const warningMat=new T.MeshBasicMaterial({color:'#efa554',transparent:true,opacity:.13,depthWrite:false});planBox(36,5.25,8,5.5,.01,warningMat,.025,markings);
  addLabel('3B · 8.65 × 6.63 m',4,2.95,-4);addLabel('ทางไป SERVICE · ไม่วาง ST',29.75,.8,-14);addLabel('MB5 · หน้า–ท้าย 0.15 m / HOLD',36.6,2.3,-5.25,true);addLabel('ห้องแอร์เดิม',36,2.2,-12);
  const presets={interior:{p:[27.9,2.05,-4.1],t:[9.4,1.42,-6.2],ceiling:true,title:'จากทางเข้า · มองสู่ smart และ counter เดิม'},smart:{p:[9.2,2.4,-3.9],t:[2.8,1.22,-5.2],ceiling:true,title:'smart Module 3B · ครบหนึ่งชุด'},handover:{p:[33.2,2.05,-2.8],t:[36.8,1.1,-7.4],ceiling:true,title:'Vehicle Handover · MB5 หันสู่ด้านหน้า entrance'},service:{p:[28.2,2.0,-6.7],t:[29.75,1.4,-15.5],ceiling:true,title:'ทางเข้า–ออกศูนย์บริการ · ยกเลิก ST'},overview:{p:[48,33,27],t:[20,0,-7.5],ceiling:false,title:'ภาพรวมสามมิติ · มุมตัดซ่อนฝ้าเพื่อดูผัง'},plan:{p:[20,49,-7.9],t:[20,0,-8],ceiling:false,title:'มองจากด้านบน · แกนยาว MB5 ตั้งฉาก'} };
  presets.handover.p=[30.4,2.15,-4.8];presets.handover.t=[36.5,1.15,-6.1];
  presets.overview.p=[39,24,17];presets.plan.p=[20,26,-7.9];
  function updateCaption(){document.getElementById('view-title').textContent=activeView==='handover'&&mode==='lounge-ac'?'Optional · ห้องรับรองแอร์ส่วนขยาย เชื่อมห้องเดิม':presets[activeView].title;}
  function setView(v){activeView=v;const p=presets[v];camera.position.set(...p.p);target.set(...p.t);if(v==='plan'||v==='overview'){const k=Math.max(1,1.8/camera.aspect);camera.position.sub(target).multiplyScalar(k).add(target);}camera.lookAt(target);overhead.visible=p.ceiling;document.getElementById('ceiling').checked=p.ceiling;root.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.view===v)));updateCaption();dirty=true;}
  function orbit(dx,dy){const v=camera.position.clone().sub(target),s=new T.Spherical().setFromVector3(v);s.theta-=dx*.006;s.phi=T.MathUtils.clamp(s.phi-dy*.006,.04,Math.PI/2+.05);camera.position.copy(target).add(new T.Vector3().setFromSpherical(s));camera.lookAt(target);dirty=true;}
  function zoom(f){const v=camera.position.clone().sub(target);v.multiplyScalar(f);v.clampLength(.6,110);camera.position.copy(target).add(v);dirty=true;}
  function pan(dx,dy){const distance=camera.position.distanceTo(target),right=new T.Vector3().setFromMatrixColumn(camera.matrix,0),up=new T.Vector3().setFromMatrixColumn(camera.matrix,1);const v=right.multiplyScalar(-dx*distance*.0018).add(up.multiplyScalar(dy*distance*.0018));camera.position.add(v);target.add(v);dirty=true;}
  const pointers=new Map();let lastPinch=0;
  renderer.domElement.addEventListener('contextmenu',e=>e.preventDefault());renderer.domElement.addEventListener('pointerdown',e=>{renderer.domElement.setPointerCapture(e.pointerId);pointers.set(e.pointerId,{x:e.clientX,y:e.clientY,button:e.button});});
  renderer.domElement.addEventListener('pointermove',e=>{const old=pointers.get(e.pointerId);if(!old)return;const dx=e.clientX-old.x,dy=e.clientY-old.y;pointers.set(e.pointerId,{x:e.clientX,y:e.clientY,button:old.button});if(pointers.size===2){const a=[...pointers.values()],d=Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y);if(lastPinch)zoom(lastPinch/d);lastPinch=d;}else if(old.button===2||e.shiftKey)pan(dx,dy);else orbit(dx,dy);});
  for(const event of ['pointerup','pointercancel'])renderer.domElement.addEventListener(event,e=>{pointers.delete(e.pointerId);lastPinch=0;});renderer.domElement.addEventListener('wheel',e=>{e.preventDefault();zoom(Math.exp(e.deltaY*.001));},{passive:false});
  root.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>setView(b.dataset.view)));document.getElementById('mode').addEventListener('change',e=>{setMode(e.target.value);updateCaption();});document.getElementById('ceiling').addEventListener('change',e=>{overhead.visible=e.target.checked;dirty=true;});document.getElementById('labels').addEventListener('change',e=>{labelsOn=e.target.checked;markings.visible=labelsOn;dirty=true;});
  function resize(){const w=host.clientWidth,h=host.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();dirty=true;}
  new ResizeObserver(resize).observe(host);
  function draw(){if(dirty){renderer.render(scene,camera);for(const q of labelItems){const p=q.point.clone().project(camera);q.el.hidden=!labelsOn||p.z>1||p.z<0||Math.abs(p.x)>.93||Math.abs(p.y)>.9;q.el.style.left=((p.x+1)*.5*host.clientWidth)+'px';q.el.style.top=((-p.y+1)*.5*host.clientHeight)+'px';}dirty=false;}requestAnimationFrame(draw);}
  markings.visible=false;setMode('handover');setView('interior');resize();draw();document.getElementById('loading').hidden=true;
  function setReviewLocation(q){
    while(reviewMarker.children.length){const o=reviewMarker.children[0];reviewMarker.remove(o);o.geometry?.dispose();o.material?.dispose();}
    if(q.type==='point'||q.type==='rectangle'){
      const mat=new T.MeshBasicMaterial({color:'#0078d6',transparent:true,opacity:.8,depthTest:false,depthWrite:false,side:T.DoubleSide});
      const ring=new T.Mesh(new T.RingGeometry(.27,.44,40),mat);ring.rotation.x=-Math.PI/2;ring.position.set(q.x,.16,-q.y);ring.renderOrder=20;reviewMarker.add(ring);
      if(q.type==='rectangle'){const rect=new T.Mesh(new T.PlaneGeometry(q.x2-q.x,q.y2-q.y),mat.clone());rect.material.opacity=.24;rect.rotation.x=-Math.PI/2;rect.position.set((q.x+q.x2)/2,.14,-(q.y+q.y2)/2);rect.renderOrder=19;reviewMarker.add(rect);}
    }dirty=true;
  }
  window.BC_VIEWER={setMode,setView,setReviewLocation,setLabels(v){labelsOn=v;markings.visible=v;document.getElementById('labels').checked=v;dirty=true;},setCeiling(v){overhead.visible=v;document.getElementById('ceiling').checked=v;dirty=true;},snapshot(){renderer.render(scene,camera);return renderer.domElement.toDataURL('image/jpeg',.94);},inspect(){return {revision:'v04',mode,view:activeView,vehicles:dynamic.children.filter(o=>o.userData.kind==='vehicle').map(o=>({id:o.name,position:o.position.toArray(),rotation:o.rotation.y,bounds:new T.Box3().setFromObject(o).getSize(new T.Vector3()).toArray()})),ST:state.furniture.some(q=>q.id==='ST'),serviceReserve:state.serviceAccessReserve,ceiling:overhead.visible,glRenderer:renderer.getContext().getParameter(renderer.getContext().RENDERER),drawCalls:renderer.info.render.calls};},scene,camera};
})();
