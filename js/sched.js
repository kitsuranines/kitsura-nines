(function(){
var TZ='America/Toronto';
function off(d){var p={};new Intl.DateTimeFormat('en-US',{timeZone:TZ,hourCycle:'h23',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit'}).formatToParts(d).forEach(function(x){p[x.type]=x.value});
 return Date.UTC(+p.year,+p.month-1,+p.day,+p.hour%24,+p.minute,+p.second)-Math.floor(d.getTime()/1000)*1000}
function inst(dow,h,m){var now=new Date(),p={};new Intl.DateTimeFormat('en-US',{timeZone:TZ,year:'numeric',month:'2-digit',day:'2-digit',weekday:'short'}).formatToParts(now).forEach(function(x){p[x.type]=x.value});
 var wd=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].indexOf(p.weekday),add=(dow-wd+7)%7;
 var g=Date.UTC(+p.year,+p.month-1,+p.day+add,h,m);var t=g-off(new Date(g));return new Date(g-off(new Date(t)))}
try{var cards=document.querySelectorAll('.sch[data-dow]');if(!cards.length)return;
 var fd=new Intl.DateTimeFormat(undefined,{weekday:'short'}),ft=new Intl.DateTimeFormat(undefined,{hour:'numeric',minute:'2-digit'}),fz=new Intl.DateTimeFormat(undefined,{hour:'numeric',timeZoneName:'short'});
 cards.forEach(function(c){var hm=c.dataset.t.split(':'),d=inst(+c.dataset.dow,+hm[0],+hm[1]);
  c.querySelector('.day').textContent=fd.format(d);c.querySelector('small').textContent=ft.format(d)});
 var z='';fz.formatToParts(new Date()).forEach(function(x){if(x.type==='timeZoneName')z=x.value});
 var n=document.getElementById('tzn');if(n)n.textContent='Times are shown in your time zone'+(z?' ('+z+')':'')+'.';
}catch(e){}
})();
