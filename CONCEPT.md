# Arboreum 1610F: a modular note-taking device (concept)

A conceptual design project. Arboreum's notes, presented as a piece of swappable consumer electronics.

- **Writing** is classic plain-text editing, Sublime-style: monospace and evenly spaced.
- **The interface** is a console built from hardware-like modules you can slot in and out.

It is built at `/concept` inside the working app, on the same notes (IndexedDB `arboreum`), and leaves the existing app untouched. Once it's complete, it gets ported to become the main interface, and the current ("classic") interface is archived. It may grow into its own project later.

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
- **Configure button:** the only thing on the page besides the console (no caption).
  - It switches the orientation (landscape/portrait) and turns the bay, speaker and enclosure on and off.
  - Landscape: a small pill at the bottom right.
  - Portrait: a gear docked in the console's side column, under the speaker strip.
- **Portrait arrangement** (formerly "mobile"):
  - The console is shaped to the phone's own screen, and the screen gets every bit of height the other modules don't need.
  - The map viewer has its own row, with Move and Plant on one side. The D-pad and control pad share a row; A sits above B.
  - The speaker is a thin full-height strip down the right.
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

On a computer keyboard: arrow keys are the D-pad, Enter is A, Esc is B, and **M** is Start. Tab stays free for moving keyboard focus. Inside the editor only Esc (B) and Ctrl/⌘ S (A) map, so typing stays normal.

## Look

- **Hardware:** semi-realistic and lightly skeuomorphic. Layered CSS/SVG, no 3D library: chamfered bodies, screws, seams, soft shadows.
- **Colour:** each module has its own colour, all from one muted "workshop" family (moss, bone, aluminium, graphite). Signal orange is the accent, used only for A, latches, LEDs and stripes.
- **Screens:** carry the console feel. The main screen is dark glass with monospace text and an orange cursor. The map keeps its pixel art.
- **Fonts:** Chakra Petch for printing on the hardware; JetBrains Mono on the screens.
- **Layouts:** two handcrafted ones, landscape for desktop and portrait for mobile.

## Code structure

- `src/routes/concept/+page.svelte`: the stage, the device grid (desktop and mobile layouts) and the module toggles.
- `src/lib/concept/modules/*.svelte`: one component per module (Camera, Nameplate, ListModule, Screen, MapViewer, DPad, ControlPad, Speaker). Mobile tweaks sit beside each module's own styles.
- `src/lib/concept/materials.css`: shared materials (module bodies, screws, etched labels, glass, pips). It's scoped to the `.arb` root with `:where()`, so module styles win and nothing leaks into the main app.
- `src/lib/concept/Configurator.svelte`: the page-level Configure panel.
- `src/lib/concept/device.svelte.js`: the shared device state (input, screens, notes, saving, map).
- `src/lib/concept/garden.js`, `GardenMap.svelte`: the garden map (same tiles as the classic app) and its pixel window.
- `src/lib/concept/MonoEditor.svelte`, `NoteRows.svelte`, `trees.js`: the editor, the list rows, the tree catalogue.

## Layout system (decided)

The layout splits into three separate things:

1. **Arrangement:** where the modules sit. There are two hand-crafted arrangements, **landscape** and **portrait**, and both follow the placement rules below.
2. **Fit:** how an arrangement meets the window.
   - **Fixed:** the arrangement keeps its designed proportions and zooms as a whole, centred on the mat, like a product photo. Portrait is designed at 440 × 953 (a 9 : 19.5 phone).
   - **Fluid:** always fills the window exactly; the screen is the elastic module.
3. **Mode:** Fixed or Fluid.

That gives four results (fixed landscape, fluid landscape, fixed portrait, fluid portrait) from only **two designs**.

