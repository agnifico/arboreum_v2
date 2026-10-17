// Configure → LOOK. A theme colours the whole console: one colour per module
// role and the accent (signal: the A key, LEDs, latches, the nameplate
// stripe). Themes only, no per-module picks: the contrast between modules is
// designed into each theme. The keys and the screens' glass stay the same in
// every theme. See CONCEPT.md, "Visual pass".
//
// Roles: plate (nameplate, and the Configure panel), cam, scr (screen and
// list bodies), dpad, ctl (control pad), bay (Map viewer and Treemoji share
// it), spk (speaker), deck (Format deck).

const ROLES = ["plate", "cam", "scr", "dpad", "ctl", "bay", "spk", "deck"];

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

/** The accent and its shades (a press's side, a key's lit and shaded edges). */
function accent(c) {
  return {
    signal: c,
    "signal-side": mix(c, "#000000", 0.32),
    "signal-hi": mix(c, "#ffffff", 0.3),
    "signal-lo": mix(c, "#000000", 0.12),
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
    // Bright blocks, one colour each (a modular gadget kit).
    key: "arcade",
    label: "ARCADE",
    roles: { plate: "#f4f2ec", cam: "#e8e6e1", scr: "#24272b", dpad: "#2f6bd8", ctl: "#f5c62b", bay: "#4cb35e", spk: "#7a5bd8", deck: "#e8463d" },
    accent: "#ff4f1f",
    mat: ["#f2f0ea", "#e0ddd4"],
  },
  {
    // One warm colour, top to bottom, on a dark mat (a flip-open handheld).
    key: "handheld",
    label: "HANDHELD",
    roles: { plate: "#f3c15e", cam: "#efb951", scr: "#e9ad45", dpad: "#e4a43c", ctl: "#f1bc56", bay: "#f5c66a", spk: "#df9f38", deck: "#5d4a37" },
    accent: "#d8392f",
    mat: ["#262320", "#302c28"],
  },
  {
    // Pastel shells and a deep purple screen.
    key: "sorbet",
    label: "SORBET",
    roles: { plate: "#fbf3e6", cam: "#ffd3c4", scr: "#54457a", dpad: "#7fcfb9", ctl: "#ffe7a1", bay: "#c6b5f7", spk: "#ff8ea2", deck: "#3d3358" },
    accent: "#00a99a",
    mat: ["#f7efe6", "#ebe0d3"],
  },
  {
    // Dark bodies and a cold glow.
    key: "midnight",
    label: "MIDNIGHT",
    roles: { plate: "#2c303b", cam: "#3a3f4c", scr: "#17191f", dpad: "#3d4b92", ctl: "#30343f", bay: "#22414b", spk: "#4b2c43", deck: "#1c1f26" },
    accent: "#2fd0ff",
    mat: ["#121419", "#1a1d24"],
  },
];

/** A theme's swatch for Configure: the plate, three bodies and the accent. */
export const swatch = (t) => [t.roles.plate, t.roles.dpad, t.roles.bay, t.roles.spk].map((r) => (Array.isArray(r) ? r[0] : r)).concat(t.accent);

/** The inline style for the stage: every token the theme sets. */
export function lookStyle(key) {
  const t = THEMES.find((x) => x.key === key) ?? THEMES[0];
  const tokens = { ...accent(t.accent), mat: t.mat[0], "mat-line": t.mat[1] };
  for (const r of ROLES) Object.assign(tokens, body(r, t.roles[r]));
  return Object.entries(tokens)
    .map(([k, v]) => `--${k}: ${v};`)
    .join(" ");
}
