<script>
  import { onMount, onDestroy } from "svelte";
  import { Editor } from "@tiptap/core";
  import { StarterKit } from "@tiptap/starter-kit";
  import BubbleMenu from "@tiptap/extension-bubble-menu";
  import FloatingMenu from "@tiptap/extension-floating-menu";
  import Color from "@tiptap/extension-color";
  import TextStyle from "@tiptap/extension-text-style";
  import Highlight from "@tiptap/extension-highlight";
  import Superscript from "@tiptap/extension-superscript";
  import Subscript from "@tiptap/extension-subscript";
  import Link from "@tiptap/extension-link";
  import Underline from "@tiptap/extension-underline";
  import TaskList from "@tiptap/extension-task-list";
  import TaskItem from "@tiptap/extension-task-item";
  import TextAlign from "@tiptap/extension-text-align";
  import Image from "@tiptap/extension-image";

  import { goto } from "$app/navigation";
  import { db } from "$lib/db.js";
  import { v4 as uuidv4 } from "uuid";
  import {
    isFullscreen,
    placementMode,
    selectedCoordinates,
    editorCoordinates,
    isMapVisible,
  } from "$lib/stores.js";
  import { browser } from "$app/environment";

  let emojis = [
    "ʕ•́ᴥ•̀ʔっ",
    "(ɔ◔‿◔)ɔ ♥",
    "(❛‿❛✿̶̥̥)",
    "(¬‿¬)",
    "clippy who?",
    "you got this!",
    "heyy cutie ;)",
    "ganbatte!",
  ];
  let bubbleMenu;
  let floatingMenu;
  let element;
  let editor;

  let { note = null } = $props();

  let _title = $state(note?.title || "");
  let body = $state(note?.text || "");
  let treemoji = $state(note?.icon || "/Tree2.png");
  let mapX = $state(note?.mapX || null);
  let mapY = $state(note?.mapY || null);
  let showTreeSelector = $state(false);

  // Effect to reset component state when the note prop changes
  $effect(() => {
    _title = note?.title || "";
    body = note?.text || "";
    treemoji = note?.icon || "/Tree2.png";
    mapX = note?.mapX || null;
    mapY = note?.mapY || null;

    if (editor && body !== editor.getHTML()) {
      editor.commands.setContent(body);
    }
  });

  $effect(() => {
    if ($selectedCoordinates) {
      mapX = $selectedCoordinates.x;
      mapY = $selectedCoordinates.y;
      // Reset coordinates after selection
      selectedCoordinates.set(null);
    }
  });

  $effect(() => {
    if (mapX !== null && mapY !== null) {
      editorCoordinates.set({ x: mapX, y: mapY });
    } else {
      editorCoordinates.set(null);
    }
  });

  let emojiMessage = $state("(─‿‿─)");
  let timer = setInterval(() => {
    emojiMessage = emojis[Math.floor(Math.random() * emojis.length)];
  }, 1000 * 1);
  let size = $state(4); // Default to size 4 which is 'Paragraph'

  // --- Reactive state for button highlighting ---
  let isBold = $state(false);
  let isItalic = $state(false);
  let isStrike = $state(false);
  let isCode = $state(false);
  let isBulletList = $state(false);
  let isOrderedList = $state(false);
  let isBlockquote = $state(false);
  let isParagraph = $state(true);
  let activeHeadingLevel = $state(0);
  let isUnderline = $state(false);
  let isLink = $state(false);
  let isSuperscript = $state(false);
  let isSubscript = $state(false);
  let isHighlight = $state(false);
  let isTaskList = $state(false);
  let textAlign = $state("left");
  let showAlignDropdown = $state(false);
  let showListDropdown = $state(false);
  let showColorPalette = $state(false);

  const alignments = [
    { name: "left", icon: "/icons/left-align.svg", label: "Align Left" },
    { name: "center", icon: "/icons/center-align.svg", label: "Align Center" },
    { name: "right", icon: "/icons/right-align.svg", label: "Align Right" },
    {
      name: "justify",
      icon: "/icons/justify-left.svg",
      label: "Align Justify",
    },
  ];

  const lists = [
    {
      name: "bulletList",
      icon: "/icons/u-list.svg",
      label: "Bullet List",
      action: () => editor.chain().focus().toggleBulletList().run(),
    },
    {
      name: "orderedList",
      icon: "/icons/o-list.svg",
      label: "Ordered List",
      action: () => editor.chain().focus().toggleOrderedList().run(),
    },
    {
      name: "taskList",
      icon: "/icons/checkmark.svg",
      label: "Task List",
      action: () => editor.chain().focus().toggleTaskList().run(),
    },
  ];

  let activeListType = $derived(
    isBulletList
      ? "bulletList"
      : isOrderedList
        ? "orderedList"
        : isTaskList
          ? "taskList"
          : "bulletList" // default
  );

  let trees = [
    { name: "/Snow_tree2.png", filePath: "/Snow_tree2.png" },
    { name: "/t-yellow.png", filePath: "/t-yellow.png" },
    { name: "/t-green.png", filePath: "/t-green.png" },
    { name: "/Flower_tree2.png", filePath: "/Flower_tree2.png" },
    { name: "/Palm_tree2_2.png", filePath: "/Palm_tree2_2.png" },
    { name: "/Moss_tree2.png", filePath: "/Moss_tree2.png" },
    { name: "/t-red.png", filePath: "/t-red.png" },
    {
      name: "/Snow_christmass_tree2.png",
      filePath: "/Snow_christmass_tree2.png",
    },
    { name: "/Tree2.png", filePath: "/Tree2.png" },
    { name: "/t-blue.png", filePath: "/t-blue.png" },
    { name: "/Palm_tree1_2.png", filePath: "/Palm_tree1_2.png" },
  ];

  let emojiTabName = "treemoji";

  let textColors = [
    { name: "Red", hex: "#ef476f" },
    { name: "Blue", hex: "#00b4d8" },
    { name: "Green", hex: "#06d6a0" },
    { name: "Yellow", hex: "#ffd166" },
    // { name: "White", hex: "#FCFCFC" },
  ];

  function addLink() {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL", previousUrl);
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }

  function addImage() {
    const url = window.prompt("Image URL");
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }

  function handleClickOutside(event) {
    if (showTreeSelector && !event.target.closest(".tree-selector")) {
      showTreeSelector = false;
    }
    if (showAlignDropdown && !event.target.closest(".align-dropdown")) {
      showAlignDropdown = false;
    }
    if (showListDropdown && !event.target.closest(".list-dropdown")) {
      showListDropdown = false;
    }
  }

  onMount(() => {
    editor = new Editor({
      element: element,
      extensions: [
        Color,
        TextStyle,
        Highlight,
        Superscript,
        Subscript,
        Underline,
        Image,
        Link.configure({ openOnClick: true, autolink: true }),
        TaskList,
        TaskItem.configure({ nested: true }),
        TextAlign.configure({ types: ["heading", "paragraph"] }),
        StarterKit,
        FloatingMenu.configure({
          element: floatingMenu,
        }),
        BubbleMenu.configure({
          element: bubbleMenu,
        }),
      ],
      content: body,
      onTransaction: () => {
        // Update all reactive states on every transaction
        isBold = editor.isActive("bold");
        isItalic = editor.isActive("italic");
        isStrike = editor.isActive("strike");
        isCode = editor.isActive("code");
        isBulletList = editor.isActive("bulletList");
        isOrderedList = editor.isActive("orderedList");
        isBlockquote = editor.isActive("blockquote");
        isParagraph = editor.isActive("paragraph");
        isUnderline = editor.isActive("underline");
        isLink = editor.isActive("link");
        isSuperscript = editor.isActive("superscript");
        isSubscript = editor.isActive("subscript");
        isHighlight = editor.isActive("highlight");
        isTaskList = editor.isActive("taskList");

        if (editor.isActive({ textAlign: "left" })) {
          textAlign = "left";
        } else if (editor.isActive({ textAlign: "center" })) {
          textAlign = "center";
        } else if (editor.isActive({ textAlign: "right" })) {
          textAlign = "right";
        } else if (editor.isActive({ textAlign: "justify" })) {
          textAlign = "justify";
        }

        let foundLevel = 0;
        for (let i = 1; i <= 6; i++) {
          if (editor.isActive("heading", { level: i })) {
            foundLevel = i;
            break;
          }
        }
        activeHeadingLevel = foundLevel;

        if (foundLevel > 0) {
          size = foundLevel;
        } else if (isParagraph) {
          size = 4; // Set size to 4 for paragraph
        }
      },
    });
    if (browser) {
      window.addEventListener("click", handleClickOutside);
    }
  });

  onDestroy(() => {
    editor?.destroy();
    clearInterval(timer);
    if (browser) {
      window.removeEventListener("click", handleClickOutside);
    }
    editorCoordinates.set(null);
  });

  async function saveNote() {
    const noteData = {
      title: _title,
      text: editor.getHTML(),
      icon: treemoji,
      createdAt: note?.createdAt || new Date(),
      updatedAt: new Date(),
      mapX: mapX,
      mapY: mapY,
    };

    if (note) {
      await db.notes.update(note.id, noteData);
      await goto(`/read/${note.noteid}`);
    } else {
      noteData.noteid = uuidv4();
      const newId = await db.notes.add(noteData);
      await goto(`/read/${noteData.noteid}`);
    }
  }