| | Fixed (default) | Fluid |
|---|---|---|
| Orientation | Picked once from the screen's shape on first load (taller than wide → portrait), then kept. Can be changed in Configure. | Follows the shape of the space continuously, with a buffer so it doesn't flicker at the switch point. |
| Fit | Uniform zoom to fit, never cut off or scrolled. | Fills the window; other modules keep their size within limits, and the screen takes the rest. |
| Dock choices | The user picks from the allowed placements. | Automatic, from the same rules. |

**Default is Fixed:** brain off by default. Fluid and custom docks are opt-in in Configure.

### Placement rules

1. **Core trio:** camera and nameplate on top, the screen below. This never changes.
2. **Controls** always sit below the screen.
3. **Beside the screen** (landscape only), at most one dock per side: the **list on the left**, the **bay (map viewer) on the right**.
4. **The bottom row is a pair:** either **D-pad + A/B**, or **List + something else**. A/B never appears without the D-pad.
5. **No controls row:** the screen goes full screen (touch and keyboard only).
6. **Portrait:** side docks move below the screen, above the controls row. The list becomes a full screen rather than a module. The speaker is filler and takes a thin edge strip.

Drag-and-drop docking is out for now: the rules above cover a small set of modules (up to about 15) without per-device tuning.

## Fine-tuning backlog (component-by-component pass)

- **Map viewer, mobile:** give the screen a custom shape (a clip-path cut-out) with the Move and Plant buttons set into that cut-out, instead of sitting beside a plain rectangle.
- **Wells rule (applies everywhere):** a recessed well's top padding sets the base, left/right padding is its own value, and the bottom padding equals the top plus the key's drop shadow (round keys 5px, Start 3px).

## Build order

Each step is small, checked in the browser, and committed on its own.

**A · Foundations**
1. ✅ **Split into components.** One file per module, plus shared materials and colour tokens, so each module can evolve on its own.
1b. ✅ **Fixed fit.** One fit rule everywhere (no device special cases), and orientation picked from the screen's shape. Verified with a resize sweep from 1440 to 320px wide, at three heights and in both orientations: no cut-offs, scrolling or jumps.
2. ✅ **Input bus.** A single source for D-pad, A, B and Start.
   - It takes input from the on-screen buttons and from the keyboard (arrows, Enter, Esc, Tab).
   - Each screen declares what A and B do, and the context strip renders that automatically.
3. ✅ **Screen states.** List, Editor, Start menu and Confirm, plus the moves between them.
4. ✅ **Real notes.** Read and write the app's IndexedDB through the existing `db.js`, with no schema change.

**B · The core loop (desktop)**

5. ✅ **List screen and List module.**
   - The D-pad moves, A opens, B cycles the sort.
   - The index tabs also sort.
6. ✅ **Editor.** Monospace "Sublime" styling:
   - gutter line numbers and a highlighted current line;
   - an orange block cursor;
   - markdown-style shortcuts.
7. ✅ **Saving and the Start menu.**
   - Save, unsaved state and the status line.
   - Start menu: new, save, delete (with confirm), backup.
8. ✅ **Secondary strip.** Two pages, switched with ◀ ▶:
   - Format: the keys run editor commands.
   - Details: words, dates, status, tree, plot.

**C · Modules that know about each other**

9. **Missing modules.** What's slotted decides the red **!** and the right-hand drawer (tree or plot picker), laid out like the missing module.
10. ✅ **Map viewer.** Real note positions, a cursor, and Move/Plant, using the same map data as the app.
11. **Treemoji and bay swapping.**
    - Treemoji: the tree picker plus the emoji buddy.
    - The bay swaps between Map, Treemoji and List, with slide-in/eject motion.
12. **Format deck.** A module that swaps with the control pad.
13. **Camera.** Image upload into the note.

**D · Layout modes and touch**

