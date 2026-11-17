/* Original WebAudio SFX + looping BGM for Dodge the Wires.
   Music file (theme.ogg / theme.mp3) was synthesized for this game;
   no third-party or copyrighted samples. */
(function (w) {
  var MUTE_KEY = "kn-dodge-mute";
  var VOL = 0.22;
  var muted = false;
  try { muted = localStorage.getItem(MUTE_KEY) === "1"; } catch (e) {}
  var ac = null, unlocked = false, startedMusic = false, musicRate = 1, noiseBuf = null;

  function setBtn() {
    var b = document.getElementById("mute");
    if (!b) return;
    b.innerHTML = muted ? "&#128263; Sound off" : "&#128266; Sound on";
    b.setAttribute("aria-pressed", muted ? "true" : "false");
  }

  function ctx() {
    if (!ac) ac = new (w.AudioContext || w.webkitAudioContext)();
    if (ac.state === "suspended") ac.resume();
    if (!noiseBuf) {
      var n = ac.createBuffer(1, ac.sampleRate * 1, ac.sampleRate);
      var d = n.getChannelData(0);
      for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      noiseBuf = n;
    }
    return ac;
  }

  function envGain(c, t, a, peak, d) {
    var g = c.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    g.connect(c.destination);
    return g;
  }

  function sfx(type) {
    if (muted) return;
    try {
      var c = ctx(), t = c.currentTime, o, g, src, f;
      if (type === "jump") {
        o = c.createOscillator();
        o.type = "triangle";
        o.frequency.setValueAtTime(420, t);
        o.frequency.exponentialRampToValueAtTime(880, t + 0.09);
        envGain(c, t, 0.012, 0.16, 0.14);
        g = c.createGain();
        g.gain.setValueAtTime(0.16, t);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.14);
        o.connect(g); g.connect(c.destination);
        o.start(t); o.stop(t + 0.15);
        o = c.createOscillator();
        o.type = "sine";
        o.frequency.setValueAtTime(220, t);
        o.frequency.exponentialRampToValueAtTime(360, t + 0.08);
        g = c.createGain();
        g.gain.setValueAtTime(0.09, t);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
        o.connect(g); g.connect(c.destination);
        o.start(t); o.stop(t + 0.13);
      } else if (type === "duck") {
        o = c.createOscillator();
        o.type = "sine";
        o.frequency.setValueAtTime(260, t);
        o.frequency.exponentialRampToValueAtTime(90, t + 0.1);
        g = c.createGain();
        g.gain.setValueAtTime(0.08, t);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
        o.connect(g); g.connect(c.destination);
        o.start(t); o.stop(t + 0.13);
      } else if (type === "land") {
        o = c.createOscillator();
        o.type = "sine";
        o.frequency.setValueAtTime(150, t);
        o.frequency.exponentialRampToValueAtTime(70, t + 0.07);
        g = c.createGain();
        g.gain.setValueAtTime(0.11, t);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.1);
        o.connect(g); g.connect(c.destination);
        o.start(t); o.stop(t + 0.11);
        src = c.createBufferSource();
        src.buffer = noiseBuf;
        f = c.createBiquadFilter();
        f.type = "lowpass"; f.frequency.value = 800;
        g = c.createGain();
        g.gain.setValueAtTime(0.05, t);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.06);
        src.connect(f); f.connect(g); g.connect(c.destination);
        src.start(t); src.stop(t + 0.07);
      } else if (type === "hit") {
        src = c.createBufferSource();
        src.buffer = noiseBuf;
        f = c.createBiquadFilter();
        f.type = "bandpass"; f.frequency.value = 1400; f.Q.value = 0.6;
        g = c.createGain();
        g.gain.setValueAtTime(0.22, t);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.38);
        src.connect(f); f.connect(g); g.connect(c.destination);
        src.start(t); src.stop(t + 0.4);
        o = c.createOscillator();
        o.type = "sawtooth";
        o.frequency.setValueAtTime(180, t);
        o.frequency.exponentialRampToValueAtTime(50, t + 0.35);
        g = c.createGain();
        g.gain.setValueAtTime(0.1, t);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.4);
        o.connect(g); g.connect(c.destination);
        o.start(t); o.stop(t + 0.42);
      } else if (type === "over") {
        o = c.createOscillator();
        o.type = "triangle";
        o.frequency.setValueAtTime(330, t);
        o.frequency.exponentialRampToValueAtTime(110, t + 0.55);
        g = c.createGain();
        g.gain.setValueAtTime(0.12, t);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.7);
        o.connect(g); g.connect(c.destination);
        o.start(t); o.stop(t + 0.72);
      }
    } catch (e) {}
  }

  function startMusic() {
    if (startedMusic || muted) return;
    var el = document.getElementById("bgm");
    if (!el) return;
    try {
      el.volume = VOL;
      el.loop = true;
      el.playbackRate = musicRate;
      var p = el.play();
      if (p && p.catch) p.catch(function () {});
      startedMusic = true;
    } catch (e) {}
  }

  function unlock() {
    if (unlocked) {
      if (!muted && !startedMusic) startMusic();
      return;
    }
    unlocked = true;
    try { ctx(); } catch (e) {}
    if (!muted) startMusic();
  }

  function setMuted(v) {
    muted = !!v;
    try { localStorage.setItem(MUTE_KEY, muted ? "1" : "0"); } catch (e) {}
    setBtn();
    var el = document.getElementById("bgm");
    if (muted) {
      if (el) try { el.pause(); } catch (e) {}
      startedMusic = false;
    } else if (unlocked) {
      startMusic();
    }
  }

  function setSpeed(spd) {
    var t = Math.max(0, Math.min(1, (spd - 330) / 450));
    musicRate = 1 + 0.18 * t;
    var el = document.getElementById("bgm");
    if (el && startedMusic && !muted) {
      try { el.playbackRate = musicRate; } catch (e) {}
    }
  }

  function bind() {
    setBtn();
    var b = document.getElementById("mute");
    if (b) b.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      setMuted(!muted);
      unlock();
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bind);
  else bind();

  w.DodgeAudio = {
    unlock: unlock,
    sfx: sfx,
    setMuted: setMuted,
    setSpeed: setSpeed,
    isMuted: function () { return muted; },
    jump: function () { sfx("jump"); },
    duck: function () { sfx("duck"); },
    land: function () { sfx("land"); },
    hit: function () { sfx("hit"); sfx("over"); }
  };
})(window);
