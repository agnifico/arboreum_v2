<script>
  // The screen's editor: Tiptap with a monospace "Sublime" skin. Notes stay
  // rich-text HTML (shared with the classic app); markers like `#`, `**`,
  // `- ` and `[ ]` are drawn by CSS, not stored. See CONCEPT.md, "Editor".
  import { onMount, onDestroy, untrack } from "svelte";
  import { Editor } from "@tiptap/core";
  import { EditorState } from "@tiptap/pm/state";
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
  import NoteImages from "./NoteImages.svelte";

  const device = useDevice();

  let host = $state(); // scrolling area: gutter + text
  let mount = $state(); // where ProseMirror lives
  let editor = $state.raw(null);
  let gutter = $state([]); // [{ n, top, height, current }]
  let loadedKey = null; // which note (or "new") is in the editor
  let openedByClick = false; // keep the caret where the click put it
  let resume = null; // { from, to }: the caret when the map or a menu took the D-pad

  // Images at the note's edge: sizes follow the screen's width.
  let hostW = $state(800);
  let narrow = $derived(hostW < 500);
  let thumb = $derived(narrow ? 56 : 92);
  let edge = $derived(device.media.images.length ? device.media.edge : null);

  // Desktop basics: clicking the text while previewing opens it right there.
  function clickToEdit(e) {
    if (!editor || editor.isEditable || device.overlay || e.button !== 0) return;
    if (e.target.closest?.(".nimg")) return; // images handle their own taps
    openedByClick = true;
    // Already in the note (the map, the drawer or the images had the D-pad):
    // just come back to the text.
    if (device.editing) device.backToText();
    else if (device.note) device.open();
    else device.newNote();
    editor.setEditable(true); // now, so this same click places the caret
  }

  function takeImages(files) {
    const images = [...(files ?? [])].filter((f) => f.type.startsWith("image/"));
    if (!images.length) return false;
    device.addImages(images);
    return true;
  }

  // --- Gutter: one number per textblock, measured from the DOM ---------
  function report() {
    if (!editor) return;
    const a = {};
    for (const f of [["bold"], ["italic"], ["underline"], ["strike"], ["highlight"], ["bulletList"], ["orderedList"], ["taskList"], ["blockquote"], ["code"]]) a[f[0]] = editor.isActive(f[0]);
    for (const l of [1, 2, 3]) a[`h${l}`] = editor.isActive("heading", { level: l });
    device.active = a;
    // Separate blocks with a space, so "three" + "four" isn't one word.
    const doc = editor.state.doc;
    const text = doc.textBetween(0, doc.content.size, " ", " ").trim();
    device.words = text ? text.split(/\s+/).length : 0;
  }

  function measure() {
    if (!editor || !host) return;
    const blocks = editor.view.dom.querySelectorAll("p, h1, h2, h3, h4, h5, h6, pre");
    // Screen rects are zoomed with the console; the gutter is laid out in its
    // own unzoomed pixels, so divide the zoom back out.
    const hr = host.getBoundingClientRect();
    const k = hr.height / host.offsetHeight || 1;
    const at = editor.view.domAtPos(editor.state.selection.from).node;
    const curEl = (at.nodeType === 1 ? at : at.parentElement)?.closest("p, h1, h2, h3, h4, h5, h6, pre");
    // New images land beside the caret's line.
    device.lineCount = Math.max(1, blocks.length);
    const ci = [...blocks].indexOf(curEl);
    if (ci >= 0) device.caretLine = ci + 1;
    gutter = [...blocks].map((el, i) => {
      const r = el.getBoundingClientRect();
      // Numbers take their line's height, so they line up with taller headings.
      const lh = parseFloat(getComputedStyle(el).lineHeight) || 26;
      return { n: i + 1, top: (r.top - hr.top) / k + host.scrollTop, height: r.height / k, lh, current: el === curEl && device.focus === "editor" };
    });
  }

  // --- Content ----------------------------------------------------------
  // Load a note when the selection or the open note changes; never while
  // typing, so live updates don't move the caret.
  function load(key, html) {
    if (!editor || key === loadedKey) return;
    loadedKey = key;
    resume = null; // a different note: start fresh
    editor.commands.setContent(html || "", false);
    // Each note starts with a fresh undo history: undo can't empty a note you
    // just opened, or replay another note's steps onto this one.
    const { doc, plugins } = editor.state;
    editor.view.updateState(EditorState.create({ doc, plugins }));
    device.html = editor.getHTML();
    device.setBaseline(device.html);
    device.showMedia(key);
    report();
    requestAnimationFrame(measure);
  }

  $effect(() => {
    const editing = device.editing;
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
      // A click already placed the caret; coming back (from the map or a
      // menu) it returns where it was; opening a note it starts at the end
      // (or the top for a new one).
      if (editable && !openedByClick && resume) {
        const max = editor.state.doc.content.size;
        editor.chain().setTextSelection({ from: Math.min(resume.from, max), to: Math.min(resume.to, max) }).focus().run();
      } else if (editable && !openedByClick) editor.commands.focus(device.isNew ? "start" : device.caretAt);
      else if (!editable) {
        const { from, to } = editor.state.selection;
        resume = loadedKey ? { from, to } : null;
        editor.commands.blur();
      }
      device.caretAt = "end";
      openedByClick = false;
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
      // Pasted or dropped image files go to the note's edge, like the Camera.
      editorProps: {
        handlePaste: (_, e) => takeImages(e.clipboardData?.files),
        handleDrop: (_, e) => takeImages(e.dataTransfer?.files),
        // The A/B strip sits over the text's bottom edge: keep the caret clear of it.
        scrollMargin: { top: 5, bottom: 44, left: 5, right: 5 },
      },
      onUpdate: () => {
        device.html = editor.getHTML();
      },
      onTransaction: () => {
        measure();
        report();
      },
    });
    // The device moves the caret with the on-screen D-pad through this.
    device.editorApi = {
      // extend: Select is held, so the D-pad grows the selection instead.
      move(dir, extend = false) {
        if (!editor.isEditable) return;
        editor.commands.focus();
        const sel = window.getSelection();
        const map = { up: ["backward", "line"], down: ["forward", "line"], left: ["backward", "character"], right: ["forward", "character"] };
        sel?.modify?.(extend ? "extend" : "move", ...map[dir]);
      },
      focus: () => editor.commands.focus(),
      // The screen got shorter (the keyboard came up): bring the caret back into view.
      revealCaret: () => editor.isFocused && editor.commands.scrollIntoView(),
      focusEnd: () => requestAnimationFrame(() => editor.isEditable && editor.commands.focus("end")),
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
    ro.observe(mount); // text reflows (e.g. a strip narrows it)
    return () => ro.disconnect();
  });

  onDestroy(() => {
    device.editorApi = null;
    editor?.destroy();
  });
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  class="host"
  class:strip-l={edge === "left"}
  class:strip-r={edge === "right"}
  class:no-lines={!device.showLines}
  style="--thumb:{thumb}px; --gut:{device.showLines ? (narrow ? 34 : 54) : narrow ? 14 : 22}px"
  bind:this={host}
  bind:clientWidth={hostW}
  onscroll={measure}
  onmousedowncapture={clickToEdit}