14. **Fluid fit.** The console fills the window, the screen is elastic, and orientation follows the space with a buffer.
15. **Fixed dock choices.** Configure lets the user pick from the allowed placements (sides for the list, bay and speaker, and the bottom-row pair).
16. **Typing posture.** When the on-screen keyboard opens, the lower modules fold into a thin strip; they come back when it closes.
17. **Portrait behaviour.** Touch input, the list as a full screen, the drawer, thumb reach, and checks on a real phone and an iPad.

**E · The concept page**

18. **The page around the device.** An intro, an exploded blueprint view with callouts, module spec sheets, a swap playground, and what's next.
19. **Finishing.**
    - Motion, plus optional click sounds through the speaker module.
    - Accessibility and performance.
    - A console sweep, and a regression check of the main app.

## Editor (decided)

The concept keeps the current Tiptap editor, so notes stay rich-text HTML and both the app and the concept edit the same notes. It gets a **monospace skin**: JetBrains Mono, a fixed line height, a line-number gutter and an orange block cursor.

**Lists** stay real list nodes; the monospace look only changes how they are drawn:
- Markers: bullets show as `- `, ordered items as `1. `, tasks as `[ ]` / `[x]` (clickable).
- Lines: one item is one numbered line. Nesting is a 2-space indent (Tab / Shift+Tab).
- Shortcuts: typing `- `, `1. ` or `[ ] ` at the start of a line still creates them.

**Carries over unchanged:** bold, italic, underline, strike, text colours, highlight, links, sub/superscript, inline code, quotes. JetBrains Mono's bold and italic keep the same width, so the grid holds.

**Changes in the concept:**
- **Text size:** headings show as `#` / `##` / `###` with colour and weight instead of bigger type. The size control becomes heading levels 1–3; older H4–H6 show as `###`.
- **Alignment:** centre, right and justify aren't offered, since they don't fit a code-style grid. Existing aligned text displays left-aligned, and the stored data isn't changed.
- **Inline images:** replaced by edge images, below.
- **Line numbers:** one number per block (paragraph, heading, list item). Soft-wrapped lines don't get a new number, as in Sublime.

## Images (decided)

There is one rule: each note chooses **one edge** for all its images. Images never sit inside or wrap around the text.

| Edge | Layout |
|---|---|
| **Top** / **Bottom** | Scrapbook: a fluid justified grid. Each row fills the width, so portrait and landscape images sit together without awkward gaps. |
| **Left** / **Right** | Strip: small thumbnails in a column beside the text. |

How the strip works:
- **Position:** a thumbnail's position is measured in **lines**, so the line height is the unit. It moves one line at a time along the strip, like a ruler.
- **Captions:** the text on that line is the caption; putting text beside a thumbnail is how you write next to an image.
- **Spacing:** thumbnails can't overlap.
- **Linking (optional, off by default):** a small link dot sits between a thumbnail and the line beside it. Clicking it joins the two into one row-cell: add or remove lines above, and the thumbnail moves with its line. Unlinked thumbnails keep their line number.

Input:
- **Camera module:** adds an image (file picker; on phones it can open the camera).
- **Start menu:** choose the edge, remove an image.
- **Moving images:** the D-pad selects an image and moves it along the strip; A confirms, B cancels.

**Default edge** for a new note: bottom (text first, scrapbook after).

**Storage (decided):** images never touch the notes database (`arboreum` in IndexedDB stays exactly as it is).
- **Where:** the browser's **Origin Private File System**. It works in all modern browsers and needs no permission prompt. Each note gets a folder: `notes/<noteid>/` holds the image files plus `layout.json` (edge, order, line positions, links).
- **Persistence:** the browser is asked to keep this storage (`navigator.storage.persist()`), so it isn't cleared when space runs low.
- **Optional:** "Save to a folder on my computer" (File System Access API), only where the browser supports it (Chrome, Edge).
- **Size:** images are downscaled on import.
- **Known gap:** images aren't in the app's current Export/Import file. Backups will need an image-aware format later.
- **Old notes:** inline images in old notes get no compatibility work; the concept ignores them. No notes are deleted.
