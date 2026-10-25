/* =====================================================================
   Daybreak v15 expansion: real-life habits drive the game.
   Loaded BEFORE app.js. Everything here is called lazily from app.js, so
   it only relies on app.js globals (state, ui, C, card, today, ...) at call time.
   ===================================================================== */

/* ---------------- habit tracking ---------------- */
const HABIT_KEYS = ["water", "food", "sleep", "move", "supps"];
const HABIT_INFO = {
  water: { icon:"💧", name:"Hydrated",  buff:"+10% gold",          hint:"Reach your water goal" },
  food:  { icon:"🍽️", name:"Well-Fed",  buff:"+10% XP",            hint:"Log meals within your calorie goal" },
  sleep: { icon:"😴", name:"Rested",    buff:"bonus material drops", hint:"Sleep 7h+ (Sleep Tracker)" },
  move:  { icon:"💪", name:"Energized", buff:"+1 max Focus",       hint:"Workout on training days (rest & period days count)" },
  supps: { icon:"💊", name:"Fortified", buff:"counts toward the weekly boss", hint:"Finish your supplement schedule" },
};
const HABIT_BOSS_HP = 20;

function xWeekDates(dateKey) {
  const d = new Date((dateKey || today()) + "T00:00:00");
  const diff = d.getDay() === 0 ? -6 : 1 - d.getDay();
  d.setDate(d.getDate() + diff);
  const out = [];
  for (let i = 0; i < 7; i++) { out.push(dayKey(d)); d.setDate(d.getDate() + 1); }
  return out;
}
function xWeekKey() { return xWeekDates(today())[0]; }
function xSleepOk(k) {
  try {
    const sessions = (state.sleepTracker && state.sleepTracker.sessions) || [];
    return sessions.some(s => s.wakeDate === k && Number(s.durationMin) >= 420);
  } catch (e) { return false; }
}
function habitDayCompute(k) {
  try {
    const isT = k === today();
    const water = isT ? state.water.count >= state.water.goal : !!(state.wellnessLog[k] && state.wellnessLog[k].waterHit);
    const entries = isT ? state.tavern.log : (state.tavernLog[k] || []);
    const kcal = tavernKcalForEntries(entries);
    const food = entries.length > 0 && kcal <= calorieGoal() * 1.1;
    const move = workoutLogged(k) || !isWorkoutDay(k) || isDateInPeriod(k);
    const led = state.wellnessXpLedger && state.wellnessXpLedger[k];
    return { w:water?1:0, f:food?1:0, s:xSleepOk(k)?1:0, m:move?1:0, u:(led && led.dailyBonus)?1:0 };
  } catch (e) { return { w:0, f:0, s:0, m:0, u:0 }; }
}
function habitDay(k) {
  if (k === today()) return habitDayCompute(k);
  if (k > today()) return { w:0, f:0, s:0, m:0, u:0 };
  const h = state.habitHistory && state.habitHistory[k];
  return h || habitDayCompute(k);
}
function habitPoints(k) { const h = habitDay(k); return h.w + h.f + h.s + h.m + h.u; }
function habitBuffs() {
  const h = habitDayCompute(today());
  return { water:!!h.w, food:!!h.f, sleep:!!h.s, move:!!h.m, supps:!!h.u, aura:!!(h.w && h.f && h.s && h.m) };
}
function habitGoldMult() { const b = habitBuffs(); return (b.water ? 1.1 : 1) * (b.aura ? 1.1 : 1); }
function habitXpMult() { const b = habitBuffs(); return (b.food ? 1.1 : 1) * (b.aura ? 1.1 : 1) * (comebackBoostActive() ? 1.5 : 1); }
function habitFocusBonus() { return habitBuffs().move ? 1 : 0; }
// Persist today's flags so history survives log pruning. Only saves when something changed.
function recordHabitDay() {
  if (!state.habitHistory || typeof state.habitHistory !== "object") state.habitHistory = {};
  const t = today(), h = habitDayCompute(t), prev = state.habitHistory[t];
  const sum = h.w + h.f + h.s + h.m + h.u;
  if (!prev && !sum) return;
  if (prev && prev.w === h.w && prev.f === h.f && prev.s === h.s && prev.m === h.m && prev.u === h.u) return;
  state.habitHistory[t] = h;
  save();
}
function habitHistoryCount(flag) {
  return Object.values(state.habitHistory || {}).filter(h => h && h[flag]).length;
}
function habitAuraDays() { return Object.values(state.habitHistory || {}).filter(h => h && h.w && h.f && h.s && h.m).length; }

/* ---------------- weekly habit boss ---------------- */
const HABIT_BOSSES = [
  { name:"The Procrastination Hydra", icon:"🐉" },
  { name:"The Sloth Wyrm", icon:"🦥" },
  { name:"The Sugar Wraith", icon:"👻" },
  { name:"The Midnight Specter", icon:"🌑" },
  { name:"The Dune Golem of Thirst", icon:"🏜️" },
  { name:"The Couch Colossus", icon:"🛋️" },
  { name:"The Snooze Kraken", icon:"🐙" },
  { name:"The Skipped-Meal Shade", icon:"🌫️" },
];
function habitBossForWeek() {
  const wk = xWeekKey();
  return { week: wk, ...HABIT_BOSSES[hashDay(wk) % HABIT_BOSSES.length] };
}
function habitBossDamage() {
  const t = today();
  return xWeekDates(t).filter(k => k <= t).reduce((n, k) => n + habitPoints(k), 0);
}
function habitBossDefeated() { return habitBossDamage() >= HABIT_BOSS_HP; }
function habitBossClaimed() { return !!(state.habitBoss && state.habitBoss.week === xWeekKey() && state.habitBoss.claimed); }
function claimHabitBoss() {
  if (!habitBossDefeated() || habitBossClaimed()) return;
  const boss = habitBossForWeek(), scale = rewardScale(state.player.level);
  const overkill = habitBossDamage() >= 28;
  const gold = Math.round((140 + (overkill ? 60 : 0)) * scale), xp = Math.round((100 + (overkill ? 50 : 0)) * scale);
  state.materials["Legend Shard"] = (state.materials["Legend Shard"] || 0) + (overkill ? 3 : 2);
  state.potions.health_draught = (state.potions.health_draught || 0) + 1;
  state.habitBoss = { week: boss.week, claimed: true };
  state.habitBossWins = (state.habitBossWins || 0) + 1;
  const leveledUp = grantReward(gold, xp);
  save(); render();
  if (leveledUp) setTimeout(() => showToast(`Level up! You are now Level ${state.player.level}.`), 300);
  else showToast(`${boss.icon} ${boss.name} falls! +${gold}g +${xp}xp +${overkill ? 3 : 2} Legend Shards`);
}