>
  <div class="gutter" aria-hidden="true">
    {#each gutter as g}
      {#if g.current}<span class="curline" style="top:{g.top}px; height:{g.height}px"></span>{/if}
      <span class="num" class:cur={g.current} style="top:{g.top}px; line-height:{g.lh}px">{g.n}</span>
    {/each}
  </div>
  {#if edge === "top"}<div class="book-wrap"><NoteImages mode="book" rowHeight={narrow ? 72 : 120} onmeasure={measure} /></div>{/if}
  <div class="mono" class:markup={device.showMarkup} class:editing={device.focus === "editor"} bind:this={mount}></div>
  {#if edge === "bottom"}<div class="book-wrap"><NoteImages mode="book" rowHeight={narrow ? 72 : 120} onmeasure={measure} /></div>{/if}
  {#if edge === "left" || edge === "right"}<NoteImages mode="strip" side={edge} {gutter} {thumb} />{/if}
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
  /* Images: a scrapbook lines up with the text; a strip takes a column */
  .book-wrap {
    margin-left: var(--gut);
  }
  /* Left strip: outside the line numbers, so they stay beside their text */
  .host.strip-l .mono {
    margin-left: calc(var(--gut) + var(--thumb) + 14px);
  }
  .host.strip-l .gutter {
    left: calc(var(--thumb) + 14px);
  }
  :global(.device) .host.strip-r {
    padding-right: calc(var(--thumb) + 24px);
  }
  .gutter {
    position: absolute;
    inset: 0 auto 0 0;
    width: var(--gut);
    pointer-events: none;
  }
  .num {
    position: absolute;
    right: 18px;
    line-height: 26px;
    font-size: 15px;
    color: #3d4b3b;
  }
  /* Line numbers off: the gutter shrinks to a margin, the current line stays lit */
  .no-lines .num {
    display: none;
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
    margin-left: var(--gut);
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
  /* Markup mode (Configure → Show markup): the markers show as text */
  .mono.markup :global(h1::before) { content: "# "; }
  .mono.markup :global(h2::before) { content: "## "; }
  .mono.markup :global(:is(h3, h4, h5, h6)::before) { content: "### "; }
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
  .mono.markup :global(strong::before),
  .mono.markup :global(strong::after) { content: "**"; }
  .mono :global(em) { font-style: italic; color: #e3ecd9; }
  .mono.markup :global(em::before),
  .mono.markup :global(em::after) { content: "_"; }
  .mono.markup :global(s::before),
  .mono.markup :global(s::after) { content: "~~"; }
  .mono :global(code) { color: #9fd8c4; }
  .mono.markup :global(code::before),
  .mono.markup :global(code::after) { content: "`"; }
  .mono :global(mark) { background: rgba(255, 209, 102, 0.22); color: inherit; }
  .mono :global(a) { color: #8fd3ff; text-decoration: underline; text-underline-offset: 3px; }
  .mono :global(sup),
  .mono :global(sub) { line-height: 0; font-size: 0.75em; }
  .mono :global(blockquote) { color: #a9bb9d; font-style: italic; }
  .mono.markup :global(blockquote p::before) { content: "> "; }
  .mono :global(pre) { color: #9fd8c4; white-space: pre-wrap; }
  .mono :global(pre code::before),
  .mono :global(pre code::after) { content: none; }
  /* Divider: a line of dashes, one grid row tall */
  .mono :global(hr) { border: none; height: 26px; margin: 0; position: relative; }
  .mono.markup :global(hr::before) { content: "---"; color: #4f6150; }

  /* Styled mode (default): no markers; headings a step bigger on their own
     taller line, so it's still monospace line by line */
  .mono:not(.markup) :global(h1) { font-size: 1.5em; line-height: 38px; }
  .mono:not(.markup) :global(h2) { font-size: 1.28em; line-height: 32px; }
  .mono:not(.markup) :global(:is(h3, h4, h5, h6)) { font-size: 1.12em; line-height: 28px; }
  .mono:not(.markup) :global(code:not(pre code)) { background: rgba(159, 216, 196, 0.1); border-radius: 3px; padding: 0 0.3ch; }
  .mono:not(.markup) :global(pre) { background: rgba(159, 216, 196, 0.06); border-radius: 4px; padding: 0 1ch; }
  .mono:not(.markup) :global(blockquote) { border-left: 2px solid #4f6150; padding-left: 1.5ch; }
  .mono:not(.markup) :global(hr) { background: linear-gradient(transparent 12px, rgba(213, 228, 198, 0.18) 12px 13px, transparent 13px); }

  /* Lists: markers drawn as text, two-space indent per level */
  .mono :global(ul),
  .mono :global(ol) { list-style: none; padding-left: 0; }
  .mono :global(li li),
  .mono :global(li [data-type="taskList"]) { padding-left: 2ch; }
  .mono :global(ul:not([data-type]) > li > p:first-child::before) { content: "• "; }
  .mono.markup :global(ul:not([data-type]) > li > p:first-child::before) { content: "- "; }
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
  :global(.portrait) .num { right: 10px; font-size: 13px; line-height: 22px; }
  :global(.portrait) .mono { font-size: 13px; }
  :global(.portrait) .mono :global(.ProseMirror *) { line-height: 22px; }
</style>
