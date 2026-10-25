/* =====================================================================
   Daybreak v16: the RPG layer. HUD, camp scene, dialogue, sound, nav.
   Loaded BEFORE app.js (like expansion.js); everything is called lazily.
   ===================================================================== */

/* ---------------- sound + haptics ---------------- */
let rpgAudio = null;
function rpgSoundOn() { return !!(state && state.settings && state.settings.sound !== false); }
function rpgHapticsOn() { return !!(state && state.settings && state.settings.haptics !== false); }
function rpgCtx() {
  try {
    if (!rpgAudio) { const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null; rpgAudio = new AC(); }
    if (rpgAudio.state === "suspended") rpgAudio.resume();
    return rpgAudio;
  } catch (e) { return null; }
}
function rpgTone(freq, start, dur, type, vol) {
  const ctx = rpgCtx(); if (!ctx) return;
  const o = ctx.createOscillator(), g = ctx.createGain(), t0 = ctx.currentTime + start;
  o.type = type || "square"; o.frequency.setValueAtTime(freq, t0);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(vol || 0.04, t0 + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g); g.connect(ctx.destination); o.start(t0); o.stop(t0 + dur + 0.02);
}
function rpgSfx(kind) {
  if (!rpgSoundOn()) return;
  switch (kind) {
    case "tap":   rpgTone(660, 0, 0.05, "square", 0.025); break;
    case "coin":  rpgTone(988, 0, 0.07, "square", 0.04); rpgTone(1319, 0.07, 0.16, "square", 0.04); break;
    case "good":  rpgTone(523, 0, 0.09, "triangle", 0.06); rpgTone(659, 0.09, 0.09, "triangle", 0.06); rpgTone(784, 0.18, 0.18, "triangle", 0.06); break;
    case "level": [523, 659, 784, 1046, 1319].forEach((f, i) => rpgTone(f, i * 0.1, 0.22, "triangle", 0.07)); rpgTone(1568, 0.55, 0.5, "triangle", 0.06); break;
    case "hit":   rpgTone(180, 0, 0.09, "sawtooth", 0.05); rpgTone(110, 0.05, 0.12, "square", 0.04); break;
    case "win":   [392, 523, 659, 784].forEach((f, i) => rpgTone(f, i * 0.09, 0.2, "square", 0.045)); break;
    case "warn":  rpgTone(220, 0, 0.14, "square", 0.04); break;
  }
}
function rpgBuzz(ms) { try { if (rpgHapticsOn() && navigator.vibrate) navigator.vibrate(ms || 12); } catch (e) {} }
function toggleSound() { state.settings.sound = state.settings.sound === false; save(); render(); if (rpgSoundOn()) rpgSfx("good"); }
function toggleHaptics() { state.settings.haptics = state.settings.haptics === false; save(); render(); rpgBuzz(30); }
function rpgOnToast(text) {
  const t = String(text || "");
  if (/^Level up/i.test(t)) { rpgSfx("level"); rpgBuzz([40, 30, 80]); rpgShowBanner("LEVEL UP!", `You are now Level ${state.player.level}`, "⭐"); }
  else if (/defeated|falls|victory|complete|claimed|Grand Prize/i.test(t)) { rpgSfx("win"); rpgBuzz(25); }
  else if (/\+\d+\s?g|gold|treasure|found|gather/i.test(t)) rpgSfx("coin");
  else if (/⚠️|over budget|can't|couldn't/i.test(t)) rpgSfx("warn");
  else rpgSfx("good");
}
function rpgShowBanner(title, sub, icon) {
  ui.banner = { title, sub, icon };
  clearTimeout(ui.bannerTimer);
  ui.bannerTimer = setTimeout(() => { ui.banner = null; render(); }, 2300);
}
document.addEventListener("click", (e) => {
  const el = e.target && e.target.closest && e.target.closest("[data-act]");
  if (!el) return;
  const act = el.getAttribute("data-act");
  if (act === "setTab" || act === "toggleSection") rpgSfx("tap"); else rpgSfx("tap");
  rpgBuzz(8);
}, true);

