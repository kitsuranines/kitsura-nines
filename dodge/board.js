/* Global top-10 scoreboard for Dodge the Wires.
   Same KeyVal backend and name rules as Whack-a-Creature,
   but a SEPARATE key so the two games never share data.

   Live (kitsuranines.com):  account i8hhljmq, key kdodgetop
   Mock / local / preview:   account i8hhljmq, key kdodgetest
   Never writes to Whack's key (kwtop) or to kdodgetop off the live host. */
(function (w) {
  var KV = "https://keyvalue.immanuel.co/api/KeyVal/";
  var KVA = "i8hhljmq";
  var LIVE_KEY = "kdodgetop";
  var TEST_KEY = "kdodgetest";
  var MAXS = 999999;
  var STUB = [
    { n: "Nines", s: 1840 },
    { n: "Roger", s: 1510 },
    { n: "Hollow", s: 1288 },
    { n: "Amber", s: 974 },
    { n: "Static", s: 810 },
    { n: "Fox", s: 640 },
    { n: "Wire", s: 505 },
    { n: "CRT", s: 388 },
    { n: "Paw", s: 260 },
    { n: "Sparks", s: 140 }
  ];

  function isLiveHost() {
    var h = (location.hostname || "").toLowerCase();
    return h === "kitsuranines.com" || h === "www.kitsuranines.com";
  }
  function useStub() {
    if (w.__dodgeForceStub) return true;
    var h = (location.hostname || "").toLowerCase();
    if (h === "localhost" || h === "127.0.0.1" || h === "") return true;
    if (location.protocol === "file:") return true;
    return false;
  }
  function boardKey() { return isLiveHost() ? LIVE_KEY : TEST_KEY; }

  var board = [];
  var pendingScore = 0;

  function enc(a) {
    try {
      return btoa(a.map(function (x) { return x.n + ":" + x.s; }).join("|"))
        .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    } catch (e) { return ""; }
  }
  function dec(s) {
    if (!s) return [];
    try {
      s = String(s).replace(/-/g, "+").replace(/_/g, "/");
      while (s.length % 4) s += "=";
      return atob(s).split("|").map(function (p) {
        var i = p.lastIndexOf(":");
        if (i < 1) return null;
        var n = p.slice(0, i), v = +p.slice(i + 1);
        return n && isFinite(v) ? { n: n, s: Math.min(MAXS, Math.max(0, v | 0)) } : null;
      }).filter(Boolean);
    } catch (e) { return []; }
  }
  function tidy(a) {
    var m = {}, o = [];
    (a || []).forEach(function (x) {
      if (!x || !nameOk(x.n) || !isFinite(x.s) || x.s < 0) return;
      var k = x.n.toLowerCase();
      var s = Math.min(MAXS, Math.max(0, x.s | 0));
      if (!m[k] || s > m[k].s) m[k] = { n: x.n, s: s };
    });
    for (var k in m) o.push(m[k]);
    o.sort(function (a, b) { return b.s - a.s || a.n.localeCompare(b.n); });
    return o.slice(0, 10);
  }

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
function nameOk(n){if(typeof n!=="string"||n.length>12||!/^[A-Za-z0-9 _-]{1,12}$/.test(n)||!n.trim())return false;return !isBad(n)&&!slur(n)}

  function draw(list) {
    var rows = list || [];
    var msg = rows.length ? "" : "No scores yet. Be the first.";
    ["1", "2", "3"].forEach(function (k) {
      var ol = document.getElementById("lb" + k);
      if (!ol) return;
      ol.textContent = "";
      rows.forEach(function (x) {
        var li = document.createElement("li");
        var a = document.createElement("span"); a.textContent = x.n;
        var b = document.createElement("span"); b.textContent = String(x.s);
        li.appendChild(a); li.appendChild(b);
        ol.appendChild(li);
      });
      var m = document.getElementById("lbm" + k);
      if (m) m.textContent = msg;
    });
  }

  function getBoard() {
    if (useStub()) {
      board = STUB.slice();
      draw(board);
      return Promise.resolve(board);
    }
    var url = KV + "GetValue/" + KVA + "/" + boardKey() + "?t=" + Date.now();
    return fetch(url, { cache: "no-store" }).then(function (r) { return r.text(); })
      .then(function (t) {
        t = (t || "").replace(/^"|"$/g, "");
        board = tidy(dec(t));
        draw(board);
        return board;
      }).catch(function () { draw(board); return board; });
  }

  function putBoard(next) {
    if (useStub()) {
      board = tidy(next);
      draw(board);
      return Promise.resolve(true);
    }
    // Refuse writes to the live key off the live host, and never touch Whack's key.
    if (boardKey() === "kwtop") return Promise.resolve(false);
    if (boardKey() === LIVE_KEY && !isLiveHost()) return Promise.resolve(false);
    var url = KV + "UpdateValue/" + KVA + "/" + boardKey() + "/" + enc(tidy(next));
    return fetch(url, { method: "POST", cache: "no-store" }).then(function (r) { return r.ok; })
      .catch(function () { return false; });
  }

  function qualifies(score) {
    if (!isFinite(score) || score <= 0) return false;
    if (!board || board.length < 10) return true;
    return score > board[board.length - 1].s;
  }

  function show(id, on) {
    var el = document.getElementById(id);
    if (el) el.hidden = !on;
  }

  function onOver(score) {
    pendingScore = score | 0;
    getBoard().then(function () {
      var q = qualifies(pendingScore);
      var ns = document.getElementById("nmS");
      if (ns) ns.textContent = String(pendingScore);
      var wrap = document.getElementById("nmWrap");
      if (wrap) wrap.hidden = !q;
      if (q) {
        setTimeout(function () {
          var inp = document.getElementById("nm");
          if (inp) try { inp.focus(); } catch (e) {}
        }, 80);
      }
    });
  }

  function submitName(raw) {
    var n = String(raw || "").trim().replace(/\s+/g, " ");
    var err = document.getElementById("err");
    if (!nameOk(n)) {
      if (err) { err.hidden = false; err.textContent = "Use 1–12 letters, numbers, spaces, _ or -. Keep it friendly."; }
      return;
    }
    if (err) { err.hidden = true; err.textContent = ""; }
    var next = board.concat([{ n: n, s: pendingScore }]);
    putBoard(next).then(function () { return getBoard(); }).then(function () {
      show("nmOv", false);
      var wrap = document.getElementById("nmWrap");
      if (wrap) wrap.hidden = true;
      var inp = document.getElementById("nm");
      if (inp) inp.value = "";
    });
  }

  function bind() {
    var f = document.getElementById("nmF");
    if (f) f.addEventListener("submit", function (e) {
      e.preventDefault();
      submitName((document.getElementById("nm") || {}).value || "");
    });
    var sk = document.getElementById("nmSkip");
    if (sk) sk.addEventListener("click", function () { show("nmOv", false); var w=document.getElementById("nmWrap"); if(w) w.hidden=true; });
    var nx = document.getElementById("nmX");
    if (nx) nx.addEventListener("click", function () { show("nmOv", false); var w=document.getElementById("nmWrap"); if(w) w.hidden=true; });
    var sbBtn = document.getElementById("sbBtn");
    if (sbBtn) sbBtn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      getBoard().then(function () { show("sb", true); });
    });
    var sbX = document.getElementById("sbX");
    if (sbX) sbX.addEventListener("click", function () { show("sb", false); });
    var sbC = document.getElementById("sbC");
    if (sbC) sbC.addEventListener("click", function () { show("sb", false); });
    var sb = document.getElementById("sb");
    if (sb) sb.addEventListener("click", function (e) {
      if (e.target === sb) show("sb", false);
    });
    getBoard();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bind);
  else bind();

  w.DodgeBoard = {
    onOver: onOver,
    getBoard: getBoard,
    qualifies: qualifies,
    boardKey: boardKey,
    isLiveHost: isLiveHost,
    LIVE_KEY: LIVE_KEY,
    TEST_KEY: TEST_KEY,
    KVA: KVA,
    useStub: useStub,
    STUB: STUB,
    nameOk: nameOk
  };
})(window);
