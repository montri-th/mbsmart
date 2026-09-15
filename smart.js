/* Authored smart #5 / 3B study, v07. NOT manufacturer CAD or approved finish artwork.
 * Vehicle outer dimensions follow smart UK and the official Premium specification.
 * All sculpted surfaces / secondary details are interpreted from official imagery.
 * No downloaded marketing photographs or third-party texture bytes are embedded here.
 */
window.BC_SMART=function(T,H){
 'use strict';
 const {mesh,box,tube,planBox,slab,sign,sphere,cylinder,M}=H;
 const mat=(color,roughness=.5,metalness=0)=>new T.MeshStandardMaterial({color,roughness,metalness,envMapIntensity:.65});
 function rounded(w,h,d,r,m,g){r=Math.min(r,w/3,h/3,d/3);w-=r*2;h-=r*2;const s=new T.Shape(),x=-w/2,y=-h/2;
  s.moveTo(x+r,y);s.lineTo(x+w-r,y);s.quadraticCurveTo(x+w,y,x+w,y+r);s.lineTo(x+w,y+h-r);s.quadraticCurveTo(x+w,y+h,x+w-r,y+h);s.lineTo(x+r,y+h);s.quadraticCurveTo(x,y+h,x,y+h-r);s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);
  const o=mesh(new T.ExtrudeGeometry(s,{depth:d-2*r,bevelEnabled:true,bevelSegments:3,steps:1,bevelSize:r,bevelThickness:r,curveSegments:8}),m,g);o.position.z=-d/2+r;return o;
 }
 function rb(x,y,z,w,h,d,r,m,g){const p=new T.Group();g.add(p);p.position.set(x,y,z);rounded(w,h,d,r,m,p);return p;}
 function curve(points,r,m,g){const geo=new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),40,r,8,false),p=geo.attributes.position;for(let i=0;i<p.count;i++)if(p.getY(i)>1.705)p.setY(i,1.705);geo.computeVertexNormals();return mesh(geo,m,g);} // Bound spline overshoot to published vehicle height.
 function poly(points,m,g){m.side=T.DoubleSide;const geo=new T.BufferGeometry(),v=[];for(let i=1;i<points.length-1;i++)v.push(...points[0],...points[i],...points[i+1]);geo.setAttribute('position',new T.Float32BufferAttribute(v,3));geo.computeVertexNormals();return mesh(geo,m,g);}
 function icon(g,x,y,z,size,m){ // Dimensioned study of the familiar mark, not production artwork.
  const ring=mesh(new T.TorusGeometry(size*.30,size*.10,12,36,Math.PI*1.5),m,g);ring.position.set(x-size*.09,y,z);ring.rotation.z=Math.PI*.25;
  poly([[x+size*.20,y+size*.38,z],[x+size*.50,y,z],[x+size*.20,y-size*.38,z]],m,g);
 }
 function car(c,parent){
  const g=new T.Group();parent.add(g);g.name=c.id;g.userData={id:c.id,kind:'vehicle',brand:'smart',model:'smart #5 Premium',geometry:'authored approximation',dimensionalEnvelope:[4.695,2.169,1.705]};
  const paint=new T.MeshPhysicalMaterial({color:'#b6ad94',metalness:.23,roughness:.58,clearcoat:.08,clearcoatRoughness:.75,envMapIntensity:.6});
  const roof=mat('#11181d',.20,.15),rubber=mat('#1b2022',.87),silver=mat('#bfc5c8',.27,.85),black=mat('#171e23',.35),leather=mat('#24282b',.91),stitch=mat('#8a8580',.8);
  roof.color.set('#05090d');roof.roughness=.30;roof.metalness=.04;roof.envMapIntensity=.16;leather.envMapIntensity=.12;paint.envMapIntensity=.30;
  const glass=new T.MeshPhysicalMaterial({color:'#293943',roughness:.12,metalness:.03,transparent:true,opacity:.64,depthWrite:false,side:T.DoubleSide,envMapIntensity:.12});
  const whiteLight=new T.MeshStandardMaterial({color:'#f5ffff',emissive:'#d9f6ff',emissiveIntensity:2.1,roughness:.3});
  const redLight=new T.MeshStandardMaterial({color:'#b13320',emissive:'#e33722',emissiveIntensity:1.2,roughness:.3});
  // One side silhouette extruded across the body, with real open wheel-arch cutouts.
  const s=new T.Shape();s.moveTo(-2.2675,.29);s.lineTo(-1.875,.29);s.lineTo(-1.875,.369);s.absarc(-1.4075,.369,.4675,Math.PI,0,true);s.lineTo(-.94,.25);s.lineTo(1.025,.25);s.lineTo(1.025,.369);s.absarc(1.4925,.369,.4675,Math.PI,0,true);s.lineTo(1.96,.29);s.lineTo(2.2675,.29);s.quadraticCurveTo(2.2675,.9,2.20,.98);s.quadraticCurveTo(1.90,1.12,1.13,1.13);s.lineTo(-1.97,1.15);s.quadraticCurveTo(-2.2675,1.06,-2.2675,.86);s.closePath();
  const body=mesh(new T.ExtrudeGeometry(s,{depth:1.84,bevelEnabled:true,bevelSegments:4,bevelSize:.04,bevelThickness:.04,curveSegments:24}),paint,g);body.position.z=-.92;
  // Bonnet crown and shoulder surfaces are smooth and deliberately restrained for matte paint.
  rb(1.59,1.052,0,1.3,.11,1.70,.03,paint,g);
  rb(-.05,.25,0,4.40,.17,1.81,.035,rubber,g);
  for(const side of [-1,1]){
   const z=side*.927;
   for(const axle of [-1.4075,1.4925]){
    const a=[];for(let j=0;j<=32;j++){const t=j*Math.PI/32;a.push([axle+.454*Math.cos(t),.369+.454*Math.sin(t),z]);}curve(a,.033,rubber,g);
   }
   rb(.05,.34,side*.956,1.85,.095,.014,.004,silver,g);
   // A/B/C/D pillars and rounded side-window outline, long and upright like #5.
   const outline=[[-2.00,1.13,side*.865],[-1.93,1.57,side*.787],[-1.67,1.63,side*.78],[.36,1.63,side*.78],[.60,1.55,side*.798],[1.12,1.12,side*.865]];
   const windowOutline=[[-1.83,1.145,side*.881],[-1.80,1.53,side*.817],[-1.59,1.58,side*.807],[.34,1.58,side*.807],[.55,1.49,side*.832],[.99,1.145,side*.894]];
   poly(windowOutline,glass,g); // Only edge strips frame the actual transparent window aperture.
   curve([...outline,outline[0]],.048,paint,g);curve([...windowOutline,windowOutline[0]],.013,silver,g);
   tube([.14,1.14,side*.89],[.14,1.60,side*.81],.036,black,g);
   tube([-1.13,1.145,side*.886],[-1.19,1.59,side*.812],.019,black,g);
   poly([[-2.0,1.11,side*.86],[-1.94,1.60,side*.79],[-1.62,1.63,side*.79],[-1.74,1.12,side*.89]],paint,g);
   // Flush handles, door shut lines, charging flap and fender garnish.
   for(const [x,a] of [[.17,.17],[-1.18,-1.25]]){
    curve([[a,a<0?.88:.30,side*.958],[a,1.05,side*.955],[a-.05,1.145,side*.89]],.0035,black,g);
    rb(x+.16,1.015,side*.965,.235,.032,.011,.003,paint,g);
   }
   rb(.995,1.015,side*.96,.16,.11,.015,.005,black,g);
   if(side===1){rb(-1.89,.975,.965,.26,.18,.006,.002,paint,g);curve([[-2.01,.90,.97],[-2.01,1.06,.97],[-1.77,1.06,.97],[-1.77,.90,.97],[-2.01,.90,.97]],.003,black,g);}
   tube([.79,1.10,side*.87],[.78,1.20,side*.982],.025,black,g);
   rb(.80,1.26,side*1.008, .25,.14,.153,.02,paint,g);rb(.674,1.26,side*1.008,.009,.096,.121,.003,silver,g);
   const badge=mesh(new T.CylinderGeometry(.062,.062,.014,32),black,g);badge.rotation.x=Math.PI/2;badge.position.set(-1.83,1.46,side*.86);
  }
  // Windscreen and tail glazing: transparent surfaces reveal the Shadow Black interior.
  poly([[1.10,1.12,-.845],[1.10,1.12,.845],[.40,1.61,.772],[.40,1.61,-.772]],glass,g);
  poly([[-2.04,1.13,.81],[-2.04,1.13,-.81],[-1.97,1.60,-.75],[-1.97,1.60,.75]],glass,g);
  rb(-.78,1.635,0,2.64,.075,1.58,.020,paint,g);rb(-.70,1.682,0,2.10,.009,1.40,.002,roof,g);
  for(const z of [-.674,.674])curve([[-1.80,1.68,z],[-1.60,1.694,z],[.14,1.694,z],[.35,1.68,z]],.011,roof,g);
  rb(-2.045,1.61,0,.23,.058,1.59,.012,paint,g);
  // Premium 20-inch Sundial wheel interpretation, real 2900 mm axle spacing.
  for(const [wx,track] of [[1.4925,1.653],[-1.4075,1.658]])for(const side of [-1,1]){
   const z=side*track/2,wg=new T.Group();g.add(wg);wg.position.set(wx,.36875,z);wg.rotation.x=Math.PI/2;
   const tyreProfile=[[.254,-.1275],[.329,-.1275],[.361,-.09],[.36875,-.06],[.36875,.06],[.361,.09],[.329,.1275],[.254,.1275],[.254,-.1275]].map(p=>new T.Vector2(...p));
   const tyre=mesh(new T.LatheGeometry(tyreProfile,64),rubber,wg); // Hollow tyre: never hide the alloy faces with a cylinder end cap.
   const face=side*.118;
   const rim=mesh(new T.CylinderGeometry(.254,.254,.218,60),black,wg);
   const edge=mesh(new T.TorusGeometry(.249,.008,8,64),silver,wg);edge.rotation.x=Math.PI/2;edge.position.y=face;
   for(let i=0;i<5;i++){
    const a=i*Math.PI*2/5,seg=new T.Shape();seg.moveTo(.07,-.034);seg.lineTo(.215,-.095);seg.quadraticCurveTo(.25,0,.222,.095);seg.lineTo(.087,.060);seg.closePath();
    const o=mesh(new T.ExtrudeGeometry(seg,{depth:.006,bevelEnabled:true,bevelSegments:2,bevelSize:.002,bevelThickness:.002}),silver,wg);o.rotation.set(-side*Math.PI/2,0,a);o.position.y=face;
   }
   const hub=mesh(new T.CylinderGeometry(.072,.072,.253,24),silver,wg);
   for(let i=0;i<36;i++){const a=i*Math.PI/18;const b=box(Math.cos(a)*.336,0,Math.sin(a)*.336,.009,.252,.027,rubber,wg);b.rotation.y=-a;}
  }
  // Four connected light capsules and two outboard stacked lamps distinguish #5 at both ends.
  for(const [x,sgn,light] of [[2.3225,1,whiteLight],[-2.3225,-1,redLight]]){
   rb(x,.962,0,.020,.036,1.58,.004,black,g);
   for(const z of [-.48,-.16,.16,.48]){rb(x+sgn*.012,.928,z,.019,.055,.163,.004,black,g);rb(x+sgn*.017,.932,z,.008,.023,.118,.002,light,g);}
   for(const side of [-1,1]){rb(x-sgn*.018,.866,side*.765,.056,.223,.276,.012,black,g);for(const y of [.827,.925])rb(x+sgn*.014,y,side*.772,.011,.029,.19,.003,light,g);}
   rb(x-sgn*.012,.454,0,.046,.287,1.36,.01,silver,g);rb(x+sgn*.013,.476,0,.015,.230,.91,.004,black,g);
   for(const z of [-.584,.584])for(let i=0;i<5;i++)rb(x+sgn*.013,.365+i*.044,z,.013,.01,.146,.002,black,g);
   rb(x+sgn*.018,.466,0,.014,.141,.448,.003,black,g);sign('#5',x+sgn*.025,.472,0,.32,.095,sgn*Math.PI/2,g,'#efefec','#171e23');
   sign('smart',x-sgn*.018,1.055,0,.31,.07,sgn*Math.PI/2,g,'#cfd4d5','#a69e88');
  }
  // Five-seat black cabin, right-hand drive, dual wide displays and blue ambient accents.
  rb(-.39,.70,0,2.85,.075,1.55,.02,leather,g);
  function cabinSeat(x,z){rb(x,.75,z,.52,.15,.52,.028,leather,g);const b=rb(x-.19,1.025,z,.15,.52,.49,.025,leather,g);b.rotation.z=-.10;rb(x-.235,1.338,z,.13,.18,.29,.025,leather,g);for(const dz of [-.205,.205])curve([[x+.15,.835,z+dz],[x-.1,.835,z+dz],[x-.13,1.26,z+dz]],.0025,stitch,g);}
  cabinSeat(.12,-.45);cabinSeat(.12,.45);cabinSeat(-1.06,-.45);cabinSeat(-1.06,.45);rb(-1.15,1.21,0,.15,.3,.26,.022,leather,g);
  rb(.75,1.03,0,.42,.22,1.53,.03,leather,g);rb(.515,1.095,.18,.018,.24,.96,.005,black,g);
  for(const z of [-.06,.405])sign('smart',.502,1.097,z,.39,.19,-Math.PI/2,g,'#9bacb4','#18313c');
  const steer=mesh(new T.TorusGeometry(.174,.019,10,40),leather,g);steer.rotation.y=Math.PI/2;steer.position.set(.37,1.04,-.45);box(.37,1.04,-.45,.03,.072,.17,black,g);tube([.38,.88,-.45],[.38,1.04,-.45],.018,silver,g);
  rb(-.05,.845,0,.8,.19,.29,.02,leather,g);for(const x of [-.13,.045]){const cup=mesh(new T.CylinderGeometry(.045,.045,.015,20),black,g);cup.position.set(x,.949,0);}
  const blue=new T.MeshStandardMaterial({color:'#639cc2',emissive:'#327eff',emissiveIntensity:1.2});tube([.53,1.035,-.7],[.53,1.035,.7],.0025,blue,g);
  g.position.set(c.cx,.103,-c.cy);g.rotation.y=c.angle*Math.PI/180;
  return g;
 }
 function furniture(q,parent){
  const g=new T.Group();parent.add(g);g.userData={id:q.id,type:q.type,source:'D01 pp20-22'};g.position.set(q.cx,.103,-q.cy);g.rotation.y=(q.angle||0)*Math.PI/180;
  const alu=mat('#aaaead',.38,.62),pale=mat('#d3c4a8',.68),chairGrey=mat('#858987',.85),edge=mat('#dcdedb',.27,.3);
  if(q.type==='window-logo'){
   g.position.y=q.centerHeight;
   // Type4 is the indoor-window installation (D01p8), NOT size SL4.
   // Extrude the unchanged official paths, with real dark backs visible indoors.
   // Fit uniformly inside the provisional SL2 envelope; never stretch the logo.
   const brand=window.BC_SMART_BRAND_DATA,envelope=q.sizeEnvelope||[.98,1.32],scale=Math.min(envelope[0]/70,envelope[1]/95),depth=q.depthProxy??.035;
   const front=mat('#fafbf5',.30),returns=mat('#c8cbca',.4,.55),back=mat('#555b5c',.6,.2);
   front.emissive=new T.Color('#ffffff');front.emissiveIntensity=.8;
   function sourceShapes(p){
    const tokens=p.d.match(/[MLHVCZ]|[-+]?(?:\d*\.\d+|\d+\.?\d*)(?:[eE][-+]?\d+)?/g),sp=new T.ShapePath();let i=0,cmd,x=0,y=0,sx=0,sy=0;
    const xy=(a,b)=>{const [m,n,o,r,tx,ty]=p.transform;return [(m*a+o*b+tx-35)*scale,(47.5-n*a-r*b-ty)*scale];};
    const n=()=>{if(i>=tokens.length||/^[A-Z]$/.test(tokens[i]))throw Error('Invalid official smart path');return Number(tokens[i++]);};
    while(i<tokens.length){if(/^[A-Z]$/.test(tokens[i]))cmd=tokens[i++];
     if(cmd==='M'){x=n();y=n();sx=x;sy=y;sp.moveTo(...xy(x,y));cmd='L';}
     else if(cmd==='L'){x=n();y=n();sp.lineTo(...xy(x,y));}
     else if(cmd==='H'){x=n();sp.lineTo(...xy(x,y));}
     else if(cmd==='V'){y=n();sp.lineTo(...xy(x,y));}
     else if(cmd==='C'){const a=n(),b=n(),c=n(),d=n();x=n();y=n();sp.bezierCurveTo(...xy(a,b),...xy(c,d),...xy(x,y));}
     else if(cmd==='Z'){sp.currentPath.closePath();x=sx;y=sy;cmd=null;}
     else throw Error('Unsupported official smart path command '+cmd);
    }
    // Y inversion makes the source outer contours CCW; preserve the a-counter.
    return sp.toShapes(true);
   }
   for(const p of brand.paths){const shapes=sourceShapes(p),geo=new T.ExtrudeGeometry(shapes,{depth,bevelEnabled:false,curveSegments:20});
    // Extrude cap group contains front and rear; assign by actual cap normal.
    const normals=geo.attributes.normal;geo.clearGroups();let start=0,last=-1;for(let i=0;i<normals.count;i+=3){const nz=normals.getZ(i),material=nz>.99?0:nz<-.99?2:1;if(material!==last){if(i>start)geo.addGroup(start,i-start,last);start=i;last=material;}}if(normals.count>start)geo.addGroup(start,normals.count-start,last);
    const letter=mesh(geo,[front,returns,back],g);letter.name='TYPE4-RAISED-'+p.id;letter.userData={sourcePathSha256:p.sourcePathSha256,sourcePathUnmodified:true,installationType:4,depthProxy:depth,manufacturerCAD:false};
   }
   for(const [i,x]of [-.31,.24].entries()){const carrier=box(x,.09,-.052,.012,2.08,.022,M.dark,g);carrier.name='TYPE4-VERTICAL-CARRIER-'+(i+1);}
   g.userData={...g.userData,source:'D01p8 Type4 indoor-window installation / p9 SL2 study; smart UK unchanged symbol and wordmark paths',panelCentre:q.cx,illuminated:true,faceDirection:'outward-plan-negative-Y',backVisibleIndoors:true,sizeEnvelope:envelope,sourceScale:scale,mountingApproval:false,electricalSpecificationVerified:false,depthAndCarriers:'unmeasured visual proxies, supplier design pending'};
  }else if(q.type==='background-wall'){
   // D01 p20/21 + owner: softer trapezoid ELEVATION, not rectangular slab.
   // Silhouette rounding is independent of the thin wall depth. These corner
   // trims/taper are visual proxies; source supplies no fabrication radii.
   const p=q.elevationProfile;if(!p)throw Error('Missing Module3B elevation profile');
   const y0=p.bottomHeight,y1=y0+p.height,points=[[-p.bottomWidth/2,y0],[p.bottomWidth/2,y0],[p.topWidth/2,y1],[-p.topWidth/2,y1]],entry=[],exit=[];
   for(let i=0;i<4;i++){const v=points[i],a=points[(i+3)%4],b=points[(i+1)%4],r=i<2?p.bottomCornerTrim:p.topCornerTrim,da=Math.hypot(a[0]-v[0],a[1]-v[1]),db=Math.hypot(b[0]-v[0],b[1]-v[1]);entry.push([v[0]+(a[0]-v[0])*r/da,v[1]+(a[1]-v[1])*r/da]);exit.push([v[0]+(b[0]-v[0])*r/db,v[1]+(b[1]-v[1])*r/db]);}
   const shape=new T.Shape();shape.moveTo(...entry[0]);for(let i=0;i<4;i++){shape.quadraticCurveTo(...points[i],...exit[i]);shape.lineTo(...entry[(i+1)%4]);}shape.closePath();
   const wall=mesh(new T.ExtrudeGeometry(shape,{depth:p.thickness,bevelEnabled:false,curveSegments:32}),alu,g);wall.position.z=-p.thickness/2;wall.name='SMART-3B-ROUNDED-TRAPEZOID-BACKDROP';wall.userData={...p,cornerMethod:'quadratic silhouette fillets; trim distance is not a certified radius'};g.userData.elevationProfile={...p};
   for(let x=-1.95;x<=1.951;x+=.65)box(x,(y0+y1)/2,p.thickness/2+.004,.006,p.height-.035,.006,M.steel,g);
   tube([-p.bottomWidth/2+p.bottomCornerTrim,y0+.012,p.thickness/2+.01],[p.bottomWidth/2-p.bottomCornerTrim,y0+.012,p.thickness/2+.01],.013,new T.MeshStandardMaterial({color:'#fff8df',emissive:'#fff0c7',emissiveIntensity:1.8}),g);
   const wallLogo=mesh(new T.PlaneGeometry(.73,.73*95/70),window.BC_SMART_BRAND_MATERIAL(T),g);wallLogo.position.set(-1.73,1.79,.095);wallLogo.castShadow=false;wallLogo.name='MODULE-LOGO-SOURCE-PATHS';
  }else if(q.type==='screen'){
   rb(0,1.61,0,1.674,.948,.065,.008,blackMaterial(),g);
   const canvas=document.createElement('canvas');canvas.width=1280;canvas.height=720;const ctx=canvas.getContext('2d');ctx.fillStyle='#102124';ctx.fillRect(0,0,1280,720);
   const glow=ctx.createRadialGradient(910,420,30,910,420,510);glow.addColorStop(0,'#596052');glow.addColorStop(1,'#142629');ctx.fillStyle=glow;ctx.fillRect(0,0,1280,720);
   ctx.fillStyle='#eef0e6';ctx.font='500 65px Arial';ctx.fillText('smart #5',85,175);ctx.font='28px Arial';ctx.fillText('Open your mind.',88,230);ctx.fillStyle='#c7c1ab';ctx.font='22px Arial';ctx.fillText('Saturn Beige Matte',88,582);ctx.fillStyle='#d7ded1';ctx.font='17px Arial';ctx.fillText('SCREEN CONTENT STUDY · NOT APPROVED CAMPAIGN',88,648);
   ctx.strokeStyle='#dce7ae';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(470,478);ctx.bezierCurveTo(460,415,500,405,550,400);ctx.lineTo(635,294);ctx.quadraticCurveTo(658,268,703,268);ctx.lineTo(1048,268);ctx.quadraticCurveTo(1097,270,1108,330);ctx.lineTo(1127,465);ctx.lineTo(1068,478);ctx.bezierCurveTo(1070,401,973,401,968,478);ctx.lineTo(652,478);ctx.bezierCurveTo(653,400,558,400,550,478);ctx.closePath();ctx.stroke();
   const tx=new T.CanvasTexture(canvas);tx.colorSpace=T.SRGBColorSpace;const p=mesh(new T.PlaneGeometry(1.65,.928),new T.MeshBasicMaterial({map:tx}),g);p.position.set(0,1.61,.037);p.castShadow=false;
  }else if(q.type==='table'){
   // D01 p20/21: rectangular pale-wood negotiation desk, not a cafe pedestal.
   g.name='SMART-3B-CONSULT-DESK';g.userData={...g.userData,shape:'rectangular-slab-ended',finish:'pale wood',nominalPlanSize:[q.w,q.h],dimensionStatus:q.dimensionStatus};
   const deskTop=rb(0,.738,0,q.w-.016,.056,q.h-.016,.006,pale,g);deskTop.name='SC-RECTANGULAR-TOP';
   for(const [i,z] of [-q.h/2+.04,q.h/2-.04].entries()){const panel=box(0,.371,z,q.w,.712,.065,pale,g);panel.name='SC-SLAB-END-'+(i+1);}
   // Pale wood grain is authored with narrow tonal lines, not a stock texture.
   for(let i=0;i<30;i++)box(-q.w/2+.022+i*(q.w-.044)/30,.770,0,.001,.002,q.h-.04,i%3?edge:pale,g);
  }else if(q.type==='chair'){
   g.rotation.y=(q.facing||0)*Math.PI/180;rb(0,.475,0,.48,.075,.43,.012,chairGrey,g);rb(0,.71,-.19,.47,.39,.05,.009,chairGrey,g);
   for(let i=0;i<5;i++)box(0,.58+i*.059,-.157,.435,.006,.009,edge,g);
   for(const side of [-1,1]){tube([side*.237,.49,-.18],[side*.237,.67,-.18],.012,M.steel,g);tube([side*.237,.67,-.18],[side*.237,.67,.15],.014,M.steel,g);}
   cylinder(0,.258,0,.025,.38,M.steel,g);const n=q.role==='consultant'?5:4;for(let i=0;i<n;i++){const a=i*Math.PI*2/n;const x=Math.cos(a)*.255,z=Math.sin(a)*.255;tube([0,.13,0],[x,.038,z],.018,M.steel,g);if(n===5)sphere(x,.03,z,.03,M.dark,g);}
  }else if(q.type==='charger'){
   rb(0,.018,0,.36,.035,.4,.006,M.steel,g);rb(0,.80,0,.16,1.60,.14,.016,alu,g);rb(0,1.26,.09,.25,.36,.13,.035,M.white,g);rb(0,1.26,.165,.17,.20,.024,.006,M.dark,g);
   box(0,1.32,.18,.09,.01,.005,new T.MeshBasicMaterial({color:'#84c4a3'}),g);sign('smart',0,.94,.074,.16,.055,0,g,'#edf1eb','#969e9c');
   curve([[.07,1.1,.15],[.28,.93,.13],[.29,.41,.13],[.06,.30,.13],[-.16,.44,.13],[-.17,.91,.14],[-.10,1.05,.16]],.015,M.dark,g);rb(-.10,1.055,.16,.045,.13,.045,.005,M.dark,g);
  }else if(q.type==='price-stand'){
   rb(0,.015,0,.34,.03,.34,.004,M.steel,g);const stem=box(0,.515,0,.265,.98,.05,alu,g);stem.rotation.x=-.06;
   rb(0,1.115,.028,.285,.205,.021,.005,M.dark,g);sign('#5  Premium',0,1.122,.042,.253,.168,0,g,'#fafbf6','#152c32');sign('smart #5',0,.69,.058,.21,.16,0,g,'#333e42','#e4e8e3');sign('SPECIFICATION',0,.50,.058,.22,.08,0,g,'#4b5757','#e4e8e3');
  }else if(q.type==='linear-floor-light'){
   g.position.y=.094;box(0,.009,0,1.95,.016,.035,M.steel,g);box(0,.019,0,1.88,.01,.022,new T.MeshStandardMaterial({color:'#effbe0',emissive:'#cfff99',emissiveIntensity:2}),g);
  }
  return g;
 }
 function blackMaterial(){return mat('#101415',.25,.12);}
 function module(s,parent){
  // Rounded dimension-derived platform. Corner fillets are visual approximations, not supplier CAD.
  function roundedShape(points,r){const sh=new T.Shape();const entry=[],exit=[];for(let i=0;i<points.length;i++){const p=points[i],a=points[(i+points.length-1)%points.length],b=points[(i+1)%points.length],da=Math.hypot(a[0]-p[0],a[1]-p[1]),db=Math.hypot(b[0]-p[0],b[1]-p[1]);entry.push([p[0]+(a[0]-p[0])*r/da,p[1]+(a[1]-p[1])*r/da]);exit.push([p[0]+(b[0]-p[0])*r/db,p[1]+(b[1]-p[1])*r/db]);}sh.moveTo(...entry[0]);for(let i=0;i<points.length;i++){sh.quadraticCurveTo(...points[i],...exit[i]);sh.lineTo(...entry[(i+1)%points.length]);}sh.closePath();return sh;}
  const platform=new T.MeshPhysicalMaterial({color:'#dfdfd7',roughness:.38,metalness:.02,clearcoat:.12}),carpet=mat('#727875',.98);
  const sh=roundedShape(s.module.shape,.18),base=mesh(new T.ExtrudeGeometry(sh,{depth:.082,bevelEnabled:false,curveSegments:12}),platform,parent);base.rotation.x=-Math.PI/2;base.position.y=.018;
  slab(s.module.carpet,.101,.007,carpet,parent);
  // Fine felt stipple and aluminium edge; no false CGI texture marketed as a physical product sample.
  const p=sh.getPoints(20),edgeLED=new T.MeshStandardMaterial({color:'#e8f6d4',emissive:'#daf5ac',emissiveIntensity:1.65});for(let i=0;i<p.length-1;i++){tube([p[i].x,.09,-p[i].y],[p[i+1].x,.09,-p[i+1].y],.013,M.steel,parent);tube([p[i].x,.065,-p[i].y],[p[i+1].x,.065,-p[i+1].y],.008,edgeLED,parent);}
  // Flush slim light along the show-car side, kept clear of the desk/carpet.
  const a=s.module.shape[2],b=s.module.shape[3],v=new T.Vector2(b[0]-a[0],b[1]-a[1]).normalize();
  tube([a[0]+v.x*.35,.105,-a[1]-v.y*.35],[b[0]-v.x*.4,.105,-b[1]+v.y*.4],.012,new T.MeshStandardMaterial({color:'#e5f4c9',emissive:'#d0edb4',emissiveIntensity:1.1}),parent);
 }
 function lighting(parent,scene){
  const fixture=mat('#b2b7b3',.3,.65),em=new T.MeshStandardMaterial({color:'#eff7e4',emissive:'#e9f1d9',emissiveIntensity:1.4});
  // Dedicated suspended rectangle over the smart vehicle, not a change to Mercedes lighting.
  for(const [a,b] of [[[2.4,3.65,-4.4],[6.1,3.65,-4.4]],[[6.1,3.65,-4.4],[6.1,3.65,-7.7]],[[6.1,3.65,-7.7],[2.4,3.65,-7.7]],[[2.4,3.65,-7.7],[2.4,3.65,-4.4]]]){tube(a,b,.028,fixture,parent);tube([a[0],a[1]-.025,a[2]],[b[0],b[1]-.025,b[2]],.019,em,parent);}
  for(const x of [2.4,6.1])for(const y of [4.4,7.7])tube([x,3.68,-y],[x,6.85,-y],.0035,M.steel,parent);
  for(const [x,y] of [[2.1,4.9],[6.4,7.4]]){const l=new T.SpotLight('#fffaed',15,10,Math.PI/4,.75,2);l.position.set(x,3.58,-y);l.target.position.set(4.43,.8,-6.55);l.castShadow=true;l.shadow.mapSize.set(1024,1024);l.shadow.bias=-.0002;scene.add(l,l.target);}
 }
 return {car,furniture,module,lighting};
};
