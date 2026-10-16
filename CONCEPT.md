# Arboreum F16O: a modular note-taking device (concept)

A conceptual design project. Arboreum's notes, presented as a piece of swappable consumer electronics.

- **Writing** is classic plain-text editing, Sublime-style: monospace and evenly spaced.
- **The interface** is a console built from hardware-like modules you can slot in and out.

It lives at `/concept` inside the working app. It reads the same notes in the browser (IndexedDB `arboreum`) and leaves the existing app untouched. It may grow into its own project later.

## Modules

| Module | What it is | Notes |
|---|---|---|
| **Camera** | Top-left. The media button: adds an image to the note. | |
| **Nameplate** | Fixed hardware title bar reading ARBOREUM F16O. | Branding only, not customisable. |
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
- **Configure button:** sits on the page, bottom right, outside the device. It switches desktop/mobile and turns the bay and speaker on and off.
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

## Phases

0. **Look test:** the assembled desktop device, static, at its finished look, with an empty bay showing the missing-module **!**.
1. The working desktop device on real notes: editor, list, D-pad/A/B/Start, both strips, module swapping.
2. Portrait mobile layout.
3. The concept page: an exploded "blueprint" view, module spec sheets, a swap playground, and what's next.
4. Map viewer with plant controls, and camera image upload.