</script>

<div class="app-bg">
  <div class="app" class:fullscreen-editor={$isFullscreen}>
    <button
      type="button"
      class="ff"
      on:click={() => isFullscreen.set(!$isFullscreen)}
      class:shrink={$isFullscreen}
    >
      &nbsp;
    </button>
    <div class="controls">
      <div class="control-head">
        <input
          type="text"
          class="title"
          bind:value={_title}
          name="title"
          placeholder="<title>"
        />
        <div class="dashboard">
          <button type="button" on:click={saveNote} class="button-2">
            Save
          </button>
        </div>
      </div>

      <div class="control-mid">
        <div class="fixed-menu">
          <div class="toolbar-grid">
            <!-- Group 3: Formatting -->
            <div class="quadrant-top-left quadrant">
              <button
                on:click={() => editor.chain().focus().toggleBold().run()}
                class:active={isBold}
                aria-label="Bold"><b>B</b></button
              >
              <button
                on:click={() => editor.chain().focus().toggleItalic().run()}
                class:active={isItalic}
                aria-label="Italic"><i>I</i></button
              >
              <button
                on:click={() => editor.chain().focus().toggleStrike().run()}
                class:active={isStrike}
                aria-label="Strike"><strike>S</strike></button
              >
              <button
                on:click={() => editor.chain().focus().toggleUnderline().run()}
                class:active={isUnderline}
                aria-label="Underline"><u>U</u></button
              >
              <button
                on:click={() => editor.chain().focus().toggleCode().run()}
                class:active={isCode}
                aria-label="Code"
                ><img
                  src="/icons/code.svg"
                  alt="Code"
                  class="toolbar-icon"
                /></button
              >
              <button
                on:click={() => editor.chain().focus().toggleBlockquote().run()}
                class:active={isBlockquote}
                aria-label="Blockquote"
                ><img
                  src="/icons/quote.svg"
                  alt="Blockquote"
                  class="toolbar-icon"
                /></button
              >
            </div>
            <!-- Ungrouped Block Items -->
            <div class="quadrant-top-right quadrant">
              <button
                on:click={() => editor.chain().focus().setParagraph().run()}
                class:active={isParagraph}
                aria-label="Paragraph">¶</button
              >
              <div class="list-dropdown">
                <button
                  class="dropdown-trigger"
                  on:click={() => (showListDropdown = !showListDropdown)}
                  aria-label="List Type"
                >
                  <img
                    src={lists.find((a) => a.name === activeListType)?.icon ||
                      "/icons/u-list.svg"}
                    alt="Current list type"
                    class="toolbar-icon"
                  />
                  <span class="dropdown-arrow">▼</span>
                </button>
                {#if showListDropdown}
                  <div class="dropdown-menu">
                    {#each lists as list (list.name)}
                      <button
                        on:click={() => {
                          list.action();
                          showListDropdown = false;
                        }}
                        class:active={(list.name === "bulletList" &&
                          isBulletList) ||
                          (list.name === "orderedList" && isOrderedList) ||
                          (list.name === "taskList" && isTaskList)}
                        aria-label={list.label}
                      >
                        <img
                          src={list.icon}
                          alt={list.label}
                          class="toolbar-icon"
                        />
                      </button>
                    {/each}
                  </div>
                {/if}
              </div>
              <button on:click={addImage} aria-label="Add Image"
                ><img
                  src="/icons/image.svg"
                  alt="Add Image"
                  class="toolbar-icon"
                /></button
              >
              <button
                on:click={() => editor.chain().focus().setHardBreak().run()}
                aria-label="Hard Break">↵</button
              >
            </div>

            <!-- Group 1 & 2: Style, Color, Scripts, Alignment -->
            <div class="quadrant-bottom-left quadrant">
              <div id="headingSizeSelector">
                <button
                  class="thin-btn"
                  on:click={() => {
                    let newSize = size < 6 ? size + 1 : size;
                    size = newSize;
                    if (newSize === 4) {
                      editor.chain().focus().setParagraph().run();
                    } else {
                      editor
                        .chain()
                        .focus()
                        .setHeading({ level: newSize })
                        .run();
                    }
                  }}>-</button
                >
                <button
                  class:active={activeHeadingLevel > 0}
                  on:click={() => {
                    if (size !== 4) {
                      editor
                        .chain()
                        .focus()
                        .toggleHeading({ level: size })
                        .run();
                    }
                  }}>{size === 4 ? "¶" : `${36 - size * 4}pt`}</button
                >
                <button
                  class="thin-btn"
                  on:click={() => {
                    let newSize = size > 1 ? size - 1 : size;
                    size = newSize;
                    if (newSize === 4) {
                      editor.chain().focus().setParagraph().run();
                    } else {
                      editor
                        .chain()
                        .focus()
                        .setHeading({ level: newSize })
                        .run();
                    }
                  }}>+</button
                >
              </div>
              <button
                on:click={addLink}
                class:active={isLink}
                aria-label="Add Link"
                ><img
                  src="/icons/link.svg"
                  alt="Add Link"
                  class="toolbar-icon"
                /></button
              >
              <button
                on:click={() => editor.chain().focus().toggleHighlight().run()}
                class:active={isHighlight}
                aria-label="Highlight">H</button
              >
              <button
                on:click={() => editor.chain().focus().toggleSubscript().run()}
                class:active={isSubscript}>x₂</button
              >
              <button
                on:click={() =>
                  editor.chain().focus().toggleSuperscript().run()}
                class:active={isSuperscript}>x²</button
              >
            </div>
            <div class="quadrant-bottom-right quadrant">
              <div class="align-dropdown">
                <button
                  class="dropdown-trigger"
                  on:click={() => (showAlignDropdown = !showAlignDropdown)}
                  aria-label="Text Alignment"
                >
                  <img
                    src={alignments.find((a) => a.name === textAlign)?.icon ||
                      "/icons/left-align.svg"}
                    alt="Current alignment"
                    class="toolbar-icon"
                  />
                  <span class="dropdown-arrow">▼</span>
                </button>
                {#if showAlignDropdown}
                  <div class="dropdown-menu">
                    {#each alignments as alignment (alignment.name)}
                      <button
                        on:click={() => {
                          editor
                            .chain()
                            .focus()
                            .setTextAlign(alignment.name)
                            .run();
                          showAlignDropdown = false;
                        }}
                        class:active={textAlign === alignment.name}
                        aria-label={alignment.label}
                      >
                        <img
                          src={alignment.icon}
                          alt={alignment.label}
                          class="toolbar-icon"
                        />
                      </button>
                    {/each}
                  </div>
                {/if}
              </div>
              <div class="color-palette-container">
                <button
                  class="palette-trigger"
                  on:click={() => (showColorPalette = !showColorPalette)}
                  aria-label="Toggle Color Palette"
                >
                  <img
                    src="/icons/palette.svg"
                    alt="Color Palette"
                    class="toolbar-icon"
                  />
                </button>
                <div class="color-palette" class:expanded={showColorPalette}>
                  {#each textColors as color}
                    <button
                      type="button"
                      class="color-swatch"
                      style:background-color={color.hex}
                      on:click={() => {
                        editor.chain().focus().setColor(color.hex).run();
                        showColorPalette = false;
                      }}
                      class:active={editor?.isActive("textStyle", {
                        color: color.hex,
                      })}
                    />
                  {/each}
                  <button
                    class="color-swatch"
                    on:click={() => {
                      editor.chain().focus().unsetColor().run();
                      showColorPalette = false;
                    }}>X</button
                  >
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="side-controls">
          <div class="selector-buttons">
            <button
              class="selector-trigger"
              on:click={() => {
                placementMode.set(true);
                isMapVisible.set(true);
              }}
            >
              <img src="/map.svg" alt="Select map location" />
            </button>

            <div class="tree-selector">
              <button
                class="selector-trigger"
                on:click={() => {
                  showTreeSelector = !showTreeSelector;
                }}
              >
                <img src={treemoji} alt="Selected tree icon" />
              </button>
              {#if showTreeSelector}
                <div class="trees-grid">
                  {#each trees as tree (tree.filePath)}
                    <label>
                      <input
                        type="radio"
                        name={emojiTabName}
                        bind:group={treemoji}
                        value={tree.filePath}
                        on:change={() => {
                          showTreeSelector = false;
                        }}
                      />
                      <img src={tree.filePath} alt={tree.name} />
                    </label>
                  {/each}
                </div>
              {/if}
            </div>
          </div>

          <button type="button" class="treemo"> {emojiMessage} </button>
        </div>
      </div>
    </div>

    <div bind:this={element} class="xy" />
  </div>
</div>

<div class="bubble-menu" bind:this={bubbleMenu}>
  <button
    type="button"
    on:click={() => editor.chain().focus().toggleBold().run()}
    class:active={editor?.isActive("bold")}
  >
    <strong>B</strong>
  </button>
  <button
    type="button"
    on:click={() => editor.chain().focus().toggleItalic().run()}
    class:active={editor?.isActive("italic")}
  >
    <em>I</em>
  </button>
  <button
    type="button"
    on:click={() => editor.chain().focus().toggleStrike().run()}
    class:active={editor?.isActive("strike")}
  >
    <strike>S</strike>
  </button>
</div>

<div class="bubble-menu" bind:this={floatingMenu}>
  <button
    type="button"
    on:click={() => editor.chain().focus().toggleCode().run()}
    class:active={editor?.isActive("code")}
  >
    ❮❯
  </button>
  <button
    type="button"
    on:click={() => editor.chain().focus().toggleBulletList().run()}
    class:active={editor?.isActive("bulletList")}
  >
    <img src="/icons/u-list.svg" alt="" class="toolbar-icon" />
  </button>
  <button
    type="button"
    on:click={() => editor.chain().focus().toggleOrderedList().run()}
    class:active={editor?.isActive("orderedList")}
  >
    <img src="/icons/o-list.svg" alt="" class="toolbar-icon" />
  </button>
  <button
    type="button"
    on:click={() => editor.chain().focus().toggleBlockquote().run()}
    class:active={editor?.isActive("blockQuote")}
  >
    ""
  </button>
  <button
    type="button"
    on:click={() => editor.chain().focus().setHardBreak().run()}
  >
    ↵
  </button>
</div>

<style>
  /* --- BASE LAYOUT --- */
  .app-bg {
    width: 80%;
    height: 90%;
    z-index: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    margin: auto;
    border-radius: 20px;
    overflow: hidden;
    /* box-shadow: 16px 16px rgba(0, 0, 0, 0.25); */
    box-shadow:
      rgba(0, 0, 0, 0.4) 0px 2px 4px,
      rgba(0, 0, 0, 0.3) 0px 6px 9px -3px,
      rgba(0, 0, 0, 0.2) 0px -4px 0px inset;
  }
  .app {
    position: relative;
    width: 100%;
    height: 100%;
    border: none;
    display: flex;
    flex-direction: column;
  }

  /* --- GENERAL CONTROLS & BUTTONS --- */
  button {
    transition: all 0.1s ease;
    position: relative;
    width: fit-content;
    font-family: "Fira Code";
    box-shadow:
      rgba(6, 24, 44, 0.4) 0px 0px 0px 2px,
      rgba(6, 24, 44, 0.65) 0px 4px 6px -1px,
      rgba(255, 255, 255, 0.08) 0px 1px 0px inset;
  }
  button:hover {
    transform: translateY(-3px);
  }
  button img {
    position: relative;
    top: 2px;
    resize: none;
  }

  /* --- TOP CONTROLS --- */
  .controls {
    display: flex;
    height: fit-content;
    flex-direction: column;
    background-color: var(--bg-secondary);
    width: 100%;
    box-shadow:
      rgba(0, 0, 0, 0.2) -8px 0px 0px inset,
      rgba(0, 0, 0, 0.2) 8px 0px 0px inset;
  }
  .control-head {
    display: flex;
    z-index: 2;
    background-color: var(--charcoal);
    /* border: 1px solid white; */
    box-shadow:
      rgba(40, 40, 40, 1) 0px 4px 0px 0px inset,
      rgba(40, 40, 40, 1) 8px 0px 0px 0px inset,
      rgba(40, 40, 40, 1) -8px 0px 0px 0px inset;
    border-radius: 20px 20px 0 0;
  }
  .title {
    font-family: "DM Serif Text";
    font-size: 1.5rem;
    width: 100%;
    background-color: var(--charcoal);
    background-color: transparent;
    color: rgb(206, 206, 206);
    border: none;
    padding: 1rem 1.25rem;
    user-select: contain;
    transition: all 0.1s ease-in-out;
  }
  .title:hover,
  .title:focus {
    outline: none;
  }
  .dashboard {
    width: fit-content;
    display: flex;
    padding: 1rem;
    gap: 25px;
    justify-items: stretch;
    align-items: stretch;
  }
  .button-2 {
    margin: auto auto 0;
    padding: 0.5rem 1rem;
    background-color: var(--fern);
    border: 3px solid var(--hunter-green);
    border-radius: 10px;
    color: var(--text-main);
    font-weight: 600;
    font-size: 1rem;
  }
  .button-2:hover {
    transform: translateY(-3px);
    color: var(--highlight-text);
    background-color: var(--dry-sage);
    border-color: var(--charcoal);
  }

  /* --- MIDDLE CONTROLS (TOOLBAR & SIDE) --- */
  .control-mid {
    width: 100%;
    display: flex;
  }

  /* --- TOOLBAR --- */
  .fixed-menu {
    padding: 1rem;
    position: relative;
    height: fit-content;
    flex-grow: 1;
  }
  .toolbar-grid {
    display: grid;
    grid-template-columns: max-content max-content;
    gap: 10px 20px;
  }
  .quadrant {
    display: flex;
    gap: 5px;
    align-items: center;
  }
  .quadrant button:not(.color-swatch) {
    display: flex;
    justify-content: center;
    align-items: center;
    width: var(--control-button-height);
    height: var(--control-button-height);
    background-color: var(--accent-primary);
    border: 2px solid var(--hunter-green);
    border-radius: 4px;
    color: var(--text-main);
    font-weight: 500;
    font-size: 1rem;
    padding: 0;
  }
  .quadrant button.active {
    transform: translateY(-3px);
    background-color: var(--highlight);
    color: var(--highlight-text);
    border-color: var(--highlight-text);
  }
  .quadrant button.active .toolbar-icon {
    filter: invert(0);
  }
  .toolbar-icon {
    height: 16px;
    width: 16px;
    filter: invert(1);
    transition: filter 0.2s ease;
  }

  /* HEADING SELECTOR */
  #headingSizeSelector {
    display: flex;
    gap: 5px;
  }
  #headingSizeSelector button {
    width: 6ch;
    padding: 0 0.5rem;
    background-color: #588157;
    border-color: #3a5a40;
    font-weight: 600;
  }
  #headingSizeSelector button.active {
    background-color: #a3b18a;
    border-color: #38362e;
    color: #38362e;
  }
  #headingSizeSelector .thin-btn {
    width: 20px;
    padding: 0;
    background-color: #699768;
  }

  /* DROPDOWNS */
  .align-dropdown,
  .list-dropdown {
    position: relative;
  }
  .quadrant .dropdown-trigger {
    width: calc(var(--control-button-height) + 10px) !important;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 5px;
    border: 1px solid white;
  }
  .dropdown-arrow {
    font-size: 0.6rem;
    line-height: 1;
    padding: 0 2px;
  }
  .dropdown-menu {
    width: var(--control-button-height);
    position: absolute;
    top: 110%;
    left: 0;
    background-color: var(--silver-light);
    border-radius: 4px;
    display: flex;
    flex-direction: column;
    gap: 2px;
    z-index: 10;
    padding: 4px;
  }
  .dropdown-menu button {
    width: 100%;
  }

  /* --- SIDE CONTROLS --- */
  .side-controls {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    margin-left: auto;
  }
  .selector-buttons {
    display: flex;
    gap: 0.5rem;
  }
  .tree-selector {
    position: relative;
  }
  .selector-trigger {
    height: 40px;
    width: 90px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--accent-primary);
    border-radius: 8px;
    cursor: pointer;
    border: 3px solid var(--hunter-green);
  }
  .selector-trigger img {
    height: 28px;
    aspect-ratio: 1;
  }
  .trees-grid {
    position: absolute;
    top: 110%;
    left: 50%;
    transform: translateX(-50%);
    z-index: 100;
    background-color: #38362e;
    border: 2px solid #dad7cd;
    border-radius: 8px;
    padding: 10px;
    height: 150px;
    width: 300px;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(50px, 1fr));
    gap: 10px;
    overflow-y: scroll;
    scrollbar-width: none;
  }
  .trees-grid input {
    display: none;
  }
  .trees-grid label {
    padding: 5px;
    display: flex;
    border-radius: 4px;
    background-color: #38362e;
    cursor: pointer;
  }
  .trees-grid label:hover {
    background-color: #588157;
  }
  .trees-grid label img {
    width: 100%;
    aspect-ratio: 1;
    object-fit: contain;
  }
  label:has(input:checked) {
    background-color: var(--bg-secondary);
    box-shadow:
      rgba(6, 24, 44, 0.4) 0px 0px 0px 2px,
      rgba(6, 24, 44, 0.65) 0px 4px 6px -1px,
      rgba(255, 255, 255, 0.08) 0px 1px 0px inset;
  }
  .treemo {
    width: 200px;
    font-size: 1rem;
    background-color: #588157;
    border: 3px solid #23251e;
    border-radius: 10px;
    color: var(--highlight-text);
    box-shadow: none;
    height: 40px;
  }

  /* --- EDITOR AREA --- */
  .xy {
    box-sizing: border-box;
    position: relative;
    width: 100%;
    height: 80%;
    background-color: var(--editor-bg);
    color: var(--text-main);
    line-height: 1.6rem;
    font-family: "Rubik", sans-serif;
    border: none;
    padding: 30px 50px 0px 50px;
    user-select: contain;
    transition: all 0.1s ease-in-out;
    border-radius: 0 0 20px 20px;
    overflow-y: scroll;
    scrollbar-width: none;
    z-index: 1;
    box-shadow: rgba(0, 0, 0, 0.2) 0px -8px 0px 8px inset;
  }

  /* --- FULLSCREEN & UTILITY --- */
  .ff {
    border-radius: 12px;
    position: absolute;
    height: 50px;
    width: 50px;
    right: 12px;
    bottom: 20px;
    z-index: 999;
    opacity: 1;
    filter: invert();
    mix-blend-mode: darken;
    border: none;
    background-image: url("/icons/expand.svg");
    background-position: center;
    background-size: contain;
    background-repeat: no-repeat;
    box-shadow: none;
  }
  .ff:hover {
    opacity: 1;
    mix-blend-mode: screen;
  }
  .fullscreen-editor {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    max-width: 100vw;
    z-index: 1000;
    margin: 0;
    /* border-radius: 0; */
  }
  .shrink {
    background-image: url("/icons/shrink.svg");
  }

  /* --- BUBBLE & FLOATING MENUS --- */
  .bubble-menu {
    position: relative;
    display: flex;
    border-radius: 0.5rem;
    gap: 5px;
    visibility: hidden;
  }
  .bubble-menu button {
    padding: 4px 8px;
    background-color: var(--silver-dark);
    border: 2px solid var(--silver-light);
    border-radius: 4px;
    color: var(--silver-white);
  }
  .bubble-menu button.active,
  .bubble-menu button:hover {
    transform: translateY(-3px);
    background-color: var(--silver-light);
    color: var(--silver-medium);
    border-color: var(--silver-medium);
  }

  /* COLOR PALETTE */
  .color-palette-container {
    display: flex;
    align-items: center;
    height: var(--control-button-height);
  }
  .color-palette {
    display: flex;
    gap: 5px;
    align-items: center;
    width: 0;
    overflow: hidden;
    transition: all 0.2s ease-in-out;
  }
  .color-palette.expanded {
    width: 100px;
    gap: 5px;
    padding-left: 5px;
    padding-right: 10px;
    height: var(--control-button-height);
  }
  .color-swatch {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-shrink: 0;
    width: 15px;
    height: 20px;
    cursor: pointer;
    border: 1px solid var(--silver-light);
    background-color: var(--text-main);
    color: var(--charcoal);
    border-radius: 3px;
  }
  .color-swatch.active {
    border-color: #fff;
    transform: scale(1.1);
  }

  @media (max-width: 768px) {
    .app-bg {
      width: 100%;
      height: 100%;
      border-radius: 0;
      box-shadow: none;
    }
    .control-mid {
      flex-direction: column;
    }
    .fixed-menu {
      overflow-x: auto;
      padding: 0.5rem;
    }
    .toolbar-grid {
      display: flex;
      flex-wrap: nowrap;
      width: max-content;
      gap: 1rem;
    }
    .quadrant {
      flex-wrap: nowrap;
    }
    .side-controls {
      width: 100%;
      justify-content: space-between;
      margin-left: 0;
      padding: 0.5rem 1rem;
      border-top: 1px solid var(--bg-tertiary);
    }
    .selector-buttons {
      gap: 1rem;
      flex-grow: 0;
    }
    .treemo {
      flex-grow: 1;
      height: 100%;
      margin: 0;
    }
    .xy {
      padding: 1.5rem;
    }
    .title {
      padding: 0.75rem 1.5rem;
      font-size: 1.25rem;
    }
    .dashboard {
      padding: 0.75rem;
    }
  }
</style>