/* ---------------- hero stats + weekly boss + gentle mode card ---------------- */
function heroStatsCardHtml() {
  const b = habitBuffs(), t = today();
  const chips = HABIT_KEYS.map(k => {
    const on = b[k], info = HABIT_INFO[k];
    return `<div title="${info.hint}" style="flex:1;min-width:0;text-align:center;padding:8px 2px;border-radius:12px;background:${on ? C.sageSoft : C.creamDeep};border:1px solid ${on ? C.sage : "transparent"};opacity:${on ? 1 : .75}">
      <div style="font-size:18px;${on ? "" : "filter:grayscale(1) opacity(.5)"}">${info.icon}</div>
      <div style="font-size:9px;font-weight:700;color:${on ? C.sage : C.inkSoft};margin-top:2px">${info.name}</div>
    </div>`;
  }).join("");
  const missing = HABIT_KEYS.filter(k => !b[k] && k !== "supps").map(k => HABIT_INFO[k]);
  const hintLine = b.aura
    ? `✨ <b>Daybreak Aura</b> — all four core habits done: +10% gold & XP on top!`
    : missing.length ? `Next up: ${missing[0].icon} ${missing[0].hint} → ${missing[0].buff}` : "";
  const boss = habitBossForWeek(), dmg = Math.min(HABIT_BOSS_HP, habitBossDamage()), pct = Math.round(dmg / HABIT_BOSS_HP * 100);
  const dead = habitBossDefeated(), claimed = habitBossClaimed();
  const days = xWeekDates(t).map((k, i) => {
    const p = k > t ? null : habitPoints(k);
    const label = ["M","T","W","T","F","S","S"][i];
    return `<div style="flex:1;text-align:center"><div style="height:22px;border-radius:6px;background:${p == null ? C.creamDeep : p >= 4 ? C.sage : p >= 2 ? C.gold : p >= 1 ? C.pink : C.creamDeep};opacity:${p == null ? .5 : 1};font-size:10px;font-weight:700;color:white;line-height:22px">${p == null ? "" : p}</div><div style="font-size:8.5px;color:${C.inkSoft};margin-top:2px;${k === t ? "font-weight:700" : ""}">${label}</div></div>`;
  }).join("");
  const bossAction = claimed ? `<span style="font-size:10.5px;font-weight:700;color:${C.sage}">✔️ Defeated</span>`
    : dead ? `<button data-act="claimHabitBoss" class="disp" style="padding:6px 14px;border-radius:9999px;font-size:11px;font-weight:700;background:${C.gold};color:white">Claim Loot</button>` : "";
  return card(`
    <div style="padding:16px">
      <p class="disp" style="font-weight:700;font-size:14px;margin:0 0 8px;color:${C.mageDeep}">🦸 Hero Stats Today</p>
      <div style="display:flex;gap:6px;margin-bottom:8px">${chips}</div>
      ${hintLine ? `<p style="font-size:10.5px;color:${C.inkSoft};margin:0 0 12px">${hintLine}</p>` : `<div style="height:8px"></div>`}
      <div style="border-top:1px solid ${C.border};padding-top:10px">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
          <span style="font-size:22px">${boss.icon}</span>
          <div style="flex:1"><p class="disp" style="font-weight:700;font-size:12.5px;margin:0">Weekly Boss: ${boss.name}</p><p style="font-size:10px;color:${C.inkSoft};margin:1px 0 0">Every habit you complete this week hits it. ${dmg}/${HABIT_BOSS_HP} damage</p></div>
          ${bossAction}
        </div>
        <div style="height:8px;border-radius:9999px;overflow:hidden;background:${C.creamDeep};margin-bottom:8px"><div style="height:8px;width:${100 - pct}%;background:${dead ? C.sage : "#E85B5B"}"></div></div>
        <div style="display:flex;gap:4px">${days}</div>
      </div>
    </div>`);
}

