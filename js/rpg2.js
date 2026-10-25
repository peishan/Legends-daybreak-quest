/* =====================================================================
   Daybreak v16.1: character sprites, battle stage, tab banners, music.
   Loaded after rpg.js and before app.js. Overrides chibi() from rpg.js.
   ===================================================================== */

/* ---------------- character sprites ---------------- */
const CHAR_DEFS = {
  hero:     { s:1,    skin:"#f2d0b0", outfit:"#6f4f92", trim:"#d9a441", hair:"#3b2a30", style:"hat",   hat:"#8e6fb0", prop:"staff",  dress:true },
  joel:     { s:1.06, skin:"#e0b48c", outfit:"#3f6fb5", trim:"#cfd5e0", hair:"#2b2124", style:"short", prop:"shield" },
  aisyah:   { s:1,    skin:"#e0b48c", outfit:"#4f9a6a", trim:"#e8d9a0", hair:"#4a2a1c", style:"pony",  prop:"sword" },
  mezstorm: { s:1,    skin:"#f2d0b0", outfit:"#c24f8f", trim:"#f6c7e0", hair:"#e58bb5", style:"long",  prop:"note",   dress:true },
  eliz:     { s:.82,  skin:"#f2d0b0", outfit:"#e98fa3", trim:"#ffffff", hair:"#2b2124", style:"twin",  prop:"heart",  dress:true },
  senedra:  { s:.84,  skin:"#d9a27a", outfit:"#e0a83a", trim:"#fff3c4", hair:"#5a3320", style:"pony",  prop:"star" },
  zaki:     { s:.86,  skin:"#d9a27a", outfit:"#d9733a", trim:"#6b4a33", hair:"#2b2124", style:"spiky", prop:"hammer" },
};
function charBody(id) {
  const d = CHAR_DEFS[id] || CHAR_DEFS.hero;
  const { skin, outfit, trim, hair, style, hat, prop, dress } = d;
  const dk = "rgba(0,0,0,.28)";
  // hair behind head
  let back = "";
  if (style === "long") back = `<path d="M-10 -36 Q-12 -14 -8 -12 L8 -12 Q12 -14 10 -36 Z" fill="${hair}"/>`;
  if (style === "pony") back = `<path d="M8 -38 Q20 -36 17 -24 Q14 -30 8 -30 Z" fill="${hair}"/>`;
  if (style === "twin") back = `<circle cx="-11" cy="-31" r="4.6" fill="${hair}"/><circle cx="11" cy="-31" r="4.6" fill="${hair}"/>`;
  const legs = `<rect x="-5.5" y="-9" width="4.4" height="9" rx="1.5" fill="#3a2d33"/><rect x="1.1" y="-9" width="4.4" height="9" rx="1.5" fill="#3a2d33"/>`;
  const bodyPath = dress
    ? `<path d="M-11 -5 L-7 -27 L7 -27 L11 -5 Z" fill="${outfit}"/><path d="M-11 -5 L11 -5 L10 -2 L-10 -2Z" fill="${trim}"/>`
    : `<path d="M-8 -9 L-9 -27 L9 -27 L8 -9 Z" fill="${outfit}"/><rect x="-8.6" y="-14" width="17.2" height="2.6" fill="${trim}"/>`;
  const arms = `<rect x="-12.5" y="-26" width="4" height="12" rx="2" fill="${outfit}"/><rect x="8.5" y="-26" width="4" height="12" rx="2" fill="${outfit}"/><circle cx="-10.5" cy="-13" r="2.3" fill="${skin}"/><circle cx="10.5" cy="-13" r="2.3" fill="${skin}"/>`;
  const head = `<circle cx="0" cy="-35" r="9.4" fill="${skin}"/><circle cx="-5.6" cy="-32" r="1.7" fill="#ff8aa0" opacity=".35"/><circle cx="5.6" cy="-32" r="1.7" fill="#ff8aa0" opacity=".35"/>
    <ellipse cx="-3.4" cy="-35" rx="1.5" ry="2" fill="#2b1f26"/><ellipse cx="3.4" cy="-35" rx="1.5" ry="2" fill="#2b1f26"/><circle cx="-3" cy="-35.8" r=".6" fill="#fff"/><circle cx="3.8" cy="-35.8" r=".6" fill="#fff"/>
    <path d="M-2 -30.6 Q0 -29 2 -30.6" stroke="#b8715c" stroke-width="1" fill="none" stroke-linecap="round"/>`;
  let front = "";
  if (style === "hat") front = `<path d="M-12 -39 L2 -64 L11.5 -39 Z" fill="${hat}"/><ellipse cx="0" cy="-39" rx="14" ry="3.4" fill="${hat}"/><rect x="-10.5" y="-42" width="21" height="3" fill="${trim}"/><circle cx="2" cy="-63" r="2" fill="#f2c14e"/>`;
  else if (style === "short") front = `<path d="M-9.6 -36 Q-9 -47 0 -46.5 Q9 -47 9.6 -36 Q5 -40 0 -39.5 Q-5 -40 -9.6 -36Z" fill="${hair}"/>`;
  else if (style === "pony" || style === "twin") front = `<path d="M-9.6 -36 Q-9.5 -47.5 0 -47 Q9.5 -47.5 9.6 -36 Q4 -41 -1 -40 Q-6 -40.5 -9.6 -36Z" fill="${hair}"/>${style === "twin" ? `<rect x="-11.6" y="-33" width="2.4" height="2.4" fill="#fff"/><rect x="9.2" y="-33" width="2.4" height="2.4" fill="#fff"/>` : ""}`;
  else if (style === "long") front = `<path d="M-10 -34 Q-10.5 -47.5 0 -47 Q10.5 -47.5 10 -34 Q5 -40 0 -39 Q-5 -40 -10 -34Z" fill="${hair}"/>`;
  else if (style === "spiky") front = `<path d="M-9.6 -36 L-8 -48 L-4 -42 L0 -50 L4 -42 L8 -48 L9.6 -36 Q4 -40 0 -39.5 Q-4 -40 -9.6 -36Z" fill="${hair}"/><rect x="-8" y="-43" width="16" height="3.2" rx="1.2" fill="#9a8a60"/><circle cx="-4.5" cy="-41.4" r="2.1" fill="#bfe6f2" stroke="#6b4a33" stroke-width=".8"/><circle cx="4.5" cy="-41.4" r="2.1" fill="#bfe6f2" stroke="#6b4a33" stroke-width=".8"/>`;
  let pr = "";
  if (prop === "staff") pr = `<line x1="16" y1="2" x2="16" y2="-52" stroke="#7a5a3a" stroke-width="2.6" stroke-linecap="round"/><circle cx="16" cy="-56" r="4.5" fill="#f2c14e"/><circle cx="16" cy="-56" r="9" fill="#f2c14e" opacity=".25"/>`;
  if (prop === "shield") pr = `<path d="M-23 -26 L-12 -26 L-12 -14 Q-17.5 -8 -23 -14Z" fill="${trim}" stroke="#7a8190" stroke-width="1"/><path d="M-17.5 -25 V-11" stroke="${outfit}" stroke-width="2"/>`;
  if (prop === "sword") pr = `<line x1="16" y1="-12" x2="16" y2="-42" stroke="#dfe5ee" stroke-width="2.6" stroke-linecap="round"/><rect x="12" y="-14" width="8" height="2.4" fill="#d9a441"/>`;
  if (prop === "hammer") pr = `<line x1="15" y1="-10" x2="15" y2="-34" stroke="#7a5a3a" stroke-width="2.4" stroke-linecap="round"/><rect x="9.5" y="-40" width="11" height="7" rx="1.5" fill="#8a8a96"/>`;
  if (prop === "note") pr = `<text x="15" y="-30" font-size="12" fill="${trim}" font-family="serif">♪</text>`;
  if (prop === "heart") pr = `<text x="11" y="-25" font-size="10" fill="#ff5c7a">♥</text>`;
  if (prop === "star") pr = `<text x="11" y="-25" font-size="10" fill="#ffcf40">★</text>`;
  return `<ellipse cx="0" cy="1" rx="13" ry="3.4" fill="${dk}"/>${back}${legs}${bodyPath}${arms}${head}${front}${pr}`;
}
function chibi(x, y, o) {
  const id = (o && o.id) || "hero";
  const d = CHAR_DEFS[id] || CHAR_DEFS.hero;
  const act = id === "soel" ? "sceneTalk" : "sceneTalk";
  return `<g class="hot" data-act="${act}" data-arg="${id}" transform="translate(${x} ${y}) scale(${d.s})"><rect x="-18" y="-66" width="36" height="70" fill="transparent"/><g class="bob" style="animation-delay:${(Math.random() * 1.5).toFixed(2)}s">${charBody(id)}</g></g>`;
}
function spriteSvg(id, px) {
  const w = px || 48, h = Math.round(w * 74 / 52);
  return `<svg viewBox="-26 -68 52 74" width="${w}" height="${h}" style="display:block;overflow:visible"><g class="bob">${charBody(id)}</g></svg>`;
}

