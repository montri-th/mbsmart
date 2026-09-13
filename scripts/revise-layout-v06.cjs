// Reproducible owner-directed revision of the frozen, publishable v04 coordinates.
const fs=require('fs'),path=require('path'),vm=require('vm');
const root=path.resolve(__dirname,'..'),ctx={window:{}};
vm.runInNewContext(fs.readFileSync(path.join(root,'versions/v04/layout.js'),'utf8'),ctx);
const clone=x=>JSON.parse(JSON.stringify(x)), original=ctx.window.BC_LAYOUT.states[0];
const modes=['handover','consulting','lounge'];
const q=(id,type,cx,cy,w,h,more={})=>({id,type,cx,cy,w,h,zone:'flex',...more});
const states=modes.map(mode=>{
  const s=clone(original);s.mode=mode;
  s.module.car.angle=330;s.module.status='Full 3B retained; S1 rotated 180 degrees by owner brief. Supplier CAD pending.';
  s.cars.find(c=>c.id==='S1').angle=330;
  Object.assign(s.cars.find(c=>c.id==='MB5'),{cx:26.2,cy:5.25,angle:-90,noseDirection:'toward entrance / negative Y',clearanceStatus:'HOLD: 0.15 m front/rear bay margins; full circulation/swept path unverified'});
  delete s.cars.find(c=>c.id==='MB5').handover;
  if(mode==='handover')s.cars.push({id:'MB6',brand:'MB',cx:36,cy:5.25,l:5.2,w:2.1,angle:180,noseDirection:'toward smart / negative X',purpose:'vehicle handover'});
  for(const f of s.furniture){
    if(f.id==='SC-S'){f.cy=3.35;f.facing=0;delete f.corners;}
    if(['SC-C1','SC-C2'].includes(f.id)){f.cy=1.55;f.facing=180;delete f.corners;}
    if(f.id==='MB5-EP')Object.assign(f,{cx:24.65,cy:6.65,note:'Retained price stand beside MB5, outside service reserve'});
    if(f.zone==='counter-customer')f.facing=180;
    if(f.type==='chair'&&f.zone!=='smart-module'){f.w=f.h=.7;f.catalogue='D02 PDF pp143-144 shell chair proxy';}
  }
  s.furniture=s.furniture.filter(f=>f.zone!=='flex');
  if(mode==='consulting')s.furniture.push(
    q('FC-T','consult-table',37.35,5.1,1.805,.96,{catalogue:'TA03 / D02 PDF p155',zone:'flex-consult'}),
    q('FC-SB','sideboard',38.3625,5.1,.52,3,{catalogue:'SM01 / D02 PDF p153; schematic connecting bracket',zone:'flex-consult'}),
    q('FC-STAFF','chair',37.25,6.12,.7,.7,{zone:'flex-consult',facing:0,role:'consultant',seats:1}),
    q('FC-C1','chair',36.72,4.08,.7,.7,{zone:'flex-consult',facing:180,seats:1}),
    q('FC-C2','chair',37.57,4.08,.7,.7,{zone:'flex-consult',facing:180,seats:1}),
    q('FC-LOW','table',34.5,5.1,.65,.65,{round:true,low:true}),
    q('FC-W1','armchair',34.5,6.15,.85,.85,{seats:1,facing:0}),
    q('FC-W2','armchair',34.5,4.05,.85,.85,{seats:1,facing:180})
  );
  if(mode==='lounge')s.furniture.push(
    q('FA-S1','sofa',36.5,3.3,2.4,.85,{seats:3,facing:180}),
    q('FA-S2','sofa',36.5,6.7,2.4,.85,{seats:3,facing:0}),
    q('FA-A1','armchair',34.55,5,.85,.85,{seats:1,facing:90}),
    q('FA-A2','armchair',38.45,5,.85,.85,{seats:1,facing:-90}),
    q('FA-T1','table',36.3,5,.65,.65,{round:true,low:true,tableHeight:.65,catalogue:'TA02 large / D02 p159'}),
    q('FA-T2','table',37.05,5.2,.45,.45,{round:true,low:true,tableHeight:.6,catalogue:'TA02 small / D02 p159'})
  );
  s.routes=[{id:'entrance-east-service',x:28.0,y:2.5,w:3.5,h:5.5,planningWidth:3.5,status:'Schematic clear eastern approach only; full cross-showroom route unresolved'},...original.routes.filter(r=>r.id==='service-approach-pedestrian')];
  s.optionalPackage={active:true,scope:'Three-use flex room with independently switchable AC; main hall stays unconditioned',airAreasGrossAssumed:{old:64,extension:44,total:108},HVAC:{installed:true,defaultOn:mode!=='handover',state:'Dedicated supplemental unit, fresh-air and cooling load engineering required; engines off in enclosure'},G1:{line:[[32,2.5],[32,8]],pedestrianDoor:[2.7,3.9],vehicleGate:[4,7.2],state:'Gate closed with AC on; folded within flex footprint when AC off'},F1:{line:[[32.4,8],[34.8,8]],openingWidth:2.4,state:mode==='lounge'?'Open link to existing lounge':'Closed partition with connecting door'},storage:{status:'MB6 removed from building model for consulting/lounge; furniture stored off-model, no storage on service route',approvalRequired:true}};
  s.optionalPackage.F1.state=mode==='lounge'?'Open link only with Flex AC on; closed before vehicle gate opens with AC off':'Closed partition with connecting door';
  s.optionalPackage.HVAC.enclosure='Sealed dedicated ceiling at assumed 3.15 m; existing lounge self-closing door assumed';
  s.people=[
    {id:'smart-advisor',seat:'SC-S',height:1.76,shirt:'#313b43',pants:'#252c31',skin:'#bb8969'},
    {id:'smart-client-1',seat:'SC-C1',height:1.66,shirt:'#a97653',pants:'#394654',skin:'#c79a76'},
    {id:'smart-client-2',seat:'SC-C2',height:1.71,shirt:'#dbd6ca',pants:'#394550',skin:'#a7785c'},
    {id:'reception-advisor',seat:'P-ST0',height:1.74,shirt:'#e4e2d9',pants:'#272c35',skin:'#c09070'},
    {id:'reception-client',seat:'P-CU0',height:1.69,shirt:'#667d84',pants:'#44423e',skin:'#b88363'},
    {id:'existing-lounge-reader',seat:'AA3',height:1.73,shirt:'#a9aa9d',pants:'#383f46',skin:'#bf947b'},
    {id:'gallery-customer',x:17.4,y:4.15,height:1.72,facing:70,pose:'walk',shirt:'#b9b2a4',pants:'#4a5869',skin:'#c89875'},
    {id:'arrival',x:29.2,y:5.6,height:1.78,facing:20,pose:'stand',shirt:'#ebe6dd',pants:'#303e4b',skin:'#ad7859'}
  ];
  if(mode==='handover')s.people.push(
    {id:'handover-specialist',x:33.7,y:6.95,height:1.76,facing:115,pose:'gesture',shirt:'#35414c',pants:'#242d34',skin:'#bd8a67'},
    {id:'handover-client',x:35.1,y:6.95,height:1.68,facing:-40,pose:'stand',shirt:'#c5b195',pants:'#405464',skin:'#cba17e'}
  );
  const occupied=mode==='consulting'?['FC-STAFF','FC-C1','FC-C2','FC-W1']:mode==='lounge'?['FA-S1','FA-S2','FA-A1']:[];
  occupied.forEach((seat,i)=>s.people.push({id:'flex-user-'+i,seat,height:1.65+i*.035,shirt:['#394855','#d0bda6','#7d9593','#e0dfd7'][i],pants:'#3e4850',skin:'#bf8d6b'}));
  return s;
});
const data={revision:'v06',defaultState:'handover',states,manualElements:['D01 p20 full Module3B','D02 pp143-144 shell chairs','D02 pp153/155 consulting table and sideboard','D02 p159 paired coffee tables','D02 pp257-259 zonal lighting','D03 pp35/45 rug and paired planters'],limitations:['MB5 circulation HOLD','All vertical dimensions assumed','Catalogue-inspired proxies, not approved manufacturer meshes','MB6 off-model in consulting/waiting modes; storage and changeover plan TBC']};
fs.writeFileSync(path.join(root,'layout.js'),'/* Derived owner-review geometry v06; no private source documents. */\nwindow.BC_LAYOUT='+JSON.stringify(data)+';\n');
console.log('v06: 3 uses, MB5 at entrance, MB6 only in handover, S1 reversed, smart chairs swapped.');
