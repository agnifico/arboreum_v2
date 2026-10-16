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

## 4. First run

- [x] **F1** Home empty state ("Welcome to Arboreum! Create a new note to get started.") doesn't say what Arboreum is.
- [ ] **F2** About page is one line about the tech stack, and its `100dvw` width plus margins overflows sideways.

## 5. Mobile (375px)

- [x] **M1** Header is 472px wide: Create New is pushed off-screen.
- [x] **M2** Sidebar is a fixed 280px column, open by default, so the editor and reading view are pushed off-screen and the page scrolls sideways.
- [x] **M3** Editor toolbar and side controls need re-checking once M2 is fixed (touch targets, scrolling).

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

- [ ] **C1** Browser console: zero errors or warnings in every flow audited (home, about, create, edit, read, sort, select, delete, import, export, map toggle, new tab). Re-checked after each fix.
  - [x] Found while testing touch: leaving the editor mid-selection logged a tippy.js "hide() on destroyed instance" warning. Fixed.
- [ ] **C2** Build warning: `export const ssr = false` in `+layout.svelte` is ignored (dead line).
- [ ] **C3** Compiler warnings in touched files (a11y, `editor` not `$state`, self-closing tags).

## Questions for Agni

<!-- Each has a recommended option; work continued on that default. -->
