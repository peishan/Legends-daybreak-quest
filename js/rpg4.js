/* =====================================================================
   Daybreak v16.3: visible hero gear, the Camp Kitchen, Soel's Corner.
   Loaded after rpg3.js, before app.js.
   ===================================================================== */

/* ---------------- visible equipment on the hero ---------------- */
const GEAR_TIER = {
  weapon: ["apprentice_staff", "journeyman_staff", "masters_staff", "archmage_staff", "echostaff", "emberforged_blade", "undying_ember"],
  armor:  ["woven_robe", "enchanted_robe", "guardian_plate", "aegis_of_the_guild", "everguard_aegis", "aegis_eternal", "the_unbreaking"],
  trinket:["lucky_charm", "radiant_charm", "sovereign_charm", "crown_of_daybreak", "diadem_of_the_unwritten", "forgemasters_seal", "endless_circuit"],
};
function gearTier(slot, id) { const i = (GEAR_TIER[slot] || []).indexOf(id); return i + 1; }
const ARMOR_COL = ["#7b6a58", "#4f7fb5", "#5b6b8f", "#c9a24a", "#7a4fb5", "#d9535a", "#262638"];
const ORB_COL = ["#c9a24a", "#4fb286", "#5b8def", "#f2c14e", "#c46bb0", "#ff7a1a", "#ff3d2e"];
function heroLook() {
  const eq = (state && state.equipment) || {};
  const wt = gearTier("weapon", eq.weapon), at = gearTier("armor", eq.armor), tt = gearTier("trinket", eq.trinket);
  return {
    outfit: at > 0 ? ARMOR_COL[at - 1] : "#6f4f92",
    plate: at >= 3, glowArmor: at >= 7,
    orb: wt > 0 ? ORB_COL[wt - 1] : "#f2c14e", blade: wt === 6, wt,
    crown: tt >= 4 ? ORB_COL[tt - 1] : null, charm: tt > 0 && tt < 4,
    cloak: eq.cloak === "cloak_guardian" ? "#2f5fa8" : eq.cloak ? "#3f7a4a" : null,
    amulet: eq.amulet ? (eq.amulet === "amulet_greater_focus" ? "#c46bb0" : "#5bd0ff") : null,
    rings: [eq.ring1, eq.ring2].filter(Boolean).length,
  };
}
function heroGearBack(look) { return look.cloak ? `<path d="M-9 -27 L-14 -2 Q0 4 14 -2 L9 -27Z" fill="${look.cloak}" opacity=".95"/>` : ""; }
function heroGearFront(look) {
  let o = "";
  if (look.plate) o += `<ellipse cx="-9" cy="-26" rx="4.6" ry="3" fill="#cfd5e0" stroke="#7a8190" stroke-width=".7"/><ellipse cx="9" cy="-26" rx="4.6" ry="3" fill="#cfd5e0" stroke="#7a8190" stroke-width=".7"/>`;
  if (look.glowArmor) o += `<path d="M-6 -24 L0 -14 L6 -24" stroke="#ff7a1a" stroke-width="1.2" fill="none"/>`;
  if (look.amulet) o += `<path d="M-4 -27 Q0 -20 4 -27" stroke="#d9a441" stroke-width=".9" fill="none"/><circle cx="0" cy="-21.5" r="2" fill="${look.amulet}"/>`;
  if (look.crown) o += `<path d="M-8 -41 L-6 -47 L-3 -42 L0 -48 L3 -42 L6 -47 L8 -41Z" fill="${look.crown}" stroke="#7a5a1e" stroke-width=".6"/>`;
  if (look.charm) o += `<circle cx="0" cy="-48" r="1.6" fill="#f2c14e"/>`;
  if (look.rings > 0) o += `<text x="-13" y="-10" font-size="5" fill="#ffe27a" class="star">✦</text>` + (look.rings > 1 ? `<text x="10" y="-10" font-size="5" fill="#ffe27a" class="star">✦</text>` : "");
  return o;
}
function heroStaffSvg(look) {
  if (look.blade) return `<line x1="16" y1="-10" x2="16" y2="-50" stroke="#ffb347" stroke-width="3.2" stroke-linecap="round"/><line x1="16" y1="-10" x2="16" y2="-50" stroke="#ff7a1a" stroke-width="1.4" stroke-linecap="round" class="flame"/><rect x="11" y="-12" width="10" height="2.6" fill="#d9a441"/>`;
  return `<line x1="16" y1="2" x2="16" y2="-52" stroke="#7a5a3a" stroke-width="2.6" stroke-linecap="round"/><circle cx="16" cy="-56" r="${4 + Math.min(2, look.wt * .3)}" fill="${look.orb}"/><circle cx="16" cy="-56" r="${8 + look.wt}" fill="${look.orb}" opacity=".25"/>`;
}

