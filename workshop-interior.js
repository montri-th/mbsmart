/* Coordination placeholders, NOT surveyed equipment or certified installation. */
window.BC_WORKSHOP_INTERIOR=(T,h,data,annex)=>{
  const {box,planBox,slab,sign,tube,M}=h,g={};
  for(const k of ['baseline','proposed','overhead','guides']){g[k]=new T.Group();g[k].name='WORKSHOP-STUDY-'+k.toUpperCase();g[k].userData={status:data.status,source:data.sources};}
  const floor=annex.floorLevel,green=new T.MeshStandardMaterial({color:'#b4cc59',roughness:.66}),steel=new T.MeshStandardMaterial({color:'#6c7475',roughness:.55,metalness:.35}),mat=new T.MeshStandardMaterial({color:'#48504c',roughness:.95}),paint=new T.MeshStandardMaterial({color:'#d4d9d1',roughness:.9}),light=new T.MeshStandardMaterial({color:'#f2f4e9',emissive:'#eef0e4',emissiveIntensity:.45});
  function mark(text,x,y,width,parent=g.guides,bg='#344a50'){const o=sign(text,x,floor+.034,-y,width,.42,0,parent,'#f3f5ed',bg);o.rotation.x=-Math.PI/2;return o;}
  function line(x0,y0,x1,y1,parent=g.baseline,colour=paint){const o=box((x0+x1)/2,floor+.018,-(y0+y1)/2,Math.hypot(x1-x0,y1-y0),.014,.06,colour,parent);o.rotation.y=Math.atan2(y1-y0,x1-x0);return o;}
  function lift(cx,cy,parent,smart=false){const gr=new T.Group();gr.name=smart?'SMART-LIFT-PROXY':'MB-LIFT-PROXY';gr.userData={kind:'coordination-equipment',supplier:null,structuralApproval:false};parent.add(gr);
    for(const x of [cx-1.25,cx+1.25]){planBox(x,cy,.26,.32,2.85,steel,floor,gr);planBox(x,cy,.28,.35,.28,smart?green:M.dark,floor+1.7,gr);planBox(x,cy,.55,.65,.10,steel,floor,gr);for(const dy of [-.85,.85]){const o=planBox((cx+x)/2,cy+dy,.95,.13,.10,steel,floor+.24,gr);o.rotation.y=x<cx?.2:-.2;}}
    planBox(cx,cy+1.85,1.75,.58,.78,steel,floor,gr);planBox(cx,cy+1.85,1.85,.66,.07,M.wood,floor+.78,gr);return gr;}
  const mb=data.mbPlanningCells;
  for(const [ya,yb] of mb.rows)for(let x=mb.xMin;x<mb.xMax;x+=mb.pitch){line(x,ya,x,yb);lift(x+2,(ya+yb)/2,g.proposed);mark('MB · ALLOCATION TBC',x+2,ya+.5,3.6);}
  for(const [ya,yb] of mb.rows)line(mb.xMax,ya,mb.xMax,yb);
  for(const b of data.smartBays){const bg=new T.Group();bg.name=b.id;bg.userData={...b,status:data.status,clearanceApproved:false};g.proposed.add(bg);const cx=(b.xMin+b.xMax)/2,cy=(b.yMin+b.yMax)/2;
    slab([[b.xMin+.06,b.yMin+.06],[b.xMax-.06,b.yMin+.06],[b.xMax-.06,b.yMax-.08],[b.xMin+.06,b.yMax-.08]],floor+.006,.01,new T.MeshStandardMaterial({color:b.type==='HV'?'#82917b':'#8a9490',roughness:.96}),bg);
    line(b.xMin,b.yMin,b.xMax,b.yMin,bg,green);line(b.xMin,b.yMin,b.xMin,b.yMax,bg,green);line(b.xMax,b.yMin,b.xMax,b.yMax,bg,green);
    lift(cx,cy,bg,true);mark(b.label,cx,b.yMin+.45,3.7,bg,'#273331');
    const s=sign(b.type==='HV'?'HV · ช่องงานแรงดันสูง':'M/E · ช่องงานทั่วไป',cx,3.0,-(b.yMax-.15),3.6,.35,0,bg,'#d7e797','#202826');s.name=b.id+'-LOCAL-LANGUAGE-SIGN-STUDY';
    if(b.type==='HV'){
      const matProxy=planBox(cx,cy-.25,2.7,3.6,.014,mat,floor+.02,bg);matProxy.name='HV-INSULATING-MAT-PLACEHOLDER';matProxy.userData=data.hvProtection;
      // Illustrative barrier with access opening; no safety dimension is certified.
      for(const x of [b.xMin+.22,b.xMax-.22])for(const y of [b.yMin+.35,cy,b.yMax-.25]){planBox(x,y,.065,.065,1.0,green,floor,bg);}
      for(const x of [b.xMin+.22,b.xMax-.22])for(const ht of [.48,.96])tube([x,floor+ht,-(b.yMin+.35)],[x,floor+ht,-(b.yMax-.25)],.024,green,bg);
      const charger=planBox(b.xMax-.45,b.yMax-.25,.32,.22,.55,M.white,floor+1,bg);charger.name='AC-WALLBOX-BRAND-TBC';charger.userData=data.charger;
      tube([b.xMax-.45,floor+1.15,-(b.yMax-.08)],[b.xMax-.8,floor+.8,-(b.yMax-.08)],.024,M.dark,bg);
    }
  }
  // Shared general tools and dedicated smart diagnostic / special-tool placeholders.
  for(const [name,x,y,colour] of [['GENERAL TOOLS · SHARED MB',5.7,24.2,steel],['smart SPECIAL TOOLS',5.7,26.1,green],['smart DIAGNOSIS / DATA',37.8,24.8,green]]){
    planBox(x,y,1.25,.65,1.02,colour,floor,g.proposed);for(const z of [.28,.54,.8])planBox(x,y-.333,1.08,.025,.025,M.dark,floor+z,g.proposed);mark(name,x,y-1.1,4,g.proposed);
  }
  for(const [name,y,colour] of [['MB PARTS',37.1,steel],['smart PARTS',39.7,green]]){
    for(const x of [3.2,6.5]){for(const dx of [-.5,.5])planBox(x+dx,y,.065,.065,2.2,steel,floor,g.proposed);for(const z of [.2,.75,1.3,1.85]){planBox(x,y,1.1,1.8,.07,colour,floor+z,g.proposed);for(const dy of [-.5,.3])planBox(x,y+dy,.6,.48,.32,M.white,floor+z+.07,g.proposed);}}
    mark(name,4.8,y,2.5,g.proposed);
  }
  const sr=data.serviceReception;
  slab([[sr.xMin,sr.yMin],[sr.xMax,sr.yMin],[sr.xMax,sr.yMax],[sr.xMin,sr.yMax]],floor,.3,M.stone,g.baseline);
  planBox(34,19,1.5,3,.9,M.white,sr.floorLevel,g.proposed);planBox(34,19,1.65,3.1,.06,M.wood,sr.floorLevel+.9,g.proposed);mark('SHARED SERVICE · MAR20 / MPS II TBC',34,21.1,4,g.proposed);
  // Fixture proxies follow LP32 orientation; no photometric calculation implied.
  for(let x=9;x<40;x+=4)for(const y of [25.25,38.75]){const o=planBox(x,y,.11,5.8,.06,light,4.7,g.overhead);o.name='LP32-LINEAR-LIGHT-PROXY';}
  mark('CENTRAL AISLE · GRID B–C 7.00m · SWEPT PATH TBC',24,32,22);
  mark('PROPOSED EQUIPMENT / NOT AS-BUILT',20,20.2,18);
  for(const [name,y] of [['A',42],['B',35.5],['C',28.5],['D',22],['E',16]])mark(name+' · '+y.toFixed(2),-1.1,y,2);
  return g;
};
