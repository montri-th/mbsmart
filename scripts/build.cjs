const fs=require('fs'),path=require('path'),vm=require('vm');
const root=path.resolve(__dirname,'..'),dist=path.join(root,'dist');fs.mkdirSync(dist,{recursive:true});
for(const file of ['scene.js','layout.js','feedback.js','feedback-config.js'])new vm.Script(fs.readFileSync(path.join(root,file),'utf8'),{filename:file});
const context={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'layout.js'),'utf8'),context);const d=context.window.BC_LAYOUT;
if(d.revision!=='v06'||d.states.length!==3||d.defaultState!=='handover')throw Error('Wrong revision/default');
for(const s of d.states){if(s.cars.filter(c=>c.brand==='MB').length!==(s.mode==='handover'?6:5)||s.cars.filter(c=>c.brand==='smart').length!==1||s.module.type!=='Module 3B'||s.module.quantity!==1||s.furniture.some(q=>q.id==='ST')||s.people.length<8)throw Error('Wrong design state');}
for(const name of ['index.html','viewer.css','scene.js','layout.js','feedback.js','feedback-config.js','vendor','renders','versions'])fs.cpSync(path.join(root,name),path.join(dist,name),{recursive:true});
fs.writeFileSync(path.join(dist,'.nojekyll'),'');console.log('Static build complete: B/3B v06, three modes, people, switchable AC; archived v04 preserved.');
