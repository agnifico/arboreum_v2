// Configure → LOOK. A theme colours the whole console: one colour per module
// role and the accent (signal: the A key, LEDs, latches, the nameplate
// stripe). Themes only, no per-module picks: the contrast between modules is
// designed into each theme. The keys and the screens' glass stay the same in
// every theme. See CONCEPT.md, "Visual pass".
//
// Roles: plate (nameplate, and the Configure panel), cam, scr (screen), lst
// (List module; the screen's colour unless a theme sets it), dpad, ctl
// (control pad), bay (Map viewer and Treemoji share it), spk (speaker), deck
// (Format deck).

const ROLES = ["plate", "cam", "scr", "lst", "dpad", "ctl", "bay", "spk", "deck"];

const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const toHex = (c) => "#" + c.map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");
const mix = (a, b, t) => toHex(hex(a).map((v, i) => v + (hex(b)[i] - v) * t));
const lum = (h) => {
  const [r, g, b] = hex(h).map((v) => {
    v /= 255;
    return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

/** A body colour's tokens: its highlight and side, and the ink its etched
    labels take (dark on a light body, light on a dark one). A hand-tuned
    spec is [base, hi, side, ink?] and keeps the softer inks of the original
    materials; a single colour is a generated one, and saturated bodies need
    a firmer ink to stay readable. */
function body(role, spec) {
  const tuned = Array.isArray(spec);
  const [base, hi, side, ink] = tuned ? spec : [spec];
  const light = ink ? ink === "dark" : lum(base) > 0.3;
  const inks = tuned
    ? light
      ? ["rgba(30, 32, 31, 0.55)", "0 1px 0 rgba(255, 255, 255, 0.45)"]
      : ["rgba(210, 214, 210, 0.45)", "0 -1px 0 rgba(0, 0, 0, 0.6)"]
    : light
      ? ["rgba(22, 23, 22, 0.66)", "0 1px 0 rgba(255, 255, 255, 0.3)"]
      : ["rgba(255, 255, 255, 0.72)", "0 -1px 0 rgba(0, 0, 0, 0.35)"];
  return {
    [role]: base,
    [`${role}-hi`]: hi ?? mix(base, "#ffffff", light ? 0.35 : 0.1),
    [`${role}-side`]: side ?? mix(base, "#000000", light ? 0.28 : 0.5),
    [`${role}-ink`]: inks[0],
    [`${role}-ink-hard`]: light ? "#2b2d2c" : "#f1f0ea",
    [`${role}-ink-sh`]: inks[1],
    [`${role}-rim`]: light ? "0.55" : "0.14",
  };
}

/** The accent and its shades (a press's side, a key's lit and shaded edges),
    and its two inks: the letter on an accent face (A, pips, a lit tab) and
    the accent printed on a body (the model number). A light accent takes a
    dark letter; a theme can set either ink, as HANDHELD's white A with a
    red letter does. */
function accent(c, { ink, text } = {}) {
  const light = lum(c) > 0.45;
  return {
    signal: c,
    "signal-side": mix(c, "#000000", light ? 0.22 : 0.32),
    "signal-hi": mix(c, "#ffffff", 0.3),
    "signal-lo": mix(c, "#000000", light ? 0.06 : 0.12),
    "signal-ink": ink ?? (light ? "#1f1c17" : "#fff3ea"),
    "signal-text": text ?? c,
  };
}

// WORKSHOP keeps today's exact colours (hand-tuned highlights and sides).
const BONE = ["#e6e0d0", "#f4f0e4", "#b7ae98"];
const ALU = ["#c8ccc8", "#e6e9e6", "#8b908c"];
const GRAPHITE = ["#2d302f", "#3b3f3d", "#171918"];

export const THEMES = [
  {
    key: "workshop",
    label: "WORKSHOP",
    roles: { plate: BONE, cam: ALU, scr: GRAPHITE, dpad: ["#6d8756", "#87a26d", "#4a5e3a", "dark"], ctl: BONE, bay: ALU, spk: GRAPHITE, deck: GRAPHITE },
    accent: "#ff6a1a",
    mat: ["#ebe8e0", "#d6d1c4"],
  },
  {
    // White bodies, black for the screen and speaker, one blue (studio gear).
    key: "studio",
    label: "STUDIO",
    roles: { plate: "#f3f2ee", cam: "#e9e8e3", scr: "#1d1d1f", dpad: "#ecebe6", ctl: "#f3f2ee", bay: "#e9e8e3", spk: "#1d1d1f", deck: "#1d1d1f" },
    accent: "#2f5cff",
    mat: ["#e4e3df", "#d3d2cc"],
  },
  {
    // Black bodies, white for the camera, D-pad and bay, a volt accent.
    key: "carbon",
    label: "CARBON",
    roles: { plate: "#1c1c1d", cam: "#ecebe6", scr: "#161617", dpad: "#ecebe6", ctl: "#232324", bay: "#ecebe6", spk: "#1c1c1d", deck: "#161617" },
    accent: "#c8f53a",
    mat: ["#2a2a2b", "#323233"],
  },
  {
    // A cabinet's primaries: a red marquee, a blue screen bezel, a black
    // control panel and a yellow accent.
    key: "arcade",
    label: "ARCADE",
    roles: { plate: "#d8343a", cam: "#f2ede1", scr: "#2547b0", dpad: "#24252b", ctl: "#24252b", bay: "#f2ede1", spk: "#d8343a", deck: "#24252b" },
    accent: "#ffc62e",
    mat: ["#efebe1", "#ddd7c9"],
  },
  {
    // One warm colour, top to bottom, on a dark mat (a flip-open handheld);
    // a white A with a red letter.
    key: "handheld",
    label: "HANDHELD",
    roles: { plate: "#f3c15e", cam: "#efb951", scr: "#e9ad45", dpad: "#e4a43c", ctl: "#f1bc56", bay: "#f5c66a", spk: "#df9f38", deck: "#5d4a37" },
    accent: ["#fbf6ea", { ink: "#d8392f", text: "#c4362d" }],
    mat: ["#262320", "#302c28"],
  },
  {
    // Pastel shells around a deep purple screen; white on the camera and the
    // control pad gives the colours room.
    key: "sorbet",
    label: "SORBET",
    roles: { plate: "#ffc9b6", cam: "#fbf5ec", scr: "#54457a", dpad: "#7fcfb9", ctl: "#fbf5ec", bay: "#c6b5f7", spk: "#ff8ea2", deck: "#3d3358" },
    accent: "#00a99a",
    mat: ["#f7efe6", "#ebe0d3"],
  },
  {
    // Dark bodies and a cold glow; the colour crosses the console (plum
    // camera and bay, teal list and speaker, an indigo D-pad).
    key: "midnight",
    label: "MIDNIGHT",
    roles: { plate: "#2c303b", cam: "#4b2c43", scr: "#202a45", lst: "#22414b", dpad: "#3d4b92", ctl: "#30343f", bay: "#4b2c43", spk: "#22414b", deck: "#1c1f26" },
    accent: "#2fd0ff",
    mat: ["#121419", "#1a1d24"],
  },
];

// An accent is a colour, or [colour, { ink, text }].
const accentOf = (t) => (Array.isArray(t.accent) ? t.accent : [t.accent]);

/** A theme's swatch for Configure: the plate, four bodies and the accent. */
export const swatch = (t) =>
  [t.roles.plate, t.roles.scr, t.roles.dpad, t.roles.bay, t.roles.spk].map((r) => (Array.isArray(r) ? r[0] : r)).concat(accentOf(t)[0]);

/** The inline style for the stage: every token the theme sets. */
export function lookStyle(key) {
  const t = THEMES.find((x) => x.key === key) ?? THEMES[0];
  const tokens = { ...accent(...accentOf(t)), mat: t.mat[0], "mat-line": t.mat[1] };
  for (const r of ROLES) Object.assign(tokens, body(r, t.roles[r] ?? t.roles.scr));
  return Object.entries(tokens)
    .map(([k, v]) => `--${k}: ${v};`)
    .join(" ");
}
