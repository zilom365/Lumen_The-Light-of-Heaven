/* ===== Lumen prototype: app.js =====
   Part 1: ambient light (motes), button ripple and sparkles
   Part 2: the app (graveyards, people, map, memorial, chat)
   All names below are invented for the demo.                              */

var REDUCED = matchMedia("(prefers-reduced-motion:reduce)").matches;

/* ---------- 1. Magic ---------- */
(function motes() {
  if (REDUCED) return;
  var fx = document.getElementById("fx");
  function spawn() {
    var s = 6 + Math.random() * 14, d = document.createElement("div");
    d.className = "mote";
    d.style.cssText = "left:" + Math.random() * innerWidth + "px;top:" + (innerHeight + 20) + "px;width:" + s + "px;height:" + s + "px";
    fx.appendChild(d);
    var drift = (Math.random() - .5) * 120, rise = innerHeight * (.5 + Math.random() * .6);
    d.animate([
      { transform: "translate(0,0) scale(.6)", opacity: 0 },
      { opacity: .85, offset: .2 },
      { transform: "translate(" + drift + "px," + -rise + "px) scale(1.1)", opacity: 0 }
    ], { duration: 9000 + Math.random() * 7000, easing: "ease-in-out" }).onfinish = function () { d.remove(); };
  }
  for (var i = 0; i < 8; i++) setTimeout(spawn, i * 300);
  setInterval(spawn, 900);
})();

function sparkle(x, y, n) {
  if (REDUCED) return;
  for (var i = 0; i < (n || 10); i++) {
    var d = document.createElement("div"), a = Math.random() * 6.283, r = 30 + Math.random() * 60;
    d.className = "spark"; d.style.left = x + "px"; d.style.top = y + "px";
    document.body.appendChild(d);
    d.animate([
      { transform: "translate(0,0) scale(1)", opacity: 1 },
      { transform: "translate(" + Math.cos(a) * r + "px," + (Math.sin(a) * r - 20) + "px) scale(0)", opacity: 0 }
    ], { duration: 700 + Math.random() * 500, easing: "ease-out" }).onfinish = function (e) { e.target.effect.target.remove(); };
  }
}

document.addEventListener("click", function (e) {
  var b = e.target.closest(".btn, .gyb, .pl");
  if (!b) return;
  sparkle(e.clientX, e.clientY, b.classList.contains("btn") ? 12 : 7);
  if (b.classList.contains("btn")) {
    var r = b.getBoundingClientRect(), s = document.createElement("span"), size = Math.max(r.width, r.height);
    s.className = "ripple";
    s.style.cssText = "width:" + size + "px;height:" + size + "px;left:" + (e.clientX - r.left - size / 2) + "px;top:" + (e.clientY - r.top - size / 2) + "px";
    b.appendChild(s); setTimeout(function () { s.remove(); }, 800);
  }
});

/* ---------- 2. Data ---------- */
var G = [
  { id: "jurain", n: "Jurain Graveyard", a: "Jurain, Dhaka", p: [
    { n: "Rahim Uddin", y: "1948 – 2019", r: 0, c: 0 }, { n: "Salma Khatun", y: "1955 – 2021", r: 0, c: 3 },
    { n: "Karim Hossain", y: "1962 – 2018", r: 1, c: 1 }, { n: "Nasrin Akter", y: "1970 – 2022", r: 1, c: 2 },
    { n: "Abdul Mannan", y: "1939 – 2016", r: 2, c: 0 }, { n: "Rokeya Begum", y: "1944 – 2020", r: 2, c: 3 } ] },
  { id: "azimpur", n: "Azimpur Graveyard", a: "Azimpur, Dhaka", p: [
    { n: "Jalal Chowdhury", y: "1951 – 2017", r: 0, c: 1 }, { n: "Hasina Banu", y: "1958 – 2020", r: 0, c: 2 },
    { n: "Shafiqul Islam", y: "1966 – 2023", r: 1, c: 0 }, { n: "Farida Yasmin", y: "1949 – 2015", r: 1, c: 3 },
    { n: "Moinul Haque", y: "1941 – 2012", r: 2, c: 1 }, { n: "Tahmina Sultana", y: "1975 – 2024", r: 3, c: 2 } ] },
  { id: "banani", n: "Banani Graveyard", a: "Banani, Dhaka", p: [
    { n: "Anwar Hossain", y: "1953 – 2019", r: 0, c: 1 }, { n: "Lutfa Rahman", y: "1960 – 2022", r: 1, c: 2 },
    { n: "Imran Kabir", y: "1988 – 2023", r: 2, c: 0 }, { n: "Shirin Akhter", y: "1947 – 2018", r: 2, c: 2 },
    { n: "Kamal Pasha", y: "1936 – 2011", r: 3, c: 1 }, { n: "Dilruba Nahar", y: "1972 – 2021", r: 3, c: 3 } ] }
];
var X = [50, 110, 290, 350], Y = [100, 180, 260, 340], curG = null, cur = null, subscribed = false, lit = {};

