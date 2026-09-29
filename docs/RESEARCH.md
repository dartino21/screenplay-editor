# UX / Format Research Notes

Findings synthesized for the screenplay editor revision (2026-09-27).

## Sources (primary / industry)

- [Final Draft — How to Format a Screenplay](https://www.finaldraft.com/learn/how-to-format-a-screenplay/)
- [Talentville — Page Break rules](https://www.talentville.com/snippet/screenplay-page-break-rules)
- [Fade In — Enter and Tab key behavior](https://www.fadeinpro.com/kb/content/3/156/en/enter-and-tab-key-behavior.html)
- [Final Draft KB — Mores and Continueds](https://kb.finaldraft.com/hc/en-us/articles/15575341065236-How-can-I-remove-Character-continueds-from-my-script)
- Russian: Smirnova / Kit fields (A4, no bold/italic, cm margins)
- Fountain: https://fountain.io/syntax/

## User demand (screenwriting software)

1. **Scene Navigator** — jump by slugline; FD users call this essential.
2. **Focus / distraction-free mode** — hide chrome while writing.
3. **Reliable Tab/Enter element flow** — predictable; optional dialogue→character for rapid exchanges.
4. **Automatic (CONT'D)** when same character speaks again after action.
5. **Correct page breaks** — no orphan character cues; dialogue breaks at sentence end; (MORE)/(CONT'D).
6. **Import/export plain Fountain** — portable, future-proof.
7. **Undo** — expected in any editor.
8. **Keyboard-first** — discoverable shortcuts without permanent clutter.

## Design theory (writing tools)

Full brief (9 topics + 12 ranked recs, primary citations):
[`research/distraction-free-screenplay-ux-brief.md`](../research/distraction-free-screenplay-ux-brief.md).

1. Progressive disclosure: title meta and help off by default.
2. Page metaphor kept; navigator is secondary spatial map.
3. Status always visible but quiet (pages ≈ minutes).
4. Focus mode = chrome out, paper remains.
5. Empty/first-run: one dismissible tip, not a tour.

## Anti-patterns (skip)

- Collaboration, notes layers, revision colors, AI chat panels.
- Dense icon toolbars, purple themes, dashboard chrome.
- Dual-dialogue / production locked pages in this pass.

## Follow-up (code audit)

Addressed findings from [Audit current editor codebase](754c26d0-f9b6-4abb-9b70-f6c7854f6f4a) and [Writing tools design theory](c216de60-7540-4652-a9bd-6757a607a0e1):

- No more duplicate editable textareas for split dialogue (move whole blocks; MORE/CONT'D without cloning ids)
- RU-aware INT/EXT templates (`ИНТ./ЭКСТ. — ДЕНЬ`), title «Автор», format-aware autocomplete times
- Lowercase name + Enter → character (auto-caps)
- Debounced page reflow while typing
- Quiet character extensions (only after space/`(`)
- `clearDocument` also clears format key
- `:focus-visible` outlines for a11y


