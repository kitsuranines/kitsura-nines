(function(){
if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
var bg=document.querySelector('.px-bg'),fg=document.querySelector('.px-fg');if(!bg||!fg)return;
var fine=matchMedia('(hover:hover) and (pointer:fine)').matches,mx=0,my=0,cx=0,cy=0,raf=0,last='';
function tick(){cx+=(mx-cx)*.08;cy+=(my-cy)*.08;var s=Math.min(scrollY,1000)/1000;
var fx=cx*16,fy=cy*10-s*12,bx=cx*4,by=cy*3-s*4;
bg.style.transform='translate3d('+bx.toFixed(1)+'px,'+by.toFixed(1)+'px,0) scale(1.05)';fg.style.transform='translate3d('+fx.toFixed(1)+'px,'+fy.toFixed(1)+'px,0) scale(1.05)';
raf=(Math.abs(mx-cx)>.002||Math.abs(my-cy)>.002)?requestAnimationFrame(tick):0}
function go(){if(!raf)raf=requestAnimationFrame(tick)}
if(fine)addEventListener('mousemove',function(e){mx=e.clientX/innerWidth-.5;my=e.clientY/innerHeight-.5;go()},{passive:true});
addEventListener('scroll',go,{passive:true});
})();
