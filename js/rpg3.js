/* =====================================================================
   Daybreak v16.2: enemy sprites, seasonal camp decor, camp growth,
   hero aura, and the Pond (fishing mini-game + catch log).
   Loaded after rpg2.js, before app.js.
   ===================================================================== */

/* ---------------- enemy sprites ---------------- */
const ENEMY_PALETTE = ["#8e6fb0", "#5b8def", "#d9535a", "#4fb286", "#d9a441", "#7c7c92", "#c46bb0"];
function enemyKind(name, boss) {
  const n = String(name || "").toLowerCase();
  if (/slime|ooze|gel/.test(n)) return "blob";
  if (/serpent|wyrm|leviathan|hydra|kraken|tide/.test(n)) return "serpent";
  if (/drake|dragon/.test(n)) return "drake";
  if (/imp|gnat|sprite|king|ping|notif/.test(n)) return "imp";
  if (/wisp|flame|spark/.test(n)) return "wisp";
  if (/wraith|specter|shade|phantom|ghost|echo|scroll/.test(n)) return "ghost";
  if (/colossus|titan|golem|giant/.test(n)) return "golem";
  return boss ? "golem" : (["ghost", "blob", "imp"][hashDay(n) % 3]);
}
function enemyBody(name, boss) {
  const kind = enemyKind(name, boss), col = ENEMY_PALETTE[hashDay(String(name).replace(/\s*\(.*\)$/, "")) % ENEMY_PALETTE.length];
  const eye = (x, y, r) => `<circle cx="${x}" cy="${y}" r="${r || 2.6}" fill="#fff"/><circle cx="${x + .6}" cy="${y + .4}" r="${(r || 2.6) * .5}" fill="#1b1220"/>`;
  const glow = `<ellipse cx="0" cy="-22" rx="30" ry="26" fill="${col}" opacity=".16"/>`;
  switch (kind) {
    case "blob": return `${glow}<path d="M-22 0 Q-26 -26 0 -34 Q26 -26 22 0 Z" fill="${col}"/><path d="M-14 -22 Q-8 -30 0 -29" stroke="#fff" stroke-width="3" fill="none" opacity=".45" stroke-linecap="round"/>${eye(-8, -16)}${eye(8, -16)}<path d="M-5 -8 Q0 -4 5 -8" stroke="#1b1220" stroke-width="1.6" fill="none" stroke-linecap="round"/>`;
    case "ghost": return `${glow}<path d="M-18 0 L-20 -30 Q-20 -50 0 -50 Q20 -50 20 -30 L18 0 L11 -7 L4 0 L-4 -7 L-11 0 Z" fill="${col}" opacity=".88"/><ellipse cx="-7" cy="-31" rx="3.6" ry="5" fill="#120c1a"/><ellipse cx="7" cy="-31" rx="3.6" ry="5" fill="#120c1a"/><ellipse cx="0" cy="-20" rx="3" ry="4" fill="#120c1a"/>`;
    case "serpent": return `${glow}<path d="M-24 -4 Q-22 -26 -4 -22 Q14 -18 8 -34 Q4 -46 18 -48" stroke="${col}" stroke-width="11" fill="none" stroke-linecap="round"/><path d="M-24 -4 Q-22 -26 -4 -22 Q14 -18 8 -34 Q4 -46 18 -48" stroke="#fff" stroke-width="2" fill="none" opacity=".25" stroke-linecap="round" stroke-dasharray="2 8"/><circle cx="20" cy="-50" r="8" fill="${col}"/>${eye(18, -52, 2.2)}${eye(24, -52, 2.2)}<path d="M26 -48 l8 2 l-8 2z" fill="#e5484d"/>`;
    case "drake": return `${glow}<path d="M-8 -30 L-34 -50 L-22 -26Z M8 -30 L34 -50 L22 -26Z" fill="${col}" opacity=".8"/><ellipse cx="0" cy="-20" rx="16" ry="20" fill="${col}"/><circle cx="0" cy="-44" r="10" fill="${col}"/><path d="M-6 -52 L-9 -62 L-3 -54Z M6 -52 L9 -62 L3 -54Z" fill="#f2e6c9"/>${eye(-4, -45, 2.2)}${eye(4, -45, 2.2)}<ellipse cx="0" cy="-12" rx="8" ry="11" fill="#f2e6c9" opacity=".6"/>`;
    case "imp": return `${glow}<path d="M-8 -22 L-30 -34 L-20 -16Z M8 -22 L30 -34 L20 -16Z" fill="#3a2d4f"/><ellipse cx="0" cy="-16" rx="11" ry="13" fill="${col}"/><circle cx="0" cy="-34" r="9" fill="${col}"/><path d="M-7 -41 L-10 -50 L-3 -43Z M7 -41 L10 -50 L3 -43Z" fill="#2b1f3a"/>${eye(-3.6, -35, 2.2)}${eye(3.6, -35, 2.2)}<path d="M-3 -29 L0 -26 L3 -29" stroke="#1b1220" stroke-width="1.3" fill="none"/>`;
    case "wisp": return `${glow}<path d="M0 -4 Q-14 -18 -6 -34 Q0 -50 8 -34 Q16 -18 0 -4Z" fill="${col}" opacity=".9"/><path d="M0 -8 Q-7 -18 -2 -28 Q2 -20 5 -28 Q10 -16 0 -8Z" fill="#fff" opacity=".55"/><circle cx="-3.5" cy="-24" r="2" fill="#1b1220"/><circle cx="3.5" cy="-24" r="2" fill="#1b1220"/>`;
    default: return `${glow}<rect x="-20" y="-34" width="40" height="34" rx="6" fill="${col}"/><rect x="-14" y="-52" width="28" height="22" rx="6" fill="${col}"/><rect x="-26" y="-32" width="9" height="24" rx="4" fill="${col}"/><rect x="17" y="-32" width="9" height="24" rx="4" fill="${col}"/><circle cx="-5.5" cy="-42" r="3" fill="#ffd34d"/><circle cx="5.5" cy="-42" r="3" fill="#ffd34d"/><path d="M-10 -22 L10 -22" stroke="#00000055" stroke-width="2"/>`;
  }
}

