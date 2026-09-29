# Distraction-Free Writing UX → Screenplay Editors

Research brief for a **minimalist classic screenplay web app** (Russian UI, Courier pages, US/RU format toggle).  
Sources: official product pages and maker docs, Nielsen Norman Group, WCAG 2.2, Bringhurst via *The Elements of Typographic Style Applied to the Web*, Apple keyboard shortcut conventions.  
Fetched 2026-09-27. Prefer primary URLs cited inline.

**Canonical location** for writing-tools UX research in this repo. Project-level synthesis: [`docs/RESEARCH.md`](../docs/RESEARCH.md).

---

## Product examples (explicit)

| Product | Role for this brief | Primary URL |
|--------|---------------------|-------------|
| **iA Writer** | Focus Mode (sentence/paragraph/typewriter), Markdown-first progressive formatting, monospace/duospace writing typography, stats in chrome | https://ia.net/writer · https://ia.net/writer/support/editor/focus-mode · https://ia.net/writer/how-to/write-with-focus · https://ia.net/topics/in-search-of-the-perfect-writing-font |
| **Ulysses** | “Ultimate writing app” marketing of calm editor; library + sheets mental model; Helpjuice knowledge base | https://ulysses.app/ · https://help.ulysses.app/ |
| **Scrivener** | Binder (ring-binder metaphor), Corkboard, Outliner, full-screen **Composition Mode**, built-in scriptwriting formatting | https://www.literatureandlatte.com/scrivener/overview · https://www.literatureandlatte.com/blog/composition-mode |
| **Highland Pro** | Screenwriter-built minimalism; Navigator of scenes/synopses; typewriter scrolling + sprints; Courier Prime; Goals (page/word) | https://quoteunquoteapps.com/highland-pro/ |
| **Bear** | Markdown notes with Focus Mode / hideaway chrome pattern (product site) | https://bear.app/ |
| **FocusWriter** | Hide-away UI on mouse-to-edge; themes; live stats; daily goals; auto-restore cursor position | https://gottcode.org/focuswriter/ |

---

## 1. Distraction-free / focus modes

### Key findings