/* ---------------- toast -> message window + banner ---------------- */
function renderToast() {
  let out = "";
  if (ui.banner) {
    const sparks = Array.from({ length: 14 }).map((_, i) => `<span class="spark" style="left:${8 + Math.random() * 84}%;top:${45 + Math.random() * 25}%;animation-delay:${(Math.random() * .5).toFixed(2)}s">${["✨", "⭐", "💫", "✦"][i % 4]}</span>`).join("");
    out += `<div class="banner">${sparks}<div class="inner"><div style="font-size:38px">${ui.banner.icon || "⭐"}</div><div class="big disp">${escapeHtml(ui.banner.title)}</div><div class="sub">${escapeHtml(ui.banner.sub || "")}</div></div></div>`;
  }
  if (ui.toast) {
    const t = String(ui.toast);
    const icon = /^Level up/i.test(t) ? "⭐" : /defeated|falls/i.test(t) ? "⚔️" : /\+\d+\s?g/i.test(t) ? "🪙" : /⚠️/.test(t) ? "⚠️" : "💬";
    out += `<div class="msgwin"><span style="font-size:20px">${icon}</span><span style="flex:1">${escapeHtml(t)}</span></div>`;
  }
  return out;
}

/* ---------------- HUD ---------------- */
function rpgBar(kind, cur, max) {
  const pct = Math.max(0, Math.min(100, max > 0 ? cur / max * 100 : 0));
  return `<div class="bar ${kind}"><i style="width:${pct}%"></i><span>${kind.toUpperCase()} ${Math.round(cur)}/${Math.round(max)}</span></div>`;
}
function heroFaceSvg() {
  return `<svg viewBox="0 0 64 64" width="100%" height="100%"><g>
    <path d="M10 64 Q32 40 54 64 Z" fill="#4b2f73"/>
    <circle cx="32" cy="34" r="12" fill="#f2d0b0"/>
    <path d="M17 31 L32 2 L47 31 Z" fill="#6f4f92"/>
    <ellipse cx="32" cy="31" rx="19" ry="4.5" fill="#8e6fb0"/>
    <rect x="18" y="28" width="28" height="3" fill="#d9a441"/>
    <circle cx="27.5" cy="35" r="1.6" fill="#3b2a30"/><circle cx="36.5" cy="35" r="1.6" fill="#3b2a30"/>
    <path d="M28 40 Q32 43 36 40" stroke="#b8715c" stroke-width="1.5" fill="none" stroke-linecap="round"/>
    <circle cx="32" cy="9" r="2.2" fill="#f2c14e"/>
  </g></svg>`;
}
function renderHeader() {
  const tLog = todayLog();
  const { charges, msToNext } = getCharges(state, ui.now);
  const cap = effectiveChargeCap();
  const orbs = Array.from({ length: cap }).map((_, i) => `<span class="orb ${i < charges ? "" : "off"}"></span>`).join("");
  const need = xpToNext(state.player.level);
  return `
  <div class="hud">
    <div class="hud-row">
      <div class="hud-portrait">${heroFaceSvg()}<span class="hud-lv">${state.player.level}</span></div>
      <div style="flex:1;min-width:0">
        <p class="hud-name disp" style="padding-right:140px">${escapeHtml(state.player.name)} ${escapeHtml(activeTitle())}</p>
        <p class="hud-sub">${tLog.encounter} · Legends: Daybreak Quest</p>
        ${rpgBar("hp", state.player.hp, maxHp())}
        ${rpgBar("mp", state.player.mp, state.player.maxMp)}
        ${rpgBar("xp", state.player.xp, need)}
      </div>
    </div>
    <div class="hud-chips">
      <span class="chip">💰 ${state.player.gold.toLocaleString()}</span>
      <span class="chip" title="Streak">🔥 ${state.streak}</span>
      ${(state.graceTokens || 0) > 0 ? `<span class="chip" title="Grace Tokens protect your streak">🛡️ ${state.graceTokens}</span>` : ""}
      <span class="chip" title="Focus${msToNext ? " · next in " + fmtMs(msToNext) : ""}">${orbs}</span>
    </div>
    <div class="hud-tools">
      <button class="hud-btn" data-act="toggleMusic" aria-label="Music" style="${state.settings.music ? "" : "opacity:.55"}">🎵</button>
      <button class="hud-btn" data-act="toggleSound" aria-label="Sound">${rpgSoundOn() ? "🔊" : "🔇"}</button>
      <button class="hud-btn" data-act="toggleTheme" aria-label="Theme">${state.theme === "dark" ? "☀️" : "🌙"}</button>
      <button class="hud-btn" data-act="openSettings" aria-label="Settings">🎛️</button>
      <button class="hud-btn" data-act="openBackup" aria-label="Backup">⚙️</button>
    </div>
  </div>`;
}

