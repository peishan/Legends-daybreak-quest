LEGENDS: DAYBREAK QUEST — RECOVERY BUILD

Baseline save:
daybreak-quest-save-2026-07-26.json

SAFE RECOVERY STEPS
1. Open the app over your local HTTPS server.
2. Open Backup & Restore (gear icon).
3. Choose Import Save.
4. Select daybreak-quest-save-2026-07-26.json.
5. Daybreak backs up the current local save before importing.
6. Confirm the old character/progress is present, then refresh the page.

SAVE SAFETY
- Existing localStorage save key remains: legends-save
- Normal rolling backup remains: legends-save-backup
- A pre-import copy is also kept as: legends-save-before-import
- Save schema is additive. Missing newer fields receive defaults.
- Unknown top-level fields are preserved.
- Arrays/scalar values from the imported save are preserved rather than reset.

The supplied July 26 save is included as a separate file and is NOT automatically installed or written into localStorage.


SLEEP TRACKER
-------------
The Home screen now has a Sleep Tracker.
1. Tap "Start Sleep Tracking" immediately before going to sleep.
2. Tap "I'm Awake — Stop Tracker" after waking.
3. The app calculates elapsed sleep duration from the two timestamps.
4. Sleep sessions are stored in the save and survive refreshes, imports, and exports.
5. Sleep crossing midnight is handled correctly because actual timestamps are stored.
6. Insights includes completed-session count and average sleep for the last 30 days.

Older saves without sleepTracker are migrated automatically; no existing progress is reset.

NUTRITION / SUPPLEMENTS UPDATE
------------------------------
- Added Vitamin D3 as a separate daily reminder: 1,000 IU.
- Added the eight requested Tavern menu items with their requested serving sizes.
- New menu items carry saturated fat, unsaturated fat, and fiber reference fields in addition to the existing macro fields.
- Existing saves and existing food logs remain compatible; the new fields are additive.


MEDITERRANEAN SHIFT
-------------------
The current tracker is set to Mediterranean mode with a practical 150 g/day carbohydrate target for the transition from LCHF. This is not a canonical Mediterranean diet limit; Mediterranean eating does not have a fixed carbohydrate ceiling. The app therefore treats 150 g as a user-configurable tracking target, with higher presets available.

SOEL CARE RECORDS
-----------------
Existing saved records found in the project: deworming last given 2026-06-08 at a 2-month interval (next due 2026-08-08); spot-on last given 2026-07-04 at a 3-month interval (next due 2026-10-04). The current date is 2026-09-04, so the deworming reminder is overdue while the spot-on is not yet due. These are reminders based on the existing record, not veterinary advice.
