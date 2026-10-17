// Marks at word level (CONCEPT.md, "Marks at word level"). With the markup
// hidden, a formatted word behaves as if the caret sat inside its markers
// (`**word**`): at either edge of a bold word the caret is bold, so its key
// lights and typed letters join the word. Spaces carry no marks of their own:
// one typed at a word's edge is plain, so the caret steps out of the word.
import { Extension } from "@tiptap/core";
import { Plugin } from "@tiptap/pm/state";

// Links aren't formatting: typing at a link's edge shouldn't extend it.
const sticky = (m) => m.type.name !== "link";
const isGap = (ch) => !ch || /\s/.test(ch);
const same = (a, b) => a.length === b.length && a.every((m) => m.isInSet(b));

/** The caret's marks at a word's edge: the word's own, or null if it isn't at one. */
function edgeMarks($pos) {
  const before = $pos.nodeBefore;
  const after = $pos.nodeAfter;
  const chBefore = before?.isText ? before.text.slice(-1) : "";
  const chAfter = after?.isText ? after.text[0] : "";
  // At a word's start: a gap (space, line start) before, the word after.
  if (after?.isText && isGap(chBefore) && !isGap(chAfter)) return after.marks.filter(sticky);
  // At a word's end: the word before, a gap after.
  if (before?.isText && isGap(chAfter) && !isGap(chBefore)) return before.marks.filter(sticky);
  return null;
}

export const WordMarks = Extension.create({
  name: "wordMarks",
  addProseMirrorPlugins() {
    return [
      new Plugin({
        appendTransaction(trs, _old, state) {
          if (!trs.some((tr) => tr.selectionSet || tr.docChanged)) return null;
          const sel = state.selection;
          // Marks set by a key (B with only a caret) stay as they are.
          if (!sel.empty || state.storedMarks) return null;
          const marks = edgeMarks(sel.$from);
          if (!marks?.length || same(marks, sel.$from.marks())) return null;
          return state.tr.setStoredMarks(marks);
        },
        props: {
          handleTextInput(view, from, to, text) {
            if (text !== " " || from !== to) return false;
            const { state } = view;
            const $pos = state.doc.resolve(from);
            // A space only keeps the marks on both sides of it (inside a bold phrase, say).
            const a = $pos.nodeAfter?.marks ?? [];
            const shared = ($pos.nodeBefore?.marks ?? []).filter((m) => m.isInSet(a));
            if (same(state.storedMarks ?? $pos.marks(), shared)) return false;
            view.dispatch(state.tr.setStoredMarks(shared).insertText(" ", from, to));
            return true;
          },
        },
      }),
    ];
  },
});

/** The word the caret is in or at the edge of: { from, to, caret }, or null. */
export function wordRange(state) {
  const sel = state.selection;
  if (!sel.empty) return null;
  const $pos = sel.$from;
  const parent = $pos.parent;
  // One character per position (inline leaves count as one), so offsets line up.
  const text = parent.textBetween(0, parent.content.size, null, "￼");
  const inWord = (ch) => /[\p{L}\p{N}_'’-]/u.test(ch);
  let s = $pos.parentOffset;
  let e = s;
  while (s > 0 && inWord(text[s - 1])) s--;
  while (e < text.length && inWord(text[e])) e++;
  if (s === e) return null;
  const base = $pos.start();
  return { from: base + s, to: base + e, caret: sel.from };
}
