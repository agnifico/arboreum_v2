<script>
  // The screen's editor: Tiptap with a monospace "Sublime" skin. Notes stay
  // rich-text HTML (shared with the classic app); markers like `#`, `**`,
  // `- ` and `[ ]` are drawn by CSS, not stored. See CONCEPT.md, "Editor".
  import { onMount, onDestroy, untrack } from "svelte";
  import { Editor } from "@tiptap/core";
  import { StarterKit } from "@tiptap/starter-kit";
  import Underline from "@tiptap/extension-underline";
  import Highlight from "@tiptap/extension-highlight";
  import Link from "@tiptap/extension-link";
  import TaskList from "@tiptap/extension-task-list";
  import TaskItem from "@tiptap/extension-task-item";
  import Subscript from "@tiptap/extension-subscript";
  import Superscript from "@tiptap/extension-superscript";
  import TextStyle from "@tiptap/extension-text-style";
  import Color from "@tiptap/extension-color";
  // Kept so saving here never strips them from a note; hidden by the skin.
  import TextAlign from "@tiptap/extension-text-align";
  import Image from "@tiptap/extension-image";
  import { useDevice } from "./device.svelte.js";

  const device = useDevice();

  let host = $state(); // scrolling area: gutter + text
  let mount = $state(); // where ProseMirror lives
  let editor = $state.raw(null);
  let gutter = $state([]); // [{ n, top, height, current }]
  let loadedKey = null; // which note (or "new") is in the editor

  // --- Gutter: one number per textblock, measured from the DOM ---------
  function measure() {
    if (!editor || !host) return;
    const blocks = editor.view.dom.querySelectorAll("p, h1, h2, h3, h4, h5, h6, pre");
    const hostTop = host.getBoundingClientRect().top - host.scrollTop;
    const at = editor.view.domAtPos(editor.state.selection.from).node;
    const curEl = (at.nodeType === 1 ? at : at.parentElement)?.closest("p, h1, h2, h3, h4, h5, h6, pre");
    gutter = [...blocks].map((el, i) => {
      const r = el.getBoundingClientRect();
      return { n: i + 1, top: r.top - hostTop, height: r.height, current: el === curEl && device.focus === "editor" };
    });
  }

  // --- Content ----------------------------------------------------------
  // Load a note when the selection or the open note changes; never while
  // typing, so live updates don't move the caret.
  function load(key, html) {
    if (!editor || key === loadedKey) return;
    loadedKey = key;
    editor.commands.setContent(html || "", false);
    device.html = editor.getHTML();
    device.setBaseline(device.html);
    requestAnimationFrame(measure);
  }

  $effect(() => {
    const editing = device.focus === "editor";
    const key = editing ? device.editingId : (device.note?.noteid ?? "none");
    // Saving a new note turns "new" into its real id: same content, no reload.
    if (editing && loadedKey === "new" && key !== "new") {
      loadedKey = key;
      return;
    }
    const html = editing ? (key === "new" ? "" : untrack(() => device.raw.find((n) => n.noteid === key)?.text ?? "")) : (device.note?.text ?? "");
    untrack(() => load(key, html));
  });

  // Editable only while the editor has the D-pad and nothing is on top.
  $effect(() => {
    const editable = device.focus === "editor" && !device.overlay;
    untrack(() => {
      if (!editor) return;
      editor.setEditable(editable);
      if (editable) editor.commands.focus(device.isNew ? "start" : "end");
      else editor.commands.blur();
      measure();
    });
  });

  onMount(() => {
    editor = new Editor({
      element: mount,
      extensions: [
        StarterKit,
        Underline,
        Highlight,
        Link.configure({ openOnClick: false, autolink: true }),
        TaskList,
        TaskItem.configure({ nested: true }),
        Subscript,
        Superscript,
        TextStyle,
        Color,
        TextAlign.configure({ types: ["heading", "paragraph"] }),
        Image,
      ],
      editable: false,
      content: "",
      onUpdate: () => {
        device.html = editor.getHTML();
      },
      onTransaction: () => measure(),
    });
    // The device moves the caret with the on-screen D-pad through this.
    device.editorApi = {
      move(dir) {
        if (!editor.isEditable) return;
        editor.commands.focus();
        const sel = window.getSelection();
        const map = { up: ["backward", "line"], down: ["forward", "line"], left: ["backward", "character"], right: ["forward", "character"] };
        sel?.modify?.("move", ...map[dir]);
      },
      focus: () => editor.commands.focus(),
      getHTML: () => editor.getHTML(),
      reload: () => (loadedKey = null),
      commands: () => editor.chain().focus(),
      isActive: (...a) => editor.isActive(...a),
    };
    loadedKey = null;
    const key = device.note?.noteid ?? "none";
    load(key, device.note?.text ?? "");
    const ro = new ResizeObserver(() => measure());
    ro.observe(host);
    return () => ro.disconnect();
  });

  onDestroy(() => {
    device.editorApi = null;
    editor?.destroy();
  });
</script>