- **iA Writer Focus Mode** dims everything except the active **sentence** or **paragraph**; a separate **Typewriter** mode keeps the caret vertically centered without dimming. Enabled via menu, **⌘D**, or title-bar control. Maker guidance: best in fullscreen + try both light/dark; **turn Focus Mode off for editing/selection** because vertical centering can cause screen jump. ([Focus Mode support](https://ia.net/writer/support/editor/focus-mode), [Write With Focus](https://ia.net/writer/how-to/write-with-focus), [product page](https://ia.net/writer))
- Product thesis: *“No buttons, no popups, no title bar… Worry about formatting later.”* Focus is framed as protecting **production** (writing this sentence now), not all-phase editing. ([ia.net/writer](https://ia.net/writer))
- **FocusWriter** uses a **hide-away interface**: chrome appears only when the pointer hits screen edges—familiar when needed, absent when writing. Also restores last document + caret on open. ([gottcode.org/focuswriter](https://gottcode.org/focuswriter/))
- **Scrivener Composition Mode** is a customizable full-screen writing space (background, paper width)—distraction reduction via **viewport takeover**, not sentence dimming. ([Scrivener overview](https://www.literatureandlatte.com/scrivener/overview))
- **Highland Pro** pairs fullscreen, dark theme, **typewriter scrolling**, and **writing sprints** as one “minimalist digital writing experience.” ([Highland Pro](https://quoteunquoteapps.com/highland-pro/))
- NN/g **Aesthetic and Minimalist Design** (Heuristic 8) and **Minimize Cognitive Load**: remove irrelevant chrome so working memory stays on the task—not decorative complexity. ([10 Heuristics](https://www.nngroup.com/articles/ten-usability-heuristics/), [4 principles / cognitive load](https://www.nngroup.com/articles/4-principles-reduce-cognitive-load/))

### Screenplay implication

Focus mode should optimize **drafting scenes/dialogue**, not formatting polish or multi-select edits. Offer typed modes (e.g. dim-all-but-current-element vs typewriter centering) and a one-key exit.

---

## 2. Progressive disclosure of formatting

### Key findings

- NN/g (Jakob Nielsen, 2006): show **few core options first**; put advanced/rarely used features behind a clear secondary path with good **information scent**. Improves learnability, efficiency, error rate. Avoid >2 disclosure levels. Distinguish **progressive** (optional depth) from **staged** (wizard steps). ([Progressive Disclosure](https://www.nngroup.com/articles/progressive-disclosure/))
- **iA Writer**: write in plain text/Markdown; **Preview** for styled output—*write first, format later*. Formatting is deferred by design. ([ia.net/writer](https://ia.net/writer))
- **Scrivener** for scripts: “familiar scriptwriting features **deal with the formatting**, leaving you free to focus on the action.” ([overview](https://www.literatureandlatte.com/scrivener/overview))
- **Highland**: Fountain-style / auto-format culture (product: clean editor + industry title page)—formatting as system responsibility. ([Highland Pro](https://quoteunquoteapps.com/highland-pro/))

### Screenplay implication

Auto-advance element types (slugline → action → character → dialogue) and US/RU format presets belong in the **background**. Expose margins, dual dialogue, revision colors, etc. only on demand (palette, overflow menu)—not as permanent toolbar noise.

---

## 3. Spatial memory: page metaphor vs continuous scroll

### Key findings

- NN/g: spatial memory is **fuzzy** (“neighborhood,” not street address); needs **stable positions**, **boundaries/landmarks**, and often **overviews** (thumbnails, minimaps) when content overflows the viewport. Avoid adaptive UIs that rearrange chrome. Broad/shallow hierarchies beat deep ones for relocation. ([Spatial Memory](https://www.nngroup.com/articles/spatial-memory/)) Citing HCI: Alexander et al. (CHI ’09) readwear; Bederson & Boltman zoom animation; Scarr et al. on spatial memory in UIs.
- **Page metaphor** (fixed page breaks, page thumbnails): strong landmarks for “I’m on page 47 / mid-Act Two”—critical for screenplays where **page ≈ screen minute** in industry mental models.
- **Continuous scroll**: better flow for typing (iA/Ulysses/Bear default); weaker absolute position memory unless you add landmarks (scene headers sticky, navigator highlight, scroll markers).
- Scrivener’s **Binder + Corkboard + Outliner** externalize structure as spatial objects (cards, outline rows)—spatial memory of *structure*, not only of pixels. ([overview](https://www.literatureandlatte.com/scrivener/overview))
- Highland **Navigator**: “road map of sections, scenes, synopses and notes.” ([Highland Pro](https://quoteunquoteapps.com/highland-pro/))

### Screenplay implication

Prefer **Courier pages with visible page breaks** as the primary canvas (classic paper metaphor), plus an optional **continuous draft scroll** for flow sessions. Always mirror structure in a **scene navigator** so spatial memory of plot ≠ only scrollbar position.

---

## 4. Keyboard-first workflows + discoverability without clutter

### Key findings

- NN/g **UI Accelerators**: shortcuts must be **alternate** paths—novices never need them; experts escape the efficiency plateau. Discover via **menu labels with right-aligned shortcuts**, tooltips, cheat sheets—not first-run dumps. Don’t override platform conventions (copy/paste/select all). ([UI Accelerators](https://www.nngroup.com/articles/ui-accelerators/)) Aligns with Heuristic 7 *Flexibility and Efficiency of Use*. ([10 Heuristics](https://www.nngroup.com/articles/ten-usability-heuristics/))
- NN/g **Recognition rather than Recall**: menus beat memorizing command names; visible element-type state beats remembering “what Tab does next.” ([Recognition and Recall](https://www.nngroup.com/articles/recognition-and-recall/))
- **Apple** documents system and text-editing shortcuts; menus traditionally show glyph shortcuts next to commands—the industry pattern for discoverability. ([Mac keyboard shortcuts](https://support.apple.com/en-us/102650); HIG pages: [Keyboards](https://developer.apple.com/design/human-interface-guidelines/keyboards), [Menus](https://developer.apple.com/design/human-interface-guidelines/menus))
- iA: Focus Mode via **⌘D** *and* menu *and* title-bar—redundant accelerators. ([Focus Mode](https://ia.net/writer/support/editor/focus-mode))
- FocusWriter: chrome on edge hover—keyboard writing + mouse-reveal for rare controls. ([FocusWriter](https://gottcode.org/focuswriter/))

### Screenplay implication

Tab / Enter / shortcuts for element cycling are the product; discoverability via **subtle status of current element**, `?` shortcut sheet, and menu accelerators in Russian labels—not a permanent formatting ribbon.

---

## 5. Status / feedback (page count, scene count, element type)

### Key findings

- Heuristic 1 **Visibility of System Status**: keep users informed with timely feedback; status creates control and trust. ([Visibility of System Status](https://www.nngroup.com/articles/visibility-system-status/), [10 Heuristics](https://www.nngroup.com/articles/ten-usability-heuristics/))
- NN/g separates **indicators** (continuous state), **validations**, and **notifications**—prefer quiet indicators for ongoing writing metrics. ([Indicators, Validations, and Notifications](https://www.nngroup.com/articles/indicators-validations-notifications/))
- **iA Writer**: realtime word/character/reading-time stats; user can disable unneeded stats; with library hidden, stats sit at bottom. ([Write With Focus](https://ia.net/writer/how-to/write-with-focus))
- **Highland**: Goals for **page, word, or character** count; Navigator for scenes; sprints as temporal status. ([Highland Pro](https://quoteunquoteapps.com/highland-pro/))
- **FocusWriter**: on-the-fly statistics + daily goals. ([FocusWriter](https://gottcode.org/focuswriter/))

### Screenplay implication

Always-visible but unobtrusive: **current element type**, **page # / pages total**, **scene #**, format **US|RU**. Prefer a thin footer/status strip that dims in Focus Mode rather than toasts.

---

## 6. Typography for reading/writing (contrast, line length, paper metaphor)

### Key findings

- **Bringhurst via webtypography.net**: ideal measure ~**45–75 characters** (≈**66** ideal) for single-column serif; multi-column ~40–50. Leading should suit face + measure; unitless `line-height` (often ≥~1.3–1.5 on screen). ([2.1.2 Choose a comfortable measure](https://webtypography.net/2.1.2), [2.2.1 Leading](https://webtypography.net/2.2.1))
- **iA Writer typography essay**: monospace signals *work in progress* (honest draft), slows writing pace, improves discernability; proportional feels “almost published.” Duospace widens M/W slightly while keeping mono rhythm; Cyrillic noted as needing extra breathing room. ([In Search of the Perfect Writing Font](https://ia.net/topics/in-search-of-the-perfect-writing-font))
- Screenplay convention: **Courier** (or Courier Prime—Highland ecosystem) + fixed margins = **paper metaphor** that doubles as industry length estimation.
- **WCAG 2.2 SC 1.4.3 Contrast (Minimum)**: normal text ≥ **4.5:1**; large text ≥ **3:1**. ([Understanding 1.4.3](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)) Dimmed “inactive” focus-mode text still needs enough contrast if it remains readable content—or treat truly decorative dimming carefully for AT users.
- Related: **1.4.4 Resize Text**, **1.4.12 Text Spacing**, **1.4.10 Reflow**. ([Resize Text](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html), [Text Spacing](https://www.w3.org/WAI/WCAG22/Understanding/text-spacing.html), [Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html))

### Screenplay implication

Courier on cream/white “pages” with industry margins; don’t chase Bringhurst’s 66cpl for dialogue blocks—**format rules trump general web measure**, but keep **UI chrome** (Russian labels, navigator) within comfortable measure and WCAG contrast. Offer dark paper theme with verified ratios.

---

## 7. Scene outline / navigator pane patterns

### Key findings

- **Scrivener Binder**: ring-binder metaphor—outline always one click away; Corkboard cards = synopses; Outliner = denser metadata. Structure editing *is* manuscript editing. ([overview](https://www.literatureandlatte.com/scrivener/overview))
- **Highland Navigator**: scenes, synopses, notes as roadmap. ([Highland Pro](https://quoteunquoteapps.com/highland-pro/))
- NN/g spatial memory: document overviews + visit-wear landmarks help revisitation in long docs. ([Spatial Memory](https://www.nngroup.com/articles/spatial-memory/))
- Progressive disclosure: navigator is a **secondary surface**—hideable so writing canvas stays primary (iA library hide pattern). ([Progressive Disclosure](https://www.nngroup.com/articles/progressive-disclosure/), [iA how-to](https://ia.net/writer/how-to/write-with-focus))

### Screenplay implication

Collapsible left **Сцены** list driven by sluglines; click-to-jump; optional one-line synopsis; highlight current scene. Do not require Corkboard complexity for v1—Highland-style navigator is enough for a classic minimalist editor.

---

## 8. Empty states and onboarding for domain-specific software

### Key findings

- NN/g onboarding analysis: **skip onboarding when possible**; prefer usable UI + contextual tips over deck-of-cards tutorials (memory strain, unclear performance gains). Use onboarding when: required setup, personalization that enables the product, or **truly novel** interactions. Keep instructional content brief, skippable, one concept at a time. ([Mobile-App Onboarding](https://www.nngroup.com/articles/mobile-app-onboarding/))
- iA empty/start pattern: **new document already open**—start typing; first line becomes title; no filename ceremony. ([Write With Focus](https://ia.net/writer/how-to/write-with-focus))
- Domain-specific (screenplay): Tab-to-cycle elements and US vs RU formats *are* novel relative to Google Docs—warrant **one contextual coach mark** or first-slugline tip, not a 12-slide tour.
- Match real-world language (Heuristic 2): use screenwriter terms (ТИТР / INT./EXT., ремарка, etc.) in RU UI. ([10 Heuristics](https://www.nngroup.com/articles/ten-usability-heuristics/))

### Screenplay implication

Empty state = blank page with faint placeholder first slugline example + tiny hint “Tab — сменить тип элемента · ? — клавиши”. Format toggle (US/RU) once in settings or first-run optional choice, not a forced wizard.

---

## 9. Accessibility basics for writing apps

### Key findings

| Requirement | Source | Application |
|-------------|--------|-------------|
| Text contrast ≥ 4.5:1 (AA) | [WCAG 1.4.3](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html) | Page text, UI labels; careful with focus-mode dimming |
| Non-text contrast for UI components | [WCAG 1.4.11](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html) | Focus rings, page edges, toggle controls |
| Focus visible | [WCAG 2.4.7](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html) | Keyboard navigation of navigator, menus, format toggle |
| Full keyboard operability | [WCAG 2.1.1 Keyboard](https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html) | Element type, scenes, focus mode without mouse |
| Resize text / reflow / text spacing | [1.4.4](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html), [1.4.10](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html), [1.4.12](https://www.w3.org/WAI/WCAG22/Understanding/text-spacing.html) | Zoomable editor; don’t trap layout at fixed px only |
| Prefer recognition UIs | [NN/g Recognition vs Recall](https://www.nngroup.com/articles/recognition-and-recall/) | Visible element type > secret key chords only |
| Don’t rely on hover alone for shortcut discovery | [UI Accelerators](https://www.nngroup.com/articles/ui-accelerators/) | Also show in menus / `?` sheet |

iA customer quotes on the product page note dyslexia-friendly benefits of Markdown + syntax highlight—reminder that **calm typography and reduced chrome** can be an accessibility *aid*, but must not replace WCAG contrast/keyboard. ([ia.net/writer](https://ia.net/writer))

---

## Ranked UI/UX recommendations (1 = highest priority)

For a **minimalist classic screenplay web app**: Russian UI · Courier pages · US/RU format toggle.

1. **Page-as-paper canvas with Courier + industry margins**  
   Make the US letter / RU-format page the hero view (Highland/Final Draft mental model). Toggle US↔RU changes margins/element rules, not the whole product personality.  
   *Sources: Highland Pro; Bringhurst measure for chrome only; screenplay page≈minute convention.*

2. **Hide chrome by default; reveal on hover-edge / Esc / dedicated Focus**  
   Follow FocusWriter hide-away + iA fullscreen: writing surface primary; menus/status secondary.  
   *Sources: FocusWriter; iA Writer; Scrivener Composition Mode; NN/g minimalism / cognitive load.*

3. **Auto-format elements; progressive disclosure for rare formatting**  
   Tab/Enter cycles scene heading → action → character → parenthetical → dialogue → transition. Dual dialogue, title page, revision colors behind `…` or command palette.  
   *Sources: Progressive Disclosure (NN/g); Scrivener/Highland “formatting handled for you”; iA write-then-preview.*

4. **Focus Mode: dim non-current element + optional typewriter scroll**  
   Adapt iA’s sentence/paragraph modes to **screenplay elements** (dim all but current dialogue block). Offer typewriter centering for drafting; disable on multi-select edit. Shortcut + menu (⌘/Ctrl+D pattern).  
   *Sources: iA Focus Mode support; Highland typewriter scrolling.*

5. **Always-on quiet status: element · scene · page · US|RU**  
   Thin footer indicators (not modals). Optional goals (pages today) like Highland/FocusWriter.  
   *Sources: Heuristic 1; Indicators article; iA stats; Highland Goals.*

6. **Collapsible scene Navigator generated from sluglines**  
   Jump, current-scene highlight, optional synopsis—Scrivener Binder lite / Highland Navigator. Persist open/closed preference (spatial stability).  
   *Sources: Spatial Memory; Scrivener Binder; Highland Navigator.*

7. **Keyboard-first with menu/`?` discoverability (Russian labels)**  
   Never override copy/paste/find. Show accelerators in command menu; `?` cheat sheet for experts. Element type visible so users recognize state instead of recalling chords.  
   *Sources: NN/g UI Accelerators; Recognition vs Recall; Apple shortcut menus.*

8. **Empty state = write immediately + one domain tip**  
   Pre-create untitled script; placeholder slugline; single coach mark for Tab / format toggle. No multi-step marketing onboarding.  
   *Sources: NN/g Onboarding; iA “start writing.”*

9. **WCAG AA contrast + visible focus + full keyboard path**  
   Especially for dimmed Focus Mode text, page edge UI, and RU/US toggle. Support browser zoom.  
   *Sources: WCAG 1.4.3, 1.4.11, 2.4.7, 2.1.1, 1.4.4.*

10. **Stable layout landmarks (don’t rearrange controls)**  
    Keep navigator left, page center, status bottom—spatial memory for repeat writers. Prefer show/hide over adaptive relocation.  
    *Sources: NN/g Spatial Memory (avoid adaptive UIs).*

11. **Light paper + optional dark theme (user-tested)**  
    iA recommends trying both; Highland users praise dark + typewriter. Verify contrast in both.  
    *Sources: iA Focus Mode; Highland testimonials on product page.*

12. **Optional writing sprint timer (progressive disclosure)**  
    Highland-style focus sessions—hidden until requested so classic page metaphor stays calm.  
    *Sources: Highland Pro sprints; Progressive Disclosure.*

---

## Design synthesis (one paragraph)

Treat the screenplay editor as **digital paper** (Courier pages, US/RU geometry) wrapped in a **distraction-free shell** (hide chrome, focus dimming, typewriter scroll), with **structure externalized** in a hideable scene navigator and **formatting automated** so writers stay in language. Use **keyboard accelerators** as expert paths discovered via menus and a cheat sheet, and keep **page/scene/element status** continuously but quietly visible—satisfying industry spatial metaphors and NN/g heuristics without Scrivener’s full corkboard complexity.

---

## Source index (primary)

- https://ia.net/writer  
- https://ia.net/writer/support/editor/focus-mode  
- https://ia.net/writer/how-to/write-with-focus  
- https://ia.net/topics/in-search-of-the-perfect-writing-font  
- https://ulysses.app/  
- https://help.ulysses.app/  
- https://www.literatureandlatte.com/scrivener/overview  
- https://www.literatureandlatte.com/blog/composition-mode  
- https://quoteunquoteapps.com/highland-pro/  
- https://bear.app/  
- https://gottcode.org/focuswriter/  
- https://www.nngroup.com/articles/progressive-disclosure/  
- https://www.nngroup.com/articles/spatial-memory/  
- https://www.nngroup.com/articles/visibility-system-status/  
- https://www.nngroup.com/articles/indicators-validations-notifications/  
- https://www.nngroup.com/articles/ui-accelerators/  
- https://www.nngroup.com/articles/recognition-and-recall/  
- https://www.nngroup.com/articles/ten-usability-heuristics/  
- https://www.nngroup.com/articles/mobile-app-onboarding/  
- https://www.nngroup.com/articles/4-principles-reduce-cognitive-load/  
- https://www.nngroup.com/articles/aesthetic-usability-effect/  
- https://webtypography.net/2.1.2  
- https://webtypography.net/2.2.1  
- https://support.apple.com/en-us/102650  
- https://developer.apple.com/design/human-interface-guidelines/keyboards  
- https://developer.apple.com/design/human-interface-guidelines/menus  
- https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html  
- https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html  
- https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html  
- https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html  
- https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html  
- https://www.w3.org/WAI/WCAG22/Understanding/reflow.html  
- https://www.w3.org/WAI/WCAG22/Understanding/text-spacing.html  

Raw HTML/text captures: `research/raw/` and `research/raw/txt/`.
