<script>
  import Button from "./_buttons.svelte";
  import { onMount, onDestroy } from "svelte";
  import { Editor } from "@tiptap/core";
  import { StarterKit } from "@tiptap/starter-kit";
  import TaskItem from "@tiptap/extension-task-item";
  import TaskList from "@tiptap/extension-task-list";
  import BubbleMenu from "@tiptap/extension-bubble-menu";
  import Underline from "@tiptap/extension-underline";
  import FloatingMenu from "@tiptap/extension-floating-menu";
  import Color from "@tiptap/extension-color";
  import TextStyle from "@tiptap/extension-text-style";
  import { invalidateAll } from "$app/navigation";
  // import EmojiTab from "./emojiTab.svelte";

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
  export let saveDisabled = false;
  export let formAction = "?/create";
  export let _title = "";
  export let username;
  export let body = "";
  export let treemoji;
  

  $: emojiMessage = "(─‿‿─)";
  let timer = setInterval(() => {
    emojiMessage = emojis[Math.floor(Math.random() * emojis.length)];
  }, 1000 * 10);
  let size = 1;
  export let is_private = false;
  let ffToggle = false;

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

  let tg = "1";
  let emojiTabName = "treemoji";

  onMount(() => {
    editor = new Editor({
      element: element,
      extensions: [
        Color,
        TextStyle,
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
        editor = editor;
      },
    });
    // editor.chain().focus();
    document.getElementById(treemoji).checked = true;
  });

  onDestroy(() => {
    editor?.destroy();
  });
</script>

