(function(){
var b=document.body,v=document.createElement('div');v.className='vhs';b.appendChild(v);var s=document.createElement('div');s.className='scan';b.appendChild(s);
if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
var L=["What.","Stop clicking me.","You again?","Go watch her stream, nerd.","I'm not cute. I'm terrifying.","Touch grass.","I was here first.","Don't make it weird.","Ugh. Humans.","I've seen your search history.","Pet me and you lose a hand.","Bold of you to exist near me."];
var r=document.createElement('button');r.className='roger-peek';r.setAttribute('aria-label','Roger');r.innerHTML='<span class="roger-bub"></span><img src="img/roger-peek.webp?v=1" alt="">';b.appendChild(r);
var bub=r.firstChild,t1,last=-1;
function hide(){r.classList.remove('on');bub.classList.remove('show');setTimeout(sched,600)}
function peek(){if(document.hidden){sched();return}r.classList.toggle('side',innerWidth>700&&Math.random()<.4);requestAnimationFrame(function(){r.classList.add('on')});t1=setTimeout(hide,5000)}
function sched(){setTimeout(peek,30000+Math.random()*30000)}
r.addEventListener('click',function(){var i;do{i=Math.floor(Math.random()*L.length)}while(i==last);last=i;bub.textContent=L[i];bub.classList.add('show');clearTimeout(t1);t1=setTimeout(hide,3000)});
setTimeout(peek,8000+Math.random()*10000);
})();
