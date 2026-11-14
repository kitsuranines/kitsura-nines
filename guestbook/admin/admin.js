(function(){
var $=function(i){return document.getElementById(i)},S=crypto.subtle,priv=null,idx=[],BK="kn_gb_adm_idx";
function st(t,err){$("st").textContent=t||"";$("st").className=err?"err":""}
function busy(on){document.querySelectorAll("#app button").forEach(function(b){b.disabled=on})}
$("lf").addEventListener("submit",function(e){e.preventDefault();var pw=$("pw").value;$("lb").disabled=true;$("lm").textContent="Checking...";
 fetch("guestbook/admin/k.json?t="+Date.now(),{cache:"no-store"}).then(function(r){return r.json()}).then(function(k){
  return S.importKey("raw",GB.te.encode(pw),"PBKDF2",false,["deriveKey"]).then(function(b){return S.deriveKey({name:"PBKDF2",salt:GB.ub64(k.salt),iterations:k.it,hash:"SHA-256"},b,{name:"AES-GCM",length:256},false,["decrypt"])})
  .then(function(a){return S.decrypt({name:"AES-GCM",iv:GB.ub64(k.iv)},a,GB.ub64(k.ct))})
  .then(function(p){return S.importKey("pkcs8",p,{name:"ECDSA",namedCurve:"P-256"},false,["sign"])})})
 .then(function(key){priv=key;$("pw").value="";$("login").style.display="none";$("app").style.display="block";$("lm").textContent="";load()})
 .catch(function(){$("lm").textContent="Wrong password.";$("lm").className="err"}).then(function(){$("lb").disabled=false})});
$("lo").onclick=function(){priv=null;location.reload()};
$("rf").onclick=function(){load()};
function fmt(t){try{return new Date(t).toLocaleString()}catch(e){return""}}
function item(d,acts){var w=document.createElement("div");w.className="item";var h=document.createElement("div");
 var n=document.createElement("span");n.className="n";n.textContent=d.n||"(unreadable entry)";h.appendChild(n);
 if(d.t){var t=document.createElement("span");t.className="d";t.textContent=fmt(d.t);h.appendChild(t)}
 if(d.n&&(GB.textBad(d.n)||GB.textBad(d.m)||GB.check(d.n,d.m).err)){var f=document.createElement("span");f.className="flag";f.textContent="filter flagged";h.appendChild(f)}
 w.appendChild(h);var m=document.createElement("p");m.className="m";m.textContent=d.m||"";w.appendChild(m);
 var a=document.createElement("div");a.className="acts";acts.forEach(function(x){var b=document.createElement("button");b.type="button";b.className=x[1];b.textContent=x[0];b.onclick=function(){x[2](b)};a.appendChild(b)});w.appendChild(a);return w}
function readIndex(){return GB.loadIndex().then(function(r){idx=r.list;try{localStorage.setItem(BK,JSON.stringify(idx))}catch(e){}return idx}).catch(function(){
 var b=null;try{b=JSON.parse(localStorage.getItem(BK)||"null")}catch(e){}
 if(b){idx=b;st("The saved approved list didn't verify, so this device's last good copy is used. Approving or removing anything will re-save it.",1);return idx}
 throw new Error("The approved list couldn't be verified. Refresh to try again.")})}
function writeIndex(list){list=list.slice().sort(function(a,b){return a.id<b.id?1:-1});var sh=[];for(var i=0;i<list.length;i+=GB.IXP)sh.push(GB.fmtIdx(list.slice(i,i+GB.IXP))||"0");
 var vals=sh.map(function(x){return x||"0"});
 return Promise.all(vals.map(function(v,i){return GB.put("gba"+i,v)})).then(function(){
  var n=vals.length.toString(36),ts=Date.now().toString(36);
  var signed=vals.map(function(v){return v=="0"?"":v});
  return S.sign({name:"ECDSA",hash:"SHA-256"},priv,GB.te.encode(GB.sigMsg(n,ts,signed))).then(function(sig){return GB.put("gbas",n+"~"+ts+"~"+GB.b64u(sig))})})
 .then(function(){idx=list;try{localStorage.setItem(BK,JSON.stringify(list))}catch(e){}})}
function dropPending(e){var k="gbp"+e.s;return GB.get(k).then(function(v){var l=GB.parsePend(v).filter(function(x){return x.id!==e.id});return GB.put(k,GB.fmtPend(l)||"0")})}
function blank(e){var ps=[];for(var i=0;i<e.c;i++)ps.push(GB.put("gbe"+e.id+i,"0"));return Promise.all(ps)}
function act(b,fn,done){if(!priv)return;busy(true);st("Saving...");fn().then(function(){st(done)}).catch(function(er){st(er.message||"Something went wrong. Try again.",1)}).then(function(){busy(false);load(true)})}
function load(quiet){if(!priv)return;if(!quiet)st("Loading...");busy(true);
 var ks=[];for(var i=0;i<GB.PS;i++)ks.push(GB.get("gbp"+i));
 Promise.all([Promise.all(ks),readIndex()]).then(function(r){
  var pend=[];r[0].forEach(function(v,s){GB.parsePend(v).forEach(function(e){e.s=s;pend.push(e)})});
  pend=pend.filter(function(e){return!idx.some(function(a){return a.id===e.id})});pend.sort(function(a,b){return a.id<b.id?1:-1});
  return Promise.all([Promise.all(pend.map(function(e){return GB.fetchRaw(e).then(function(raw){var d;try{d=GB.decodeEntry(e.id,raw)}catch(x){d={}}e.raw=raw;return d}).catch(function(){return{}})})),
   Promise.all(idx.map(function(e){return GB.fetchRaw(e).then(function(raw){return GB.sha(raw).then(function(h){if(h!==e.h)return{m:"(this entry's text was changed after approval, so it's hidden on the public page)"};return GB.decodeEntry(e.id,raw)})}).catch(function(){return{}})}))]).then(function(ds){
   var P=$("pend"),Q=$("appr");P.innerHTML="";Q.innerHTML="";$("pc").textContent=pend.length;$("ac").textContent=idx.length;
   if(!pend.length)P.innerHTML='<p class="empty">Nothing waiting. 🐾</p>';
   pend.forEach(function(e,i){var d=ds[0][i];var acts=[["Deny","no",function(b){if(!confirm("Deny and delete this note?"))return;act(b,function(){return blank(e).then(function(){return dropPending(e)})},"Denied and deleted.")}]];
    if(d.n)acts.unshift(["Approve","ok",function(b){act(b,function(){return GB.fetchRaw(e).then(function(raw){if(raw!==e.raw)throw new Error("That note changed since you loaded it. Refresh and check it again.");return GB.sha(raw)}).then(function(h){return readIndex().then(function(){var l=idx.filter(function(x){return x.id!==e.id});l.push({id:e.id,c:e.c,h:h});return writeIndex(l)})}).then(function(){return dropPending(e)})},"Approved! It's on the guest book now.")}]);
    P.appendChild(item(d,acts))});
   if(!idx.length)Q.innerHTML='<p class="empty">No approved notes yet.</p>';
   idx.forEach(function(e,i){Q.appendChild(item(ds[1][i],[["Remove","no",function(b){if(!confirm("Remove this note from the guest book?"))return;act(b,function(){return readIndex().then(function(){return writeIndex(idx.filter(function(x){return x.id!==e.id}))}).then(function(){return blank(e)})},"Removed.")}]]))});
   if(!quiet)st("")})}).catch(function(er){st(er.message||"Couldn't load. Try Refresh.",1)}).then(function(){busy(false)})}
})();
