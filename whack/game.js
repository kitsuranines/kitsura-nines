(function(){
"use strict";
var API="https://api.restful-api.dev/objects/ff808181a09d98f701a19edcaac71536";
var MAXS=5000,MAXN=12;
var CRE=["backseat","chaos","emote","hype","lore","lurker","scream","sleepy","snack"];
var $=function(i){return document.getElementById(i)};
var board=$("board"),holes=[];
for(var i=0;i<9;i++){var h=document.createElement("div");h.className="hole";var m=document.createElement("div");m.className="mob";var im=document.createElement("img");im.alt="";im.draggable=false;m.appendChild(im);var l=document.createElement("div");l.className="lip";var pt=document.createElement("div");pt.className="pit";pt.appendChild(m);h.appendChild(pt);h.appendChild(l);board.appendChild(h);
 holes.push({el:h,mob:m,img:im,kind:null,until:0,hit:false});}
CRE.concat(["roger"]).forEach(function(c){var p=new Image();p.src=c==="roger"?"img/roger-whack.webp?v=2":"creature/img/"+c+".webp?v=7";});
var best=+(localStorage.getItem("kn-whack-best")||0);$("best").textContent=best;
var muted=localStorage.getItem("kn-whack-mute")==="1";
function setMute(){$("mute").innerHTML=muted?"&#128263; Sound off":"&#128264; Sound on";$("mute").setAttribute("aria-pressed",muted)}setMute();
$("mute").onclick=function(){muted=!muted;localStorage.setItem("kn-whack-mute",muted?"1":"0");setMute()};
var ac;function snd(type){if(muted)return;try{ac=ac||new (window.AudioContext||window.webkitAudioContext)();if(ac.state==="suspended")ac.resume();var t=ac.currentTime,o=ac.createOscillator(),g=ac.createGain();o.connect(g);g.connect(ac.destination);
 if(type==="bonk"){o.type="triangle";o.frequency.setValueAtTime(420,t);o.frequency.exponentialRampToValueAtTime(90,t+.15);g.gain.setValueAtTime(.5,t);g.gain.exponentialRampToValueAtTime(.001,t+.2);o.start(t);o.stop(t+.22);}
 else if(type==="gold"){o.type="square";o.frequency.setValueAtTime(660,t);o.frequency.setValueAtTime(990,t+.08);o.frequency.setValueAtTime(1320,t+.16);g.gain.setValueAtTime(.15,t);g.gain.exponentialRampToValueAtTime(.001,t+.32);o.start(t);o.stop(t+.34);}
 else if(type==="roger"){o.type="sawtooth";o.frequency.setValueAtTime(140,t);o.frequency.linearRampToValueAtTime(60,t+.6);g.gain.setValueAtTime(.3,t);g.gain.exponentialRampToValueAtTime(.001,t+.7);o.start(t);o.stop(t+.72);}
 else {o.type="sine";o.frequency.setValueAtTime(200,t);o.frequency.exponentialRampToValueAtTime(120,t+.12);g.gain.setValueAtTime(.12,t);g.gain.exponentialRampToValueAtTime(.001,t+.14);o.start(t);o.stop(t+.15);}
}catch(e){}}
// game state; gt = game time (ms), only advances when running
var spawns=0,running=false,paused=false,gt=0,last=0,nextSpawn=0,streak=0,runBest=0,score=0,hits=0,submitted=false,raf=0;
function k(){return Math.max(0,spawns-50)}
function upTime(){var b=Math.max(520,1250-streak*22);return spawns<50?b:Math.max(360,b*.9-k()*3)}
function gap(){var b=Math.max(280,900-streak*18);return spawns<50?b:Math.max(170,b*.9-k()*2)}
function maxUp(){var b=Math.min(3,1+Math.floor(streak/12));return spawns<50?b:Math.min(4,b+1+Math.floor(k()/60))}
function rogerP(){return spawns<50?.17:Math.min(.25,.2+k()*.0006)}
function render(){$("streak").textContent=streak;$("score").textContent=score;$("best").textContent=best}
function spawn(){var free=holes.filter(function(h){return !h.kind});var up=9-free.length;if(!free.length||up>=maxUp())return;
 var h=free[Math.floor(Math.random()*free.length)],r=Math.random(),kind;
 if(hits>=3&&r<rogerP())kind="roger";else if(r>.94)kind="gold";else kind="cre";
 spawns++;window.__whack={spawns:spawns,up:Math.round(upTime()),gap:Math.round(gap()),max:maxUp(),roger:rogerP()};h.kind=kind;h.hit=false;h.until=gt+upTime()*(kind==="roger"?1.15:1);
 h.img.src=kind==="roger"?"img/roger-whack.webp?v=2":"creature/img/"+CRE[Math.floor(Math.random()*CRE.length)]+".webp?v=7";
 h.mob.className="mob"+(kind==="gold"?" gold":kind==="roger"?" rog":"");h.el.dataset.kind=kind;h.el.classList.add("up");}
function hide(h){h.kind=null;h.el.classList.remove("up");delete h.el.dataset.kind}
function loop(ts){raf=requestAnimationFrame(loop);if(!running||paused){last=ts;return}
 var dt=Math.min(100,ts-(last||ts));last=ts;gt+=dt;
 holes.forEach(function(h){if(h.kind&&!h.hit&&gt>=h.until){if(h.kind!=="roger"){streak=0;var s=$("streak");s.classList.remove("miss");void s.offsetWidth;s.classList.add("miss");snd("miss");render()}hide(h)}});
 if(gt>=nextSpawn){spawn();nextSpawn=gt+gap()*(.7+Math.random()*.6)}}
function fx(h,txt,cls){var p=document.createElement("div");p.className="pop"+(cls?" "+cls:"");p.textContent=txt;h.el.appendChild(p);var d=document.createElement("div");d.className="dz";d.textContent="\uD83D\uDCAB";h.el.appendChild(d);setTimeout(function(){p.remove();d.remove()},750)}
function whack(h){if(!running||paused||!h.kind||h.hit)return;h.hit=true;var k=h.kind;
 h.mob.classList.remove("bonk");void h.mob.offsetWidth;h.mob.classList.add("bonk");
 if(k==="roger"){h.mob.classList.remove("bonk");h.mob.classList.add("shake");snd("roger");setTimeout(function(){gameOver()},380);running=false;return}
 hits++;h.el.dataset.kind="hit";if(k==="gold"){streak++;score+=3;snd("gold");fx(h,"+3","g")}else{streak++;score+=1;snd("bonk");fx(h,"+1")}
 if(streak>runBest)runBest=streak;if(streak>best){best=streak;localStorage.setItem("kn-whack-best",best)}
 render();setTimeout(function(){if(h.hit)hide(h)},260)}
holes.forEach(function(h){h.el.addEventListener("pointerdown",function(e){e.preventDefault();whack(h)})});
board.addEventListener("touchmove",function(e){e.preventDefault()},{passive:false});
function start(){holes.forEach(hide);spawns=0;streak=0;runBest=0;score=0;hits=0;gt=0;nextSpawn=400;submitted=false;paused=false;running=true;last=0;render();
 $("start").hidden=true;$("over").hidden=true;document.documentElement.classList.add("playing");$("quit").hidden=false;window.scrollTo(0,0);snd("tick")}
function gameOver(q){running=false;$("quit").hidden=true;$("sb").hidden=true;paused=false;$("ovT").textContent=q?"Run over.":"You bonked Roger.";document.documentElement.classList.remove("playing");holes.forEach(hide);
 $("fS").textContent=score;$("fB").textContent=runBest;$("pb").textContent="Best streak ever: "+best;$("err").textContent="";
 var txt="I scored "+score+" (best streak "+best+") in Whack-a-Creature by @kitsuranines before bonking Roger \uD83E\uDD8A";
 $("share").href="https://x.com/intent/post?text="+encodeURIComponent(txt)+"&url="+encodeURIComponent("https://kitsuranines.com/whack/");
 $("over").hidden=false;$("saved").textContent="";loadBoard(function(list){if(score>0&&!submitted&&qualifies(list,score)){$("nmS").textContent=score;$("nm").value="";$("err").textContent="";$("nmOv").hidden=false;try{$("nm").focus({preventScroll:true})}catch(e){}}})}
function closeNm(){$("nmOv").hidden=true}
function closeOver(){$("over").hidden=true;$("nmOv").hidden=true;holes.forEach(hide);$("start").hidden=false}
$("ovX").onclick=closeOver;$("over").addEventListener("click",function(e){if(e.target===this)closeOver()});
$("nmX").onclick=closeNm;$("quit").onclick=function(){if(running){holes.forEach(hide);gameOver(1)}};
$("play").onclick=start;$("again").onclick=start;
// scoreboard overlay pauses play
function openSB(){if(running)paused=true;$("sb").hidden=false;loadBoard()}
function closeSB(){$("sb").hidden=true;paused=false;last=0}
$("sbBtn").onclick=openSB;$("sbStart").onclick=openSB;$("sbX").onclick=closeSB;$("sbC").onclick=closeSB;
$("sb").addEventListener("click",function(e){if(e.target===this)closeSB()});
document.addEventListener("keydown",function(e){if(e.key==="Escape"){if(!$("nmOv").hidden)closeNm();else if(!$("sb").hidden)closeSB();else if(!$("over").hidden)closeOver()}});
document.addEventListener("visibilitychange",function(){if(document.hidden&&running)openSB()});
// name rules
var BAD=["fuck","fuk","fuq","fck","fcuk","phuck","motherfuck","shit","shite","sht","cunt","kunt","bitch","biatch","btch","niga","nigr","nigur","niger","nigah","negro","fag","faggot","slut","whore","hoe","dick","dik","cock","cok","pussy","pusy","penis","vagina","vulva","clit","rape","rapist","molest","pedo","paedo","nazi","hitler","heil","retard","tard","kike","spic","spick","chink","gook","wetback","beaner","tranny","shemale","twat","wank","wanker","jizz","porn","sex","boob","tits","titty","anal","anus","asshole","arse","arsehole","bastard","dyke","coon","jigaboo","raghead","towelhead","kys","killyourself","suicide","bollock","bugger","prick","skank","thot","milf","dildo","cum","semen","orgasm","horny","nude","naked","blowjob","handjob","rimjob","boner","erect","scrotum","testicle","incest","bestiality","nightowl","nitowl","niteowl"];
var WEAK=["ass","hoe","cum","tit","tits","fag","sex","anal","anus","dik","cok","sht","fck","tard","coon","spic","heil","nude","kys","erect","prick","bugger","semen"];
var ALLOW=["class","glass","grass","brass","bass","pass","mass","lass","assassin","assist","assess","asset","assum","cassi","embarrass","scrap","scunthorpe","dickens","dickinson","cocktail","cockpit","peacock","hancock","shitake","shiitake","cucumber","circum","document","scum","therapist","grape","drape","sussex","essex","middlesex","analys","canal","banal","titan","title","titl","petit","constitut","hoed","shoe","hoes","coonhound","raccoon","cocoon","tycoon","spice","spicy","hello","shell","skills","pussycat","japan","manuscript","therapi","scrape","grapefruit","specific"];
function base(s){return String(s).normalize("NFD").replace(/[\u0300-\u036f\u200b-\u200f\u2060\ufeff]/g,"").toLowerCase()}
function leet(s,one){return s.replace(/0/g,"o").replace(/1/g,one).replace(/[|!]/g,"i").replace(/3/g,"e").replace(/[4@]/g,"a").replace(/[5$]/g,"s").replace(/7/g,"t").replace(/8/g,"b").replace(/9/g,"g").replace(/\+/g,"t")}
function sq(s){return s.replace(/[^a-z]/g,"").replace(/(.)\1+/g,"$1")}
var BADN=BAD.map(sq),WEAKN=WEAK.map(sq),ALLOWN=ALLOW.map(sq);
function norm(s){return sq(leet(base(s),"i"))}
function isBad(n){var b=base(n),hit=false;
 ["i","l"].forEach(function(one){var l=leet(b,one),w=sq(l);
  var toks=l.split(/[^a-z]+/).map(sq).filter(Boolean);toks.push(w);
  if(toks.some(function(t){return WEAKN.indexOf(t)>=0}))hit=true;
  ALLOWN.forEach(function(a){w=w.split(a).join("~")});
  if(BADN.some(function(x){return WEAKN.indexOf(x)<0&&w.indexOf(x)>=0}))hit=true;
  if(/k{3,}/.test(l.replace(/[^a-z]/g,""))||/n+i+(g+h*)?t+e*o+w+l/.test(w)||/n+[iy]+t+e*o+w+l/.test(w))hit=true});
 return hit}
function nameOk(n){if(typeof n!=="string"||n.length>12||!/^[A-Za-z0-9 _-]{1,12}$/.test(n)||!n.trim())return false;return !isBad(n)}
function clean(d){var s=d&&d.data&&Array.isArray(d.data.s)?d.data.s:[];return s.filter(function(r){return Array.isArray(r)&&nameOk(r[0])&&Number.isInteger(r[1])&&r[1]>0&&r[1]<=MAXS}).sort(function(a,b){return b[1]-a[1]}).slice(0,10)}
function qualifies(list,sc){return sc>0&&sc<=MAXS&&(list.length<10||sc>list[list.length-1][1])}
var cache=null,mine=null;
function draw(list,msg){["1","2","3"].forEach(function(k){var ol=$("lb"+k);ol.textContent="";list.forEach(function(r){var li=document.createElement("li");var a=document.createElement("span");a.textContent=r[0];var b=document.createElement("span");b.textContent=r[1];li.appendChild(a);li.appendChild(b);if(mine&&r[0]===mine[0]&&r[1]===mine[1])li.className="me";ol.appendChild(li)});$("lbm"+k).textContent=msg||(list.length?"":"No scores yet. Be the first.")})}
function fetchBoard(){var c=new AbortController();setTimeout(function(){c.abort()},6000);return fetch(API,{signal:c.signal,cache:"no-store"}).then(function(r){if(!r.ok)throw 0;return r.json()}).then(clean)}
function loadBoard(cb){if(cache)draw(cache);fetchBoard().then(function(l){cache=l;draw(l);cb&&cb(l)}).catch(function(){draw(cache||[],"Scoreboard is offline right now. Your best streak is saved on this device.");cb&&cb(cache||[])})}
$("nmF").addEventListener("submit",function(e){e.preventDefault();if(submitted)return;var n=$("nm").value.trim().replace(/\s+/g," ");
 if(!nameOk(n)){$("err").textContent="Use 1-12 letters, numbers, spaces, _ or -. Keep it friendly.";return}
 if(score<=0||score>MAXS){$("err").textContent="That score can't be saved.";return}
 submitted=true;$("err").textContent="Saving...";var sc=score;
 fetchBoard().then(function(l){l.push([n,sc]);l.sort(function(a,b){return b[1]-a[1]});l=l.slice(0,10);
  return fetch(API,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:"kn-whack",data:{s:l}})}).then(function(r){if(!r.ok)throw 0;mine=[n,sc];cache=l;draw(l);closeNm();$("saved").textContent="Saved to the scoreboard as "+n+"!"})})
 .catch(function(){$("err").textContent="Couldn't reach the scoreboard. Your best is still saved here."})});
loadBoard();requestAnimationFrame(loop);
})();
