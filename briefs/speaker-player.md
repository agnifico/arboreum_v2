# Brief: SPK-01 becomes a music player

You're working in a SvelteKit app (Svelte 5, runes). The home page (`/`) is **Arboreum 1610F**, a note-taking app built to look like a piece of modular hardware: a console made of separate modules (camera, nameplate, screen, D-pad, control pad, speaker, and so on). `CONCEPT.md` at the repo root explains the whole project. Read its sections "Modules", "Look" and "Design philosophy" before you start.

Your job is one module: the **speaker** (`src/lib/concept/modules/Speaker.svelte`). Today it's decoration: a dark body with a grille of vertical slots, a PWR LED and the label SPK-01. Make it a small music player for the user's own audio files, hidden behind the grille.

## What it does

1. **Tap the grille and the module flips over** (a 3D turn around its vertical axis, about 0.5 s). The back is the player. A flip key on the back turns it back to the grille. The module keeps its exact size and place in the layout; the flip happens inside its own box.
2. **The back face** is a dark LCD-style panel and a row of hardware keys:
   - the screen shows the track title (scrolling if it's too long), elapsed / total time, a thin progress bar (click or tap it to seek), and the track number (e.g. `03/12`);
   - keys: **⏮ ⏯ ⏭**, **LOAD** (choose music), and **⟲** (flip back to the grille).
   - With nothing loaded, the screen says `NO MUSIC · PRESS LOAD`.
3. **Playing:** MP3 and WAV at minimum (whatever `<audio>` can play is fine; M4A, OGG and FLAC often work too). Tracks play in order, sorted by file name, and the next starts when one ends. The last track wraps to the first.
4. **The grille side while music plays:** the PWR LED pulses slowly, and the grille slots move gently with the music. Use a Web Audio `AnalyserNode` on the audio element, one slot per frequency band, a subtle brightness or height change. Keep it subtle, and stop the animation loop when nothing is playing.
5. **Remembering where the music is:**
   - **Chrome and Edge** (where `window.showDirectoryPicker` exists): LOAD picks a folder. Keep the `FileSystemDirectoryHandle` in IndexedDB, and read the folder again on the next visit. The browser may ask for permission again: call `handle.queryPermission({ mode: "read" })`, and if it isn't `"granted"`, show `TAP TO RECONNECT` on the screen and call `requestPermission` from that tap (it needs a user gesture).
   - **Safari and Firefox** (no folder picker): LOAD opens a file input (`accept="audio/*"`, `multiple`). Those tracks last for the visit only; say so once on the player's screen (`THIS VISIT ONLY`).
   - Also remember the last track and its position (localStorage is fine), and resume from there. Don't autoplay on page load.
6. **Portrait layout:** in portrait the speaker is a thin 22 px strip down the right edge (see the `:global(.portrait)` styles in the file). It's too thin to flip. In portrait, a tap on the strip plays or pauses whatever is loaded (nothing happens if nothing is loaded), and the LED pulses while it plays. Loading music happens in landscape.

## Libraries

- **Playback:** use a plain `HTMLAudioElement`. It already plays MP3 and WAV everywhere, and a library such as Howler adds nothing here.
- **Storing the folder handle:** use `idb-keyval` (tiny). Give it its own database, e.g. `createStore("arboreum-music", "handles")`. Never touch the app's own IndexedDB database `arboreum`.
- **Tags (optional):** if you want title and artist from ID3 tags, `music-metadata` (its browser build) is fine. The file name without its extension is an acceptable title.

## Where the code goes

- `src/lib/concept/modules/Speaker.svelte`: both faces and the flip.
- `src/lib/concept/music.svelte.js` (new): the player's state and logic (tracks, current index, playing, time, load / next / prev / seek, persistence), as a class with `$state` fields, like `device.svelte.js` does it. Keep the audio element and the analyser in here, not in the markup.
- `package.json`: add `idb-keyval` (and `music-metadata` if you use it).

**Don't change anything else:** not `device.svelte.js`, not `+page.svelte`, not the other modules, not the layout grid. `Speaker` is used as `<Speaker />` (it accepts an optional `slots` prop); keep that working.

## How it must look and behave (house rules)

- **Materials:** the body stays `class="mod graphite spk"` with its screws. Use the CSS tokens that are already defined on the page instead of new hex values where one fits: `--graphite`, `--graphite-hi`, `--graphite-side`, `--glass` (screen black), `--phosphor` and `--phosphor-dim` (screen text), `--signal` (the orange accent: A key, LEDs, latches only), `--label` (Chakra Petch, for printing on the hardware), `--mono` (JetBrains Mono, for screen text). Labels printed on the body use the existing `etch-dark` class (see `materials.css`). A key that's latched or playing can glow `--signal`; nothing else is orange.
- **Keys look physical:** round or pill keycaps with a drop shadow underneath, which press down 2 px on `:active`. Look at `ControlPad.svelte` and `Camera.svelte` for the exact style and copy it.
- **Hardware keys never take keyboard focus away from the editor.** Every key needs `onmousedown={(e) => e.preventDefault()}`, as in `Camera.svelte`, so someone typing a note can press ⏯ without losing the caret.
- **Touch:** keys need `touch-action: manipulation`, no tap highlight, and a press state that works on iOS (look at how the other modules do it).
- **Accessibility:** every key has an `aria-label`, the flip is a real `<button>` (the grille side is one big button labelled "Open the music player"), and the hidden face is `inert` so Tab can't reach it.
- **Motion:** respect `prefers-reduced-motion`: no flip animation (swap instantly) and no grille animation.
- Styles stay scoped in the component (no global CSS, no Tailwind).

## Done when

- [ ] In landscape at 1440 × 900, tapping the grille flips to the player and ⟲ flips back. The module's size doesn't change, and nothing around it moves.
- [ ] LOAD in Chrome picks a folder, its MP3 and WAV files play in name order, and ⏮ ⏯ ⏭ and seeking work.
- [ ] After a reload in Chrome, the same folder is there (after one reconnect tap if the browser asks), and it resumes at the same track and position without autoplaying.
- [ ] In Safari and Firefox, LOAD picks files, they play, and the screen says THIS VISIT ONLY.
- [ ] The grille moves with the music and the LED pulses; both stop when paused.
- [ ] In portrait (resize the window narrower than it is tall), the strip plays and pauses on tap.
- [ ] Typing in a note, pressing ⏯ doesn't move the caret or blur the editor.
- [ ] `npx svelte-check --threshold error` reports 0 errors, and the browser console is clean.

**To run it:** `npm install`, then `npm run dev`, then open http://localhost:5173/.

**When you hand it back,** list the files you changed, which browsers you tested in, and anything in this brief you couldn't do or did differently, and why.
