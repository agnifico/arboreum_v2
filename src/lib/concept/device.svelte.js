// The 1610F's shared state: one place every module reads from and every
// input (on-screen keys or the keyboard) goes through. See CONCEPT.md, "Inputs".
import { getContext, setContext } from "svelte";
import { liveQuery } from "dexie";
import { db } from "$lib/db.js";
import { v4 as uuidv4 } from "uuid";
import { normalizeBackup } from "$lib/backup.js";

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
  /** Which part of the device has the D-pad: the notes list or the editor. */
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
  baseline = $state.raw({ title: "", html: "" });

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

  /** The note as stored (raw title, not the display "untitled"). */
  get stored() {
    const id = this.focus === "editor" ? this.editingId : this.selectedId;
    return this.raw.find((n) => n.noteid === id);
  }

  get dirty() {
    if (this.focus !== "editor") return false;
    return this.draftTitle !== this.baseline.title || this.html !== this.baseline.html;
  }

  setBaseline(html) {
    this.baseline = { title: this.draftTitle, html };
  }

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
    if (this.focus === "editor") return { a: "SAVE", b: "LIST", start: "MENU" };
    return { a: "OPEN", b: "SORT", start: "MENU" };
  }

  press(button) {
    this.light(button);
    if (this.overlay?.kind === "menu") return this.#menuInput(button);
    if (this.overlay?.kind === "confirm") return this.#confirmInput(button);
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
            { label: "NEW NOTE", run: () => this.newNote() },
            { label: "DELETE NOTE", run: () => this.askDelete() },
            { label: "BACK TO LIST", run: () => this.leave() },
          ]
        : [
            { label: "NEW NOTE", run: () => this.newNote() },
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
  async save() {
    if (this.focus !== "editor") return false;
    const html = this.editorApi?.getHTML() ?? this.html;
    const title = this.draftTitle.trim();
    const data = { title, text: html, updatedAt: new Date() };
    try {
      if (this.isNew) {
        const note = { noteid: uuidv4(), icon: "/Tree2.png", createdAt: new Date(), mapX: null, mapY: null, ...data };
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
      this.baseline = { title, html };
      this.say("SAVED ✓");
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
    this.draftTitle = this.raw.find((n) => n.noteid === this.editingId)?.title ?? "";
    this.baseline = { title: this.draftTitle, html: this.html };
    this.focus = "editor";
  }

  newNote() {
    const go = () => {
      this.isNew = true;
      this.editingId = "new";
      this.draftTitle = "";
      this.focus = "editor";
    };
    if (this.dirty) return this.#askBeforeLeaving(go);
    go();
  }

  /** Back to the list; asks first if there are unsaved changes. */
  leave() {
    if (!this.dirty) return this.#toList();
    this.#askBeforeLeaving(() => this.#toList());
  }

  #askBeforeLeaving(then) {
    this.confirm({
      title: "UNSAVED CHANGES",
      text: this.isNew ? "This note hasn't been saved yet." : "You've changed this note since it was saved.",
      yes: "SAVE",
      no: "DISCARD",
      alt: { label: "KEEP EDITING", run: () => {} },
      onYes: async () => {
        if (await this.save()) then();
      },
      onNo: () => {
        this.baseline = { title: this.draftTitle, html: this.html };
        then();
      },
    });
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
    if (button === "b") this.cycleSort();
    if (button === "start") this.openMenu();
  };

  #editorInput = (button) => {
    if (["up", "down", "left", "right"].includes(button)) this.editorApi?.move(button);
    if (button === "a") this.save();
    if (button === "b") this.leave();
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
      if (this.focus === "editor" && !this.overlay) {
        this.light("a");
        this.save();
      }
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