/* ---------------- camp decor ---------------- */
function campDecorSvg(night) {
  const t = today(), ev = (typeof activeSeasonalEvent === "function") ? activeSeasonalEvent() : null;
  let out = "";
  const month = parseInt(t.slice(5, 7), 10);
  if (ev && ev.id.startsWith("hollow")) out += `<text x="26" y="222" font-size="14">🎃</text><text x="142" y="238" font-size="11">🎃</text><text x="318" y="236" font-size="13">🎃</text><text class="fly" x="90" y="60" font-size="12">🦇</text><text class="fly" x="260" y="44" font-size="12" style="animation-delay:1.2s">🦇</text>`;
  if (ev && (ev.id.startsWith("winter") || ev.id.startsWith("newdawn"))) out += `<path d="M30 160 Q210 190 400 150" stroke="#fff3d6" stroke-width="1.5" fill="none"/>${Array.from({ length: 12 }).map((_, i) => `<circle class="star" cx="${40 + i * 30}" cy="${166 + Math.sin(i * .8) * 9 + (i % 2 ? 3 : 0)}" r="2.6" fill="${["#ff5c5c", "#ffd34d", "#5cd0ff", "#7dff9a"][i % 4]}" style="animation-delay:${(i * .3).toFixed(1)}s"/>`).join("")}`;
  if (ev && ev.id.startsWith("lunar")) out += Array.from({ length: 5 }).map((_, i) => `<g transform="translate(${50 + i * 80} 128)"><line x1="0" y1="-20" x2="0" y2="0" stroke="#8a2b2b"/><ellipse cx="0" cy="8" rx="8" ry="10" fill="#d9232d"/><rect x="-3" y="-1" width="6" height="2" fill="#f2c14e"/></g>`).join("");
  if (ev && ev.id.startsWith("national")) out += `<path d="M0 150 Q105 175 210 150 T420 150" stroke="#f2c14e" stroke-width="1.5" fill="none"/>${Array.from({ length: 8 }).map((_, i) => `<path d="M${25 + i * 52} ${158 + (i % 2 ? 6 : 0)} l8 0 l-4 10Z" fill="${["#f2c14e", "#fff", "#d9232d"][i % 3]}"/>`).join("")}`;
  if (ev && ev.id.startsWith("raya")) out += Array.from({ length: 6 }).map((_, i) => `<g transform="translate(${34 + i * 70} 236)"><rect x="-4" y="-3" width="8" height="4" fill="#9c6f1e"/><ellipse class="flame" cx="0" cy="-7" rx="2.4" ry="4" fill="#ffb347"/></g>`).join("");
  if (!ev && month === 12) out += Array.from({ length: 22 }).map((_, i) => `<circle class="drop" cx="${(i * 19) % 420}" cy="0" r="1.6" fill="#fff" style="animation-duration:3s;animation-delay:${((i * 53) % 30) / 10}s"/>`).join("");
  // camp growth from stronghold chapters read
  const n = (state.strongholdProgress && state.strongholdProgress.read) ? state.strongholdProgress.read.length : 0;
  if (n >= 1) out += `<g fill="#6b4a33">${Array.from({ length: 12 }).map((_, i) => `<rect x="${158 + i * 8}" y="${200}" width="3" height="10"/>`).join("")}<rect x="158" y="204" width="96" height="2"/></g>`;
  if (n >= 3) out += `<g transform="translate(404 190)"><rect x="-8" y="-46" width="16" height="46" fill="#7a6a8a"/><path d="M-11 -46 L0 -60 L11 -46Z" fill="#4b3d63"/><rect x="-3" y="-34" width="6" height="8" fill="${night ? "#ffd27a" : "#9fc4d8"}"/></g>`;
  if (n >= 6) out += `<g><line x1="150" y1="198" x2="150" y2="160" stroke="#6b4a33" stroke-width="2"/><path d="M150 160 l18 6 l-18 6Z" fill="#d9a441"/></g>`;
  if (n >= 10) out += `<g transform="translate(24 190)"><rect x="-6" y="-30" width="12" height="30" fill="#7a6a8a"/><path d="M-9 -30 L0 -42 L9 -30Z" fill="#4b3d63"/></g>`;
  return out;
}
function heroAuraSvg(x, y) {
  let out = "";
  try {
    const b = habitBuffs();
    if (b.aura) out += `<circle cx="${x}" cy="${y - 28}" r="34" fill="#ffe27a" opacity=".22" class="star"/><circle cx="${x}" cy="${y - 28}" r="46" fill="none" stroke="#ffe27a" stroke-width="1.5" opacity=".45" class="star"/>`;
    const rank = state.ascensionRank || 0;
    if (rank > 0) out += Array.from({ length: Math.min(rank, 5) }).map((_, i) => `<text x="${x - (Math.min(rank, 5) - 1) * 5 + i * 10}" y="${y - 74}" font-size="9" text-anchor="middle" fill="#ffd34d">★</text>`).join("");
  } catch (e) {}
  return out;
}