function ini(n) { return n.split(" ").map(function (w) { return w[0]; }).join("").slice(0, 2); }

function go(id) {
  document.querySelectorAll(".screen").forEach(function (s) { s.classList.remove("on"); });
  document.getElementById(id).classList.add("on");
  window.scrollTo(0, 0);
  document.body.classList.toggle("inner", id !== "s-login");
}

/* ---------- Graveyards, then people ---------- */
function renderGraves() {
  var h = "";
  G.forEach(function (g, i) {
    h += '<button class="gyb" style="--i:' + i + '" aria-pressed="' + (curG === g) + '" onclick="chooseG(\'' + g.id + '\')"><b>' + g.n + '</b><span>' + g.a + " · " + g.p.length + " resting here</span></button>";
  });
  document.getElementById("gy").innerHTML = h;
}
function chooseG(id) {
  curG = G.filter(function (g) { return g.id == id; })[0];
  var q = document.getElementById("q");
  q.disabled = false; q.value = ""; q.placeholder = "Search a name in " + curG.n + "…";
  renderGraves(); renderList();
  document.getElementById("people").scrollIntoView({ behavior: REDUCED ? "auto" : "smooth", block: "nearest" });
}
function renderList() {
  var box = document.getElementById("list"), t = document.getElementById("ph-title");
  if (!curG) { t.textContent = "People"; box.innerHTML = '<p class="note">Choose a graveyard above to see who rests there.</p>'; return; }
  t.textContent = curG.n + " · " + curG.a;
  var q = document.getElementById("q").value.toLowerCase(), h = "", n = 0;
  curG.p.forEach(function (p, idx) {
    if (p.n.toLowerCase().indexOf(q) < 0) return;
    h += '<button class="person" style="--i:' + (n++) + '" onclick="pick(' + idx + ')"><span class="av">' + ini(p.n) + '</span><span><b>' + p.n +
      '</b><br><small>' + p.y + " · Section " + "ABCD"[p.r] + ", plot " + (p.c + 1) + "</small></span></button>";
  });
  box.innerHTML = h || '<p class="note">No one found. Try another spelling.</p>';
}
function pick(idx) { cur = curG.p[idx]; drawMap(); go("s-map"); }

/* ---------- Map ---------- */
function drawMap() {
  var p = cur, gx = X[p.c] + 14, ay = Y[p.r] + 50, s = "";
  s += '<rect x="190" y="60" width="20" height="410" rx="8" fill="#e8d29a" opacity=".22"/>';
  Y.forEach(function (y, i) {
    s += '<rect x="20" y="' + (y + 44) + '" width="360" height="12" rx="6" fill="#e8d29a" opacity=".18"/>' +
      '<text x="6" y="' + (y + 18) + '" font-size="13" fill="#e8d29a">' + "ABCD"[i] + "</text>";
  });
  for (var r = 0; r < 4; r++) for (var c = 0; c < 4; c++) {
    var on = (r == p.r && c == p.c), has = curG.p.some(function (q) { return q.r == r && q.c == c; });
    s += '<path d="M' + X[c] + " " + (Y[r] + 26) + 'v-16a14 14 0 0 1 28 0v16z" fill="' + (on ? "#ffe9a8" : "#e9ecf3") + '" opacity="' + (has ? 1 : .22) + '"/>';
  }
  var d = "M200 470V" + ay + "H" + gx + "V" + (Y[p.r] + 30);
  s += '<path d="' + d + '" fill="none" stroke="#ffd36b" stroke-width="16" opacity=".3" stroke-linecap="round"/>' +
    '<path class="flow" d="' + d + '" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round"/>' +
    '<circle class="pulse" cx="' + gx + '" cy="' + (Y[p.r] + 6) + '" r="12" fill="#ffd36b"/>' +
    '<rect x="166" y="468" width="68" height="26" rx="13" fill="#fbf6e9"/><text x="200" y="486" text-anchor="middle" font-size="13" fill="#14213d">Main gate</text>';
  document.getElementById("map").innerHTML = s;
  document.getElementById("mg").textContent = curG.n;
  document.getElementById("mt").textContent = "Walk to " + p.n;
  document.getElementById("ms").textContent = "From the gate go straight up the main lane, turn " + (p.c < 2 ? "left" : "right") +
    " at row " + "ABCD"[p.r] + ", then stop at plot " + (p.c + 1) + ".";
}

