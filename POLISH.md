# Arboreum polish — `polish/core`

Audit of the deployed version (`main` @ 628e80a "vercel 4"), run in Chromium at 1366px, 1000px and 375px (touch).
Each fix is its own commit; ticked items were re-checked in the running app.

No IndexedDB shape change is planned (DB stays `arboreum` v2, same fields), so no migration is needed.
If that changes, a migration and a test against v2 data come with it.

## 1. Editor

- [x] **E1** Tree picker popover is clipped by the editor's `overflow: hidden`: at 1000px it runs 135px past the right edge, at 375px it's cut off on the left.
- [x] **E2** Cmd/Ctrl+S doesn't save (the browser's "Save page" opens instead).
- [x] **E3** No warning when leaving with unsaved changes (in-app links, reload, closing the tab).
- [x] **E4** No "saved" feedback: Save silently jumps to the reading view.
- [x] **E5** Editing a note whose tree sits at map x=0 or y=0 saves that coordinate as `null` (`mapX || null`), so the tree loses its place.
- [x] **E6** The rotating emoji message is a focusable button that does nothing.
- [x] **E7** Floating-menu quote button checked `blockQuote` instead of `blockquote`. Fixed, but invisible in practice: the floating menu only shows on an empty top-level line, never inside a quote.
- [x] **E8** Bubble and floating menu buttons never showed their active state (they read a non-reactive `editor`).
- Verified OK: title and body editing; Bold, Italic, Strike, Underline, Code, Quote, ¶, lists (bullet, ordered, task), heading −/size/+, link, image, highlight, sub, sup, hard break, alignment (4), colours and clear colour, fullscreen.

## 2. Notes list

- [x] **L1** Titles are cut to 6 characters ("Test n..") whatever the space.
- [x] **L2** In Select mode, clicking a note also opens it; Enter on a focused note opens it instead of selecting it.
- [x] **L3** Delete confirmation is empty: it doesn't say what or how many, there's no "can't be undone", and Delete looks like a normal green action.
- [x] **L4** After closing any dialog with Esc, × or a backdrop click, it won't open again (`Modal` mutates a non-bindable `show`), so the second delete attempt silently does nothing.
- [x] **L5** Deleting the note you're viewing leaves its stale page up; reloading, or opening any unknown `/read/<id>`, shows SvelteKit's raw "404 Not found".
- [x] **L6** Sort compares raw values: imported notes carry string dates, and mixed with new notes' `Date`s, "Last saved" and "Created" order breaks.
- [x] **L7** With zero notes the list is a blank panel.
- Verified OK: sort by Last saved, Created, A–Z, both directions, with clean data.

## 3. Data

- [x] **D1** Export → import doesn't give back the same notes: every note gets a new `id`, and `createdAt`/`updatedAt` come back as strings.
- [x] **D2** Import accepts any JSON array: an entry without `noteid` can't be opened, and one without `title` crashes the list (`note.title.length`).
- [x] **D3** Reading view can't scroll: long notes are cut off at the bottom of the window.
- [x] **D4** A long unbroken title or word pushes the reading view to 3000px+ wide.
- [x] **D5** A whitespace-only title is saved as-is and shows as a blank row.
- Verified OK: create → save → reload → edit keeps title, body and tree; emoji, accents, quotes and HTML-looking text round-trip and are shown escaped.
- [x] **Tested against data saved by the current version.** Ran `main` @ 628e80a and created notes through its UI: formatting, a list, a long note, unicode, one planted at tile (0,0), one edited. Then opened the same browser profile with this branch on the same origin:
  - DB shape unchanged (Dexie v2 / IDB v20, same indexes) and nothing rewritten on open.
  - Every note reads in full.
  - Editing the (0,0) note keeps its id, `createdAt` and coordinates.
  - Other notes stay byte-identical.
  - Export → import of that real data is exact.
  - Delete confirms by name.

  No migration needed: the IndexedDB shape is untouched.

## 4. First run

- [x] **F1** Home empty state ("Welcome to Arboreum! Create a new note to get started.") doesn't say what Arboreum is.
- [x] **F2** About page is one line about the tech stack, and its `100dvw` width plus margins overflows sideways.

## 5. Mobile (375px)

- [x] **M1** Header is 472px wide: Create New is pushed off-screen.
- [x] **M2** Sidebar is a fixed 280px column, open by default, so the editor and reading view are pushed off-screen and the page scrolls sideways.
- [x] **M3** Editor toolbar and side controls need re-checking once M2 is fixed (touch targets, scrolling).
- [x] **M4** Found in the final sweep: with the notes drawer open, the "…" menu (Import, Export, About) opened behind it. Fixed by raising the header nav only, so the map overlay looks exactly as before.

## 6. Accessibility

