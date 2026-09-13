/* Existing-context ground model. All objects use the unchanged v07 plan coordinate frame.
 * Display edges are photo/legacy candidates, NEVER title-deed or road-reserve boundaries.
 * No uploaded site photographs are used as textures. No new exterior design is proposed.
 */
window.BC_SITE=(T,h,data)=>{
  'use strict';
  const {mesh,box,planBox,tube,slab,sign,M}=h;
  const ground=new T.Group(),objects=new T.Group(),occluders=new T.Group(),guides=new T.Group();
  for(const [g,name] of [[ground,'SITE-GROUND'],[objects,'SITE-EXISTING-ELEMENTS'],[occluders,'SITE-TREES-UTILITIES'],[guides,'SITE-EVIDENCE-CONTROLS']]){g.name=name;g.userData={status:'assumed / photo-traced; not survey',source:'site-context.json'};}
  const L=data.levels,SW=data.sidewalk.width;
  function grain(base,variation,repeat){const c=document.createElement('canvas');c.width=c.height=256;const ctx=c.getContext('2d'),pixels=ctx.createImageData(256,256);let n=813;for(let i=0;i<pixels.data.length;i+=4){n=(n*1664525+1013904223)>>>0;const v=base+(n/4294967296-.5)*variation;pixels.data[i]=v;pixels.data[i+1]=v;pixels.data[i+2]=v;pixels.data[i+3]=255;}ctx.putImageData(pixels,0,0);const tex=new T.CanvasTexture(c);tex.wrapS=tex.wrapT=T.RepeatWrapping;tex.repeat.set(repeat,repeat);tex.colorSpace=T.SRGBColorSpace;return tex;}
  const concrete=new T.MeshStandardMaterial({color:'#b2b1aa',map:grain(181,32,.35),roughness:.97});
  const asphalt=new T.MeshStandardMaterial({color:'#787b7b',map:grain(154,44,.65),roughness:1});
  const paving=new T.MeshStandardMaterial({color:'#bdbab0',map:grain(198,25,.6),roughness:.9});
  const retaining=new T.MeshStandardMaterial({color:'#8c877a',map:grain(176,46,.7),roughness:1});
  const fenceMat=new T.MeshStandardMaterial({color:'#e4e5df',roughness:.6,metalness:.15});
  const soil=new T.MeshStandardMaterial({color:'#4e5140',roughness:1});
  const leaf=new T.MeshStandardMaterial({color:'#416637',roughness:.87,side:T.DoubleSide});
  const leafLight=new T.MeshStandardMaterial({color:'#67854b',roughness:.86,side:T.DoubleSide});
  const trunk=new T.MeshStandardMaterial({color:'#8d806b',roughness:1});
  const grey=new T.MeshStandardMaterial({color:'#777d7e',roughness:.95});
  const black=new T.MeshStandardMaterial({color:'#393d3c',roughness:.9});
  // Material/geometry batching bounds repeated pickets, curb blocks, planters and joints.
  const batches=new Map(),dummy=new T.Object3D();
  function instance(kind,mat,parent,matrix){const key=kind+'|'+mat.uuid+'|'+parent.uuid;if(!batches.has(key))batches.set(key,{kind,mat,parent,list:[]});batches.get(key).list.push(matrix.clone());}
  function ibox(x,height,z,w,ht,depth,mat,parent=objects,angle=0){dummy.position.set(x,height,z);dummy.scale.set(w,ht,depth);dummy.rotation.set(0,angle,0);dummy.updateMatrix();instance('box',mat,parent,dummy.matrix);}
  function irod(a,b,r,mat,parent=objects){const av=new T.Vector3(...a),bv=new T.Vector3(...b),direction=bv.clone().sub(av);dummy.position.copy(av).add(bv).multiplyScalar(.5);dummy.scale.set(r,direction.length(),r);dummy.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),direction.normalize());dummy.updateMatrix();instance('rod',mat,parent,dummy.matrix);}
  function blob(x,height,y,sx,sy,sz,mat,parent=occluders){dummy.position.set(x,height,-y);dummy.scale.set(sx,sy,sz);dummy.rotation.set(0,0,0);dummy.updateMatrix();instance('blob',mat,parent,dummy.matrix);}
  const raw=data.edgeControlPoints;
  // Rounded photo trace, not an assumed circular road radius; extrapolated rear remains labelled.
  const curve=new T.CatmullRomCurve3(raw.slice(1,-1).map(p=>new T.Vector3(p[0],p[1],0)),false,'centripetal');
  const baseEdge=[[data.bounds.xMin,raw[0][1]],...curve.getPoints(56).map(p=>[p.x,p.y]),raw.at(-1)];
  function edge(offset=0){return baseEdge.map((p,i)=>{const before=baseEdge[Math.max(0,i-1)],after=baseEdge[Math.min(baseEdge.length-1,i+1)],dx=after[0]-before[0],dy=after[1]-before[1],len=Math.hypot(dx,dy);return [p[0]+dy/len*offset,p[1]-dx/len*offset];});}
  const fenceEdge=edge(0),kerbEdge=edge(SW),roadOuter=edge(SW+data.road.displayStripWidth);
  const gx=data.front.gate,fy=data.front.apronEdgeY.value,ex=data.east.apronEdgeX,[ey0,ey1]=data.east.serviceGapY;
  const transitions=data.gateTransitions;
  // Solid apron is notched around the two graded gate surfaces, avoiding buried ramps.
  const apron=[raw[0],[gx.xMin,fy],[gx.xMin,transitions.frontInnerY],[gx.xMax,transitions.frontInnerY],[gx.xMax,fy],...baseEdge.slice(1,-1),[ex,ey0],[transitions.eastInnerX,ey0],[transitions.eastInnerX,ey1],[ex,ey1],raw.at(-1),...data.leftContextEdge.slice(1).reverse()];
  const terrainBase=L.road-.25;
  const earth=slab(apron,terrainBase,L.forecourt-.12-terrainBase,retaining,ground);earth.name='CONTEXT-TERRAIN-VOLUME-NOT-PAVEMENT-THICKNESS';earth.userData={status:'render-only earth infill to close graded apron notches',notForQuantityTakeoff:true};
  const pavement=slab(apron,L.forecourt-.12,.12,concrete,ground);pavement.userData={status:'visual finish thickness only, not verified paving specification',notForQuantityTakeoff:true};
  // Existing floor base: close the former floating 0.68m band without changing interior FFL.
  if(h.floor){const base=slab(h.floor,L.forecourt,-.12-L.forecourt,M.column,objects);base.name='EXISTING-BASE-SKIRT-HEIGHT-ASSUMED';base.userData={status:'photo-scale exterior height, not measured foundation',top:-.12,bottom:L.forecourt};}
  // Separate sidewalk spans leave real mesh openings at both gate mouths.
  for(let i=0;i<fenceEdge.length-1;i++){const a=fenceEdge[i],b=fenceEdge[i+1],oa=kerbEdge[i],ob=kerbEdge[i+1],cuts=splitAtGates(a,b);for(let j=0;j<cuts.length-1;j++){const t0=cuts[j],t1=cuts[j+1],mid=lerp(a,b,(t0+t1)/2);if(openGate(...mid))continue;slab([lerp(a,b,t0),lerp(a,b,t1),lerp(oa,ob,t1),lerp(oa,ob,t0)],L.sidewalk-.16,.16,paving,ground);}}
  slab([...kerbEdge,...roadOuter.slice().reverse()],L.road-.14,.14,asphalt,ground);
  // Discrete side/rear context, deliberately not an invented full-site enclosure.
  slab([[-13,-8.4],...data.leftContextEdge,[-13,30]],L.forecourt-.2,.18,soil,ground);
  function openGate(x,y,offset=0){return (y<data.front.apronEdgeY.value+.12&&x>data.front.gate.xMin&&x<data.front.gate.xMax)||(x>data.east.apronEdgeX-.1&&y>data.east.serviceGapY[0]&&y<data.east.serviceGapY[1]);}
  function lerp(a,b,t){return [a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];}
  function splitAtGates(a,b){const ts=[0,1];for(const [axis,limits] of [[0,[data.front.gate.xMin,data.front.gate.xMax]],[1,data.east.serviceGapY]]){const delta=b[axis]-a[axis];if(Math.abs(delta)<1e-8)continue;for(const v of limits){const t=(v-a[axis])/delta;if(t>1e-8&&t<1-1e-8)ts.push(t);}}return [...new Set(ts)].sort((a,b)=>a-b);}
  function segments(points,step,fn){let cumulative=0;for(let i=0;i<points.length-1;i++){const a=points[i],b=points[i+1],dx=b[0]-a[0],dy=b[1]-a[1],len=Math.hypot(dx,dy),cuts=splitAtGates(a,b);for(let k=0;k<cuts.length-1;k++){const start=cuts[k],span=cuts[k+1]-start,n=Math.max(1,Math.ceil(len*span/step));for(let j=0;j<n;j++){const t=start+span*(j+.5)/n;fn(a[0]+dx*t,a[1]+dy*t,len*span/n,Math.atan2(dy,dx),cumulative+len*t);}}cumulative+=len;}}
  // Weathered retaining face plus existing white vertical-bar fence, omitted at candidate gates.
  const wallTop=L.forecourt+.04,wallBottom=L.sidewalk-.05;
  segments(fenceEdge,.24,(x,y,len,a)=>{if(x<raw[0][0]||openGate(x,y))return;ibox(x,(wallTop+wallBottom)/2,-y,len,wallTop-wallBottom,.22,retaining,objects,a);ibox(x,wallTop+.57,-y,.027,1.12,.027,fenceMat,objects);});
  segments(fenceEdge,1.8,(x,y,len,a)=>{if(x<raw[0][0]||openGate(x,y))return;for(const ht of [.12,1.1])ibox(x,wallTop+ht,-y,len,.048,.048,fenceMat,objects,a);ibox(x,wallTop+.59,-y,.065,1.17,.065,fenceMat);});
  segments(kerbEdge,.78,(x,y,len,a,s)=>{if(openGate(x,y,SW))return;ibox(x,L.road+.085,-y,len-.016,.17,.2,Math.floor(s/.78)%2?fenceMat:black,objects,a);});
  // Paver seams and existing concrete joints only; these are not parking capacity claims.
  segments(kerbEdge,1.15,(x,y,len,a)=>{if(openGate(x,y))return;const normal=[-Math.sin(a),Math.cos(a)];const x2=x+normal[0]*SW,y2=y+normal[1]*SW;irod([x,L.sidewalk+.006,-y],[x2,L.sidewalk+.006,-y2],.008,grey,ground);});
  function edgeAt(value,axis){for(let i=0;i<fenceEdge.length-1;i++){const a=fenceEdge[i],b=fenceEdge[i+1];if(value>=Math.min(a[axis],b[axis])&&value<=Math.max(a[axis],b[axis])&&Math.abs(b[axis]-a[axis])>1e-8)return lerp(a,b,(value-a[axis])/(b[axis]-a[axis]))[1-axis];}return axis===1?data.east.apronEdgeX:data.front.apronEdgeY.value;}
  for(let x=0;x<=39;x+=4){const yMin=Math.max(-8.2,edgeAt(x,0)+.05,x>gx.xMin&&x<gx.xMax?transitions.frontInnerY:-100),yMax=-1.4;ibox(x,L.forecourt+.004,-(yMin+yMax)/2,.012,.008,yMax-yMin,grey,ground);}
  for(const y of [-3.2,-6.4]){const x0=gx.xMax+.04,x1=38.5;ibox((x0+x1)/2,L.forecourt+.005,-y,x1-x0,.009,.014,grey,ground);}
  for(let y=3;y<30;y+=4){const x0=39.8,x1=Math.min(50.4,edgeAt(y,1)-.05,y>ey0&&y<ey1?transitions.eastInnerX-.02:100);ibox((x0+x1)/2,L.forecourt+.004,-y,x1-x0,.008,.013,grey,ground);}
  // Gate/apron transition mesh, not a checked vehicle or accessible ramp design.
  function surface(points,mat,parent=ground){const v=points.flatMap(p=>[p[0],p[2],-p[1]]),idx=[];for(let i=1;i<points.length-1;i++)idx.push(0,i,i+1);const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(v,3));g.setIndex(idx);g.computeVertexNormals();const m=mat.clone();m.side=T.DoubleSide;return mesh(g,m,parent);}
  surface([[gx.xMin,fy-SW,L.road+.004],[gx.xMax,fy-SW,L.road+.004],[gx.xMax,transitions.frontInnerY,L.forecourt+.004],[gx.xMin,transitions.frontInnerY,L.forecourt+.004]],concrete);
  surface([[transitions.eastInnerX,ey0,L.forecourt+.004],[ex+SW,ey0,L.road+.004],[ex+SW,ey1,L.road+.004],[transitions.eastInnerX,ey1,L.forecourt+.004]],concrete);
  // Front entry stone stair from the close-up photo; separate from the C-return interior stair.
  const es=data.entrySteps,sw=es.xMax-es.xMin,cx=(es.xMin+es.xMax)/2,run=(es.landingY-es.yMin)/es.risers,rise=(0-L.forecourt)/es.risers;
  const entry=new T.Group();entry.name='EXTERIOR-ENTRANCE-STAIR';entry.userData={...es,rise,run};objects.add(entry);
  for(let i=0;i<es.risers;i++){const depth=es.yMax-(es.yMin+i*run),top=L.forecourt+(i+1)*rise;planBox(cx,es.yMax-depth/2,sw,depth,top-L.forecourt,M.column,L.forecourt,entry);for(const dx of [-1.45,0,1.45])planBox(cx+dx,es.yMin+(i+.17)*run,.85,.08,.009,M.dark,top+.002,entry);}
  for(const x of [es.xMin-.19,es.xMax+.19])planBox(x,(es.yMin+es.yMax)/2,.38,es.yMax-es.yMin,.86,M.column,L.forecourt,entry);
  // Front planter strip, palms and low hedges are retained-condition proxies.
  for(const [x,y,w,d] of data.planting.frontBeds){planBox(x+w/2,y+d/2,w,d,.26,M.column,L.forecourt,objects);planBox(x+w/2,y+d/2,w-.16,d-.14,.03,soil,L.forecourt+.26,objects);for(let q=x+.32;q<x+w-.1;q+=.52)blob(q,L.forecourt+.58,y+d/2,.33,.35,.31,leaf);}
  function palm(x,y,index){const ht=3.9+(index%3)*.25,base=L.forecourt+.27;irod([x,base,-y],[x+.14,base+ht,-y],.11,trunk,occluders);for(let i=0;i<11;i++){const a=i*Math.PI*2/11+.2*index,len=1.65+.15*(i%3),verts=[],idx=[];for(let j=0;j<=7;j++){const t=j/7,r=t*len,z=base+ht+.52*Math.sin(t*Math.PI)-t*t*.7,w=.17*Math.sin(Math.PI*t)+.008;const px=x+.14+Math.cos(a)*r,py=y+Math.sin(a)*r;verts.push(px-Math.sin(a)*w,z,-py-Math.cos(a)*w,px+Math.sin(a)*w,z,-py+Math.cos(a)*w);if(j<7){const k=j*2;idx.push(k,k+1,k+2,k+1,k+3,k+2);}}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(verts,3));g.setIndex(idx);g.computeVertexNormals();mesh(g,i%2?leaf:leafLight,occluders);}}
  data.planting.palmCentres.forEach(([x,y],i)=>palm(x,y,i));
  for(let y=3;y<29;y+=3)blob(-11.2,L.forecourt+.45,y,.85,.72,.8,leaf);
  // Existing dealer pylon / flags. No smart exterior branding is designed in this iteration.
  const [px,py]=data.markers.pylon;planBox(px,py,1.08,.48,7.8,M.dark,L.forecourt,objects);planBox(px,py,1.36,.76,.18,M.column,L.forecourt,objects);
  const logoY=L.forecourt+7.1,logoZ=-py+.247,ring=mesh(new T.TorusGeometry(.33,.019,8,40),M.steel,objects);ring.position.set(px,logoY,logoZ);for(let i=0;i<3;i++){const a=Math.PI/2+i*Math.PI*2/3;tube([px,logoY,logoZ],[px+.31*Math.cos(a),logoY+.31*Math.sin(a),logoZ],.015,M.steel,objects);}
  for(const [x,y] of data.markers.flags){irod([x,L.forecourt,-y],[x,L.forecourt+6.9,-y],.034,M.steel);box(x+.42,L.forecourt+5.65,-y,.81,2.25,.025,M.dark,objects);sign('Mercedes-Benz',x+.42,L.forecourt+5.65,-y+.021,.73,.16,0,objects,'#f0f1ed','#191e21');}
  const [sx,sy]=data.markers.directionSign;planBox(sx,sy,1.25,.23,1.9,M.column,L.forecourt,objects);sign('Entrance  ←',sx,L.forecourt+1.45,-sy+.123,1.16,.3,0,objects,'#303537','#d5d7d4');sign('Parking · Sales · Service',sx,L.forecourt+1.05,-sy+.123,1.16,.21,0,objects,'#303537','#d5d7d4');
  // Utilities are obstruction context only; exact heights/routes/energization are unknown.
  for(const [x,y] of data.utilityPoles){irod([x,L.sidewalk,-y],[x,9.2,-y],.105,grey,occluders);irod([x-1,8.25,-y],[x+1,8.25,-y],.052,grey,occluders);}
  for(let i=0;i<data.utilityPoles.length-1;i++){const a=data.utilityPoles[i],b=data.utilityPoles[i+1];for(const offset of [-.42,0,.42]){const pts=[];for(let j=0;j<=12;j++){const t=j/12;pts.push(new T.Vector3(a[0]+(b[0]-a[0])*t,8.45-.35*Math.sin(Math.PI*t)+offset*.4,-(a[1]+(b[1]-a[1])*t+offset)));}const g=new T.BufferGeometry().setFromPoints(pts),line=new T.Line(g,new T.LineBasicMaterial({color:'#414647',transparent:true,opacity:.64}));occluders.add(line);}}
  // Dashed review controls can be switched off. They are NOT physical paint / surveyed lines.
  function dashed(points,level,color){const g=new T.BufferGeometry().setFromPoints(points.map(p=>new T.Vector3(p[0],level,-p[1]))),o=new T.Line(g,new T.LineDashedMaterial({color,dashSize:.65,gapSize:.35,depthTest:false,transparent:true,opacity:.85}));o.computeLineDistances();o.renderOrder=9;guides.add(o);}
  dashed(fenceEdge,L.forecourt+.08,'#cb8d36');dashed(kerbEdge,L.sidewalk+.07,'#41879b');dashed([[-9,data.rearClip.y],[data.east.apronEdgeX,data.rearClip.y]],L.forecourt+.03,'#818e92');
  const label=(text,x,y,w)=>{const o=sign(text,x,L.forecourt+.045,-y,w,.65,0,guides,'#f6f2e9','#3a515b');o.rotation.x=-Math.PI/2;return o;};
  label('FORECOURT · EXISTING CONTEXT',17,-4.9,13);label('PUBLIC ROAD EDGE · TBC',23,-12,16);label('SIDE ACCESS · TBC',45.2,13,7);label('MODEL CROP · NOT PROPERTY LINE',23,29,19);
  for(const b of batches.values()){const geo=b.kind==='rod'?new T.CylinderGeometry(1,1,1,8):b.kind==='blob'?new T.IcosahedronGeometry(1,1):new T.BoxGeometry(1,1,1);const inst=new T.InstancedMesh(geo,b.mat,b.list.length);b.list.forEach((m,i)=>inst.setMatrixAt(i,m));inst.instanceMatrix.needsUpdate=true;inst.castShadow=b.parent!==ground;inst.receiveShadow=true;inst.name='SITE-BATCH-'+b.kind;inst.computeBoundingSphere();b.parent.add(inst);}
  return {ground,objects,occluders,guides,contours:{fenceEdge,kerbEdge,roadOuter},levels:L};
};
