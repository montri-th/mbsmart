/* Existing-context ground model. All objects use the unchanged v07 plan coordinate frame.
 * Display edges are photo/legacy candidates, NEVER title-deed or road-reserve boundaries.
 * No uploaded site photographs are used as textures. Proposed objects live separately.
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
  const {filletCentre:fc,filletRadius:fr}=data.corner;
  const arc=Array.from({length:33},(_,i)=>{const a=-Math.PI/2+i*Math.PI/64;return [fc[0]+fr*Math.cos(a),fc[1]+fr*Math.sin(a)];});
  const baseEdge=[[data.bounds.xMin,raw[0][1]],...arc,raw.at(-1)];
  function edge(offset=0){return baseEdge.map((p,i)=>{const before=baseEdge[Math.max(0,i-1)],after=baseEdge[Math.min(baseEdge.length-1,i+1)],dx=after[0]-before[0],dy=after[1]-before[1],len=Math.hypot(dx,dy);return [p[0]+dy/len*offset,p[1]-dx/len*offset];});}
  const fenceEdge=edge(0),kerbEdge=edge(SW),roadOuter=edge(SW+data.road.displayStripWidth);
  const gx=data.front.gate,fy=data.front.apronEdgeY.value,ex=data.east.apronEdgeX,[ey0,ey1]=data.east.serviceGapY;
  const transitions=data.gateTransitions;
  // Solid apron is notched around the two graded gate surfaces, avoiding buried ramps.
  const sideNotch=data.east.openingEnabled?[[ex,ey0],[transitions.eastInnerX,ey0],[transitions.eastInnerX,ey1],[ex,ey1]]:[];
  const apron=[raw[0],[gx.xMin,transitions.frontInnerY],[gx.xMax,transitions.frontInnerY],[gx.xMax,fy],...baseEdge.slice(1,-1),...sideNotch,raw.at(-1),...data.leftContextEdge.slice(1).reverse()];
  const terrainBase=L.road-.25;
  const earth=slab(apron,terrainBase,L.forecourt-.12-terrainBase,retaining,ground);earth.name='CONTEXT-TERRAIN-VOLUME-NOT-PAVEMENT-THICKNESS';earth.userData={status:'render-only earth infill to close graded apron notches',notForQuantityTakeoff:true};
  const pavement=slab(apron,L.forecourt-.12,.12,concrete,ground);pavement.userData={status:'visual finish thickness only, not verified paving specification',notForQuantityTakeoff:true};
  // Extended rear working context only, not a newly inferred street/property fence.
  const rear=slab([[0,30],[data.rearGroundXMax,30],[data.rearGroundXMax,data.rearClip.y],[0,data.rearClip.y]],L.forecourt-.2,.2,concrete,ground);rear.name='REAR-WORKSHOP-CONTEXT-EXTENSION';rear.userData={notPropertyBoundary:true,status:'photo-fit working ground, not survey'};
  // Existing floor base: close the former floating 0.68m band without changing interior FFL.
  if(h.floor){const base=slab(h.floor,L.forecourt,-.12-L.forecourt,M.column,objects);base.name='EXISTING-BASE-SKIRT-HEIGHT-ASSUMED';base.userData={status:'photo-scale exterior height, not measured foundation',top:-.12,bottom:L.forecourt};}
  // Separate sidewalk spans leave real mesh openings at both gate mouths.
  for(let i=0;i<fenceEdge.length-1;i++){const a=fenceEdge[i],b=fenceEdge[i+1],oa=kerbEdge[i],ob=kerbEdge[i+1],cuts=splitAtGates(a,b);for(let j=0;j<cuts.length-1;j++){const t0=cuts[j],t1=cuts[j+1],mid=lerp(a,b,(t0+t1)/2);if(openGate(...mid))continue;slab([lerp(a,b,t0),lerp(a,b,t1),lerp(oa,ob,t1),lerp(oa,ob,t0)],L.sidewalk-.16,.16,paving,ground);}}
  slab([...kerbEdge,...roadOuter.slice().reverse()],L.road-.14,.14,asphalt,ground);
  // Public context is a T-junction: Sukhumvit continues in BOTH X directions;
  // Samet–Ang Sila continues beside the workshop, never a sealed dead end.
  if(data.road.topology==='T-junction'){
    const frontY=data.front.apronEdgeY.value-SW,sideX=data.east.apronEdgeX+SW;
    const main=slab([[-35,frontY-13],[96,frontY-13],[96,frontY],[-35,frontY]],L.road-.14,.14,asphalt,ground);main.name='SUKHUMVIT-CONTINUOUS-ROAD-CONTEXT';
    const samet=data.road.sametAngSila;
    const laneStudy=samet&&samet.lanesPerDirection===3&&samet.totalLanes===6&&samet.laneWidth>0&&samet.medianWidth>0;
    const roadWidth=laneStudy?samet.totalLanes*samet.laneWidth+samet.medianWidth:13;
    const branch=slab([[sideX,frontY],[sideX+roadWidth,frontY],[sideX+roadWidth,76],[sideX,76]],L.road-.14,.14,asphalt,ground);branch.name='SAMET-ANG-SILA-CONTINUING-BRANCH';
    branch.userData={...(samet||{}),nearKerbX:sideX,farKerbX:sideX+roadWidth,roadWidth,propertyBoundaryMoved:false,notTrafficEngineeringDesign:true};
    if(laneStudy){
      // The owner confirms 3 + 3 lanes. Widths and median nose are only photo-fit
      // context: keep the existing near kerb and widen away from the property.
      const roadGroup=new T.Group();roadGroup.name='SAMET-ANG-SILA-SIX-LANE-CONTEXT';roadGroup.userData={...branch.userData,lanesPerDirection:3,totalLanes:6};ground.add(roadGroup);
      const markingMat=new T.MeshStandardMaterial({color:'#dddcd3',roughness:1});
      const markerStart=Math.max(frontY+6,fc[1]+fr+SW),farY=76;
      const laneLevel=L.road+.003;
      for(const carriageway of ['NEAR','FAR']){
        const carriagewayX=sideX+(carriageway==='FAR'?3*samet.laneWidth+samet.medianWidth:0);
        for(let lane=0;lane<3;lane++){
          const x0=carriagewayX+lane*samet.laneWidth,x1=x0+samet.laneWidth;
          const laneMesh=slab([[x0,frontY],[x1,frontY],[x1,farY],[x0,farY]],laneLevel-.003,.003,asphalt,roadGroup);
          laneMesh.name=`SAMET-${carriageway}-LANE-${lane+1}`;
          laneMesh.userData={carriageway,lane:lane+1,bounds:[x0,frontY,x1,farY],laneWidth:samet.laneWidth,dimensionStatus:samet.dimensionStatus,drivingSide:samet.drivingSide,planYDirection:carriageway==='NEAR'?samet.nearCarriagewayPlanYDirection:samet.farCarriagewayPlanYDirection,trafficDirection:'Owner-confirmed left-hand traffic; no turn-permission or approved traffic-layout claim',directionArrowsDrawn:false};
        }
        for(let divider=1;divider<3;divider++){
          const marks=new T.Group();marks.name=`SAMET-${carriageway}-LANE-DIVIDER-${divider}`;marks.userData={dimensionStatus:samet.dimensionStatus,notApprovedRoadMarkings:true};roadGroup.add(marks);
          for(let y=markerStart;y<farY;y+=6){const end=Math.min(y+3,farY);planBox(carriagewayX+divider*samet.laneWidth,(y+end)/2,.10,end-y,.008,markingMat,laneLevel+.002,marks);}
        }
      }
      const mx=sideX+3*samet.laneWidth,mw=samet.medianWidth,nose=Math.min(.65,mw/2),my=markerStart;
      const median=slab([[mx+nose,my],[mx+mw-nose,my],[mx+mw,my+nose],[mx+mw,farY],[mx,farY],[mx,my+nose]],L.road,.16,paving,roadGroup);
      median.name='SAMET-ANG-SILA-MEDIAN-PHOTO-FIT';median.userData={width:mw,startY:my,nearX:mx,farX:mx+mw,dimensionStatus:samet.dimensionStatus,notApprovedTrafficIsland:true};
      for(const x of [mx,mx+mw])for(let y=my+nose;y<farY;y+=.8){const end=Math.min(y+.8,farY);planBox(x,(y+end)/2,.16,end-y,.17,Math.floor((y-my-nose)/.8)%2?fenceMat:black,L.road,roadGroup);}
    }
  }
  // Discrete side/rear context, deliberately not an invented full-site enclosure.
  slab([[-13,data.front.apronEdgeY.value],...data.leftContextEdge,[-13,40.5]],L.forecourt-.2,.18,soil,ground);
  function openGate(x,y,offset=0){return (y<data.front.apronEdgeY.value+.12&&x>data.front.gate.xMin&&x<data.front.gate.xMax)||(data.east.openingEnabled&&x>data.east.apronEdgeX-.1&&y>data.east.serviceGapY[0]&&y<data.east.serviceGapY[1]);}
  function lerp(a,b,t){return [a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];}
  function splitAtGates(a,b){const ts=[0,1];for(const [axis,limits] of [[0,[data.front.gate.xMin,data.front.gate.xMax]],[1,data.east.serviceGapY]]){const delta=b[axis]-a[axis];if(Math.abs(delta)<1e-8)continue;for(const v of limits){const t=(v-a[axis])/delta;if(t>1e-8&&t<1-1e-8)ts.push(t);}}return [...new Set(ts)].sort((a,b)=>a-b);}
  function segments(points,step,fn,split=splitAtGates){let cumulative=0;for(let i=0;i<points.length-1;i++){const a=points[i],b=points[i+1],dx=b[0]-a[0],dy=b[1]-a[1],len=Math.hypot(dx,dy),cuts=split(a,b);for(let k=0;k<cuts.length-1;k++){const start=cuts[k],span=cuts[k+1]-start,n=Math.max(1,Math.ceil(len*span/step));for(let j=0;j<n;j++){const t=start+span*(j+.5)/n;fn(a[0]+dx*t,a[1]+dy*t,len*span/n,Math.atan2(dy,dx),cumulative+len*t);}}cumulative+=len;}}
  // Canonical edge is the physical INNER face, not the centre of a thick fence.
  // Each member projects its own thickness outward so the owner's clear datum
  // stays 7.20m from the retained planter, independent of material thickness.
  const fence=new T.Group();fence.name='EXISTING-FENCE-INNER-FACE-DATUM';
  fence.userData={...data.fence,frontPlanterOuterY:data.front.confirmedPlanterOuterY,frontClearDistance:data.front.setbackFromPlinth.value,cornerStatus:data.corner.status};objects.add(fence);
  function fenceBox(x,y,height,w,ht,depth,mat,angle){const ox=Math.sin(angle)*depth/2,oy=-Math.cos(angle)*depth/2;ibox(x+ox,height,-(y+oy),w,ht,depth,mat,fence,angle);}
  const roadsideMasonry=data.fence.roadsideMasonry;
  function isRoadsideMasonry(x,y){return roadsideMasonry?.enabled&&Math.abs(x-roadsideMasonry.insideFaceX)<.04&&(roadsideMasonry.segments||[]).some(([a,b])=>y>=Math.min(a,b)&&y<=Math.max(a,b));}
  function splitAtFenceMaterial(a,b){const ts=splitAtGates(a,b);if(roadsideMasonry?.enabled&&Math.abs(b[1]-a[1])>1e-8)for(const y of (roadsideMasonry.segments||[]).flat()){const t=(y-a[1])/(b[1]-a[1]);if(t>1e-8&&t<1-1e-8)ts.push(t);}return [...new Set(ts)].sort((a,b)=>a-b);}
  // Weathered retaining face plus existing white vertical-bar fence, omitted at candidate gates.
  // Roadside breeze-block masonry is constructed by building-annexes.js on this
  // SAME datum. Keep the below-apron retaining face, never superimpose white rails.
  const wallTop=L.forecourt+.04,wallBottom=L.sidewalk-.05;
  segments(fenceEdge,.24,(x,y,len,a)=>{if(x<raw[0][0]||openGate(x,y))return;fenceBox(x,y,(wallTop+wallBottom)/2,len,wallTop-wallBottom,data.fence.retainingThickness,retaining,a);if(!isRoadsideMasonry(x,y))fenceBox(x,y,wallTop+.57,.027,1.12,.027,fenceMat,a);},splitAtFenceMaterial);
  segments(fenceEdge,1.8,(x,y,len,a)=>{if(x<raw[0][0]||openGate(x,y)||isRoadsideMasonry(x,y))return;for(const ht of [.12,1.1])fenceBox(x,y,wallTop+ht,len,.048,.048,fenceMat,a);fenceBox(x,y,wallTop+.59,.065,1.17,.065,fenceMat,a);},splitAtFenceMaterial);
  segments(fenceEdge,1.8,(x,y,len,a,s)=>{if(x<raw[0][0]||openGate(x,y))return;fenceBox(x,y,wallTop-.07,len,.12,.25,retaining,a);if(Math.floor(s/1.8)%2===0)fenceBox(x,y,wallTop-.16,.24,.12,.255,black,a);});
  // Current photos: a dark open channel just INSIDE the fence, with poles on its apron edge.
  // Surface recess is a visual proxy; no excavation depth or outfall is certified.
  const drain=data.frontDrain;
  segments(fenceEdge,.7,(x,y,len,a)=>{if(x<raw[0][0]||openGate(x,y))return;const ix=x-Math.sin(a)*drain.insideOffset,iy=y+Math.cos(a)*drain.insideOffset;ibox(ix,L.forecourt+.009,-iy,len+.008,.015,drain.width,black,ground,a);});
  // Named photographed white polylines, NOT a repeated bay/pole-spacing array.
  // Incomplete spans intentionally stop where correspondence is unresolved.
  for(const paint of data.exteriorParking.paint){
    const g=new T.Group();g.name='PARKING-PAINT-'+paint.id;g.userData={...paint,coordinateStatus:data.exteriorParking.coordinateStatus};ground.add(g);
    for(let i=1;i<paint.points.length;i++){const a=paint.points[i-1],b=paint.points[i],dx=b[0]-a[0],dy=b[1]-a[1];ibox((a[0]+b[0])/2,L.forecourt+.017,-(a[1]+b[1])/2,Math.hypot(dx,dy),.014,.08,fenceMat,g,Math.atan2(dy,dx));}
  }
  const fadedRed=new T.MeshStandardMaterial({color:'#a96563',roughness:1});
  segments(kerbEdge,.78,(x,y,len,a,s)=>{if(openGate(x,y,SW))return;ibox(x,L.road+.085,-y,len-.016,.17,.2,Math.floor(s/.78)%2?fenceMat:x>data.kerb.colourTransitionNearX?fadedRed:black,objects,a);});
  // Paver seams and existing concrete joints only; these are not parking capacity claims.
  segments(kerbEdge,1.15,(x,y,len,a)=>{if(openGate(x,y))return;const normal=[-Math.sin(a),Math.cos(a)];const x2=x+normal[0]*SW,y2=y+normal[1]*SW;irod([x,L.sidewalk+.006,-y],[x2,L.sidewalk+.006,-y2],.008,grey,ground);});
  function edgeAt(value,axis){for(let i=0;i<fenceEdge.length-1;i++){const a=fenceEdge[i],b=fenceEdge[i+1];if(value>=Math.min(a[axis],b[axis])&&value<=Math.max(a[axis],b[axis])&&Math.abs(b[axis]-a[axis])>1e-8)return lerp(a,b,(value-a[axis])/(b[axis]-a[axis]))[1-axis];}return axis===1?data.east.apronEdgeX:data.front.apronEdgeY.value;}
  for(let x=0;x<=39;x+=4){const yMin=Math.max(-8.2,edgeAt(x,0)+.05,x>gx.xMin&&x<gx.xMax?transitions.frontInnerY:-100),yMax=-1.4;ibox(x,L.forecourt+.004,-(yMin+yMax)/2,.012,.008,yMax-yMin,grey,ground);}
  for(const y of [-3.2,-6.4]){const x0=gx.xMax+.04,x1=38.5;ibox((x0+x1)/2,L.forecourt+.005,-y,x1-x0,.009,.014,grey,ground);}
  for(let y=3;y<30;y+=4){const x0=39.8,x1=Math.min(50.4,edgeAt(y,1)-.05,y>ey0&&y<ey1?transitions.eastInnerX-.02:100);ibox((x0+x1)/2,L.forecourt+.004,-y,x1-x0,.008,.013,grey,ground);}
  // Gate/apron transition mesh, not a checked vehicle or accessible ramp design.
  function surface(points,mat,parent=ground){const v=points.flatMap(p=>[p[0],p[2],-p[1]]),idx=[];for(let i=1;i<points.length-1;i++)idx.push(0,i,i+1);const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(v,3));g.setIndex(idx);g.computeVertexNormals();const m=mat.clone();m.side=T.DoubleSide;return mesh(g,m,parent);}
  surface([[gx.xMin,fy-SW,L.road+.004],[gx.xMax,fy-SW,L.road+.004],[gx.xMax,transitions.frontInnerY,L.forecourt+.004],[gx.xMin,transitions.frontInnerY,L.forecourt+.004]],asphalt);
  if(data.east.openingEnabled)surface([[transitions.eastInnerX,ey0,L.forecourt+.004],[ex+SW,ey0,L.road+.004],[ex+SW,ey1,L.road+.004],[transitions.eastInnerX,ey1,L.forecourt+.004]],concrete);
  // Visible threshold channel; exact drainage levels and outfall remain unverified.
  ibox((gx.xMin+gx.xMax)/2,L.road+.011,-fy+SW-.12,gx.xMax-gx.xMin,.014,.16,black,ground);
  for(let x=gx.xMin+.1;x<gx.xMax;x+=.17)ibox(x,L.road+.021,-fy+SW-.12,.027,.014,.16,M.steel,ground);
  // Owner-confirmed existing vehicle Entrance. Profile is a schematic connection,
  // not a measured grade or vehicle/accessibility design. No new opening added.
  const er=data.entryRamp;
  if(er){const ramp=surface([[er.xMin,er.yMin,L.forecourt+.006],[er.xMax,er.yMin,L.forecourt+.006],[er.xMax,er.yMax,.006],[er.xMin,er.yMax,.006]],concrete,objects);ramp.name='EXISTING-FRONT-ENTRANCE-RAMP';ramp.userData={...er,verifiedDimensions:false};}
  // Retain the historical step proxy only when not superseded by owner evidence.
  if(data.entrySteps.render!==false){
  const es=data.entrySteps,sw=es.xMax-es.xMin,cx=(es.xMin+es.xMax)/2,run=(es.landingY-es.yMin)/es.risers,rise=(0-L.forecourt)/es.risers;
  const entry=new T.Group();entry.name='EXTERIOR-ENTRANCE-STAIR';entry.userData={...es,rise,run};objects.add(entry);
  for(let i=0;i<es.risers;i++){const depth=es.yMax-(es.yMin+i*run),top=L.forecourt+(i+1)*rise;planBox(cx,es.yMax-depth/2,sw,depth,top-L.forecourt,M.column,L.forecourt,entry);for(const dx of [-1.45,0,1.45])planBox(cx+dx,es.yMin+(i+.17)*run,.85,.08,.009,M.dark,top+.002,entry);}
  for(const x of [es.xMin-.19,es.xMax+.19])planBox(x,(es.yMin+es.yMax)/2,.38,es.yMax-es.yMin,.86,M.column,L.forecourt,entry);
  }
  // Retain the photographed main-showroom bed/palms only. Owner confirms no
  // planting at vehicle-handover front glazing, inside fence, or either sidewalk.
  for(const [x,y,w,d] of data.planting.frontBeds){planBox(x+w/2,y+d/2,w,d,.26,M.column,L.forecourt,objects);planBox(x+w/2,y+d/2,w-.16,d-.14,.03,soil,L.forecourt+.26,objects);for(let q=x+.32;q<x+w-.1;q+=.52)blob(q,L.forecourt+.58,y+d/2,.33,.35,.31,leaf);}
  function palm(x,y,index){
    const ht=3.9+(index%3)*.25,base=L.forecourt+.27,glassY=x<24?0:2.5,clearance=.12;
    irod([x,base,-y],[x+.14,base+ht,-y],.11,trunk,occluders);
    for(let i=0;i<11;i++){
      const a=i*Math.PI*2/11+.2*index,originalLength=1.65+.15*(i%3);
      // Owner row14: shorter naturally arching wall-side fronds, rather than a
      // planar cut through long leaves. Include the entire ribbon half-width.
      const inward=Math.max(0,Math.sin(a)),ribbon=.178*Math.abs(Math.cos(a));
      const len=inward>.001?Math.min(originalLength,Math.max(.25,(glassY-clearance-y-ribbon)/inward)):originalLength,verts=[],idx=[];
      for(let j=0;j<=7;j++){const t=j/7,r=t*len,z=base+ht+.52*Math.sin(t*Math.PI)-t*t*.7,w=.17*Math.sin(Math.PI*t)+.008,px=x+.14+Math.cos(a)*r,py=y+Math.sin(a)*r;verts.push(px-Math.sin(a)*w,z,-py-Math.cos(a)*w,px+Math.sin(a)*w,z,-py+Math.cos(a)*w);if(j<7){const k=j*2;idx.push(k,k+1,k+2,k+1,k+3,k+2);}}
      const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(verts,3));geo.setIndex(idx);geo.computeVertexNormals();const frond=mesh(geo,i%2?leaf:leafLight,occluders);frond.name=`PALM-${index+1}-FROND-${i+1}`;frond.userData={facadeClearance:clearance,source:'Owner comment14 / facade photo',geometryStatus:'photo-fit, not surveyed'};
    }
  }
  data.planting.palmCentres.forEach(([x,y],i)=>palm(x,y,i));
  for(let y=3;y<29;y+=3)blob(-11.2,L.forecourt+.45,y,.85,.72,.8,leaf);
  // Owner-retained inventory, photo-fitted from the 2024 views: never moved by scheme switch.
  const [px,py]=data.markers.pylon,pd=data.markers.pylonData,pg=new T.Group();pg.name='EXISTING-MB-PYLON';pg.userData=pd;objects.add(pg);
  pg.position.set(px,L.forecourt,-py);pg.rotation.y=pd.rotationRadians;
  planBox(0,0,pd.width,pd.depth,pd.heightAboveApron,M.dark,0,pg);planBox(0,0,pd.width+.24,pd.depth+.25,.18,M.column,0,pg);
  for(const side of [-1,1]){const logoY=pd.heightAboveApron-.95,logoZ=side*(pd.depth/2+.015),ring=mesh(new T.TorusGeometry(.51,.022,8,48),M.steel,pg);ring.position.set(0,logoY,logoZ);for(let i=0;i<3;i++){const a=Math.PI/2+i*Math.PI*2/3;tube([0,logoY,logoZ],[.49*Math.cos(a),logoY+.49*Math.sin(a),logoZ],.02,M.steel,pg);}}
  for(const f of data.markers.flagData){const g=window.BC_SITE_FLAG(T,h,{x:f.xy[0],y:f.xy[1],base:L.forecourt,kind:f.type==='mercedes-banner'?'mb':'thai',width:f.clothWidth,height:f.clothHeight,poleHeight:f.poleHeightAboveApron});g.name=f.id;g.userData={...g.userData,...f};objects.add(g);planBox(f.xy[0],f.xy[1],.36,.36,.03,M.steel,L.forecourt,objects);for(const dx of [-.13,.13])for(const dy of [-.13,.13])planBox(f.xy[0]+dx,f.xy[1]+dy,.035,.035,.03,M.steel,L.forecourt+.03,objects);}
  const shrine=window.BC_SHRINE(T,{mesh},{rotation:data.markers.shrine.rotationRadians??Math.PI});shrine.name='EXISTING-CHINESE-SHRINE';shrine.position.set(data.markers.shrine.xy[0],L.forecourt,-data.markers.shrine.xy[1]);shrine.userData={...shrine.userData,...data.markers.shrine};objects.add(shrine);
  const [sx,sy]=data.markers.directionSign,dg=new T.Group();dg.name='EXISTING-MB-DIRECTIONAL';dg.userData=data.markers.directionData;dg.position.set(sx,L.forecourt,-sy);dg.rotation.y=data.markers.directionData.rotationRadians;objects.add(dg);
  planBox(0,0,1.25,.25,2,M.column,0,dg);
  dg.userData.faces=data.markers.directionData.faces;
  for(const side of [-1,1]){const rows=side===1?dg.userData.faces.frontEntrance:dg.userData.faces.reverseExit;rows.forEach(([text,arrow],i)=>sign(text+'  '+(arrow==='left'?'←':'→'),0,[1.72,1.33,1.07,.81,.55][i],side*.13,1.16,.23,side===1?0:Math.PI,dg,'#303537','#d5d7d4'));}
  // Utilities are obstruction context only; exact heights/routes/energization are unknown.
  for(const [x,y] of data.utilityPoles){irod([x,L.sidewalk,-y],[x,9.2,-y],.105,grey,occluders);for(const z of [7.5,8.25])irod([x-1,z,-y],[x+1,z,-y],.052,grey,occluders);for(const dx of [-.72,0,.72])ibox(x+dx,8.42,-y,.1,.25,.1,black,occluders);}
  for(let i=0;i<data.utilityPoles.length-1;i++){const a=data.utilityPoles[i],b=data.utilityPoles[i+1];for(const offset of [-.52,-.38,-.2,0,.18,.32,.43,.55]){const pts=[];for(let j=0;j<=16;j++){const t=j/16;pts.push(new T.Vector3(a[0]+(b[0]-a[0])*t,7.7-.4*Math.sin(Math.PI*t)+offset*1.35,-(a[1]+(b[1]-a[1])*t+offset)));}const g=new T.BufferGeometry().setFromPoints(pts),line=new T.Line(g,new T.LineBasicMaterial({color:'#363b3e',transparent:true,opacity:.63}));occluders.add(line);}}
  for(const [x,y] of data.utilityPoles.slice(2)){const loop=mesh(new T.TorusGeometry(.39,.026,6,32),black,occluders);loop.position.set(x-.55,5.9,-y+.14);ibox(x+.28,3.9,-y,.42,.6,.24,grey,occluders);}
  for(const x of [21.8,43.6]){const y=data.front.apronEdgeY.value-1.6;irod([x,L.sidewalk,-y],[x,7.7,-y],.061,M.steel,occluders);irod([x,7.7,-y],[x+1.8,8.15,-y+.4],.039,M.steel,occluders);ibox(x+1.85,8.13,-y+.42,.65,.09,.21,M.steel,occluders);}
  // Dashed review controls can be switched off. They are NOT physical paint / surveyed lines.
  function dashed(points,level,color){const g=new T.BufferGeometry().setFromPoints(points.map(p=>new T.Vector3(p[0],level,-p[1]))),o=new T.Line(g,new T.LineDashedMaterial({color,dashSize:.65,gapSize:.35,depthTest:false,transparent:true,opacity:.85}));o.computeLineDistances();o.renderOrder=9;guides.add(o);}
  dashed(fenceEdge,L.forecourt+.08,'#cb8d36');dashed(kerbEdge,L.sidewalk+.07,'#41879b');dashed([[-9,data.rearClip.y],[data.east.apronEdgeX,data.rearClip.y]],L.forecourt+.03,'#818e92');
  const label=(text,x,y,w)=>{const o=sign(text,x,L.forecourt+.045,-y,w,.65,0,guides,'#f6f2e9','#3a515b');o.rotation.x=-Math.PI/2;return o;};
  label('FORECOURT · EXISTING CONTEXT',17,-4.9,13);label('SUKHUMVIT · CONTINUOUS ROAD',23,-19,18);label('SAMET–ANG SILA',61,22,8);label('MODEL CROP · NOT PROPERTY LINE',23,data.rearClip.y-1,19);
  for(const b of batches.values()){const geo=b.kind==='rod'?new T.CylinderGeometry(1,1,1,8):b.kind==='blob'?new T.IcosahedronGeometry(1,1):new T.BoxGeometry(1,1,1);const inst=new T.InstancedMesh(geo,b.mat,b.list.length);b.list.forEach((m,i)=>inst.setMatrixAt(i,m));inst.instanceMatrix.needsUpdate=true;inst.castShadow=b.parent!==ground;inst.receiveShadow=true;inst.name='SITE-BATCH-'+b.kind;inst.computeBoundingSphere();b.parent.add(inst);}
  return {ground,objects,occluders,guides,contours:{fenceEdge,kerbEdge,roadOuter},levels:L};
};
