# Arboreum 1610F: a modular note-taking device (concept)

A conceptual design project. Arboreum's notes, presented as a piece of swappable consumer electronics.

- **Writing** is classic plain-text editing, Sublime-style: monospace and evenly spaced.
- **The interface** is a console built from hardware-like modules you can slot in and out.

It is the app's home page (`/`), on the same notes (IndexedDB `arboreum`) as the classic interface, which is archived at `/classic` (kept working for screenshots and the project's story). `/concept`, where it was built, redirects to `/`. It may grow into its own project later.

## Open items (start here)

The one list of what's left, in working order. Details live in the sections linked. Tick items off here as they're done, and add new ones here first.

**1 · Finish mobile** (build order D, steps 16–17; needs a real phone)
- [x] **Saving when the phone leaves.** Save the draft on `visibilitychange` / `pagehide`. Today only `beforeunload` guards, and phones often skip it (app switch, tab killed), so a draft can be lost. *Done: hidden or pagehide saves quietly, as leaving a note does.*
- [x] **Touch basics on every key:** `touch-action: manipulation` (fast taps on the D-pad or A can zoom the page on iOS), no text selection or iOS callout on a long press, no grey tap highlight. Press states: iOS often skips `:active`; the strip's `.key:hover` sticks after a tap (needs `@media (hover: hover)`). D-pad arms need `pointercancel`. *Done in code; press states still to check on the phone.*
- [x] **D-pad hold-to-repeat** (from the interaction pass; on a phone it's the only way to keep moving). *Done: the press lands on touch-down, repeats after 380 ms, every 70 ms.*
- [x] **Typing posture** (step 16, decided 17 Oct). The keyboard is allowed up (no keyboard on demand); while it's up in portrait, only the screen and the controls row show above it. Covers the viewport item too. *Done; checked on Android.*
- [x] **Viewport.** The height while typing comes from `visualViewport` (above). `viewport-fit=cover` and safe areas are left out on purpose: in the browser Safari already keeps the page clear of the notch and paints the mat behind it. They only matter for a home-screen app, so they go with the manifest (iOS storage, below).
- [ ] **iOS checks:** the first tap on a note opens it with the caret in place (tap-to-edit runs on mousedown); ~~Safari zooms in when focusing text under 16px~~ (fixed: `maximum-scale=1`, on iOS only, where pinch zoom still works); map tap-tap planting on a real iPhone; HEIC photos through the Camera.
- [x] **Touch-only gaps in the three ways:** without a hardware keyboard there's no way to indent list items (Tab / Shift+Tab) or to undo and redo. *Done: the format strip has ↶ ↷ (first) and ⇤ ⇥; the Format deck has ↶ ↷ leading its rows.*
- [ ] **iOS storage** (next, now that the device is the home page): Safari can clear IndexedDB and OPFS after 7 days without a visit unless the site is on the home screen, and a home-screen app keeps its own storage, apart from Safari's. Plan: a web app manifest (`start_url: /`, standalone, icons; safe areas go in with it), `persist()` asked at the first save (today only on the image path) with its answer shown in Configure, and a one-time "Add to Home Screen" hint in iPhone Safari, early, before much is written.
- [x] Treemoji's tree grid has small tiles in the short portrait bay row. *Done: a filled tree grid takes 6 a row when its screen is wide and short; the D-pad steps by the same.*

**2 · Deploy the concept.** *Done 17 Oct:* merged to `main` and live at arboreum-v2.vercel.app/concept, beside the classic app (which it doesn't touch). Phone tests now have HTTPS, which OPFS and `storage.persist()` need.

**3 · Interaction consistency pass** (see its section): clickable confirms (open question), one focus rule between modules, undo granularity.

**4 · Visual pass** (see its section): screen colour theme (Everforest as a base), D-pad feel. From the backlog: the Map viewer's cut-out screen in portrait, and the wells rule everywhere.

**5 · Images, the rest:** *done 17 Oct:* replace and remove on the picked image (REPLACE and a ✕ that asks in place; Start → IMAGE menu; the Camera and IMG replace it). Still open: the link dot, "Save to a folder on my computer", images in backups (an image-aware export format).

**6 · The concept page and finishing** (build order E): the page around the device and the design philosophy pages, motion and click sounds, accessibility and performance, a console sweep, and a regression check of the classic app.

**7 · The port.** *Routes done 17 Oct:* the device is `/`, the classic app lives under `/classic` (its own layout, links and routes moved with it), `/concept` redirects. Still open from the classic polish pass (POLISH.md): sanitise imported HTML, and remove the dead files and old config. Pages beyond the app (about, the project's idea, a portfolio) are still to place: where their links live on a page that's all console is open.

**8 · The speaker as a music player** (briefed to Grok as an isolated test, `briefs/speaker-player.md`): tap the grille and SPK-01 flips over to a small player for the user's own MP3/WAV files; Chrome and Edge remember the folder. Once it's in, give it a console route (a Start menu line) so it meets the three ways. Spotify is out for now: the Web Playback SDK needs Premium for every listener and has no iOS support, and a Development Mode app is capped at five allowlisted users (extended quota is only for registered businesses with 250k monthly users).

**Next after mobile:** the extended format deck (Ideas for later).

**Parked** (Ideas for later): phone turned sideways, a second bay on upright tablets, a filler module for spare height (an empty expansion port as an Easter egg), a cap on very wide monitors.

## Modules

| Module | What it is | Notes |
|---|---|---|
| **Camera** | Top-left. The media button: adds an image to the note. | Its LED lights while an image comes in. |
| **Nameplate** | Fixed hardware title bar: ARBOREUM at the right end with 1610F under it, stripes at the left (landscape adds the line "Classic note taking, reimagined / Customisation within structure"). | Branding only, not customisable. Model numbers are hexadecimal: 1610F is `0x1610F`. |
| **Screen** | Where writing happens. The notes list is a full screen here too, not a drawer. | |
| **Bay** | Swappable slot: **Map viewer**, **Treemoji** or **List**. | Picked in Configure; the old module ejects and the new one slides in. Whatever is slotted does its job; the drawer covers the rest. |
| **D-pad** | Moves through the list and the text. | |
| **Control pad** | **A**, **B**, **Start**, **Select**. | Swaps with the **Format deck** (FMT-01): physical keys for bold, italic, headings, lists and so on. The orange slide switch set into either module's right edge (top half, the same place on both; up PAD, down FMT) swaps them; so does Configure. |

## Structure (decided after look test 00)

- **No chassis.** Every module is its own free-standing body, and the blocks together form the console. There are no release tabs.
- **Desktop:** a wide console.
  - Top row: camera, then the nameplate.
  - Middle row: List module on the left, then the screen, then the bay on the right.
  - Bottom row: D-pad, then the control pad, then the speaker. They stay visible so the device reads at a glance.
- **Mobile:** a portrait stack: camera and nameplate, then the screen, the D-pad with the control pad, the bay (optional), and the speaker (optional). On mobile the list opens full screen unless the bay holds it.
- **Control pad:** Select, Start, B and A in one straight row (Select and Start share a well, as on a handheld).
- **Configure button:** a gear in the nameplate (no caption); nothing sits on the page outside the console. Two tabs:
  - **LAYOUT:** modules: list (landscape), D-pad, control pad, bay, speaker. Screen: show markup, line numbers (on by default; off leaves a slim margin and the current-line band), spell check.
  - **LOOK:** the theme, and the finish (screen glare, off by default; the enclosure).
  - It also overrides the orientation (Auto / Landscape / Portrait; Auto follows the window's shape).
  - Turning modules off follows the placement rules: no List module means the list opens full screen; a lone control module takes the bottom row; no controls means the screen takes the height.
  - Where: always a gear set into the nameplate's left end, in every arrangement, with or without the speaker; its panel opens downward. (It used to float at the bottom right in landscape and move between the speaker column and the nameplate in portrait.)
- **Portrait arrangement** (formerly "mobile"):
  - The console is shaped to the phone's own screen, and the screen gets every bit of height the other modules don't need.
  - The D-pad and control pad share the row right under the screen, as in landscape. On the control pad, B and A sit side by side with Select and Start below them.
  - The bay has its own row below the controls, with the Map viewer's Move and Tree keys on one side (in thumb reach at the bottom).
  - The speaker is a thin full-height strip down the right. Without it, the other modules take the full width.
  - The console always spans the window's width; the screen takes whatever height is left (down to a usable minimum, below which the console zooms to fit the height).
- **Enclosure:** an optional dark frame behind the modules. It's off by default.
- **Bay:** holds one of three modules, picked in Configure (BAY switch, then MAP · TREEMOJI · LIST).
  - **Map viewer (MAP-01):** plot and tree. Desktop has its two keys side by side; portrait stacks them on one side.
  - **Treemoji (TRM-01):** the tree buddy. A small screen shows the note's tree with a speech bubble (the classic app's lines, plus reactions to saving, planting and new trees; asleep while browsing). Three keys, pocket-pet style: ◀ and ▶ flip straight through the trees, and TREE opens the tree grid on its screen (tapping the buddy does the same). It handles the tree; the drawer handles the plot. It's a writing buddy too: it bobs along while you type, dozes after two quiet minutes (and wakes when you type again), greets you by the time of day when a note opens, cheers word milestones (first words, then 100, 250, 500, 1000, 2000), and has a cheeky line for formatting from any route (bold, strike, headings, lists, three quick undos). A drop in its screen's corner waters it: drops fall, hearts float up.
  - **List (LST-01):** there is one List module. Putting it in the bay takes it off the left dock, and in portrait it gives the list a module under the controls instead of a full screen.
  - **Who does what:** each job (tree, plot) goes to the slotted module that can do it; the drawer slides out only for the jobs nothing slotted handles. With the Map viewer: no drawer. With Treemoji: the drawer has the plot. With the List or an empty bay: the drawer has both.

## Screen strips

- **A/B context strip:** overlaid at the bottom right and always visible. It says what A, B and Start do right now. Start's pip reads **SRT** (a three-letter word key, like the hardware's printing; not STR, which reads as "string"). Select's would read **SEL**; Select isn't on the strip today.
- **Secondary strip:** along the bottom. It starts with its keys; the page switcher (◀ FORMAT ▶ / DETAILS) sits at the right. The format page: ↶ ↷, the formats, then ⇤ ⇥, IMG (add an image, like the Camera) and the image edge (▄ ▀ ▌ ▐, once the note has images; a tap cycles it). The details page: words, date, status, tree, plot. Both scroll (a mouse wheel scrolls them sideways) and fade only where there's more.
- **Missing module:** a red **!** sits on whatever resolves the missing step (a tree or a plot). For a job the drawer stands in for, it's on the drawer's handle; for a job a slotted module does, an alert chip points at the bay ("! NO TREE ▸"). Both sit in the screen's status line, so nothing covers the text. The drawer slides out from the right, under its handle, laid out like the missing module.

## Inputs

| Screen | D-pad | A | B | Start | Select (tap) |
|---|---|---|---|---|---|
| List | move | open | new note | menu (new, sort, backup) | selection mode |
| Editor | cursor | save | new note (the open note is saved and closed first) | menu (save, tree, new, delete, close) | to the list (the note is saved) |
| Map viewer · MOVE | cursor | plant here | back (cursor returns to the tree) | — | — |
| Map viewer or Treemoji · TREE | tree grid | pick | back | — | — |
| Drawer | move | pick / plant | close | switch tree ↔ plot | — |
| Confirm | — | yes | no | third choice, if any | — |

**Select is the list key.** A tap means "the list": from a note it goes to the list, in the list it switches selection mode. Holding Select with the D-pad means "extend the selection": text in a note, a run of notes in the list. It acts when it's let go, and only if the D-pad wasn't used while it was held.

**Leaving a note always saves it:** B, Select, opening another note, or Close note. A brand-new note with nothing in it is simply dropped. Hardware keys don't take keyboard focus when clicked, so typing carries on in the editor.

On a computer keyboard: arrow keys are the D-pad, **Enter, Space or the letter A** is A, **Esc or the letter B** is B, **Ctrl/⌘ K** is Start, and **Ctrl/⌘ L** is a tap of Select (Shift with the arrows is holding Select). Space and the letters only count where nothing is typed (the list, the map, the drawer, menus and confirms), never while writing a note. Tab stays free for moving keyboard focus. Inside the editor only Esc (B), Ctrl/⌘ S (save), Ctrl/⌘ K (Start) and Ctrl/⌘ L (Select) map, so typing stays normal.
- Why not Shift: inside a text editor Shift already means capitals and selection.
- Why not Ctrl/⌘ M: on a Mac ⌘ M minimises the window.

Ctrl/⌘ K is the usual "command menu" shortcut, and browsers leave it to the page. The page opens straight into a note, with no menu.

**The Map viewer's own keys.** MOVE and TREE each hand the D-pad to the Map viewer; pressing the same key again leaves, exactly like B. While a key has the D-pad it stays latched down (a push-on, push-off key, not an outline), on the Map viewer and on Treemoji alike. While the Map viewer has the D-pad, its own screen shows the A/B context and the main screen's strip steps aside. With the Map viewer slotted there is no tree/plot drawer at all. Leaving the editor and coming back (map, menu) puts the caret back where it was.

## Look

- **Hardware:** semi-realistic and lightly skeuomorphic. Layered CSS/SVG, no 3D library: chamfered bodies, screws, seams, soft shadows.
- **Colour:** each module has its own colour, all from one muted "workshop" family (moss, bone, aluminium, graphite, and a pale lichen for Treemoji). Signal orange is the accent, used only for A, latches, LEDs and stripes.
- **Screens:** carry the console feel. The main screen's glass tints by state: warm moss while writing, cool slate while browsing. The main screen is dark glass with monospace text and an orange cursor. The map keeps its pixel art.
- **Fonts:** Chakra Petch for printing on the hardware; JetBrains Mono on the screens.
- **Layouts:** two handcrafted ones, landscape for desktop and portrait for mobile.

## Code structure

- `src/routes/+page.svelte`: the stage, the device grid (desktop and mobile layouts) and the module toggles. The classic app is everything under `src/routes/classic/`.
- `src/lib/concept/modules/*.svelte`: one component per module (Camera, Nameplate, ListModule, Screen, MapViewer, Treemoji, DPad, ControlPad, FormatDeck, Speaker). Mobile tweaks sit beside each module's own styles.
- `src/lib/concept/materials.css`: shared materials (module bodies, screws, etched labels, glass, pips). It's scoped to the `.arb` root with `:where()`, so module styles win and nothing leaks into the main app.
- `src/lib/concept/Configurator.svelte`: the page-level Configure panel (LAYOUT and LOOK tabs); `themes.js`: the themes (module roles and the accent).
- `src/lib/concept/device.svelte.js`: the shared device state (input, screens, notes, saving, map).
- `src/lib/concept/garden.js`, `GardenMap.svelte`: the garden map (same tiles as the classic app) and its pixel window.
- `src/lib/concept/media.js`, `opfs-writer.js`, `NoteImages.svelte`: a note's images (storage, the writer worker, the edge layouts).
- `src/lib/concept/MonoEditor.svelte`, `NoteRows.svelte`, `TreeGrid.svelte`, `trees.js`: the editor, the list rows, the tree grid (Map viewer, Treemoji and drawer share it), the tree catalogue.

## Layout system (decided 17 Oct: the screen is the only thing that stretches)

Simplified from an earlier Fixed/Fluid plan and a "v2" proposal (a switch threshold, dock customisation, container queries). All of that is dropped. The whole model is three points:

1. **Two arrangements, picked by the window's shape.** Taller than wide gives **portrait**, otherwise **landscape**. It follows the window live (rotating a phone or tablet switches it), with a small buffer at the line so it doesn't flicker while resizing. The orientation switch in Configure stays as an override (Auto / Landscape / Portrait).
2. **One fit rule.** If the window is smaller than the design, the console zooms down as a whole. If it's bigger, the **screen** takes the extra space, in width and height. Every other module is hardware and keeps its size; keys never grow.
3. **Neighbours ride along.** Modules that share the screen's row or column get a longer body because the grid stretches them, with their keys centred at normal size. Nothing is redesigned per size. A module's own screen is the exception that grows with it, and it shows more rather than bigger: the Map viewer shows more of the garden (the base 12 × 9 view sets the tile size, then as many whole tiles as fit, up to the whole 25 × 15), and Treemoji's screen, when it's tall, puts the tree grid on a shelf under the buddy, ready to tap.

4. **Each arrangement keeps its own bay.** Portrait starts without the bay, so the screen gets the room (the drawer handles tree and plot); turned back on, it holds the List. Landscape keeps whatever was set there, so rotating back and forth gives each its own.

**Guardrail for exceptions.** The arrangements may differ only in (a) the default for a module choice (today only the bay), and (b) a module's own look, decided by the size of its own cell (as the control pad does). No new placements, no new settings, and no rules keyed to the window's size. A wish that needs more than that goes under "Ideas for later" first.

What that gives: desktop gets a big screen; a portrait phone gets an edge-to-edge screen; an upright iPad fills its width instead of leaving the mat at the sides.

**No settings added.** If a very large monitor makes the screen feel like an app rather than an object, a cap (one number) can come later.

**Not handled:** a phone turned sideways. It shows landscape zoomed small; it also needs a different answer for the keyboard, so it's parked under "Ideas for later".

### Placement rules

1. **Core trio:** camera and nameplate on top, the screen below. This never changes.
2. **Controls** always sit below the screen.
3. **Beside the screen** (landscape only), at most one dock per side: the **list on the left**, the **bay (map viewer) on the right**.
4. **The bottom row is a pair:** either **D-pad + A/B**, or **List + something else**. A/B never appears without the D-pad.
   - **The D-pad follows the control slot:** whenever the slot changes (edge switch or Configure), the D-pad turns on for the control pad and off for the Format deck or no controls. A manual toggle in Configure holds until the slot changes again. (This settles the old "D-pad without controls" question.)
   - **Portrait sizes:** the controls row is 144px with a slightly smaller D-pad (160px when the Format deck's three rows sit beside it). The control pad stacks B A over Start only when its cell is narrow; with room (an upright tablet, or no D-pad) Start, B and A are one row again. It decides from its own width (a container query).
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
- **Mouse only:** click a tile: you're in move mode with the cursor there. Click other tiles to move it. Hover the cursor's own tile and the crosshair becomes a green cross; click it again to plant. Leave by pressing MOVE again. Hovering any tree shows its note's title; clicking another note's tree opens that note (the open one is saved first, as B does). The cursor's highlight sits on the ground, under the trees.
- **Keyboard only:** arrows, then Enter / Space / A to accept, Esc / B to back out.
- **Console only:** MOVE, D-pad, A / B.

**What it deliberately doesn't do:** the A/B context strips are labels, never buttons. They aren't made clickable on desktop as a shortcut. The point is to show that the three routes are seamless without that crutch: on-screen controls are real hardware keys, and the screen content itself is clickable.

### 3. Hardware is a layout tool

The project blends real-world hardware, UI/UX and modern web layout, and it uses that blend on purpose. Modules that exist only for the look can give way to ones that do something:
- **Without the Map viewer, the speaker lets the screen grow:** with the bay pulled, the main screen widens into the space.
- **Without the speaker, the bay grows:** with the speaker pulled and the Map viewer slotted, the Map viewer takes the whole right column and its map zooms in (9 tiles across instead of 12, as many rows as fit). A larger map asset can come later.

The physical metaphor decides the rules (one dock per side, controls below the screen); the web decides how the space flows.

## Interaction consistency pass (next big pass)

One pass over menus, context, focus and highlight across the whole device: list, editor, map, drawer, menus and confirms. Collected from testing (16 Oct):

**Open vs closed must be obvious.** *Done (the glass):* writing a note is a warm moss glass; browsing (the list, or a note in preview) a cool slate one, so where you are reads at a glance. The status line already says PREVIEW for a note that isn't open.

**Mouse everywhere on desktop:**
- menu items are clickable (*done*: a click chooses, a mouse hover moves the caret);
- confirm choices: *open question.* They show A/B pips like the context strip, which stays labels (Design philosophy, §2), so making them clickable needs a call. A candidate answer from the image keys: the mouse confirms in place (a ✕ that turns into CONFIRM on the first press), and the box stays for the console and keyboard;
- the drawer is clickable too;
- A/B context chips stay labels, not buttons (see Design philosophy, §2).

**Keyboard parity:** ✅ Space and the letters A / B act as A and B wherever nothing is typed.

**Focus and highlight moving between modules:** one rule for how the cursor, highlight and focus move between the list, the editor, the Map viewer and the drawer.

**A compact Start menu.** *Done.* Related actions share a row: `IMAGES  ADD · GO TO`, `BACKUP  SAVE · LOAD`. Left and right pick a choice (boxed in the accent), A runs it, and a click on a choice runs it straight away. Rows that step through values keep ◂ ▸ (IMAGE EDGE, SORT).

**Multi-select and delete in the list.** *Done (selection mode).* In by Select, Start → SELECT NOTES, the List module's slider (the classic app's Select/Exit switch stood on end, under the sort tabs: switched on, it rises and uncovers a red delete key; its edge turns orange) or a long press on a row. Rows show `[ ]` / `[x]`; the D-pad moves, A (or a tap) picks, B or Select leaves, Start (or Delete) deletes the picked notes after a confirm that names them. The full-screen list shows a DELETE n chip in its status line while picking, for touch without a Start key.

**One overflow rule for strips.** *Done:* both scroll, and an edge fades only while there's more past it. (Nothing moves the D-pad along a strip yet.) Format keys and details both overflowed on the right. Use one rule for both: content fades at the edge and scrolls; when the D-pad moves along a strip, the item under the cursor scrolls into view.

**Undo granularity.** One formatting action should be one undo step. *Fixed already:* undo right after opening a note emptied it, so each note now starts with a fresh undo history.

**Marks at word level.** *Done (`word-marks.js`).* With the markup hidden, the caret at either edge of a formatted word is inside its markers (`**word|**`): the key lights and typed letters join the word. A space typed at the edge is plain and steps out. A mark key with only a caret applies to the whole word. Links are left out. Treat the word as the unit. With the caret just before or after a bold, italic or underlined word, its key lights up, as it already does at the start of a line. Spaces carry no marks.

**D-pad hold-to-repeat.** *Done.* Holding a D-pad arm repeats: a short delay, then the repeat speeds up the longer it's held. It applies to the caret, the list and the map cursor. Physical keyboard arrows keep the system's own repeat.

**Delete confirm names the note and shows its tree.** *Done*, and the delete is locked to that note even if you switch notes while the box is open.

## Visual pass

**Themes (done 17 Oct, Configure → LOOK).** Themes only, never per-module colour picks: a theme sets every module's colour and the accent together, so the contrast between modules is designed, not left to chance. Five, in `themes.js`:
- **WORKSHOP:** today's moss, bone, aluminium and graphite, signal orange (exactly as before).
- **ARCADE:** bright blocks, one colour each: blue D-pad, yellow controls, green bay, purple speaker, red deck, a red-orange accent.
- **HANDHELD:** one warm mustard top to bottom (screen bezel included) on a dark mat, a red accent.
- **SORBET:** pastel shells (peach, mint, lemon, lilac, pink) around a deep purple screen, a teal accent.
- **MIDNIGHT:** dark bodies (indigo D-pad, teal bay, plum speaker), a cyan accent, a dark mat.

How it works: each module has a **role** (`r-plate`, `r-cam`, `r-scr` for the screen and list, `r-dpad`, `r-ctl`, `r-bay` shared by the Map viewer and Treemoji, `r-spk`, `r-deck`) that sets its body from the theme. A theme gives one colour per role; its highlight, side and **ink** are worked out from it (dark labels on a light body, light on a dark one, firmer on saturated colours), so a theme can make any module bright or dark and its etched labels stay readable. The accent covers everything signal: the nameplate stripe, the model number, A, LEDs, latches, the cursor, the map cursor. The keys, keycaps and the screens' glass stay the same in every theme. The Configure panel takes the plate's colours. Like the rest of Configure, the theme isn't remembered between visits.

**Screen colour theme.** A cohesive palette for every kind of text on the screen. A candidate base is Everforest, a soft green-earth editor theme that suits the moss palette.

**Spell check.** *Done.* Off by default, with a Configure toggle. When it's on, the squiggles get soft pastel colours where the browser allows (`::spelling-error` / `::grammar-error` in Chromium and Safari).

**D-pad feel:** more tuning.

## Ideas for later

- **Extended format deck (next after mobile; settles "mini A/B on the Format deck").** A third choice for the control slot: one unified module with a D-pad on the left, the Format deck's keys in the middle and A, B, Start and Select on the right. It doesn't change the layout (the controls row still holds one thing); it's for someone who wants navigation, the console keys and styling all at once, which matters most in the typing posture. The plain control pad and Format deck stay. To settle: how it fits a portrait phone's width (the D-pad and deck already share that row), and whether the strip's FORMAT page steps aside for it as it does for the deck.
- **A second bay on upright tablets.** An iPad held upright has the width for two bays side by side (for example Map | List). Needs a second slot in Configure and "who does what" rules for two slotted modules.
- **A filler module for spare height.** Something like the speaker, real-looking but doing nothing much, for a column with spare height: an empty expansion port ("EXP-01 · NO CARTRIDGE") that ejects a tiny fake cartridge when tapped, or a battery meter that's quietly the storage in use.
- **A cap on very wide monitors.** One number: past it the console stops growing and the mat shows, so it stays an object rather than an app.
- **Phone turned sideways.** Today it's landscape zoomed small. A real answer is probably a handheld arrangement (D-pad left, screen centre, A/B right), and it has to work with the on-screen keyboard taking most of the height. Rare; not now.

## Fine-tuning backlog (component-by-component pass)

- **Map viewer, mobile:** give the screen a custom shape (a clip-path cut-out) with the Move and Plant buttons set into that cut-out, instead of sitting beside a plain rectangle.
- **Drawer tab:** now a chip at the right of the status line (tree sprite, PLOT, the red ! when its job is missing), not a tab over the text. *Done.*
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
    - Swapped by the orange slide switch on either module's right edge, or in Configure (CONTROLS, then CONTROL PAD · FORMAT DECK). The control slot slides down and up.
    - With the deck slotted, the screen strip's FORMAT page steps aside (the strip was the deck's virtual stand-in) and only DETAILS shows. A, B and Start stay on the keyboard.
13. ✅ **Camera.** Image upload into the note.
    - Three routes in: the Camera (file picker; on phones it offers the camera), pasting or dropping image files into the text, and Start → ADD IMAGE. A brand-new note is saved first, since images live in its folder. Each image lands beside the caret's line.
    - Storage as decided (OPFS, `notes/<noteid>/` with `layout.json`), written through a small worker: the sync access handle is the one write path every browser has had since Safari 15.2 (the simpler `createWritable` only arrived in Safari 26). Downscaled to 1600px on import; deleting a note deletes its folder.
    - Edges: top/bottom scrapbook (justified rows), left/right strip (positioned by line; a thumbnail that would overlap is pushed down, its line kept). The left strip sits outside the line numbers.
    - Arranging: tap an image, or Start → IMAGES → GO TO. Along the edge the D-pad moves it (strip: a line at a time; scrapbook: its place in the order), across it picks another; A done, B cancel, Start opens the IMAGE menu (REPLACE IMAGE, REMOVE IMAGE with a confirm). Start → IMAGES → GO TO hands the D-pad to the images (on a strip, the image nearest the caret's line), Delete removes with a confirm. Dragging with the mouse moves it too and places it on release.
    - Replace and remove on the image itself (mouse and touch): the picked image shows REPLACE and a red ✕ in its corner. The ✕ asks in place: one press turns it into **✕ CONFIRM**, a second removes the image (it disarms after 3 s, or when another image is picked or a menu opens). On a narrow strip thumb the keys hang over the text. The Camera and the strip's IMG key (it reads ↻ IMG) replace the picked image too. A replaced image keeps its line or its place in the order.
    - Images and their layout save straight away, like hardware actions; they aren't part of the note's unsaved draft.
    - Not yet: the link dot (thumbnail joined to its line), "Save to a folder on my computer", and images in backups.

**D · Layout modes and touch**

14. ✅ **The screen stretches.** The console zooms to the tighter direction (up to 125%) and the screen takes what's left in the other. Columns under the screen share extra width in proportion, so the D-pad and control bodies widen with their keys centred and the deck keeps its two thirds; the side docks get taller. Checked from 375 to 2560px wide, both arrangements, with the enclosure, the deck, and without controls, speaker or bay: the console fills the window, nothing scrolls, phones unchanged.
15. ✅ **Orientation follows the window.** Taller than wide gives portrait on load; after that it switches only 10% past square, so resizing near the line doesn't flicker. Configure's switch is Auto / Landscape / Portrait (not remembered between visits, like the other Configure settings). Checked by resizing one page across the line both ways, rotating a phone size, and overriding in a portrait window.
16. **Typing posture** (decided 17 Oct, replaces folding into a strip and the keyboard-on-demand ⌨ key). On a notes app the keyboard is the most important input, so it's allowed up whenever the editor has focus (the hardware keys don't take focus, so it stays up while they're used). There isn't room for three modules beside it, so it's two: the screen and the controls row.
    - **Where the keyboard is:** `visualViewport` on both phones. The keyboard's top is `offsetTop + height`; the keyboard is up when that's well short of the window's height while the editor has focus (and the page isn't pinch-zoomed). Safari's bar above the keyboard counts as keyboard. No VirtualKeyboard API and no `interactive-widget`, so one path for iOS and Android.
    - **The posture (portrait only):** the console's bottom edge sits on the keyboard's top, with the controls row right above it. The top row (camera and nameplate) goes up past the top edge: that line is the snapping point, so the screen starts at the top of what's visible. The bay and speaker step out while typing (they'd be behind the keyboard); the drawer stands in for the bay, as it does whenever the bay is empty. The screen gives up the height; the console doesn't zoom down.
    - **The controls row is the choice:** control pad (D-pad, A/B, Start, Select) or the Format deck (styling, beside the keyboard's letters). Later the extended format deck combines both (Ideas for later).
    - **iOS:** Safari scrolls the page to keep the caret in view, so the console is pinned to the visible area (`offsetTop`). It reports the keyboard's size when the slide-up ends, so the layout settles a beat after the keyboard.
17. **Portrait behaviour.** Touch input, the list as a full screen, the drawer, thumb reach, and checks on a real phone and an iPad.
    - Fixed: the gutter's line numbers drifted from the text at any zoom other than 100% (screen rects are zoomed, the gutter isn't).
    - Fixed: on touch the map couldn't plant. In portrait the A/B strip shrank the map when it showed, so the second tap landed on another tile; it now shares the line under the map with the readout. The map also takes taps from pointer events with `touch-action: manipulation`, so tap-tap isn't a double-tap zoom on iOS (not yet checked on a real iPhone).
    - Known: Treemoji's tree grid has small tiles in the short bay row. The screen already keeps a fixed height and scrolls inside.

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
- **Start menu:** choose the edge, remove an image. The format strip has IMG and the edge key too.
- **Moving images:** the D-pad selects an image and moves it along the strip; A confirms, B cancels. While a strip image has the D-pad (tapped, dragged or moved with the D-pad), its line is tinted orange and the gutter shows a track: a rail with a tick per line, the target lit. With images on the left, the line numbers stay leftmost, then the images, then the text.

**Default edge** for a new note: bottom (text first, scrapbook after).

**Storage (decided):** images never touch the notes database (`arboreum` in IndexedDB stays exactly as it is).
- **Where:** the browser's **Origin Private File System**. It works in all modern browsers and needs no permission prompt. Each note gets a folder: `notes/<noteid>/` holds the image files plus `layout.json` (edge, order, line positions, links).
- **Persistence:** the browser is asked to keep this storage (`navigator.storage.persist()`), so it isn't cleared when space runs low.
- **Optional:** "Save to a folder on my computer" (File System Access API), only where the browser supports it (Chrome, Edge).
- **Size:** images are downscaled on import.
- **Known gap:** images aren't in the app's current Export/Import file. Backups will need an image-aware format later.
- **Old notes:** inline images in old notes get no compatibility work; the concept ignores them. No notes are deleted.