- [x] **A1** The shared `Button` drops `title` and `aria-label`, so header icon buttons (Import, Export, About) have no tooltip.
- [x] **A2** Icon-only controls with no name or tooltip:
  - header: "…", ☰, +, ⇗, the green "open sidebar" strip
  - list: sort direction ▼
  - editor: sub, sup, heading −/size/+, map, tree, colour swatches, fullscreen, bubble and floating menus
- [x] **A3** Tree picker options are `display: none` radios, so they can't be reached by keyboard.
- [x] **A4** Dialogs don't move focus in, don't trap Tab, and aren't `aria-modal`.
- [x] **A5** Focus visibility is inconsistent: the title input has `outline: none`, and default rings vanish on dark controls.
- [x] **A6** Popovers (sort, list, align, tree, colour, mobile "…") don't close with Escape.

## 7. Console

- [x] **C1** Browser console: zero errors, warnings or failed requests across a full sweep, on desktop and 375px touch, in the dev server and the production build. The sweep covers: home, about, create, format, link, tree pick, Ctrl+S, fullscreen, save, read, edit, the unsaved-changes dialog, sort, select, delete (incl. Esc and reopen), export, import, map toggle, missing note and reload.
  - [x] Found while testing touch: leaving the editor mid-selection logged a tippy.js "hide() on destroyed instance" warning. Fixed.
- [x] **C2** Build warning: `export const ssr = false` in `+layout.svelte` is ignored (dead line).
- [x] **C3** Compiler warnings in touched files (`editor` not `$state`, self-closing tags, `<svelte:component>`, a11y). What remains: Garden a11y (map is out of scope) and Svelte 4 → 5 syntax deprecations (see Questions).

## Questions for Agni

Each question has a recommended option; work continued on that default.

1. **Uncommitted work on `main` (dated 30 Apr): what should happen to it?**
   - **What it was:** 134 changed files: an editor/sidebar rewrite, a Dexie v3 schema (drops the `text` index, adds `updatedAt`), Garden moved to `lib/components`, and the unused React tiptap templates in `@/components/` deleted.
   - **Why it's not in this branch:** it was never deployed, and the brief describes the deployed app, so `polish/core` starts from `main` @ 628e80a.
   - **Where it is now:** nothing was lost. It's in `git stash@{0}` ("WIP uncommitted on main (Apr 30 2026) - preserved before polish/core"), plus a patch copy outside the repo.
   - **Recommend:** skim it, then drop it. This branch already covers its sidebar and title fixes, and its v3 schema isn't needed. Keep only its dead-file cleanup (see 6). If you do want v3, it needs its own migration test.
   - **Heads-up:** `git stash pop` will conflict with this branch once it's merged.
2. **Should Save keep you in the editor?** Now: Ctrl/⌘ S saves in place, and the Save button saves and opens the reading view (as before), with a "Saved ✓" toast. **Recommend** making the Save button stay in the editor too, since writing apps usually do, and adding a small "View" link to leave. I kept the old behaviour because it's a product call.
3. **Mobile notes list: drawer or page?** I made it an overlay drawer: closed by default, opened with ☰, closed after you pick a note. **Recommend** keeping it. The alternative is a full-screen list page.
4. **Sanitise imported HTML?** The reading view renders note HTML as-is. Notes written in the app are safe (Tiptap only produces its own schema), but a crafted backup file could carry script. **Recommend** a follow-up that passes imported HTML through Tiptap's schema (`generateJSON` → `generateHTML` from `@tiptap/core`, no new dependency). Left out here because it's security hardening, not polish.
5. **Migrate to Svelte 5 syntax?** About 100 dev-terminal deprecation notices remain (`on:click`, `<slot>`). They aren't browser console messages. **Recommend** one mechanical PR (`npx sv migrate svelte-5`). It touches every component, including the map, so it's out of scope here.
6. **Clean up dead files and config?** Unused files:
   - `Buttons2.svelte`, `Editor.svelte`, `Garden.svelte` at the repo root
   - `src/lib/Editor copy.svelte`, `src/lib/Tiptap.svelte`, `src/lib/_buttons.svelte`, both `emojiTab.svelte`, `src/lib/prism.js`
   - `src/routes/newleaf/page copy.svelte`, `src/routes/trapFocus.svelte.js`
   - `src/hooks/rate-limit.server.js` (not wired up; no login/register routes exist)
   - the React templates in `@/components/`

   Also, `vite.config.js` still sets `base: '/arboreum/'` from GitHub Pages days; SvelteKit ignores it and warns at dev start. **Recommend** removing all of these in one cleanup commit. I didn't, since it's config and housekeeping.
7. **Delete a single note from its page?** Today you can only delete through Select mode in the list. **Recommend** a Delete button next to Edit in the reading view, with the same confirmation. It's a new feature, so I didn't add it.
