# Arboreum 1610F: a modular note-taking device (concept)

A conceptual design project. Arboreum's notes, presented as a piece of swappable consumer electronics.

- **Writing** is classic plain-text editing, Sublime-style: monospace and evenly spaced.
- **The interface** is a console built from hardware-like modules you can slot in and out.

It is built at `/concept` inside the working app, on the same notes (IndexedDB `arboreum`), and leaves the existing app untouched. Once it's complete, it gets ported to become the main interface, and the current ("classic") interface is archived. It may grow into its own project later.

## Modules

| Module | What it is | Notes |
|---|---|---|
| **Camera** | Top-left. The media button: adds an image to the note. | Its LED lights while an image comes in. |
| **Nameplate** | Fixed hardware title bar: ARBOREUM at the right end with 1610F under it, stripes at the left (landscape adds the line "Classic note taking, reimagined / Customisation within structure"). | Branding only, not customisable. Model numbers are hexadecimal: 1610F is `0x1610F`. |
| **Screen** | Where writing happens. The notes list is a full screen here too, not a drawer. | |
| **Bay** | Swappable slot: **Map viewer**, **Treemoji** or **List**. | Picked in Configure; the old module ejects and the new one slides in. Whatever is slotted does its job; the drawer covers the rest. |
| **D-pad** | Moves through the list and the text. | |
| **Control pad** | **A**, **B**, **Start**. | Swaps with the **Format deck** (FMT-01): physical keys for bold, italic, headings, lists and so on. The orange ⇄ latch in either module's label swaps them; so does Configure. |

## Structure (decided after look test 00)

- **No chassis.** Every module is its own free-standing body, and the blocks together form the console. There are no release tabs.
- **Desktop:** a wide console.
  - Top row: camera, then the nameplate.
  - Middle row: List module on the left, then the screen, then the bay on the right.
  - Bottom row: D-pad, then the control pad, then the speaker. They stay visible so the device reads at a glance.
- **Mobile:** a portrait stack: camera and nameplate, then the screen, the D-pad with the control pad, the bay (optional), and the speaker (optional). On mobile the list opens full screen unless the bay holds it.
- **Control pad:** Start, B and A in one straight row.
- **Configure button:** the only thing on the page besides the console (no caption).
  - Modules: list (landscape), D-pad, control pad, bay, speaker. Screen: show markup, screen glare (off by default). Body: enclosure.
  - It also overrides the orientation (Auto / Landscape / Portrait; Auto follows the window's shape).
  - Turning modules off follows the placement rules: no List module means the list opens full screen; a lone control module takes the bottom row; no controls means the screen takes the height.
  - Landscape: a small pill at the bottom right.
  - Portrait: a gear docked in the console's side column, under the speaker strip. Without the speaker there's no side column; the gear docks at the nameplate's left end and its panel opens downward.
- **Portrait arrangement** (formerly "mobile"):
  - The console is shaped to the phone's own screen, and the screen gets every bit of height the other modules don't need.
  - The D-pad and control pad share the row right under the screen, as in landscape. On the control pad, B and A sit side by side with Start below them.
  - The bay has its own row below the controls, with the Map viewer's Move and Tree keys on one side (in thumb reach at the bottom).
  - The speaker is a thin full-height strip down the right. Without it, the other modules take the full width.
  - The console always spans the window's width; the screen takes whatever height is left (down to a usable minimum, below which the console zooms to fit the height).
- **Enclosure:** an optional dark frame behind the modules. It's off by default.
- **Bay:** holds one of three modules, picked in Configure (BAY switch, then MAP · TREEMOJI · LIST).
  - **Map viewer (MAP-01):** plot and tree. Desktop has its two keys side by side; portrait stacks them on one side.
  - **Treemoji (TRM-01):** the tree buddy. A small screen shows the note's tree with a speech bubble (the classic app's lines, plus reactions to saving, planting and new trees; asleep while browsing). Three keys, pocket-pet style: ◀ and ▶ flip straight through the trees, and TREE opens the tree grid on its screen (tapping the buddy does the same). It handles the tree; the drawer handles the plot.
  - **List (LST-01):** there is one List module. Putting it in the bay takes it off the left dock, and in portrait it gives the list a module under the controls instead of a full screen.
  - **Who does what:** each job (tree, plot) goes to the slotted module that can do it; the drawer slides out only for the jobs nothing slotted handles. With the Map viewer: no drawer. With Treemoji: the drawer has the plot. With the List or an empty bay: the drawer has both.