/* ---------------- Camp Kitchen ---------------- */
const DISHES = [
  { id:"chowder", name:"Pond Chowder", icon:"🍲", need:{ minnow:2, mat:{ "Moonherb":1 } }, buff:{ xp:.10 }, text:"+10% XP today" },
  { id:"skewers", name:"Shrimp Skewers", icon:"🍢", need:{ shrimp:2, mat:{ "Ember Shard":1 } }, buff:{ gold:.10 }, text:"+10% gold today" },
  { id:"perchpie", name:"Perch Pie", icon:"🥧", need:{ perch:1, mat:{ "Silver Dust":1 } }, buff:{ heal:true }, text:"Fully restores HP & MP now" },
  { id:"curry", name:"Crab Curry", icon:"🍛", need:{ crab:1, mat:{ "Ember Shard":2 } }, buff:{ focus:1 }, text:"+1 max Focus today" },
  { id:"hotpot", name:"Puffer Hotpot", icon:"🫕", need:{ puffer:1, mat:{ "Slime Gel":2 } }, buff:{ drops:1 }, text:"+1 material drop in fights today" },
  { id:"pasta", name:"Squid Ink Pasta", icon:"🍝", need:{ squid:1, mat:{ "Starlight Thread":1 } }, buff:{ xp:.15, gold:.15 }, text:"+15% XP & gold today" },
  { id:"turtlesoup", name:"Old Turtle Soup", icon:"🥣", need:{ turtle:1, mat:{ "Moonherb":2 } }, buff:{ grace:1 }, text:"+1 Streak Shield" },
  { id:"feast", name:"Lantern Feast", icon:"🏮", need:{ lantern:1, octo:1 }, buff:{ xp:.20, gold:.20 }, text:"+20% XP & gold today" },
];
function fishStock() { const f = fishEnsure(); if (!f.stock) f.stock = {}; return f.stock; }
function mealBuff() {
  const b = state.mealBuff;
  return (b && b.date === today()) ? b : null;
}
function mealMult(kind) { const b = mealBuff(); return b && b[kind] ? 1 + b[kind] : 1; }
function mealFocus() { const b = mealBuff(); return b && b.focus ? b.focus : 0; }
function mealDrops() { const b = mealBuff(); return b && b.drops ? b.drops : 0; }
function canCook(d) {
  const st = fishStock();
  return Object.entries(d.need).every(([k, v]) => k === "mat" ? Object.entries(v).every(([m, q]) => (state.materials[m] || 0) >= q) : (st[k] || 0) >= v);
}
function cookDish(id) {
  const d = DISHES.find(x => x.id === id); if (!d || !canCook(d)) return;
  const st = fishStock();
  Object.entries(d.need).forEach(([k, v]) => { if (k === "mat") Object.entries(v).forEach(([m, q]) => { state.materials[m] -= q; }); else st[k] -= v; });
  if (!state.cookbook) state.cookbook = {};
  const first = !state.cookbook[id];
  state.cookbook[id] = (state.cookbook[id] || 0) + 1;
  state.cooked = (state.cooked || 0) + 1;
  let leveled = false;
  const b = d.buff;
  if (b.heal) { state.player.hp = maxHp(); state.player.mp = state.player.maxMp; }
  else if (b.grace) state.graceTokens = Math.min(3, (state.graceTokens || 0) + b.grace);
  else state.mealBuff = { date: today(), id, xp: b.xp || 0, gold: b.gold || 0, focus: b.focus || 0, drops: b.drops || 0, name: d.name, icon: d.icon };
  const scale = rewardScale(state.player.level);
  leveled = wildsAddXpGold(first ? Math.round(40 * scale) : 0, Math.round((first ? 40 : 12) * scale));
  rpgSfx("win"); rpgBuzz(20);
  save(); render();
  if (leveled) setTimeout(() => showToast(`Level up! You are now Level ${state.player.level}.`), 300);
  else showToast(`${d.icon} ${d.name}${first ? " (new recipe!)" : ""} — ${d.text}`);
}
function openKitchen() { ensureDaily(); ui.kitchen = true; render(); }
function closeKitchen() { ui.kitchen = false; render(); }
function renderKitchenModal() {
  if (!ui.kitchen) return "";
  const st = fishStock(), mb = mealBuff();
  const stockRow = FISH.filter(f => (st[f.id] || 0) > 0).map(f => `<span style="padding:3px 8px;border-radius:9999px;background:${C.creamDeep};font-size:11px;font-weight:700">${f.icon} ×${st[f.id]}</span>`).join("") || `<span style="font-size:11px;color:${C.inkSoft}">No fish yet — try the Pond 🎣</span>`;
  const rows = DISHES.map(d => {
    const ok = canCook(d), known = !!(state.cookbook && state.cookbook[d.id]);
    const need = Object.entries(d.need).map(([k, v]) => k === "mat" ? Object.entries(v).map(([m, q]) => `${q}× ${m} <span style="color:${(state.materials[m] || 0) >= q ? C.sage : "#E85B5B"}">(${state.materials[m] || 0})</span>`).join(", ") : `${v}× ${FISH.find(f => f.id === k).icon} ${FISH.find(f => f.id === k).name} <span style="color:${(st[k] || 0) >= v ? C.sage : "#E85B5B"}">(${st[k] || 0})</span>`).join(", ");
    return `<div style="display:flex;align-items:center;gap:10px;padding:10px;border-radius:14px;background:${C.creamDeep};margin-bottom:8px">
      <span style="font-size:26px">${d.icon}</span>
      <div style="flex:1"><p class="disp" style="font-weight:700;font-size:12.5px;margin:0">${d.name}${known ? ` <span style="font-size:9.5px;color:${C.sage}">cooked ×${state.cookbook[d.id]}</span>` : ""}</p><p style="font-size:10.5px;color:${C.mageDeep};margin:1px 0">${d.text}</p><p style="font-size:9.5px;color:${C.inkSoft};margin:0">${need}</p></div>
      <button data-act="cookDish" data-arg="${d.id}" ${ok ? "" : "disabled"} class="disp" style="padding:7px 14px;border-radius:9999px;font-size:11px;font-weight:700;background:${C.gold};color:white">Cook</button></div>`;
  }).join("");
  return `<div style="position:fixed;inset:0;z-index:58;display:flex;align-items:flex-end;justify-content:center;background:rgba(40,30,20,.55)">
    <div style="background:${C.card};border-radius:24px 24px 0 0;width:100%;max-width:480px;padding:18px;max-height:90vh;overflow-y:auto">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px"><p class="disp" style="font-weight:700;font-size:15px;margin:0">🍲 Camp Kitchen</p><button data-act="closeKitchen"><span style="color:${C.inkSoft}">✖</span></button></div>
      <p style="font-size:11px;color:${C.inkSoft};margin:0 0 10px">Cook what you catch. One dish buff lasts for the day; cooking a new one replaces it.${mb ? ` <b style="color:${C.mageDeep}">Active: ${mb.icon} ${mb.name}</b>` : ""}</p>
      <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px">${stockRow}</div>
      ${rows}
    </div></div>`;
}