/* ---------------- bottom nav ---------------- */
function renderNav() {
  const tabs = [["home", "🏕️", "Camp"], ["explore", "🗺️", "World"], ["party", "🛡️", "Party"], ["bond", "💞", "Bonds"], ["quests", "📜", "Quests"], ["craft", "⚒️", "Forge"], ["calendar", "📅", "Almanac"]];
  return `<div class="rnav">${tabs.map(([id, ic, lb]) => `<button data-act="setTab" data-arg="${id}" class="${ui.tab === id ? "on" : ""}"><span class="ic">${ic}</span><span class="lb">${lb}</span></button>`).join("")}</div>`;
}

/* ---------------- accordion sections for the Camp screen ---------------- */
function rpgAccordion(id, icon, title, subtitle, html, defaultOpen) {
  if (!ui.sections) ui.sections = {};
  const open = ui.sections[id] === undefined ? !!defaultOpen : ui.sections[id];
  return `<div>
    <button class="acc-head disp" data-act="toggleSection" data-arg="${id}">
      <span style="font-size:20px">${icon}</span>
      <span class="t">${title}<span class="s">${subtitle}</span></span>
      <span style="font-size:13px;opacity:.9">${open ? "▾" : "▸"}</span>
    </button>
    ${open ? `<div class="acc-body">${html}</div>` : ""}
  </div>`;
}
function toggleSection(id) {
  if (!ui.sections) ui.sections = {};
  const cur = ui.sections[id];
  const def = { adv:true, well:true, home:false, sat:false }[id];
  ui.sections[id] = cur === undefined ? !def : !cur;
  render();
}

