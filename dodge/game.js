/* Dodge the Wires — mockup. Roger sprites from Nines Alley. */
(() => {
  "use strict";

  const W = 1280, H = 720, GROUND = 562;
  const JUMP_VY = -980, GRAVITY = 1600;
  const STORE = "dodgeWiresBest";
  const PATH = "dodge/img/";

  const canvas = document.getElementById("c");
  const ctx = canvas.getContext("2d", { alpha: false });
  const hud = document.getElementById("hud");
  const scoreEl = document.getElementById("score");
  const bestEl = document.getElementById("best");
  const overlay = document.getElementById("overlay");
  const ovTitle = document.getElementById("ovTitle");
  const ovMsg = document.getElementById("ovMsg");
  const ovStat = document.getElementById("ovStat");
  const goBtn = document.getElementById("go");
  const stage = document.getElementById("stage");

  const names = {
    sky: "sky.png",
    cath: "cathedral.png",
    far: "trees-far.png",
    mid: "trees-mid.png",
    near: "trees-near.png",
    fogF: "fog-far.png",
    fogM: "fog-mid.png",
    fogN: "fog-near.png",
    ground: "ground.png",
    ri0: "ri0.png",
    ri1: "ri1.png",
    rear: "rear.png",
    rt0: "rt0.png", rt1: "rt1.png", rt2: "rt2.png",
    rt3: "rt3.png", rt4: "rt4.png", rt5: "rt5.png",
  };

  const img = {};
  let ready = false, mode = "start"; // start | play | over
  let dist = 0, score = 0, best = 0, speed = 0, time = 0;
  let lastTs = 0, spawnAt = 0, spawnI = 0, lastSpawnType = null;
  let duckHeld = false, duckUntil = 0, jumpBuf = 0, coyote = 0;
  let frozen = false, shotMode = null, shotJumpPending = false, simLock = false;
  const spawnLog = [];
  let hitFlash = 0, eyeT = 0, eyeOn = false;

  const roger = {
    x: 210,
    y: GROUND,
    vy: 0,
    onGround: true,
    ducking: false,
    frame: 0,
    anim: 0,
  };

  let obstacles = [];
  let midTrees = [];
  let nearTrees = [];
  let bgTVs = [];
  let wiresDeco = [];

  const KEY = {};
  const jumpKeys = new Set(["Space", "ArrowUp", "KeyW", "KeyZ"]);
  const duckKeys = new Set(["ArrowDown", "KeyS"]);

  try { best = Math.max(0, parseInt(localStorage.getItem(STORE) || "0", 10) || 0); } catch (e) { best = 0; }
  bestEl.textContent = "Best " + best;

  function loadAll() {
    const entries = Object.entries(names);
    return Promise.all(entries.map(([k, f]) => new Promise((res, rej) => {
      const im = new Image();
      im.onload = () => { img[k] = im; res(); };
      im.onerror = () => rej(new Error("missing " + f));
      im.src = PATH + f;
    })));
  }

  function seeded(n) {
    // tiny deterministic rng
    return function () {
      n = (n * 1664525 + 1013904223) >>> 0;
      return n / 4294967296;
    };
  }

  function layoutWorld() {
    const r = seeded(90210);
    midTrees = [];
    nearTrees = [];
    bgTVs = [];
    for (let i = 0; i < 9; i++) {
      const stack = 2 + (r() < 0.55 ? 1 : 0) + (r() < 0.25 ? 1 : 0);
      const bw = 28 + r() * 10;
      const bh = 24 + r() * 8;
      bgTVs.push({
        x: 140 + i * 620 + r() * 160,
        // feet sit on the mid floor; stack grows upward
        y: 0, // filled below
        w: bw,
        h: bh,
        eye: r() < 0.2,
        period: 9 * 620,
        stack: stack,
        foot: true,
      });
    }
    wiresDeco = [];
    for (let i = 0; i < 18; i++) {
      wiresDeco.push({
        x: i * 340 + r() * 80,
        w: 180 + r() * 260,
        sag: 40 + r() * 70,
        y: 40 + r() * 90,
        period: 18 * 340,
      });
    }
  }

  function resetRun() {
    dist = 0; score = 0; time = 0;
    speed = 330;
    spawnAt = 700;
    spawnI = 0;
    lastSpawnType = null;
    duckHeld = false; duckUntil = 0; jumpBuf = 0; coyote = 0;
    hitFlash = 0;
    roger.x = 210; roger.y = GROUND; roger.vy = 0;
    roger.onGround = true; roger.ducking = false;
    roger.frame = 0; roger.anim = 0;
    obstacles = [];
  }

  function startGame() {
    resetRun();
    mode = "play";
    overlay.classList.add("hidden");
    hud.hidden = false;
    scoreEl.textContent = "0";
    bestEl.textContent = "Best " + best;
  }

  function gameOver() {
    if (mode !== "play") return;
    mode = "over";
    hitFlash = 0.5;
    if (score > best) {
      best = score;
      try { localStorage.setItem(STORE, String(best)); } catch (e) {}
    }
    ovTitle.textContent = "Tangled";
    ovMsg.textContent = "The Hollow was watching.";
    ovStat.hidden = false;
    ovStat.textContent = "Distance " + score + "   ·   Best " + best;
    goBtn.textContent = "Retry";
    overlay.classList.remove("hidden");
    hud.hidden = false;
  }

  function showStart() {
    mode = "start";
    resetRun();
    ovTitle.textContent = "Dodge the Wires";
    ovMsg.textContent = "Help Roger run the dead forest. Jump the CRTs. Duck the wires.";
    ovStat.hidden = true;
    goBtn.textContent = "Start";
    overlay.classList.remove("hidden");
    hud.hidden = true;
  }

  function jump() {
    if (mode === "start") { startGame(); return; }
    if (mode === "over") { startGame(); return; }
    jumpBuf = 0.12;
    tryJump();
  }

  function tryJump() {
    if (mode !== "play") return;
    if (jumpBuf > 0 && (roger.onGround || coyote > 0)) {
      roger.vy = JUMP_VY;
      roger.onGround = false;
      roger.ducking = false;
      duckUntil = 0;
      jumpBuf = 0;
      coyote = 0;
    }
  }

  function setDuck(on) {
    duckHeld = !!on;
    if (on && mode === "play") duckUntil = Math.max(duckUntil, time + 0.36);
  }

  function rogerBox() {
    const fr = frameImg();
    const sc = 110 / 132;
    const dw = fr.width * sc;
    const dh = fr.height * sc * (roger.ducking ? 0.55 : 1);
    const x = roger.x - dw * 0.45;
    const y = roger.y - dh;
    // tighter hitbox: drop tail (left) and ears (top)
    const insetL = dw * 0.28;
    const insetR = dw * 0.16;
    const insetT = dh * (roger.ducking ? 0.12 : 0.28);
    const insetB = dh * 0.06;
    return { x: x + insetL, y: y + insetT, w: dw - insetL - insetR, h: dh - insetT - insetB };
  }

  function frameImg() {
    if (mode !== "play" || (mode === "over" && roger.onGround) || (mode === "start")) {
      return (Math.floor(time * 8) % 17 === 0) ? img.ri1 : img.ri0;
    }
    if (!roger.onGround) return roger.vy < -80 ? img.rear : img.rt2;
    if (roger.ducking) return img.ri0;
    return img["rt" + (roger.frame % 6)];
  }

  function obstacleAction(type) {
    return (type === "wire" || type === "hangcrt") ? "duck" : "jump";
  }

  function airtime() {
    return (2 * Math.abs(JUMP_VY)) / GRAVITY;
  }

  // Speed the player will have when they actually meet a just-spawned obstacle
  // (it appears at the right edge and takes ~a screen to arrive).
  function projectedSpeed(pixelsAhead) {
    const ahead = Math.max(0, pixelsAhead);
    const t = ahead / Math.max(1, speed || 330);
    return Math.min(780, 330 + (dist + ahead) * 0.012 + (time + t) * 4);
  }

  // Left-to-left spacing. Jump travel + landing/reaction buffer, scaled to
  // the speed at contact. Duck-into-duck can stay tighter (hold/re-duck).
  function fairGapBetween(typeA, typeB) {
    const v = projectedSpeed(W);
    const a = typeA ? obstacleAction(typeA) : "jump";
    const b = obstacleAction(typeB);
    if (a === "duck" && b === "duck") return 0.4 * v + 80;
    return (airtime() + 0.35) * v + 32;
  }

  function spawnPattern() {
    const x = W + 40;
    const tier = speed > 620 ? 2 : speed > 470 ? 1 : 0;
    const bag = [
      ["crt"],
      ["wire"],
      ["cable"],
      ["hangcrt"],
      ["crt"],
      ["wire"],
    ];
    if (tier >= 1) bag.push(["crt", "wire"], ["cable", "wire"], ["crt", "crt"]);
    if (tier >= 2) bag.push(["wire", "crt"], ["crt", "wire", "crt"], ["hangcrt", "crt"]);
    const pick = bag[spawnI % bag.length];
    spawnI++;
    const p = pick.slice();
    if (Math.random() < 0.35 && p.length === 1) {
      const alt = ["crt", "wire", "cable", "hangcrt"];
      p[0] = alt[(spawnI * 3) % alt.length];
    }
    let dx = 0;
    p.forEach((type, i) => {
      spawnOne(type, x + dx);
      if (p[i + 1]) dx += fairGapBetween(type, p[i + 1]);
    });
    const gap = fairGapBetween(lastSpawnType, p[0]) + Math.random() * 0.08 * Math.max(speed, 330);
    spawnLog.push({
      t: time, speed, vProj: projectedSpeed(W), pattern: p.slice(),
      last: lastSpawnType, gap: gap, intra: dx,
      fairs: p.map((type, i) => i ? fairGapBetween(p[i - 1], type) : fairGapBetween(lastSpawnType, type)),
    });
    if (spawnLog.length > 8000) spawnLog.shift();
    spawnAt = dist + gap + dx;
    lastSpawnType = p[p.length - 1];
  }

  function spawnOne(type, x) {
    if (type === "crt") {
      const w = 96 + Math.random() * 20, h = 86 + Math.random() * 16;
      obstacles.push({ type, x, y: GROUND - h, w, h, eye: Math.random() < 0.4, sway: 0 });
    } else if (type === "cable") {
      const w = 92 + Math.random() * 20, h = 42 + Math.random() * 10;
      obstacles.push({ type, x, y: GROUND - h, w, h, sway: 0 });
    } else if (type === "wire") {
      const drop = 72 + Math.random() * 10; // gap at bottom, must duck
      obstacles.push({ type, x, y: 0, w: 22, h: GROUND - drop, sway: Math.random() * Math.PI, thick: 8 });
    } else if (type === "hangcrt") {
      const tvH = 70, tvW = 80, drop = 78;
      const topH = GROUND - drop - tvH;
      obstacles.push({ type, x, y: 0, w: tvW, h: topH + tvH, tvW, tvH, topH, eye: Math.random() < 0.55, sway: Math.random() * Math.PI });
    }
  }

  function obsBox(o) {
    if (o.type === "wire") {
      const sx = Math.sin(time * 2.2 + o.sway) * 6;
      return { x: o.x + sx - 2, y: 0, w: 16, h: o.h };
    }
    if (o.type === "hangcrt") {
      const sx = Math.sin(time * 1.8 + o.sway) * 5;
      // only the hanging TV (plus a slim wire) is solid at the bottom of the drop
      return { x: o.x + sx, y: o.topH, w: o.tvW, h: o.tvH };
    }
    return { x: o.x, y: o.y, w: o.w, h: o.h };
  }

  function overlaps(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  function update(dt) {
    time += dt;
    eyeT += dt;
    if (eyeT > 2.8) {
      eyeOn = !eyeOn;
      eyeT = eyeOn ? 0.45 : 0;
    }
    if (hitFlash > 0) hitFlash -= dt;

    const idleScroll = (mode === "start") ? 55 : (mode === "over" ? 30 : 0);
    if (mode !== "play") {
      dist += idleScroll * dt;
      roger.anim += dt;
      roger.ducking = false;
      roger.y = GROUND;
      roger.vy = 0;
      roger.onGround = true;
      return;
    }

    speed = Math.min(780, 330 + dist * 0.012 + time * 4);
    dist += speed * dt;
    score = Math.floor(dist / 8);
    scoreEl.textContent = String(score);
    if (score > best) bestEl.textContent = "Best " + score;

    // duck / jump
    const wantDuck = duckHeld || time < duckUntil;
    if (jumpBuf > 0) jumpBuf -= dt;
    tryJump();

    if (!roger.onGround) {
      const wantFastFall = (duckHeld || time < duckUntil) && roger.vy >= 0;
      roger.vy += GRAVITY * (wantFastFall ? 3.2 : 1) * dt;
      roger.y += roger.vy * dt;
      if (roger.y >= GROUND) {
        roger.y = GROUND;
        roger.vy = 0;
        roger.onGround = true;
        coyote = 0;
      }
    } else {
      coyote = 0.08;
      roger.ducking = wantDuck && roger.vy >= 0;
    }
    if (!roger.onGround) coyote -= dt;

    if (roger.onGround && !roger.ducking) {
      roger.anim += dt * (speed / 110);
      roger.frame = Math.floor(roger.anim) % 6;
    }

    if (dist > spawnAt) spawnPattern();

    const vx = speed;
    for (const o of obstacles) o.x -= vx * dt;
    obstacles = obstacles.filter(o => o.x + (o.w || 40) > -80);

    if (!shotMode) {
      const rb = rogerBox();
      for (const o of obstacles) {
        if (overlaps(rb, obsBox(o))) {
          gameOver();
          break;
        }
      }
    }
  }

  function drawTiled(im, offset, y, destH) {
    if (!im) return;
    const destW = im.width * (destH / im.height);
    let x = -((offset % destW) + destW) % destW;
    while (x < W) {
      ctx.drawImage(im, x, y, destW, destH);
      x += destW;
    }
  }

  function wrapDraw(list, factor, drawfn) {
    for (const t of list) {
      const period = t.period;
      let x = t.x - dist * factor;
      x = ((x % period) + period) % period;
      // draw two copies so wrap is seamless
      drawfn(t, x);
      drawfn(t, x - period);
    }
  }

  function drawStamp(t, x, groundY, factorH) {
    const im = img[t.kind];
    if (!im) return;
    const dh = im.height * t.sc * factorH;
    const dw = im.width * t.sc * factorH;
    if (x > W + 40 || x + dw < -40) return;
    ctx.save();
    if (t.flip) {
      ctx.translate(x + dw, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(im, 0, groundY - dh, dw, dh);
    } else {
      ctx.drawImage(im, x, groundY - dh, dw, dh);
    }
    ctx.restore();
  }

  function drawAmberEye(cx, cy, s, a) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.globalAlpha = a;
    ctx.strokeStyle = "#e8a028";
    ctx.fillStyle = "#ffc44a";
    ctx.lineWidth = Math.max(1.5, s * 0.12);
    ctx.beginPath();
    ctx.ellipse(0, 0, s * 0.38, s * 0.72, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(0, 0, s * 0.18, s * 0.34, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#1a0c04";
    ctx.beginPath();
    ctx.ellipse(0, 0, s * 0.08, s * 0.16, 0, 0, Math.PI * 2);
    ctx.fill();
    // faint glow
    ctx.globalAlpha = a * 0.35;
    ctx.shadowColor = "#ffb020";
    ctx.shadowBlur = s * 0.8;
    ctx.beginPath();
    ctx.ellipse(0, 0, s * 0.18, s * 0.34, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#ffc44a";
    ctx.fill();
    ctx.restore();
  }

  function drawStaticScreen(x, y, w, h, withEye) {
    ctx.fillStyle = "#1c1c20";
    ctx.fillRect(x, y, w, h);
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();
    const seed = Math.floor(time * 28) + (x | 0) * 13;
    let n = seed >>> 0;
    const rnd = () => { n = (n * 1664525 + 1013904223) >>> 0; return n / 4294967296; };
    for (let i = 0; i < 36; i++) {
      const gy = y + rnd() * h;
      const ga = 0.25 + rnd() * 0.55;
      ctx.fillStyle = rnd() < 0.55 ? "rgba(230,230,230," + ga + ")" : "rgba(20,20,20," + ga + ")";
      ctx.fillRect(x, gy, w, 1 + rnd() * 3);
    }
    for (let i = 0; i < 50; i++) {
      ctx.fillStyle = "rgba(255,255,255," + (0.15 + rnd() * 0.45) + ")";
      ctx.fillRect(x + rnd() * w, y + rnd() * h, 1.5, 1.5);
    }
    ctx.fillStyle = "rgba(0,0,0,0.2)";
    for (let sy = y; sy < y + h; sy += 3) ctx.fillRect(x, sy, w, 1);
    if (withEye && (eyeOn || true)) {
      drawAmberEye(x + w / 2, y + h / 2, Math.min(w, h) * 0.48, eyeOn ? 1 : 0.55);
    }
    ctx.restore();
  }

  function drawCRT(x, y, w, h, withEye) {
    ctx.fillStyle = "#1a1a1e";
    roundRect(x, y, w, h, 5, true);
    ctx.strokeStyle = "#8a8a90";
    ctx.lineWidth = 2.5;
    roundRect(x, y, w, h, 5, false);
    ctx.strokeStyle = "#2e2e32";
    ctx.lineWidth = 1;
    const pad = Math.max(7, w * 0.1);
    ctx.strokeRect(x + pad - 1, y + pad - 1, w - pad * 2 + 2, h - pad * 2 - 5);
    drawStaticScreen(x + pad, y + pad, w - pad * 2, h - pad * 2 - 7, withEye);
    ctx.fillStyle = "#3a3a40";
    ctx.beginPath(); ctx.arc(x + w * 0.28, y + h - 7, 2.6, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(x + w * 0.42, y + h - 7, 2.6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#121214";
    ctx.fillRect(x + 6, y + h - 2, 10, 6);
    ctx.fillRect(x + w - 16, y + h - 2, 10, 6);
  }

  function roundRect(x, y, w, h, r, fill) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
    if (fill) ctx.fill(); else ctx.stroke();
  }

  function drawCables(x, y, w, h) {
    ctx.save();
    ctx.strokeStyle = "#1c1c1e";
    ctx.lineWidth = 5;
    ctx.lineCap = "round";
    for (let i = 0; i < 5; i++) {
      const yy = y + h * (0.25 + i * 0.15);
      ctx.beginPath();
      ctx.moveTo(x, yy);
      ctx.bezierCurveTo(x + w * 0.3, yy - 16, x + w * 0.6, yy + 18, x + w, yy - 4);
      ctx.stroke();
    }
    ctx.strokeStyle = "#2a2a2c";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(x + w * 0.5, y + h * 0.7, w * 0.38, h * 0.28, -0.2, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(x + w * 0.45, y + h * 0.55, w * 0.28, h * 0.22, 0.3, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  function drawHangingWire(o) {
    const sx = Math.sin(time * 2.2 + o.sway) * 8;
    const x = o.x + sx;
    ctx.save();
    ctx.lineCap = "round";
    ctx.strokeStyle = "#2a2a2e";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(o.x + 16, -12);
    ctx.quadraticCurveTo(o.x + 38, o.h * 0.45, x + 6, o.h);
    ctx.stroke();
    ctx.strokeStyle = "#3d3d42";
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(o.x + 24, -12);
    ctx.quadraticCurveTo(o.x + 50, o.h * 0.5, x + 12, o.h - 8);
    ctx.stroke();
    // dangling knot / insulator
    ctx.fillStyle = "#1c1c1e";
    ctx.beginPath();
    ctx.arc(x + 6, o.h, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#4a4a50";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();
  }

  function drawHangCRT(o) {
    const sx = Math.sin(time * 1.8 + o.sway) * 5;
    const x = o.x + sx;
    ctx.save();
    ctx.strokeStyle = "#1a1a1c";
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(o.x + o.tvW / 2, -8);
    ctx.lineTo(x + o.tvW / 2, o.topH);
    ctx.stroke();
    drawCRT(x, o.topH, o.tvW, o.tvH, o.eye);
    ctx.restore();
  }

  function drawRoger() {
    const fr = frameImg();
    const sc = 110 / 132;
    const duck = roger.ducking ? 0.55 : 1;
    const dw = fr.width * sc;
    const dh = fr.height * sc * duck;
    const x = roger.x - dw * 0.45;
    const y = roger.y - dh;
    // soft shadow on the path, right under his paws
    ctx.save();
    const sw = dw * (roger.onGround ? 0.58 : 0.34);
    const sy = GROUND + 5;
    ctx.fillStyle = "rgba(0,0,0,0.28)";
    ctx.beginPath();
    ctx.ellipse(roger.x + 2, sy, sw * 1.15, 9, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(0,0,0,0.45)";
    ctx.beginPath();
    ctx.ellipse(roger.x + 2, sy - 1, sw * 0.75, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    if (hitFlash > 0 && Math.floor(time * 20) % 2 === 0) ctx.globalAlpha = 0.4;
    ctx.drawImage(fr, x, y, dw, dh);
    ctx.globalAlpha = 1;
  }


  const MID_FLOOR = GROUND - 82;

  function drawMidFloor() {
    // darker distant ground the scenery TVs sit on
    const y = MID_FLOOR;
    const grd = ctx.createLinearGradient(0, y - 28, 0, y + 36);
    grd.addColorStop(0, "rgba(8,8,10,0)");
    grd.addColorStop(0.45, "rgba(6,6,8,0.55)");
    grd.addColorStop(0.55, "rgba(4,4,6,0.7)");
    grd.addColorStop(1, "rgba(8,8,10,0)");
    ctx.fillStyle = grd;
    ctx.fillRect(0, y - 28, W, 64);
    // faint lip so stacks feel planted
    ctx.fillStyle = "rgba(18,18,20,0.35)";
    ctx.fillRect(0, y, W, 2);
  }

  function drawSceneryCRT(x, y, w, h, withEye) {
    // small, dim, foggy — clearly not a path hazard
    ctx.save();
    ctx.globalAlpha = 0.4;
    ctx.fillStyle = "#0c0c0e";
    roundRect(x, y, w, h, 3, true);
    ctx.strokeStyle = "#2a2a2e";
    ctx.lineWidth = 1;
    roundRect(x, y, w, h, 3, false);
    const pad = Math.max(4, w * 0.12);
    ctx.fillStyle = "#141416";
    ctx.fillRect(x + pad, y + pad, w - pad * 2, h - pad * 2 - 4);
    // muted static
    ctx.save();
    ctx.beginPath();
    ctx.rect(x + pad, y + pad, w - pad * 2, h - pad * 2 - 4);
    ctx.clip();
    ctx.globalAlpha = 0.25;
    let n = ((x * 13 + (y | 0) * 7 + Math.floor(time * 8)) >>> 0);
    const rnd = () => { n = (n * 1664525 + 1013904223) >>> 0; return n / 4294967296; };
    for (let i = 0; i < 10; i++) {
      ctx.fillStyle = "rgba(180,180,180,0.35)";
      ctx.fillRect(x + pad, y + pad + rnd() * (h - pad * 2), w - pad * 2, 1);
    }
    ctx.restore();
    if (withEye) {
      ctx.globalAlpha = 0.35;
      drawAmberEye(x + w / 2, y + h / 2, Math.min(w, h) * 0.36, 0.5);
    }
    ctx.restore();
  }

  function drawWorld() {

    ctx.fillStyle = "#0a0a0c";
    ctx.fillRect(0, 0, W, H);
    // storm sky
    if (img.sky) ctx.drawImage(img.sky, 0, 0, W, 460);
    const g = ctx.createLinearGradient(0, 300, 0, GROUND);
    g.addColorStop(0, "rgba(10,10,12,0)");
    g.addColorStop(0.55, "rgba(10,10,12,0.35)");
    g.addColorStop(1, "rgba(10,10,12,0.88)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 300, W, GROUND - 300);

    // far hazy cathedral — large readable silhouette, still behind the fog
    if (img.cath) {
      const ch = 540;
      const cw = img.cath.width * (ch / img.cath.height);
      const period = cw + 900;
      let cx = (0.55 * W - 0.64 * cw) - dist * 0.016;
      cx = ((cx % period) + period) % period;
      if (cx > W) cx -= period;
      ctx.globalAlpha = 0.92;
      ctx.drawImage(img.cath, cx, -24, cw, ch);
      ctx.globalAlpha = 1;
    }

    // tree layers, far to near (far trees sit lower so spires and bridges read above them)
    drawTiled(img.far, dist * 0.07, 248, 270);
    drawTiled(img.fogF, dist * 0.10, 240, 200);
    // mid/near art is padded so branches run off the top of the frame
    drawTiled(img.mid, dist * 0.22, -36, 590);
    // hanging decorative wires
    wrapDraw(wiresDeco, 0.28, (w, x) => {
      ctx.save();
      ctx.strokeStyle = "rgba(28,28,32,0.95)";
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(x, w.y);
      ctx.quadraticCurveTo(x + w.w * 0.5, w.y + w.sag, x + w.w, w.y + 8);
      ctx.stroke();
      ctx.restore();
    });
    drawTiled(img.fogM, dist * 0.30, 330, 180);
    // distant ground + scenery CRT stacks (same parallax, planted, dim)
    drawMidFloor();
    wrapDraw(bgTVs, 0.22, (t, x) => {
      let yb = MID_FLOOR - t.h;
      for (let i = 0; i < t.stack; i++) {
        const ww = t.w * (1 - i * 0.06);
        const hh = t.h * (1 - i * 0.04);
        const xo = x + (i % 2 ? 8 : -4);
        drawSceneryCRT(xo, yb, ww, hh, t.eye && i === t.stack - 1);
        yb -= hh * 0.86;
      }
    });
    drawTiled(img.near, dist * 0.55, -48, 618);
    drawTiled(img.fogN, dist * 0.42, 400, 150);

    // solid foreground path — top edge of the art is the standing line
    drawTiled(img.ground, dist * 1.0, GROUND, 180);

    // obstacles
    for (const o of obstacles) {
      if (o.type === "crt") drawCRT(o.x, o.y, o.w, o.h, o.eye);
      else if (o.type === "cable") drawCables(o.x, o.y, o.w, o.h);
      else if (o.type === "wire") drawHangingWire(o);
      else if (o.type === "hangcrt") drawHangCRT(o);
    }

    // roger
    drawRoger();

    // vignette
    const vg = ctx.createRadialGradient(W * 0.5, H * 0.45, 200, W * 0.5, H * 0.5, 820);
    vg.addColorStop(0, "rgba(0,0,0,0)");
    vg.addColorStop(1, "rgba(0,0,0,0.55)");
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, W, H);

    // film grain (very light)
    if (mode === "play") {
      ctx.fillStyle = "rgba(255,255,255,0.015)";
      const gn = Math.floor(time * 12);
      let n = (gn * 1103515245 + 12345) >>> 0;
      for (let i = 0; i < 40; i++) {
        n = (n * 1664525 + 1013904223) >>> 0;
        const gx = (n % W);
        n = (n * 1664525 + 1013904223) >>> 0;
        const gy = (n % H);
        ctx.fillRect(gx, gy, 2, 2);
      }
    }
  }

  function loop(ts) {
    if (!lastTs) lastTs = ts;
    let dt = (ts - lastTs) / 1000;
    lastTs = ts;
    if (dt > 0.05) dt = 0.05;
    if (ready) {
      if (!frozen && !simLock) {
        update(dt);
        maybeFreezeShot();
      }
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      drawWorld();
    }
    requestAnimationFrame(loop);
  }

  // ---------- input ----------
  function isTypingTarget(el) {
    return el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable);
  }

  window.addEventListener("keydown", (e) => {
    if (isTypingTarget(e.target)) return;
    KEY[e.code] = true;
    if (jumpKeys.has(e.code) || duckKeys.has(e.code)) e.preventDefault();
    if (jumpKeys.has(e.code) && !e.repeat) jump();
    if (duckKeys.has(e.code)) setDuck(true);
    if (e.code === "Enter" && mode !== "play") startGame();
  });
  window.addEventListener("keyup", (e) => {
    KEY[e.code] = false;
    if (duckKeys.has(e.code)) setDuck(false);
  });
  window.addEventListener("blur", () => { duckHeld = false; });

  let tx = 0, ty = 0, tDown = false;
  function touchStart(e) {
    const t = e.changedTouches ? e.changedTouches[0] : e;
    tx = t.clientX; ty = t.clientY; tDown = true;
    if (e.cancelable) e.preventDefault();
  }
  function touchMove(e) {
    if (!tDown) return;
    const t = e.changedTouches ? e.changedTouches[0] : e;
    const dy = t.clientY - ty;
    if (dy > 28) setDuck(true);
    if (e.cancelable) e.preventDefault();
  }
  function touchEnd(e) {
    if (!tDown) return;
    const t = e.changedTouches ? e.changedTouches[0] : e;
    const dy = t.clientY - ty;
    tDown = false;
    if (dy > 28) {
      setDuck(true);
      duckUntil = time + 0.42;
    } else if (dy < -28) {
      jump();
    } else {
      // tap
      if (mode !== "play") startGame();
      else jump();
    }
    setDuck(false);
    if (e.cancelable) e.preventDefault();
  }

  stage.addEventListener("pointerdown", (e) => {
    if (e.target === goBtn) return;
    if (e.pointerType === "mouse") {
      if (mode !== "play") { startGame(); return; }
      // click upper 60% jumps, lower ducks
      const r = stage.getBoundingClientRect();
      if ((e.clientY - r.top) / r.height > 0.68) setDuck(true);
      else jump();
    }
  });
  stage.addEventListener("pointerup", (e) => {
    if (e.pointerType === "mouse") setDuck(false);
  });
  stage.addEventListener("touchstart", touchStart, { passive: false });
  stage.addEventListener("touchmove", touchMove, { passive: false });
  stage.addEventListener("touchend", touchEnd, { passive: false });

  goBtn.addEventListener("click", (e) => { e.stopPropagation(); startGame(); });

  // test hook for Playwright
  window.__dodge = {
    get mode() { return mode; },
    get score() { return score; },
    get best() { return best; },
    get speed() { return speed; },
    get ready() { return ready; },
    roger() { return { x: roger.x, y: roger.y, vy: roger.vy, onGround: roger.onGround, ducking: roger.ducking }; },
    box() { return rogerBox(); },
    start: startGame,
    jump,
    duck: setDuck,
    spawn(type, ahead) { spawnOne(type || "crt", roger.x + (ahead || 260)); },
    consts() { return { W, H, GROUND, JUMP_VY, GRAVITY }; },
    freeze() { frozen = true; },
    placeCrt(x, w, h) { obstacles.push({ type: "crt", x, y: GROUND - h, w, h, eye: true, sway: 0 }); },
    boostMax() { dist = 40000; time = 120; },
    get frozen() { return frozen; },
    get shotMode() { return shotMode; },
    kill: gameOver,
    obstacles() { return obstacles.map(o => Object.assign({ box: obsBox(o) }, o)); },
    step(dt) { simLock = true; if (mode === "play") update(dt); },
    beginSim() { simLock = true; startGame(); },
    get time() { return time; },
    get dist() { return dist; },
    airtime() { return airtime(); },
    fairGap(a, b) { return fairGapBetween(a || lastSpawnType, b || "crt"); },
    get spawnLog() { return spawnLog; },
  };

  // Debug URL param ?shot=run|jump freezes a frame for screenshots. Off unless present.
  function maybeArmShot() {
    const q = new URLSearchParams(location.search).get("shot");
    if (q !== "run" && q !== "jump") return;
    shotMode = q;
    const st = document.createElement("style");
    st.textContent = [
      ".nav,footer,h2,.lead,.bk{display:none!important}",
      "body{background:#050506;overflow:hidden;background-image:none}",
      "section{padding:0;max-width:none}",
      "#stage{width:100vw;height:100vh;aspect-ratio:auto;border:0;box-shadow:none;margin:0}",
    ].join("");
    document.head.appendChild(st);
    startGame();
    spawnAt = 1e12;
    obstacles = [];
    const tvH = 96, tvW = 108;
    obstacles.push({ type: "crt", x: 500, y: GROUND - tvH, w: tvW, h: tvH, eye: true, sway: 0 });
    if (shotMode === "jump") shotJumpPending = true;
  }

  function maybeFreezeShot() {
    if (!shotMode || frozen) return;
    if (shotJumpPending && roger.onGround) {
      jumpBuf = 0.12;
      tryJump();
      shotJumpPending = false;
      return;
    }
    if (shotMode === "run" && roger.onGround && time >= 0.28) {
      frozen = true;
      document.documentElement.dataset.shotReady = "1";
    }
    if (shotMode === "jump" && !roger.onGround && roger.vy >= 0) {
      const tv = obstacles.find((o) => o.type === "crt");
      if (tv) {
        const rb = rogerBox();
        tv.x = rb.x + rb.w * 0.5 - tv.w * 0.5;
      }
      frozen = true;
      document.documentElement.dataset.shotReady = "1";
    }
  }

  loadAll().then(() => {
    ready = true;
    layoutWorld();
    showStart();
    maybeArmShot();
    requestAnimationFrame(loop);
  }).catch((err) => {
    console.error(err);
    ovMsg.textContent = "Couldn't load the game art.";
  });
})();