<div class="host" bind:this={host} onscroll={measure}>
  <div class="gutter" aria-hidden="true">
    {#each gutter as g}
      {#if g.current}<span class="curline" style="top:{g.top}px; height:{g.height}px"></span>{/if}
      <span class="num" class:cur={g.current} style="top:{g.top}px">{g.n}</span>
    {/each}
  </div>
  <div class="mono" class:editing={device.focus === "editor"} bind:this={mount}></div>
</div>

<style>
  .host {
    position: relative;
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    scrollbar-width: none;
    padding: 14px 120px 14px 0;
  }
  .gutter {
    position: absolute;
    inset: 0 auto 0 0;
    width: 54px;
    pointer-events: none;
  }
  .num {
    position: absolute;
    right: 18px;
    line-height: 26px;
    font-size: 15px;
    color: #3d4b3b;
  }
  .num.cur {
    color: var(--phosphor-dim);
  }
  .curline {
    position: absolute;
    left: 0;
    width: 200vw;
    background: rgba(213, 228, 198, 0.04);
  }
  .mono {
    margin-left: 54px;
    font-size: 15px;
    line-height: 26px;
    color: var(--phosphor);
  }

  /* --- Monospace skin (ProseMirror content is outside Svelte's scope) --- */
  .mono :global(.ProseMirror) {
    outline: none;
    white-space: pre-wrap;
    caret-color: var(--signal);
    min-height: 100%;
  }
  .mono :global(.ProseMirror *) {
    margin: 0;
    font-size: inherit;
    line-height: 26px;
  }
  /* One line per block: no extra spacing, one fixed grid */
  .mono :global(h1),
  .mono :global(h2),
  .mono :global(h3),
  .mono :global(h4),
  .mono :global(h5),
  .mono :global(h6) {
    font-weight: 700;
    color: #f3c58a;
  }
  .mono :global(h1::before) { content: "# "; }
  .mono :global(h2::before) { content: "## "; }
  .mono :global(:is(h3, h4, h5, h6)::before) { content: "### "; }
  .mono :global(:is(h1, h2, h3, h4, h5, h6)::before),
  .mono :global(strong::before),
  .mono :global(strong::after),
  .mono :global(em::before),
  .mono :global(em::after),
  .mono :global(s::before),
  .mono :global(s::after),
  .mono :global(code::before),
  .mono :global(code::after),
  .mono :global(blockquote p::before),
  .mono :global(ul:not([data-type]) > li > p:first-child::before),
  .mono :global(ol > li > p:first-child::before) {
    color: #4f6150;
    font-weight: 400;
    font-style: normal;
  }
  .mono :global(strong) { color: #fff; font-weight: 700; }
  .mono :global(strong::before),
  .mono :global(strong::after) { content: "**"; }
  .mono :global(em) { font-style: italic; color: #e3ecd9; }
  .mono :global(em::before),
  .mono :global(em::after) { content: "_"; }
  .mono :global(s::before),
  .mono :global(s::after) { content: "~~"; }
  .mono :global(code) { color: #9fd8c4; }
  .mono :global(code::before),
  .mono :global(code::after) { content: "`"; }
  .mono :global(mark) { background: rgba(255, 209, 102, 0.22); color: inherit; }
  .mono :global(a) { color: #8fd3ff; text-decoration: underline; text-underline-offset: 3px; }
  .mono :global(sup),
  .mono :global(sub) { line-height: 0; font-size: 0.75em; }
  .mono :global(blockquote) { color: #a9bb9d; font-style: italic; }
  .mono :global(blockquote p::before) { content: "> "; }
  .mono :global(pre) { color: #9fd8c4; }

  /* Lists: markers drawn as text, two-space indent per level */
  .mono :global(ul),
  .mono :global(ol) { list-style: none; padding-left: 0; }
  .mono :global(li li),
  .mono :global(li [data-type="taskList"]) { padding-left: 2ch; }
  .mono :global(ul:not([data-type]) > li > p:first-child::before) { content: "- "; }
  .mono :global(ol) { counter-reset: line-ol; }
  .mono :global(ol > li) { counter-increment: line-ol; }
  .mono :global(ol > li > p:first-child::before) { content: counter(line-ol) ". "; }

  /* Tasks: "[ ]" / "[x]" in place of the checkbox (still clickable) */
  .mono :global(ul[data-type="taskList"] > li) { display: flex; }
  .mono :global(ul[data-type="taskList"] > li > label) { position: relative; flex-shrink: 0; color: #4f6150; user-select: none; }
  .mono :global(ul[data-type="taskList"] > li > label > span::before) { content: "- [ ] "; white-space: pre; }
  .mono :global(ul[data-type="taskList"] > li[data-checked="true"] > label > span::before) { content: "- [x] "; }
  .mono :global(ul[data-type="taskList"] > li > label > input) { position: absolute; inset: 0; opacity: 0; margin: 0; cursor: pointer; }
  .mono :global(ul[data-type="taskList"] > li[data-checked="true"] > div) { color: #5f705c; text-decoration: line-through; }
  .mono :global(ul[data-type="taskList"] > li > div) { flex: 1; min-width: 0; }

  /* Not offered in the concept: alignment shows left, inline images hide.
     Both stay in the stored note, so nothing is lost on save. */
  .mono :global([style*="text-align"]) { text-align: left !important; }
  .mono :global(img) { display: none; }

  /* Empty note */
  .mono :global(.ProseMirror > p:only-child:has(> br:only-child)::before) {
    content: "start typing…";
    color: #3d4b3b;
  }

  :global(.portrait) .host { padding: 10px 14px 10px 0; }
  :global(.portrait) .gutter { width: 34px; }
  :global(.portrait) .num { right: 10px; font-size: 13px; line-height: 22px; }
  :global(.portrait) .mono { margin-left: 34px; font-size: 13px; }
  :global(.portrait) .mono :global(.ProseMirror *) { line-height: 22px; }
</style>
