/* Benz Chitchai v11 — authored Mercedes vehicle silhouettes from owner photos.
 * No manufacturer CAD, official dimensions, trim/year assertion or source-photo texture.
 * Planning axes: local front +X; plan (cx,cy) -> world (cx,0,-cy).
 * Factory: const mercedes = window.BC_MERCEDES(THREE, {mesh,box,tube,sign,M});
 *          mercedes.car(c, parent);  c.l/c.w include every visible mesh, including mirrors.
 */
(function () {
  'use strict';

  window.BC_MERCEDES = function (T, h) {
    if (!T || !h || typeof h.mesh !== 'function' || typeof h.box !== 'function' || typeof h.tube !== 'function') {
      throw new TypeError('BC_MERCEDES requires THREE and the scene mesh, box and tube helpers.');
    }
    const {mesh, box, tube} = h;
    const TAU = Math.PI * 2;
    const defaults = {
      MB1: {model:'GLS', profile:'gls', paint:'#10151b', photoReference:'LINE_ALBUM_Showroom_260912_3.jpg (left)'},
      MB2: {model:'GLC', profile:'glc', paint:'#f3f2ee', photoReference:'LINE_ALBUM_Showroom_260912_3.jpg (right)', grille:'fine'},
      MB3: {model:'E-Class', profile:'eclass', paint:'#f3f2ee', photoReference:'LINE_ALBUM_Showroom_260912_1.jpg (middle left)'},
      MB4: {model:'GLC', profile:'glc', paint:'#f3f2ee', photoReference:'LINE_ALBUM_Showroom_260912_4.jpg (central)', panoramic:true, sportFace:true},
      MB5: {model:'C-Class', profile:'cclass', paint:'#252b31', photoReference:'LINE_ALBUM_Showroom_260912_8.jpg'},
      MB6: {model:'Photographed Mercedes-AMG coupe', profile:'coupe', paint:'#0c1117', photoReference:'LINE_ALBUM_Showroom_260912_9.jpg (foreground); _6.jpg (front)', familyConfirmed:false}
    };
    // Heights and ratios below are visual assumptions; only c.l/c.w are planning bounds.
    const profiles = {
      gls: {bodyStyle:'suv', length:5.20, width:2.00, height:1.90, wheel:.395, axle:[-.315,.315], belt:1.09,
        body:[[-.50,.72,.42,.87],[-.46,.94,.36,1.04],[-.34,1,.34,1.13],[.22,1,.34,1.17],[.40,.96,.37,1.07],[.49,.82,.42,.95],[.50,.71,.47,.89]],
        cabin:[[-.385,.73,1.03,1.20],[-.305,.79,1.06,1.80],[-.22,.79,1.07,1.90],[.145,.75,1.08,1.88],[.32,.69,1.06,1.18]],
        roof:[[-.295,.68,1.81],[-.22,.70,1.915],[.135,.67,1.895]], doorXs:[-.15,.155], grille:'horizontal', roofRails:true},
      glc: {bodyStyle:'suv', length:4.76, width:1.91, height:1.68, wheel:.365, axle:[-.31,.315], belt:.98,
        body:[[-.50,.68,.39,.77],[-.45,.93,.33,.94],[-.32,1,.32,1.01],[.20,1,.32,1.03],[.40,.94,.36,.91],[.49,.78,.41,.79],[.50,.66,.45,.74]],
        cabin:[[-.38,.66,.95,1.08],[-.28,.76,.97,1.55],[-.17,.77,.98,1.67],[.105,.74,.99,1.65],[.305,.67,.97,1.05]],
        roof:[[-.27,.65,1.575],[-.17,.68,1.687],[.095,.65,1.665]], doorXs:[-.145,.14], grille:'diamond', roofRails:true},
      eclass: {bodyStyle:'saloon', length:4.95, width:1.90, height:1.49, wheel:.34, axle:[-.325,.32], belt:.91,
        body:[[-.50,.64,.35,.68],[-.465,.87,.30,.87],[-.34,.98,.29,.93],[.22,1,.29,.96],[.41,.92,.33,.84],[.495,.73,.37,.72],[.50,.63,.42,.69]],
        cabin:[[-.35,.60,.88,.97],[-.225,.73,.91,1.38],[-.13,.75,.93,1.49],[.075,.73,.93,1.47],[.265,.62,.92,.99]],
        roof:[[-.22,.60,1.395],[-.13,.66,1.505],[.067,.64,1.485]], doorXs:[-.145,.135], grille:'diamond'},
      cclass: {bodyStyle:'saloon', length:4.75, width:1.86, height:1.45, wheel:.335, axle:[-.315,.32], belt:.89,
        body:[[-.50,.64,.35,.65],[-.46,.88,.29,.82],[-.33,.99,.28,.92],[.20,1,.28,.93],[.415,.91,.32,.80],[.495,.72,.37,.70],[.50,.62,.41,.66]],
        cabin:[[-.345,.60,.86,.95],[-.225,.72,.89,1.34],[-.13,.74,.91,1.45],[.075,.71,.91,1.435],[.27,.61,.89,.96]],
        roof:[[-.22,.59,1.355],[-.13,.65,1.467],[.066,.62,1.451]], doorXs:[-.145,.135], grille:'diamond'},
      coupe: {bodyStyle:'coupe', length:4.84, width:1.91, height:1.425, wheel:.35, axle:[-.315,.315], belt:.91,
        body:[[-.50,.61,.33,.67],[-.45,.88,.27,.87],[-.32,1,.265,.99],[.18,1,.265,.95],[.415,.92,.29,.83],[.495,.72,.34,.70],[.50,.62,.40,.65]],
        cabin:[[-.385,.57,.91,.99],[-.25,.68,.94,1.29],[-.135,.73,.95,1.415],[.035,.69,.95,1.425],[.22,.60,.92,1.00]],
        roof:[[-.245,.56,1.308],[-.135,.64,1.432],[.028,.60,1.442]], doorXs:[.02], grille:'vertical', sportFace:true, panoramic:true}
    };
    const mat = {
      tire:new T.MeshStandardMaterial({color:'#111315',roughness:.86}),
      grille:new T.MeshStandardMaterial({color:'#10171c',roughness:.38,metalness:.22}),
      trim:new T.MeshStandardMaterial({color:'#242a2f',roughness:.34,metalness:.36}),
      chrome:new T.MeshStandardMaterial({color:'#aeb8c0',roughness:.24,metalness:.88}),
      rimDark:new T.MeshStandardMaterial({color:'#333d47',roughness:.29,metalness:.76}),
      glass:new T.MeshPhysicalMaterial({color:'#172b35',roughness:.12,metalness:.08,clearcoat:1,clearcoatRoughness:.12}),
      light:new T.MeshStandardMaterial({color:'#e6f5ff',emissive:'#cde8ff',emissiveIntensity:.40,roughness:.20}),
      lightDark:new T.MeshStandardMaterial({color:'#283746',roughness:.20,metalness:.42}),
      tail:new T.MeshStandardMaterial({color:'#8e1426',emissive:'#9d182a',emissiveIntensity:.26,roughness:.24}),
      brake:new T.MeshStandardMaterial({color:'#ae2430',roughness:.42,metalness:.32})
    };
    for (const value of Object.values(mat)) value.envMapIntensity = .38;

    function finite(value, fallback) { return Number.isFinite(value) ? value : fallback; }
    function positive(value, fallback) { return Number.isFinite(value) && value > 0 ? value : fallback; }
    function paintColor(value, fallback) {
      const colors = {black:'#10151b',white:'#f3f2ee',silver:'#aeb8c1',grey:'#697078',gray:'#697078',dark:'#242b32'};
      const color = value && typeof value === 'object' ? value.color : value;
      return typeof color === 'string' ? (colors[color.toLowerCase()] || color) : fallback;
    }
    function specification(c) {
      const base = defaults[c.id] || {};
      const model = c.model || c.evidenceFamily || base.model || 'Mercedes-Benz';
      const label = String(model).toLowerCase();
      let key = base.profile || 'cclass';
      if (Object.prototype.hasOwnProperty.call(profiles,c.profile)) key=c.profile;
      else if (/coup[eé]/.test(label) || /coup[eé]/i.test(c.bodyStyle || '')) key='coupe';
      else if (/\bgls\b/.test(label)) key='gls';
      else if (/\bglc\b/.test(label)) key='glc';
      else if (/e[- ]?class/.test(label)) key='eclass';
      else if (/c[- ]?class/.test(label)) key='cclass';
      else if (c.bodyStyle === 'suv' && !base.profile) key='glc';
      const p = profiles[key];
      return {...base, ...p, key, model:String(model),
        evidenceFamily:c.evidenceFamily || (key==='coupe' ? 'Mercedes two-door coupe; exact family unresolved' : String(model)),
        photoReference:c.photoReference || base.photoReference || 'See vehicle-evidence.md; no individual photo assigned',
        paint:paintColor(c.paint || c.paintColor || c.color, base.paint || '#b8c0c7'),
        grille:c.grille || base.grille || p.grille,
        panoramic:typeof c.panoramic==='boolean' ? c.panoramic : !!(base.panoramic || p.panoramic),
        sportFace:typeof c.sportFace==='boolean' ? c.sportFace : !!(base.sportFace || p.sportFace)};
    }

    function mark(object, name, part) { object.name=name; object.userData.part=part || name; return object; }
    function line(points, radius, material, parent, name) {
      const curve = new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)));
      return mark(mesh(new T.TubeGeometry(curve,Math.max(8,points.length*4),radius,6,false),material,parent),name);
    }
    function loft(sections, material, parent, name, rings=24) {
      const vertices=[], indices=[];
      for (const [x,width,bottom,top] of sections) {
        for(let j=0;j<rings;j++) {
          const a=j*TAU/rings, co=Math.cos(a), si=Math.sin(a);
          const yUnit=Math.sign(si)*Math.pow(Math.abs(si),.45);
          const zUnit=Math.sign(co)*Math.pow(Math.abs(co),.45);
          const taper=.91+.09*(yUnit+1)/2;
          vertices.push(x,(top+bottom)/2+yUnit*(top-bottom)/2,zUnit*width*taper);
        }
      }
      for(let i=0;i<sections.length-1;i++) for(let j=0;j<rings;j++) {
        const a=i*rings+j, b=i*rings+(j+1)%rings, c=a+rings, d=b+rings;
        indices.push(a,c,b,b,c,d);
      }
      for(let j=1;j<rings-1;j++) {
        indices.push(0,j,j+1);
        const a=(sections.length-1)*rings;
        indices.push(a,a+j+1,a+j);
      }
      const geometry=new T.BufferGeometry();
      geometry.setAttribute('position',new T.Float32BufferAttribute(vertices,3));
      geometry.setIndex(indices);geometry.computeVertexNormals();
      return mark(mesh(geometry,material,parent),name);
    }
    function sectionsScaled(rows,length,halfWidth) {
      return rows.map(([x,w,b,t])=>[x*length,w*halfWidth,b,t]);
    }
    function roundedFace(x,y,z,width,height,radius,material,parent,name) {
      const w=width/2, t=height/2, r=Math.min(radius,w,t), shape=new T.Shape();
      shape.moveTo(-w+r,-t);shape.lineTo(w-r,-t);shape.quadraticCurveTo(w,-t,w,-t+r);
      shape.lineTo(w,t-r);shape.quadraticCurveTo(w,t,w-r,t);shape.lineTo(-w+r,t);
      shape.quadraticCurveTo(-w,t,-w,t-r);shape.lineTo(-w,-t+r);shape.quadraticCurveTo(-w,-t,-w+r,-t);
      const o=mark(mesh(new T.ShapeGeometry(shape,6),material,parent),name);
      o.position.set(x,y,z);o.rotation.y=x>=0?Math.PI/2:-Math.PI/2;return o;
    }
    function star(x,y,z,radius,parent,normal='x',material=mat.chrome) {
      const ring=mark(mesh(new T.TorusGeometry(radius,radius*.073,6,32),material,parent),'Mercedes star ring','emblem');
      ring.position.set(x,y,z);if(normal==='x')ring.rotation.y=Math.PI/2;
      for(let i=0;i<3;i++) {
        const a=Math.PI/2+i*TAU/3;
        const tip=normal==='x'?[x,y+Math.sin(a)*radius*.91,z+Math.cos(a)*radius*.91]:[x+Math.cos(a)*radius*.91,y+Math.sin(a)*radius*.91,z];
        mark(tube([x,y,z],tip,radius*.055,material,parent),'Mercedes star spoke','emblem');
      }
    }
    function wheel(x,z,p,parent) {
      const g=new T.Group();g.position.set(x,p.wheel,z);g.name='Wheel';g.userData.part='wheel';parent.add(g);
      const r=p.wheel, side=Math.sign(z), depth=.205, outer=side*(depth*.5+.007);
      const points=[
        [r*.77,-depth*.50],[r*.91,-depth*.56],[r*.985,-depth*.36],[r,0],
        [r*.985,depth*.36],[r*.91,depth*.56],[r*.77,depth*.50]
      ].map(([a,b])=>new T.Vector2(a,b));
      const tire=mark(mesh(new T.LatheGeometry(points,28),mat.tire,g),'Rounded tire','tire');tire.rotation.x=Math.PI/2;
      const disk=mark(mesh(new T.CylinderGeometry(r*.735,r*.735,.017,28),mat.grille,g),'Wheel recess','rim');
      disk.rotation.x=Math.PI/2;disk.position.z=outer;
      const rim=mark(mesh(new T.TorusGeometry(r*.747,r*.034,6,28),mat.chrome,g),'Alloy rim edge','rim');rim.position.z=outer+side*.014;
      const spokes=p.key==='coupe'?10:5;
      for(let i=0;i<spokes;i++) {
        const a=i*TAU/spokes+.15;
        for(const offset of (p.key==='coupe'?[0]:[-.048,.048])) {
          const a2=a+offset;
          mark(tube([Math.cos(a2)*r*.13,Math.sin(a2)*r*.13,outer+side*.017],[Math.cos(a2+.05)*r*.705,Math.sin(a2+.05)*r*.705,outer+side*.021],p.key==='coupe'?.011:.016,p.key==='coupe'?mat.rimDark:mat.chrome,g),'Alloy spoke','rim');
        }
      }
      if(p.key==='coupe') box(r*.37,r*.16,outer-side*.018,.06,r*.63,.024,mat.brake,g).name='Photographed red caliper';
      star(0,0,outer+side*.026,r*.14,g,'z');
      return g;
    }

    function car(c, parent) {
      if(!c || typeof c!=='object' || !parent || typeof parent.add!=='function') throw new TypeError('car requires a car record and a THREE parent.');
      const p=specification(c), length=p.length, halfWidth=p.width/2;
      const g=new T.Group(), fit=new T.Group(), model=new T.Group();g.add(fit);fit.add(model);
      g.name=c.id || 'Mercedes';
      model.name='Authored contours';fit.name='Planning-envelope fit';
      const paint=new T.MeshPhysicalMaterial({color:p.paint,roughness:.23,metalness:.48,clearcoat:1,clearcoatRoughness:.16,envMapIntensity:.40});
      const bodyRows=sectionsScaled(p.body,length,halfWidth), cabinRows=sectionsScaled(p.cabin,length,halfWidth);
      loft(bodyRows,paint,model,'Rounded body');
      loft(cabinRows,mat.glass,model,'Swept glazing');
      loft(p.roof.map(([x,w,t])=>[x*length,w*halfWidth,t-.035,t]),paint,model,'Swept painted roof',20);
      if(p.panoramic) loft(p.roof.map(([x,w,t],i)=>[x*length+(i===0?.06:i===p.roof.length-1?-.045:0),w*halfWidth*.84,t-.001,t+.006]),mat.glass,model,'Panoramic glass roof',16);

      // A/C pillars and low window sills follow the sloped glazing rather than vertical boxes.
      for(const side of [-1,1]) {
        const back=cabinRows[0], second=cabinRows[1], pen=cabinRows[cabinRows.length-2], front=cabinRows[cabinRows.length-1];
        line([[back[0],back[3]-.02,side*back[1]*.93],[second[0],second[3]-.025,side*second[1]*.96],[cabinRows[2][0],cabinRows[2][3]-.025,side*cabinRows[2][1]*.96]],.022,paint,model,'Sloping rear pillar');
        line([[pen[0],pen[3]-.02,side*pen[1]*.96],[front[0],front[3]-.04,side*front[1]*.96]],.026,paint,model,'Sloping front pillar');
        line(cabinRows.map(row=>[row[0],row[2]+.025,side*row[1]*.98]),.014,mat.chrome,model,'Window sill');
        const pillarX=(p.key==='coupe'?-.155:-.085)*length;
        line([[pillarX,p.belt+.035,side*halfWidth*.754],[pillarX-.035,p.height-.025,side*halfWidth*.704]],p.key==='coupe'?.021:.028,mat.trim,model,'Window B pillar');
        for(const dx of p.doorXs) {
          const x=dx*length;
          line([[x+.18,p.belt-.017,side*halfWidth*1.005],[x+.18,.43,side*halfWidth*.927]],.0045,mat.trim,model,'Door seam');
          line([[x-.03,p.belt+.025,side*halfWidth*1.012],[x+.105,p.belt+.025,side*halfWidth*1.012]],.009,mat.chrome,model,'Door handle');
        }
        line([[-length*.37,.33,side*halfWidth*.95],[0,.32,side*halfWidth*.98],[length*.37,.36,side*halfWidth*.94]],.025,mat.trim,model,'Lower sill');
        const mirror=new T.Mesh(new T.SphereGeometry(.11,16,10),paint);model.add(mirror);
        mirror.name='Rounded side mirror';mirror.userData.part='mirror';
        mirror.scale.set(1.24,.53,.80);mirror.position.set(length*.205,p.belt+.19,side*halfWidth*1.015);
        mark(tube([length*.195,p.belt+.16,side*halfWidth*.77],[length*.205,p.belt+.185,side*halfWidth*1.0],.022,mat.trim,model),'Mirror support');
      }
      if(p.roofRails) for(const side of [-1,1]) {
        line(p.roof.map(([x,w,t])=>[x*length,t+.035,side*w*halfWidth*.88]),.017,mat.chrome,model,'Roof rail');
      }

      const wheelZ=halfWidth*.91;
      for(const axle of p.axle) for(const side of [-1,1]) {
        wheel(axle*length,side*wheelZ,p,model);
        const arch=mark(mesh(new T.TorusGeometry(p.wheel+.035,.024,6,24,Math.PI),p.bodyStyle==='suv'?mat.trim:paint,model),'Upper wheel arch','fender');
        arch.position.set(axle*length,p.wheel,side*halfWidth*.976);
      }

      const nose=length*.505, rear=-length*.505;
      const grilleHeight=p.key==='gls'?.38:p.key==='glc'?.30:.27;
      const grilleY=p.key==='gls'?.78:p.key==='glc'?.67:.61;
      const grilleWidth=p.key==='gls'?1.23:p.key==='coupe'?1.17:1.09;
      roundedFace(nose,grilleY,0,grilleWidth,grilleHeight,.12,mat.chrome,model,'Grille surround');
      roundedFace(nose+.003,grilleY,0,grilleWidth-.045,grilleHeight-.037,.105,mat.grille,model,'Dark grille');
      if(p.grille==='horizontal') {
        for(const offset of [-.12,0,.12]) box(nose+.013,grilleY+offset,0,.024,.035,grilleWidth-.12,mat.chrome,model).name='GLS horizontal grille bar';
      } else if(p.grille==='vertical' || p.grille==='fine') {
        const step=p.grille==='fine'?.051:.088;
        for(let z=-grilleWidth*.40;z<=grilleWidth*.40+.001;z+=step) box(nose+.014,grilleY,z,.022,grilleHeight*.77,p.grille==='fine'?.010:.017,mat.chrome,model).name='Vertical grille detail';
      } else {
        box(nose+.016,grilleY,0,.022,.022,grilleWidth-.10,mat.chrome,model).name='Single grille crossbar';
        const dots=[], dotGeometry=new T.SphereGeometry(.009,5,4);
        for(const yy of [-.07,.07]) for(let z=-.44;z<=.45;z+=.085) dots.push([nose+.011,grilleY+yy,z]);
        const dotMesh=new T.InstancedMesh(dotGeometry,mat.chrome,dots.length), transform=new T.Matrix4();
        dots.forEach((point,index)=>{transform.makeTranslation(...point);dotMesh.setMatrixAt(index,transform);});
        dotMesh.name='Schematic star-pattern grille points';dotMesh.castShadow=true;model.add(dotMesh);
      }
      star(nose+.033,grilleY,0,p.key==='gls'?.113:.101,model);
      roundedFace(nose-.015,grilleY-grilleHeight*.72,0,grilleWidth*.83,.105,.038,mat.grille,model,'Lower intake');
      for(const side of [-1,1]) {
        const z=side*halfWidth*.69, lampY=p.key==='gls'?1.015:p.key==='glc'?.915:.854;
        roundedFace(nose-.056,lampY,z,.39,p.key==='gls'?.115:.085,.035,mat.lightDark,model,'Headlamp lens');
        line([[nose-.052,lampY+.022,z-side*.17],[nose-.032,lampY+.030,z+side*.12],[nose-.059,lampY-.012,z+side*.165]],.014,mat.light,model,'Slim LED signature');
        roundedFace(rear, p.key==='gls'?.98:p.key==='glc'?.90:.865,z,.42,.071,.018,mat.tail,model,'Slim rear lamp');
        if(p.sportFace) roundedFace(nose-.028,.42,side*halfWidth*.72,.26,.16,.052,mat.grille,model,'Sport lower intake');
        const exhaust=mark(mesh(new T.CylinderGeometry(.048,.048,.06,14),mat.chrome,model),'Schematic exhaust outlet');
        exhaust.rotation.z=Math.PI/2;exhaust.position.set(rear+.055,.315,side*halfWidth*.65);
      }
      line([[rear+.02,.39,-halfWidth*.77],[rear-.001,.38,0],[rear+.02,.39,halfWidth*.77]],.020,mat.trim,model,'Rear bumper trim');
      if(typeof h.sign==='function') {
        const displayName=p.key==='coupe'?'Mercedes-AMG':p.model;
        const plate=h.sign(displayName,nose+.036,.405,0,.41,.115,Math.PI/2,model,'#303b43','#e8e9e5');
        plate.name='Family display plate';plate.userData.part='plate';
      }

      // Measure all details before fitting: mirrors, logos, tires and plate are part of the envelope.
      model.updateMatrixWorld(true);
      const bounds=new T.Box3().setFromObject(model), size=bounds.getSize(new T.Vector3()), center=bounds.getCenter(new T.Vector3());
      const targetLength=positive(c.l,p.length), targetWidth=positive(c.w,p.width);
      model.position.set(-center.x,-bounds.min.y,-center.z);
      const heightCap=positive(c.height,null), heightScale=heightCap===null?1:Math.min(1,heightCap/size.y);
      fit.scale.set(targetLength/size.x,heightScale,targetWidth/size.z);
      g.position.set(finite(c.cx,0),0,-finite(c.cy,0));g.rotation.y=finite(c.angle,0)*Math.PI/180;
      g.userData={id:c.id || 'Mercedes',kind:'vehicle',brand:'Mercedes-Benz',model:p.model,evidenceFamily:p.evidenceFamily,
        bodyStyle:p.bodyStyle,profile:p.key,paint:p.paint,photoReference:p.photoReference,
        schematic:true,manufacturerCAD:false,status:'Authored photo-based schematic; not manufacturer CAD or measured vehicle dimensions',
        familyConfirmed:typeof c.familyConfirmed==='boolean'?c.familyConfirmed:(p.key!=='coupe' && /^(GLS|GLC|[CE][- ]Class)$/i.test(p.evidenceFamily.replace(/^Mercedes[- ]Benz\s+/i,''))),
        frontAxis:'+X',planningEnvelope:{length:targetLength,width:targetWidth,heightCap,includesMirrors:true},
        rawVisualDimensions:{length:size.x,width:size.z,height:size.y},fittedVisualHeight:size.y*heightScale,
        heightStatus:heightScale<1?'Photo-based visual assumption reduced to requested height cap':'Photo-based visual assumption',
        evidenceNote:p.key==='coupe'?'Black two-door car in owner photos 6/9; exact model family, trim and year unasserted':'Family identified from owner photo display plate; trim and year unasserted'};
      parent.add(g);g.updateMatrixWorld(true);return g;
    }
    return {car};
  };
}());