/* ---------------- battle stage ---------------- */
function enemyIcon(name, boss) {
  const tables = [typeof HUNTING_MONSTERS !== "undefined" ? HUNTING_MONSTERS : [], typeof WANDERING_MONSTERS !== "undefined" ? WANDERING_MONSTERS : [], typeof DRAGONS !== "undefined" ? DRAGONS : [], typeof BOSSES !== "undefined" ? BOSSES : []];
  const clean = String(name || "").replace(/\s*\(.*\)$/, "");
  for (const t of tables) { const f = t.find(m => m.name === clean && m.icon); if (f) return f.icon; }
  const named = { "Scroll Wraith":"📜", "Notification Imp":"📳", "Feed Serpent":"🐍", "Doubt Specter":"🌫️" };
  if (named[clean]) return named[clean];
  const pool = boss ? ["👹", "🐲", "💀", "🦑", "🗿"] : ["👻", "🦇", "🕷️", "🐍", "🫧"];
  return pool[hashDay(clean) % pool.length];
}
function encEnemyList(enc) {
  if (enc.enemies) return enc.enemies.map((e, i) => ({ name: e.name, hp: e.hp, maxHp: e.maxHp, boss: false, target: i === enc.targetIndex }));
  return [{ name: enc.enemyName, hp: enc.enemyHp, maxHp: enc.enemyMaxHp, boss: !!enc.isBoss, target: true }];
}
function battleStageHtml(enc) {
  const list = encEnemyList(enc);
  const hitE = ui.fx && ui.fx.enemy, hurtP = ui.fx && ui.fx.player;
  const hitKind = hitE ? hitE.kind : null;
  if (hitKind === "hit" || hitKind === "crit") { rpgSfx("hit"); rpgBuzz(hitKind === "crit" ? 30 : 14); }
  else if (hurtP && hurtP.kind === "retaliation") { rpgSfx("warn"); rpgBuzz(25); }
  const sky = rpgSky(), night = sky.kind === "night" || sky.kind === "evening";
  const party = (state.activeParty || []).map(id => PARTY.find(p => p.id === id)).filter(Boolean).slice(0, 2);
  const lunge = hitKind === "hit" || hitKind === "crit";
  const heroCls = hurtP && hurtP.kind === "retaliation" ? "fx-shake fx-flash" : "";
  const xs = list.length === 1 ? [310] : list.length === 2 ? [270, 350] : [230, 300, 370];
  const ens = list.map((e, i) => {
    const alive = e.hp > 0, big = e.boss, sc = big ? 1.9 : list.length > 1 ? 1.0 : 1.3;
    const pct = Math.max(0, e.hp / e.maxHp * 100), w = big ? 90 : 52, cls = (lunge && e.target) ? "enemyhit" : "";
    return `<g transform="translate(${xs[i]} ${big ? 138 : 134})" opacity="${alive ? 1 : .18}">
      <ellipse cx="0" cy="2" rx="${big ? 40 : 20}" ry="${big ? 8 : 5}" fill="rgba(0,0,0,.35)"/>
      <g class="${cls}"><g class="bob"><g transform="scale(${(big ? 1.9 : list.length > 1 ? 1.0 : 1.3)})">${enemyBody(e.name, big)}</g></g></g>
      ${alive ? `<rect x="${-w / 2}" y="${big ? -92 : -62}" width="${w}" height="6" rx="3" fill="#1c130c" stroke="#000" stroke-width=".6"/><rect x="${-w / 2 + .6}" y="${big ? -91.4 : -61.4}" width="${Math.max(0, (w - 1.2) * pct / 100)}" height="4.8" rx="2.4" fill="#e5484d"/>` : ""}
      ${alive && list.length > 1 && e.target ? `<text x="0" y="${big ? -98 : -68}" font-size="11" text-anchor="middle" fill="#ffe27a">▼</text>` : ""}
      ${lunge && e.target ? `<circle class="burst" cx="0" cy="${big ? -30 : -14}" r="${big ? 34 : 20}" fill="${hitKind === "crit" ? "#ffd34d" : "#ffffff"}"/>` : ""}
    </g>`;
  }).join("");
  const crew = party.map((m, i) => `<g transform="translate(${[30, 118][i]} ${[150, 148][i]})" opacity=".96"><g class="hot0">${chibiStatic(m.id)}</g></g>`).join("");
  const stageBg = night ? ["#1a1538", "#3b2a63", "#1d3a2b", "#12261c"] : ["#7cbfe8", "#e9f4dc", "#6fa05a", "#497a43"];
  return `<div style="position:relative;margin-bottom:10px"><div class="scene" style="border-width:2px">
    <svg viewBox="0 0 420 170" preserveAspectRatio="xMidYMid slice">
      <defs><linearGradient id="bsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${stageBg[0]}"/><stop offset="1" stop-color="${stageBg[1]}"/></linearGradient>
      <linearGradient id="bgr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${stageBg[2]}"/><stop offset="1" stop-color="${stageBg[3]}"/></linearGradient></defs>
      <rect width="420" height="170" fill="url(#bsky)"/>
      <path d="M0 110 Q70 70 150 105 T300 98 T420 108 V170 H0Z" fill="${night ? "#1f2f3f" : "#6f9a9e"}" opacity=".9"/>
      <rect y="120" width="420" height="50" fill="url(#bgr)"/>
      <g class="${heroCls}"><g transform="translate(${lunge ? 0 : 0} 0)"><g style="${lunge ? "animation:lunge .45s ease-out" : ""}"><g transform="translate(78 150)"><g class="bob">${charBody("hero")}</g></g></g></g></g>
      ${crew}${ens}
    </svg></div>
    ${renderFxOverlay("enemy") ? `<div style="position:absolute;right:${list.length === 1 ? 70 : 60}px;top:30px;width:0;height:0">${renderFxOverlay("enemy")}</div>` : ""}
  </div>`;
}
function chibiStatic(id) { const d = CHAR_DEFS[id] || CHAR_DEFS.hero; return `<g transform="scale(${d.s * .92})"><g class="bob" style="animation-delay:${(Math.random()).toFixed(2)}s">${charBody(id)}</g></g>`; }

/* ---------------- tab banners ---------------- */
function tabBannerHtml(tab) {
  if (tab === "home") return "";
  const sky = rpgSky(), night = sky.kind === "night" || sky.kind === "evening";
  const wrap = (title, sub, inner, bgA, bgB) => `<div class="scene" style="margin-bottom:14px"><svg viewBox="0 0 420 120" preserveAspectRatio="xMidYMid slice">
    <defs><linearGradient id="tb" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${bgA}"/><stop offset="1" stop-color="${bgB}"/></linearGradient></defs>
    <rect width="420" height="120" fill="url(#tb)"/>${inner}
    <rect x="0" y="86" width="420" height="34" fill="rgba(0,0,0,.45)"/>
    <text x="14" y="106" font-size="16" font-weight="700" fill="#fff3d6" style="letter-spacing:1px" font-variant="small-caps">${title}</text>
    <text x="14" y="117" font-size="8.5" fill="#d9c39a">${sub}</text></svg></div>`;
  const ids = ["hero"].concat((state.activeParty || []).slice(0, 4));
  if (tab === "party") {
    const roster = ["hero", "joel", "aisyah", "mezstorm", "eliz", "senedra", "zaki"].filter(id => id === "hero" || (PARTY.find(p => p.id === id) && state.player.level >= PARTY.find(p => p.id === id).unlockLv));
    const step = 360 / Math.max(roster.length, 1);
    const figs = roster.map((id, i) => { const d = CHAR_DEFS[id]; return `<g transform="translate(${46 + i * step} 90) scale(${d.s * .9})"><g class="bob" style="animation-delay:${(i * .3).toFixed(1)}s">${charBody(id)}</g></g>`; }).join("");
    return wrap("The Roster", "Your party, standing ready", `<rect y="80" width="420" height="10" fill="#6b5a73"/>${figs}`, "#3a2a58", "#8e6fb0");
  }
  if (tab === "bond") {
    const sit = ids.slice(0, 4).map((id, i) => { const d = CHAR_DEFS[id] || CHAR_DEFS.hero; const x = [120, 170, 270, 320][i]; return `<g transform="translate(${x} 90) scale(${d.s * .9})"><g class="bob" style="animation-delay:${(i * .5).toFixed(1)}s">${charBody(id)}</g></g>`; }).join("");
    return wrap("The Fireside", "Spend time. Hear stories. Grow closer", `<circle cx="210" cy="60" r="60" fill="#ff8a1f" opacity=".12"/>${campFireSvg(220, 92)}${sit}`, "#2a1c3a", "#6b3b3b");
  }
  if (tab === "quests") {
    const notes = [[40, 18, -6, "#f6e7a8"], [120, 26, 4, "#e8d3a2"], [205, 16, -3, "#f3c7c7"], [290, 24, 5, "#cfe6d0"], [360, 14, -4, "#f6e7a8"]].map(([x, y, r, c]) => `<g transform="translate(${x} ${y}) rotate(${r})"><rect width="50" height="52" fill="${c}" stroke="rgba(0,0,0,.3)"/><circle cx="25" cy="5" r="3" fill="#c0392b"/><rect x="7" y="16" width="36" height="2" fill="rgba(0,0,0,.35)"/><rect x="7" y="23" width="30" height="2" fill="rgba(0,0,0,.3)"/><rect x="7" y="30" width="34" height="2" fill="rgba(0,0,0,.3)"/></g>`).join("");
    return wrap("The Quest Board", "Errands, bounties and stories", `<rect width="420" height="86" fill="#7a5436"/><g opacity=".25">${Array.from({ length: 12 }).map((_, i) => `<rect x="${i * 36}" width="2" height="86" fill="#000"/>`).join("")}</g>${notes}`, "#5a3d27", "#8a5a38");
  }
  if (tab === "craft") {
    return wrap("Alchemy & Forge", "Turn gathered things into good ones", `<rect y="70" width="420" height="16" fill="#3a3a44"/><g transform="translate(300 70)"><rect x="-26" y="-14" width="52" height="14" fill="#55555f"/><rect x="-34" y="-24" width="68" height="10" rx="3" fill="#3c3c46"/><path d="M34 -22 L52 -18 L34 -14Z" fill="#3c3c46"/></g>
      <g transform="translate(90 80)"><ellipse cx="0" cy="4" rx="40" ry="8" fill="rgba(0,0,0,.4)"/><path d="M-34 0 Q0 -50 34 0Z" fill="#ff7a1a" class="flame"/><path d="M-20 0 Q0 -30 20 0Z" fill="#ffd34d" class="flame"/></g>
      ${Array.from({ length: 8 }).map((_, i) => `<circle class="fly" cx="${80 + i * 22}" cy="${50 - (i % 3) * 8}" r="1.6" fill="#ffb347" style="animation-delay:${i * .4}s"/>`).join("")}
      <g transform="translate(200 90)"><g class="bob">${charBody("hero")}</g></g>`, "#241a1a", "#5a2a1a");
  }
  if (tab === "calendar") {
    const phases = ["🌑", "🌒", "🌓", "🌔", "🌕", "🌖", "🌗", "🌘"].map((p, i) => `<text x="${34 + i * 50}" y="52" font-size="26" text-anchor="middle" opacity="${.45 + .1 * (i % 3)}">${p}</text>`).join("");
    return wrap("The Almanac", "Days, moons, holidays and cycles", `${night ? "" : ""}<path d="M0 70 Q210 20 420 70" stroke="rgba(255,255,255,.25)" stroke-width="2" fill="none" stroke-dasharray="4 5"/>${phases}`, "#14122b", "#3b3a7a");
  }
  if (tab === "explore") {
    const route = `<path d="M30 70 C90 20 130 90 200 50 S320 20 390 62" stroke="#7a5436" stroke-width="3" fill="none" stroke-dasharray="3 6" stroke-linecap="round"/>`;
    const marks = [[30, 70, "🏕️"], [118, 48, "🌲"], [200, 50, "🏪"], [290, 40, "⛰️"], [390, 62, "🏰"]].map(([x, y, e]) => `<text x="${x}" y="${y + 6}" font-size="20" text-anchor="middle">${e}</text>`).join("");
    return wrap("The World Map", "Roads, zones, landmarks and the Wilds", `<rect width="420" height="86" fill="#e8d3a2"/><rect width="420" height="86" fill="rgba(122,84,54,.12)"/>${route}${marks}<text x="372" y="26" font-size="22">🧭</text>`, "#c9a86a", "#e8d3a2");
  }
  return "";
}

/* ---------------- music ---------------- */
const MUSIC = {
  camp:   { bpm: 66,  wave: "triangle", bass: "sine",     chords: [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]], scale: [69, 72, 74, 76, 79, 81], arpEvery: 2, vol: 0.022 },
  battle: { bpm: 132, wave: "square",   bass: "sawtooth", chords: [[57, 60, 64], [53, 57, 60], [55, 59, 62], [52, 56, 59]], scale: [69, 72, 74, 76, 79, 81, 84], arpEvery: 1, vol: 0.016 },
};
let musicTimer = null, musicNext = 0, musicStep = 0, musicMode = null, musicGain = null;
const mf = (m) => 440 * Math.pow(2, (m - 69) / 12);
function musicWanted() { return !!(state && state.settings && state.settings.music) && !document.hidden; }
function musicNote(freq, t, dur, type, vol) {
  const ctx = rpgCtx(); if (!ctx || !musicGain) return;
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = type; o.frequency.value = freq;
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(musicGain); o.start(t); o.stop(t + dur + 0.05);
}
function musicTick() {
  const ctx = rpgCtx();
  if (!ctx || !musicWanted()) return;
  const want = (ui.encounter || ui.expedition || (ui.dungeon && ui.dungeon.roomState)) ? "battle" : "camp";
  if (want !== musicMode) { musicMode = want; musicStep = 0; musicNext = ctx.currentTime + 0.05; }
  const m = MUSIC[musicMode], stepDur = 60 / m.bpm / 2;
  while (musicNext < ctx.currentTime + 0.4) {
    const bar = Math.floor(musicStep / 8) % m.chords.length, chord = m.chords[bar], i = musicStep % 8;
    if (i === 0) { chord.forEach(n => musicNote(mf(n), musicNext, stepDur * 7.5, m.wave, m.vol * 0.7)); musicNote(mf(chord[0] - 12), musicNext, stepDur * 3.5, m.bass, m.vol * 1.4); }
    if (musicMode === "battle" && (i === 4 || i % 2 === 0)) musicNote(mf(chord[0] - 12), musicNext, stepDur * 0.9, m.bass, m.vol * 1.1);
    if (i % m.arpEvery === 0) {
      const pick = m.scale[(musicStep * 3 + bar * 2 + (i % 3)) % m.scale.length];
      if ((musicStep * 7 + bar) % 5 !== 0) musicNote(mf(pick), musicNext, stepDur * (musicMode === "battle" ? 0.8 : 1.8), musicMode === "battle" ? "square" : "sine", m.vol * (musicMode === "battle" ? 0.9 : 1.2));
    }
    musicNext += stepDur; musicStep++;
  }
}
function musicStart() {
  const ctx = rpgCtx(); if (!ctx) return;
  if (!musicGain) { musicGain = ctx.createGain(); musicGain.gain.value = 1; musicGain.connect(ctx.destination); }
  musicNext = ctx.currentTime + 0.05; musicMode = null; clearInterval(musicTimer);
  musicTimer = setInterval(musicTick, 180);
}
function musicStop() { clearInterval(musicTimer); musicTimer = null; }
function toggleMusic() {
  state.settings.music = !state.settings.music;
  save();
  if (state.settings.music) musicStart(); else musicStop();
  render();
}
document.addEventListener("visibilitychange", () => { if (document.hidden) musicStop(); else if (musicWanted()) musicStart(); });
document.addEventListener("click", () => { if (musicWanted() && !musicTimer) musicStart(); }, true);

function rpg2SettingsHtml() {
  const on = !!state.settings.music;
  return `<p class="disp" style="font-weight:700;font-size:12.5px;color:${C.mageDeep};margin:0 0 6px">🎵 Music</p>
    <p style="font-size:10.5px;color:${C.inkSoft};margin:0 0 8px">A soft, procedurally generated camp tune that picks up the pace in battle. Off by default; it starts after your first tap.</p>
    <div style="display:flex;gap:6px;margin-bottom:16px"><button data-act="toggleMusic" class="disp" style="flex:1;padding:9px 4px;border-radius:12px;font-size:12px;font-weight:700;background:${on ? C.sage : C.creamDeep};color:${on ? "white" : C.ink}">${on ? "Music: On" : "Music: Off"}</button></div>`;
}

/* ---------------- portraits for cards ---------------- */
function portraitHtml(m, px, unlocked) {
  const d = CHAR_DEFS[m.id];
  const inner = (d && unlocked !== false)
    ? `<svg viewBox="-17 -52 34 36" width="100%" height="100%" style="display:block">${charBody(m.id).replace(/<ellipse[^>]*rgba\(0,0,0,\.28\)[^>]*\/>/, "")}</svg>`
    : `<span style="font-size:${Math.round(px * .5)}px">${unlocked === false ? "🔒" : m.icon}</span>`;
  return `<div style="width:${px}px;height:${px}px;border-radius:50%;background:radial-gradient(circle at 35% 30%, ${m.color}66, ${m.color}22);border:2px solid ${m.color};box-shadow:0 0 0 2px rgba(0,0,0,.25), 0 2px 4px rgba(0,0,0,.3);display:flex;align-items:center;justify-content:center;overflow:hidden;flex-shrink:0">${inner}</div>`;
}
