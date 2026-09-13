/* Existing exterior context asset — Benz Chitchai v08.
 * Authored geometry, not a scan, construction model or official brand asset.
 * Source observations: P10/P11, undated P12, June 2024 X01/X02/X04.
 * ALL exterior heights, X widths, depths, radii and canopy members below are
 * photo-assumed visual proxies. No floor count or structural capacity certified.
 * Metres: plan (X,Y) => world (X,height,-Y). Does not attach to the scene.
 */
(() => {
  'use strict';
  window.BC_EXTERIOR_MASSING = (T, h, data = {}) => {
    const status = 'Approximate — photo reference; not surveyed or engineering';
    const source = ['P10', 'P11', 'P12 (undated)', 'X01/X02/X04 (June 2024)'];
    const groups = {};
    for (const key of ['upper', 'facade', 'canopy']) {
      groups[key] = new T.Group();
      groups[key].name = `EXTERIOR-${key.toUpperCase()}-PHOTO-ASSUMED`;
      groups[key].userData = { kind: 'existing-exterior-context', status, source: source.slice(), geometry: 'authored; no photo texture', verifiedDimensions: false };
    }
    const { upper, facade, canopy } = groups;
    upper.visible = false; // Owner enables only for whole-building exterior views.
    upper.userData.defaultVisibility = 'Off in interior/cutaway views';
    const n = (key, fallback) => Number.isFinite(data[key]) ? data[key] : fallback;
    const base = n('upperBase', 7.2), high = n('mainHeight', 22);
    const middle = n('middleHeight', 18), low = n('rightHeight', 11);
    const rearY = n('rearY', 16), middleX = n('middleX', 24), rightX = n('rightX', 32), endX = n('endX', 40);
    const recessY = n('recessY', 2.5), radius = n('cornerRadius', 1.25);
    const corner=data.masterCorner||{center:[-1.9,0],radius:1.9,leftX:-3.8,frontY:-1.9};
    const frontY=corner.frontY,leftX=corner.leftX,wingY=n('lowerWingFrontY',.6);
    const balcony=data.southBalcony||{yMin:9,yMax:12.8,recessX:-.5};
    if (!(base < low && low < middle && middle < high && 0 < middleX && middleX < rightX && rightX < endX && recessY > 0 && rearY > recessY)) {
      throw new Error('Exterior visual-proxy heights/footprints must be ordered and positive.');
    }
    function tag(o, role, refs = source) {
      o.name = role;
      o.userData = { ...o.userData, status, source: refs.slice(), role };
      return o;
    }
    const cladding = new T.MeshStandardMaterial({ color: '#bfc2bd', roughness: .76, metalness: .025 });
    // Existing generated stone grain may be reused, never an evidence photograph.
    if (h.M && h.M.column && h.M.column.map) cladding.map = h.M.column.map;
    const blue = new T.MeshPhysicalMaterial({ color: '#327898', roughness: .19, metalness: .24, clearcoat: .8, clearcoatRoughness: .15 });
    const trim = new T.MeshStandardMaterial({ color: '#616f75', roughness: .37, metalness: .7 });
    const silver = new T.MeshStandardMaterial({ color: '#b0b6b6', roughness: .42, metalness: .62 });
    const beamData=data.signBeam||{};
    const fasciaMat = new T.MeshStandardMaterial({ color: beamData.color||'#17191b', roughness: beamData.roughness??.86, metalness: beamData.metalness??0 });
    const beamEdgeMat = new T.MeshStandardMaterial({ color:'#0b0d0e',roughness:.88,metalness:0 });
    const roofGlass = new T.MeshPhysicalMaterial({ color: '#bfd6d4', roughness: .17, metalness: .04, transparent: true, opacity: .30, depthWrite: false, side: T.DoubleSide });
    blue.envMapIntensity = .65;
    roofGlass.envMapIntensity = .35;

    // Rounded convex corners stay within the schematic plan boundary. The
    // concave entrance recess remains sharp, rather than filling the notch.
    function roundedShape(points, r) {
      const corners = points.map((p, i) => {
        const a = points[(i + points.length - 1) % points.length], b = points[(i + 1) % points.length];
        const la = Math.hypot(a[0] - p[0], a[1] - p[1]), lb = Math.hypot(b[0] - p[0], b[1] - p[1]);
        const turn = (p[0] - a[0]) * (b[1] - p[1]) - (p[1] - a[1]) * (b[0] - p[0]);
        const d = turn > 0 ? Math.min(r, la * .42, lb * .42) : 0;
        return { p, a: [p[0] + (a[0] - p[0]) * d / la, p[1] + (a[1] - p[1]) * d / la], b: [p[0] + (b[0] - p[0]) * d / lb, p[1] + (b[1] - p[1]) * d / lb] };
      });
      const shape = new T.Shape();
      shape.moveTo(...corners[0].a);
      for (const q of corners) { shape.lineTo(...q.a); shape.quadraticCurveTo(...q.p, ...q.b); }
      shape.closePath();
      return shape;
    }
    function footprint(width,isWindow=false) {
      // One explicit master quarter-circle is shared with the ground meeting room.
      // The ground pocket returns to glass Y0; the tall facade continues along Y-1.9.
      const shape=new T.Shape(),cx=corner.center[0],cy=corner.center[1],r=corner.radius;
      shape.moveTo(leftX,cy);shape.absarc(cx,cy,r,Math.PI,Math.PI*1.5,false);
      const leading=width>middleX?wingY:frontY;
      if(width>middleX){shape.lineTo(middleX,frontY);shape.lineTo(middleX,wingY);}
      shape.lineTo(width-radius,leading);shape.quadraticCurveTo(width,leading,width,leading+radius);
      shape.lineTo(width,rearY);shape.lineTo(leftX,rearY);
      if(isWindow){shape.lineTo(leftX,balcony.yMax);shape.lineTo(balcony.recessX,balcony.yMax);shape.lineTo(balcony.recessX,balcony.yMin);shape.lineTo(leftX,balcony.yMin);}
      shape.lineTo(leftX,cy);shape.closePath();return shape;
    }
    function prism(shape, y, height, mat, parent, name) {
      const o = h.mesh(new T.ExtrudeGeometry(shape, { depth: height, bevelEnabled: false, curveSegments: 8 }), mat, parent);
      o.rotation.x = -Math.PI / 2;
      o.position.y = y;
      return tag(o, name);
    }
    function rods(records, mat, parent, name, radial = 8) {
      if (!records.length) return null;
      const o = new T.InstancedMesh(new T.CylinderGeometry(1, 1, 1, radial), mat, records.length);
      const dummy = new T.Object3D(), axis = new T.Vector3(0, 1, 0);
      records.forEach(([a, b, r], i) => {
        const from = new T.Vector3(...a), to = new T.Vector3(...b), v = to.clone().sub(from), len = v.length();
        dummy.position.copy(from.add(to).multiplyScalar(.5));
        dummy.quaternion.setFromUnitVectors(axis, v.normalize());
        dummy.scale.set(r, len, r);
        dummy.updateMatrix();
        o.setMatrixAt(i, dummy.matrix);
      });
      o.instanceMatrix.needsUpdate = true;
      o.castShadow = true; o.receiveShadow = true;
      parent.add(o);
      return tag(o, name);
    }
    function box(x, y, z, w, height, depth, mat, parent, role) { return tag(h.box(x, y, z, w, height, depth, mat, parent), role); }

    // Five visual ribbon rows in the tall mass. These are NOT certified floors.
    // Optional height changes scale this visual rhythm, retaining the three steps.
    const f = (z) => base + (z - 7.2) * (high - base) / (22 - 7.2);
    const windows = [[8, 9.55], [10.9, 12.45], [13.8, 15.35], [16.7, 18.25], [19.6, 21.15]].map(q => q.map(f));
    const levels = [...new Set([base, low, middle, high, ...windows.flat()].filter(v => v >= base && v <= high))].sort((a, b) => a - b);
    const mullions = [];
    for (let i = 0; i < levels.length - 1; i++) {
      const bottom = levels[i], top = levels[i + 1], mid = (bottom + top) / 2;
      const width = mid < low ? endX : mid < middle ? rightX : middleX;
      const isWindow = windows.some(([a, b]) => mid > a && mid < b);
      const shape = footprint(width,isWindow);
      prism(shape, bottom, top - bottom, isWindow ? blue : cladding, upper, `PHOTO-ASSUMED-${isWindow ? 'BLUE-RIBBON' : 'LIGHT-SPANDREL'}-${i}`);
      if (isWindow) {
        // Open/recessed side balcony, not a blue stripe painted on a solid box.
        const railHeight=Math.min(1.05,top-bottom-.1),railX=leftX+.11;
        for(const hh of [bottom+.12,bottom+railHeight])box(railX,hh,-(balcony.yMin+balcony.yMax)/2,.05,.045,balcony.yMax-balcony.yMin,trim,upper,'SOUTH-RECESSED-BALCONY-RAIL');
        for(let by=balcony.yMin+.15;by<balcony.yMax;by+=.18)mullions.push([[railX,bottom+.12,-by],[railX,bottom+railHeight,-by],.015]);
        // Dark, fine vertical divisions follow the rounded perimeter; one batch.
        const path = shape.getPoints(18);
        let carry = 0;
        for (let j = 1; j < path.length; j++) {
          const a = path[j - 1], b = path[j], len = a.distanceTo(b);
          if (len < 1e-7) continue;
          for (let along = carry; along < len; along += 1.3) {
            const p = a.clone().lerp(b, along / len);
            mullions.push([[p.x, bottom + .014, -p.y], [p.x, top - .014, -p.y], .019]);
          }
          carry = ((carry - len) % 1.3 + 1.3) % 1.3;
        }
      }
    }
    rods(mullions, trim, upper, 'UPPER-RIBBON-MULLIONS-INSTANCED');
    upper.userData.assumptions = { base, heights: { main: high, middle, right: low }, XSteps: [leftX, middleX, rightX, endX], rearY, recessY, radius, masterCorner:corner,mainGlazingSetback:0-frontY,balcony,windowRowsAreNotFloorCount: true, upperInteriorNotModelled: true };
    upper.userData.integralMeetingTower=true;

    // Existing showroom frontage additions only. Ground glazing/columns remain
    // owned by the base interior scene; this module does not replace or move them.
    const soffitY = n('showroomSoffit', 7.02);
    prism(footprint(endX),soffitY-.1,.2,silver,facade,'CONTINUOUS-TOWER-SOFFIT-OVER-MEETING-AND-RECESSED-GLAZING');
    const signHeight = n('fasciaHeight', 3.82);
    // Owner's close-up: one opaque black concrete band through the first three
    // bays, not two floating signboards or dark transparent glazing.
    const bx0=beamData.xMin??0,bx1=beamData.xMax??middleX,bh=beamData.height??.64,bz=beamData.worldZ??.04,bd=beamData.depth??.24;
    const signBeam=box((bx0+bx1)/2,signHeight,bz,bx1-bx0,bh,bd,fasciaMat,facade,'EXISTING-CHARCOAL-SIGN-FASCIA');
    signBeam.userData={...signBeam.userData,form:'continuous opaque concrete beam, not isolated signboards',source:['OWNER-CLOSEUP-20260914'],dimensionsVerified:false};
    box((bx0+bx1)/2,signHeight-bh/2-.018,bz+bd/2+.005,bx1-bx0,.065,.06,beamEdgeMat,facade,'EXISTING-BLACK-BEAM-LOWER-EDGE');
    box((middleX + endX) / 2, 3.39, -recessY + .056, endX - middleX, .40, .13, silver, facade, 'EXISTING-LOW-WING-HEADER-PHOTO-ASSUMED');
    // June 2024 near-frontal Street View, checked 13 Sep 2026, and current photos:
    // MB occupies the FIRST glazed bay; dealer lettering the THIRD, before canopy.
    // Transparent raised-letter silhouettes replace the former boxed Arial labels.
    function facadeLetters(q){
      const canvas=document.createElement('canvas');canvas.width=2048;canvas.height=256;
      const ctx=canvas.getContext('2d');ctx.clearRect(0,0,2048,256);
      ctx.fillStyle='#f4f4ef';ctx.font=`400 196px ${q.serif?'"Times New Roman", Georgia, serif':'Arial, sans-serif'}`;
      ctx.textBaseline='alphabetic';ctx.textAlign='left';
      const m=ctx.measureText(q.text),height=(m.actualBoundingBoxAscent||145)+(m.actualBoundingBoxDescent||40);
      ctx.save();ctx.translate(20,16);ctx.scale(2008/m.width,224/height);ctx.fillText(q.text,0,m.actualBoundingBoxAscent||145);ctx.restore();
      const tx=new T.CanvasTexture(canvas);tx.colorSpace=T.SRGBColorSpace;
      const mat=new T.MeshStandardMaterial({map:tx,transparent:true,alphaTest:.08,roughness:.38,metalness:.18,emissive:'#e4e4dc',emissiveIntensity:.10,side:T.DoubleSide});
      const o=h.mesh(new T.PlaneGeometry(q.width,q.height),mat,facade);o.position.set(q.x,signHeight+.03,beamData.letterWorldZ??.22);
      tag(o,q.id,['SV-FRONT-JUN2024-checked-20260913','current-night-photos']);
      o.userData.lettering='photo-matched typographic silhouette; not supplier artwork';return o;
    }
    if(data.branding!==false){
      facadeLetters({id:'EXISTING-MERCEDES-BENZ-TEXT-APPROXIMATION',text:'Mercedes-Benz',x:4.05,width:7.55,height:.93,serif:true});
      facadeLetters({id:'EXISTING-DEALER-TEXT-APPROXIMATION',text:'Chitchai Chonburi',x:20,width:7.35,height:.72,serif:false});
    }
    facade.userData.assumptions = { soffitY, signHeight, signBeam:{...beamData,continuous:true,opaque:true,metricDimensionsVerified:false},exactSignPositionsUnverified: true, placement:'first / third glazed bays confirmed against near-frontal Street View; black concrete backdrop from owner close-up14Sep2026; metric fit not survey', typography: 'serif MB / sans-serif dealer, raised silhouette on black beam, supplier artwork pending', existingGroundGlazingUntouched: true };
    // Shallow exposed double-layer truss canopy. This is a visual proxy only:
    // do not infer cantilever capacity, connections, member sizes or drainage.
    const canopyData = data.canopy || {};
    const cn = (k, fallback) => Number.isFinite(canopyData[k]) ? canopyData[k] : fallback;
    const cx = cn('cx', 28.2), w = cn('width', 8.4), wall = cn('wallY', recessY), front = cn('frontY', -2);
    const chordBottom = cn('lowerChordHeight', 3.6), depth = cn('trussDepth', .4), chordTop = chordBottom + depth;
    if (!(w > 0 && wall > front && depth > 0)) throw new Error('Canopy proxy width, depth and projection must be positive.');
    const nx = 6, ny = 3, x0 = cx - w / 2, rows = [], members = [];
    const add = (a, b, r = .032) => members.push([a, b, r]);
    for (let j = 0; j <= ny; j++) {
      const y = front + (wall - front) * j / ny;
      rows.push(y);
      add([x0, chordTop, -y], [x0 + w, chordTop, -y], .037);
      add([x0, chordBottom, -y], [x0 + w, chordBottom, -y], .033);
    }
    for (let i = 0; i <= nx; i++) {
      const x = x0 + w * i / nx;
      add([x, chordTop, -front], [x, chordTop, -wall], .037);
      add([x, chordBottom, -front], [x, chordBottom, -wall], .033);
      for (let j = 0; j < ny; j++) {
        const ya = rows[j], yb = rows[j + 1];
        add([x, chordBottom, -ya], [x, chordTop, -yb], .026);
        add([x, chordTop, -ya], [x, chordBottom, -yb], .026);
      }
    }
    for (let j = 0; j <= ny; j++) for (let i = 0; i < nx; i++) {
      const xa = x0 + w * i / nx, xb = x0 + w * (i + 1) / nx;
      add([xa, chordBottom, -rows[j]], [xb, chordTop, -rows[j]], .026);
      add([xa, chordTop, -rows[j]], [xb, chordBottom, -rows[j]], .026);
    }
    rods(members, silver, canopy, 'CANOPY-TUBULAR-SPACEFRAME-INSTANCED', 10);
    // Separate simple roof cells make the transparent roof legible without
    // copying photographs or inventing detailed fixings.
    for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) {
      const pane = box(x0 + (i + .5) * w / nx, chordTop + .032, -(rows[j] + rows[j + 1]) / 2, w / nx - .035, .025, (wall - front) / ny - .035, roofGlass, canopy, `CANOPY-GLAZED-ROOF-PROXY-${i}-${j}`);
      pane.castShadow = false;
    }
    box(cx, chordTop - depth / 2, -wall + .015, w, .13, .15, trim, canopy, 'CANOPY-WALL-INTERFACE-PROXY-NOT-STRUCTURAL-CONNECTION');
    canopy.userData.source = ['P11', 'P12 (undated)', 'X01 (June 2024)'];
    canopy.userData.assumptions = { cx, width: w, wallY: wall, frontY: front, lowerChordHeight: chordBottom, upperChordHeight: chordTop, trussDepth: depth, supportsNotFullyObserved: true, drainageNotModelled: true, engineeringNotVerified: true };
    let meshObjects = 0, instanceCount = 0;
    for (const g of Object.values(groups)) g.traverse(o => { if (o.isMesh) meshObjects++; if (o.isInstancedMesh) instanceCount += o.count; });
    for (const g of Object.values(groups)) g.userData.assetBudget = { meshObjects, instanceCount, meshObjectLimit: 250 };
    if (meshObjects > 250) throw new Error('Exterior massing asset exceeds mesh-object budget.');
    return groups;
  };
})();
