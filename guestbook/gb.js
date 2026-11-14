/* Kitsura Nines guest book core. Approved list is signed by Nines' admin key; public page only shows verified entries. */
(function(){
var KV="https://keyvalue.immanuel.co/api/KeyVal/",A="i8hhljmq",CH=190,MAXC=10,PS=8,PSMAX=15,IXP=8;
var PUB={"kty":"EC","crv":"P-256","x":"mqytaa2cI3ybnXc57mVuF1WHOlJiBx798Ta1F8cE0Ik","y":"_97PphK-HBd3gWysEZqHqq9APE4SVnuNKpMHmJJlT1k"};
var BAD=["fuck","fuk","fuq","fck","fcuk","phuck","motherfuck","shit","shite","sht","cunt","kunt","bitch","biatch","btch","negro","fag","faggot","slut","whore","hoe","dick","dik","cock","cok","pussy","pusy","penis","vagina","vulva","clit","rape","rapist","molest","pedo","paedo","nazi","hitler","heil","retard","tard","kike","spic","spick","chink","gook","wetback","beaner","tranny","shemale","twat","wank","wanker","jizz","porn","sex","boob","tits","titty","anal","anus","asshole","arse","arsehole","bastard","dyke","coon","jigaboo","raghead","towelhead","kys","killyourself","suicide","bollock","bugger","prick","skank","thot","milf","dildo","cum","semen","orgasm","horny","nude","naked","blowjob","handjob","rimjob","boner","erect","scrotum","testicle","incest","bestiality","nightowl","nitowl","niteowl"];
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
var HG={"\u0430":"a","\u0435":"e","\u0451":"e","\u0456":"i","\u0457":"i","\u0458":"j","\u043e":"o","\u0440":"p","\u0441":"c","\u0443":"y","\u0445":"x","\u043a":"k","\u0433":"r","\u0501":"d","\u050d":"g","\u0261":"g","\u03b9":"i","\u03bf":"o","\u03b1":"a","\u03b5":"e","\u03ba":"k","\u03bd":"v","\u0131":"i","\u0269":"i","\u0274":"n","\u0578":"n","\u057c":"n"};
function slur(n){if(/14\D*88/.test(String(n)))return true;var b=base(n).replace(/[^\x00-\x7f]/g,function(c){return HG[c]||c});var out=false;
 ["i","l"].forEach(function(one){var l=leet(b,one).replace(/6/g,"g").replace(/[^a-z]/g,"").replace(/nikki|nikky/g,"~");
  [l,l.replace(/[jy]/g,"i").replace(/q/g,"g").replace(/kk/g,"gg")].forEach(function(v){
   var a=v.replace(/nigerians?|nigeria|nigella|nigel|niger(?!r)|knights?|nights?/g,"~");var w=sq(a.replace(/~/g,"-")),r=w.split("").reverse().join("");
   if(/nig|nyg|nikk|niba|nibe|n[ie]+gr|negro|kneg|nega|neger|nigra/.test(w)||/nikk/.test(a))out=true;
   if(/fag|fgt|phag|fagot|fegit|fegot|fagit|fgot|fayg|fejg|faget/.test(w))out=true;
   if(/^(regin|agin|ragin|togaf|tagaf|gaf)$/.test(w))out=true;
   if(/troon|heeb/.test(v)||/troon|trany|tranie|shemale|ladyboy|kike|kyke|heeb|hymie|jewboy|zog|nazi|natzi|hitler|hitla|siegh|sieg|whitepow|wpww|gasthe|holohoax|groyp/.test(w))out=true});
 });return out}
var LINK=/https?:|www\.|\b[a-z0-9-]+\.(com|net|org|gg|ly|io|xyz|ru|co|me|tv|link|site|app|dev|info|biz|top|click)\b/i;
var OWL=/n+i+(g+h*)?t+e*o+w+l|n+[iy]+t+e*o+w+l/;
function textBad(s){s=String(s||"");if(/14\D{0,3}88/.test(s))return true;var t=s.split(/\s+/).filter(Boolean);
 for(var i=0;i<t.length;i++){if(isBad(t[i])||slur(t[i]))return true;if(i&&OWL.test(norm(t[i-1]+t[i])))return true}
 return false}
function cleanText(s,max){return String(s||"").replace(/[\u0000-\u0009\u000b-\u001f\u007f\u202a-\u202e\u2066-\u2069]/g,"").replace(/\n{3,}/g,"\n\n").replace(/[ \t]+/g," ").trim().slice(0,max)}
function check(name,msg){name=cleanText(name.replace(/\n/g," "),24);msg=cleanText(msg,300);
 if(!name)return{err:"Add your name first."};if(!msg)return{err:"Write a little note first."};
 if(LINK.test(name)||LINK.test(msg))return{err:"No links please. Just words!"};
 if(textBad(name))return{err:"That name isn't allowed. Try another one."};
 if(textBad(msg))return{err:"Some of those words aren't allowed here. Try rewording it."};
 return{n:name,m:msg}}
var te=new TextEncoder(),td=new TextDecoder();
function b64u(bytes){var s="";bytes=new Uint8Array(bytes);for(var i=0;i<bytes.length;i++)s+=String.fromCharCode(bytes[i]);return btoa(s).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"")}
function ub64(s){s=s.replace(/-/g,"+").replace(/_/g,"/");var b=atob(s+"===".slice((s.length+3)%4)),o=new Uint8Array(b.length);for(var i=0;i<b.length;i++)o[i]=b.charCodeAt(i);return o}
var SAFE=/^[A-Za-z0-9_~-]{1,200}$/;
function get(k,n){n=n||0;return get1(k).catch(function(e){if(n<3)return new Promise(function(r){setTimeout(r,400+600*n)}).then(function(){return get(k,n+1)});throw e})}
function get1(k){return fetch(KV+"GetValue/"+A+"/"+k+"?t="+Date.now()+Math.random().toString(36).slice(2,6),{cache:"no-store"}).then(function(r){return r.text().then(function(t){
 if(!r.ok){if(t.indexOf("DBNull")>=0)return"";throw new Error("kv "+r.status)}
 var v;try{v=JSON.parse(t)}catch(e){v=t}v=String(v==null?"":v).replace(/^"|"$/g,"");return v=="0"?"":v})})}
function put(k,v){v=v||"0";if(!SAFE.test(v))return Promise.reject(new Error("bad value"));
 var n=0;return(function go(){return fetch(KV+"UpdateValue/"+A+"/"+k+"/"+v,{method:"POST"}).then(function(r){if(!r.ok)throw 0;return r.text()}).then(function(t){if(t.indexOf("true")<0)throw 0}).catch(function(){if(++n<3)return new Promise(function(r){setTimeout(r,500*n)}).then(go);throw new Error("Couldn't save. An ad blocker might be in the way.")})})()}
function sha(s){return crypto.subtle.digest("SHA-256",te.encode(s)).then(function(h){return b64u(h).slice(0,11)})}
function newId(){return Date.now().toString(36).padStart(8,"0")+Math.random().toString(36).slice(2,4).padEnd(2,"0")}
var IDR=/^[0-9a-z]{10}$/;
function parsePend(v){return(v||"").split("~").filter(function(x){return/^[0-9a-z]{10}[1-9]$/.test(x)||/^[0-9a-z]{10}10$/.test(x)}).map(function(x){return{id:x.slice(0,10),c:parseInt(x.slice(10),10)}})}
function fmtPend(l){return l.map(function(e){return e.id+e.c}).join("~")}
function parseIdx(v){return(v||"").split("~").filter(function(x){return/^[0-9a-z]{10}[0-9][A-Za-z0-9_-]{11}$/.test(x)}).map(function(x){return{id:x.slice(0,10),c:+x[10]||10,h:x.slice(11)}})}
function fmtIdx(l){return l.map(function(e){return e.id+(e.c%10)+e.h}).join("~")}
function sigMsg(n,ts,sh){return"kngb1|"+n+"|"+ts+"|"+sh.join("|")}
var pubKey=null;function getPub(){return pubKey||(pubKey=crypto.subtle.importKey("jwk",PUB,{name:"ECDSA",namedCurve:"P-256"},false,["verify"]))}
// signed approved index: returns {list, raw} or throws "tampered"
function loadIndex(){return get("gbas").then(function(s){if(!s)return{list:[],ok:true};var p=s.split("~");if(p.length!==3)throw new Error("tampered");
 var n=parseInt(p[0],36);if(!(n>=0&&n<=60))throw new Error("tampered");var ks=[];for(var i=0;i<n;i++)ks.push(get("gba"+i));
 return Promise.all(ks).then(function(sh){return getPub().then(function(k){return crypto.subtle.verify({name:"ECDSA",hash:"SHA-256"},k,ub64(p[2]),te.encode(sigMsg(p[0],p[1],sh)))}).then(function(ok){if(!ok)throw new Error("tampered");
  var l=[];sh.forEach(function(x){l=l.concat(parseIdx(x))});l.sort(function(a,b){return a.id<b.id?1:-1});return{list:l,ok:true}})})})}
function loadIndexRetry(){return loadIndex().catch(function(e){return new Promise(function(r){setTimeout(r,1500)}).then(loadIndex)})}
function decodeEntry(id,b64){var o=JSON.parse(td.decode(ub64(b64)));if(typeof o.n!=="string"||typeof o.m!=="string"||typeof o.t!=="number")throw 0;return{id:id,n:o.n.slice(0,24),m:o.m.slice(0,300),t:o.t}}
function fetchRaw(e){var ks=[];for(var i=0;i<e.c;i++)ks.push(get("gbe"+e.id+i));return Promise.all(ks).then(function(p){return p.join("")})}
function loadEntry(e){var ck="kngb_"+e.id+e.h;try{var c=localStorage.getItem(ck);if(c)return Promise.resolve(JSON.parse(c))}catch(x){}
 return fetchRaw(e).then(function(raw){return sha(raw).then(function(h){if(h!==e.h)return null;var d=decodeEntry(e.id,raw);try{localStorage.setItem(ck,JSON.stringify(d))}catch(x){}return d})}).catch(function(){return null})}
function submit(name,msg){var v=check(name,msg);if(v.err)return Promise.reject(new Error(v.err));
 var raw=b64u(te.encode(JSON.stringify({n:v.n,m:v.m,t:Date.now()}))),id=newId(),parts=[];for(var i=0;i<raw.length;i+=CH)parts.push(raw.slice(i,i+CH));
 if(parts.length>MAXC)return Promise.reject(new Error("That note is a bit too long. Try trimming it."));
 return Promise.all(parts.map(function(p,i){return put("gbe"+id+i,p)})).then(function(){
  var tries=0,start=Math.floor(Math.random()*PS);
  return(function attempt(){var sh=(start+tries)%PS,key="gbp"+sh;return get(key).then(function(v){var l=parsePend(v);if(l.length>=PSMAX){throw"full"}l.push({id:id,c:parts.length});return put(key,fmtPend(l))}).then(function(){return get(key)}).then(function(v){if(parsePend(v).some(function(e){return e.id===id}))return id;throw"race"}).catch(function(e){if(++tries<PS)return new Promise(function(r){setTimeout(r,300+Math.random()*700)}).then(attempt);throw new Error("The guest book is extra busy right now. Try again in a bit.")})})()})}
window.GB={get:get,put:put,check:check,textBad:textBad,submit:submit,loadIndex:loadIndex,loadIndexRetry:loadIndexRetry,loadEntry:loadEntry,fetchRaw:fetchRaw,decodeEntry:decodeEntry,sha:sha,parsePend:parsePend,fmtPend:fmtPend,parseIdx:parseIdx,fmtIdx:fmtIdx,sigMsg:sigMsg,b64u:b64u,ub64:ub64,PS:PS,IXP:IXP,te:te};
})();
