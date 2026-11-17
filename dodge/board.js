/* Global top-10 scoreboard for Hollow Dodge.
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

  // The KeyVal host returns a 503 (with no CORS header) on roughly 1 in 8
  // requests. Every call is retried, and a failed read never turns into an
  // empty board that would then be written back over everyone's scores.
  var loaded = false;      // true once the board has been read successfully
  var saving = false;
  var LOAD_ERR = "Couldn't load the scoreboard. An adblocker, Brave Shields or a VPN may be blocking it, so try turning it off for this site.";

  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function withRetry(fn, tries) {
    var n = 0;
    function go() {
      return fn().catch(function (e) {
        if (++n >= tries) throw e;
        return sleep(600 * n + Math.random() * 300).then(go);
      });
    }
    return go();
  }
  function timedFetch(url, opts) {
    var c = typeof AbortController !== "undefined" ? new AbortController() : null;
    var to = c ? setTimeout(function () { c.abort(); }, 8000) : 0;
    if (c) opts.signal = c.signal;
    return fetch(url, opts).then(function (r) { clearTimeout(to); return r; },
      function (e) { clearTimeout(to); throw e; });
  }

  // Raw read: resolves with the tidy list, rejects on any network/HTTP error.
  function fetchBoard() {
    return withRetry(function () {
      var url = KV + "GetValue/" + KVA + "/" + boardKey() + "?t=" + Date.now();
      return timedFetch(url, { cache: "no-store" }).then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.text();
      }).then(function (t) {
        var v = t || "";
        try { v = JSON.parse(v); } catch (e) {}
        return tidy(dec(String(v == null ? "" : v).replace(/^"|"$/g, "")));
      });
    }, 5);
  }

  function getBoard() {
    if (useStub()) {
      board = tidy(board.length ? board : STUB.slice());
      loaded = true;
      draw(board);
      return Promise.resolve(board);
    }
    return fetchBoard().then(function (l) {
      board = l; loaded = true; draw(board); return board;
    }, function () {
      if (loaded) draw(board); else drawMsg(LOAD_ERR);
      return board;
    });
  }

  // Raw write: resolves true only when the server answered "true".
  function putBoard(next) {
    if (useStub()) {
      board = tidy(next);
      draw(board);
      return Promise.resolve(true);
    }
    // Refuse writes to the live key off the live host, and never touch Whack's key.
    if (boardKey() === "kwtop") return Promise.reject(new Error("blocked key"));
    if (boardKey() === LIVE_KEY && !isLiveHost()) return Promise.reject(new Error("blocked key"));
    var payload = enc(tidy(next));
    if (!payload) return Promise.reject(new Error("encode"));
    return withRetry(function () {
      var url = KV + "UpdateValue/" + KVA + "/" + boardKey() + "/" + payload;
      return timedFetch(url, { method: "POST", cache: "no-store" }).then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.text();
      }).then(function (t) {
        if (String(t).indexOf("true") < 0) throw new Error("not saved");
        return true;
      });
    }, 6);
  }

  function hasEntry(list, n, s) {
    var k = n.toLowerCase();
    return (list || []).some(function (x) { return x.n.toLowerCase() === k && x.s >= s; });
  }

  function qualifies(score) {
    if (!isFinite(score) || score <= 0 || score > MAXS) return false;
    if (!loaded) return true; // unknown board: offer the form, recheck on save
    if (!board || board.length < 10) return true;
    return score > board[board.length - 1].s;
  }

  function drawMsg(msg) {
    ["1", "2", "3"].forEach(function (k) {
      var ol = document.getElementById("lb" + k);
      if (ol) ol.textContent = "";
      var m = document.getElementById("lbm" + k);
      if (m) m.textContent = msg;
    });
  }

  function show(id, on) {
    var el = document.getElementById(id);
    if (el) el.hidden = !on;
  }

  function setErr(msg) {
    var err = document.getElementById("err");
    if (!err) return;
    err.hidden = !msg;
    err.textContent = msg || "";
  }

  function onOver(score) {
    pendingScore = score | 0;
    saving = false;
    setErr("");
    var wrap0 = document.getElementById("nmWrap");
    if (wrap0) wrap0.hidden = true;
    var mine = pendingScore;
    getBoard().then(function () {
      if (mine !== pendingScore) return; // a newer run already ended
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

  function closeForm() {
    show("nmOv", false);
    var wrap = document.getElementById("nmWrap");
    if (wrap) wrap.hidden = true;
    var inp = document.getElementById("nm");
    if (inp) inp.value = "";
  }

  function submitName(raw) {
    if (saving) return;
    var n = String(raw || "").trim().replace(/\s+/g, " ");
    if (!nameOk(n)) {
      setErr("Use 1–12 letters, numbers, spaces, _ or -. Keep it friendly.");
      return;
    }
    var sc = pendingScore;
    if (!(sc > 0 && sc <= MAXS)) { setErr("That score can't be saved."); return; }
    saving = true;
    setErr("Saving...");
    var FAIL = "Couldn't reach the scoreboard. If you use an adblocker, Brave Shields or a VPN, turn it off for this site and press Save again.";
    // Always merge into a FRESH copy of the board. If it can't be read, stop:
    // writing a guess would wipe other players' scores.
    (useStub() ? Promise.resolve(board) : fetchBoard()).then(function (fresh) {
      board = fresh; loaded = true;
      var next = tidy(fresh.concat([{ n: n, s: sc }]));
      if (!hasEntry(next, n, sc)) {
        draw(next);
        saving = false;
        setErr("So close! The top 10 moved past " + sc + " while you were typing.");
        return;
      }
      return putBoard(next).then(function () {
        // Read back to confirm the write really landed.
        return useStub() ? next : fetchBoard().catch(function () { return next; });
      }).then(function (after) {
        if (!hasEntry(after, n, sc)) {
          // Someone else wrote at the same moment; merge once more.
          var again = tidy(after.concat([{ n: n, s: sc }]));
          return putBoard(again).then(function () { return again; });
        }
        return after;
      }).then(function (final) {
        board = final; draw(board);
        saving = false;
        setErr("");
        closeForm();
        var st = document.getElementById("ovStat");
        if (st) { st.hidden = false; st.textContent = st.textContent.replace(/\s+·\s+Saved.*$/, "") + "   ·   Saved as " + n + "!"; }
      });
    }).catch(function () {
      saving = false;
      setErr(FAIL);
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
