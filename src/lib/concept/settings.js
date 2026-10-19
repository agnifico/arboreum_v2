// Configure's choices, remembered in this browser (localStorage), like the
// notes: LAYOUT (orientation, each arrangement's bay, the modules, the
// control slot), the screen (markup, line numbers, spell check) and LOOK
// (theme, glare, enclosure). Nothing passing is kept: whether Configure is
// open, the typing posture, focus. Read once at start; every field is checked,
// so an old or broken save, or a theme that's gone, falls back to the default.
import { THEMES } from "./themes.js";

const KEY = "JXF26-ARB-16A-config";

/** The factory settings (a fresh copy each time: bays is nested). */
export const defaults = () => ({
  orient: "auto", // auto | landscape | portrait
  // Each arrangement keeps its own bay: portrait starts without one.
  bays: { landscape: { show: true, module: "map" }, portrait: { show: false, module: "list" } },
  showList: true,
  showDpad: true,
  showCtl: true,
  controls: "pad", // pad | deck
  showSpeaker: true,
  showMarkup: false,
  showLines: true,
  spellCheck: false,
  theme: "woodwork",
  showGlare: false,
  showChassis: false,
});

const ONE_OF = {
  orient: ["auto", "landscape", "portrait"],
  controls: ["pad", "deck"],
  theme: THEMES.map((t) => t.key),
};
const BAY_MODULES = ["map", "treemoji", "list"];

/** The saved settings, checked field by field over the defaults. */
export function loadSettings() {
  const s = defaults();
  let saved;
  try {
    saved = JSON.parse(localStorage.getItem(KEY));
  } catch {
    return s; // no storage (a private window) or a broken save
  }
  if (!saved || typeof saved !== "object") return s;
  for (const [k, v] of Object.entries(s)) {
    if (k === "bays") continue;
    if (ONE_OF[k] ? ONE_OF[k].includes(saved[k]) : typeof saved[k] === typeof v) s[k] = saved[k];
  }
  for (const view of ["landscape", "portrait"]) {
    const b = saved.bays?.[view];
    if (typeof b?.show === "boolean") s.bays[view].show = b.show;
    if (BAY_MODULES.includes(b?.module)) s.bays[view].module = b.module;
  }
  return s;
}

/** Remember the settings, with the theme's mat colour for app.html to paint
    before the page has loaded (so a dark theme doesn't flash light). */
export function saveSettings(s) {
  const mat = THEMES.find((t) => t.key === s.theme)?.mat[0];
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...s, mat }));
  } catch {
    // no storage: the settings just aren't remembered
  }
}
