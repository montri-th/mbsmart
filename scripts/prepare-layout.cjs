const fs=require('fs'),path=require('path');
const input=process.argv[2];if(!input)throw Error('Pass approved layout JSON');
const d=JSON.parse(fs.readFileSync(input,'utf8'));
const out={revision:d.revision,defaultState:'handover',states:d.states.map(s=>({mode:s.mode,floor:s.floor,columns:s.columns,module:s.module,cars:s.cars,furniture:s.furniture,routes:s.routes,serviceAccessReserve:s.serviceAccessReserve,optionalPackage:s.optionalPackage,people:s.people||[]}))};
if(out.revision!=='v06'||out.states.length!==3||out.states.some(s=>s.cars.length!==(s.mode==='handover'?7:6)||s.furniture.some(f=>f.id==='ST')))throw Error('Layout integrity: expected v06');
fs.writeFileSync(path.resolve(__dirname,'../layout.js'),'/* Derived schematic coordinates; no original source documents. */\nwindow.BC_LAYOUT='+JSON.stringify(out)+';\n');
console.log('Prepared v06 three uses, MB6 only in handover, no ST.');