<div class="app-bg">
  <form
    style="position: relative"
    class="app"
    name="editor-form"
    id="editor-form"
    action={formAction}
    method="post"
  >
    <!-- svelte-ignore a11y_consider_explicit_label -->
    <button
      type="button"
      class="ff"
      on:click={() => {
        ffToggle = !ffToggle;
      }}
      class:shrink={ffToggle}
    >
      &nbsp;
    </button>
    <div class="controls">
      <!-- TITLE | EMOJI | SAVE -->
      <div class="control-head">
        <input type="text" class="title" bind:value={_title} name="title" placeholder="<title>" />
        <div class="dashboard">
          <button
            on:click={() => {
              is_private = !is_private;
            }}
            type="button"
            class="switcher"
            class:active={is_private}
          >
            <div class="switchLabel">
              {is_private ? "Private" : "Public"}
            </div>
            <div class="switchButton">
              <div class="X">&nbsp;</div>
            </div>
          </button>
          <button
            type="submit"
            class="button-2"
            disabled={saveDisabled}
            class:disabled={saveDisabled}
          >
            Save
          </button>
        </div>
      </div>

      <div class="control-mid">
        <div class="fixed-menu">
          <!-- FIXED MENU -->
          {#if editor}
            <div class="controls1">
              <div class="left">
                <button
                  type="button"
                  on:click={() => editor.chain().focus().unsetAllMarks().run()}
                  class:reset-btn={true}
                >
                  ↺
                </button>

                <button
                  type="button"
                  on:click={() => editor.chain().focus().toggleBold().run()}
                  class:active={editor.isActive("bold")}
                >
                  <strong>B</strong>
                </button>

                <button
                  type="button"
                  on:click={() => editor.chain().focus().toggleItalic().run()}
                  class:active={editor.isActive("italic")}
                >
                  <em>I</em>
                </button>

                <button
                  type="button"
                  on:click={() => editor.chain().focus().toggleStrike().run()}
                  class:active={editor.isActive("strike")}
                >
                  <strike>S</strike>
                </button>
              </div>

              <div class="right">
                <button
                  type="button"
                  on:click={() => editor.chain().focus().clearNodes().run()}
                  class:reset-btn={true}
                >
                  <!-- <strike>Format</strike> -->
                  ↺
                </button>

                <button
                  type="button"
                  on:click={() => editor.chain().focus().toggleCode().run()}
                  class:active={editor.isActive("code")}
                >
                  ❮❯
                </button>

                <button
                  type="button"
                  on:click={() =>
                    editor.chain().focus().toggleBulletList().run()}
                  class:active={editor.isActive("bulletList")}
                >
                  <img
                    src="/u-list.svg"
                    alt=""
                    srcset=""
                    style:height="16px"
                    style:width="16px"
                    style:filter="invert()"
                  />
                </button>

                <button
                  type="button"
                  on:click={() =>
                    editor.chain().focus().toggleOrderedList().run()}
                  class:active={editor.isActive("orderedList")}
                >
                  <img
                    src="/o-list.svg"
                    alt=""
                    srcset=""
                    style:height="16px"
                    style:width="16px"
                    style:filter="invert()"
                  />
                </button>

                <button
                  type="button"
                  on:click={() =>
                    editor.chain().focus().toggleBlockquote().run()}
                  class:active={editor.isActive("blockquote")}
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
            </div>
            <div class="controls2">
              <!-- svelte-ignore a11y_consider_explicit_label -->
              <div class="left">
                <button
                  type="button"
                  on:click={() => editor.chain().focus().setParagraph().run()}
                  class:active={editor.isActive("paragraph")}
                >
                  &nbsp;¶&nbsp;
                </button>
                <div id="headingSizeSelector">
                  <button
                    type="button"
                    class:reset-btn={true}
                    on:click={() => {
                      if (size < 6) {
                        size = size + 1;
                        editor
                          .chain()
                          .focus()
                          .toggleHeading({ level: size })
                          .run();
                      }
                    }}>-</button
                  >
                  <button
                    class:active={editor.isActive("heading", { level: size })}
                    type="button"
                    on:click={() => {
                      editor
                        .chain()
                        .focus()
                        .toggleHeading({ level: size })
                        .run();
                    }}>{36 - size * 4}pt</button
                  >
                  <button
                    class:reset-btn={true}
                    type="button"
                    on:click={() => {
                      if (size > 1) {
                        size = size - 1;
                        editor
                          .chain()
                          .focus()
                          .toggleHeading({ level: size })
                          .run();
                      }
                    }}>+</button
                  >
                </div>
              </div>
              <button type="button" class="button-3">
                <span>Hello, {username ?? "log-in please."}</span>
              </button>
            </div>
          {/if}
        </div>

        <button type="button" class="button-1"> {emojiMessage} </button>

        <div class="trees">
          {#each trees as tree (tree.filePath)}
            <label>
              {#if treemoji == tree.filePath}
                <input
                  type="radio"
                  name={emojiTabName}
                  id={tree.filePath}
                  bind:group={tg}
                  value={tree.filePath}
                  checked="true"
                />
              {:else}{/if}
              <input
                type="radio"
                name={emojiTabName}
                id={tree.filePath}
                bind:group={tg}
                value={tree.filePath}
              />
              <img
                src={tree.filePath}
                alt={tree.name}
                style="aspect-ratio: 1; height: 50px;"
              />
            </label>
          {/each}
          <!-- <input checked="checked" /> -->
        </div>
      </div>
    </div>

    <div bind:this={element} class="xy" class:editorFF={ffToggle} />
    <input type="hidden" name="body" value={editor?.getHTML()} />
    <input type="hidden" name="createdBy" value={username} />
    <input type="hidden" name="is_private" value={is_private} />
  </form>
</div>

<div class="bubble-menu" bind:this={bubbleMenu}>
  {#if editor}
    <button
      type="button"
      on:click={() => editor.chain().focus().toggleBold().run()}
      class:active={editor.isActive("bold")}
    >
      <strong>B</strong>
    </button>
    <button
      type="button"
      on:click={() => editor.chain().focus().toggleItalic().run()}
      class:active={editor.isActive("italic")}
    >
      <em>I</em>
    </button>
    <button
      type="button"
      on:click={() => editor.chain().focus().toggleStrike().run()}
      class:active={editor.isActive("strike")}
    >
      <strike>S</strike>
    </button>
  {/if}
</div>

<div class="bubble-menu" bind:this={floatingMenu}>
  {#if editor}
    <!-- <button
        on:click={() => editor.chain().focus().toggleBold().run()}
        class:active={editor.isActive("bold")}
      >
        Bold
      </button>
      <button
        on:click={() => editor.chain().focus().toggleItalic().run()}
        class:active={editor.isActive("italic")}
      >
        Italic
      </button>
      <button
        on:click={() => editor.chain().focus().toggleStrike().run()}
        class:active={editor.isActive("strike")}
      >
        Strike
      </button> -->
    <button
      type="button"
      on:click={() => editor.chain().focus().toggleCode().run()}
      class:active={editor.isActive("code")}
    >
      ❮❯
    </button>

    <button
      type="button"
      on:click={() => editor.chain().focus().toggleBulletList().run()}
      class:active={editor.isActive("bulletList")}
    >
      <img
        src="/u-list.svg"
        alt=""
        srcset=""
        style:height="16px"
        style:width="16px"
        style:filter="invert()"
      />
    </button>

    <button
      type="button"
      on:click={() => editor.chain().focus().toggleOrderedList().run()}
      class:active={editor.isActive("orderedList")}
    >
      <img
        src="/o-list.svg"
        alt=""
        srcset=""
        style:height="16px"
        style:width="16px"
        style:filter="invert()"
      />
    </button>

    <button
      type="button"
      on:click={() => editor.chain().focus().toggleBlockquote().run()}
      class:active={editor.isActive("blockQuote")}
    >
      ""
    </button>

    <button
      type="button"
      on:click={() => editor.chain().focus().setHardBreak().run()}
    >
      ↵
    </button>
  {/if}
</div>

<style>
  :global(.ProseMirror:focus) {
    outline: none;
  }
  :global(.ProseMirror-focused) {
    outline: none;
  }

  .app-bg {
    background-color: var(--page-bg);
    width: 100%;
    height: 100%;
    z-index: 0;
  }
  .app {
    position: relative;
    top: 0;
    width: 90%;
    height: 90%;
    margin-inline: 2rem;
    margin-block: 2rem;
    border: 4px solid var(--secondary-medium);
    border-radius: 20px;
    /* overflow: hidden; */
    background-color: var(--toprow-bg);
    display: flex;
    z-index: 1;
    flex-direction: column;
    box-shadow:
      rgba(0, 0, 0, 0.25) 0px 54px 55px,
      rgba(0, 0, 0, 0.12) 0px -12px 30px,
      rgba(0, 0, 0, 0.12) 0px 4px 6px,
      rgba(0, 0, 0, 0.17) 0px 12px 13px,
      rgba(0, 0, 0, 0.09) 0px -3px 5px;
  }
  .controls {
    display: flex;
    height: fit-content;
    flex-direction: column;
  }
  .control-head {
    display: flex;
    width: 100%;
    z-index: 2;
    /* overflow: hidden; */
    height: fit-content;
  }
  .title {
    position: relative;
    left: -10px;
    top: -3px;
    display: block;
    font-family: "DM Serif Text";
    font-size: 1.5rem;
    width: 100%;
    flex: 1;
    background-color: var(--app-bg-dark);
    color: var(--primary-button-text);
    border: 4px solid var(--app-bg-medium);
    padding: 0.75rem 1.25rem;
    user-select: contain;
    transition: all 0.1s ease-in-out;
    border-radius: 18px;
    transform: translateY(-5px);
    box-shadow:
      rgba(39, 30, 63, 0.4) 0px 5px,
      rgba(39, 30, 63, 0.3) 0px 10px,
      rgba(39, 30, 63, 0.2) 0px 15px,
      rgba(39, 30, 63, 0.1) 0px 20px,
      rgba(39, 30, 63, 0.05) 0px 25px;
    &:hover {
      outline: none;
      /* border: none; */
      /* box-shadow: rgba(0, 0, 0, 0.24) 10px 15px 15px; */
    }
    &:focus {
      outline: none;
      /* border: none; */
      /* box-shadow: rgba(0, 0, 0, 0.24) 10px 15px 15px; */
      /* transform: translateY(0px); */
    }
  }
  .dashboard {
    /* margin: 1rem 0 0 2rem; */
    /* padding-left: 2rem; */
    width: fit-content;
    display: flex;
    padding: 1rem;
    gap: 25px;
    /* flex-direction: column; */
    justify-items: stretch;
    align-items: stretch;
    /* background-color: #0077b6; */
  }

  .control-mid {
    width: 100%;
    display: flex;
  }

  .trees {
    /* padding-block: 1rem 2rem; */
    margin: auto auto auto 1rem;
    min-width: 50px;
    z-index: 4;
    height: 80px;
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    grid-template-rows: repeat(5, 1fr);
    grid-column-gap: 0px;
    grid-row-gap: 0px;
    overflow: scroll;
    scrollbar-width: none;
    /* background-color: #124559; */

    input {
      display: none;
    }
  }

  .trees label {
    position: relative;
    padding: 5px;
    display: flex;
    flex-direction: column-reverse;
    object-fit: contain;
    aspect-ratio: 1;
    /* border-radius: 50%; */
  }

  .trees:hover label {
    position: relative;
    &:hover {
      background-color: #e5e5e5;
      /* border-radius: 50%; */
    }
  }

  label:has(input:checked) {
    background-color: #e5e5e5;
    position: relative;
    z-index: 1;
    /* border-radius: 50%; */
    /* border: 2px solid white; */
    border-radius: 4px;
    box-shadow:
      rgba(6, 24, 44, 0.4) 0px 0px 0px 2px,
      rgba(6, 24, 44, 0.65) 0px 4px 6px -1px,
      rgba(255, 255, 255, 0.08) 0px 1px 0px inset;
  }
  label:has(:not(input:checked)) {
    position: absolute;
  }

  .xy {
    /* margin-top: auto; */
    /* scale: 1.02; */
    /* white-space: pre; */
    position: relative;
    line-height: 0.5rem;
    left: -13px;
    bottom: -10px;
    width: 100%;
    height: 100%;
    background-color: var(--app-bg-dark);
    color: #c9e4ca;
    font-size: 1rem;
    font-family: "Rubik", sans-serif;
    border: 5px solid var(--app-bg-medium);
    padding: 35px 15px 0 15px;
    user-select: contain;
    transition: all 0.1s ease-in-out;
    border-radius: 17px;
    overflow: scroll;
    scrollbar-width: none;
    z-index: 50;
    box-shadow:
      rgba(39, 30, 63, 0.4) 0px -5px,
      rgba(39, 30, 63, 0.3) 0px -10px,
      rgba(39, 30, 63, 0.2) 0px -15px,
      rgba(39, 30, 63, 0.1) 0px -20px,
      rgba(39, 30, 63, 0.05) 0px -25px;
  }

  button {
    transition: all 0.1s ease;
    position: relative;
    width: fit-content;
    font-family: "Fira Code";
    box-shadow:
      rgba(6, 24, 44, 0.4) 0px 0px 0px 2px,
      rgba(6, 24, 44, 0.65) 0px 4px 6px -1px,
      rgba(255, 255, 255, 0.08) 0px 1px 0px inset;
    &:hover {
      transform: translateY(-3px);
    }
  }

  button img {
    position: relative;
    top: 2px;
    resize: none;
  }

  .bubble-menu {
    position: relative;
    display: flex;
    border-radius: 0.5rem;
    transition:
      visibility 0.1s ease,
      opacity 0.1s ease;
    gap: 5px;
  }

  .bubble-menu button {
    position: relative;
    padding: 4px 8px;
    background-color: var(--primary-dark);
    border: 1px solid var(--primary-button-outline);
    border-radius: 4px;
    color: var(--primary-button-outline);
    font-family: "Fira Code";
  }

  .bubble-menu button.active {
    transform: translateY(-3px);
    background-color: var(--highlight);
    color: var(--tertiary-button-text);
  }
  .bubble-menu button:hover {
    transform: translateY(-3px);
    background-color: var(--highlight);
    color: var(--tertiary-button-text);
  }

  /* -------------- FIXED MENU ---------------------- */

  .fixed-menu {
    /* background-color: var(--toprow-bg); */
    padding-block: 1rem;
    padding-inline: 1rem;
    position: relative;
    height: fit-content;
  }

  .controls1 {
    display: flex;
    flex-wrap: wrap;
    gap: 25px;
    padding-bottom: 10px;
    width: fit-content;
  }
  .controls1 button {
    padding: 4px 8px;
    background-color: var(--primary-button-bg);
    border: 2px solid var(--primary-button-outline);
    border-radius: 4px;
    color: var(--primary-button-text);
    font-family: "Fira Code";
    font-weight: 500;
    font-size: 1rem;
  }

  .controls1 button.active {
    transform: translateY(-3px);
    background-color: var(--highlight);
    color: var(--tertiary-button-text);
  }
  .controls1 button:hover {
    transform: translateY(-3px);
  }
  .left,
  .right {
    display: flex;
    gap: 5px;
  }
  .left {
    width: 150px;
  }

  .controls2 {
    display: flex;
    flex-wrap: wrap;
    width: fit-content;
    gap: 25px;
    .left {
      gap: 12px;
    }
    & .left button {
      font-size: 0.8rem;
      padding: 2px 4px;
      color: #f4f3ee;
      background-color: #8a817c;
      border: 2px solid #bcb8b1;
      border-radius: 4px;
    }
    & .left button.active {
      display: block;
      color: #e0afa0;
      background-color: #463f3a;
    }
  }

  #headingSizeSelector {
    display: flex;
    gap: 5px;

    button {
      font-size: 0.8rem;
      padding: 2px 4px;
      color: #f4f3ee;
      background-color: #8a817c;
      border: 2px solid #bcb8b1;
    }
    button.active {
      display: block;
      color: #e0afa0;
      background-color: #463f3a;
    }
  }

  button.reset-btn {
    position: relative;
    background-color: #f4978e;
    color: #883334;
    border-color: #f28482;
  }
  button.reset-btn:hover {
    color: #f5cac3;
    background-color: #883334;
  }

  .button-1 {
    position: relative;
    min-width: 100px;
    width: fit-content;
    font-size: 1rem;
    padding: 0.5rem 1rem;
    margin: 0.75rem 0;
    background-color: var(--secondary-medium);
    border: 3px solid var(--secondary-dark);
    border-radius: 10px;
    color: var(--secondary-dark);
    font-family: "Fira Code";
    box-shadow: none;
  }
  .button-2 {
    margin: auto auto 0;
    position: relative;
    width: fit-content;
    padding: 0.5rem 1rem;
    background-color: var(--app-bg-light);
    border: 3px solid var(--app-bg-medium);
    border-radius: 10px;
    color: var(--app-bg-dark);
    font-family: "Fira Code";
    font-weight: 600;
    font-size: 1.5rem;

    &:hover {
      transform: translateY(-3px);
      color: var(--app-bg-light);
      background-color: var(--tertiary-button-text);
      border-color: var(--app-bg-medium);
    }
  }

  .button-3 {
    position: relative;
    margin: auto;
    padding: 0.5rem 1rem;
    background-color: var(--secondary-medium);
    border: 3px solid var(--secondary-light);
    border-radius: 4px;
    color: var(--secondary-dark);
    font-family: "Fira Code";
    font-weight: 600;
    font-size: 1rem;
    width: 245px;

    &:hover {
      transform: translateY(-3px);
      color: var(--tertiary-button-text);
      background-color: var(--highlight);
      border-color: var(--primary-button-outline);
    }
  }

  .ff {
    position: absolute;
    height: 50px;
    width: 50px;
    /* inset: 0; */
    right: 0;
    bottom: 0;
    z-index: 999;
    /* padding: 4px 8px; */
    background-color: var(--primary-dark);
    border: 1px solid var(--primary-button-outline);
    border-radius: 4px;
    color: var(--primary-button-outline);
    font-family: "Fira Code";
    opacity: 0.1;
    background-image: url("/expand.svg");
    background-position: center;
    background-size: contain;
    background-repeat: no-repeat;
  }
  .ff:hover {
    opacity: 1;
  }
  .editorFF {
    position: absolute;
  }

  .shrink {
    height: 50px;
    width: 50px;
    background-image: url("/shrink.svg");
    background-position: center;
    background-size: contain;
    background-repeat: no-repeat;
  }

  .switcher {
    cursor: pointer;
    position: relative;
    width: fit-content;
    display: flex;
    flex-wrap: nowrap;
    padding: 0 0 0 8px;
    background-color: #3d405b;
    border: 4px solid #e07a5f;
    color: #e07a5f;
    border-radius: 8px;
    font-family: "Rubik";
    justify-content: center;
    align-items: center;
    transition: all 0.2s ease-in-out;
    overflow: visible;
    z-index: 1;
    /* padding: 0.5rem; */

    &.active {
      border: 4px solid #38a3a5;
      color: #38a3a5;
      .switchButton .X {
        transform: translateX(25px);
        background-color: #38a3a5;
      }
    }
  }
  .switchLabel {
    text-align: left;
    width: 10ch;
    position: relative;
    padding: 4px 0 4px 0;
  }
  .switchButton {
    margin: 0 0 0 auto;
    position: relative;
    height: 100%;
    width: 50px;
    /* background-color: #22577a; */
    z-index: 2;
    box-shadow: none;
    border: none;
  }
  .X {
    position: relative;
    transition: all 0.2s ease-in-out;
    /* transform: translateY(-4px); */
    height: 100%;
    width: 25px;
    background-color: #e07a5f;
    margin: 0 auto 0 0;
    box-shadow:
      rgba(0, 0, 0, 0.4) 0px 2px 4px,
      rgba(0, 0, 0, 0.3) 0px 7px 13px -3px,
      rgba(0, 0, 0, 0.2) 0px -3px 0px inset;
  }
  .disabled {
    border-color: #e07a5f;
    background-color: #e5e5e5;
    color: #e07a5f;
    pointer-events: none;
  }
</style>
