const fs=require('fs'),path=require('path'),vm=require('vm');
const root=path.resolve(__dirname,'..'),dist=path.join(root,'dist');fs.mkdirSync(dist,{recursive:true});
for(const file of ['scene.js','smart.js','smart-brand.js','building-annexes.js','workshop-interior.js','site.js','shrine.js','exterior-design.js','exterior-massing.js','review-guide.js','layout.js','feedback.js','feedback-config.js'])new vm.Script(fs.readFileSync(path.join(root,file),'utf8'),{filename:file});
const context={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'layout.js'),'utf8'),context);const d=context.window.BC_LAYOUT;
fs.writeFileSync(path.join(root,'assets/geometry-register.json'),JSON.stringify(require('./export-geometry.cjs')(d),null,2)+'\n');
if(d.revision!=='v09'||d.states.length!==3||d.defaultState!=='handover'||d.site.revision!=='v09'||d.feedbackPolicy.submissionEnabled!==true||d.exterior.revision!=='v09')throw Error('Wrong revision/default/site/feedback policy');
for(const s of d.states){if(s.cars.filter(c=>c.brand==='MB').length!==(s.mode==='handover'?6:5)||s.cars.filter(c=>c.brand==='smart').length!==1||s.module.type!=='Module 3B'||s.module.quantity!==1||s.furniture.some(q=>q.id==='ST')||s.people.length<8)throw Error('Wrong design state');}
for(const name of ['index.html','viewer.css','scene.js','smart.js','smart-brand.js','building-annexes.js','workshop-interior.js','site.js','shrine.js','exterior-design.js','exterior-massing.js','review-guide.js','layout.js','feedback.js','feedback-config.js','assets','vendor','renders','versions'])fs.cpSync(path.join(root,name),path.join(dist,name),{recursive:true});
fs.writeFileSync(path.join(dist,'.nojekyll'),'');console.log('Static build complete: v09 exterior comparison; interior v07 and archived v04/v06/v07/v08 preserved.');