## Screen strips

- **A/B context strip:** overlaid at the bottom right and always visible. It says what A and B do right now.
- **Secondary strip:** along the bottom, paged with ◀ ▶. One page holds formatting keys; the other holds details (words, date, status, tree, plot).
- **Missing module:** the context strip shows a red **!** pointing to the missing step, such as choosing a tree or a plot. A drawer then slides out from the right of the screen, laid out like the missing module.

## Inputs

| Screen | D-pad | A | B | Start |
|---|---|---|---|---|
| List | move | open | new note | menu (new, sort, backup) |
| Editor | cursor | save | new note (the open note is saved and closed first) | menu (save, tree, new, delete, close) |
| Map viewer · MOVE | cursor | plant here | back (cursor returns to the tree) | — |
| Map viewer or Treemoji · TREE | tree grid | pick | back | — |
| Drawer | move | pick / plant | close | switch tree ↔ plot |
| Confirm | — | yes | no | third choice, if any |

**Leaving a note always saves it:** B, opening another note, or Close note. A brand-new note with nothing in it is simply dropped. Hardware keys don't take keyboard focus when clicked, so typing carries on in the editor.

On a computer keyboard: arrow keys are the D-pad, **Enter, Space or the letter A** is A, **Esc or the letter B** is B, and **Ctrl/⌘ K** is Start. Space and the letters only count where nothing is typed (the list, the map, the drawer, menus and confirms), never while writing a note. Tab stays free for moving keyboard focus. Inside the editor only Esc (B), Ctrl/⌘ S (save) and Ctrl/⌘ K (Start) map, so typing stays normal.
- Why not Shift: inside a text editor Shift already means capitals and selection.
- Why not Ctrl/⌘ M: on a Mac ⌘ M minimises the window.

Ctrl/⌘ K is the usual "command menu" shortcut, and browsers leave it to the page. The page opens straight into a note, with no menu.

**The Map viewer's own keys.** MOVE and TREE each hand the D-pad to the Map viewer; pressing the same key again leaves, exactly like B. While the Map viewer has the D-pad, its own screen shows the A/B context and the main screen's strip steps aside. With the Map viewer slotted there is no tree/plot drawer at all. Leaving the editor and coming back (map, menu) puts the caret back where it was.

## Look

- **Hardware:** semi-realistic and lightly skeuomorphic. Layered CSS/SVG, no 3D library: chamfered bodies, screws, seams, soft shadows.
- **Colour:** each module has its own colour, all from one muted "workshop" family (moss, bone, aluminium, graphite, and a pale lichen for Treemoji). Signal orange is the accent, used only for A, latches, LEDs and stripes.
- **Screens:** carry the console feel. The main screen is dark glass with monospace text and an orange cursor. The map keeps its pixel art.
- **Fonts:** Chakra Petch for printing on the hardware; JetBrains Mono on the screens.
- **Layouts:** two handcrafted ones, landscape for desktop and portrait for mobile.

## Code structure

- `src/routes/concept/+page.svelte`: the stage, the device grid (desktop and mobile layouts) and the module toggles.
- `src/lib/concept/modules/*.svelte`: one component per module (Camera, Nameplate, ListModule, Screen, MapViewer, Treemoji, DPad, ControlPad, FormatDeck, Speaker). Mobile tweaks sit beside each module's own styles.
- `src/lib/concept/materials.css`: shared materials (module bodies, screws, etched labels, glass, pips). It's scoped to the `.arb` root with `:where()`, so module styles win and nothing leaks into the main app.
- `src/lib/concept/Configurator.svelte`: the page-level Configure panel.
- `src/lib/concept/device.svelte.js`: the shared device state (input, screens, notes, saving, map).
- `src/lib/concept/garden.js`, `GardenMap.svelte`: the garden map (same tiles as the classic app) and its pixel window.
- `src/lib/concept/media.js`, `opfs-writer.js`, `NoteImages.svelte`: a note's images (storage, the writer worker, the edge layouts).
- `src/lib/concept/MonoEditor.svelte`, `NoteRows.svelte`, `TreeGrid.svelte`, `trees.js`: the editor, the list rows, the tree grid (Map viewer, Treemoji and drawer share it), the tree catalogue.

## Layout system (decided 17 Oct: the screen is the only thing that stretches)

