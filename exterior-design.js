/* Authored smart exterior study. Manual-sized envelopes, not official artwork/CAD.
 * Local plan metres; site geometry, utilities and approvals remain unverified.
 */
window.BC_EXTERIOR_DESIGN=(T,h,data,siteData)=>{
  const {mesh,box,planBox,tube,sign,M}=h,base=siteData.levels.forecourt;
  const proposed=new T.Group(),context=new T.Group();proposed.name='SMART-EXTERIOR-PROPOSED';context.name='SMART-EXTERIOR-NONBUILDING-CONTEXT';
  const dark=new T.MeshStandardMaterial({color:'#262724',roughness:.43,metalness:.22});
  const silver=new T.MeshStandardMaterial({color:'#9b9e9b',roughness:.42,metalness:.7});
  const white=new T.MeshStandardMaterial({color:'#f0f2e9',emissive:'#eeefdf',emissiveIntensity:.55,roughness:.42});
  const lime=new T.MeshStandardMaterial({color:'#d7e9a2',roughness:.55});
  function tag(group,d){group.name=d.id;group.userData={...d,kind:'smart-exterior-proposal',approved:false};return group;}
  function board(d){const g=tag(new T.Group(),d);proposed.add(g);g.position.set(d.x,base,-d.y);g.rotation.y=d.rotationRadians||0;box(0,d.height/2,0,d.width,d.height,d.depth,dark,g);return g;}
  const p=data.pylon;
  if(p.enabled!==false&&p.render!==false){const pg=board(p);planBox(0,0,p.width+.16,p.depth+.23,.08,silver,0,pg);
  const logoWidth=.91,logoHeight=logoWidth*95/70,logoMat=window.BC_SMART_BRAND_MATERIAL(T);
  for(const side of [-1,1]){
    const logo=mesh(new T.PlaneGeometry(logoWidth,logoHeight),logoMat,pg);logo.name='SP1-OFFICIAL-PATHS-'+side;
    logo.position.set(0,p.height-.23-logoHeight/2,side*(p.depth/2+.006));logo.rotation.y=side===1?0:Math.PI;logo.castShadow=false;
    logo.userData={source:'smart UK original paths',spacing:'study; supplier artwork pending',aspectRatio:70/95};
    sign('by smart Automobile',0,.31,side*(p.depth/2+.007),p.width*.74,.13,side===1?0:Math.PI,pg,'#bdc0b8','#262724');
    for(const height of [p.height-1.65,p.height-2.85])box(0,height,side*(p.depth/2+.002),p.width,.009,.004,M.dark,pg);
  }
  }
  for(const fd of [data.flag,...(data.additionalFlags||[])].filter(q=>q&&q.enabled!==false&&q.render!==false)){const flag=window.BC_SITE_FLAG(T,h,{...fd,kind:'smart',base});tag(flag,fd);proposed.add(flag);}
  // Owner requests shared MB wayfinding. SD1 is omitted, NOT compliance-approved.
  if(data.directionBoard.enabled)throw new Error('SD1 requires explicit waiver resolution before being reinstated.');
  // Single owner-relocated sign, attached on the INSIDE fence face towards workshop.
  // Attachment straps are visual placeholders, not an engineered fence modification.
  const care=data.careLogo,cg=tag(new T.Group(),care);cg.position.set(care.x,care.centerHeight,-care.y);cg.rotation.y=care.rotationRadians||0;proposed.add(cg);
  box(0,0,0,care.width,care.height,care.depth,silver,cg);sign('smart care',0,0,care.depth/2+.007,care.width,.30,0,cg,'#f7f9f3','#999d99');
  if(care.mount==='inside-fence')for(const x of [-.82,.82]){const clamp=box(x,0,care.depth/2+.016,.025,.42,.025,silver,cg);clamp.name='SC1-FENCE-ATTACHMENT-PROXY';}
  // Owner-confirmed B1/B2/rear1 allocations retain historical comment IDs.
  // Small edge-sign mounting is a study, not invented branded floor graphics.
  for(const bay of data.parking.filter(b=>!data.allocationReviewPending&&b.render!==false)){const g=tag(new T.Group(),bay);proposed.add(g);
    g.position.set(bay.signAnchor[0],base,-bay.signAnchor[1]);g.rotation.y=bay.signRotation||0;
    tube([0,0,0],[0,1.35,0],.025,silver,g);
    box(0,1.22,0,.70,.34,.035,dark,g);sign(bay.code,0,1.28,.019,.66,.12,0,g,'#f4f5ee','#262724');sign(bay.label,0,1.14,.019,.66,.10,0,g,'#f4f5ee','#262724');
  }
  proposed.userData={status:data.status,source:data.source,requiredApprovals:data.approvalGates};context.userData={notNewConstruction:true};
  return {proposed,context};
};
window.BC_SITE_FLAG=(T,h,d)=>{
  const g=new T.Group();g.name='FLAG-'+d.kind.toUpperCase();g.userData={kind:'flag',brand:d.kind,positionStatus:'photo-fitted or proposed; not survey'};g.position.set(d.x,d.base,-d.y);
  h.tube([0,0,0],[0,d.poleHeight,0],.034,h.M.steel,g);h.sphere(0,d.poleHeight,0,.065,h.M.steel,g);
  const cv=document.createElement('canvas');cv.width=256;cv.height=768;const ct=cv.getContext('2d');
  ct.fillStyle=d.kind==='thai'?'#fff':'#171d20';ct.fillRect(0,0,256,768);
  if(d.kind==='thai'){const cols=['#c52730','#f7f5ee','#233769','#f7f5ee','#c52730'],ratios=[1,1,2,1,1];let y=0;cols.forEach((c,i)=>{const ht=768*ratios[i]/6;ct.fillStyle=c;ct.fillRect(0,y,256,ht);y+=ht;});}
  else if(d.kind==='mb'){ct.strokeStyle='#f4f4ec';ct.lineWidth=7;ct.beginPath();ct.arc(128,122,72,0,Math.PI*2);ct.stroke();for(let i=0;i<3;i++){const a=-Math.PI/2+i*Math.PI*2/3;ct.beginPath();ct.moveTo(128,122);ct.lineTo(128+69*Math.cos(a),122+69*Math.sin(a));ct.stroke();}ct.fillStyle='#f5f5f0';ct.font='20px Arial';ct.textAlign='center';ct.fillText('Mercedes-Benz',128,236);}
  else{window.BC_SMART_BRAND_DRAW(ct,38,45,180);ct.fillStyle='#d7e9a2';ct.fillRect(0,705,256,63);}
  const tx=new T.CanvasTexture(cv);tx.colorSpace=T.SRGBColorSpace;
  const mat=new T.MeshStandardMaterial({map:tx,roughness:.92,side:T.DoubleSide});
  const geo=new T.PlaneGeometry(d.width,d.height,12,24),pos=geo.attributes.position;
  for(let i=0;i<pos.count;i++){const u=pos.getX(i)/d.width+.5,v=pos.getY(i)/d.height+.5;pos.setZ(i,Math.sin(u*7-v*3)*.14*u);pos.setY(i,pos.getY(i)-.06*u*u);}
  geo.computeVertexNormals();const cloth=h.mesh(geo,mat,g);cloth.position.set(d.width/2+.03,d.poleHeight-.22-d.height/2,0);
  return g;
};
