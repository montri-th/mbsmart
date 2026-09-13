const fs=require('fs'),path=require('path');
const input=process.argv[2];if(!input)throw Error('Pass approved layout JSON');
const d=JSON.parse(fs.readFileSync(input,'utf8'));
const out={revision:d.revision,defaultState:'handover',states:d.states.map(s=>({mode:s.mode,floor:s.floor,columns:s.columns,module:s.module,cars:s.cars,furniture:s.furniture,routes:s.routes,serviceAccessReserve:s.serviceAccessReserve,optionalPackage:s.optionalPackage}))};
if(out.states.length!==2||out.states.some(s=>s.cars.length!==6||s.furniture.some(f=>f.id==='ST')))throw Error('Layout integrity');
fs.writeFileSync(path.resolve(__dirname,'../layout.js'),'/* Derived schematic coordinates; no original source documents. */\nwindow.BC_LAYOUT='+JSON.stringify(out)+';\n');
console.log('Prepared two states, 6 vehicles each, no ST.');