/* ---------------- cycle-aware gentle mode ---------------- */
const IRON_FOOD_RE = /liver|beef|spinach|lentil|tofu|tempeh|sardine|chickpea|egg|kangkung|broccoli|dates|bayam/i;
function gentleCardHtml() {
  if (!isDateInPeriod(today())) return "";
  const foods = TAVERN_FOODS.filter(f => IRON_FOOD_RE.test(f.name)).slice(0, 5);
  const claimed = state.gentle && state.gentle.date === today();
  const chips = foods.map(f => `<button data-act="orderTavernItem" data-arg="${f.id}" class="disp" style="display:flex;flex-direction:column;align-items:center;gap:2px;padding:7px 8px;border-radius:12px;background:${C.card};flex-shrink:0;min-width:62px"><span style="font-size:16px">${f.emoji}</span><span style="font-size:8.5px;font-weight:700;color:${C.mageDeep};max-width:62px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${escapeHtml(f.name)}</span></button>`).join("");
  return card(`
    <div style="padding:16px;background:linear-gradient(135deg, ${C.pink}2a, ${C.cream})">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
        <span style="font-size:22px">🩸</span>
        <div style="flex:1"><p class="disp" style="font-weight:700;font-size:13px;margin:0">Gentle Mode · Day ${periodDayNumber(today())}</p><p style="font-size:10.5px;color:${C.inkSoft};margin:2px 0 0">Movement counts as done today. Rest, water, warm food. That's the whole quest.</p></div>
        ${claimed ? `<span style="font-size:10.5px;font-weight:700;color:${C.sage}">✔️ Rested</span>` : `<button data-act="claimGentleReward" class="disp" style="padding:6px 14px;border-radius:9999px;font-size:11px;font-weight:700;background:${C.pink};color:white">Rest +20g</button>`}
      </div>
      ${chips ? `<p style="font-size:10px;color:${C.inkSoft};margin:0 0 6px">Iron-friendly picks from the Tavern:</p><div style="display:flex;gap:6px;overflow-x:auto">${chips}</div>` : ""}
    </div>`);
}
function claimGentleReward() {
  if (!isDateInPeriod(today()) || (state.gentle && state.gentle.date === today())) return;
  state.gentle = { date: today() };
  const leveledUp = grantReward(20, 15);
  save(); render();
  if (leveledUp) setTimeout(() => showToast(`Level up! You are now Level ${state.player.level}.`), 300);
  else showToast("🩸 Rest is progress. +20g +15xp");
}

