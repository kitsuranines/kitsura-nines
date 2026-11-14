(function(){
var a=document.getElementById("watchNav");if(!a)return;var t=a.querySelector(".ltxt");
function set(on){a.classList.toggle("live",on);t.textContent=on?"LIVE NOW":"Watch Live";a.setAttribute("aria-label",on?"Nines is live now. Watch live":"Watch live")}
function to(u,ms){var c=new AbortController();setTimeout(function(){c.abort()},ms||8000);return fetch(u,{signal:c.signal,cache:"no-store"})}
function twitch(){return to("https://decapi.me/twitch/uptime/kitsuranines?t="+Date.now()).then(function(r){if(!r.ok)throw 0;return r.text()}).then(function(x){x=x.toLowerCase();if(/offline|error|not found|invalid/.test(x))return false;return/\d+\s*(second|minute|hour|day)/.test(x)})}
function kick(){return to("https://kick.com/api/v2/channels/kitsuranines").then(function(r){if(!r.ok)throw 0;return r.json()}).then(function(j){return!!(j&&j.livestream&&j.livestream.is_live!==false)})}
function check(){var done=false;function hit(v){if(v&&!done){done=true;set(true)}}
 var p1=twitch().catch(function(){return false}),p2=kick().catch(function(){return false});p1.then(hit);p2.then(hit);
 Promise.all([p1,p2]).then(function(r){if(!r[0]&&!r[1])set(false)})}
check();setInterval(function(){if(!document.hidden)check()},12e4);
})();