/* ---------------- the Pond (fishing) ---------------- */
const FISH = [
  { id:"minnow", name:"Pond Minnow", icon:"🐟", rarity:"common", w:30, gold:4, xp:2 },
  { id:"shrimp", name:"Reed Shrimp", icon:"🦐", rarity:"common", w:20, gold:5, xp:2 },
  { id:"boot", name:"Soggy Boot", icon:"🥾", rarity:"junk", w:9, gold:1, xp:1, mat:true },
  { id:"weed", name:"Tangle of Weed", icon:"🌿", rarity:"junk", w:7, gold:1, xp:1, mat:true },
  { id:"perch", name:"Silver Perch", icon:"🐠", rarity:"uncommon", w:12, gold:12, xp:5 },
  { id:"crab", name:"River Crab", icon:"🦀", rarity:"uncommon", w:9, gold:14, xp:5 },
  { id:"puffer", name:"Grumpy Puffer", icon:"🐡", rarity:"uncommon", w:7, gold:16, xp:6 },
  { id:"squid", name:"Glass Squid", icon:"🦑", rarity:"rare", w:4, gold:35, xp:14 },
  { id:"turtle", name:"Old Pond Turtle", icon:"🐢", rarity:"rare", w:3.5, gold:40, xp:16 },
  { id:"octo", name:"Star Octopus", icon:"🐙", rarity:"rare", w:3, gold:45, xp:18 },
  { id:"lantern", name:"Lantern Fish", icon:"🏮", rarity:"epic", w:1.4, gold:90, xp:35, shard:1 },
  { id:"koi", name:"Daybreak Koi", icon:"🎏", rarity:"legendary", w:.5, gold:250, xp:90, shard:3 },
];
const FISH_RARITY_COLOR = { junk:"#8a8a8a", common:"#9aa5b1", uncommon:"#4fb286", rare:"#5b8def", epic:"#c46bb0", legendary:"#f2c14e" };
function fishEnsure() {
  if (!state.fishing || typeof state.fishing !== "object") state.fishing = {};
  const f = state.fishing, t = today();
  if (!f.caught) f.caught = {};
  if (f.date !== t) { f.date = t; f.today = 0; }
  if (f.total == null) f.total = 0;
  return f;
}
function fishSpecies() { return Object.keys(fishEnsure().caught).filter(id => FISH.some(x => x.id === id)).length; }
function fishRollOne() {
  let bonus = 1;
  try { if (habitBuffs().water) bonus = 1.25; } catch (e) {}
  const table = FISH.map(f => ({ f, w: f.w * (["rare", "epic", "legendary"].includes(f.rarity) ? bonus : 1) }));
  let r = Math.random() * table.reduce((n, x) => n + x.w, 0);
  for (const x of table) { r -= x.w; if (r <= 0) return x.f; }
  return FISH[0];
}
function openPond() { ensureDaily(); fishEnsure(); ui.fishing = { phase:"idle", tab:"cast" }; render(); }
function closePond() { clearTimeout(ui.fishTimer); ui.fishing = null; render(); }
function pondTab(t) { if (ui.fishing) { ui.fishing.tab = t; render(); } }
function pondCast() {
  const fs = ui.fishing; if (!fs || (fs.phase !== "idle" && fs.phase !== "result" && fs.phase !== "escaped")) return;
  fs.phase = "waiting"; fs.result = null; fs.tab = "cast";
  rpgSfx("tap");
  clearTimeout(ui.fishTimer);
  ui.fishTimer = setTimeout(() => {
    if (!ui.fishing || ui.fishing.phase !== "waiting") return;
    ui.fishing.phase = "bite"; ui.fishing.biteAt = Date.now(); rpgSfx("coin"); rpgBuzz([30, 40, 30]);
    render();
    ui.fishTimer = setTimeout(() => { if (ui.fishing && ui.fishing.phase === "bite") { ui.fishing.phase = "escaped"; rpgSfx("warn"); render(); } }, 1100);
  }, 1200 + Math.random() * 2800);
  render();
}
function pondReel() {
  const fs = ui.fishing; if (!fs) return;
  if (fs.phase === "waiting") { clearTimeout(ui.fishTimer); fs.phase = "escaped"; fs.early = true; rpgSfx("warn"); render(); return; }
  if (fs.phase !== "bite") return;
  clearTimeout(ui.fishTimer);
  ensureDaily();
  const f = fishEnsure(), fish = fishRollOne(), first = !f.caught[fish.id];
  f.caught[fish.id] = (f.caught[fish.id] || 0) + 1; f.total++; f.today++;
  if (!fish.mat) { const st = fishStock(); st[fish.id] = (st[fish.id] || 0) + 1; }
  const taper = f.today <= 25 ? 1 : 0.4, scale = rewardScale(state.player.level);
  const gold = Math.max(1, Math.round(fish.gold * scale * taper * (first ? 2 : 1))), xp = Math.max(1, Math.round(fish.xp * scale * taper));
  let leveled = wildsAddXpGold(gold, xp);
  let extra = "";
  if (fish.mat) { const m = MATERIALS[Math.floor(Math.random() * MATERIALS.length)]; state.materials[m] = (state.materials[m] || 0) + 1; extra = ` +1 ${m}`; }
  if (fish.shard && first) { state.materials["Legend Shard"] = (state.materials["Legend Shard"] || 0) + fish.shard; extra += ` +${fish.shard} Legend Shard${fish.shard > 1 ? "s" : ""}`; }
  if (first && fishSpecies() === FISH.length) { state.materials["Legend Shard"] = (state.materials["Legend Shard"] || 0) + 5; leveled = wildsAddXpGold(Math.round(500 * scale), Math.round(300 * scale)) || leveled; extra += " 🏆 Catch Log complete! +5 Legend Shards"; }
  fs.phase = "result"; fs.result = { fish, gold, xp, first, extra };
  rpgSfx(fish.rarity === "legendary" || fish.rarity === "epic" ? "level" : "win"); rpgBuzz(40);
  save(); render();
  if (leveled) setTimeout(() => showToast(`Level up! You are now Level ${state.player.level}.`), 300);
}
function renderPondModal() {
  const fs = ui.fishing; if (!fs) return "";
  const f = fishEnsure(), sky = rpgSky(), night = sky.kind === "night" || sky.kind === "evening";
  const ph = fs.phase, bite = ph === "bite";
  const bobY = ph === "waiting" ? 0 : bite ? 8 : 0;
  const scene = `<div class="scene" style="border-width:2px;margin-bottom:10px"><svg viewBox="0 0 420 150" preserveAspectRatio="xMidYMid slice">
    <defs><linearGradient id="psk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sky.top}"/><stop offset="1" stop-color="${sky.bot}"/></linearGradient><linearGradient id="pw" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${night ? "#1f3a5a" : "#5fb3d9"}"/><stop offset="1" stop-color="${night ? "#0e2036" : "#2f7fa8"}"/></linearGradient></defs>
    <rect width="420" height="150" fill="url(#psk)"/>
    <path d="M0 62 Q100 36 200 58 T420 56 V90 H0Z" fill="${night ? "#1b2d24" : "#5e9a5a"}"/>
    <rect y="80" width="420" height="70" fill="url(#pw)"/>
    ${Array.from({ length: 6 }).map((_, i) => `<ellipse cx="${40 + i * 70}" cy="${100 + (i % 3) * 14}" rx="22" ry="3" fill="#fff" opacity=".13"/>`).join("")}
    <g transform="translate(60 84)"><g class="bob">${charBody("hero")}</g></g>
    <line x1="74" y1="40" x2="${bite ? 250 : 262}" y2="${96 + bobY}" stroke="#e8e0cf" stroke-width="1"/>
    <line x1="74" y1="40" x2="86" y2="30" stroke="#7a5a3a" stroke-width="3" stroke-linecap="round"/>
    <g transform="translate(${bite ? 250 : 262} ${96 + bobY})"><circle r="5" fill="#fff"/><path d="M-5 0 A5 5 0 0 0 5 0Z" fill="#d9232d"/>
      ${bite ? `<circle class="burst" r="12" fill="#fff"/><text y="-14" font-size="16" text-anchor="middle">❗</text>` : ""}</g>
    ${ph === "waiting" ? `<ellipse cx="262" cy="100" rx="14" ry="3" fill="none" stroke="#fff" stroke-width="1" opacity=".5" class="star"/>` : ""}
  </svg></div>`;
  let body = "";
  if (fs.tab === "log") {
    body = `<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">${FISH.map(x => { const n = f.caught[x.id] || 0; return `<div style="text-align:center;padding:10px 4px;border-radius:12px;background:${C.creamDeep};border:1px solid ${n ? FISH_RARITY_COLOR[x.rarity] : C.border}"><div style="font-size:26px;${n ? "" : "filter:grayscale(1) brightness(.4)"}">${x.icon}</div><div style="font-size:10px;font-weight:700;margin-top:3px">${n ? x.name : "???"}</div><div style="font-size:9px;color:${n ? FISH_RARITY_COLOR[x.rarity] : C.inkSoft}">${n ? `${x.rarity} · ×${n}` : "undiscovered"}</div></div>`; }).join("")}</div>
      <p style="font-size:10.5px;color:${C.inkSoft};margin:10px 0 0;text-align:center">${fishSpecies()}/${FISH.length} species${fishSpecies() === FISH.length ? " · Complete! 🏆" : " · complete the log for a big reward"}</p>`;
  } else {
    const r = fs.result;
    let msg = "A calm pond. Cast whenever you like — no timers.";
    let btn = `<button data-act="pondCast" class="disp" style="width:100%;padding:14px;border-radius:14px;font-weight:800;font-size:14px;background:${C.sage};color:white">🎣 Cast line</button>`;
    if (ph === "waiting") { msg = "Waiting for a bite… (reel too early and it escapes)"; btn = `<button data-act="pondReel" class="disp" style="width:100%;padding:14px;border-radius:14px;font-weight:800;font-size:14px;background:${C.creamDeep};color:${C.ink}">…</button>`; }
    if (bite) { msg = "A bite! Reel it in!"; btn = `<button data-act="pondReel" class="disp pulse" style="width:100%;padding:16px;border-radius:14px;font-weight:900;font-size:16px;background:#e5484d;color:white">🐟 REEL!</button>`; }
    if (ph === "escaped") { msg = fs.early ? "Too early — it spooked." : "It got away…"; fs.early = false; }
    if (ph === "result" && r) {
      msg = `<span style="font-size:30px">${r.fish.icon}</span><br><b style="color:${FISH_RARITY_COLOR[r.fish.rarity]}">${r.fish.name}</b> <span style="font-size:10px">(${r.fish.rarity})</span>${r.first ? ` <b style="color:${C.gold}">NEW!</b>` : ""}<br>+${r.gold}g +${r.xp}xp${escapeHtml(r.extra)}`;
    }
    body = `<p style="font-size:12.5px;text-align:center;margin:0 0 12px;min-height:60px;line-height:1.5">${msg}</p>${btn}
      <p style="font-size:10px;color:${C.inkSoft};text-align:center;margin:8px 0 0">Today: ${f.today} caught · ${f.total} all-time${f.today > 25 ? " · rewards lighter after 25 a day" : ""}${(() => { try { return habitBuffs().water ? " · 💧 Hydrated: better odds at rare fish" : ""; } catch (e) { return ""; } })()}</p>`;
  }
  const tabBtn = (id, label) => `<button data-act="pondTab" data-arg="${id}" class="disp" style="flex:1;padding:8px;border-radius:10px;font-size:11.5px;font-weight:700;background:${fs.tab === id ? C.mageDeep : C.creamDeep};color:${fs.tab === id ? "white" : C.ink}">${label}</button>`;
  return `<div style="position:fixed;inset:0;z-index:58;display:flex;align-items:flex-end;justify-content:center;background:rgba(40,30,20,.55)">
    <div style="background:${C.card};border-radius:24px 24px 0 0;width:100%;max-width:480px;padding:18px;max-height:92vh;overflow-y:auto">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px"><p class="disp" style="font-weight:700;font-size:15px;margin:0">🎣 The Pond</p><button data-act="closePond"><span style="color:${C.inkSoft}">✖</span></button></div>
      ${scene}
      <div style="display:flex;gap:8px;margin-bottom:12px">${tabBtn("cast", "Fish")}${tabBtn("log", `Catch Log ${fishSpecies()}/${FISH.length}`)}</div>
      ${body}
    </div></div>`;
}

