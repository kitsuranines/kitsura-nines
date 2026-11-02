(function(){
const C=window.CHARACTERS||[],page=document.body.dataset.page;
const e=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const card=(x,href,sub)=>`<a class="card" href="${href}"><div class="frame"><img src="${e(x.image)}" alt="${e(x.name)}" loading="lazy"></div><h3>${e(x.name)}</h3><p>${e(sub)}</p></a>`;
const cg=document.getElementById('char-grid');
if(cg){const q=document.getElementById('q'),cnt=document.getElementById('count'),em=document.getElementById('empty');
 const draw=()=>{const t=(q.value||'').trim().toLowerCase(),l=C.filter(c=>[c.name,c.fullName,c.title].join(' ').toLowerCase().includes(t));
  cg.innerHTML=l.map(c=>card(c,'character.html?id='+encodeURIComponent(c.id),c.title)).join('');em.hidden=l.length>0;cnt.textContent=l.length+' / '+C.length;};
 q.addEventListener('input',draw);draw();}
const d=document.getElementById('detail');
if(d){const list=C,id=new URLSearchParams(location.search).get('id'),i=Math.max(0,list.findIndex(x=>x.id===id)),x=list[i];
 if(!x){d.innerHTML='<p class="center">Nothing found in the static.</p>';return;}
 document.title=x.name+' — Static Hollow';
 const base='character.html?id=',prev=list[(i-1+list.length)%list.length],next=list[(i+1)%list.length];
 const ps=a=>(a||[]).filter(Boolean).map(p=>`<p>${e(p)}</p>`).join('');
 d.innerHTML=`<section class="panel intro"><div class="gl" id="mainimg"><img src="${e(x.image)}" alt="${e(x.name)}" data-full="${e(x.image)}"></div>
 <div><h1 class="glitch" id="cname" aria-label="${e((x.fullName||x.name).toUpperCase())}" data-text="${e((x.fullName||x.name).toUpperCase())}">${e((x.fullName||x.name).toUpperCase())}</h1>
 ${x.species?`<p class="meta">${e(x.species)}</p>`:''}<p class="meta"><b>${e(x.title)}</b></p>
 ${x.note?`<p class="note">${e(x.note)}</p>`:''}<div class="lore">${ps([x.intro])}</div>
 ${(x.links||[]).length?`<div class="links">${x.links.map(l=>`<a class="btn" href="${e(l.url)}" target="_blank" rel="noopener">${e(l.label)}</a>`).join('')}</div>`:''}</div></section>
 ${(x.lore||[]).filter(Boolean).length?`<section class="panel lore"><h2>LORE</h2>${ps(x.lore)}</section>`:''}
 <section class="panel"><h2>REFERENCE IMAGES</h2><div class="gallery">${(x.references||[]).map(g=>`<img src="${e(g)}" data-full="${e(g)}" alt="${e(x.name)} reference" loading="lazy">`).join('')}${Array.from({length:Math.max(0,3-(x.references||[]).length)},()=>'<div class="slot">Reference slot<br><small>add to data/characters.js</small></div>').join('')}</div></section>
 <nav class="pager"><a class="btn" href="${base+prev.id}">← ${e(prev.name)}</a><a class="btn" href="index.html">Home</a><a class="btn" href="${base+next.id}">${e(next.name)} →</a></nav>`;}
const lb=document.getElementById('lb');if(lb){const im=lb.querySelector('img'),close=()=>lb.hidden=true;
 document.addEventListener('click',ev=>{const t=ev.target.closest('[data-full]');if(t){im.src=t.dataset.full;im.alt=t.alt;lb.hidden=false;}else if(!lb.hidden&&ev.target!==im)close();});
 document.addEventListener('keydown',ev=>{if(ev.key==='Escape')close();});}
})();

