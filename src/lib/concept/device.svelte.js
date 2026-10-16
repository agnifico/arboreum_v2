// The 1610F's shared state: one place every module reads from and every
// input (on-screen keys or the keyboard) goes through. See CONCEPT.md, "Inputs".
import { getContext, setContext } from "svelte";
import { liveQuery } from "dexie";
import { db } from "$lib/db.js";
import { v4 as uuidv4 } from "uuid";
import { normalizeBackup } from "$lib/backup.js";
import { COLS, ROWS } from "./garden.js";
import { TREES } from "./trees.js";

const KEY = "arb-device";
export const provideDevice = (device) => setContext(KEY, device);
export const useDevice = () => getContext(KEY);

export const BUTTONS = ["up", "down", "left", "right", "a", "b", "start"];

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
// (B) and Ctrl/⌘ S (A) do, so typing stays normal. Start is M (for menu);
// Tab stays free for moving keyboard focus.
export const KEYMAP = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
  Enter: "a",
  Escape: "b",
  m: "start",
  M: "start",
};

export class Device {
  /** Keys currently lit, so keyboard presses show on the hardware too. */
  lit = $state(Object.fromEntries(BUTTONS.map((b) => [b, false])));
  /** Which part of the device has the D-pad: "list", "editor", "map" (the
      Map viewer) or "drawer" (the screen's slide-out). */
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
  /** Which modules are slotted (set by the page from Configure). */
  hasMapViewer = $state(true);
  /** Map cursor, shared by the Map viewer and the drawer's plot picker. */
  cursor = $state({ x: 12, y: 7 });
  /** The screen's slide-out drawer: which section, and the tree under the D-pad. */
  drawerSection = $state("tree"); // "tree" | "plot"
  treeIndex = $state(0);
  /** Formatting under the caret (for lit format keys) and the word count. */
  active = $state({});
  words = $state(0);
  /** Bottom strip page: "format" or "details". */
  stripPage = $state("format");

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
      if (n.mapX != null && n.mapY != null) out.push({ x: n.mapX, y: n.mapY, icon: n.icon || "/Tree2.png", title: n.title?.trim() || "untitled" });
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

  /** What the drawer stands in for: modules that aren't slotted. The tree
      always lives here until the Treemoji module exists (build step 11). */
  get drawerSections() {
    return ["tree", !this.hasMapViewer && "plot"].filter(Boolean);
  }

  /** The red "!": tap it to go where the missing thing is handled. */
  resolveMissing() {
    const m = this.missing;
    if (!m.length) return;
    if (m.includes("plot") && this.hasMapViewer && !m.includes("tree")) return this.enterMap();
    this.openDrawer(m.find((x) => this.drawerSections.includes(x)) ?? "tree");
  }

  openDrawer(section = "tree") {
    if (!this.editing) return;
    this.drawerSection = this.drawerSections.includes(section) ? section : "tree";
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
    const COLS_T = 4;
    const n = TREES.length;
    const step = { left: -1, right: 1, up: -COLS_T, down: COLS_T }[button];
    if (step) this.treeIndex = Math.max(0, Math.min(n - 1, this.treeIndex + step));
    if (button === "a") this.pickTree();
  };

  get sortLabel() {
    return SORTS.find((x) => x.key === this.sort).label;
  }

  /** Start reading notes; returns a stop function. Browser only. */
  start() {
    const sub = liveQuery(() => db.notes.toArray()).subscribe({
      next: (rows) => {
        this.raw = rows;
        this.loaded = true;
        if (!rows.some((n) => n.noteid === this.selectedId)) this.selectedId = this.notes[0]?.noteid ?? null;
      },
      error: (e) => console.error("Couldn't read notes:", e),
    });
    return () => sub.unsubscribe();
  }

  setSort(key) {
    this.sort = key;
    this.say(`SORT · ${this.sortLabel}`);
  }

  cycleSort() {
    const i = SORTS.findIndex((x) => x.key === this.sort);
    this.setSort(SORTS[(i + 1) % SORTS.length].key);
  }

  /** What A, B and Start do right now (the screen's context strip). */
  get labels() {
    const o = this.overlay;
    if (o?.kind === "menu") return { a: "SELECT", b: "CLOSE", start: "CLOSE" };
    if (o?.kind === "confirm") return { a: o.yes, b: o.no, start: o.alt?.label ?? "—" };
    if (this.focus === "map" || (this.focus === "drawer" && this.drawerSection === "plot")) {
      const at = this.atCursor;
      const other = this.focus === "drawer" ? "TREE" : "—";
      return { a: at && !at.mine ? "TAKEN" : "PLANT", b: this.focus === "drawer" ? "CLOSE" : "BACK", start: other };
    }
    if (this.focus === "drawer") return { a: "PICK", b: "CLOSE", start: this.drawerSections.length > 1 ? "PLOT" : "—" };
    if (this.focus === "editor") return { a: "SAVE", b: "NEW", start: "MENU" };
    return { a: "OPEN", b: "NEW", start: "MENU" };
  }

