// The ARB-16A's shared state: one place every module reads from and every
// input (on-screen keys or the keyboard) goes through. See CONCEPT.md, "Inputs".
import { getContext, setContext } from "svelte";
import { liveQuery } from "dexie";
import { db } from "$lib/db.js";
import { v4 as uuidv4 } from "uuid";
import { normalizeBackup } from "$lib/backup.js";
import { COLS, ROWS } from "./garden.js";
import { TREES } from "./trees.js";
import { WELCOME, WELCOME_ID } from "./welcome.js";
import * as media from "./media.js";

const KEY = "arb-device";
export const provideDevice = (device) => setContext(KEY, device);
export const useDevice = () => getContext(KEY);

export const BUTTONS = ["up", "down", "left", "right", "a", "b", "start", "select"];

export const SORTS = [
  { key: "saved", label: "SAVED" },
  { key: "az", label: "A–Z" },
  { key: "made", label: "MADE" },
];

const time = (v) => (v ? new Date(v).getTime() || 0 : 0);

/** "now", "5m", "2h", "3d", "2w", "4mo", "1y" */
export function ago(v, now = Date.now()) {
  const s = Math.max(0, (now - time(v)) / 1000);
  if (s < 60) return "now";
  const steps = [["m", 60], ["h", 60], ["d", 24], ["w", 7], ["mo", 4.35], ["y", 12]];
  let n = s / 60;
  for (let i = 0; i < steps.length; i++) {
    const next = steps[i + 1];
    if (!next || n < next[1]) return `${Math.floor(n)}${steps[i][0]}`;
    n /= next[1];
  }
}

// Keyboard ↔ hardware. Outside the editor every key maps; inside it only Esc
// (B), Ctrl/⌘ S (save), Ctrl/⌘ K (Start) and Ctrl/⌘ L (Select) do, so typing
// stays normal. Tab stays free for moving keyboard focus.
export const KEYMAP = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
  Enter: "a",
  " ": "a",
  a: "a",
  A: "a",
  Escape: "b",
  b: "b",
  B: "b",
};
// Space and the letters A / B are only A and B where nothing is typed: the
// list, the map, the drawer and the menus (never while writing a note).
const LOOSE_KEYS = new Set([" ", "a", "A", "b", "B"]);

export class Device {
  /** Keys currently lit, so keyboard presses show on the hardware too. */
  lit = $state(Object.fromEntries(BUTTONS.map((b) => [b, false])));
  /** Which part of the device has the D-pad: "list", "editor", "bay" (the
      module in the bay: Map viewer or Treemoji), "drawer" (the screen's
      slide-out) or "image" (arranging the note's images). */
  focus = $state("list");
  /** Notes as stored (the app's IndexedDB), kept live. */
  raw = $state.raw([]);
  loaded = $state(false);
  sort = $state("saved");
  /** Selection follows the note (its noteid), not the row number. */
  selectedId = $state(null);
  /** Short status message on the screen, e.g. "SAVED ✓". */
  message = $state("");
  /**
   * Something on top of the current screen:
   *   { kind: "menu", title, items: [{ label, run }], index }
   *   { kind: "confirm", title, text, yes, no, onYes, onNo }
   */
  overlay = $state(null);
  /** Landscape has a List module; in portrait the list is a full screen. */
  hasListModule = $state(true);

  // --- Editing ---
  /** Set by the screen's editor: caret moves, commands, current HTML. */
  editorApi = null;
  /** Editing a note that hasn't been saved yet. */
  isNew = $state(false);
  /** The note open in the editor ("new" before its first save). Separate
      from the list selection, so live list updates never swap it out. */
  editingId = $state(null);
  draftTitle = $state("");
  /** The editor's current HTML and what it was when loaded or last saved. */
  html = $state("");
  /** The note's tree and plot, part of the draft until saved. */
  draftIcon = $state(null);
  draftPlot = $state(null); // [x, y] or null
  baseline = $state.raw({ title: "", html: "", icon: null, plot: null });
  /** What the bay holds: "map", "treemoji", "list" or null (empty). Set
      through slot(), from Configure. */
  bay = $state("map");
  /** Map cursor, shared by the Map viewer and the drawer's plot picker. */
  cursor = $state({ x: 12, y: 7 });
  /** The screen's slide-out drawer: which section, and the tree under the D-pad. */
  drawerSection = $state("tree"); // "tree" | "plot"
  /** What the bay module's screen shows while it has the D-pad. */
  bayMode = $state("plot"); // "plot" (Map viewer) | "tree" (either)
  treeIndex = $state(0);
  /** Trees a row in the tree grid on show (TreeGrid reports it): 4, or 6 on a wide, short screen. */
  treeCols = $state(4);
  /** Formatting under the caret (for lit format keys) and the word count. */
  active = $state({});
  words = $state(0);
  /** The last thing Treemoji might react to ({ kind, at }): "mark:bold",
      "block:h1", "undo", "redo". Marks and undo come from the editor, so
      every route (keys, strip, deck, shortcuts) counts. */
  buddyEvent = $state.raw(null);
  /** Configure → Show markup: draw markers (#, **, _) instead of styling. */
  showMarkup = $state(false);
  showLines = $state(true); // Configure: line numbers in the gutter
  spellCheck = $state(false); // Configure: the browser's spell check (off by default)
  /** Bottom strip page: "format" or "details". */
  stripPage = $state("format");
  /** What sits in the control slot: the control pad ("pad") or the Format
      deck ("deck"). Its edge switch, or Configure, swaps them. */
  controls = $state("pad");
  /** Whether the control slot is filled at all (set by the page from Configure). */
  ctlSlotted = $state(true);
  get hasDeck() {
    return this.ctlSlotted && this.controls === "deck";
  }
  /** The strip's pages: with the Format deck slotted, its format keys step aside. */
  get stripPages() {
    return this.hasDeck ? ["details"] : ["format", "details"];
  }
  swapControls() {
    this.controls = this.controls === "pad" ? "deck" : "pad";
  }

  // --- Images (the Camera) ---
  /** The shown note's images: its layout ({ edge, images }) and a URL each. */
  media = $state(media.emptyLayout());
  mediaUrls = $state({});
  #mediaKey = null; // whose images are loaded
  /** The image under the D-pad (focus "image"), and the layout B goes back to. */
  imageSel = $state(null);
  #imageBefore = null;
  /** The Camera's LED: on while an image is coming in. */
  camBusy = $state(false);
  /** Set by the editor: the line (block) the caret is on, and how many there are. */
  caretLine = 1;
  lineCount = 1;

  #timers = {};
  #msgTimer;