(function(){const cv=document.getElementById('sparks');if(!cv||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
const x=cv.getContext('2d'),N=innerWidth<700?28:60;let w,h,P=[],run=true;
const rs=()=>{const d=Math.min(devicePixelRatio||1,2);w=cv.offsetWidth;h=cv.offsetHeight;cv.width=w*d;cv.height=h*d;x.setTransform(d,0,0,d,0,0)};
const mk=()=>({x:Math.random()*w,y:h+Math.random()*h*.5,r:Math.random()*1.8+.4,v:Math.random()*.5+.15,s:Math.random()*.6-.3,a:Math.random()*.6+.3,t:Math.random()*6});
rs();addEventListener('resize',rs);for(let i=0;i<N;i++){const p=mk();p.y=Math.random()*h;P.push(p)}
new IntersectionObserver(e=>{run=e[0].isIntersecting;if(run)requestAnimationFrame(f)}).observe(cv);
function f(){if(!run||document.hidden){if(run)setTimeout(()=>requestAnimationFrame(f),300);return}x.clearRect(0,0,w,h);
for(const p of P){p.y-=p.v;p.t+=.03;p.x+=p.s+Math.sin(p.t)*.25;if(p.y<-10)Object.assign(p,mk());
const a=p.a*(.6+.4*Math.sin(p.t*3));x.fillStyle=`rgba(250,116,0,${a})`;x.shadowColor='#FA7400';x.shadowBlur=8;x.beginPath();x.arc(p.x,p.y,p.r,0,7);x.fill();
if(p.r>1.9){x.fillRect(p.x-p.r*3,p.y-.3,p.r*6,.6);x.fillRect(p.x-.3,p.y-p.r*3,.6,p.r*6)}}
requestAnimationFrame(f)}requestAnimationFrame(f)})();

(function(){const w=document.getElementById('mainimg');if(!w)return;
if(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches)return;
const img=w.querySelector('img');let busy=false;
function go(){if(busy)return;busy=true;const src=img.currentSrc||img.src;
 w.querySelectorAll('.gl-l').forEach(n=>n.remove());w.classList.remove('glitching');
 ['r','b','s1','s2','s3'].forEach(k=>{const c=document.createElement('img');c.src=src;c.alt='';c.className='gl-l gl-'+k;c.setAttribute('aria-hidden','true');w.appendChild(c)});
 void w.offsetWidth;requestAnimationFrame(()=>{w.classList.add('glitching');
 setTimeout(()=>{w.classList.remove('glitching');w.querySelectorAll('.gl-l').forEach(n=>n.remove());busy=false},1150)});}
function ready(){const p=(img.decode?img.decode():Promise.resolve()).catch(()=>{});p.then(()=>{if(img.naturalWidth)go();else img.addEventListener('load',go,{once:true})});}
img.complete&&img.naturalWidth?ready():img.addEventListener('load',ready,{once:true});
setTimeout(()=>{if(!w.dataset.played&&img.naturalWidth)go()},2500);
w.addEventListener('animationstart',()=>{w.dataset.played=1},{once:true});
addEventListener('pageshow',ev=>{if(ev.persisted){busy=false;go()}});
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&!w.dataset.played)go()});})();

(function(){const box=document.querySelector('.intro > div:not(.gl)');if(!box)return;
const els=[...box.querySelectorAll('h1,.meta,.note')];if(!els.length)return;
els.forEach(el=>{if(!el.getAttribute('aria-label'))el.setAttribute('aria-label',el.textContent.trim())});
if(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches)return;
const G='#_%?!@$&*/\\<>[]{}=+~^|░▒▓█▚▞¥§Ø∆※'.split(''),Z=['\u0336','\u0337','\u0334'],rnd=a=>a[Math.random()*a.length|0];
const items=els.map(el=>{el.classList.add('scr');let real=el.querySelector(':scope > .scr-real');
 if(!real){real=document.createElement('span');real.className='scr-real';while(el.firstChild)real.appendChild(el.firstChild);el.appendChild(real)}
 const ov=document.createElement('span');ov.className='scr-ov';ov.setAttribute('aria-hidden','true');el.appendChild(ov);
 return {el,real,ov}});
function scr(it,p){it.ov.innerHTML='';const clone=it.real.cloneNode(true);const tw=document.createTreeWalker(clone,4);const nodes=[];while(tw.nextNode())nodes.push(tw.currentNode);
 const total=nodes.reduce((s,n)=>s+n.data.length,0)||1;let idx=0;
 nodes.forEach(n=>{const frag=document.createDocumentFragment();for(const ch of n.data){const lock=(idx++/total)*.7+.25;
  if(/\s/.test(ch)||p>=lock+Math.random()*.05){if(p<lock+.08&&Math.random()<.25&&!/\s/.test(ch)){const i=document.createElement('i');i.className='fl';i.textContent=ch;frag.appendChild(i)}else frag.appendChild(document.createTextNode(ch));continue}
  let g=rnd(G);if(Math.random()<.08)g+=rnd(Z);
  if(Math.random()<.3){const o=document.createElement('b');o.className='o';o.textContent=g;frag.appendChild(o)}else frag.appendChild(document.createTextNode(g))}
  n.parentNode.replaceChild(frag,n)});
 while(clone.firstChild)it.ov.appendChild(clone.firstChild)}
let gen=0;
function run(){const my=++gen,t0=performance.now(),D=900,STEP=220;
 items.forEach(it=>{it.el.classList.add('scrambling');scr(it,0)});
 (function f(){if(my!==gen)return;const t=performance.now()-t0;let alive=false;
  items.forEach((it,k)=>{const p=Math.max(0,Math.min(1,(t-k*STEP)/D));
   if(p>=1){if(it.el.classList.contains('scrambling')){it.el.classList.remove('scrambling');it.ov.innerHTML=''}}else{alive=true;scr(it,p)}});
  if(alive)setTimeout(()=>requestAnimationFrame(f),45)})()}
run();addEventListener('pageshow',e=>{if(e.persisted)run()});})();