/* ---------------- achievements for this batch ---------------- */
const FISHING_ACHIEVEMENTS = [
  { id:"ach_fish25", title:"First Bites", icon:"🎣", desc:"Catch 25 fish", check: () => fishEnsure().total >= 25, progress: () => [Math.min(fishEnsure().total, 25), 25], reward:{ gold:40, xp:30 } },
  { id:"ach_fish150", title:"Patient Angler", icon:"🐟", desc:"Catch 150 fish", check: () => fishEnsure().total >= 150, progress: () => [Math.min(fishEnsure().total, 150), 150], reward:{ gold:140, xp:100 } },
  { id:"ach_fish500", title:"Pond Legend", icon:"🌊", desc:"Catch 500 fish", check: () => fishEnsure().total >= 500, progress: () => [Math.min(fishEnsure().total, 500), 500], reward:{ gold:400, xp:280 } },
  { id:"ach_fishlog6", title:"Naturalist", icon:"📒", desc:"Discover 6 fish species", check: () => fishSpecies() >= 6, progress: () => [Math.min(fishSpecies(), 6), 6], reward:{ gold:70, xp:50 } },
  { id:"ach_fishlogall", title:"Complete Catch Log", icon:"🏆", desc:"Discover every fish species", check: () => fishSpecies() >= FISH.length, progress: () => [fishSpecies(), FISH.length], reward:{ gold:300, xp:200 } },
  { id:"ach_koi", title:"Daybreak Koi", icon:"🎏", desc:"Catch the legendary Daybreak Koi", check: () => (fishEnsure().caught.koi || 0) > 0, reward:{ gold:200, xp:150 } },
];