/* ---------- Memorial ---------- */
var TINT = [["#fbf0cf", "#f0d890"], ["#e4ecf8", "#b9c9e6"], ["#f8e6ea", "#e6bfca"], ["#e6f1e2", "#bfd9b8"], ["#ece6f7", "#cbbfe6"], ["#fbeadb", "#efc9a6"]];
var GLYPH = [
  '<circle cx="12" cy="12" r="4"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1"/>',
  '<path d="M5 19C5 9 11 5 19 5c0 8-4 14-14 14zM5 19l8-8"/>',
  '<path d="M4 11l8-7 8 7v9H4zM10 20v-6h4v6"/>',
  '<path d="M12 3l2.6 5.6 6 .7-4.4 4.2 1.2 6L12 16.6 6.6 19.5l1.2-6L3.4 9.3l6-.7z"/>',
  '<circle cx="12" cy="7" r="3"/><circle cx="12" cy="17" r="3"/><circle cx="7" cy="12" r="3"/><circle cx="17" cy="12" r="3"/><circle cx="12" cy="12" r="1.5"/>',
  '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>'
];

function openMemorial() { go("s-mem"); tab("photos"); setCandle(); }

function tab(t) {
  var T = [["photos", "Photos"], ["voices", "Voice notes"], ["video", "Memorial video"], ["chat", "Talk"]], h = "";
  T.forEach(function (x) { h += '<button class="' + (x[0] == t ? "on" : "") + '" onclick="tab(\'' + x[0] + "')\">" + x[1] + "</button>"; });
  document.getElementById("tabs").innerHTML = h;
  document.getElementById("mav").textContent = ini(cur.n);
  document.getElementById("mn").textContent = cur.n;
  document.getElementById("my").textContent = cur.y;
  var c = "";
  if (t == "photos") {
    c = '<div class="grid">';
    for (var i = 0; i < 6; i++) c += '<div class="ph" style="--i:' + i + ';background:linear-gradient(145deg,' + TINT[i][0] + "," + TINT[i][1] + ')"><svg viewBox="0 0 24 24">' + GLYPH[i] + "</svg></div>";
    c += '</div><p class="note">Sample placeholders. Family photos appear here.</p>';
  }
  if (t == "voices") {
    ["Good morning, my dear", "Be kind to each other", "I am proud of you"].forEach(function (n, i) {
      c += '<div class="vn"><button class="pl" onclick="play(this)">▶</button><div class="bars">' + bars() + '</div><span class="cap">0:0' + (7 + i * 3) + '</span></div><div class="cap">' + n + " (demo, no audio)</div>";
    });
  }
  if (t == "video") {
    c = subscribed
      ? '<div class="lock"><div class="glyph">✦</div><h3 class="big">Memorial video</h3><p class="note">The slideshow plays here.</p></div>'
      : '<div class="lock"><div class="glyph">✦</div><h3 class="big">A memorial video, made with love</h3><p class="note">Subscribe to watch the full video.</p><button class="btn" onclick="subscribed=true;tab(\'video\')"><span>Subscribe (demo)</span></button></div>';
  }
  if (t == "chat") {
    c = '<div class="notice"><b>AI memory, not the real person.</b> Built only from messages the family chose to share. Optional, and needs family permission.' +
      '<label><input type="checkbox" id="ok" onchange="chatState()"> The family has given permission.</label></div>' +
      '<div class="chat" id="ch"></div><div class="row"><input id="ci" placeholder="Write a message…" disabled><button class="btn" id="cs" onclick="send()" disabled><span>Send</span></button></div>';
  }
  document.getElementById("tc").innerHTML = '<div class="card">' + c + "</div>";
}

function bars() { var s = ""; for (var i = 0; i < 26; i++) s += '<i style="height:' + (6 + Math.abs(Math.sin(i * 1.3)) * 20) + 'px"></i>'; return s; }
function play(b) { var el = b.parentNode.querySelector(".bars"); el.classList.toggle("play"); b.textContent = el.classList.contains("play") ? "❚❚" : "▶"; }

function setCandle() {
  var on = !!lit[curG.id + cur.n], b = document.getElementById("candle");
  b.classList.toggle("lit", on); b.setAttribute("aria-pressed", on);
  document.getElementById("candle-t").textContent = on ? "A candle is lit" : "Light a candle";
}
function lightCandle(e) {
  var k = curG.id + cur.n; lit[k] = !lit[k]; setCandle();
  if (lit[k]) { var r = e.currentTarget.getBoundingClientRect(); sparkle(r.left + 22, r.top + 8, 16); }
}

function chatState() {
  var on = document.getElementById("ok").checked;
  document.getElementById("ci").disabled = !on;
  document.getElementById("cs").disabled = !on;
  if (on && !document.getElementById("ch").children.length) add("them", "Hello, dear one. I am an AI memory of " + cur.n + ". How are you today?");
}
function add(w, t) { var d = document.createElement("div"); d.className = "b " + w; d.textContent = t; var ch = document.getElementById("ch"); ch.appendChild(d); ch.scrollTop = 9999; }
var REPLY = ["I am always with you in your heart.", "Take care of yourself and eat well.", "I remember our happy days together.", "Be patient, everything will be fine."];
function send() {
  var i = document.getElementById("ci"); if (!i.value.trim()) return;
  add("me", i.value); i.value = "";
  setTimeout(function () { add("them", REPLY[Math.floor(Math.random() * REPLY.length)]); }, 700);
}

renderGraves();
renderList();