/* ---------------- camp scene ---------------- */
function rpgSky() {
  const d = new Date(), h = d.getHours() + d.getMinutes() / 60;
  let top, bot, kind;
  if (h < 5 || h >= 21) { top = "#0e0c24"; bot = "#2b2357"; kind = "night"; }
  else if (h < 7.5) { top = "#5b4a8f"; bot = "#f6b99a"; kind = "dawn"; }
  else if (h < 17) { top = "#6db6e6"; bot = "#e6f3dc"; kind = "day"; }
  else if (h < 19.5) { top = "#5b3f7a"; bot = "#f0a07a"; kind = "dusk"; }
  else { top = "#1e1740"; bot = "#5b3f7a"; kind = "evening"; }
  return { top, bot, kind, h };
}
function chibi(x, y, o) {
  const { cloak, hair, emblem, hat, staff, id, flip } = o;
  const body = `
    <ellipse cx="0" cy="1" rx="13" ry="3.4" fill="rgba(0,0,0,.3)"/>
    <path d="M-10 0 L-7.5 -24 L7.5 -24 L10 0 Z" fill="${cloak}"/>
    <rect x="-7.5" y="-25" width="15" height="3" fill="#d9a441"/>
    ${emblem ? `<text x="0" y="-9" font-size="9" text-anchor="middle">${emblem}</text>` : ""}
    <circle cx="0" cy="-33" r="8" fill="#f2d0b0"/>
    ${hat ? `<path d="M-10.5 -36 L0 -60 L10.5 -36 Z" fill="${hat}"/><ellipse cx="0" cy="-36" rx="12.5" ry="3" fill="${hat}" opacity=".9"/>`
          : `<path d="M-8.5 -35 Q0 -46 8.5 -35 Q4 -38 0 -37 Q-4 -38 -8.5 -35Z" fill="${hair}"/>`}
    <circle cx="-3" cy="-33" r="1.2" fill="#3b2a30"/><circle cx="3" cy="-33" r="1.2" fill="#3b2a30"/>
    <path d="M-2 -29.5 Q0 -28 2 -29.5" stroke="#b8715c" stroke-width="1" fill="none" stroke-linecap="round"/>
    ${staff ? `<line x1="14" y1="0" x2="14" y2="-46" stroke="#7a5a3a" stroke-width="2.4" stroke-linecap="round"/><circle cx="14" cy="-50" r="4" fill="#f2c14e"/><circle cx="14" cy="-50" r="7" fill="#f2c14e" opacity=".25"/>` : ""}`;
  return `<g class="hot" data-act="sceneTalk" data-arg="${id}" transform="translate(${x} ${y})${flip ? " scale(-1 1)" : ""}"><rect x="-16" y="-62" width="32" height="66" fill="transparent"/><g class="bob" style="animation-delay:${(Math.random() * 1.5).toFixed(2)}s">${body}</g></g>`;
}
function soelSprite(x, y) {
  return `<g class="hot" data-act="sceneTalk" data-arg="soel" transform="translate(${x} ${y})"><rect x="-14" y="-24" width="30" height="28" fill="transparent"/>
    <ellipse cx="0" cy="1" rx="11" ry="2.8" fill="rgba(0,0,0,.3)"/>
    <g class="tailwag"><path d="M9 -4 Q20 -6 18 -18" stroke="#8d8d96" stroke-width="3.2" fill="none" stroke-linecap="round"/></g>
    <ellipse cx="0" cy="-8" rx="9" ry="7.5" fill="#8d8d96"/><ellipse cx="-1" cy="-6" rx="4.5" ry="5" fill="#f1f1f4"/>
    <circle cx="-6" cy="-16" r="6" fill="#8d8d96"/><path d="M-11 -19 L-10 -26 L-6.5 -21Z M-1.5 -21 L-1 -26 L1.5 -19Z" fill="#8d8d96"/>
    <circle cx="-8" cy="-16" r="1" fill="#2c2c34"/><circle cx="-4" cy="-16" r="1" fill="#2c2c34"/></g>`;
}
function campFireSvg(x, y) {
  return `<g transform="translate(${x} ${y})">
    <ellipse cx="0" cy="2" rx="16" ry="4" fill="rgba(0,0,0,.35)"/>
    <rect x="-12" y="-3" width="24" height="5" rx="2" fill="#5a3b22" transform="rotate(-8)"/><rect x="-12" y="-3" width="24" height="5" rx="2" fill="#6b4a33" transform="rotate(8)"/>
    <g class="flame"><path d="M0 -4 Q-9 -16 0 -30 Q9 -16 0 -4Z" fill="#ff8a1f"/><path d="M0 -4 Q-5 -12 0 -21 Q5 -12 0 -4Z" fill="#ffd34d"/></g>
    <circle cx="0" cy="-14" r="30" fill="#ffb347" opacity=".13"/></g>`;
}
function renderCampScene() {
  const sky = rpgSky(), night = sky.kind === "night" || sky.kind === "evening";
  const party = (state.activeParty || []).map(id => PARTY.find(p => p.id === id)).filter(Boolean).slice(0, 3);
  const spots = [124, 250, 306];
  const crew = party.map((m, i) => chibi(spots[i], 218, { id: m.id, cloak: m.color, hair: ["#3b2a30", "#7a3b2a", "#2c2c44"][i % 3], emblem: m.icon, flip: false }));
  const stars = night ? Array.from({ length: 26 }).map((_, i) => { const r = (n) => ((hashDay(`s${i}${n}`) % 1000) / 1000); return `<circle class="star" cx="${(r(1) * 420).toFixed(0)}" cy="${(r(2) * 120).toFixed(0)}" r="${(0.6 + r(3) * 1.1).toFixed(1)}" fill="#fff" style="animation-delay:${(r(4) * 3).toFixed(1)}s"/>`; }).join("") : "";
  const arcX = 40 + ((sky.h - 6) / 14) * 340;
  const sunY = 110 - Math.sin(Math.max(0, Math.min(1, (sky.h - 6) / 13)) * Math.PI) * 80;
  const orb = night ? `<circle cx="330" cy="46" r="15" fill="#f6f1d9"/><circle cx="323" cy="42" r="15" fill="${sky.top}"/>` : `<circle cx="${arcX.toFixed(0)}" cy="${sunY.toFixed(0)}" r="16" fill="${sky.kind === "dusk" || sky.kind === "dawn" ? "#ffd29a" : "#fff3b0"}"/><circle cx="${arcX.toFixed(0)}" cy="${sunY.toFixed(0)}" r="30" fill="#fff3b0" opacity=".25"/>`;
  const weather = hashDay(today() + "wx") % 6;
  const wx = !night && weather === 0 ? Array.from({ length: 30 }).map((_, i) => `<line class="drop" x1="${(i * 14) % 420}" y1="0" x2="${((i * 14) % 420) - 4}" y2="10" stroke="#cfe6ff" stroke-width="1" opacity=".6" style="animation-delay:${((i * 37) % 90) / 100}s"/>`).join("")
    : night ? Array.from({ length: 7 }).map((_, i) => `<circle class="fly" cx="${60 + i * 52}" cy="${185 + (i % 3) * 14}" r="1.8" fill="#d6ff7a" style="animation-delay:${i * .6}s"/>`).join("") : "";
  const clouds = !night ? `<g class="cloud" opacity=".85"><ellipse cx="0" cy="38" rx="28" ry="8" fill="#fff"/><ellipse cx="14" cy="32" rx="16" ry="8" fill="#fff"/></g>` : "";
  const winGlow = night || sky.kind === "dusk" ? "#ffd27a" : "#9fc4d8";
  const dim = night ? "rgba(10,8,30,.25)" : "rgba(0,0,0,0)";
  const hero = chibi(174, 224, { id: "hero", cloak: "#6f4f92", hat: "#8e6fb0", staff: true, emblem: "" });
  const spk = ui.sceneSpeaker ? sceneLine(ui.sceneSpeaker) : sceneLine(null);
  return `<div>
  <div class="scene"><svg viewBox="0 0 420 250" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Your camp">
    <defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sky.top}"/><stop offset="1" stop-color="${sky.bot}"/></linearGradient>
    <linearGradient id="gr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${night ? "#27402f" : "#7fae63"}"/><stop offset="1" stop-color="${night ? "#16241b" : "#4d7a43"}"/></linearGradient></defs>
    <rect width="420" height="250" fill="url(#sky)"/>
    ${stars}${orb}${clouds}
    <path d="M0 170 Q60 120 130 160 T260 150 T420 165 V250 H0Z" fill="${night ? "#1d2a3a" : "#6f9a9e"}" opacity=".9"/>
    <path d="M0 185 Q90 140 180 178 T340 170 T420 182 V250 H0Z" fill="${night ? "#1a3326" : "#5e9a5a"}"/>
    <rect y="188" width="420" height="62" fill="url(#gr)"/>
    <g fill="${night ? "#0f1f17" : "#2f5a37"}"><path d="M14 190 l12 -44 l12 44Z"/><path d="M30 192 l10 -34 l10 34Z"/><path d="M392 192 l14 -50 l14 50Z"/></g>

    <!-- Tavern (left) -->
    <g class="hot" data-act="openTavern" transform="translate(54 186)">
      <rect x="-30" y="-34" width="60" height="34" fill="#8a5a38"/><path d="M-36 -34 L0 -62 L36 -34Z" fill="#a43d3d"/>
      <rect x="-7" y="-20" width="14" height="20" fill="#3a2414"/><rect x="-24" y="-26" width="11" height="10" fill="${winGlow}"/><rect x="13" y="-26" width="11" height="10" fill="${winGlow}"/>
      <rect x="-1" y="-54" width="2" height="14" fill="#3a2414"/><text x="0" y="-44" font-size="12" text-anchor="middle">🍺</text>
      <rect class="hl" x="-38" y="-64" width="76" height="68" fill="none" stroke="#fff3d6" stroke-width="2" rx="4"/>
      <text class="hotlabel" x="0" y="59" text-anchor="middle">Tavern</text></g>

    <!-- Forge (left-mid) -->
    <g class="hot" data-act="setTab" data-arg="craft" transform="translate(120 196)">
      <rect x="-14" y="-12" width="28" height="12" fill="#55555f"/><rect x="-18" y="-18" width="36" height="7" rx="2" fill="#3c3c46"/><path d="M14 -16 L26 -13 L14 -11Z" fill="#3c3c46"/>
      <circle cx="-2" cy="-26" r="3" fill="#ff8a1f" opacity=".85"/><circle cx="3" cy="-33" r="2" fill="#ffd34d" opacity=".6"/>
      <rect class="hl" x="-22" y="-40" width="52" height="46" fill="none" stroke="#fff3d6" stroke-width="2" rx="4"/>
      <text class="hotlabel" x="2" y="49" text-anchor="middle">Forge</text></g>

    <!-- Signpost to the World (right-mid) -->
    <g class="hot" data-act="setTab" data-arg="explore" transform="translate(286 196)">
      <rect x="-2" y="-46" width="4" height="46" fill="#6b4a33"/>
      <path d="M-26 -42 h34 l6 6 l-6 6 h-34Z" fill="#c99a5b"/><path d="M26 -30 h-30 l-6 6 l6 6 h30Z" fill="#b5834a"/>
      <text x="-9" y="-35" font-size="7" text-anchor="middle" fill="#3a2414">World</text><text x="12" y="-23" font-size="7" text-anchor="middle" fill="#3a2414">Wilds</text>
      <rect class="hl" x="-30" y="-50" width="64" height="56" fill="none" stroke="#fff3d6" stroke-width="2" rx="4"/>
      <text class="hotlabel" x="0" y="49" text-anchor="middle">World Map</text></g>

    <!-- Guild hall + quest board (right) -->
    <g class="hot" data-act="setTab" data-arg="quests" transform="translate(372 186)">
      <rect x="-26" y="-40" width="52" height="40" fill="#7a6a8a"/><path d="M-31 -40 L0 -66 L31 -40Z" fill="#4b3d63"/>
      <rect x="-6" y="-22" width="12" height="22" fill="#2e2440"/><rect x="-21" y="-30" width="9" height="9" fill="${winGlow}"/><rect x="12" y="-30" width="9" height="9" fill="${winGlow}"/>
      <rect x="-20" y="-6" width="12" height="9" fill="#e8d3a2" transform="translate(-20 -2)"/><text x="-34" y="3" font-size="8">📜</text>
      <rect class="hl" x="-42" y="-68" width="86" height="76" fill="none" stroke="#fff3d6" stroke-width="2" rx="4"/>
      <text class="hotlabel" x="0" y="59" text-anchor="middle">Quest Board</text></g>

    ${campDecorSvg(night)}
    <!-- Pond -->
    <g class="hot" data-act="openPond" transform="translate(376 228)"><ellipse cx="0" cy="0" rx="30" ry="8" fill="${night ? "#1f3a5a" : "#5fb3d9"}" stroke="#2f5a7a" stroke-width="1.5"/><ellipse cx="-6" cy="-1" rx="8" ry="2" fill="#fff" opacity=".35"/><g transform="translate(8 -2)"><circle r="2.6" fill="#fff"/><path d="M-2.6 0 A2.6 2.6 0 0 0 2.6 0Z" fill="#d9232d"/></g><rect class="hl" x="-34" y="-12" width="68" height="24" fill="none" stroke="#fff3d6" stroke-width="2" rx="6"/><text class="hotlabel" x="0" y="-12" text-anchor="middle">Pond</text></g>
    ${campFireSvg(215, 226)}
    ${heroAuraSvg(174, 224)}${hero}${crew.join("")}${soelSprite(236, 232)}
    ${wx}
    <rect width="420" height="250" fill="${dim}" pointer-events="none"/>
  </svg></div>
  <div class="dialog" data-act="sceneTalk" data-arg="${ui.sceneSpeaker || ""}">
    <span class="plate disp">${escapeHtml(spk.name)}</span>
    <p>${escapeHtml(spk.text)}</p>
    <span class="next">tap a friend ▸</span>
  </div></div>`;
}

