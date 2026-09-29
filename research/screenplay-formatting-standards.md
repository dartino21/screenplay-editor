# Professional Screenplay Formatting Standards

**Scope:** Hollywood (US Letter / Final Draft–compatible) and Russian (A4 / Olga Smirnova / KIT Scenarist) standards for a Courier 12pt web editor.

**Primary machine-readable sources used for exact numbers:**
- KIT Scenarist Core templates (`.kitss`): [final_draft_letter.kitss](https://github.com/dimkanovikov/KITScenaristCore/blob/master/Resources/Templates/final_draft_letter.kitss), [final_draft_a4.kitss](https://github.com/dimkanovikov/KITScenaristCore/blob/master/Resources/Templates/final_draft_a4.kitss), [russian.kitss](https://github.com/dimkanovikov/KITScenaristCore/blob/master/Resources/Templates/russian.kitss)
- KIT page-break / MORE–CONT'D engine: [ScriptTextCorrector.cpp](https://github.com/dimkanovikov/KITScenaristCore/blob/master/BusinessLayer/ScenarioDocument/ScriptTextCorrector.cpp)
- Olga Smirnova (Russian contest / industry Word rules): [screenwriter.ru — Формат разметки сценария](https://screenwriter.ru/info/format/)
- Classic Hollywood element table (Writers Store / industry primer): [How to Write a Screenplay](https://www.writersstore.com/how-to-write-a-screenplay-a-guide-to-scriptwriting/)
- Fountain syntax (element grammar for parsers): [fountain.io/syntax](https://fountain.io/syntax/)
- Parenthetical craft guidance: [John August — Using parentheticals](https://johnaugust.com/2003/using-parentheticals)

**Measurement convention in this doc**
- **Page margins** = distance from physical page edge to text area.
- **Element indents** = additional left/right inset *inside* the text area (same model as Word paragraph indent and Kit `left_margin` / `right_margin` in mm).
- Courier 12pt ≈ **10 characters per inch** horizontally; ≈ **6 lines per inch** vertically (single spacing). That is why Letter scripts target ~55 lines/page and ~1 page ≈ 1 minute.

---

## 1. Exact margins and indents

### 1.1 Hollywood / US Letter (classic industry table)

Source: Writers Store element table (industry-standard teaching table mirrored by Final Draft defaults).

| Setting | Value |
|---|---|
| Paper | US Letter **8.5″ × 11″** |
| Font | **Courier 12pt** (Courier Prime acceptable modern substitute) |
| Page left | **1.5″** (binding gutter) |
| Page top / bottom / right | **1.0″** |
| Text area width | **6.0″** |
| Page numbers | Top-right, **~0.5″** from top, flush to right margin; **page 1 unnumbered** |
| Spacing | Single-spaced throughout |

| Element | Left indent (from text area) | Right indent | Width | Notes |
|---|---:|---:|---:|---|
| Scene heading (slugline) | 0.0″ | 0.0″ | 6.0″ | ALL CAPS |
| Action | 0.0″ | 0.0″ | 6.0″ | Present tense; visible/audible only |
| Character | **2.0″** | 0.0″ | 4.0″ | ALL CAPS; extensions in `( )` |
| Parenthetical | **1.5″** | **2.0″** | **2.5″** | Lowercase inside `( )` |
| Dialogue | **1.0″** | **1.5″** | **3.5″** | |
| Transition | **4.0″** | 0.0″ | 2.0″ | ALL CAPS; often right-aligned in software |
| Shot | 0.0″ | 0.0″ | 6.0″ | Spec scripts: avoid |

**Absolute positions from page left edge (classic):**
- Character starts at **3.5″**
- Dialogue starts at **2.5″**, ends at **6.0″**
- Parenthetical starts at **3.0″**, ends at **5.5″**
- Transition starts at **5.5″**

### 1.2 KIT Scenarist — Final Draft Letter (software default)

Source: `final_draft_letter.kitss` (`page_margins` order = **left, top, right, bottom** in mm).

| Setting | mm | inches (approx) |
|---|---:|---:|
| Page left | 38 | 1.50″ |
| Page top | 24 | 0.94″ |
| Page right | 22 | 0.87″ |
| Page bottom | 24 | 0.94″ |

| Element | Left (mm / in) | Right (mm / in) | Case / align | Blank lines before (`top_space`) |
|---|---|---|---|---|
| Scene heading | 0 / 0 | 0 / 0 | UPPER / left | **2** |
| Action | 0 / 0 | 0 / 0 | sentence / left | 1 |
| Character | **51 / 2.01″** | 5.5 / 0.22″ | UPPER / left | 1 |
| Parenthetical | **36 / 1.42″** | **52 / 2.05″** | sentence / left; auto `( )` | 0 |
| Dialogue | **26 / 1.02″** | **40 / 1.57″** | sentence / left | 0 |
| Transition | 0 / 0 | 0 / 0 | UPPER / **right** | 1 |
| Lyrics | 26 / 1.02″ | 0 | italic in Kit | 0 |

**Note:** Kit’s Letter page top/right/bottom are slightly tighter than the classic 1″ teaching table; element indents still track the Writers Store table within ~0.1″. For a web MVP, prefer the **classic 1.5″ / 1″ / 1″ / 1″ page box + Writers Store element table** for US; treat Kit Letter as a compatible production reference.

### 1.3 KIT Scenarist — Final Draft A4 (international Hollywood layout)

Same element indents as Letter; page right becomes **17 mm** (A4 is taller/narrower in usable width tradeoff):

`page_margins="38,24,17,24"` → L 38 / T 24 / R 17 / B 24 mm.

### 1.4 Russian A4 — Olga Smirnova ≡ KIT `russian.kitss`

Sources: [screenwriter.ru/info/format](https://screenwriter.ru/info/format/) and `russian.kitss`.

| Setting | Smirnova | Kit `russian.kitss` |
|---|---|---|
| Paper | A4 | A4 |
| Font | Courier New 12 | Courier New 12 (`russian_courier_prime.kitss` swaps Courier Prime) |
| Bold / italic / underline | **NEVER** | bold/italic/underline all `false` (lyrics italic is Kit-only; Smirnova forbids) |
| Page top | 2.5 cm | 25 mm |
| Page bottom | 1.25 cm | 12.5 mm |
| Page left | 3.75 cm | 37.5 mm |
| Page right | 2.5 cm | 25 mm |

| Block (Russian name) | Left indent | Right indent |
|---|---:|---:|
| Время и место (scene heading) | 0 | 0 |
| Описание действия (action) | 0 | 0 |
| Имя героя (character) | **6.75 cm (67.5 mm)** | 0 |
| Ремарка (parenthetical) | **5.5 cm (55 mm)** | **4.5 cm (45 mm)** |
| Реплика (dialogue) | **3.75 cm (37.5 mm)** | **3.75 cm (37.5 mm)** |
| Transition | 0 | 0 (right-aligned) |

**Content-area width on A4:** `210 − 37.5 − 25 = 147.5 mm`.

**Dialogue column width:** `147.5 − 37.5 − 37.5 = 72.5 mm`.

**Important for this repo’s CSS:** Russian character/parenthetical/dialogue indents are measured **from the text area**, not from the page edge. So `margin-left` inside `.page` padding must be **67.5 / 55 / 37.5 mm**, not `67.5−37.5`, etc.

---

## 2. Page-break rules (orphans, MORE / CONT'D, widows)

Industry expectation (Final Draft–style) + explicit automation in KIT `ScriptTextCorrector`:

### 2.1 Never orphan a character cue

- A **Character** line must not sit alone at the bottom of a page with its dialogue on the next page.
- If Character would be last on the page → **move Character + following dialogue block(s)** to the next page.
- Same for Character + Parenthetical + Dialogue chains.

### 2.2 Scene heading orphans

- A **Scene Heading** must not be the last line on a page.
- If Scene Characters (cast list) follows, keep **Scene Heading + Scene Characters** together.
- If Character follows Scene Heading/Characters, keep the whole opener together when it would break.

### 2.3 Dialogue breaks → MORE / CONT'D

When dialogue *must* split across pages (long speech):

1. Leave **≥ 2 lines** of dialogue on the first page when splitting (Kit `minPlacedLines = 2`). Prefer break after sentence punctuation.
2. At bottom of page (dialogue column, often centered under dialogue): **`(MORE)`**
3. At top of next page: **`CHARACTER NAME (CONT'D)`** then continue dialogue (and parenthetical if the break was before a parenthetical mid-speech).

Kit strings (translatable): `"MORE"` → `(MORE)`; `"CONT'D"` → ` (CONT'D)` appended to character name.

### 2.4 Parenthetical on the break

- If break falls on a **Parenthetical** after dialogue → insert `(MORE)`, then next page `NAME (CONT'D)` + parenthetical + remaining dialogue.
- Never leave a parenthetical alone at bottom without its cue context.

### 2.5 Action / description widows

- Action may break mid-paragraph, but Kit tries to keep **≥ 2 lines** on each side and prefers breaks after punctuation.
- Avoid a single widow line of action at top of next page when a clean whole-block move is possible.

### 2.6 Russian contest note (Smirnova #3)

If a dialogue block does not fit, either:
- split into sense-units interleaved with action, **or**
- move the whole cue+speech to the next page while respecting the bottom margin rule.

Do **not** invent mid-word hyphenation (Smirnova #7 forbids hyphenation entirely).

---

## 3. Scene heading grammar

### 3.1 Hollywood sluglines

Canonical form:

```text
INT./EXT. LOCATION - TIME
```

| Token | Rules |
|---|---|
| `INT.` / `EXT.` / `EST.` | Interior / Exterior / Establishing. Period after abbreviation is standard. |
| `INT./EXT.` or `INT/EXT` or `I/E` | Vehicle / porch / doorway straddling in and out. Fountain accepts all. |
| Location | Specific, consistent naming (`APARTMENT` ≠ `JOHN'S APARTMENT` unless intentional). ALL CAPS. |
| Dash before time | Space-hyphen-space or spaced em equivalent; industry typewriter style uses ` - `. |
| Time | `DAY`, `NIGHT`, `MORNING`, `EVENING`, `LATER`, `MOMENTS LATER`, `CONTINUOUS`, `SAME TIME`, etc. |
| Continuity tags | `CONTINUOUS` = no time jump from prior scene; `LATER` = same place, later. |
| Special | `FLASHBACK`, `FLASHFORWARD`, `DREAM`, `MOS` (mit out sound / silent), `INTERCUT`, `SERIES OF SHOTS`, `MONTAGE` — usually after time or as own slug/subheader. |
| Scene numbers | Spec scripts: **omit**. Shooting scripts: numbers assigned in production. Fountain uses `#1A#` wrappers. |

Fountain scene-heading starters (case-insensitive): `INT`, `EXT`, `EST`, `INT./EXT`, `INT/EXT`, `I/E` — then `.` or space. Force any heading with leading `.`.

**Subheaders** (same location, new beat): short ALL CAPS lines (`THE KITCHEN`, `LATER`). Use sparingly (Writers Store).

### 3.2 Russian sluglines (Smirnova / Kit)

Kit parser model (`SceneHeadingParser`):

```text
[МЕСТО]. [ЛОКАЦИЯ] - [ВРЕМЯ], [СЦЕНАРНЫЙ ДЕНЬ]
```

| Part | Typical values |
|---|---|
| Место | **`ИНТ.`** (интерьер), **`НАТ.`** / **`ЭКСТ.`** (натура / экстерьер). Smirnova #9 allows spaces or dashes between parts; no other punctuation. |
| Локация | Place name |
| Время | `ДЕНЬ`, `НОЧЬ`, etc. |
| Сценарный день | Optional after comma |

Smirnova #9: between `ИНТ.` / `НАТ.` / place / time use **spaces or dashes only**.

Smirnova #10: scene headings and character names in **CAPITALS**; everything else sentence case; **no colon after character name**; dialogue **not** in quotes.

---

## 4. Character extensions

Placed after the cue, same line, in parentheses. ALL CAPS in US; Russian uses equivalent abbreviations or full parenthetical state (Kit uppercases `state()`).

| Extension | Meaning | When |
|---|---|---|
| **(V.O.)** | Voice-over | Narration / thoughts / letter read; speaker not visually producing the sound in-scene as on-camera dialogue |
| **(O.S.)** / **(O.C.)** | Off-screen / off-camera | Character in scene world but not in frame |
| **(CONT'D)** | Continued | Same character speaks again after interrupting action **or** after a page break (auto) |
| **(INTO PHONE)** etc. | Device / filter | Only when clarity requires |

**Rules**
- Prefer **one** extension; don’t stack noise.
- Contiguous speeches by same character with only a parenthetical between → usually **no** CONT'D.
- After an **action line** interrupting the same speaker → CONT'D is conventional (Kit auto-adds CONT'D when the same name reappears without a new scene).
- Never put V.O./O.S. in the parenthetical *under* the name; they belong on the cue line.

Fountain: extensions may be mixed case in source; formatted output typically uppercases.

---

## 5. Parenthetical rules

Sources: Writers Store; John August (2003).

**OK when**
- Ambiguity of delivery that dialogue alone can’t carry (`(dry)`, `(to May)`).
- Brief simultaneous action essential to the line (`(handing him the gun)`).
- Language / translation note (`(in Russian; subtitled)`).
- Beat / pause that changes meaning (`(beat)`, `(then)`).

**Overused when**
- Directing every emotion (`(angrily)` during an obvious fight).
- Acting direction the director/actor owns.
- **≥ ~3 parentheticals per page** (August’s rule of thumb → rethink dialogue).
- Long prose inside `( )` — move to action instead.
- Redundant stage business already clear from action.

**Format**
- Lowercase (US); Smirnova: lowercase inside parentheses.
- Keep short; wrap within parenthetical column width.
- Never leave a parenthetical as the only content under a character without dialogue (except rare production notes).

---

## 6. Transitions: spec vs shooting

| Transition | Spec script | Shooting script |
|---|---|---|
| `FADE IN:` | Optional at start (classic); many modern specs omit | Common |
| `FADE OUT.` / `FADE TO BLACK.` | End only, sparingly | Yes |
| `CUT TO:` | **Avoid** as default (every new slug already implies a cut) | Used when editorial intent matters |
| `DISSOLVE TO:` | OK if time/place soft transition is story-critical | Yes |
| `SMASH CUT:` / `MATCH CUT:` | Rare, only if the cut *is* the joke/reveal | Yes |
| `INTERCUT` | As slug/subheader | Yes |
| Camera shots (`ANGLE ON`, `POV`, `PAN TO`) | **Spec: avoid** | Production adds |

Writers Store: transitions and shots belong mainly to **shooting scripts**; stuffing them into a **spec** reads amateur.

Fountain: lines ending in `TO:` (uppercase, blank lines around) are transitions; force with leading `>`.

---

## 7. Title page conventions

### US / Fountain

From Fountain title-page keys and Writers Store:

- Courier 12; **no graphics**, no cover art on the brad-bound script.
- Centered vertically-ish: **TITLE** (often underlined or bold in Fountain → underline preferred over flashy styling), then `Written by`, then author name.
- Lower left (or right): contact / agent / draft date.
- WGA registration / copyright optional; don’t over-brand.
- Blank front/back card stock; **two brads** (holes 1 and 3 only).

Fountain keys: `Title`, `Credit`, `Author`/`Authors`, `Source`, `Draft date`, `Contact` — title/credit/author/source centered; contact + draft date lower left.

### Russian (Smirnova contest rules)

- Required title page.
- Contest-specific agent block rules aside: name + contacts typically lower area; no fancy decoration.
- Same Courier New 12, no bold/italic anywhere including title page emphasis beyond caps.

---

## 8. Dual dialogue

When two characters speak **simultaneously**:

- Two side-by-side dialogue columns (Final Draft Dual Dialogue).
- Fountain: second character cue ends with `^`.
- Each column keeps character / parenthetical / dialogue stacking rules.
- Use rarely; overuse destroys readability and breaks pagination assumptions — MVP may ship as “mark as dual” + side-by-side export later.

---

## 9. Common amateur mistakes

1. **Wrong font / size / margins** (Times, Arial, 11pt, equal 1″ all sides) — destroys page-a-minute timing.
2. **Bold, italic, underline, colors, emojis** in body (especially fatal in Russian Smirnova rules).
3. **Camera directions and `CUT TO:` after every scene** in a spec.
4. **Novelization** — thoughts, essayistic past tense, unfilmable emotion.
5. **Quotation marks around dialogue**; colons after character names (Russian #10 explicitly forbids).
6. **Inconsistent character naming** (`BOB` vs `ROBERT` vs `BOBBY`).
7. **Orphan character cues** at page bottoms; manual CONT'D clutter.
8. **Walls of dialogue** with zero action breaks (August: a page of only dialogue is poor form).
9. **Parenthetical spam** directing actors.
10. **Title-page graphics**, fancy binders, mid-hole brad.
11. **Scene numbers** on a speculative submission.
12. **Hyphenating words** to “pretty-fill” lines (Russian forbid).
13. **Tabs/spaces** to fake format instead of true styles (Smirnova #5–#8).
14. **INT/EXT grammar noise** — missing periods, lowercase sluglines, novel chapter titles as headings.

---

## 10. Russian-specific differences (summary)

| Topic | Hollywood US | Russian (Smirnova / Kit) |
|---|---|---|
| Paper | Letter 8.5×11 | **A4** |
| Units | Inches | **Centimeters / mm** |
| Page margins | 1.5″ / 1″ / 1″ / 1″ | **3.75 / 2.5 / 2.5 / 1.25 cm** |
| Character indent | ~2.0″ into text area | **6.75 cm** into text area |
| Dialogue indent | 1.0″ / 1.5″ R | **3.75 cm both sides** |
| Emphasis | Sparse underline/italic sometimes in US production | **No bold/italic/underline ever** (Smirnova) |
| Slug prefix | INT./EXT. | **ИНТ./НАТ.** (or ЭКСТ.) |
| Font default | Courier / Courier Prime | **Courier New** (Prime optional in Kit) |
| Quotes / colon after name | Don’t | **Forbidden** |
| Hyphenation | Avoid | **Forbidden** |

---

## 11. Editor enforcement checklist (MVP → polish)

Priority for a Courier 12pt web editor with US + RU presets.

### P0 — MVP must automate (layout truth)

| # | Rule | Enforce / Automate |
|---|---|---|
| 1 | Courier Prime or Courier New **12pt** only in script body | Enforce font-family/size; block user font UI |
| 2 | US Letter **8.5×11** vs RU **A4** page box | Preset switch |
| 3 | Page margins per preset (US classic **1.5/1/1/1″**; RU **37.5/25/25/12.5 mm**) | CSS + print `@page` |
| 4 | Element left/right indents per tables in §1 | Styles by `ElementType` |
| 5 | Single spacing; ~**55 lines/page** US | Pagination model |
| 6 | Scene heading + Character → **uppercase** on blur/export | Automate |
| 7 | Parentheticals wrapped in `( )`, lowercase content | Automate |
| 8 | No mid-word hyphenation | Enforce |
| 9 | Page 1 unnumbered; later pages top-right | Automate |
| 10 | Tab/Enter creates next logical element (slug→action→character→dialogue…) | Automate like Final Draft / Kit |

### P1 — MVP+ pagination / professional readout

| # | Rule | Enforce / Automate |
|---|---|---|
| 11 | Never leave **Character** alone at page bottom | Page-break engine |
| 12 | Never leave **Scene Heading** (± scene characters) alone at bottom | Page-break engine |
| 13 | Dialogue split → **`(MORE)`** + **`NAME (CONT'D)`** | Automate (non-editable deco lines) |
| 14 | Keep ≥2 dialogue lines before MORE when splitting | Automate |
| 15 | Auto **CONT'D** when same speaker resumes after action (optional toggle) | Automate |
| 16 | Dual-dialogue mark (even if layout is polish) | Data model ready |
| 17 | Title page fields (title, written by, author, contact, draft date) | Template |

### P2 — Grammar & lint (warnings, soft enforce)

| # | Rule | Enforce / Automate |
|---|---|---|
| 18 | Slug must start with INT/EXT/EST/I/E or ИНТ/НАТ/ЭКСТ | Lint + autocomplete |
| 19 | Spec mode: warn on `CUT TO:` / shot directions | Lint |
| 20 | Spec mode: hide/discourage scene numbers | Enforce in spec preset |
| 21 | Parenthetical density warn if ≥3/page | Lint |
| 22 | RU mode: **block bold/italic/underline** entirely | Enforce |
| 23 | RU mode: warn on `"` around dialogue and `:` after names | Lint |
| 24 | V.O./O.S./O.C./CONT'D autocomplete on character cue | Automate |
| 25 | Character name consistency (fuzzy match) | Lint |
| 26 | Present-tense action heuristic | Soft lint |
| 27 | Transitions right-aligned + UPPER | Style |

### P3 — Polish / production

| # | Rule | Enforce / Automate |
|---|---|---|
| 28 | Shooting-script mode: scene numbers, revision marks, locked pages | Feature flag |
| 29 | True dual-dialogue side-by-side layout + pagination | Layout |
| 30 | INTERCUT / MONTAGE helpers | Templates |
| 31 | Fountain import/export fidelity | IO |
| 32 | Kit `.kitss`-compatible export margins | IO |
| 33 | Act breaks / forced page breaks (TV) | Element |
| 34 | Binding/export PDF letterboxing matching brad margins | Print |

### Suggested default presets for *this* editor

| Preset | Page | Margins | Element indents | Emphasis |
|---|---|---|---|---|
| `us` | Letter | 1.5″ / 1″ / 1″ / 1″ | Writers Store table (§1.1) | Allow underline sparingly in action; no bold UI |
| `ru` | A4 | 37.5 / 25 / 25 / 12.5 mm | Kit/Smirnova (§1.4) | **Hard-disable** bold/italic/underline |

---

## 12. Source index (URLs)

1. https://www.writersstore.com/how-to-write-a-screenplay-a-guide-to-scriptwriting/ — US margins, element widths, spec vs shooting, title page, binding  
2. https://screenwriter.ru/info/format/ — Olga Smirnova Russian cm rules, no emphasis, contest commandments  
3. https://github.com/dimkanovikov/KITScenaristCore/blob/master/Resources/Templates/final_draft_letter.kitss — FD Letter mm template  
4. https://github.com/dimkanovikov/KITScenaristCore/blob/master/Resources/Templates/final_draft_a4.kitss — FD A4 mm template  
5. https://github.com/dimkanovikov/KITScenaristCore/blob/master/Resources/Templates/russian.kitss — Russian A4 template (= Smirnova)  
6. https://github.com/dimkanovikov/KITScenaristCore/blob/master/BusinessLayer/ScenarioDocument/ScriptTextCorrector.cpp — MORE/CONT'D + orphan page-break logic  
7. https://github.com/dimkanovikov/KITScenaristCore/blob/master/BusinessLayer/ScenarioDocument/ScenarioTextBlockParsers.cpp — Character extensions + Russian slug parse model  
8. https://fountain.io/syntax/ — Scene heading tokens, dual dialogue `^`, title page keys, transitions  
9. https://johnaugust.com/2003/using-parentheticals — Parenthetical craft / overuse threshold  
10. https://kitscenarist.ru/ — KIT Scenarist product (RU/EN templates above)  
11. Christopher Riley, *The Hollywood Standard* (book; authoritative prose guide often cited with Writers Store tables)  
12. https://johnaugust.com/qanda/formatting — Ongoing US craft Q&A index  

---

## 13. Implementation note vs current `src/styles/screenplay.css`

As of this research pass:

- **US** padding `1in 1in 1in 1.5in` matches classic Hollywood page margins.
- **US** character indent `2.2in` is slightly off classic **2.0in** (Writers Store) / Kit **2.01in** — prefer **2.0in**.
- **RU** page padding matches Smirnova/Kit.
- **RU** character/parenthetical/dialogue currently subtract page-left from Smirnova’s paragraph indents (`67.5−37.5`, etc.). That is incorrect if following Kit/Word semantics: use **67.5 / 55 / 37.5 mm** as `margin-left` inside the padded page, with dialogue width **72.5 mm**.

Raw downloads used for this memo live under `research/raw/` (Kit `.kitss`, corrector sources, Smirnova HTML extract).