Simplified from an earlier Fixed/Fluid plan and a "v2" proposal (a switch threshold, dock customisation, container queries). All of that is dropped. The whole model is three points:

1. **Two arrangements, picked by the window's shape.** Taller than wide gives **portrait**, otherwise **landscape**. It follows the window live (rotating a phone or tablet switches it), with a small buffer at the line so it doesn't flicker while resizing. The orientation switch in Configure stays as an override (Auto / Landscape / Portrait).
2. **One fit rule.** If the window is smaller than the design, the console zooms down as a whole. If it's bigger, the **screen** takes the extra space, in width and height. Every other module is hardware and keeps its size; keys never grow.
3. **Neighbours ride along.** Modules that share the screen's row or column get a longer body because the grid stretches them, with their keys centred at normal size. Nothing is redesigned per size.

What that gives: desktop gets a big screen; a portrait phone gets an edge-to-edge screen; an upright iPad fills its width instead of leaving the mat at the sides.

**No settings added.** If a very large monitor makes the screen feel like an app rather than an object, a cap (one number) can come later.

**Not handled:** a phone turned sideways. It shows landscape zoomed small; it also needs a different answer for the keyboard, so it's parked under "Ideas for later".

### Placement rules

1. **Core trio:** camera and nameplate on top, the screen below. This never changes.
2. **Controls** always sit below the screen.
3. **Beside the screen** (landscape only), at most one dock per side: the **list on the left**, the **bay (map viewer) on the right**.
4. **The bottom row is a pair:** either **D-pad + A/B**, or **List + something else**. A/B never appears without the D-pad.
   - **Split:** D-pad + control pad share the row half and half. D-pad + Format deck: the deck takes two thirds (it matters more there). In portrait the deck beside the D-pad has three rows of wide keys; without the D-pad it spans the row in two rows of thumb-sized keys.
5. **No controls row:** the screen goes full screen (touch and keyboard only).
6. **Portrait:** side docks move below the controls row. The list becomes a full screen rather than a module. The speaker is filler and takes a thin edge strip.

Drag-and-drop docking is out for now: the rules above cover a small set of modules (up to about 15) without per-device tuning.

## Design philosophy (the theory under the project)

This is the basis for the "about / design philosophy" page (one or two pages) that goes with the concept page. Write it from here.

### 1. Concept never beats usability

The hardware fiction is a skin over a tool people actually use. Persistent everyday features (for example selecting several notes and deleting them) stay, even if they don't map neatly onto the hardware.

### 2. Three equivalent ways to do everything

Every action has three complete routes, and each one works on its own:

1. **Classic desktop:** keyboard shortcuts and the mouse, the way any app works (click a tile, click it again; type; Ctrl/⌘ S).
2. **Touching the console:** pointing at the hardware with the cursor, or a finger, as if it were a touch-screen device (press MOVE, press A, tap the screen).
3. **The console way:** only the D-pad, A, B and Start, with menus.

They are deliberately, heavily redundant, and users can mix them mid-action: press MOVE, nudge with the arrow keys, finish with the mouse. Whatever hand is already moving should just work. The aim is a device that feels smooth in a way nobody can quite explain.

How that plays out, with the Map viewer as the worked example:
- **Mouse only:** click a tile: you're in move mode with the cursor there. Click other tiles to move it. Hover the cursor's own tile and the crosshair becomes a green cross; click it again to plant. Leave by pressing MOVE again.
- **Keyboard only:** arrows, then Enter / Space / A to accept, Esc / B to back out.
- **Console only:** MOVE, D-pad, A / B.

**What it deliberately doesn't do:** the A/B context strips are labels, never buttons. They aren't made clickable on desktop as a shortcut. The point is to show that the three routes are seamless without that crutch: on-screen controls are real hardware keys, and the screen content itself is clickable.

### 3. Hardware is a layout tool

The project blends real-world hardware, UI/UX and modern web layout, and it uses that blend on purpose. Modules that exist only for the look can give way to ones that do something:
- **Without the Map viewer, the speaker lets the screen grow:** with the bay pulled, the main screen widens into the space.
- **Without the speaker, the bay grows:** with the speaker pulled and the Map viewer slotted, the Map viewer takes the whole right column and its map zooms in (9 × 12 bigger tiles in place of 12 × 9). A larger map asset can come later.

The physical metaphor decides the rules (one dock per side, controls below the screen); the web decides how the space flows.

## Interaction consistency pass (next big pass)

