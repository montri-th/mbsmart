/* One canonical owner-review projection, applied after the frozen v08 → v09 base.
 * Wire revision v09 / experience v11 are retained for historical comment pins.
 * r7 identifies this geometry; coordinates are not construction set-out values. */
module.exports=function applyOwnerReview(d,review){
  const s=d.site,e=review.exterior,w=JSON.parse(JSON.stringify(review.workshop)),b=e.boundary;
  const sideRefits=new Map(e.parking.workshopSideRefits.map(q=>[q.id,q]));
  w.reservations.parking=w.reservations.parking.map(q=>({...q,code:e.parking.bayCodes[q.id],...(sideRefits.has(q.id)?{bounds:sideRefits.get(q.id).bounds.slice(),status:'Owner dimensioned 2.5×5m exterior photo-fit; owner code confirmed, manoeuvring unverified'}:{})}));
  d.iteration='r7';d.designRevision='v13';d.customerExperience=review.customerExperience;
  d.reviewAdoptions={...d.reviewAdoptions,designRevision:'v13',ownerReviewDate:review.date,status:review.status,latestAnnotationReview:review.latestAnnotationReview,followupR7:review.followupR7};
  s.ownerReview=review.status;s.leftContextEdge=b.leftContextEdge;
  s.front.apronEdgeY={value:b.frontY,status:'Owner-confirmed7.20m from retained planter outer edgeY−1.12 to physical inside fence face; not a cadastral survey'};
  s.front.confirmedPlanterOuterY=b.frontDatum.planterOuterY;
  s.front.setbackFromPlinth={value:b.frontDatum.planterToInsideFence,status:b.frontDatum.status,from:'main planter outer edge',to:'physical inside fence face'};
  s.fence={reference:b.reference,retainingThickness:b.retainingThickness,frontInsideY:b.frontY,sideInsideX:b.sideX,status:'All fence-member thickness projects outward from the canonical inside-face datum'};
  s.front.gate={xMin:b.gateThroat.xMin,xMax:b.gateThroat.xMax,width:b.gateThroat.width,status:b.gateThroat.status,legacyPrintedWidth:8};
  s.gateTransitions.frontInnerY=-6.9;s.east.apronEdgeX=b.sideX;
  s.corner={...s.corner,frontY:b.frontY,sideX:b.sideX,filletCentre:b.corner.centre,filletRadius:b.corner.radius,renderTrialRadiusRange:[b.corner.radius,b.corner.radius],frontTangent:b.corner.frontTangent,sideTangent:b.corner.sideTangent,status:b.corner.status};
  s.edgeControlPoints=[[b.leftContextEdge[0][0],b.frontY],b.corner.frontTangent,b.corner.sideTangent,[b.sideX,b.sideFenceContinueToY]];s.corner.points=s.edgeControlPoints;
  s.edgeStatus=s.corner.status;s.bounds={...s.bounds,xMax:66,yMin:-27};
  s.road={...s.road,...e.road,topology:'T-junction',displayStripWidth:9};
  s.rearGroundXMax=b.sideX;
  s.annexes.workshop.awning.xMax=b.sideX;
  s.planting={...s.planting,frontBeds:e.planting.frontBeds.map(q=>q.slice()),palmCentres:e.planting.palmCentres.map(q=>q.slice()),insideFenceBeds:[],sidewalkTrees:[],frontagePolicy:e.planting};
  const p=s.markers.pylonData;Object.assign(p,{xy:e.pylon.xy,rotationRadians:e.pylon.rotationRadians,width:e.pylon.width,depth:e.pylon.depth,outwardBroadFacePlaneX:40,positionStatus:'Owner: align broad face with building side plane facing Samet–Ang Sila. Y photo-fit to revised fence.'});s.markers.pylon=p.xy;
  s.markers.flagData.forEach((f,i)=>{const q=f.type==='mercedes-banner'?e.markers.mercedesFlags[s.markers.flagData.filter(x=>x.type==='mercedes-banner').indexOf(f)]:e.markers.thaiFlags[s.markers.flagData.filter(x=>x.type!=='mercedes-banner').indexOf(f)];if(q){f.xy=q.xy;if(f.type==='mercedes-banner'){f.clothWidth=q.clothWidth;f.clothHeight=q.clothHeight;f.clothStatus=e.markers.flagSpacingBasis;}}});
  s.markers.flags=s.markers.flagData.filter(q=>q.type==='mercedes-banner').map(q=>q.xy);
  s.markers.directionSign=e.markers.directionalBoardXY;s.markers.directionData.xy=e.markers.directionalBoardXY;
  Object.assign(s.markers.shrine,{xy:e.shrine.xy,rotationRadians:e.shrine.rotationRadians,positionStatus:e.shrine.rationale});
  s.utilityPoles=e.utilities.poles.map(q=>q.slice());
  s.upperBuilding.signBeam.letterBottomHeight=3.66;s.upperBuilding.windowRecess=.34;
  s.existingInventory.forEach(q=>{if(q.id==='FACADE-MB')q.centreHeight=3.66+.93/2;if(q.id==='FACADE-DEALER')q.centreHeight=3.66+.72/2;});
  Object.assign(d.exterior.pylon,{x:e.smart.pylon.xy[0],y:e.smart.pylon.xy[1],rotationRadians:0,enabled:e.smart.pylon.enabled!==false,render:e.smart.pylon.render!==false,status:e.smart.pylon.status||e.smart.rationale});
  Object.assign(d.exterior.flag,{x:e.smart.flag.xy[0],y:e.smart.flag.xy[1],enabled:e.smart.flag.enabled!==false,render:e.smart.flag.render!==false,status:e.smart.flag.status||e.smart.rationale});
  d.exterior.additionalFlags=e.smart.additionalFlags.map(q=>({id:q.id,x:q.xy[0],y:q.xy[1],width:q.clothWidth,height:q.clothHeight,poleHeight:q.poleHeight,status:e.smart.additionalFlagStatus}));
  const care=e.smart.careLogo;Object.assign(d.exterior.careLogo,{...care,x:care.xy[0],y:care.xy[1],centerHeight:s.levels.forecourt+care.heightAboveApron});
  const facade=e.handoverWindowLogo;Object.assign(d.exterior.facadeLogo,{center:facade.centre.slice(),width:facade.sizeEnvelope[0],height:facade.sizeEnvelope[1],installationType:facade.installationType,illuminated:facade.illuminated,outwardFacing:true,status:facade.status});
  s.workshopStudy.ownerLayout=w;s.workshopStudy.status='Owner-reported existing equipment with separately identified proposed smart WiW interventions; not supplier/survey verified';
  s.workshopStudy.smartBays=w.smartOverlays.map(q=>({id:q.id,type:q.type,label:q.label||'ช่องงานแรงดันสูง · รออนุมัติ',xMin:q.bounds[0],yMin:q.bounds[1],xMax:q.bounds[2],yMax:q.bounds[3]}));
  s.workshopStudy.bayDimensionsStatus='One 4×6.5m HV use overlay on the owner-reported existing lift; separate 4×6.5m empty marked smart service workbay. No additional M/E lift or duplicated HV lift.';
  s.workshopStudy.charger={...s.workshopStudy.charger,status:'Four owner-confirmed charging locations; hardware, mounting, cable route and power specifications remain unverified. CH-SHOWROOM reuses the existing SHARED-EV object; no fifth charger.'};
  s.annexes.workshop.rearStair=w.existingRearStair;
  s.workshopStudy.mbPlanningCells={...s.workshopStudy.mbPlanningCells,render:false,status:'Retired generic allocation proxies; explicit owner inventory is authoritative'};
  s.workshopStudy.clearDriveBand={xMin:8,xMax:40,yMin:28.5,yMax:35.5,status:'Central reservation only; eastern parking excluded; swept path unverified'};
  s.workshopStudy.customerService=w.reservations.csOffice;
  s.workshopStudy.diagnosis={required:true,positionStatus:'HOLD: previous unverified cabinet removed from Customer Service parking; final location requires operator confirmation'};
  d.exterior.workshopStudy=s.workshopStudy;
  // Named paint cells use owner counts and measured rear dimensions. Context fits
  // do not silently become certified capacity, legal boundary or traffic design.
  const cells=[];const add=(id,run,bounds,orientation,note)=>cells.push({id,code:e.parking.bayCodes[id],run,bounds,orientation,status:note||'Owner-directed photo-fit; manoeuvring unverified'});
  for(const [key,prefix,run,axis] of [['roadsideFrontFive','F','front-roadside','X'],['buildingParallelTwo','B','building-side','X'],['sideFenceFour','S','side-roadside','Y']]){
    const r=e.parking[key];for(let i=0;i<r.count;i++){const bounds=axis==='X'?[r.xMin+i*r.slotLength,r.yMin,r.xMin+(i+1)*r.slotLength,r.yMax]:[r.xMin,r.yMin+i*r.slotLength,r.xMax,r.yMin+(i+1)*r.slotLength];add(prefix+'-'+(i+1),run,bounds,axis==='X'?'parallel-to-Sukhumvit':'parallel-to-Samet-Ang-Sila',r.note);}
  }
  add(e.parking.cornerCell.id,'pylon-shrine-corner',e.parking.cornerCell.bounds.slice(),'perpendicular-to-Sukhumvit',e.parking.cornerCell.note);
  for(const q of w.rearParking.bays)add(q.id,'rear-workshop',q.bounds,'long-axis-Y','Owner: 2.5 × 5m; 1m clear wall offset. Number '+q.number+'; X registration photo-fit.');
  for(const q of w.reservations.parking.filter(q=>q.id!=='OWNER-R27-P1'))add(q.id,'workshop-side',q.bounds.slice(),'long-axis-Y','Owner dimensioned 2.5×5m exterior reservation; no obsolete R36 override. Code confirmed; position and approach remain unverified.');
  const paint=[],seen=new Set();for(const c of cells){const [x0,y0,x1,y1]=c.bounds,pts=[[x0,y0],[x1,y0],[x1,y1],[x0,y1],[x0,y0]];for(let i=1;i<pts.length;i++){const key=[pts[i-1],pts[i]].map(p=>p.map(n=>n.toFixed(4)).join(',')).sort().join('|');if(seen.has(key))continue;seen.add(key);paint.push({id:c.id+'-edge-'+i,points:[pts[i-1],pts[i]],source:'owner-review-v12',level:s.levels.forecourt});}}
  // F3/F4 border the unmeasured ramp toe; no illustrative car may obstruct it.
  const occupied=['F-1','F-2','F-5','S-2','S-3','S-4','OWNER-REAR-03','OWNER-REAR-05','OWNER-REAR-07','OWNER-REAR-09'];
  const cars=occupied.map((id,i)=>{const q=cells.find(c=>c.id===id),[x0,y0,x1,y1]=q.bounds,isGLC=i===3||i===7;return {id:'EXT-MB-'+id,bayId:id,model:'Mercedes-Benz '+(isGLC?'GLC':'C-Class'),profile:isGLC?'glc':'cclass',brand:'MB',paint:i%3===0?'#252a2e':i%3===1?'#eceeea':'#c4c7c5',photoReference:'Owner showroom photographs 12 September 2026; family appearance, not live stock',cx:(x0+x1)/2,cy:(y0+y1)/2,l:isGLC?4.75:4.8,w:isGLC?2.12:2.10,heightCap:isGLC?1.68:1.55,angle:x1-x0>y1-y0?0:90};});
  s.exteriorParking={revision:'owner-v13-r7',coordinateStatus:review.status,referenceRoad:'Sukhumvit local X; Samet–Ang Sila local Y',allocationReviewPending:false,allocationStatus:e.parking.allocationStatus,allocations:e.parking.allocations,identifiedCompleteCells:cells.length,siteCapacity:null,illustrationOccupancy:{occupied:cars.length,identifiedCompleteCells:cells.length,ratio:cars.length/cells.length,scope:'10 illustrative MB cars / 26 exterior study cells = 38.5%, approximately 40%. All three smart allocations, F3/F4 ramp approach and shrine corner remain empty; no certified capacity or invented smart stock claim. Separate indoor CS reservation excluded.'},status:'Owner-directed mixed parallel/perpendicular parking and use codes. F3/F4 ramp approach and shrine/pylon/gate frontage kept empty; manoeuvring and sign hardware remain unverified.',cells,paint,cars,unknownPaintSpans:['Photo-fit endpoints and side boundary require site measurement','Rear 1m gap is wall offset, not an aisle; road access not inferred','Front F3/F4 paint-to-ramp-toe relationship and metric exit route HOLD'],level:s.levels.forecourt};
  d.exterior.allocationReviewPending=false;
  for(const q of d.exterior.parking){const assignment=e.parking.allocations.find(a=>a.referenceId===q.id),cell=assignment&&cells.find(c=>c.id===assignment.bayId);if(!cell)throw new Error('Missing owner parking allocation '+q.id);const [x0,y0,x1,y1]=cell.bounds;Object.assign(q,assignment,{id:q.id,use:'smart '+assignment.role.toLowerCase(),existingBayId:cell.id,bounds:cell.bounds.slice(),render:true,allocationReviewPending:false,x:(x0+x1)/2,y:(y0+y1)/2,width:Math.min(x1-x0,y1-y0),length:Math.max(x1-x0,y1-y0),status:'Owner-confirmed '+assignment.label+' at '+assignment.code+'; sign anchor is an unmeasured design proxy, supplier/access approval pending'});}
  s.entryRamp={xMin:26.6,xMax:29.8,yMin:-4.5,yMax:2.5,status:'Existing front Entrance ramp confirmed by owner; width/run/level profile are schematic pending measurement, not accessibility or vehicle-gradient approval'};
  s.entrySteps.render=false;s.entrySteps.status='Superseded five-step proxy across vehicle entrance; owner confirms ramp at existing front Entrance';
  d.customerExperience.handover.path=[[36,5.25],[32,5.25],[30,5.25],[28.2,5.25],[28.2,2.5],[28.2,-4.5]];
  d.customerExperience.handover.forecourtPath=[[28.2,-4.5],[27,-5.9],[18,-5.9],[8,-5.9],[-1.75,-6.9],[-1.75,-13.5]];
  d.customerExperience.handover.forecourtRouteRender=false;
  d.customerExperience.handover.forecourtPathSuperseded=true;
  d.customerExperience.handover.forecourtRouteStatus='HOLD: old metric forecourt path intersects narrowed F-row. Do not shorten the existing ramp or infer a clear lane; measure ramp toe and parking relationship first.';
  d.customerExperience.handover.confirmedExitSequence=['Temporarily move MB5 and its price stand','MB6 passes vacated MB5','Turn left through existing front Entrance ramp','Exit through existing front gate'];
  d.customerExperience.sharedCharging='Four owner-confirmed charging points: showroom, Customer Service, rear workshop and rear parking. Existing SHARED-EV represents the showroom point; mounting, hardware, electrical capacity and specifications remain unverified.';
  d.exterior.sharedCharging=d.customerExperience.sharedCharging;
  for(const state of d.states){
    const backdrop=state.furniture.find(q=>q.type==='background-wall');
    if(!backdrop||!review.module3BBackdrop)throw Error('Missing canonical Module3B backdrop');
    Object.assign(backdrop,{elevationProfile:{...review.module3BBackdrop},shape:review.module3BBackdrop.shape});
    const logo=state.furniture.find(q=>q.type==='window-logo');Object.assign(logo,{cx:facade.centre[0],cy:facade.centre[1],centerHeight:facade.centreHeight,sizeEnvelope:facade.sizeEnvelope.slice(),depthProxy:facade.depthProxy,illuminated:facade.illuminated,installationType:facade.installationType,status:d.exterior.facadeLogo.status});
    state.handoverOperation=d.customerExperience.handover;
    const sharedEV=state.furniture.find(q=>q.id==='SHARED-EV'),showroomCharge=w.chargingPoints.find(q=>q.id==='CH-SHOWROOM');
    if(sharedEV&&showroomCharge){sharedEV.cx=showroomCharge.centre[0];sharedEV.cy=showroomCharge.centre[1];sharedEV.status='Owner-confirmed existing charging point; annotation-fit location, not a new fifth charger. Hardware, mounting and power specifications pending.';sharedEV.chargingPointRef=showroomCharge.id;}
    const mb5=state.cars.find(q=>q.id==='MB5');mb5.clearanceStatus='Owner operation: temporarily move MB5 and its price stand before MB6 passes the vacated position, turns left and descends the existing front Entrance ramp. Swept path unverified.';
  }
  d.limitations=d.limitations.filter(q=>!q.startsWith('MB5 owner relocation')&&!q.startsWith('MB5 circulation HOLD'));
  d.limitations.push('Autohaus Small: owner selects two-screen Sub Stage, with Sales Step V journey. This study is not MB/smart compliance approval.','MB6 delivery requires temporarily moving MB5 and loose price stands; existing Entrance route confirmed, dimensions/turning/ramp profile require field checks.');
  return d;
};