/* ---------------- NPC dialogue (reactive to your real habits) ---------------- */
const SCENE_LINES = {
  joel: ["I've got the fire. You take your time.", "Whatever today is, we'll carry it together.", "Sit a minute. The Wilds aren't going anywhere."],
  aisyah: ["Don't just stand there — the day's wasting.", "I counted the coin pouch twice. You're doing fine.", "Little sister energy, activated."],
  mezstorm: ["I've got a tune stuck in my head. Hum with me?", "Chaos is just music nobody's arranged yet.", "The fire sounds nice tonight."],
  eliz: ["I'm keeping track of how you're doing. Quietly.", "You look like you could use a snack.", "Everyone needs one thing today. What's yours?"],
  senedra: ["Race you to the ridge! ...kidding. Mostly.", "I found a shortcut. It's scenic, I swear.", "Faster isn't always better. I'm learning!"],
  zaki: ["I have an idea. It might explode. It's a good idea.", "Almost finished the lantern. Almost.", "Wrong is allowed. Draft one!"],
  soel: ["*slow blink*", "*purrs, deeply unimpressed, deeply approving*", "*curls up beside the fire and guards everyone*"],
  hero: ["Another day at Daybreak Camp.", "The fire's warm, the road's open.", "One step, then another. That's the whole quest."],
};
function sceneLine(id) {
  const who = id && id !== "hero" ? (PARTY.find(p => p.id === id) || { name: "You", id: "hero" }) : { name: "Daybreak Camp", id: "camp" };
  if (!id) {
    const sky = rpgSky();
    const greet = { night: "The camp is quiet. Stars out, fire low.", dawn: "First light over the ridge. A good day to begin.", day: "Sunlight and a busy camp.", dusk: "The sky's turning gold. Wind down when you're ready.", evening: "Evening settles over the camp." }[sky.kind];
    return { name: "Daybreak Camp", text: `${greet} Tap a friend to chat, or a building to go there.` };
  }
  const key = who.id;
  let line = null;
  try {
    const b = habitBuffs();
    if (key === "eliz" && !b.water) line = "Water first, hero. Just a cup. I'll wait.";
    else if (key === "eliz" && b.water && b.food && b.sleep) line = "Water, food, sleep — I checked everything. Proud of you.";
    else if (key === "joel" && !b.sleep && new Date().getHours() >= 21) line = "It's late. Whatever's left can happen tomorrow.";
    else if (key === "joel" && habitBossDefeated && habitBossDefeated() && !habitBossClaimed()) line = "That boss is down. Go claim what it dropped.";
    else if (key === "aisyah" && Object.values(state.bills || {}).some(x => x && x.dueDay && !x.paidThisMonth && new Date().getDate() >= x.dueDay)) line = "A bill's overdue. Not scolding. Just pointing.";
    else if (key === "senedra" && wildsEnsure().actions === 0) line = "Haven't been out in the Wilds today. Race you?";
    else if (key === "zaki" && (state.totalCheckIns || 0) > 0 && !(state.dailyLog && state.dailyLog.crafted)) line = "Haven't crafted anything today. The forge is lonely.";
    else if (key === "mezstorm" && isDateInPeriod(today())) line = "Gentle day, yeah? Rest is allowed. I'll hum quietly.";
    else if (key === "hero" || key === "camp") line = null;
  } catch (e) {}
  if (!line) {
    const aff = (state.affinity && state.affinity[key]) || 0;
    const sn = (typeof SNIPPETS !== "undefined" && SNIPPETS[key] || []).filter(s => s.at <= aff);
    const pool = (SCENE_LINES[key] || SCENE_LINES.hero).concat(sn.map(s => s.line.replace(/^"|"$/g, "")));
    line = pool[Math.floor(Math.random() * pool.length)];
  }
  return { name: key === "hero" ? state.player.name : who.name, text: line };
}
function sceneTalk(id) {
  ui.sceneSpeaker = id || null;
  rpgSfx("good");
  if (id) { try { state.affinity[id] = state.affinity[id] || 0; } catch (e) {} }
  render();
}

/* ---------------- settings block ---------------- */
function rpgSettingsHtml() {
  const on = (v) => v !== false;
  const btn = (act, label, active) => `<button data-act="${act}" class="disp" style="flex:1;padding:9px 4px;border-radius:12px;font-size:12px;font-weight:700;background:${active ? C.sage : C.creamDeep};color:${active ? "white" : C.ink}">${label}</button>`;
  return `<p class="disp" style="font-weight:700;font-size:12.5px;color:${C.mageDeep};margin:0 0 6px">🔊 Sound & Feel</p>
    <p style="font-size:10.5px;color:${C.inkSoft};margin:0 0 8px">Little chiptune blips, fanfares and a touch of vibration. Quiet by design.</p>
    <div style="display:flex;gap:6px;margin-bottom:16px">${btn("toggleSound", on(state.settings.sound) ? "Sound: On" : "Sound: Off", on(state.settings.sound))}${btn("toggleHaptics", on(state.settings.haptics) ? "Vibration: On" : "Vibration: Off", on(state.settings.haptics))}</div>`;
}
