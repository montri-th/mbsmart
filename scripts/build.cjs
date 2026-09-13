const fs=require('fs'),path=require('path'),vm=require('vm');
const root=path.resolve(__dirname,'..'),dist=path.join(root,'dist');fs.mkdirSync(dist,{recursive:true});
const crypto=require('crypto'),presentation=JSON.parse(fs.readFileSync(path.join(root,'assets/presentation-v10.json'),'utf8'));
if(presentation.experienceRevision!=='v10'||presentation.images.length!==6)throw Error('Incomplete presentation');
for(const item of [...presentation.images,presentation.favicon]){const bytes=fs.readFileSync(path.join(root,item.path));if(crypto.createHash('sha256').update(bytes).digest('hex')!==item.sha256)throw Error('Presentation asset mismatch: '+item.path);}
for(const file of ['scene.js','experience.js','smart.js','smart-brand.js','building-annexes.js','workshop-interior.js','site.js','shrine.js','exterior-design.js','exterior-massing.js','review-guide.js','layout.js','feedback.js','feedback-config.js'])new vm.Script(fs.readFileSync(path.join(root,file),'utf8'),{filename:file});
const context={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'layout.js'),'utf8'),context);const d=context.window.BC_LAYOUT;
fs.writeFileSync(path.join(root,'assets/geometry-register.json'),JSON.stringify(require('./export-geometry.cjs')(d),null,2)+'\n');
if(d.revision!=='v09'||d.states.length!==3||d.defaultState!=='handover'||d.site.revision!=='v09'||d.feedbackPolicy.submissionEnabled!==true||d.exterior.revision!=='v09')throw Error('Wrong revision/default/site/feedback policy');
for(const s of d.states){if(s.cars.filter(c=>c.brand==='MB').length!==(s.mode==='handover'?6:5)||s.cars.filter(c=>c.brand==='smart').length!==1||s.module.type!=='Module 3B'||s.module.quantity!==1||s.furniture.some(q=>q.id==='ST')||s.people.length<8)throw Error('Wrong design state');}
for(const name of ['index.html','viewer.css','experience.css','experience.js','scene.js','smart.js','smart-brand.js','building-annexes.js','workshop-interior.js','site.js','shrine.js','exterior-design.js','exterior-massing.js','review-guide.js','layout.js','feedback.js','feedback-config.js','assets','vendor','renders','versions'])fs.cpSync(path.join(root,name),path.join(dist,name),{recursive:true});
fs.writeFileSync(path.join(dist,'.nojekyll'),'');console.log('Static build complete: v10 three-section presentation; v09-r3 model and archived v04/v06/v07/v08 preserved.');