/* ---------------- daily treasure + weekly fortune track ---------------- */
function treasureEnsure() {
  const wk = xWeekKey();
  if (!state.treasure || typeof state.treasure !== "object") state.treasure = {};
  const tr = state.treasure;
  if (tr.week !== wk) { tr.week = wk; tr.days = []; tr.grandClaimed = false; }
  if (!Array.isArray(tr.days)) tr.days = [];
  if (tr.pity == null) tr.pity = 0;
  if (tr.total == null) tr.total = 0;
  if (tr.grandTotal == null) tr.grandTotal = 0;
  return tr;
}
function treasureClaimedToday() { return treasureEnsure().days.includes(today()); }
function rollTreasure() {
  const tr = treasureEnsure(), scale = rewardScale(state.player.level);
  const streakBoost = Math.min(10, state.streak || 0);
  const rareW = 8 + streakBoost + tr.pity * 4, epicW = 2 + Math.floor(tr.pity / 2);
  const table = [
    { w: 52, id:"gold" }, { w: 22, id:"xp" }, { w: 16, id:"mats" },
    { w: rareW, id:"rare" }, { w: epicW, id:"epic" },
  ];
  let roll = Math.random() * table.reduce((n, r) => n + r.w, 0), pick = table[0];
  for (const r of table) { roll -= r.w; if (roll <= 0) { pick = r; break; } }
  const rare = pick.id === "rare" || pick.id === "epic";
  tr.pity = rare ? 0 : tr.pity + 1;
  switch (pick.id) {
    case "gold": { const g = Math.round((25 + Math.random() * 45) * scale); return { icon:"🪙", text:`${g} gold`, gold:g }; }
    case "xp":   { const x = Math.round((20 + Math.random() * 30) * scale); return { icon:"✨", text:`${x} XP`, xp:x }; }
    case "mats": { const m = {}; const n = 3 + Math.floor(Math.random() * 4); for (let i = 0; i < n; i++) { const k = MATERIALS[Math.floor(Math.random() * MATERIALS.length)]; m[k] = (m[k] || 0) + 1; } return { icon:"🧺", text:`${n} materials`, mats:m }; }
    case "rare": {
      const opts = [{ icon:"🧪", text:"2 Health Draughts", potions:{ health_draught:2 } }, { icon:"🎯", text:"a Focus Elixir", potions:{ focus_elixir:1 } }, { icon:"🪙", text:"a heavy purse (150g)", gold:Math.round(150 * scale) }];
      if ((state.graceTokens || 0) < 3) opts.push({ icon:"🛡️", text:"a Streak Shield", grace:1 });
      return opts[Math.floor(Math.random() * opts.length)];
    }
    default: return { icon:"💎", text:`${1 + (Math.random() < .3 ? 1 : 0)} Legend Shard`, shard: 1 + (Math.random() < .3 ? 1 : 0) };
  }
}
function applyPrize(p) {
  Object.entries(p.mats || {}).forEach(([m, q]) => { state.materials[m] = (state.materials[m] || 0) + q; });
  Object.entries(p.potions || {}).forEach(([id, q]) => { state.potions[id] = (state.potions[id] || 0) + q; });
  if (p.shard) state.materials["Legend Shard"] = (state.materials["Legend Shard"] || 0) + p.shard;
  if (p.grace) state.graceTokens = Math.min(3, (state.graceTokens || 0) + p.grace);
  return grantReward(p.gold || 0, p.xp || 0);
}
function claimDailyTreasure() {
  ensureDaily();
  const tr = treasureEnsure();
  if (tr.days.includes(today())) return;
  const prize = rollTreasure();
  tr.days.push(today());
  tr.total++;
  tr.last = { date: today(), icon: prize.icon, text: prize.text };
  let leveledUp = applyPrize(prize);
  let grandMsg = "";
  if (tr.days.length >= 5 && !tr.grandClaimed) {
    tr.grandClaimed = true; tr.grandTotal++;
    const scale = rewardScale(state.player.level);
    state.materials["Legend Shard"] = (state.materials["Legend Shard"] || 0) + 2;
    state.potions.health_draught = (state.potions.health_draught || 0) + 2;
    state.potions.focus_elixir = (state.potions.focus_elixir || 0) + 1;
    leveledUp = grantReward(Math.round(250 * scale), Math.round(150 * scale)) || leveledUp;
    grandMsg = " · 🎁 WEEKLY GRAND PRIZE unlocked!";
  }
  save(); render();
  if (leveledUp) setTimeout(() => showToast(`Level up! You are now Level ${state.player.level}.`), 300);
  else showToast(`${prize.icon} Treasure: ${prize.text}${grandMsg}`);
}
function treasureCardHtml() {
  const tr = treasureEnsure(), t = today();
  const claimed = tr.days.includes(t);
  const pips = xWeekDates(t).map((k, i) => {
    const on = tr.days.includes(k);
    return `<div style="flex:1;text-align:center"><div style="height:22px;border-radius:50%;width:22px;margin:0 auto;background:${on ? C.gold : C.creamDeep};font-size:11px;line-height:22px;${k === t && !on ? `border:2px dashed ${C.gold};box-sizing:border-box;line-height:18px` : ""}">${on ? "★" : ""}</div><div style="font-size:8.5px;color:${C.inkSoft};margin-top:2px">${["M","T","W","T","F","S","S"][i]}</div></div>`;
  }).join("");
  const got = tr.days.length;
  return card(`
    <div style="padding:16px;background:linear-gradient(135deg, ${C.gold}22, ${C.cream})">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:10px">
        <div style="width:42px;height:42px;border-radius:12px;background:${C.gold}33;display:flex;align-items:center;justify-content:center;flex-shrink:0"><span style="font-size:22px">${claimed ? "📭" : "🎁"}</span></div>
        <div style="flex:1">
          <p class="disp" style="font-weight:700;font-size:13px;margin:0">Daily Treasure</p>
          <p style="font-size:10.5px;color:${C.inkSoft};margin:2px 0 0">${claimed ? (tr.last ? `Today: ${tr.last.icon} ${tr.last.text}` : "Claimed today.") : "One chest a day. Better odds the longer your streak."} · ${got >= 5 || tr.grandClaimed ? "Grand Prize earned ✔️" : `${got}/5 days for this week's Grand Prize`}</p>
        </div>
        ${claimed ? "" : `<button data-act="claimDailyTreasure" class="disp" style="padding:8px 16px;border-radius:9999px;font-size:11.5px;font-weight:700;background:${C.gold};color:white">Open</button>`}
      </div>
      <div style="display:flex;gap:4px">${pips}</div>
    </div>`);
}

/* ---------------- quick actions strip ---------------- */
function quickStripHtml() {
  const done = state.water.count >= state.water.goal;
  const favs = (state.tavernFavorites || []).slice(0, 3).map(id => TAVERN_FOODS.find(f => f.id === id)).filter(Boolean);
  const favBtns = favs.map(f => `<button data-act="orderTavernItem" data-arg="${f.id}" class="disp" title="${escapeHtml(f.name)}" style="flex-shrink:0;padding:8px 10px;border-radius:12px;font-size:11px;font-weight:700;background:${C.mageSoft};color:${C.mageDeep};max-width:110px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${f.emoji} ${escapeHtml(f.name.split("(")[0].trim())}</button>`).join("");
  return `<div style="display:flex;gap:8px;overflow-x:auto;padding-bottom:2px">
    <button data-act="drinkWater" ${done ? "disabled" : ""} class="disp" style="flex-shrink:0;padding:8px 12px;border-radius:12px;font-size:11px;font-weight:700;background:${done ? C.sageSoft : C.mage};color:${done ? C.sage : "white"}">💧 ${done ? "Water done" : `+1 cup (${state.water.count}/${state.water.goal})`}</button>
    <button data-act="openTavern" class="disp" style="flex-shrink:0;padding:8px 12px;border-radius:12px;font-size:11px;font-weight:700;background:${C.mageDeep};color:white">🍽️ Log meal</button>
    ${favBtns}
  </div>`;
}

/* ---------------- tavern: rank + balanced plate + totals ---------------- */
const TAVERN_RANKS = [
  { min:0,   title:"Wanderer's Table", reward:null },
  { min:25,  title:"Regular's Corner", reward:{ gold:60, xp:40, shard:0 } },
  { min:75,  title:"Chef's Counter", reward:{ gold:120, xp:80, shard:1 } },
  { min:150, title:"Hearth Master", reward:{ gold:220, xp:140, shard:2 } },
  { min:300, title:"Legend of the Kitchen", reward:{ gold:400, xp:250, shard:3 } },
];
function totalMealsLogged() {
  return Object.values(state.wellnessXpLedger || {}).reduce((n, l) => n + ((l && l.foodLogs) ? l.foodLogs.length : 0), 0);
}
function tavernRankIndex() {
  const n = totalMealsLogged(); let idx = 0;
  TAVERN_RANKS.forEach((r, i) => { if (n >= r.min) idx = i; });
  return idx;
}
function tavernRankLine() {
  const idx = tavernRankIndex(), n = totalMealsLogged(), next = TAVERN_RANKS[idx + 1];
  return `${TAVERN_RANKS[idx].title}${next ? ` · ${n}/${next.min} meals to ${next.title}` : " · max rank"}`;
}
const FIBER_NAME_RE = /salad|veg|broccoli|spinach|kangkung|bayam|fruit|apple|berr|cucumber|tomato|avocado|beans|lentil|oat/i;
function afterMealLogged(dateKey) {
  let msg = "";
  if (dateKey === today()) {
    const entries = state.tavern.log;
    const protein = entries.some(e => (e.protein || 0) >= 10);
    const fiber = entries.some(e => (e.fiber || 0) >= 3 || FIBER_NAME_RE.test(e.name || ""));
    if (entries.length >= 3 && protein && fiber && !(state.balancedPlate && state.balancedPlate.date === today())) {
      state.balancedPlate = { date: today() };
      grantReward(12, 8);
      msg += " 🥗 Balanced Plate! +12g +8xp.";
    }
  }
  const idx = tavernRankIndex(), claimed = state.tavernRankClaimed || 0;
  if (idx > claimed) {
    for (let i = claimed + 1; i <= idx; i++) {
      const r = TAVERN_RANKS[i].reward;
      if (r) { grantReward(r.gold, r.xp); if (r.shard) state.materials["Legend Shard"] = (state.materials["Legend Shard"] || 0) + r.shard; }
      msg += ` 🍺 Tavern rank up: ${TAVERN_RANKS[i].title}!`;
    }
    state.tavernRankClaimed = idx;
  }
  if (msg) setTimeout(() => showToast(msg.trim()), 600);
}

/* ---------------- seasonal events ---------------- */
const SEASONAL_EVENTS = [
  { id:"hollow2026", name:"Hollow Night Festival", icon:"🎃", start:"2026-10-24", end:"2026-11-01", target:18, title:"Lantern-Bearer", keepsake:{ icon:"🎃", name:"Jack-o'-Lantern Charm" }, text:"Lanterns line the Market Row and the wraiths are feeling theatrical. Keep your habits lit all week to chase the dark back." },
  { id:"winter2026", name:"Winter Lantern Fair", icon:"🎄", start:"2026-12-18", end:"2026-12-26", target:20, title:"Winterlight Keeper", keepsake:{ icon:"🎄", name:"Tiny Evergreen" }, text:"Warm food, warmer company. The Guild hangs lights in every window." },
  { id:"newdawn2027", name:"A Fresh Dawn", icon:"🎆", start:"2026-12-30", end:"2027-01-03", target:14, title:"First Light", keepsake:{ icon:"🎆", name:"Dawn Sparkler" }, text:"A new year, a clean map. Start gently and start anyway." },
  { id:"lunar2027", name:"Lantern Spring", icon:"🧧", start:"2027-02-01", end:"2027-02-14", target:28, title:"Spring Walker", keepsake:{ icon:"🧧", name:"Red Envelope Charm" }, text:"Lunar New Year at the Guild — red lanterns, long tables, plenty to celebrate." },
  { id:"national2027", name:"Homeland Fireworks", icon:"🎇", start:"2027-02-20", end:"2027-02-24", target:12, title:"Homeland Spark", keepsake:{ icon:"🎇", name:"Festival Rocket" }, text:"National Day lights up the sky over the Last Rise." },
  { id:"raya2027", name:"Open House Week", icon:"🌙", start:"2027-03-08", end:"2027-03-14", target:15, title:"Open House Host", keepsake:{ icon:"🌙", name:"Brass Pelita Lamp" }, text:"Hari Raya at the Guild — doors open, plates full. (Dates are estimates until confirmed.)" },
];
function activeSeasonalEvent() {
  const t = today();
  return SEASONAL_EVENTS.find(e => t >= e.start && t <= e.end) || null;
}
function eventProgress(ev) {
  const t = today(); let pts = 0, cur = ev.start;
  for (let i = 0; i < 20 && cur <= ev.end && cur <= t; i++) { pts += habitPoints(cur); cur = addDaysKey(cur, 1); }
  return pts;
}
function eventClaimed(id) { return (state.eventsClaimed || []).includes(id); }
function claimSeasonalEvent(id) {
  const ev = SEASONAL_EVENTS.find(e => e.id === id);
  if (!ev || eventClaimed(id) || eventProgress(ev) < ev.target) return;
  const scale = rewardScale(state.player.level);
  state.eventsClaimed = (state.eventsClaimed || []).concat(id);
  if (!state.keepsakes) state.keepsakes = [];
  state.keepsakes.push({ id, ...ev.keepsake });
  if (!state.unlockedTitles) state.unlockedTitles = [];
  if (!state.unlockedTitles.includes(ev.title)) state.unlockedTitles.push(ev.title);
  state.materials["Legend Shard"] = (state.materials["Legend Shard"] || 0) + 2;
  const leveledUp = grantReward(Math.round(200 * scale), Math.round(150 * scale));
  save(); render();
  if (leveledUp) setTimeout(() => showToast(`Level up! You are now Level ${state.player.level}.`), 300);
  else showToast(`${ev.icon} ${ev.name} complete! Title unlocked: ${ev.title}. Keepsake: ${ev.keepsake.name}`);
}
function eventCardHtml() {
  const ev = activeSeasonalEvent();
  if (!ev) return "";
  const prog = eventProgress(ev), done = prog >= ev.target, claimed = eventClaimed(ev.id);
  const left = daysBetweenKeys(today(), ev.end);
  return card(`
    <div style="padding:16px;background:linear-gradient(135deg, ${C.mage}33, ${C.pink}22, ${C.cream})">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:8px">
        <div style="width:44px;height:44px;border-radius:14px;background:${C.mage}33;display:flex;align-items:center;justify-content:center;flex-shrink:0"><span style="font-size:24px">${ev.icon}</span></div>
        <div style="flex:1"><p class="disp" style="font-weight:700;font-size:13px;margin:0">${ev.name}</p><p style="font-size:10.5px;color:${C.inkSoft};margin:2px 0 0">Limited event · ${left <= 0 ? "last day!" : `${left} day${left === 1 ? "" : "s"} left`}</p></div>
        ${claimed ? `<span style="font-size:10.5px;font-weight:700;color:${C.sage}">✔️ Done</span>` : done ? `<button data-act="claimSeasonalEvent" data-arg="${ev.id}" class="disp" style="padding:7px 14px;border-radius:9999px;font-size:11px;font-weight:700;background:${C.mageDeep};color:white">Claim</button>` : ""}
      </div>
      <p style="font-size:11px;color:${C.inkSoft};margin:0 0 8px">${ev.text}</p>
      <div style="display:flex;justify-content:space-between;margin-bottom:3px"><span style="font-size:10px;color:${C.inkSoft}">Habit points</span><span style="font-size:10px;font-weight:700">${Math.min(prog, ev.target)}/${ev.target}</span></div>
      <div style="height:8px;border-radius:9999px;overflow:hidden;background:${C.creamDeep};margin-bottom:6px"><div style="height:8px;width:${Math.min(100, prog / ev.target * 100)}%;background:${C.mage}"></div></div>
      <p style="font-size:10px;color:${C.inkSoft};margin:0">Reward: title “${ev.title}”, keepsake ${ev.keepsake.icon} ${ev.keepsake.name}, gold, XP & Legend Shards.</p>
    </div>`);
}

/* ---------------- titles / prestige cosmetics ---------------- */
const BASE_TITLES = [
  { name:"the Mage", unlock: () => true },
  { name:"the Early Bird", unlock: () => habitHistoryCount("s") >= 7 },
  { name:"the Well-Watered", unlock: () => (state.waterGoalHits || 0) >= 14 },
  { name:"Boss of the Week", unlock: () => (state.habitBossWins || 0) >= 1 },
  { name:"the Aura-Bearer", unlock: () => habitAuraDays() >= 7 },
  { name:"the Comeback Kid", unlock: () => (state.comebackClaims || 0) >= 1 },
  { name:"of the Hearth", unlock: () => tavernRankIndex() >= 3 },
  { name:"the Treasure Hunter", unlock: () => ((state.treasure && state.treasure.total) || 0) >= 14 },
  { name:"the Ascended", unlock: () => (state.ascensionRank || 0) >= 1 },
  { name:"Dawnwalker", unlock: () => (state.ascensionRank || 0) >= 3 },
  { name:"Horizon-Bound", unlock: () => (state.ascensionRank || 0) >= 5 },
];
function allTitles() {
  return BASE_TITLES.filter(t => t.unlock()).map(t => t.name).concat(state.unlockedTitles || []);
}
function activeTitle() {
  const titles = allTitles();
  const cur = state.activeTitle;
  return cur && titles.includes(cur) ? cur : "the Mage";
}
function setActiveTitle(name) { if (allTitles().includes(name)) { state.activeTitle = name; save(); render(); } }
function titleSettingsHtml() {
  const cur = activeTitle();
  const btns = allTitles().map(n => `<button data-act="setActiveTitle" data-arg="${escapeHtml(n)}" class="disp" style="padding:6px 10px;border-radius:9999px;font-size:11px;font-weight:700;background:${cur === n ? C.mageDeep : C.creamDeep};color:${cur === n ? "white" : C.ink}">${escapeHtml(n)}</button>`).join("");
  const keeps = (state.keepsakes || []).map(k => `<span title="${escapeHtml(k.name)}" style="font-size:20px">${k.icon}</span>`).join("");
  return `<p class="disp" style="font-weight:700;font-size:12.5px;color:${C.mageDeep};margin:0 0 6px">🏷️ Title</p>
    <p style="font-size:10.5px;color:${C.inkSoft};margin:0 0 8px">Shown beside your name. Earn more from habits, events and Ascension.</p>
    <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:${keeps ? 8 : 16}px">${btns}</div>
    ${keeps ? `<p style="font-size:10px;color:${C.inkSoft};margin:0 0 4px">Keepsakes</p><div style="display:flex;gap:6px;margin-bottom:16px">${keeps}</div>` : ""}`;
}

/* ---------------- "almost there" nudges ---------------- */
function nudgeList() {
  const out = [];
  const need = xpToNext(state.player.level), pct = state.player.xp / need;
  if (pct >= 0.75) out.push(`⭐ ${need - state.player.xp} XP to Level ${state.player.level + 1}`);
  const dmg = habitBossDamage();
  if (!habitBossDefeated() && dmg >= 12) out.push(`${habitBossForWeek().icon} ${HABIT_BOSS_HP - dmg} more habit points to fell this week's boss`);
  const tr = treasureEnsure();
  if (!tr.grandClaimed && tr.days.length === 4) out.push("🎁 One more chest day for this week's Grand Prize");
  const ev = activeSeasonalEvent();
  if (ev && !eventClaimed(ev.id)) { const p = eventProgress(ev); if (p < ev.target && p / ev.target >= .6) out.push(`${ev.icon} ${ev.target - p} points left in ${ev.name}`); }
  const near = (typeof EXPANSION_ACHIEVEMENTS !== "undefined" ? EXPANSION_ACHIEVEMENTS : []).filter(a => !state.achievementsClaimed.includes(a.id) && !a.check() && a.progress).map(a => ({ a, p: a.progress() })).filter(x => x.p[1] > 0 && x.p[0] / x.p[1] >= 0.75).sort((x, y) => y.p[0] / y.p[1] - x.p[0] / x.p[1]);
  if (near[0]) out.push(`🏆 ${near[0].a.title}: ${near[0].p[0]}/${near[0].p[1]}`);
  return out.slice(0, 3);
}
function nudgeCardHtml() {
  const n = nudgeList();
  if (!n.length) return "";
  return card(`<div style="padding:12px 16px"><p class="disp" style="font-weight:700;font-size:12px;margin:0 0 6px;color:${C.mageDeep}">🎯 Almost there</p>${n.map(x => `<p style="font-size:11.5px;margin:3px 0;color:${C.ink}">${x}</p>`).join("")}</div>`);
}

/* ---------------- insights additions ---------------- */
function calorieChartHtml() {
  const t = today(), days = [];
  for (let i = 6; i >= 0; i--) days.push(addDaysKey(t, -i));
  const goal = calorieGoal();
  const vals = days.map(k => tavernKcalForEntries(k === t ? state.tavern.log : (state.tavernLog[k] || [])));
  const max = Math.max(goal * 1.25, ...vals, 1);
  const bars = days.map((k, i) => {
    const v = vals[i], h = Math.round(v / max * 70);
    return `<div style="flex:1;text-align:center"><div style="font-size:8.5px;color:${C.inkSoft}">${v || ""}</div><div style="height:72px;display:flex;align-items:flex-end;justify-content:center"><div style="width:70%;height:${Math.max(v ? 3 : 0, h)}px;border-radius:4px 4px 0 0;background:${v > goal * 1.1 ? "#E85B5B" : C.pink}"></div></div><div style="font-size:8.5px;color:${C.inkSoft}">${["Su","Mo","Tu","We","Th","Fr","Sa"][new Date(k + "T00:00:00").getDay()]}</div></div>`;
  }).join("");
  const goalY = Math.round(goal / max * 70);
  const logged = vals.filter(v => v > 0);
  const avg = logged.length ? Math.round(logged.reduce((a, b) => a + b, 0) / logged.length) : 0;
  return `<div style="margin-bottom:16px"><p class="disp" style="font-weight:700;font-size:13px;color:${C.mageDeep};margin:0 0 6px">🔥 Calories · last 7 days <span style="font-weight:400;color:${C.inkSoft};font-size:11px">avg ${avg} / goal ${goal}</span></p>
    <div style="position:relative"><div style="position:absolute;left:0;right:0;bottom:${goalY + 14}px;border-top:1px dashed ${C.gold}"></div><div style="display:flex;gap:4px">${bars}</div></div></div>`;
}
function habitHeatmapHtml() {
  const t = today(), cells = [];
  for (let i = 27; i >= 0; i--) {
    const k = addDaysKey(t, -i), p = habitPoints(k);
    const col = p >= 5 ? C.sage : p >= 4 ? C.sage + "cc" : p >= 3 ? C.gold : p >= 1 ? C.pink + "99" : C.creamDeep;
    cells.push(`<div title="${k}: ${p}/5" style="aspect-ratio:1/1;border-radius:5px;background:${col};${k === t ? `outline:2px solid ${C.mageDeep}` : ""}"></div>`);
  }
  return `<div style="margin-bottom:16px"><p class="disp" style="font-weight:700;font-size:13px;color:${C.mageDeep};margin:0 0 6px">🗓️ Habit heatmap <span style="font-weight:400;color:${C.inkSoft};font-size:11px">last 28 days · points out of 5</span></p><div style="display:grid;grid-template-columns:repeat(14,1fr);gap:3px">${cells.join("")}</div></div>`;
}
function weeklyWinsHtml() {
  const t = today(), wk = xWeekDates(t), pts = wk.filter(k => k <= t).reduce((n, k) => n + habitPoints(k), 0);
  const wins = [];
  if (habitBossDefeated()) wins.push(`${habitBossForWeek().icon} Weekly boss defeated`);
  const water = wk.filter(k => k <= t && habitDay(k).w).length;
  if (water) wins.push(`💧 Water goal hit ${water} day${water === 1 ? "" : "s"}`);
  const fed = wk.filter(k => k <= t && habitDay(k).f).length;
  if (fed) wins.push(`🍽️ ${fed} well-fed day${fed === 1 ? "" : "s"}`);
  const rest = wk.filter(k => k <= t && habitDay(k).s).length;
  if (rest) wins.push(`😴 ${rest} well-rested night${rest === 1 ? "" : "s"}`);
  if (pts && !wins.length) wins.push(`⭐ ${pts} habit points — every one counts`);
  if (!wins.length) wins.push("🌱 A fresh week is waiting. No pressure.");
  return `<p style="font-size:11px;color:${C.ink};margin:0 0 10px">${wins.slice(0, 4).join(" · ")}</p>`;
}

/* ---------------- gentle daily reminder (works while the app is open / installed) ---------------- */
let habitReminderTimer = null;
function scheduleHabitReminder() {
  clearTimeout(habitReminderTimer);
  const hour = state.settings && state.settings.reminderHour;
  if (!state.settings || !state.settings.notificationsEnabled || hour == null || hour < 0) return;
  if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
  const now = new Date(), at = new Date(now);
  at.setHours(hour, 0, 0, 0);
  if (at <= now) at.setDate(at.getDate() + 1);
  habitReminderTimer = setTimeout(() => {
    try {
      if (habitPoints(today()) < 3) new Notification("Daybreak Quest", { body: "Your hero's buffs are waiting — a glass of water or a logged meal lights one up.", icon: "icon-192.png" });
    } catch (e) {}
    scheduleHabitReminder();
  }, Math.min(at - now, 2147000000));
}
function setReminderHour(value) {
  const v = parseInt(value, 10);
  if (isNaN(v) || v < -1 || v > 23) return;
  state.settings.reminderHour = v;
  save(); scheduleHabitReminder(); render();
}
function reminderSettingsHtml() {
  const cur = state.settings.reminderHour == null ? 20 : state.settings.reminderHour;
  const opts = [{ v:-1, l:"Off" }, { v:18, l:"6pm" }, { v:20, l:"8pm" }, { v:21, l:"9pm" }];
  const btns = opts.map(o => `<button data-act="setReminderHour" data-arg="${o.v}" class="disp" style="flex:1;padding:8px 4px;border-radius:12px;font-size:12px;font-weight:700;background:${cur === o.v ? C.mageDeep : C.creamDeep};color:${cur === o.v ? "white" : C.ink}">${o.l}</button>`).join("");
  return `<p class="disp" style="font-weight:700;font-size:12.5px;color:${C.mageDeep};margin:0 0 6px">🔔 Evening Nudge</p>
    <p style="font-size:10.5px;color:${C.inkSoft};margin:0 0 8px">One gentle notification if today's habits are quiet. Needs notifications enabled below; a browser can only fire it while the app is open or installed.</p>
    <div style="display:flex;gap:6px;margin-bottom:16px">${btns}</div>`;
}

/* ---------------- achievements added in v15 ---------------- */
function loggedDayStreak() {
  let n = 0, k = today();
  const logOf = d => d === today() ? state.tavern.log : (state.tavernLog[d] || []);
  if (logOf(k).length < 3) k = addDaysKey(k, -1);
  while (logOf(k).length >= 3 && n < 400) { n++; k = addDaysKey(k, -1); }
  return n;
}
const xa = (id, title, icon, desc, cur, target, reward) => ({ id, title, icon, desc, check: () => cur() >= target, progress: () => [Math.min(cur(), target), target], reward });
const EXPANSION_ACHIEVEMENTS = [
  xa("ach_meals50", "Tavern Regular", "🍺", "Log 50 meals", totalMealsLogged, 50, { gold:50, xp:40 }),
  xa("ach_meals250", "Feast Keeper", "🍲", "Log 250 meals", totalMealsLogged, 250, { gold:120, xp:90 }),
  xa("ach_kcal7", "On Target", "🔥", "Stay within your calorie goal on 7 logged days", () => habitHistoryCount("f"), 7, { gold:60, xp:45 }),
  xa("ach_kcal30", "Steady Fuel", "⛽", "Stay within your calorie goal on 30 logged days", () => habitHistoryCount("f"), 30, { gold:150, xp:110 }),
  xa("ach_everymeal", "Every Meal Counts", "📖", "Log 3+ meals a day for 7 days running", loggedDayStreak, 7, { gold:90, xp:70 }),
  xa("ach_water7", "Well Watered", "💧", "Hit your water goal on 7 days", () => state.waterGoalHits || 0, 7, { gold:40, xp:30 }),
  xa("ach_water30", "Deep Well", "🌊", "Hit your water goal on 30 days", () => state.waterGoalHits || 0, 30, { gold:100, xp:80 }),
  xa("ach_water100", "Living Spring", "⛲", "Hit your water goal on 100 days", () => state.waterGoalHits || 0, 100, { gold:250, xp:180 }),
  xa("ach_sleep5", "Good Night", "😴", "Sleep 7h+ on 5 nights", () => habitHistoryCount("s"), 5, { gold:50, xp:40 }),
  xa("ach_sleep20", "Dream Keeper", "🌙", "Sleep 7h+ on 20 nights", () => habitHistoryCount("s"), 20, { gold:130, xp:100 }),
  xa("ach_sleep60", "Moonlit Routine", "🌌", "Sleep 7h+ on 60 nights", () => habitHistoryCount("s"), 60, { gold:300, xp:220 }),
  xa("ach_work10", "Warming Up", "🏋️", "Log 10 workouts", () => workoutStats().total, 10, { gold:50, xp:40 }),
  xa("ach_work50", "Iron Habit", "💪", "Log 50 workouts", () => workoutStats().total, 50, { gold:150, xp:110 }),
  xa("ach_work100", "Unbreakable", "🛡️", "Log 100 workouts", () => workoutStats().total, 100, { gold:300, xp:220 }),
  xa("ach_weigh10", "Honest Scales", "⚖️", "Log 10 weigh-ins", () => (state.weightLog || []).length, 10, { gold:50, xp:40 }),
  xa("ach_weigh30", "Long View", "📈", "Log 30 weigh-ins", () => (state.weightLog || []).length, 30, { gold:140, xp:100 }),
  xa("ach_comeback1", "Welcome Back", "🌅", "Claim a Returning Hero reward", () => state.comebackClaims || 0, 1, { gold:40, xp:30 }),
  xa("ach_comeback3", "Always Another Dawn", "🌄", "Claim 3 Returning Hero rewards", () => state.comebackClaims || 0, 3, { gold:120, xp:90 }),
  xa("ach_boss1", "Habit Slayer", "🐉", "Defeat a Weekly Habit Boss", () => state.habitBossWins || 0, 1, { gold:70, xp:55 }),
  xa("ach_boss5", "Week-Breaker", "⚔️", "Defeat 5 Weekly Habit Bosses", () => state.habitBossWins || 0, 5, { gold:200, xp:150 }),
  xa("ach_boss10", "Bane of Bad Habits", "👑", "Defeat 10 Weekly Habit Bosses", () => state.habitBossWins || 0, 10, { gold:400, xp:300 }),
  xa("ach_aura1", "Daybreak Aura", "✨", "Light all four core buffs in one day", habitAuraDays, 1, { gold:60, xp:45 }),
  xa("ach_aura7", "Radiant Week", "🌞", "Earn the Daybreak Aura on 7 days", habitAuraDays, 7, { gold:180, xp:130 }),
  xa("ach_aura30", "Sun-Crowned", "🏵️", "Earn the Daybreak Aura on 30 days", habitAuraDays, 30, { gold:450, xp:320 }),
  xa("ach_chest7", "Treasure Seeker", "🎁", "Open 7 Daily Treasures", () => (state.treasure && state.treasure.total) || 0, 7, { gold:50, xp:40 }),
  xa("ach_chest30", "Hoard Keeper", "💰", "Open 30 Daily Treasures", () => (state.treasure && state.treasure.total) || 0, 30, { gold:160, xp:120 }),
  xa("ach_grand1", "Grand Prize", "🎊", "Earn a weekly Grand Prize", () => (state.treasure && state.treasure.grandTotal) || 0, 1, { gold:80, xp:60 }),
  xa("ach_grand4", "Month of Wonders", "🎆", "Earn 4 weekly Grand Prizes", () => (state.treasure && state.treasure.grandTotal) || 0, 4, { gold:240, xp:180 }),
  xa("ach_event1", "Festival Goer", "🎃", "Complete a seasonal event", () => (state.eventsClaimed || []).length, 1, { gold:100, xp:80 }),
  xa("ach_event3", "Calendar Keeper", "📅", "Complete 3 seasonal events", () => (state.eventsClaimed || []).length, 3, { gold:260, xp:190 }),
  xa("ach_rank3", "Hearth Master", "🍳", "Reach Tavern rank Hearth Master", tavernRankIndex, 3, { gold:120, xp:90 }),
];
