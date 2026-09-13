/* Photo-interpreted existing Chinese shrine. Procedural geometry, not a surveyed replica.
 * Local coordinates: x across the front, y up, z toward the open front. Base = y 0.
 * No photographed texture, inscription, inferred deity name, or source screenshot is embedded.
 */
'use strict';
window.BC_SHRINE = (T, helpers = {}, options = {}) => {
  const root = new T.Group();
  root.name = 'EXISTING-CHINESE-SHRINE-PHOTO-INTERPRETATION';
  root.userData = {
    kind: 'existing-shrine', status: 'photo-interpreted; dimensions unmeasured',
    source: 'Owner-provided Street View screenshots: June 2024, with October 2023 corroboration',
    referenceHeightM: 4.79, plinthM: [3.5, 3.2], fullFootprintWithFrontStepM: [3.5, 3.57], roofEnvelopeM: [4.0, 3.48],
    exactReligiousIconography: false, inscriptions: 'omitted; not legible reliably',
    intendedUse: 'Existing-context spatial review only; no proposal to move or modify shrine'
  };
  const scale = Number.isFinite(options.scale) && options.scale > 0 ? options.scale : 1;
  root.scale.setScalar(scale);
  if (Number.isFinite(options.rotation)) root.rotation.y = options.rotation;
  const mats = {};
  const material = (key, color, roughness = .53, metalness = .05) => mats[key] = new T.MeshStandardMaterial({ color, roughness, metalness });
  material('red', '#b92322', .57); material('redDark', '#6c191a', .66);
  material('terracotta', '#af5d4c', .82); material('green', '#087c4f', .37);
  material('greenDark', '#085846', .48); material('orange', '#dc9133', .43);
  material('gold', '#e5b749', .43, .32); material('goldDark', '#af7930', .58, .2);
  material('blue', '#1d92b0', .43); material('cream', '#e0d6b5', .76);
  material('white', '#ebead4', .65); material('dark', '#382a29', .72);
  const group = (name, parent = root) => { const g = new T.Group(); g.name = name; parent.add(g); return g; };
  const mesh = (geo, mat, parent, name) => { const o = helpers.mesh ? helpers.mesh(geo, mat, parent) : new T.Mesh(geo, mat); if (!helpers.mesh) parent.add(o); o.castShadow = o.receiveShadow = true; if (name) o.name = name; return o; };
  const box = (x, y, z, w, h, d, mat, parent, name) => { const o = mesh(new T.BoxGeometry(w, h, d), mat, parent, name); o.position.set(x, y, z); return o; };
  const sphere = (x, y, z, rx, ry, rz, mat, parent, name) => { const o = mesh(new T.SphereGeometry(1, 12, 8), mat, parent, name); o.position.set(x, y, z); o.scale.set(rx, ry, rz); return o; };
  const cylinder = (x, y, z, r, h, mat, parent, name, top = r) => { const o = mesh(new T.CylinderGeometry(top, r, h, 16), mat, parent, name); o.position.set(x, y, z); return o; };
  const path = (points, radius, mat, parent, name, segments = 24) => {
    const curve = new T.CatmullRomCurve3(points.map(p => new T.Vector3(...p)), false, 'centripetal');
    return mesh(new T.TubeGeometry(curve, segments, radius, 6, false), mat, parent, name);
  };
  function octagon(w, d, y, thick, mat, parent, name) {
    const c = .26, p = [[-w/2+c,-d/2],[w/2-c,-d/2],[w/2,-d/2+c],[w/2,d/2-c],[w/2-c,d/2],[-w/2+c,d/2],[-w/2,d/2-c],[-w/2,-d/2+c]];
    const shape = new T.Shape(); p.forEach(([x,z],i) => i ? shape.lineTo(x,z) : shape.moveTo(x,z)); shape.closePath();
    const o = mesh(new T.ExtrudeGeometry(shape,{depth:thick,bevelEnabled:false}),mat,parent,name);
    o.rotation.x = -Math.PI/2; o.position.y = y; return o;
  }

  const plinth = group('SHRINE-RAISED-RED-PLINTH');
  octagon(3.5, 3.2, 0, .14, mats.terracotta, plinth, 'LOWEST-OCTAGONAL-PLINTH');
  octagon(3.26, 2.98, .14, .15, mats.red, plinth, 'SECOND-PLINTH-RISER');
  octagon(3.02, 2.74, .29, .14, mats.terracotta, plinth, 'TOP-PLATFORM');
  // A narrow open-front approach, not an invented accessible route or construction detail.
  box(0,.075,1.76,1.56,.15,.42,mats.terracotta,plinth,'FRONT-APPROACH-LOW-STEP');
  box(0,.22,1.57,1.34,.14,.36,mats.terracotta,plinth,'FRONT-APPROACH-UPPER-STEP');
  box(0,.436,0,2.83,.012,2.54,mats.cream,plinth,'PALE-TOP-PAVING');
  for (const x of [-.94,0,.94]) box(x,.444,0,.008,.005,2.51,mats.goldDark,plinth,'TOP-JOINT');

  const structure = group('SHRINE-FOUR-RED-ORNAMENTED-COLUMNS');
  for (const x of [-1.12,1.12]) for (const z of [-.98,.98]) {
    const col = group(`COLUMN-${x<0?'L':'R'}-${z>0?'FRONT':'REAR'}`,structure);
    cylinder(x,.52,z,.26,.16,mats.goldDark,col,'COLUMN-STONE-FOOT');
    cylinder(x,.635,z,.245,.075,mats.gold,col,'COLUMN-FOOT-GILT-BAND');
    cylinder(x,1.665,z,.17,2.03,mats.red,col,'RED-COLUMN-SHAFT');
    cylinder(x,2.685,z,.20,.12,mats.goldDark,col,'NECK-BAND');
    // Abstract entwined colored scroll, deliberately not a claim to reproduce carved dragons.
    const spiral=[];
    for(let i=0;i<=52;i++){const t=i/52,a=t*Math.PI*5.4;spiral.push([x+.18*Math.cos(a),.76+t*1.80,z+.18*Math.sin(a)]);}
    path(spiral,.024,mats.gold,col,'ABSTRACT-GOLD-COLUMN-SCROLL',52);
    for(let j=0;j<6;j++){
      const a=j*1.7+.4, y=.9+j*.28;
      sphere(x+.177*Math.cos(a),y,z+.177*Math.sin(a),.09,.055,.055,j%2?mats.green:mats.blue,col,'COLORED-SCROLL-LEAF');
    }
    cylinder(x,2.83,z,.245,.2,mats.gold,col,'LOTUS-CAPITAL-CORE',.19);
    for(let j=0;j<8;j++){
      const a=j*Math.PI/4,petal=sphere(x+.17*Math.cos(a),2.81,z+.17*Math.sin(a),.075,.19,.075,mats.gold,col,'LOTUS-CAPITAL-PETAL');
      petal.rotation.z=-.24*Math.cos(a);petal.rotation.x=.24*Math.sin(a);
    }
    cylinder(x,2.98,z,.245,.13,mats.red,col,'CAPITAL-RED-ABACUS');
  }

  const frieze = group('SHRINE-PAINTED-FRIEZE-NO-TEXT');
  // Three-dimensional painted beams and framed panels on all four sides.
  for(let side=0;side<4;side++){
    const f = group(`FRIEZE-SIDE-${side+1}`,frieze); f.rotation.y=side*Math.PI/2;
    const sideWidth = side%2 ? 2.38 : 2.68, z = side%2 ? 1.20 : 1.06;
    box(0,3.14,z,sideWidth,.30,.21,mats.red,f,'RED-ENTABLATURE');
    box(0,3.145,z+.112,sideWidth-.12,.237,.015,mats.gold,f,'GOLD-FRAME');
    box(0,3.145,z+.123,sideWidth-.18,.19,.015,mats.blue,f,'TURQUOISE-SECOND-FRAME');
    box(0,3.145,z+.133,sideWidth-.24,.157,.012,mats.redDark,f,'ABSTRACT-PANEL-OMITTED-INSCRIPTION');
    // Non-letter floral medallions preserve the visual grain without fabricated characters.
    for(const u of [-.68,0,.68]){
      for(let j=0;j<5;j++){const a=j*Math.PI*2/5;sphere(u+.058*Math.cos(a),3.145+.048*Math.sin(a),z+.15,.032,.026,.012,mats.green,f,'PANEL-ROSETTE-PETAL');}
      sphere(u,3.145,z+.165,.021,.021,.012,mats.gold,f,'PANEL-ROSETTE-CENTRE');
    }
    box(0,3.33,z,sideWidth+.10,.08,.25,mats.gold,f,'TOP-GOLD-CORNICE');
    box(0,2.946,z,sideWidth+.05,.06,.25,mats.green,f,'LOW-GREEN-CORNICE');
    for(const x of [-sideWidth/2+.19,sideWidth/2-.19]){
      box(x,2.88,z,.32,.18,.23,mats.red,f,'BRACKET');
      sphere(x,2.78,z+.05,.16,.075,.11,mats.gold,f,'BRACKET-GILT-CLOUD');
    }
  }

  const roof = group('SHRINE-CURVED-HIPPED-TILE-ROOF');
  const roofMat=mats.green.clone();roofMat.side=T.DoubleSide;
  // The same analytic surface drives the roof, barrel tiles, hip ribs and eave lines.
  function roofPoint(u,v,side,raise=0){
    const width=.18+(1.74-.18)*v,depth=.16+(1.53-.16)*v;
    const y=4.11-.98*v+.21*Math.pow(v,4)+.22*Math.pow(Math.abs(u),8)*Math.pow(v,5)+raise;
    let x=u*width,z=depth;
    if(side===1){x=width;z=u*depth;}
    if(side===2)z=-depth;
    if(side===3){x=-width;z=u*depth;}
    return [x,y,z];
  }
  for(let side=0;side<4;side++){
    const vertices=[],indices=[],nu=24,nv=16;
    for(let v=0;v<=nv;v++)for(let u=0;u<=nu;u++)vertices.push(...roofPoint(u/nu*2-1,v/nv,side));
    for(let v=0;v<nv;v++)for(let u=0;u<nu;u++){const k=v*(nu+1)+u;indices.push(k,k+1,k+nu+1,k+1,k+nu+2,k+nu+1);}
    const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(vertices,3));geo.setIndex(indices);geo.computeVertexNormals();
    mesh(geo,roofMat,roof,`CURVED-ROOF-SLOPE-${side+1}`);
    const half=side%2?1.53:1.74;
    for(let col=-8;col<=8;col++){
      const transverse=col*half/8.5, widthTop=side%2?.16:.18;
      const vmin=Math.max(.045,(Math.abs(transverse)-widthTop)/(half-widthTop)+.028);
      if(vmin>.96)continue;
      const pts=[],ribs=[];
      for(let i=0;i<=14;i++){
        const v=vmin+(1-vmin)*i/14,span=widthTop+(half-widthTop)*v,u=transverse/span;
        pts.push(roofPoint(u,v,side,.052));
        ribs.push(roofPoint(Math.min(.995,(transverse+.079)/span),v,side,.071));
      }
      path(pts,.072,mats.orange,roof,`ORANGE-BARREL-TILE-ROW-${side}-${col}`,14);
      path(ribs,.026,mats.green,roof,`GREEN-TILE-SEAM-${side}-${col}`,14);
    }
    const eave=[];
    for(let i=0;i<=32;i++)eave.push(roofPoint(i/16-1,1,side,-.05));
    path(eave,.075,mats.green,roof,`GREEN-CURVED-EAVE-${side}`,32);
    path(eave.map(p=>[p[0],p[1]-.076,p[2]]),.026,mats.gold,roof,`GOLD-EAVE-UNDERSIDE-${side}`,32);
    for(let u=-.92;u<=.93;u+=.13){const p=roofPoint(u,1,side,-.15);sphere(...p,.075,.055,.055,mats.gold,roof,'GOLD-EAVE-SCALLOP');}
  }
  // Four sculptural upturned corner ornaments; colored scrolls, not fabricated sacred symbols.
  for(const sx of [-1,1])for(const sz of [-1,1]){
    const c = group(`UPTURNED-CORNER-${sx}-${sz}`,roof);
    const pts=[[1.36,3.47,1.18],[1.63,3.53,1.41],[1.81,3.67,1.58],[1.92,3.86,1.68],[1.95,3.99,1.68],[1.88,4.07,1.64],[1.82,4.02,1.60]].map(([x,y,z])=>[sx*x,y,sz*z]);
    path(pts,.050,mats.green,c,'CORNER-GREEN-CURL',28);
    path(pts.map(([x,y,z])=>[x,y+.042,z]),.019,mats.gold,c,'CORNER-GOLD-CREST',28);
    for(let j=0;j<3;j++){
      const r=1.55+j*.10,yy=3.71+j*.12;
      const curl=[[r,yy,r*.86],[r+.09,yy+.17,r*.86+.06],[r+.02,yy+.26,r*.86+.1],[r-.055,yy+.21,r*.86+.10]].map(([x,y,z])=>[sx*x,y,sz*z]);
      path(curl,.024,j%2?mats.blue:mats.red,c,'COLORED-CORNER-SCROLL',16);
    }
  }
  cylinder(0,4.145,0,.23,.09,mats.green,roof,'ROOF-CENTRE-COLLAR');
  cylinder(0,4.255,0,.20,.14,mats.goldDark,roof,'CENTRAL-FINIAL-BASE',.17);
  const finial=group('GOLD-LOTUS-AND-PALE-PEARL-FINIAL',roof);
  sphere(0,4.38,0,.19,.17,.19,mats.gold,finial,'LOTUS-CORE');
  for(let j=0;j<7;j++){const a=j*Math.PI*2/7;sphere(.12*Math.cos(a),4.42,.12*Math.sin(a),.073,.16,.073,mats.gold,finial,'LOTUS-FINIAL-PETAL');}
  cylinder(0,4.60,0,.032,.13,mats.dark,finial,'PEARL-STALK');
  sphere(0,4.695,0,.09,.095,.09,mats.white,finial,'PALE-FINIAL-PEARL');

  const altar=group('ALTAR-AND-GENERIC-STATUE-SILHOUETTE');
  altar.userData={iconography:'Generic silhouette only; source does not establish a reproducible deity likeness',inscription:'none'};
  box(0,.94,-.11,1.05,1.0,.75,mats.cream,altar,'IVORY-ALTAR-BODY');
  box(0,1.47,-.11,1.15,.075,.86,mats.cream,altar,'ALTAR-TOP');
  box(0,.445,-.11,1.18,.10,.87,mats.goldDark,altar,'ALTAR-BASE');
  box(0,.94,.273,.92,.81,.018,mats.gold,altar,'ALTAR-GOLD-FRAME');
  box(0,.94,.286,.87,.76,.016,mats.cream,altar,'ALTAR-FRONT-PALE-PANEL');
  // Abstract botanical relief; no textual or historical interpretation.
  for(const mirror of [-1,1]){
    path([[mirror*.32,.62,.30],[mirror*.23,.86,.31],[mirror*.10,1.03,.31],[mirror*.19,1.24,.30]],.017,mats.greenDark,altar,'ALTAR-ABSTRACT-STEM',18);
    for(let i=0;i<4;i++)sphere(mirror*(.1+i*.045),.79+i*.105,.323,.09,.032,.014,i%2?mats.blue:mats.green,altar,'ALTAR-RELIEF-LEAF');
  }
  for(const x of [-.43,.43]){
    cylinder(x,1.54,.09,.053,.08,mats.gold,altar,'OFFERING-CUP');
    cylinder(x,1.625,.09,.012,.11,mats.red,altar,'UNLIT-CANDLE');
  }
  const figure = group('GENERIC-ROBED-FIGURE-NO-IDENTITY',altar);
  const robeProfile=[[.27,0],[.30,.08],[.22,.30],[.20,.56],[.16,.66],[.10,.72]].map(p=>new T.Vector2(...p));
  const robe=mesh(new T.LatheGeometry(robeProfile,18),mats.redDark,figure,'GENERIC-ROBE');robe.position.set(0,1.51,-.14);
  box(0,1.88,-.14,.035,.69,.41,mats.goldDark,figure,'ROBE-CENTRE-DETAIL');
  sphere(0,2.30,-.14,.10,.14,.105,mats.goldDark,figure,'UNFEATURED-HEAD');
  cylinder(0,2.425,-.14,.135,.10,mats.red,figure,'GENERIC-HEADPIECE',.10);
  path([[-.14,2.15,-.14],[-.29,2.02,-.08],[-.39,2.10,.0]],.063,mats.redDark,figure,'LEFT-ROBED-ARM',10);
  path([[.14,2.15,-.14],[.30,2.03,-.08],[.39,2.1,.0]],.063,mats.redDark,figure,'RIGHT-ROBED-ARM',10);
  sphere(-.40,2.11,.0,.052,.051,.045,mats.goldDark,figure,'LEFT-HAND-SILHOUETTE');
  sphere(.40,2.11,.0,.052,.051,.045,mats.goldDark,figure,'RIGHT-HAND-SILHOUETTE');

  // Merge by named assembly/material for mobile draw-call cost. Indexed geometry is retained;
  // original semantic part names stay attached as metadata instead of hundreds of scene nodes.
  function batchAssembly(parent) {
    root.updateMatrixWorld(true);
    const inverse=new T.Matrix4().copy(parent.matrixWorld).invert(),batches=new Map(),parts=[];
    parent.traverse(o=>{
      if(!o.isMesh)return;
      parts.push(o.name);
      const local=new T.Matrix4().multiplyMatrices(inverse,o.matrixWorld),geo=o.geometry.clone().applyMatrix4(local),key=o.material.uuid;
      if(!batches.has(key))batches.set(key,{mat:o.material,geos:[]});batches.get(key).geos.push(geo);
    });
    parent.clear();parent.userData.partNames=parts;
    for(const {mat,geos} of batches.values()){
      const positions=[],normals=[],uvs=[],indices=[];let offset=0;
      for(const geo of geos){
        const p=geo.attributes.position,n=geo.attributes.normal,uv=geo.attributes.uv;
        for(let i=0;i<p.count;i++){positions.push(p.getX(i),p.getY(i),p.getZ(i));normals.push(n.getX(i),n.getY(i),n.getZ(i));uvs.push(uv?uv.getX(i):0,uv?uv.getY(i):0);}
        if(geo.index)for(let i=0;i<geo.index.count;i++)indices.push(offset+geo.index.getX(i));else for(let i=0;i<p.count;i++)indices.push(offset+i);
        offset+=p.count;geo.dispose();
      }
      const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(positions,3));geo.setAttribute('normal',new T.Float32BufferAttribute(normals,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uvs,2));geo.setIndex(indices);geo.computeBoundingSphere();
      const color=mat.color.getHexString();mesh(geo,mat,parent,`${parent.name}-MATERIAL-${color}`);
    }
  }
  for(const assembly of [plinth,structure,frieze,roof,altar])batchAssembly(assembly);

  root.userData.parts = ['raised octagonal red plinth','four red columns','gold lotus capitals','non-text frieze','curved green/orange tile roof','corner scrolls','lotus and pearl finial','generic altar/figure'];
  root.userData.materials = Object.keys(mats);
  return root;
};

