// Deterministic revision from immutable v06. Authored coordinates, not a surveyed BIM.
const fs=require('fs'),path=require('path'),vm=require('vm');
const root=path.resolve(__dirname,'..'),ctx={window:{}};
vm.runInNewContext(fs.readFileSync(path.join(root,'versions/v06/layout.js'),'utf8'),ctx);
const d=JSON.parse(JSON.stringify(ctx.window.BC_LAYOUT));
d.revision='v07';
d.smartVehicle={model:'smart #5',trim:'Premium',exterior:'Saturn Beige Matte',interior:'Shadow Black',roof:'Eclipse Black',market:'UK / RHD reference',configuration:'HY1UOGUF52B9000180',length:4.695,bodyWidth:1.920,mirrorWidth:2.169,height:1.705,wheelbase:2.900,frontOverhang:.855,rearOverhang:.940,meshStatus:'Independently authored dimensional representation, not manufacturer CAD',source:'https://uk.smart.com/en/models/hashtag-five/',secondarySource:'https://ma.smart.com/modeles/smart-5/premium-2'};
d.building={source:['A01: LINE_ALBUM_Showroom_260912_10.jpg','A04: LINE_ALBUM_Showroom_260912_13.jpg'],units:'metres',coordinates:'X increases along facade; Y increases from front H toward rear E; world=(X,height,-Y)',grids:{X:[0,8,16,24,32,40],XStatus:'assumed equal bays, not confirmed by legible dimension string',Y:{H:0,G:2.5,F:8,E:16},YStatus:'owner confirmed'},levels:{showroom:0,datumNote:'+0.80 is a level mark, not a horizontal dimension; road datum not confirmed'},heights:{office:3.18,mezzanineSoffit:3.28,mezzanineTop:3.56,hall:7.1,status:'assumed; not traced from plan'},admin:{polygon:[[8,11.5],[16,11.5],[16,16],[10.3,16],[10.3,14.2],[8,14.2]],status:'photo traced / verify as-built',frontDoor:[8.25,9.25]},manager:{polygon:[[16,11.5],[26,11.5],[28,13.5],[28,16],[16,16]],corner:{center:[26,13.5],radius:2,start:-90,end:0},status:'photo traced, rounded SE corner approximate'},stair:{type:'C-return, three legs',lower:{x:[3.6,6.25],y:[12.25,13.55],riseDirection:'negative X'},west:{x:[2.3,3.6],y:[13.55,14.8],riseDirection:'positive Y'},upper:{x:[3.6,6.25],y:[14.8,16.1],riseDirection:'positive X'},well:{x:[3.6,6.25],y:[13.55,14.8]},status:'photo-traced footprint and topology; rise, tread count, clear width and landing heights assumed'},rearSteps:{x:[6.1,7.75],y:[16.3,18.8],status:'separate rear/service steps seen above E; not main staircase'},salesFrame:{frontY:8,rearY:11.5,status:'Grid F to traced office frontage; furniture adjusted from v06 unmeasured proxies'}};
// Match the separately audited trace exactly; do not imply that the staircase rise was measured.
d.building.admin.polygon=[[8,11.5],[16,11.5],[16,16],[8,16]];
delete d.building.admin.frontDoor;d.building.admin.hallDoor=[[8,11.7],[8,12.8]];
d.building.admin.core=[[8,13.9],[10.3,13.9],[10.3,16],[8,16]];
d.building.manager.polygon=[[16,11.5],...Array.from({length:19},(_,i)=>{const a=(-90+i*5)*Math.PI/180;return [26+2*Math.cos(a),13.5+2*Math.sin(a)];}),[28,16],[16,16]];
d.building.manager.boundaryAuthority='Circular corner parameters are authoritative; polygon samples the R2 arc every 5 degrees. All dimensions remain photo-traced assumptions.';
d.building.stair.lower={x:[4.3,6.3],y:[12.4,13.9],riseDirection:'negative X / inferred'};
d.building.stair.west={x:[2.6,4.3],y:[13.9,14.6],riseDirection:'positive Y / inferred'};
d.building.stair.upper={x:[4.3,6.3],y:[14.6,16],riseDirection:'positive X / inferred'};
d.building.stair.landings=[{x:[2.6,4.3],y:[12.4,13.9]},{x:[2.6,4.3],y:[14.6,16]}];
d.building.stair.well={x:[4.3,6.3],y:[13.9,14.6]};d.building.stair.renderOnly={risers:[8,4,8],rise:.178,totalRise:3.56,status:'assumed visualization only; short middle treads and headroom need stair section'};
d.building.rearSteps={x:[6.3,8],landingY:[16,17],y:[17,18.7],status:'separate rear/service level transition, direction/levels assumed'};
for(const s of d.states){
 s.furniture=s.furniture.filter(q=>q.id!=='CH');
 s.furniture.push({id:'SHARED-EV',type:'charger',cx:32.85,cy:7.45,w:.40,h:.45,angle:0,zone:'shared-existing',retained:true,source:'Owner-adopted review + site photos 8/9',status:'Existing MB wallbox reused; photo-based proxy adjusted clear of folded glass, not a measured location or physical relocation; capacity/cable/shared-use approval and commissioning pending'});
 s.furniture.push({id:'SMART-WINDOW-LOGO',type:'window-logo',cx:35.97,cy:2.73,w:.98,h:.65,angle:0,zone:'smart-window',installation:'Type 4 — installed on indoor display window',logoSize:'SL2 candidate, 0.98 W x 1.32 H m; not SL4',centerHeight:2.05,status:'Owner-selected plan pin; h is conservative plan-depth reservation including glass standoffs; height/size/attachments/MB alignment require supplier approval'});
 const c=s.cars.find(c=>c.id==='S1');Object.assign(c,{l:4.695,w:2.169,bodyWidth:1.92,height:1.705,model:'smart #5 Premium',exterior:'Saturn Beige Matte',interior:'Shadow Black',dimensionStatus:'published vehicle dimensions; includes mirrors'});s.module.car={...c};
 s.module.shapeStatus='Dimension-derived platform with small schematic corner radii; 2550 + 4080 = 6630 confirmed visually in D01 p20. Supplier fabrication CAD pending.';
 s.module.status='One complete 3B, source envelope 8.65 x 6.63 m, rotated 90 degrees; one-car exception requires site-specific written confirmation.';
 for(const q of s.furniture){
  if(q.id==='P')Object.assign(q,{cy:9.65,dimensionStatus:'Existing counter retained; previous unmeasured proxy aligned to A01 sales position. Survey actual location.'});
  if(q.zone==='counter-staff')q.cy=10.55;
  if(q.zone==='counter-customer')q.cy=8.75;
  if(q.zone==='MB-consult')q.cy-=.9;
  if(q.id==='VM'){q.cx=24.45;q.cy=10.95;}
  if(q.id==='LP'){q.type='linear-floor-light';q.note='D01 p20 floor lamp is an inset linear floor light, not a freestanding lampshade.';}
  delete q.corners; // Derive current bounds from centre/rotation; never retain stale corners.
 }
 s.serviceAccessReserve={x:28,y:8,w:4,h:8,status:'Approximate clear reserve east of traced manager boundary; column projection, doors and swept path remain unverified'};
 s.routes=s.routes.filter(r=>r.id!=='service-approach-pedestrian');s.routes.push({id:'service-approach-pedestrian',x:28,y:8,w:4,h:8,status:'nominal reservation, not code-approved clearance'});
 s.people.find(p=>p.id==='smart-advisor').shirt='#171a1b';
}
d.manualElements=['D01 all 33 pages reread','D01 pp15/20/21 full 3B, silver backdrop, 75-inch display, pale wood desk, grey chairs, carpet, LED platform edging and digital E-price with iPad','D01 p8 Type4 indoor-window logo at owner pin35.97,2.73; p9 SL2 size candidate only','D01 p22 charger requirement; owner adopts reuse of existing MB wallbox, shared-use approval and commissioning pending','D01 p32 black smart uniform sample, TBC','Mercedes material and vehicle detail unchanged from v06; sales proxies aligned only'];
d.limitations=['One smart car is owner-reported exception; written site approval needed','Accessory display wall requirement unresolved for standalone 3B; no second 3A inserted','Outer smart dimensions sourced; authored sculpted geometry is approximate','Plan-traced staircase and office boundaries require site validation; all heights assumed','MB5 circulation HOLD; entrance swept path unresolved','Main hall unconditioned; flex/old lounge enclosure and HVAC require engineer review','Official raster assets not redistributed without permission'];
fs.writeFileSync(path.join(root,'layout.js'),'/* Authored v07 / source-labelled dimensions. */\nwindow.BC_LAYOUT='+JSON.stringify(d)+';\n');
console.log('v07 layout: sourced #5 dimensions, traced admin/sales and C-return stair.');
