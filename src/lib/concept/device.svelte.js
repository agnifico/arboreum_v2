// The 1610F's shared state: one place every module reads from and every
// input (on-screen keys or the keyboard) goes through. See CONCEPT.md, "Inputs".
import { getContext, setContext } from "svelte";
import { notes as sampleNotes } from "./sample.js";

const KEY = "arb-device";
export const provideDevice = (device) => setContext(KEY, device);
export const useDevice = () => getContext(KEY);

export const BUTTONS = ["up", "down", "left", "right", "a", "b", "start"];

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
  /** Selected note in the list. */
  index = $state(0);
  notes = $state(sampleNotes);
  /** Short status message on the screen, e.g. "SAVED ✓". */
  message = $state("");

  #timers = {};
  #msgTimer;

  /** What A, B and Start do right now (the screen's context strip). */
  get labels() {
    if (this.focus === "editor") return { a: "SAVE", b: "LIST", start: "MENU" };
    return { a: "OPEN", b: "SORT", start: "MENU" };
  }

  press(button) {
    this.light(button);
    const handler = this.focus === "editor" ? this.#editorInput : this.#listInput;
    handler(button);
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

  #listInput = (button) => {
    const n = this.notes.length;
    if (button === "up" && n) this.index = (this.index - 1 + n) % n;
    if (button === "down" && n) this.index = (this.index + 1) % n;
    if (button === "a" && n) this.focus = "editor";
    if (button === "b") this.say("SORT · NEXT");
    if (button === "start") this.say("MENU");
  };

  #editorInput = (button) => {
    if (button === "a") this.say("SAVED ✓");
    if (button === "b") this.focus = "list";
    if (button === "start") this.say("MENU");
  };

  /** Keyboard → hardware. Returns true if the key was handled. */
  handleKey(event) {
    const t = event.target;
    const typing = t?.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t?.tagName ?? "");
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
      this.press("a");
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