/* ---------------- Soel's Corner ---------------- */
function soelEnsure() {
  if (!state.soelPet || typeof state.soelPet !== "object") state.soelPet = {};
  const s = state.soelPet, t = today();
  if (s.date !== t) { s.date = t; s.fed = 0; s.pets = 0; s.plays = 0; s.gift = false; }
  if (s.giftsTotal == null) s.giftsTotal = 0;
  if (s.petsTotal == null) s.petsTotal = 0;
  return s;
}
function soelMood() { const s = soelEnsure(); return Math.min(100, s.fed * 30 + Math.min(s.pets, 8) * 7 + s.plays * 18); }
function soelFace(mood, closed) {
  if (closed) return `<path d="M-9 -2 Q-6 -5 -3 -2 M3 -2 Q6 -5 9 -2" stroke="#2c2c34" stroke-width="2" fill="none" stroke-linecap="round"/>`;
  return `<ellipse cx="-6" cy="-2" rx="2.6" ry="3.2" fill="#2c2c34"/><ellipse cx="6" cy="-2" rx="2.6" ry="3.2" fill="#2c2c34"/><circle cx="-5.2" cy="-3.2" r=".9" fill="#fff"/><circle cx="6.8" cy="-3.2" r=".9" fill="#fff"/>`;
}
function soelBigSvg(closed, hearts, toy) {
  return `<svg viewBox="0 0 200 140" width="100%" style="display:block"><defs><linearGradient id="sfl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c9a073"/><stop offset="1" stop-color="#8a6a48"/></linearGradient></defs>
    <rect width="200" height="140" fill="#f3e3c7"/><rect y="104" width="200" height="36" fill="url(#sfl)"/><ellipse cx="100" cy="112" rx="62" ry="12" fill="#b9524a" opacity=".85"/><ellipse cx="100" cy="110" rx="52" ry="9" fill="#d9706a"/>
    <g transform="translate(100 104)"><g class="bob">
      <g class="tailwag" style="transform-origin:46px 0"><path d="M42 -6 Q70 -8 64 -42" stroke="#8d8d96" stroke-width="9" fill="none" stroke-linecap="round"/></g>
      <ellipse cx="0" cy="-18" rx="38" ry="28" fill="#8d8d96"/><ellipse cx="-6" cy="-12" rx="20" ry="22" fill="#f1f1f4"/>
      <g transform="translate(-16 -52)"><circle r="23" fill="#8d8d96"/><path d="M-21 -10 L-18 -34 L-3 -20Z M3 -20 L18 -34 L21 -10Z" fill="#8d8d96"/><path d="M-17 -14 L-16 -28 L-8 -19Z M8 -19 L16 -28 L17 -14Z" fill="#e8a7b0"/><path d="M-11 6 Q0 18 11 6 Q0 -2 -11 6Z" fill="#f1f1f4"/>
        ${soelFace(0, closed)}<path d="M-2 5 L0 8 L2 5Z" fill="#e8a7b0"/>
        <path d="M-12 6 L-30 3 M-12 9 L-30 11 M12 6 L30 3 M12 9 L30 11" stroke="#fff" stroke-width=".8" opacity=".8"/></g>
    </g></g>
    ${hearts ? Array.from({ length: 4 }).map((_, i) => `<text class="spark" x="${70 + i * 18}" y="46" font-size="14" style="animation-delay:${i * .25}s">💗</text>`).join("") : ""}
    ${toy ? `<text x="${toy}" y="40" font-size="22">🪶</text>` : ""}
  </svg>`;
}
const SOEL_GIFTS = [
  () => { const m = MATERIALS[Math.floor(Math.random() * MATERIALS.length)]; state.materials[m] = (state.materials[m] || 0) + 3; return `3× ${m}`; },
  () => { const g = Math.round(40 * rewardScale(state.player.level)); wildsAddXpGold(g, 0); return `${g} gold (a suspicious pile of coins)`; },
  () => { state.potions.health_draught = (state.potions.health_draught || 0) + 1; return "a Health Draught"; },
  () => { state.materials["Legend Shard"] = (state.materials["Legend Shard"] || 0) + 1; return "a Legend Shard (he looks smug)"; },
  () => { const x = Math.round(30 * rewardScale(state.player.level)); wildsAddXpGold(0, x); return `${x} XP of pure vibes`; },
];
function openSoelCorner() { ensureDaily(); soelEnsure(); ui.soel = { phase:"idle", msg:"Soel watches you with great dignity.", closed:false, hearts:false }; render(); }
function closeSoelCorner() { clearInterval(ui.soelTimer); ui.soel = null; render(); }
function soelFeed() {
  const s = soelEnsure(), st = fishStock();
  if (s.fed >= 2) { ui.soel.msg = "Soel is full. He regards the bowl with disdain."; render(); return; }
  const fishId = Object.keys(st).find(k => st[k] > 0 && ["minnow", "shrimp", "perch", "crab", "puffer"].includes(k));
  if (fishId) { st[fishId]--; ui.soel.msg = `He devours the ${FISH.find(f => f.id === fishId).name}. Highest of praise.`; s.fed += 1; }
  else if (s.fed === 0) { s.fed = 1; ui.soel.msg = "Kibble. He eats it like a favour to you."; }
  else { ui.soel.msg = "Out of fish — go to the Pond 🎣 for a second helping."; render(); return; }
  ui.soel.hearts = true; rpgSfx("good"); save(); render();
}
function soelPet() {
  const s = soelEnsure(); s.pets++; s.petsTotal++;
  state.affinity.soel = (state.affinity.soel || 0) + (s.pets <= 8 ? 0.25 : 0);
  ui.soel.closed = true; ui.soel.hearts = s.pets % 3 === 0;
  ui.soel.msg = s.pets <= 8 ? ["*purrrr*", "*leans into your hand*", "*slow blink*", "*kneads the cushion*"][s.pets % 4] : "He's had enough. He says so with his eyes.";
  rpgSfx("tap"); rpgBuzz(10); save(); render();
  clearTimeout(ui.soelEyeTimer); ui.soelEyeTimer = setTimeout(() => { if (ui.soel) { ui.soel.closed = false; ui.soel.hearts = false; render(); } }, 900);
}
function soelPlay() {
  const s = soelEnsure();
  if (!ui.soel || ui.soel.phase === "play") return;
  if (s.plays >= 3) { ui.soel.msg = "Soel has played enough for today. Dignity must be restored."; render(); return; }
  ui.soel.phase = "play"; ui.soel.score = 0; ui.soel.toy = 20 + Math.floor(Math.random() * 150); ui.soel.endAt = Date.now() + 7000;
  clearInterval(ui.soelTimer);
  ui.soelTimer = setInterval(() => {
    if (!ui.soel || ui.soel.phase !== "play") { clearInterval(ui.soelTimer); return; }
    if (Date.now() >= ui.soel.endAt) { soelPlayEnd(); return; }
    ui.soel.toy = 20 + Math.floor(Math.random() * 150); render();
  }, 900);
  render();
}
function soelSwat() {
  if (!ui.soel || ui.soel.phase !== "play") return;
  ui.soel.score++; ui.soel.toy = 20 + Math.floor(Math.random() * 150); rpgSfx("coin"); rpgBuzz(10); render();
}
function soelPlayEnd() {
  clearInterval(ui.soelTimer);
  const s = soelEnsure(), score = ui.soel.score || 0;
  ui.soel.phase = "idle";
  if (score >= 3) { s.plays++; state.affinity.soel = (state.affinity.soel || 0) + 1; ui.soel.msg = `${score} swats! Soel pounces, rolls, and acts like it was nothing.`; ui.soel.hearts = true; rpgSfx("win"); }
  else ui.soel.msg = `Only ${score} swat${score === 1 ? "" : "s"}. He yawns. Try again — he can wait.`;
  save(); render();
}
function soelGift() {
  const s = soelEnsure();
  if (s.gift || soelMood() < 60) return;
  s.gift = true; s.giftsTotal++;
  const what = SOEL_GIFTS[Math.floor(Math.random() * SOEL_GIFTS.length)]();
  ui.soel.msg = `Soel drops something at your feet: ${what}.`; ui.soel.hearts = true;
  rpgSfx("level"); rpgBuzz([30, 30, 60]); save(); render();
}
function renderSoelModal() {
  const so = ui.soel; if (!so) return "";
  const s = soelEnsure(), mood = soelMood(), play = so.phase === "play";
  const moodBar = `<div style="height:10px;border-radius:9999px;overflow:hidden;background:${C.creamDeep};margin:6px 0 2px"><div style="height:10px;width:${mood}%;background:linear-gradient(90deg,#e8a7b0,#e5484d)"></div></div>`;
  const left = Math.max(0, Math.ceil(((so.endAt || 0) - Date.now()) / 1000));
  const btn = (act, label, extra) => `<button data-act="${act}" class="disp" style="flex:1;padding:11px 4px;border-radius:12px;font-weight:700;font-size:12px;background:${C.mageDeep};color:white" ${extra || ""}>${label}</button>`;
  const giftReady = mood >= 60 && !s.gift;
  return `<div style="position:fixed;inset:0;z-index:58;display:flex;align-items:flex-end;justify-content:center;background:rgba(40,30,20,.55)">
    <div style="background:${C.card};border-radius:24px 24px 0 0;width:100%;max-width:480px;padding:18px;max-height:92vh;overflow-y:auto">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px"><p class="disp" style="font-weight:700;font-size:15px;margin:0">🐱 Soel's Corner</p><button data-act="closeSoelCorner"><span style="color:${C.inkSoft}">✖</span></button></div>
      <div class="scene" style="border-width:2px;margin-bottom:8px;cursor:pointer" ${play ? "" : 'data-act="soelPet"'}>${soelBigSvg(so.closed, so.hearts, play ? so.toy : 0)}
        ${play ? `<button data-act="soelSwat" style="position:absolute;left:${(so.toy / 200 * 100).toFixed(0)}%;top:14%;width:70px;height:70px;border-radius:50%;background:transparent"></button>` : ""}</div>
      <p style="font-size:12.5px;font-style:italic;text-align:center;margin:0 0 6px;min-height:34px">${play ? `Tap the feather! 🪶 ${so.score} swats · ${left}s` : escapeHtml(so.msg)}</p>
      <p style="font-size:10.5px;color:${C.inkSoft};margin:0">Mood ${mood}% · fed ${s.fed}/2 · pets ${Math.min(s.pets, 8)}/8 · play ${s.plays}/3</p>${moodBar}
      <div style="display:flex;gap:8px;margin-top:10px">${btn("soelFeed", "🐟 Feed")}${btn("soelPlay", "🪶 Play", play ? "disabled" : "")}${btn("soelPet", "✋ Pet", play ? "disabled" : "")}</div>
      <button data-act="soelGift" ${giftReady ? "" : "disabled"} class="disp" style="width:100%;margin-top:10px;padding:12px;border-radius:14px;font-weight:800;font-size:13px;background:${C.gold};color:white">${s.gift ? "🎁 Gift received today" : giftReady ? "🎁 Soel has a gift for you!" : "🎁 Gift unlocks at 60% mood"}</button>
      <p style="font-size:9.5px;color:${C.inkSoft};text-align:center;margin:8px 0 0">Just a game — it never nags and nothing is lost if you skip a day. (Your real Soel still needs real dinner.)</p>
    </div></div>`;
}