One pass over menus, context, focus and highlight across the whole device: list, editor, map, drawer, menus and confirms. Collected from testing (16 Oct):

**Open vs closed must be obvious.** Whether a note is open for editing or just being browsed needs a clear visual state; the proposal is that the screen's background shifts and the status shows EDITING or PREVIEW. Today Close note only moves the caret away.

**Mouse everywhere on desktop:**
- menu items and confirm choices are clickable;
- the drawer is clickable too;
- A/B context chips stay labels, not buttons (see Design philosophy, §2).

**Keyboard parity:** ✅ Space and the letters A / B act as A and B wherever nothing is typed.

**Focus and highlight moving between modules:** one rule for how the cursor, highlight and focus move between the list, the editor, the Map viewer and the drawer.

**Multi-select and delete in the list.** Either bring back a Select switch, or give the list context a Select mode: Start → Select, then the D-pad moves, A toggles, B exits, and Start deletes n.

**One overflow rule for strips.** Format keys and details both overflow on the right. Use one rule for both: content fades at the edge and scrolls; when the D-pad moves along a strip, the item under the cursor scrolls into view.

**Undo granularity.** One formatting action should be one undo step. *Fixed already:* undo right after opening a note emptied it, so each note now starts with a fresh undo history.

**Marks at word level.** Treat the word as the unit. With the caret just before or after a bold, italic or underlined word, its key lights up, as it already does at the start of a line. Spaces carry no marks.

**D-pad hold-to-repeat.** Holding a D-pad arm repeats: a short delay, then the repeat speeds up the longer it's held. It applies to the caret, the list and the map cursor. Physical keyboard arrows keep the system's own repeat.

**Delete confirm names the note and shows its tree.** *Done*, and the delete is locked to that note even if you switch notes while the box is open.

## Visual pass

**Screen colour theme.** A cohesive palette for every kind of text on the screen. A candidate base is Everforest, a soft green-earth editor theme that suits the moss palette.

**Spell check.** Off by default, with a Configure toggle. When it's on, the squiggles get soft pastel colours where the browser allows (`::spelling-error` / `::grammar-error` in Chromium and Safari).

**D-pad feel:** more tuning.

## Ideas for later

- **Select key, Gboard-style.** A Select button: hold it and move with the D-pad to select a block of text (the usual tap-and-drag selection stays). Needs the input bus to know when a key is held, not just pressed.
- **Mini A/B on the Format deck (open question).** A small A, B, Start (and Select) on the deck would make D-pad + deck a complete console, and a natural typing posture on phones; the control pad would become the big-buttons choice. To settle: whether the strip's FORMAT page stays while the deck is in (today it steps aside, as the deck's virtual stand-in), and how the keys fit in portrait (three rows, or a small A/B column).
- **Phone turned sideways.** Today it's landscape zoomed small. A real answer is probably a handheld arrangement (D-pad left, screen centre, A/B right), and it has to work with the on-screen keyboard taking most of the height. Rare; not now.
- **D-pad without controls.** Today the D-pad can be on with no control slot filled; it means little without A/B. Decide whether Configure should prevent it.

## Fine-tuning backlog (component-by-component pass)

- **Map viewer, mobile:** give the screen a custom shape (a clip-path cut-out) with the Move and Plant buttons set into that cut-out, instead of sitting beside a plain rectangle.
- **Drawer tab:** opaque, with a firmer edge and a shadow, so it stays findable over long text. *Done.*
- **Wells rule (applies everywhere):** a recessed well's top padding sets the base, left/right padding is its own value, and the bottom padding equals the top plus the key's drop shadow (round keys 5px, Start 3px).

## Working plan (decided)

- **Desktop first:** finish and tune everything for desktop (mouse, cursor and keyboard all work as you'd expect, alongside the hardware keys) and deploy it.
- **Mobile later,** in its own session: touch, the portrait arrangement, and the typing posture.

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

9. ✅ **Missing modules.** What's slotted decides the red **!** and the right-hand drawer (tree or plot picker), laid out like the missing module.
10. ✅ **Map viewer.** Real note positions and a cursor, using the same map data as the app. MOVE and TREE: it owns both the plot and the tree grid, with its own A/B context; a full mouse flow (tap a tile, tap again to plant); it zooms in when it has the whole column.
11. ✅ **Treemoji and bay swapping.**
    - Treemoji: the tree buddy, which takes over the tree grid when it's slotted (its "software" comes with the hardware); the drawer stands in only for the plot.
    - The bay swaps between Map, Treemoji and List, with slide-in/eject motion.
12. ✅ **Format deck.** A module that swaps with the control pad.
    - Bone keycaps on a dark deck: marks on top (B, I, U, S, HL, code), line kinds below (H1–H3, bullets, numbers, tasks, quote). A key stays down with its LED lit while that format is under the caret.
    - Swapped by the orange ⇄ latch in either module's label, or in Configure (CONTROLS, then CONTROL PAD · FORMAT DECK). The control slot slides down and up.
    - With the deck slotted, the screen strip's FORMAT page steps aside (the strip was the deck's virtual stand-in) and only DETAILS shows. A, B and Start stay on the keyboard.
