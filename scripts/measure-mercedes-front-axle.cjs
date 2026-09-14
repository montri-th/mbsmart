/* CPU-only measurement of the authored vehicle factory, not vehicle specifications.
 * Geometry helpers mirror scene.js; text pixels/materials do not affect its bounds.
 * No WebGL, browser, source-data mutation, network or file writes.
 */
'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto'),assert=require('node:assert/strict');
module.exports=function createFrontAxleMeasurement(root){
 const T=require(path.join(root,'vendor/three.min.js'));
 const factorySource=fs.readFileSync(path.join(root,'mercedes-vehicles.js'),'utf8');
 const sourceSHA256=crypto.createHash('sha256').update(factorySource).digest('hex'),ctx={window:{}};
 vm.runInNewContext(factorySource,ctx,{filename:'mercedes-vehicles.js'});
 function mesh(geo,mat,parent){const o=new T.Mesh(geo,mat);parent.add(o);return o;}
 function box(x,y,z,w,h,d,mat,parent){const o=mesh(new T.BoxGeometry(w,h,d),mat,parent);o.position.set(x,y,z);return o;}
 function tube(a,b,r,mat,parent){const av=new T.Vector3(...a),bv=new T.Vector3(...b),dir=bv.clone().sub(av),o=mesh(new T.CylinderGeometry(r,r,dir.length(),12),mat,parent);o.position.copy(av.add(bv).multiplyScalar(.5));o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),dir.normalize());return o;}
 function sign(text,x,y,z,w,h,rotation=0,parent){const o=mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial(),parent);o.position.set(x,y,z);o.rotation.y=rotation;return o;}
 const factory=ctx.window.BC_MERCEDES(T,{mesh,box,tube,sign}),cache=new Map();
 return function measure(car){
  assert(/^MB[1-5]$/.test(car.id),'Only five showroom display vehicles use this new placement rule');
  assert(Number.isFinite(car.l)&&car.l>0&&Number.isFinite(car.w)&&car.w>0,'Finite planning envelope required');
  const localCar={...car,cx:0,cy:0,angle:0},key=JSON.stringify(localCar);if(cache.has(key))return {...cache.get(key)};
  const parent=new T.Group(),g=factory.car(localCar,parent);g.updateMatrixWorld(true);
  const wheels=[];g.traverse(o=>{if(o.name==='Wheel'&&o.userData.part==='wheel')wheels.push(o);});
  assert.equal(wheels.length,4,'Actual fitted factory must have four identifiable wheels');
  const front=wheels.filter(o=>o.getWorldPosition(new T.Vector3()).x>0);assert.equal(front.length,2,'Exactly two front wheels required');
  const centres=front.map(o=>o.getWorldPosition(new T.Vector3()));assert(Math.abs(centres[0].x-centres[1].x)<1e-9,'Front axle must be transverse');
  const right=front.find(o=>o.getWorldPosition(new T.Vector3()).z>0);assert(right,'Local +Z must identify the right wheel');
  const fitted=new T.Box3().setFromObject(g),tyre=new T.Box3().setFromObject(right),frontAxleOffset=centres[0].x;
  assert(Math.abs(fitted.max.x-fitted.min.x-car.l)<1e-6&&Math.abs(fitted.max.z-fitted.min.z-car.w)<1e-6,'Fit must match planning envelope');
  assert(frontAxleOffset>0&&frontAxleOffset<car.l/2,'Front wheel centre must be within planning length');
  const result={frontAxleOffset,rightFrontTyreOuterOffset:tyre.max.z,source:'mercedes-vehicles.js / actual fitted Wheel centre',sourceSHA256,method:'CPU actual factory; complete mesh fitted to planning envelope; local +X front / +Z driver right',dimensionStatus:'Authored photo-fit schematic only, not measured vehicle or manufacturer CAD'};
  cache.set(key,Object.freeze(result));
  // All geometries are local to this measurement; the reusable factory materials remain alive.
  const geometries=new Set();g.traverse(o=>{if(o.geometry)geometries.add(o.geometry);});for(const geometry of geometries)geometry.dispose();parent.remove(g);
  return {...result};
 };
};