  press(button) {
    this.light(button);
    if (this.overlay?.kind === "menu") return this.#menuInput(button);
    if (this.overlay?.kind === "confirm") return this.#confirmInput(button);
    if (this.focus === "map") return this.#mapInput(button);
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

  openMenu() {
    const items =
      this.focus === "editor"
        ? [
            { label: "SAVE", run: () => this.save() },
            { label: this.hasMapViewer ? "CHOOSE TREE" : "TREE & PLOT", run: () => this.openDrawer() },
            { label: "NEW NOTE", run: () => this.newNote() },
            { label: "DELETE NOTE", run: () => this.askDelete() },
            { label: "CLOSE NOTE", run: () => this.leave() },
          ]
        : [
            { label: "NEW NOTE", run: () => this.newNote() },
            { label: `SORT · ${this.sortLabel} ▸`, run: () => this.cycleSort() },
            { label: "SAVE BACKUP", run: () => this.saveBackup() },
            { label: "LOAD BACKUP", run: () => this.loadBackup() },
          ];
    this.overlay = { kind: "menu", title: "MENU", items, index: 0 };
  }

  /** A yes/no box; `alt` adds a third choice on Start ({ label, run }). */
  confirm({ title, text, yes, no, onYes = () => {}, onNo = () => {}, alt = null }) {
    this.overlay = { kind: "confirm", title, text, yes, no, onYes, onNo, alt };
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

  async deleteNote() {
    const stored = this.stored;
    if (!stored) return;
    const i = this.index;
    try {
      await db.notes.delete(stored.id);
    } catch (error) {
      console.error("Couldn't delete the note:", error);
      return this.say("COULDN'T DELETE", 3000);
    }
    this.raw = this.raw.filter((n) => n.noteid !== stored.noteid);
    this.isNew = false;
    this.editingId = null;
    this.focus = "list";
    this.index = Math.min(i, this.notes.length - 1);
    this.editorApi?.reload();
    this.say("DELETED");
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

  /** B: save and close the open note, then start a new one. */
  async newNote() {
    const closed = await this.closeCurrent();
    if (!closed.ok) return;
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
    if (closed.saved) this.say(`SAVED “${closed.title}”`);
  }

  // --- Map: plant the open note's tree ----------------------------------
  /** Hand the D-pad to the map (Map viewer or the drawer's plot picker). */
  enterMap() {
    if (!this.editing) return this.say("OPEN A NOTE TO PLANT");
    if (this.draftPlot) this.cursor = { x: this.draftPlot[0], y: this.draftPlot[1] };
    this.focus = "map";
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

  #mapInput = (button) => {
    const d = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }[button];
    if (d) this.moveCursor(...d);
    if (button === "a") this.plant();
    if (button === "b") this.focus = "editor";
  };

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

  get canFormat() {
    return this.focus === "editor" && !this.overlay && !!this.editorApi;
  }

  format(key) {
    if (!this.canFormat) return;
    const f = Device.FORMATS.find((x) => x.key === key);
    f.run(this.editorApi.commands()).run();
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
  askDelete() {
    const title = this.note?.title ?? "this note";
    this.confirm({
      title: "DELETE NOTE?",
      text: `“${title}” and its tree will be gone. This can't be undone.`,
      yes: "DELETE",
      no: "KEEP",
      onYes: () => this.deleteNote(),
    });
  }

  // --- Input per screen -----------------------------------------------

  #menuInput = (button) => {
    const m = this.overlay;
    const n = m.items.length;
    if (button === "up") m.index = (m.index - 1 + n) % n;
    if (button === "down") m.index = (m.index + 1) % n;
    if (button === "b" || button === "start") this.overlay = null;
    if (button === "a") {
      const item = m.items[m.index];
      this.overlay = null;
      item.run();
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
    if (button === "up" && n) this.index = (this.index - 1 + n) % n;
    if (button === "down" && n) this.index = (this.index + 1) % n;
    // Left/right page through the list, five rows at a time.
    if (button === "left" && n) this.index = Math.max(0, this.index - 5);
    if (button === "right" && n) this.index = Math.min(n - 1, this.index + 5);
    if (button === "a" && n) this.open();
    if (button === "b") this.newNote();
    if (button === "start") this.openMenu();
  };

  #editorInput = (button) => {
    if (["up", "down", "left", "right"].includes(button)) this.editorApi?.move(button);
    if (button === "a") this.save();
    if (button === "b") this.newNote();
    if (button === "start") this.openMenu();
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
    // Ctrl/⌘ K is Start everywhere, including while typing (M types an "m").
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
      this.press("start");
      return true;
    }
    if (event.metaKey || event.ctrlKey || event.altKey) return false;
    const button = KEYMAP[event.key];
    if (!button) return false;
    // While typing, only Esc leaves the field; everything else is text editing.
    if (typing && button !== "b") return false;
    // Keys on page controls (e.g. Configure) keep their normal behaviour.
    if (!typing && t?.closest?.(".config")) return false;
    this.press(button);
    return true;
  }
}
