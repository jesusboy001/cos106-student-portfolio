const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const {spawn} = require('node:child_process');
const server = spawn('python3',['-m','http.server','8765','--bind','127.0.0.1'],{cwd:require('node:path').join(__dirname,'..'),stdio:'ignore'});
(async()=>{
 let browser;
 try {
  for(let i=0;i<50;i++){try {await fetch('http://127.0.0.1:8765');break;}catch{await new Promise(r=>setTimeout(r,100));}}
  browser=await chromium.launch({headless:true,args:['--no-sandbox']});
  const page=await browser.newPage(); const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  for(const width of [1440,390,320]){
   await page.setViewportSize({width,height:900});
   for(const path of ['index.html','about.html','projects.html','planner.html','contact.html']){
    const response=await page.goto('http://127.0.0.1:8765/'+path);assert.equal(response.status(),200);
    assert.equal(await page.locator('h1').count(),1);
    assert.equal(await page.locator('nav [aria-current="page"]').count(),1);
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`Overflow: ${path} at ${width}`);
    for(const img of await page.locator('img').all()) assert(await img.evaluate(i=>i.complete && i.naturalWidth>0));
   }
  }
  await page.goto('http://127.0.0.1:8765/index.html');
  await page.locator('.menu-toggle').click();assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'),'true');
  await page.locator('nav a[href="planner.html"]').click();
  const add=async(title)=>{await page.fill('#task-title',title);await page.locator('#task-form button').click();};
  await add('Prepare COS 106 submission'); await add('<img src=x onerror=alert(1)>');
  assert.equal(await page.locator('.task').count(),2);assert.equal(await page.locator('#task-list img').count(),0);
  await page.reload();assert.equal(await page.locator('.task').count(),2);
  await page.locator('.task input').first().check();assert.equal(await page.locator('#progress-number').textContent(),'1 / 2');
  await page.click('[data-filter="active"]');assert.equal(await page.locator('.task').count(),1);
  await page.click('[data-filter="completed"]');assert.equal(await page.locator('.task').count(),1);
  await page.click('.delete-task');assert.equal(await page.locator('#progress-number').textContent(),'0 / 1');
  await page.reload();assert.equal(await page.locator('.task').count(),1);
  await page.goto('http://127.0.0.1:8765/contact.html');await page.locator('#contact-form button').click();
  assert.equal(await page.locator('[aria-invalid="true"]').count(),4);
  await page.fill('#name','Student');await page.fill('#email','wrong');await page.fill('#phone','080 ABC');await page.fill('#message','Hello');
  await page.locator('#contact-form button').click();assert.equal(await page.locator('[aria-invalid="true"]').count(),2);
  await page.fill('#email','student@example.com');await page.fill('#phone','08012345678');await page.locator('#contact-form button').click();
  assert.equal(await page.locator('[aria-invalid="true"]').count(),0);assert.match(await page.locator('#email-draft').getAttribute('href'),/^mailto:/);
  await page.fill('#email','invalid');assert.equal(await page.locator('#email-draft').isVisible(),false);
  await page.goto('http://127.0.0.1:8765/index.html');assert(await page.locator('audio').evaluate(a=>a.readyState>=1));
  await page.setViewportSize({width:1440,height:1100});await page.screenshot({path:'/workspace/scratch/8dc8e3dfce0e/portfolio-desktop.png',fullPage:true});
  await page.setViewportSize({width:390,height:844});await page.screenshot({path:'/workspace/scratch/8dc8e3dfce0e/portfolio-mobile.png',fullPage:true});
  await page.goto('http://127.0.0.1:8765/planner.html');
  await page.evaluate(()=>localStorage.setItem('cos106.tasks.v1','{broken'));
  await page.reload();assert.equal(await page.locator('.task').count(),0);
  assert.deepEqual(errors,[]);console.log('PASS: five pages at 3 widths; navigation; planner add/complete/delete/filter/persistence/XSS; malformed storage; contact validation; audio; no browser errors.');
 }finally{await browser?.close();server.kill();}
})().catch(e=>{console.error(e);process.exitCode=1});
