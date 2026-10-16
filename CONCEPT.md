# Arboreum 1610F: a modular note-taking device (concept)

A conceptual design project. Arboreum's notes, presented as a piece of swappable consumer electronics.

- **Writing** is classic plain-text editing, Sublime-style: monospace and evenly spaced.
- **The interface** is a console built from hardware-like modules you can slot in and out.

It lives at `/concept` inside the working app. It reads the same notes in the browser (IndexedDB `arboreum`) and leaves the existing app untouched. It may grow into its own project later.

## Modules

| Module | What it is | Notes |
|---|---|---|
| **Camera** | Top-left. The media button: adds an image to the note. | |
| **Nameplate** | Fixed hardware title bar reading ARBOREUM 1610F. | Branding only, not customisable. Model numbers are hexadecimal: 1610F is `0x1610F`. |
| **Screen** | Where writing happens. The notes list is a full screen here too, not a drawer. | |
| **Bay** | Swappable slot: **Map viewer**, **Treemoji** or **List**. | Map viewer layouts: desktop has its two buttons side by side; mobile puts them at opposite corners for thumb reach. |
| **D-pad** | Moves through the list and the text. | |
| **Control pad** | **A**, **B**, **Start**. | Swaps with the **Format deck**: physical keys for bold, italic, headings, lists and so on. |

## Structure (decided after look test 00)

- **No chassis.** Every module is its own free-standing body, and the blocks together form the console. There are no release tabs.
- **Desktop:** a wide console.
  - Top row: camera, then the nameplate.
  - Middle row: List module on the left, then the screen, then the bay on the right.
  - Bottom row: D-pad, then the control pad, then the speaker. They stay visible so the device reads at a glance.
- **Mobile:** a portrait stack: camera and nameplate, then the screen, the bay (optional), the D-pad with the control pad, and the speaker (optional). On mobile the list opens full screen instead of as a module.
- **Control pad:** Start, B and A in one straight row.
- **Configure button:** sits on the page, bottom right, outside the device. It switches desktop/mobile and turns the bay, speaker and enclosure on and off.
- **Enclosure:** an optional dark frame behind the modules. It's off by default.
- **Bay:** for now it holds the Map viewer. Desktop has its two buttons side by side; mobile puts them at opposite corners.

## Screen strips

- **A/B context strip:** overlaid at the bottom right and always visible. It says what A and B do right now.
- **Secondary strip:** along the bottom, paged with ◀ ▶. One page holds formatting keys; the other holds details (words, date, status, tree, plot).
- **Missing module:** the context strip shows a red **!** pointing to the missing step, such as choosing a tree or a plot. A drawer then slides out from the right of the screen, laid out like the missing module.

## Inputs

| Screen | D-pad | A | B | Start |
|---|---|---|---|---|
| List | move | open | sort | menu (new, save, backup, swap) |
| Editor | cursor | save | back to list | menu |
| Map viewer | cursor | plant here | cancel | — |
| Confirm | — | yes | no | — |

On a computer keyboard: arrow keys are the D-pad, Enter is A, Esc is B, and Tab is Start.

## Look

- **Hardware:** semi-realistic and lightly skeuomorphic. Layered CSS/SVG, no 3D library: chamfered bodies, screws, seams, soft shadows.
- **Colour:** each module has its own colour, all from one muted "workshop" family (moss, bone, aluminium, graphite). Signal orange is the accent, used only for A, latches, LEDs and stripes.
- **Screens:** carry the console feel. The main screen is dark glass with monospace text and an orange cursor. The map keeps its pixel art.
- **Fonts:** Chakra Petch for printing on the hardware; JetBrains Mono on the screens.
- **Layouts:** two handcrafted ones, landscape for desktop and portrait for mobile.

## Build order

Each step is small, checked in the browser, and committed on its own.

**A · Foundations**
1. **Split into components.** One file per module, plus shared materials and colour tokens, so each module can evolve on its own.
2. **Input bus.** A single source for D-pad, A, B and Start.
   - It takes input from the on-screen buttons and from the keyboard (arrows, Enter, Esc, Tab).
   - Each screen declares what A and B do, and the context strip renders that automatically.
3. **Screen states.** List, Editor, Start menu and Confirm, plus the moves between them.
4. **Real notes.** Read and write the app's IndexedDB through the existing `db.js`, with no schema change.

**B · The core loop (desktop)**

5. **List screen and List module.**
   - The D-pad moves, A opens, B cycles the sort.
   - The index tabs also sort.
6. **Editor.** Monospace "Sublime" styling:
   - gutter line numbers and a highlighted current line;
   - an orange block cursor;
   - markdown-style shortcuts.
7. **Saving and the Start menu.**
   - Save, unsaved state and the status line.
   - Start menu: new, save, delete (with confirm), backup.
8. **Secondary strip.** Two pages, switched with ◀ ▶:
   - Format: the keys run editor commands.
   - Details: words, dates, status, tree, plot.

**C · Modules that know about each other**

9. **Missing modules.** What's slotted decides the red **!** and the right-hand drawer (tree or plot picker), laid out like the missing module.
10. **Map viewer.** Real note positions, a cursor, and Move/Plant, using the same map data as the app.
11. **Treemoji and bay swapping.**
    - Treemoji: the tree picker plus the emoji buddy.
    - The bay swaps between Map, Treemoji and List, with slide-in/eject motion.
12. **Format deck.** A module that swaps with the control pad.
13. **Camera.** Image upload into the note.

**D · Mobile**

14. **Portrait behaviour.** Touch input, the list as a full screen, the drawer, thumb reach, and checks on a real phone.

**E · The concept page**

15. **The page around the device.** An intro, an exploded blueprint view with callouts, module spec sheets, a swap playground, and what's next.
16. **Finishing.**
    - Motion, plus optional click sounds through the speaker module.
    - Accessibility and performance.
    - A console sweep, and a regression check of the main app.

## Open decision: the editor engine

Existing notes are stored as rich-text HTML, from Tiptap.

- **Recommended: keep Tiptap and give it a monospace skin.** Each block is one numbered line, and markdown markers (`#`, `**`) show through styling. Notes stay in one format, so the app and the concept edit the same notes safely.
- **The alternative is a true plain-text code editor (CodeMirror).** It feels more like Sublime, but it needs a new dependency and an HTML ↔ markdown conversion. Converting in both directions risks losing formatting in existing notes.