/* Optional companion: one pole + wind-shaped cloth. Caller controls count and placement.
 * Approximate MB emblem is procedurally drawn solely to identify the existing flag in context.
 * Thai stripe proportions are 1:1:2:1:1. No screenshot/photo pixels are used.
 */
window.BC_SITE_FLAG = (T, helpers = {}, options = {}) => {
  const type=options.type==='thai'?'thai':'mb',height=Number.isFinite(options.height)?options.height:7.2;
  const width=Number.isFinite(options.width)?options.width:(type==='thai'?1.45:.90);
  const clothHeight=Number.isFinite(options.clothHeight)?options.clothHeight:(type==='thai'?.95:2.75);
  const g=new T.Group();g.name=`EXISTING-${type.toUpperCase()}-FLAG-AND-POLE`;
  g.userData={kind:'existing-flag',flagType:type,status:'photo-interpreted dimensions and flutter',officialBrandAsset:false,heightM:height};
  if(Number.isFinite(options.rotation))g.rotation.y=options.rotation;
  const steel=new T.MeshStandardMaterial({color:'#c2c5c0',metalness:.72,roughness:.36});
  const mesh=(geo,mat,name)=>{const o=helpers.mesh?helpers.mesh(geo,mat,g):new T.Mesh(geo,mat);if(!helpers.mesh)g.add(o);o.name=name;o.castShadow=o.receiveShadow=true;return o;};
  const pole=mesh(new T.CylinderGeometry(.026,.038,height,12),steel,'FLAG-POLE');pole.position.y=height/2;
  const foot=mesh(new T.CylinderGeometry(.095,.12,.10,12),steel,'POLE-FOOT');foot.position.y=.05;
  const tip=mesh(new T.SphereGeometry(.050,10,6),steel,'POLE-FINIAL');tip.position.y=height+.012;
  const canvas=document.createElement('canvas');canvas.width=512;canvas.height=type==='thai'?336:1024;
  const ctx=canvas.getContext('2d');
  if(type==='thai'){
    const colors=['#a82432','#eeeae5','#26345c','#eeeae5','#a82432'],weights=[1,1,2,1,1];let y=0;
    colors.forEach((c,i)=>{ctx.fillStyle=c;ctx.fillRect(0,y,512,canvas.height*weights[i]/6+.5);y+=canvas.height*weights[i]/6;});
  } else {
    ctx.fillStyle='#181c20';ctx.fillRect(0,0,512,1024);ctx.strokeStyle='#edeee9';ctx.lineWidth=7;
    ctx.beginPath();ctx.arc(256,196,123,0,Math.PI*2);ctx.stroke();
    ctx.fillStyle='#edeee9';for(let i=0;i<3;i++){const a=-Math.PI/2+i*Math.PI*2/3;ctx.beginPath();ctx.moveTo(256+Math.cos(a)*120,196+Math.sin(a)*120);ctx.lineTo(256+Math.cos(a+Math.PI/2)*12,196+Math.sin(a+Math.PI/2)*12);ctx.lineTo(256+Math.cos(a-Math.PI/2)*12,196+Math.sin(a-Math.PI/2)*12);ctx.closePath();ctx.fill();}
  }
  const tex=new T.CanvasTexture(canvas);tex.colorSpace=T.SRGBColorSpace;
  const clothMat=new T.MeshStandardMaterial({map:tex,roughness:.94,side:T.DoubleSide});
  const vertices=[],uvs=[],indices=[],nx=16,ny=20,top=height-.19;
  for(let j=0;j<=ny;j++)for(let i=0;i<=nx;i++){
    const u=i/nx,v=j/ny,flutter=Math.sin(u*Math.PI*2.0+v*2.2)*u*.095;
    vertices.push(.05+u*width,top-v*clothHeight-.055*u*u,flutter);
    uvs.push(u,1-v);
  }
  for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){const k=j*(nx+1)+i;indices.push(k,k+nx+1,k+1,k+1,k+nx+1,k+nx+2);}
  const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(vertices,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uvs,2));geo.setIndex(indices);geo.computeVertexNormals();
  mesh(geo,clothMat,`${type.toUpperCase()}-WINDSHAPED-CLOTH`);
  return g;
};