  /** The notes in list order, shaped for display. */
  get notes() {
    const list = this.raw.map((n) => ({
      ...n,
      title: n.title?.trim() || "untitled",
      tree: n.icon || "/Tree2.png",
      when: ago(n.updatedAt ?? n.createdAt),
    }));
    if (this.sort === "az") {
      return list.sort((a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: "base", numeric: true }));
    }
    const key = this.sort === "made" ? "createdAt" : "updatedAt";
    return list.sort((a, b) => time(b[key] ?? b.createdAt) - time(a[key] ?? a.createdAt));
  }

  get index() {
    const i = this.notes.findIndex((n) => n.noteid === this.selectedId);
    return i < 0 ? 0 : i;
  }
  set index(i) {
    this.selectedId = this.notes[i]?.noteid ?? null;
  }

  get note() {
    return this.notes[this.index];
  }

  /** A note is open (the editor, map or drawer may have the D-pad). */
  get editing() {
    return this.editingId != null;
  }

  /** The note as stored (raw title, not the display "untitled"). */
  get stored() {
    const id = this.editing ? this.editingId : this.selectedId;
    return this.raw.find((n) => n.noteid === id);
  }

  get dirty() {
    if (!this.editing) return false;
    const b = this.baseline;
    return (
      this.draftTitle !== b.title ||
      this.html !== b.html ||
      this.draftIcon !== b.icon ||
      String(this.draftPlot) !== String(b.plot)
    );
  }

  setBaseline(html) {
    this.baseline = { title: this.draftTitle, html, icon: this.draftIcon, plot: this.draftPlot };
  }

  /** Other notes' trees (everything except the open note). */
  get otherPlots() {
    const out = [];
    for (const n of this.raw) {
      if (this.editing && n.noteid === this.editingId) continue;
      if (n.mapX != null && n.mapY != null) out.push({ x: n.mapX, y: n.mapY, icon: n.icon || "/Tree2.png", title: n.title?.trim() || "untitled", noteid: n.noteid });
    }
    return out;
  }

  #taken(x, y) {
    return this.otherPlots.some((p) => p.x === x && p.y === y);
  }

  /** Where the open note will grow: its plot, or (with the Map viewer
      slotted) the free plot under the cursor, which saving plants. */
  get pendingPlot() {
    if (!this.editing) return null;
    if (this.draftPlot) return this.draftPlot;
    if (this.hasMapViewer && !this.#taken(this.cursor.x, this.cursor.y)) return [this.cursor.x, this.cursor.y];
    return null;
  }

  /** Every tree for the maps; the open note shows at its pending plot
      (as a ghost until it's actually planted or saved). */
  get plots() {
    const out = this.otherPlots;
    const p = this.pendingPlot;
    if (p) out.push({ x: p[0], y: p[1], icon: this.draftIcon || "/Tree2.png", mine: true, ghost: !this.draftPlot, title: this.draftTitle || "untitled" });
    return out;
  }

  /** Who (if anyone) is planted at the cursor. */
  get atCursor() {
    return this.plots.find((p) => p.x === this.cursor.x && p.y === this.cursor.y) ?? null;
  }

  /** Move the cursor off a taken plot to the nearest free one. */
  #toFreePlot() {
    const { x: cx, y: cy } = this.cursor;
    if (!this.#taken(cx, cy)) return;
    for (let r = 1; r < Math.max(COLS, ROWS); r++) {
      for (let dy = -r; dy <= r; dy++) {
        for (let dx = -r; dx <= r; dx++) {
          if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
          const x = cx + dx, y = cy + dy;
          if (x >= 0 && y >= 0 && x < COLS && y < ROWS && !this.#taken(x, y)) {
            this.cursor = { x, y };
            return;
          }
        }
      }
    }
  }

  /** What still needs doing for the open note (drives the red "!"). */
  get missing() {
    if (!this.editing) return [];
    return [!this.draftIcon && "tree", !this.pendingPlot && "plot"].filter(Boolean);
  }

  get hasMapViewer() {
    return this.bay === "map";
  }
  /** Who handles each job: a slotted module ("bay") or the drawer. The Map
      viewer does tree and plot; Treemoji does the tree. */
  get treeInBay() {
    return this.bay === "map" || this.bay === "treemoji";
  }

  /** What the drawer stands in for: the jobs no slotted module handles. */
  get drawerSections() {
    return [!this.treeInBay && "tree", !this.hasMapViewer && "plot"].filter(Boolean);
  }

  /** Slot a module into the bay (or empty it). If the D-pad was on
      something that just left, it goes back to the note. */
  slot(module) {
    this.bay = module;
    if (this.focus === "bay" && !(this.bayMode === "tree" ? this.treeInBay : this.hasMapViewer)) this.focus = this.editing ? "editor" : "list";
    if (this.focus === "drawer" && !this.drawerSections.includes(this.drawerSection)) {
      if (this.drawerSections.length) this.drawerSection = this.drawerSections[0];
      else this.closeDrawer();
    }
  }

  /** Choose a tree: on the module that does it, or in the drawer. */
  chooseTree() {
    return this.treeInBay ? this.enterBay("tree") : this.openDrawer("tree");
  }

  /** The red "!": tap it to go where the missing thing is handled. */
  resolveMissing() {
    const m = this.missing;
    if (!m.length) return;
    if (m.includes("tree")) return this.chooseTree();
    if (this.hasMapViewer) return this.enterBay("plot");
    this.openDrawer("plot");
  }

  openDrawer(section = "tree") {
    if (!this.editing) return;
    const sections = this.drawerSections;
    if (!sections.length) return;
    this.drawerSection = sections.includes(section) ? section : sections[0];
    const i = TREES.findIndex((t) => t.src === this.draftIcon);
    this.treeIndex = i < 0 ? 0 : i;
    if (this.draftPlot) this.cursor = { x: this.draftPlot[0], y: this.draftPlot[1] };
    this.focus = "drawer";
  }

  closeDrawer() {
    this.focus = "editor";
  }

  pickTree(i = this.treeIndex) {
    this.treeIndex = i;
    this.draftIcon = TREES[i].src;
    this.say(TREES[i].name.toUpperCase());
    if (this.focus === "bay") return void (this.focus = "editor");
    // Go on to the plot if it's also missing and handled here; else done.
    if (!this.draftPlot && this.drawerSections.includes("plot")) this.drawerSection = "plot";
    else this.closeDrawer();
  }

  #drawerInput = (button) => {
    const sections = this.drawerSections;
    if (button === "b") return this.closeDrawer();
    if (button === "start" && sections.length > 1) {
      this.drawerSection = this.drawerSection === "tree" ? "plot" : "tree";
      return;
    }
    if (this.drawerSection === "plot") {
      const d = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }[button];
      if (d) this.moveCursor(...d);
      if (button === "a") this.plant();
      return;
    }
    const n = TREES.length;
    const step = { left: -1, right: 1, up: -this.treeCols, down: this.treeCols }[button];
    if (step) this.treeIndex = Math.max(0, Math.min(n - 1, this.treeIndex + step));
    if (button === "a") this.pickTree();
  };

  get sortLabel() {
    return SORTS.find((x) => x.key === this.sort).label;
  }

  /** Where the editor puts the caret the next time it takes focus. */
  caretAt = "end";

  #markReady;
  /** Resolves once notes are loaded (and the welcome note added, if due). */
  ready = new Promise((r) => (this.#markReady = r));

  /** Start reading notes; returns a stop function. Browser only. */
  start() {
    const sub = liveQuery(() => db.notes.toArray()).subscribe({
      next: (rows) => {
        this.raw = rows;
        const first = !this.loaded;
        this.loaded = true;
        if (first) this.#seedWelcome().finally(() => this.#markReady());
        if (!rows.some((n) => n.noteid === this.selectedId)) this.selectedId = this.notes[0]?.noteid ?? null;
      },
      error: (e) => console.error("Couldn't read notes:", e),
    });
    return () => sub.unsubscribe();
  }

  /** Add the welcome note once per browser (deleting it doesn't bring it back). */
  async #seedWelcome() {
    const FLAG = "JXF26-ARB-16A-welcome";
    try {
      if (localStorage.getItem(FLAG)) return;
      localStorage.setItem(FLAG, "1");
    } catch {
      return; // no storage: don't risk adding it on every visit
    }
    if (this.raw.some((n) => n.noteid === WELCOME_ID)) return;
    // Plant it on a free plot near the middle of the map.
    this.cursor = { x: 12, y: 7 };
    this.#toFreePlot();
    const now = new Date();
    const note = { ...WELCOME, createdAt: now, updatedAt: now, mapX: this.cursor.x, mapY: this.cursor.y };
    try {
      note.id = await db.notes.add(note);
      if (!this.raw.some((n) => n.noteid === WELCOME_ID)) this.raw = [...this.raw, note];
      this.selectedId = WELCOME_ID;
    } catch (error) {
      console.error("Couldn't add the welcome note:", error);
    }
  }

  setSort(key) {
    this.sort = key;
    this.say(`SORT · ${this.sortLabel}`);
  }

  cycleSort(step = 1) {
    const i = SORTS.findIndex((x) => x.key === this.sort);
    this.setSort(SORTS[(i + step + SORTS.length) % SORTS.length].key);
  }

  /** What A, B and Start do right now (the screen's context strip). */
  get labels() {
    const o = this.overlay;
    if (o?.kind === "menu") return { a: "CHOOSE", b: "CLOSE", start: "CLOSE", select: "—" };
    if (o?.kind === "confirm") return { a: o.yes, b: o.no, start: o.alt?.label ?? "—", select: "—" };
    if (this.focus === "image") return { a: "DONE", b: "CANCEL", start: "IMAGE", select: "—" };
    if (this.focus === "bay" && this.bayMode === "tree") return { a: "PICK", b: "BACK", start: "—", select: "—" };
    if (this.focus === "bay" || (this.focus === "drawer" && this.drawerSection === "plot")) {
      const at = this.atCursor;
      const other = this.focus === "drawer" ? "TREE" : "—";
      return { a: at && !at.mine ? "TAKEN" : "PLANT", b: this.focus === "drawer" ? "CLOSE" : "BACK", start: other, select: "—" };
    }
    if (this.focus === "drawer") return { a: "PICK", b: "CLOSE", start: this.drawerSections.length > 1 ? "PLOT" : "—", select: "—" };
    if (this.focus === "editor") return { a: "SAVE", b: "NEW", start: "MENU", select: "LIST" };
    if (this.picking) {
      const n = this.pickedNotes.length;
      return { a: this.picked.includes(this.note?.noteid) ? "UNPICK" : "PICK", b: "DONE", start: n ? `DELETE ${n}` : "—", select: "DONE" };
    }
    return { a: "OPEN", b: "NEW", start: "MENU", select: "SELECT NOTES" };
  }

  // Select acts when it's let go, and only if the D-pad wasn't used while it
  // was held: holding Select with the D-pad extends a selection instead.
  selectHeld = $state(false);
  #selectUsed = false;
  selectDown() {
    this.selectHeld = true;
    this.#selectUsed = false;
    this.lit.select = true;
  }
  selectUp({ cancel = false } = {}) {
    if (!this.selectHeld) return;
    this.selectHeld = false;
    this.lit.select = false;
    if (!cancel && !this.#selectUsed) this.press("select");
  }

  // extend: the D-pad grows a selection (Select held, or Shift on the keyboard).
  #extend = false;
  press(button, { extend = false } = {}) {
    const arrow = ["up", "down", "left", "right"].includes(button);
    if (this.selectHeld && arrow) this.#selectUsed = true;
    this.#extend = arrow && (extend || this.selectHeld);
    this.light(button);
    if (this.overlay?.kind === "menu") return this.#menuInput(button);
    if (this.overlay?.kind === "confirm") return this.#confirmInput(button);
    if (this.focus === "bay") return this.#bayInput(button);
    if (this.focus === "image") return this.#imageInput(button);
    if (this.focus === "drawer") return this.#drawerInput(button);
    if (this.focus === "editor") return this.#editorInput(button);
    return this.#listInput(button);
  }

  light(button) {
    this.lit[button] = true;
    clearTimeout(this.#timers[button]);
    this.#timers[button] = setTimeout(() => (this.lit[button] = false), 140);
  }

  say(text, ms = 1600) {
    this.message = text;
    clearTimeout(this.#msgTimer);
    this.#msgTimer = setTimeout(() => (this.message = ""), ms);
  }

  // --- Screens --------------------------------------------------------

  /** One Start menu, always in the same order; only what applies is shown.
      A row with `choices` holds a few related actions side by side: left and
      right pick one, A (or a click on it) runs it. */
  openMenu() {
    const e = this.editing;
    const has = !!this.note;
    const imgs = e && this.media.images.length > 0;
    const items = [
      e && { label: "SAVE", run: () => this.save() },
      !e && has && { label: "OPEN NOTE", run: () => this.open() },
      !e && has && { label: "SELECT NOTES", run: () => this.startPicking() },
      { label: "NEW NOTE", run: () => this.newNote() },
      e && { label: "CHOOSE TREE", run: () => this.chooseTree() },
      // GO TO hands the D-pad to the images (to move, replace or remove them).
      imgs && { label: "IMAGES", choices: [{ label: "ADD", run: () => this.pickImages() }, { label: "GO TO", run: () => this.goToImages() }], pick: 0 },
      e && !imgs && { label: "ADD IMAGE", run: () => this.pickImages() },
      imgs && { label: () => `IMAGE EDGE ◂ ${this.media.edge.toUpperCase()} ▸`, run: () => this.cycleEdge(), cycle: (d) => this.cycleEdge(d) },
      // Left/right rotate the sort without closing the menu.
      { label: () => `SORT ◂ ${this.sortLabel} ▸`, run: () => this.cycleSort(), cycle: (d) => this.cycleSort(d) },
      (e || has) && { label: "DELETE NOTE", run: () => this.askDelete() },
      e && { label: "CLOSE NOTE", run: () => this.leave() },
      { label: "BACKUP", choices: [{ label: "SAVE", run: () => this.saveBackup() }, { label: "LOAD", run: () => this.loadBackup() }], pick: 0 },
      // A way out that doesn't need B (it closes like B and Start do).
      { label: "CLOSE MENU", run: () => {} },
    ].filter(Boolean);
    this.overlay = { kind: "menu", title: "MENU", hint: "CTRL/⌘ K", items, index: 0 };
  }

  /** A yes/no box; `alt` adds a third choice on Start ({ label, run }). */
  confirm({ title, text, yes, no, onYes = () => {}, onNo = () => {}, alt = null, icon = null }) {
    this.overlay = { kind: "confirm", title, text, yes, no, onYes, onNo, alt, icon };
  }

  /** Save the open note (creates it on first save). Returns true on success. */
  async save({ quiet = false } = {}) {
    if (!this.editing) return false;
    const html = this.editorApi?.getHTML() ?? this.html;
    const title = this.draftTitle.trim();
    const plot = this.pendingPlot;
    const data = {
      title,
      text: html,
      icon: this.draftIcon || "/Tree2.png",
      mapX: plot ? plot[0] : null,
      mapY: plot ? plot[1] : null,
      updatedAt: new Date(),
    };
    try {
      if (this.isNew) {
        const note = { noteid: uuidv4(), createdAt: new Date(), ...data };
        note.id = await db.notes.add(note);
        // Show it straight away, unless the live query got there first.
        if (!this.raw.some((n) => n.noteid === note.noteid)) this.raw = [...this.raw, note];
        this.isNew = false;
        this.editingId = note.noteid;
        this.selectedId = note.noteid;
      } else {
        const stored = this.stored;
        await db.notes.update(stored.id, data);
        this.raw = this.raw.map((n) => (n.noteid === stored.noteid ? { ...n, ...data } : n));
      }
      this.draftTitle = title;
      this.draftIcon = data.icon;
      this.draftPlot = plot;
      this.setBaseline(html);
      if (!quiet) this.say("SAVED ✓");
      return true;
    } catch (error) {
      console.error("Couldn't save the note:", error);
      this.say("COULDN'T SAVE · TRY AGAIN", 3000);
      return false;
    }
  }

  async deleteNote(target = this.stored) {
    const stored = target && this.raw.find((n) => n.noteid === target.noteid);
    if (!stored) return;
    const i = this.index;
    try {
      await db.notes.delete(stored.id);
    } catch (error) {
      console.error("Couldn't delete the note:", error);
      return this.say("COULDN'T DELETE", 3000);
    }
    this.raw = this.raw.filter((n) => n.noteid !== stored.noteid);
    media.dropNote(stored.noteid); // its images go with it
    // Only leave the editor if the deleted note is the one that's open.
    if (this.editingId === stored.noteid) {
      this.isNew = false;
      this.editingId = null;
      this.focus = "list";
      this.editorApi?.reload();
    }
    if (this.selectedId === stored.noteid) this.index = Math.min(i, this.notes.length - 1);
    this.say(`DELETED “${stored.title?.trim() || "untitled"}”`);
  }

  /** Download every note as a JSON backup (same format as the classic app). */
  async saveBackup() {
    const all = await db.notes.toArray();
    const blob = new Blob([JSON.stringify(all, null, 2)], { type: "application/json" });
    const a = Object.assign(document.createElement("a"), {
      href: URL.createObjectURL(blob),
      download: `arboreum-backup-${new Date().toISOString().slice(0, 10)}.json`,
    });
    document.body.append(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(a.href);
    this.say(`BACKUP SAVED · ${all.length}`);
  }

  /** Pick a backup file, confirm, then replace the notes in one transaction. */
  loadBackup() {
    const input = Object.assign(document.createElement("input"), { type: "file", accept: ".json,application/json" });
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      let parsed;
      try {
        parsed = normalizeBackup(JSON.parse(await file.text())).notes;
      } catch {
        parsed = [];
      }
      if (!parsed.length) return this.say("NOT AN ARBOREUM BACKUP", 3000);
      this.confirm({
        title: "LOAD BACKUP?",
        text: `Replace the notes in this browser with ${parsed.length} from the backup?`,
        yes: "REPLACE",
        no: "CANCEL",
        onYes: async () => {
          try {
            await db.transaction("rw", db.notes, async () => {
              await db.notes.clear();
              await db.notes.bulkAdd(parsed);
            });
            this.selectedId = null;
            this.say(`LOADED · ${parsed.length}`);
          } catch (error) {
            console.error("Couldn't load the backup:", error);
            this.say("COULDN'T LOAD · NOTHING CHANGED", 3000);
          }
        },
      });
    };
    input.click();
  }
  /** Open the selected note for editing. */
  open() {
    if (!this.note) return;
    this.stopPicking();
    this.isNew = false;
    this.editingId = this.note.noteid;
    const n = this.raw.find((x) => x.noteid === this.editingId);
    this.draftTitle = n?.title ?? "";
    this.draftIcon = n?.icon ?? null;
    this.draftPlot = n?.mapX != null && n?.mapY != null ? [n.mapX, n.mapY] : null;
    if (this.draftPlot) this.cursor = { x: this.draftPlot[0], y: this.draftPlot[1] };
    else this.#toFreePlot();
    this.setBaseline(this.html);
    this.focus = "editor";
  }

  /** Is the open note a brand-new one with nothing in it yet? */
  isBlank() {
    return this.isNew && !this.draftTitle.trim() && /^(<p><\/p>)?$/.test(this.html) && !this.draftIcon && !this.draftPlot;
  }

  /** Close the open note, saving it if it changed (a blank new note is just
      dropped). Leaving a note always keeps your work. */
  async closeCurrent() {
    if (!this.editing) return { ok: true, saved: false };
    const title = this.draftTitle.trim() || "untitled";
    if (!this.dirty || this.isBlank()) return { ok: true, saved: false };
    const ok = await this.save({ quiet: true });
    return { ok, saved: ok, title };
  }

  #leaving = null;
  /** The page is going away (hidden, app switch, tab closed): keep the draft.
      Phones often skip beforeunload, so this is the real guard. Hidden and
      pagehide can fire together; one save covers both, so a new note isn't
      added twice. */
  saveOnLeave() {
    if (!this.dirty || this.isBlank()) return;
    this.#leaving ??= this.save({ quiet: true }).finally(() => (this.#leaving = null));
  }

  /** B: save and close the open note, then start a new one. */
  async newNote() {
    const closed = await this.closeCurrent();
    if (!closed.ok) return;
    this.stopPicking();
    this.isNew = true;
    this.editingId = "new";
    this.draftTitle = "";
    this.draftIcon = null;
    this.draftPlot = null;
    this.#toFreePlot();
    this.focus = "editor";
    this.editorApi?.reload();
    this.say(closed.saved ? `SAVED “${closed.title}” · NEW NOTE` : "NEW NOTE", 2400);
  }

  /** Save and close the open note, back to the list. */
  async leave() {
    const closed = await this.closeCurrent();
    if (!closed.ok) return;
    this.#toList();
    if (closed.saved) this.say(`SAVED “${closed.title}”`);
  }

  /** Open another note from the list while editing: the current one is saved first. */
  async switchTo(i) {
    const target = this.notes[i]?.noteid;
    if (!target || target === this.editingId) return;
    const closed = await this.closeCurrent();
    if (!closed.ok) return;
    this.#toList();
    this.selectedId = target;
    this.open();
    this.editorApi?.focusEnd(); // ready to type, as if it had been opened with A
    if (closed.saved) this.say(`SAVED “${closed.title}”`);
  }

  /** A tree tapped on the map: open its note, as B opens a new one (the
      open note is saved first). */
  openNote(noteid) {
    const i = this.notes.findIndex((n) => n.noteid === noteid);
    if (i < 0) return;
    if (this.editing) return this.switchTo(i);
    this.index = i;
    this.open();
    this.editorApi?.focusEnd();
  }

  // --- The bay module: plant the open note's tree, or choose it ---------
  /** Hand the D-pad to the bay module: its map ("plot") or tree grid ("tree"). */
  enterBay(mode = "plot", at = null) {
    if (!this.editing) return this.say("OPEN A NOTE FIRST");
    if (mode === "tree" ? !this.treeInBay : !this.hasMapViewer) return;
    this.bayMode = mode;
    if (mode === "tree") {
      const t = TREES.findIndex((x) => x.src === this.draftIcon);
      this.treeIndex = t < 0 ? 0 : t;
    } else if (at) this.cursor = at; // a tapped tile: the cursor goes where you pointed
    else if (this.draftPlot) this.cursor = { x: this.draftPlot[0], y: this.draftPlot[1] };
    this.focus = "bay";
  }
  /** The bay module's own keys (MOVE, TREE): press to enter, press again to leave (as B). */
  toggleBay(mode) {
    if (this.focus === "bay" && this.bayMode === mode) return this.#bayInput("b");
    this.enterBay(mode);
  }

  /** Treemoji's ◀ ▶: flip straight through the trees (part of the draft until saved). */
  cycleTree(step) {
    if (!this.editing) return this.say("OPEN A NOTE FIRST");
    const i = TREES.findIndex((t) => t.src === this.draftIcon);
    const next = i < 0 ? (step > 0 ? 0 : TREES.length - 1) : (i + step + TREES.length) % TREES.length;
    this.treeIndex = next;
    this.draftIcon = TREES[next].src;
    this.say(TREES[next].name.toUpperCase());
  }


  moveCursor(dx, dy) {
    this.cursor = {
      x: Math.max(0, Math.min(COLS - 1, this.cursor.x + dx)),
      y: Math.max(0, Math.min(ROWS - 1, this.cursor.y + dy)),
    };
  }

  /** Plant here, if the plot is free. Part of the draft until A saves. */
  plant() {
    if (!this.editing) return this.say("OPEN A NOTE TO PLANT");
    const at = this.atCursor;
    if (at && !at.mine) return this.say(`TAKEN · ${at.title}`, 2200);
    this.draftPlot = [this.cursor.x, this.cursor.y];
    this.focus = "editor";
    this.say(`PLANTED · ${String(this.cursor.x).padStart(2, "0")},${String(this.cursor.y).padStart(2, "0")}`);
  }

  #bayInput = (button) => {
    if (button === "b") {
      // Back, not "move here": the cursor returns to the tree's plot.
      if (this.bayMode === "plot" && this.draftPlot) this.cursor = { x: this.draftPlot[0], y: this.draftPlot[1] };
      return void (this.focus = "editor");
    }
    if (this.bayMode === "tree") {
      const step = { left: -1, right: 1, up: -this.treeCols, down: this.treeCols }[button];
      if (step) this.treeIndex = Math.max(0, Math.min(TREES.length - 1, this.treeIndex + step));
      if (button === "a") this.pickTree();
      return;
    }
    const d = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }[button];
    if (d) this.moveCursor(...d);
    if (button === "a") this.plant();
  };


  // --- Images: the Camera adds them; one edge per note -----------------
  /** Load the images for the note on screen (the editor calls this). */
  async showMedia(key) {
    if (key === this.#mediaKey) return;
    // A new note's first save gives it a real id: still the same note.
    if (this.#mediaKey === "new" && key === this.editingId) return void (this.#mediaKey = key);
    this.#mediaKey = key;
    const { layout, urls } = await media.load(key === "new" || key === "none" ? null : key);
    if (this.#mediaKey !== key) return media.revoke(urls); // moved on meanwhile
    const old = this.mediaUrls;
    this.media = layout;
    this.mediaUrls = urls;
    media.revoke(old);
  }

  /** The Camera (or Start → Add image): choose images, then add them. With
      an image under the D-pad, they replace it instead (one file). */
  pickImages() {
    if (!media.supported()) return this.say("NO IMAGE STORAGE IN THIS BROWSER", 3000);
    if (this.focus === "image") return this.replaceImage();
    const input = Object.assign(document.createElement("input"), { type: "file", accept: "image/*", multiple: true });
    input.onchange = () => input.files?.length && this.addImages([...input.files]);
    input.click();
  }

  /** Swap an image's file for another; it keeps its place (line or order). */
  replaceImage(id = this.imageSel) {
    const old = this.media.images.find((x) => x.id === id);
    if (!old || !media.supported()) return;
    const noteid = this.#mediaKey;
    const input = Object.assign(document.createElement("input"), { type: "file", accept: "image/*" });
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file?.type.startsWith("image/")) return;
      this.camBusy = true;
      try {
        const { entry, url } = await media.add(noteid, file, old.line);
        const i = this.media.images.indexOf(old);
        if (this.#mediaKey !== noteid || i < 0) return void URL.revokeObjectURL(url); // moved on meanwhile
        this.media.images[i] = entry;
        // B goes back to the layout from before: it gets the new file too.
        if (this.#imageBefore) this.#imageBefore.images = this.#imageBefore.images.map((x) => (x.id === id ? { ...entry, line: x.line } : x));
        if (this.imageSel === id) this.imageSel = entry.id;
        URL.revokeObjectURL(this.mediaUrls[id]);
        this.mediaUrls = { ...this.mediaUrls, [entry.id]: url };
        await media.removeFile(noteid, old);
        await this.#saveMedia();
        this.say("IMAGE REPLACED");
      } catch (error) {
        console.error("Couldn't replace the image:", error);
        this.say("COULDN'T REPLACE THE IMAGE", 3000);
      } finally {
        this.camBusy = false;
      }
    };
    input.click();
  }

  /** Store images with the open note (opening or starting one if needed);
      each lands beside the caret's line. */
  async addImages(files) {
    if (!this.editing) {
      if (this.note) this.open();
      else await this.newNote();
    }
    // Images live in the note's folder, so a brand-new note is saved first.
    if (this.isNew && !(await this.save({ quiet: true }))) return;
    const id = this.editingId;
    await this.showMedia(id);
    this.camBusy = true;
    let added = 0;
    for (const file of files) {
      if (!file.type.startsWith("image/")) continue;
      try {
        const { entry, url } = await media.add(id, file, this.caretLine);
        if (this.#mediaKey !== id) break; // the note changed underneath
        this.media.images.push(entry);
        this.mediaUrls = { ...this.mediaUrls, [entry.id]: url };
        added++;
      } catch (error) {
        console.error("Couldn't add the image:", error);
      }
    }
    this.camBusy = false;
    if (!added) return this.say("COULDN'T ADD THE IMAGE", 3000);
    await this.#saveMedia();
    this.say(added > 1 ? `${added} IMAGES ADDED` : "IMAGE ADDED");
  }

  async #saveMedia() {
    const id = this.#mediaKey;
    if (!id || id === "new" || id === "none") return;
    try {
      await media.saveLayout(id, $state.snapshot(this.media));
    } catch (error) {
      console.error("Couldn't save the image layout:", error);
      this.say("COULDN'T SAVE THE IMAGES", 3000);
    }
  }

  cycleEdge(step = 1) {
    const i = media.EDGES.indexOf(this.media.edge);
    this.media.edge = media.EDGES[(i + step + media.EDGES.length) % media.EDGES.length];
    this.#saveMedia();
  }

  get stripEdge() {
    return this.media.edge === "left" || this.media.edge === "right";
  }

  /** Hand the D-pad to an image (a tap on it does this too). */
  selectImage(id) {
    if (!this.editing || !this.media.images.some((x) => x.id === id)) return;
    if (this.focus !== "image") this.#imageBefore = $state.snapshot(this.media);
    this.imageSel = id;
    this.focus = "image";
  }
  /** Start → IMAGES → GO TO: the D-pad moves into the images. On a strip it
      lands on the image nearest the caret's line, otherwise the first. */
  goToImages() {
    const imgs = this.media.images;
    if (!imgs.length) return this.say("NO IMAGES · PRESS THE CAMERA");
    const near = this.stripEdge ? imgs.reduce((a, b) => (Math.abs(b.line - this.caretLine) < Math.abs(a.line - this.caretLine) ? b : a)) : imgs[0];
    this.selectImage(near.id);
  }
  /** Strip: move an image to a line (one line is the unit). */
  setImageLine(id, line) {
    const img = this.media.images.find((x) => x.id === id);
    if (img) img.line = Math.max(1, Math.min(this.lineCount, line));
  }
  /** Scrapbook: move an image to a place in the order. */
  setImageIndex(id, to) {
    const imgs = this.media.images;
    const from = imgs.findIndex((x) => x.id === id);
    if (from < 0) return;
    const [img] = imgs.splice(from, 1);
    imgs.splice(Math.max(0, Math.min(imgs.length, to)), 0, img);
  }
  /** A: keep where the images are now. */
  placeImages() {
    if (this.focus !== "image") return;
    this.#saveMedia();
    this.focus = "editor";
    this.say("IMAGES PLACED");
  }

  askRemoveImage(id = this.imageSel) {
    if (!this.media.images.some((x) => x.id === id)) return;
    this.confirm({
      title: "REMOVE IMAGE?",
      text: "It will be gone from this note. This can't be undone.",
      yes: "REMOVE",
      no: "KEEP",
      onYes: () => this.removeImage(id),
    });
  }

  /** Remove an image now (the confirm comes first: a box, or the ✕ pressed twice). */
  async removeImage(id) {
    const img = this.media.images.find((x) => x.id === id);
    if (!img) return;
    const i = this.media.images.indexOf(img);
    this.media.images.splice(i, 1);
    if (this.#imageBefore) this.#imageBefore.images = this.#imageBefore.images.filter((x) => x.id !== id);
    URL.revokeObjectURL(this.mediaUrls[id]);
    await media.removeFile(this.#mediaKey, img);
    await this.#saveMedia();
    const next = this.media.images[Math.min(i, this.media.images.length - 1)];
    if (next) this.imageSel = next.id;
    else this.focus = "editor";
    this.say("IMAGE REMOVED");
  }

  /** Start with an image under the D-pad: what can be done to it. */
  #imageMenu() {
    const items = [
      { label: "REPLACE IMAGE", run: () => this.replaceImage() },
      { label: "REMOVE IMAGE", run: () => this.askRemoveImage() },
      { label: "CLOSE MENU", run: () => {} },
    ];
    this.overlay = { kind: "menu", title: "IMAGE", items, index: 0 };
  }

  #imageInput = (button) => {
    const imgs = this.media.images;
    const i = imgs.findIndex((x) => x.id === this.imageSel);
    if (i < 0) return void (this.focus = "editor");
    // Along the edge moves the image; across it picks another.
    const strip = this.stripEdge;
    const move = (strip ? { up: -1, down: 1 } : { left: -1, right: 1 })[button];
    const pick = (strip ? { left: -1, right: 1 } : { up: -1, down: 1 })[button];
    if (move && strip) this.setImageLine(this.imageSel, imgs[i].line + move);
    if (move && !strip) this.setImageIndex(this.imageSel, i + move);
    if (pick) this.imageSel = imgs[(i + pick + imgs.length) % imgs.length].id;
    if (button === "a") this.placeImages();
    if (button === "b") {
      this.media = this.#imageBefore ?? this.media;
      this.focus = "editor";
    }
    if (button === "start") this.#imageMenu();
  };

  /** Back to writing from whatever had the D-pad (a click in the text). */
  backToText() {
    if (this.focus === "image") return this.placeImages();
    if (this.focus === "bay" || this.focus === "drawer") this.focus = "editor";
  }

  // --- Formatting (bottom strip, later the Format deck) ----------------
  static FORMATS = [
    { key: "bold", label: "B", run: (c) => c.toggleBold() },
    { key: "italic", label: "I", run: (c) => c.toggleItalic() },
    { key: "underline", label: "U", run: (c) => c.toggleUnderline() },
    { key: "strike", label: "S", run: (c) => c.toggleStrike() },
    { key: "highlight", label: "HL", run: (c) => c.toggleHighlight() },
    { key: "h1", label: "H1", run: (c) => c.toggleHeading({ level: 1 }) },
    { key: "h2", label: "H2", run: (c) => c.toggleHeading({ level: 2 }) },
    { key: "h3", label: "H3", run: (c) => c.toggleHeading({ level: 3 }) },
    { key: "bulletList", label: "•", run: (c) => c.toggleBulletList() },
    { key: "orderedList", label: "1.", run: (c) => c.toggleOrderedList() },
    { key: "taskList", label: "☐", run: (c) => c.toggleTaskList() },
    { key: "blockquote", label: "❝", run: (c) => c.toggleBlockquote() },
    { key: "code", label: "</>", run: (c) => c.toggleCode() },
  ];

  /** Keys that do something once rather than staying on: on the strip, and
      undo/redo on the Format deck too. `ok` says whether it can run now. */
  static ACTIONS = [
    { key: "undo", label: "↶", ok: (d) => d.can.undo, run: (c) => c.undo() },
    { key: "redo", label: "↷", ok: (d) => d.can.redo, run: (c) => c.redo() },
    { key: "outdent", label: "⇤", ok: (d) => d.can.outdent, run: (c) => c.command(({ commands: k }) => k.liftListItem("listItem") || k.liftListItem("taskItem")) },
    { key: "indent", label: "⇥", ok: (d) => d.can.indent, run: (c) => c.command(({ commands: k }) => k.sinkListItem("listItem") || k.sinkListItem("taskItem")) },
    // With an image under the D-pad, IMG replaces it (as the Camera does).
    { key: "image", label: (d) => (d.focus === "image" ? "↻ IMG" : "IMG"), ok: () => true, act: (d) => d.pickImages() },
    // The note's image edge, as the image's place beside the text: ▄ bottom, ▀ top, ▌ left, ▐ right.
    { key: "edge", label: (d) => ({ bottom: "▄", top: "▀", left: "▌", right: "▐" })[d.media.edge], ok: (d) => d.media.images.length > 0, act: (d) => d.cycleEdge() },
  ];
  /** What the action keys can do at the caret (the editor reports it). */
  can = $state({});

  /** Marks apply to the whole word when there's only a caret (the word is the unit). */
  static MARKS = ["bold", "italic", "underline", "strike", "highlight", "code"];

  get canFormat() {
    return this.focus === "editor" && !this.overlay && !!this.editorApi;
  }

  /** Whether an action key works now. IMG works on a picked image too. */
  canAct(f) {
    return (this.canFormat || (f.key === "image" && this.focus === "image" && !this.overlay)) && f.ok(this);
  }

  format(key) {
    const action = Device.ACTIONS.find((x) => x.key === key);
    if (action) {
      if (!this.canAct(action)) return;
      return action.act ? action.act(this) : action.run(this.editorApi.commands()).run();
    }
    if (!this.canFormat) return;
    const f = Device.FORMATS.find((x) => x.key === key);
    const word = Device.MARKS.includes(key) ? this.editorApi.wordRange() : null;
    let c = this.editorApi.commands();
    if (word) c = c.setTextSelection({ from: word.from, to: word.to });
    c = f.run(c);
    if (word) c = c.setTextSelection(word.caret);
    c.run();
    if (!word && this.active[key]) this.nudge(`block:${key}`); // switched on, not off
  }

  nudge(kind) {
    this.buddyEvent = { kind, at: Date.now() };
  }

  /** What the details page shows for the note on screen. */
  get details() {
    const n = this.editing ? this.stored : this.note;
    const plot = this.editing ? this.pendingPlot : n && n.mapX != null && n.mapY != null ? [n.mapX, n.mapY] : null;
    return {
      words: this.words,
      made: n?.createdAt ? new Date(n.createdAt) : null,
      saved: n?.updatedAt ?? n?.createdAt ?? null,
      status: !this.editing ? "PREVIEW" : this.dirty ? "UNSAVED" : this.isNew ? "NEW" : "SAVED",
      tree: this.editing ? this.draftIcon : (n?.icon ?? null),
      plot,
    };
  }

  #toList() {
    this.isNew = false;
    this.editingId = null;
    this.focus = "list";
    this.editorApi?.reload();
  }
  // --- Selection mode in the list: pick notes, then delete them together.
  // In by Select, the Start menu, the List module's slider or a long press.
  picking = $state(false);
  picked = $state([]); // noteids
  get pickedNotes() {
    return this.raw.filter((n) => this.picked.includes(n.noteid));
  }
  startPicking(first = null) {
    if (this.editing) return;
    this.overlay = null;
    this.focus = "list";
    this.picking = true;
    this.picked = first ? [first] : [];
    this.say("SELECT NOTES");
  }
  stopPicking() {
    this.picking = false;
    this.picked = [];
  }
  togglePick(id = this.note?.noteid) {
    if (!id) return;
    this.picked = this.picked.includes(id) ? this.picked.filter((x) => x !== id) : [...this.picked, id];
  }
  askDeletePicked() {
    const targets = this.pickedNotes;
    if (!targets.length) return this.say("PICK NOTES WITH A");
    const one = targets.length === 1;
    const names = targets.slice(0, 3).map((n) => `“${n.title?.trim() || "untitled"}”`).join(", ");
    const more = targets.length > 3 ? ` and ${targets.length - 3} more` : "";
    this.confirm({
      title: one ? "DELETE NOTE?" : `DELETE ${targets.length} NOTES?`,
      text: `${names}${more} ${one ? "and its tree" : "and their trees"} will be gone, images too. This can't be undone.`,
      icon: targets[0].icon || "/Tree2.png",
      yes: "DELETE",
      no: "KEEP",
      onYes: () => this.deleteNotes(targets),
    });
  }
  async deleteNotes(targets) {
    const ids = targets.map((n) => n.noteid);
    const rows = this.raw.filter((n) => ids.includes(n.noteid));
    if (!rows.length) return;
    const i = this.index;
    try {
      await db.notes.bulkDelete(rows.map((n) => n.id));
    } catch (error) {
      console.error("Couldn't delete the notes:", error);
      return this.say("COULDN'T DELETE", 3000);
    }
    this.raw = this.raw.filter((n) => !ids.includes(n.noteid));
    for (const id of ids) media.dropNote(id); // their images go with them
    if (ids.includes(this.selectedId)) this.index = Math.min(i, this.notes.length - 1);
    this.stopPicking();
    this.say(rows.length === 1 ? `DELETED “${rows[0].title?.trim() || "untitled"}”` : `DELETED ${rows.length} NOTES`);
  }

  /** Ask before deleting; the target is fixed now, so switching notes while
      the box is open can't change what gets deleted. */
  askDelete() {
    const target = this.stored;
    if (!target) {
      // An unsaved new note: there's nothing stored to delete, just drop it.
      if (this.isNew) {
        this.setBaseline(this.html);
        this.#toList();
        this.say("NEW NOTE DISCARDED");
      }
      return;
    }
    const title = target.title?.trim() || "untitled";
    this.confirm({
      title: "DELETE NOTE?",
      text: `“${title}” and its tree will be gone. This can't be undone.`,
      icon: target.icon || "/Tree2.png",
      yes: "DELETE",
      no: "KEEP",
      onYes: () => this.deleteNote(target),
    });
  }


  // --- Input per screen -----------------------------------------------

  /** A click or tap on a menu item: the same as moving to it and pressing A. */
  /** A click on a menu row (or on one of its choices). */
  chooseMenuItem(i, choice) {
    if (this.overlay?.kind !== "menu") return;
    this.overlay.index = i;
    if (choice !== undefined) this.overlay.items[i].pick = choice;
    this.#menuInput("a");
  }

  #menuInput = (button) => {
    const m = this.overlay;
    const n = m.items.length;
    if (button === "up") m.index = (m.index - 1 + n) % n;
    if (button === "down") m.index = (m.index + 1) % n;
    const item = m.items[m.index];
    const step = { left: -1, right: 1 }[button];
    if (step && item.cycle) item.cycle(step);
    if (step && item.choices) item.pick = (item.pick + step + item.choices.length) % item.choices.length;
    if (button === "b" || button === "start") this.overlay = null;
    if (button === "a") {
      this.overlay = null;
      (item.choices ? item.choices[item.pick] : item).run();
    }
  };

  #confirmInput = (button) => {
    const c = this.overlay;
    if (button === "start" && c.alt) {
      this.overlay = null;
      c.alt.run();
    }
    if (button === "a") {
      this.overlay = null;
      c.onYes();
    }
    if (button === "b") {
      this.overlay = null;
      c.onNo();
    }
  };

  #listInput = (button) => {
    const n = this.notes.length;
    if (button === "select") return this.picking ? this.stopPicking() : n && this.startPicking();
    // Select held with the D-pad: pick a run of notes, from here to where it lands.
    const from = this.index;
    if (this.#extend && n && !this.picking) this.startPicking();
    // Up/down wrap round, except while extending a run (it stops at the ends).
    if (button === "up" && n) this.index = this.#extend ? Math.max(0, this.index - 1) : (this.index - 1 + n) % n;
    if (button === "down" && n) this.index = this.#extend ? Math.min(n - 1, this.index + 1) : (this.index + 1) % n;
    // Left/right page through the list, five rows at a time.
    if (button === "left" && n) this.index = Math.max(0, this.index - 5);
    if (button === "right" && n) this.index = Math.min(n - 1, this.index + 5);
    if (this.#extend && this.picking) {
      const [lo, hi] = from < this.index ? [from, this.index] : [this.index, from];
      const run = this.notes.slice(lo, hi + 1).map((x) => x.noteid);
      this.picked = [...new Set([...this.picked, ...run])];
      return;
    }
    if (this.picking) {
      if (button === "a") this.togglePick();
      if (button === "b") this.stopPicking();
      if (button === "start") this.askDeletePicked();
      return;
    }
    if (button === "a" && n) this.open();
    if (button === "b") this.newNote();
    if (button === "start") this.openMenu();
  };

  #editorInput = (button) => {
    if (["up", "down", "left", "right"].includes(button)) this.editorApi?.move(button, this.#extend);
    if (button === "a") this.save();
    if (button === "b") this.newNote();
    if (button === "start") this.openMenu();
    if (button === "select") this.leave(); // Select is the list key: back to the notes
  };

  /** Keyboard → hardware. Returns true if the key was handled. */
  handleKey(event) {
    // While Configure is open, keys belong to it (e.g. Esc closes it).
    if (document.querySelector(".config-panel")) return false;
    const t = event.target;
    const typing = t?.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t?.tagName ?? "");
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
      // Always "save", never "press A" (which could pick a menu item).
      if (this.editing && !this.overlay) {
        this.light("a");
        this.save();
      }
      return true;
    }
    // Ctrl/⌘ K is Start and Ctrl/⌘ L is Select (a tap), everywhere, including while typing.
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
      this.press("start");
      return true;
    }
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "l") {
      this.press("select");
      return true;
    }
    if (event.metaKey || event.ctrlKey || event.altKey) return false;
    // Arranging images, or picking notes: Delete / Backspace removes (Start).
    if ((event.key === "Delete" || event.key === "Backspace") && (this.focus === "image" || (this.focus === "list" && this.picking)) && !this.overlay && !typing) {
      this.press("start");
      return true;
    }
    const button = KEYMAP[event.key];
    if (!button) return false;
    // While typing, only Esc leaves the field; everything else is text editing.
    if (typing && event.key !== "Escape") return false;
    if (LOOSE_KEYS.has(event.key) && this.focus === "editor" && !this.overlay) return false;
    // Keys on page controls (Configure, the nameplate's links) keep their normal behaviour.
    if (!typing && t?.closest?.(".config, a[href]")) return false;
    this.press(button, { extend: event.shiftKey }); // Shift with the arrows is holding Select
    return true;
  }
}
