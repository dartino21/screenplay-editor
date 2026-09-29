# Screenplay software pain points → minimal browser editor

Research for a **simple browser-only** screenplay editor (no accounts, no collaboration).  
Date: 2026-09-27.

**Constraint filter:** Features that need cloud, multiplayer, production departments, or heavy story-development UI are demoted to anti-patterns even if popular in full suites.

**Access note:** Reddit HTML/API was blocked from this environment; Reddit evidence is via Google result titles/threads, DuckDuckGo link discovery, and product/GitHub/primary sources. Cite thread URLs where known.

---

## What users repeatedly want (cross-product)

| Theme | Who markets / requests it | Why it hurts when missing |
|---|---|---|
| Tab/Enter element flow | Fade In KB & features; KIT/STARC; Final Draft muscle memory | Breaks typing rhythm; forces menus |
| Autocomplete (names, locations, INT/EXT, DAY/NIGHT) | [Fade In features](https://www.fadeinpro.com/page.pl?content=features) | Re-typing sluglines kills flow |
| Distraction-free / focus UI | [Highland Pro](https://quoteunquoteapps.com/highland-2/); [Arc Studio](https://arcstudiopro.com/) | Bloat is a top reason people leave FD |
| Accurate page count / same pages everywhere | Scriptnotes Ep. 129 (FD CEO interview) | Pros say “turn to page 16” |
| Scene navigator | Highland, Fade In, KIT | Long scripts are unmanageable otherwise |
| Portable export (PDF + Fountain/FDX) | [Fountain](https://fountain.io/); Arc Studio FAQ | Recipients care about PDF, not the app |
| Local reliability / no lost drafts | Reddit: FD Go losing versions; Arc draft history marketing | Trust > features |
| Global rename character | [STARC #121](https://github.com/story-apps/starc/issues/121); Fade In smart rename | Leaving the page to rename breaks flow |
| Soft line break in action | [KIT #967](https://github.com/dimkanovikov/KITScenarist/issues/967) (cites Fade In) | Stylistic weight of short action lines |
| Dated UI / paid upgrades / mobile nickel-and-diming | Reddit “hate Final Draft”; Scriptnotes Ep. 129; comparison articles | Fuels demand for simpler apps |

---

## Prioritized UX / automation improvements

Difficulty is for a **contenteditable/textarea element-model browser editor** like this project (already has Tab/Enter, autocomplete, pagination, autocaps).

### P0 — Writing flow (do these first)

#### 1. Bulletproof Tab / Enter element cycling (+ optional Cmd+Enter for next speaker)
- **Why:** Industry muscle memory; KIT/STARC market “just two buttons”; Fade In documents Enter/Tab behavior as core UX.
- **Flow help:** Hands never leave keyboard; format is invisible.
- **Difficulty:** Easy (refine existing keymap; document + match FD/Fade In defaults).
- **Sources:** [Fade In features](https://www.fadeinpro.com/page.pl?content=features); [kitscenarist.ru](https://kitscenarist.ru/); [starc.app](https://starc.app/).

#### 2. As-you-type autocomplete: characters, locations, INT/EXT/EST, times, (V.O.)/(O.S.)/(CONT'D)
- **Why:** Fade In’s headline productivity claim: “Spend less time typing and more time writing.”
- **Flow help:** Slugline + cue completion in &lt;1s; fewer typos in recurring names.
- **Difficulty:** Easy (extend existing autocomplete; rank by recency/frequency).
- **Sources:** [Fade In features — Autocomplete typing](https://www.fadeinpro.com/page.pl?content=features).

#### 3. Auto-uppercase scene headings & character cues
- **Why:** Expected by pros; open-source Fountain editors still get this as a top request.
- **Flow help:** Type naturally; format snaps on commit/Enter.
- **Difficulty:** Easy (already partially present; ensure on blur/Enter, not mid-word annoyingly).
- **Sources:** [obsidian-fountain-editor #50](https://github.com/chuangcaleb/obsidian-fountain-editor/issues/50).

#### 4. Silent local autosave + restore (no account)
- **Why:** Users abandon tools that lose work (Reddit: Final Draft Go losing versions; Arc markets draft history).
- **Flow help:** Write without “did I save?” anxiety; optional local version snapshots.
- **Difficulty:** Easy (localStorage/IndexedDB + “Restore last session”).
- **Sources:** Google-indexed Reddit: [Final Draft Go keeps losing versions](https://www.reddit.com/r/Screenwriting/comments/) (search title); [Arc Studio — Safe & Sound / draft history](https://arcstudiopro.com/).

#### 5. Live page count that matches PDF (good enough for “≈1 min/page”)
- **Why:** FD’s historic selling point (Scriptnotes Ep. 129: same page count across devices). Page count is how writers measure progress and structure.
- **Flow help:** Status bar pages ≈ runtime; less export-to-check.
- **Difficulty:** Medium (tighten pagination; freeze metrics on print CSS; test 110-page script).
- **Sources:** [Scriptnotes Ep. 129 transcript](https://johnaugust.com/2014/scriptnotes-ep-129-the-one-with-the-guys-from-final-draft-transcript); Arc Studio FAQ (“only industry standard is the PDF”).

#### 6. One-click PDF that looks like a real screenplay
- **Why:** Agents/producers judge the PDF, not the editor ([Arc Studio FAQ](https://arcstudiopro.com/)).
- **Flow help:** Finish → export without reformatting in Word.
- **Difficulty:** Medium (print CSS + Courier/Courier Prime, margins, page numbers, title page).
- **Sources:** [Arc Studio vs Final Draft](https://www.arcstudiopro.com/arc-studio-vs-final-draft); [Courier Prime / Highland ecosystem](https://quoteunquoteapps.com/highland-2/).

### P1 — Navigation & friction killers

#### 7. Scene navigator (slugline list, click-to-jump, optional drag reorder)
- **Why:** Called out as essential in prior project research; every serious app ships it (Highland Navigator, Fade In Navigator, KIT).
- **Flow help:** Jump acts/scenes without scrolling; see structure at a glance.
- **Difficulty:** Easy–Medium (list from scene_heading elements; Medium if drag-reorder mutates doc).
- **Sources:** [Highland Pro — Navigator](https://quoteunquoteapps.com/highland-2/); [Fade In — Organization and navigation](https://www.fadeinpro.com/page.pl?content=features).

#### 8. Focus / distraction-free mode (hide toolbar, keep page + caret)
- **Why:** Highland’s brand (“cleaner, purer”); Arc “Eliminate all distractions”; writers leave FD for less chrome ([Short Film Central comparison](https://www.shortfilmcentral.com/final-draft-vs-arc-studio-pro-for-screenwriters/) notes dated FD UI).
- **Flow help:** Immersion; fewer accidental clicks.
- **Difficulty:** Easy (CSS class + shortcut; STARC users request panel hide shortcuts).
- **Sources:** [Highland Pro](https://quoteunquoteapps.com/highland-2/); [STARC #132](https://github.com/story-apps/starc/issues/132); [No Film School — best software](https://nofilmschool.com/best-screenwriting-software) (ease of use = as important as features).

#### 9. Fountain import / export (+ optional FDX later)
- **Why:** Fountain exists so scripts aren’t locked in proprietary formats; Highland/Fade In/Arc all support it.
- **Flow help:** Backup, diff in git, open in any text editor, migrate later.
- **Difficulty:** Medium (export Easy; robust import Medium).
- **Sources:** [fountain.io](https://fountain.io/); [John August on Fountain](https://johnaugust.com/2012/fountain).

#### 10. Find (and replace) across the script
- **Why:** Baseline editor expectation; STARC requests search position/count ([#143](https://github.com/story-apps/starc/issues/143)).
- **Flow help:** Fix recurring phrases / names without hunting.
- **Difficulty:** Easy.

#### 11. Shift+Enter = soft new line inside same element (no blank-line skip)
- **Why:** Explicit Fade In parity request from KIT users for stylistic action breaks.
- **Flow help:** Punchy single-line action without creating new beats.
- **Difficulty:** Easy.
- **Sources:** [KIT Scenarist #967](https://github.com/dimkanovikov/KITScenarist/issues/967).

#### 12. Rename character everywhere from the cue line
- **Why:** Leaving the script to a cast panel is a common complaint.
- **Flow help:** One action fixes all cues + keeps autocomplete in sync.
- **Difficulty:** Medium (string-match cues carefully; preserve extensions).
- **Sources:** [STARC #121](https://github.com/story-apps/starc/issues/121); Fade In “change character names smartly.”

#### 13. Minimal title page (title, writer, contact) → PDF first pages
- **Why:** Highland Title Page Builder; KIT project materials; competitions expect it.
- **Flow help:** Spec is submission-ready without Word.
- **Difficulty:** Easy–Medium.
- **Sources:** [Highland Pro](https://quoteunquoteapps.com/highland-2/); [kitscenarist.ru](https://kitscenarist.ru/).

### P2 — Polish (only after P0–P1)

#### 14. Quiet stats: pages, scenes, words (± dialogue lines per character)
- **Why:** KIT stats / Highland goals; writers pace by pages.
- **Flow help:** Progress without opening reports.
- **Difficulty:** Easy (basic); Medium (per-character dialogue).
- **Sources:** [kitscenarist.ru — statistics](https://kitscenarist.ru/).

#### 15. Dark theme + optional typewriter scrolling
- **Why:** Comfort features marketed by Highland/STARC; not core but cheap delight.
- **Flow help:** Longer sessions, less eye fatigue.
- **Difficulty:** Easy.
- **Sources:** [Highland Pro](https://quoteunquoteapps.com/highland-2/); [starc.app](https://starc.app/).

#### 16. Paste plain → adopt current element format
- **Why:** Pasting from Notes/Docs wrecks formatting (STARC #148).
- **Flow help:** Research dumps become action/dialogue without cleanup.
- **Difficulty:** Medium.
- **Sources:** [STARC #148](https://github.com/story-apps/starc/issues/148).

#### 17. Dual dialogue (side-by-side)
- **Why:** Requested often in KIT; useful but rare on the page.
- **Flow help:** Overlapping dialogue scenes.
- **Difficulty:** Medium (layout + pagination edge cases).
- **Sources:** [KIT #971](https://github.com/dimkanovikov/KITScenarist/issues/971).

#### 18. Discoverable shortcuts cheat sheet (press `?`)
- **Why:** FD users complain features exist but are undiscoverable (Scriptnotes Ep. 129: “misinformation” = poor education).
- **Flow help:** Learn Tab/Enter/focus once; then hide help.
- **Difficulty:** Easy.
- **Sources:** [Scriptnotes Ep. 129](https://johnaugust.com/2014/scriptnotes-ep-129-the-one-with-the-guys-from-final-draft-transcript).

---

## Anti-patterns (do **not** add to a minimal editor)

These sell full suites and clutter a simple local editor:

1. **Accounts / cloud sync / multi-device** — Arc/Celtx/WriterDuet core; out of scope; use local files instead.
2. **Real-time collaboration, comments, script chat** — Arc’s headline; kills “simple.”
3. **AI writing assistants** — STARC/Arc Assistant; controversial on r/Screenwriting; pollutes flow for a focused editor.
4. **Beat boards / index cards / Story Map / Save the Cat templates** — Arc/FD Beat Board; separate product surface.
5. **Series bibles, season outlines, multi-episode projects** — TV room tools (Arc, STARC TV).
6. **Production: revision colors, locked pages, MORE/CONT’D production marks, breakdowns, watermarked batch PDFs** — Fade In/FD pro tools; Fountain intentionally excludes these for creative writing ([fountain.io](https://fountain.io/)).
7. **Pre-production studio (shot lists, schedules, budgets)** — Celtx’s pivot; not screenplay writing.
8. **Mind maps, character relationship graphs, photo cast boards** — KIT/STARC research modules.
9. **Dense icon toolbars / permanent side dashboards** — what Highland/Arc users flee.
10. **Template zoo** (podcasts, comics, musicals) — FD strength; dilutes a simple film/TV editor.
11. **Subscription gates mid-writing** — Celtx backlash pattern; Reddit price hate toward FD upgrades.
12. **Mandatory (CONT'D) / MORE for production** — optional later; annoying in first-draft mode ([FD KB on removing continueds](https://kb.finaldraft.com/hc/en-us/articles/15575341065236-How-can-I-remove-Character-continueds-from-your-script) implies writers often want them off).

---

## Product-by-product snapshot

| Product | Loved for | Hated / left for | Relevance to minimal editor |
|---|---|---|---|
| **Final Draft** | Industry FDX, page fidelity, production | Dated UI, upgrade pricing, mobile extras, file sprawl | Copy formatting fidelity + Tab flow; skip production |
| **Fade In** | Autocomplete, speed, value, open format | Less “industry default” | Copy autocomplete + soft breaks + navigator |
| **Highland** | Distraction-free, Fountain, speed | Mac-centric historically | Copy focus mode + Fountain + calm UI |
| **WriterDuet** | Collab | Lag/glitch reputation in collab contexts | Skip collab entirely |
| **Arc Studio** | Modern UX, outline, collab, free tier | Subscription; cloud-first | Steal focus + draft history *locally*; skip room tools |
| **KIT / STARC** | Tab/Enter, RU localization, cards, free | Complexity creep in STARC | Steal element flow + stats; skip cards/AI |
| **Celtx** | Education / production suite | Subscription after free era | Avoid studio feature creep |

Reddit threads (titles discoverable; bodies often blocked here):
- https://www.reddit.com/r/Screenwriting/ — search: “sick of Final Draft”, “waste of money”, “hate Final Draft”, “building a Screenwriting app”
- https://www.reddit.com/r/Screenwriting/comments/1420xf8/arc_studio_pro_vs_final_draft_for_writing/
- https://www.reddit.com/r/Screenwriting/comments/15nkdwc/should_i_get_final_draft_or_arc_studio_pro/
- https://www.reddit.com/r/Screenwriting/comments/13ezr99/is_final_draft_worth_it/

---

## Suggested build order for *this* repo

1. Harden Tab/Enter + autocomplete ranking + autocaps commit behavior  
2. Autosave/restore + focus mode + `?` shortcuts  
3. Navigator + find/replace + Shift+Enter  
4. PDF export parity with on-screen page count  
5. Fountain import/export  
6. Character rename + title page  
7. Only then: dual dialogue / dark mode polish  

Skip everything in the anti-patterns list unless the product goal changes.