13. ✅ **Camera.** Image upload into the note.
    - Three routes in: the Camera (file picker; on phones it offers the camera), pasting or dropping image files into the text, and Start → ADD IMAGE. A brand-new note is saved first, since images live in its folder. Each image lands beside the caret's line.
    - Storage as decided (OPFS, `notes/<noteid>/` with `layout.json`), written through a small worker: the sync access handle is the one write path every browser has had since Safari 15.2 (the simpler `createWritable` only arrived in Safari 26). Downscaled to 1600px on import; deleting a note deletes its folder.
    - Edges: top/bottom scrapbook (justified rows), left/right strip (positioned by line; a thumbnail that would overlap is pushed down, its line kept). The left strip sits outside the line numbers.
    - Arranging: tap an image, or Start → ARRANGE IMAGES. Along the edge the D-pad moves it (strip: a line at a time; scrapbook: its place in the order), across it picks another; A done, B cancel, Start (or Delete) removes, with a confirm. Dragging with the mouse moves it too and places it on release.
    - Images and their layout save straight away, like hardware actions; they aren't part of the note's unsaved draft.
    - Not yet: the link dot (thumbnail joined to its line), "Save to a folder on my computer", and images in backups.

**D · Layout modes and touch**

14. ✅ **The screen stretches.** The console zooms to the tighter direction (up to 125%) and the screen takes what's left in the other. Columns under the screen share extra width in proportion, so the D-pad and control bodies widen with their keys centred and the deck keeps its two thirds; the side docks get taller. Checked from 375 to 2560px wide, both arrangements, with the enclosure, the deck, and without controls, speaker or bay: the console fills the window, nothing scrolls, phones unchanged.
15. ✅ **Orientation follows the window.** Taller than wide gives portrait on load; after that it switches only 10% past square, so resizing near the line doesn't flicker. Configure's switch is Auto / Landscape / Portrait (not remembered between visits, like the other Configure settings). Checked by resizing one page across the line both ways, rotating a phone size, and overriding in a portrait window.
16. **Typing posture.** When the on-screen keyboard opens, the lower modules fold into a thin strip; they come back when it closes.
    - **The keyboard on demand (found in phone testing):** focusing the editor shouldn't raise the phone's keyboard. The editor gets `inputmode="none"` (caret and selection still work, no keyboard), and a keyboard key (⌨) raises it by switching to `inputmode="text"`, then lowers it again. Where Chrome's VirtualKeyboard API exists (Android), use `virtualkeyboardpolicy="manual"` with `navigator.virtualKeyboard.show()` / `hide()`; iOS may need a blur and refocus for the switch to take. Tapping the text moves the caret without raising the keyboard.
17. **Portrait behaviour.** Touch input, the list as a full screen, the drawer, thumb reach, and checks on a real phone and an iPad.
    - Fixed: the gutter's line numbers drifted from the text at any zoom other than 100% (screen rects are zoomed, the gutter isn't).
    - Known: the Map viewer's A/B strip squeezes the small map when it shows. Treemoji's tree grid has small tiles in the short bay row. The screen already keeps a fixed height and scrolls inside.

**E · The concept page**

18. **The page around the device.** An intro, an exploded blueprint view with callouts, module spec sheets, a swap playground, and what's next. Plus one or two pages on the design philosophy, written from the section above.
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

**Styled or markup (Configure → Show markup):**
- **Styled (default):** bold is bold with no `**`, and headings are a step bigger, each on its own taller line, so it stays monospace line by line. Code gets a tint, quotes a side rule, bullets are `•`, and the divider is a line.
- **Markup:** the markers show as text (`#`, `**`, `_`, `~~`, `` ` ``, `- `, `>`, `---`).

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
