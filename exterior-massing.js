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
    const fasciaMat = new T.MeshStandardMaterial({ color: '#303b42', roughness: .43, metalness: .25 });
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
    function footprint(width) {
      return width > middleX ? [[0, 0], [middleX, 0], [middleX, recessY], [width, recessY], [width, rearY], [0, rearY]] : [[0, 0], [width, 0], [width, rearY], [0, rearY]];
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
      const shape = roundedShape(footprint(width), radius);
      prism(shape, bottom, top - bottom, isWindow ? blue : cladding, upper, `PHOTO-ASSUMED-${isWindow ? 'BLUE-RIBBON' : 'LIGHT-SPANDREL'}-${i}`);
      if (isWindow) {
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
    upper.userData.assumptions = { base, heights: { main: high, middle, right: low }, XSteps: [0, middleX, rightX, endX], rearY, recessY, radius, windowRowsAreNotFloorCount: true, upperInteriorNotModelled: true };

    // Existing showroom frontage additions only. Ground glazing/columns remain
    // owned by the base interior scene; this module does not replace or move them.
    const soffitY = n('showroomSoffit', 7.02);
    box(middleX / 2, soffitY, -.25, middleX, .20, 1.45, silver, facade, 'EXISTING-FRONT-SOFFIT-PHOTO-ASSUMED');
    box((middleX + endX) / 2, soffitY, -recessY + .12, endX - middleX, .20, .9, silver, facade, 'EXISTING-RECESSED-SOFFIT-PHOTO-ASSUMED');
    const signHeight = n('fasciaHeight', 3.82);
    box(middleX / 2, signHeight, .056, middleX, .64, .13, fasciaMat, facade, 'EXISTING-CHARCOAL-SIGN-FASCIA');
    box((middleX + endX) / 2, 3.39, -recessY + .056, endX - middleX, .40, .13, silver, facade, 'EXISTING-LOW-WING-HEADER-PHOTO-ASSUMED');
    // Text-only labels preserve the photographed wording. The supplied helper
    // uses generic type: these are NOT authenticated Mercedes-Benz logo vectors.
    if (data.branding !== false && h.sign) {
      tag(h.sign('Mercedes-Benz', 8.5, signHeight + .03, .128, 11.0, .84, 0, facade, '#edf0ed', '#303b42'), 'EXISTING-MERCEDES-BENZ-TEXT-APPROXIMATION', ['P10', 'P12 (undated)']);
      tag(h.sign('Chitchai Chonburi', 19.65, signHeight + .03, .129, 7.4, .76, 0, facade, '#edf0ed', '#303b42'), 'EXISTING-DEALER-TEXT-APPROXIMATION', ['P10', 'P12 (undated)']);
    }
    facade.userData.assumptions = { soffitY, signHeight, exactSignPositionsUnverified: true, typography: 'generic text approximation, not official wordmark', existingGroundGlazingUntouched: true };
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
