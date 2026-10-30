(function(){
if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
var c=document.createElement('canvas');c.id='embers';c.setAttribute('aria-hidden','true');document.body.appendChild(c);
var x=c.getContext('2d'),W,H,D=Math.min(devicePixelRatio||1,2),P=[],N=innerWidth<700?18:36,run=true,last=0;
function size(){W=innerWidth;H=innerHeight;c.width=W*D;c.height=H*D;x.setTransform(D,0,0,D,0,0)}
function mk(p,init){p.x=Math.random()*W;p.y=init?Math.random()*H:H+10;p.r=.6+Math.random()*1.8;p.vy=8+Math.random()*18;p.sw=Math.random()*6.28;p.ss=.4+Math.random()*.8;p.a=.15+Math.random()*.35;p.life=0;p.max=H/p.vy*(.6+Math.random()*.4);p.ash=Math.random()<.25;return p}
size();for(var i=0;i<N;i++)P.push(mk({},true));addEventListener('resize',size);
document.addEventListener('visibilitychange',function(){run=!document.hidden;if(run){last=0;requestAnimationFrame(f)}});
function f(t){if(!run)return;var dt=last?Math.min((t-last)/1000,.05):0;last=t;x.clearRect(0,0,W,H);
for(var i=0;i<P.length;i++){var p=P[i];p.life+=dt;p.y-=p.vy*dt;p.sw+=p.ss*dt;p.x+=Math.sin(p.sw)*.25;
var k=p.life/p.max,al=p.a*Math.min(1,k*4)*Math.max(0,1-k);if(k>=1||p.y<-10){mk(p,false);continue}
x.globalAlpha=al;x.fillStyle=p.ash?'#f4f1ea':'#ff7a1a';x.shadowColor='#ff6a00';x.shadowBlur=p.ash?0:6;x.beginPath();x.arc(p.x,p.y,p.r,0,6.283);x.fill()}
requestAnimationFrame(f)}requestAnimationFrame(f);
})();