/* ---------------- achievements ---------------- */
const KITCHEN_ACHIEVEMENTS = [
  { id:"ach_cook1", title:"First Dish", icon:"🍲", desc:"Cook your first dish", check: () => (state.cooked || 0) >= 1, reward:{ gold:30, xp:25 } },
  { id:"ach_cook20", title:"Camp Cook", icon:"👩‍🍳", desc:"Cook 20 dishes", check: () => (state.cooked || 0) >= 20, progress: () => [Math.min(state.cooked || 0, 20), 20], reward:{ gold:120, xp:90 } },
  { id:"ach_cookall", title:"Full Cookbook", icon:"📖", desc:"Cook every recipe at least once", check: () => DISHES.every(d => (state.cookbook || {})[d.id]), progress: () => [DISHES.filter(d => (state.cookbook || {})[d.id]).length, DISHES.length], reward:{ gold:250, xp:180 } },
  { id:"ach_soel7", title:"Cat Person", icon:"🐱", desc:"Receive 7 gifts from Soel", check: () => soelEnsure().giftsTotal >= 7, progress: () => [Math.min(soelEnsure().giftsTotal, 7), 7], reward:{ gold:90, xp:70 } },
  { id:"ach_soel30", title:"Chosen by Soel", icon:"😻", desc:"Receive 30 gifts from Soel", check: () => soelEnsure().giftsTotal >= 30, progress: () => [Math.min(soelEnsure().giftsTotal, 30), 30], reward:{ gold:300, xp:220 } },
  { id:"ach_pets500", title:"Purr Machine", icon:"🫶", desc:"Pet Soel 500 times", check: () => soelEnsure().petsTotal >= 500, progress: () => [Math.min(soelEnsure().petsTotal, 500), 500], reward:{ gold:150, xp:110 } },
  { id:"ach_fullgear", title:"Fully Equipped", icon:"🛡️", desc:"Fill all seven equipment slots", check: () => ["weapon", "armor", "trinket", "ring1", "ring2", "amulet", "cloak"].every(k => state.equipment && state.equipment[k]), reward:{ gold:100, xp:80 } },
];
