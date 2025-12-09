<script>
  let { data } = $props();
  import Button from "../_buttons.svelte";
  import EmojiTab from "../emojiTab.svelte";
  import { Color } from "@tiptap/extension-color";
  import ListItem from "@tiptap/extension-list-item";
  import TextStyle from "@tiptap/extension-text-style";
  import StarterKit from "@tiptap/starter-kit";
  import BubbleMenu from "@tiptap/extension-bubble-menu";
  import { Editor } from "@tiptap/core";
  import { onMount, onDestroy } from "svelte";
  import FloatingMenu from "@tiptap/extension-floating-menu";
  import Underline from "@tiptap/extension-underline";
  import Editor2 from '$lib/Editor.svelte';

  let title_temp = $state("");
  let body_temp = $state("");


  let placeholder = "";

  let trees = $state([
    { name: "g", filePath: "/Snow_tree2.png" },
    // { name: "yellowTree", filePath: "/t-yellow.png" },
    // { name: "greenTree", filePath: "/t-green.png" },
    { name: "a", filePath: "/Flower_tree2.png" },
    { name: "d", filePath: "/Palm_tree2_2.png" },
    { name: "b", filePath: "/Moss_tree2.png" },
    { name: "redTree", filePath: "/t-red.png" },
    { name: "c", filePath: "/Snow_christmass_tree2.png" },
    { name: "e", filePath: "/Tree2.png" },
    { name: "blueTree", filePath: "/t-blue.png" },
    { name: "f", filePath: "/Palm_tree1_2.png" },
  ]);
  let tg = $state(1);
  let emojiTabName = $state("treemoji");

  // console.log('NEW: ', data);
  // let u_list = data.session.users.filter(i => i.username)
  let element = $state();
  let editor = $state();
  let bmenu = $state();

  let bold = $derived(editor?.isActive("bold"));
    let italic = $derived(editor?.isActive("italic"));
    let strike = $derived(editor?.isActive("strike"));
    let underline = $derived(editor?.isActive("underline"));
    let link = $derived(editor?.isActive("link"));
    let code = $derived(editor?.isActive("code"));

  const setLink = () => {
    if (editor.isActive("link")) {
      editor.chain().focus.extendMarkRange("link").unsetLink().run();

      return;
    }

    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL", previousUrl);

    // cancelled
    if (url === null) {
      return;
    }

    // empty
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();

      return;
    }

    if (!/^https?:\/\//.test(url)) {
      window.alert("[Error] Link Invalid! ");
      return;
    }

    // update link
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  onMount(() => {
    editor = new Editor({
      element: element,
      // injectCSS: false,
      // editorProps: {
      //   attributes: {
      //     class: "xy",
      //   },
      // },
      extensions: [
        TextStyle, Color,
        StarterKit,
        Underline,
        FloatingMenu.configure({
          element: document.querySelector(".menu"),
        }),
        BubbleMenu.configure({
          element: bmenu,
        }),
      ],
      content: `
      Hello world<br>

      ...
      `,
      onTransaction: () => {
        // force re-render so `editor.isActive` works as expected
        editor = editor;
      },
      onUpdate: () => {
        // force re-render so `editor.isActive` works as expected
        editor = editor;
      },
    });

  });

  onDestroy(() => {
    if (editor) {
      editor.destroy();
    }
  });

  async function doPost() {
    const res = await fetch("?/create", {
      method: "POST",
      body: {
        title: title_temp,
        body: editor.getHTML(),
        createdBy: data?.user?.username,
        treemoji: document.getElementsByName(emojiTabName).value,
        // markdown_data: editor.getHTML(),
      },
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    const json = await res.json();
    result = JSON.stringify(json);
    // return result;
  }
</script>

<!-- {data.msg} -->

<form action="?/create" method="post" id="contentbox">
  <div class="toprow">
    <EmojiTab set={trees} group={tg} name={emojiTabName} />
    <input
      type="text"
      id="title-area"
      bind:value={title_temp}
      placeholder="Title"
      name="IN-1"
      autocomplete="off"
    />
    <select name="userinput" id="userinput">
      <option value={data?.user?.username}>{data?.user?.username}</option>
    </select>
  </div>
  <div id="btn-tray">
    {#if editor}
      <button
        onclick={(e) => {
          e.preventDefault();
          editor.chain().focus().toggleBold().run();
        }}
      >
        <strong>B</strong>
      </button>

      <button
        onclick={(e) => {
          e.preventDefault();
          editor.chain().focus().toggleItalic().run();
        }}
      >
        <em>I</em>
      </button>

      <button
        onclick={(e) => {
          e.preventDefault();
          editor.chain().focus().toggleStrike().run();
        }}
        style:color={(strike || editor.isActive("strike")) ? 'aqua' : 'black'}
      >
        <strike>S</strike>
      </button>

      <button
        onclick={(e) => {
          e.preventDefault();
          editor.chain().focus().toggleUnderline().run();
        }}
        style:text-decoration="underline"
      >
        U
      </button>

      <button
        onclick={(e) => {
          e.preventDefault();
          editor.chain().focus().toggleCode().run();
        }}
      >
        ❮❯
      </button>

      <button
        onclick={(e) => {
          e.preventDefault();
          setLink();
        }}
      >
        🔗
      </button>

      <button
        onclick={(e) => {
          e.preventDefault();
          editor.chain().focus().unsetAllMarks().run();
        }}
      >
        <strike>Style</strike></button
      >
      <button
        onclick={(e) => {
          e.preventDefault();
          editor.chain().focus().clearNodes().run();
        }}><strike>Structure</strike></button
      >
      <button
        onclick={(e) => {
          e.preventDefault();
          editor.chain().focus().setParagraph().run();
          console.log(typeof editor.isActive("paragraph"));
        }}
        class={editor.isActive("paragraph") ? ".is-active" : ""}
      >
        Paragraph
      </button>
      <div class="headingSizeSelector" id="headingSizeSelector">
        <button
          class="hxBtn active"
          type="button"
          onclick={(e) => {
            e.preventDefault();
            editor.chain().focus().toggleHeading({ level: 1 }).run();
          }}>H1</button
        >
        {#each [2, 3, 4, 5, 6] as size}
          <button
            class="hxBtn"
            type="button"
            onclick={(e) => {
              e.preventDefault();
              editor.chain().focus().toggleHeading({ level: size }).run();
            }}>H{size}</button
          >
        {/each}
      </div>
      <button
        onclick={(e) => {
          e.preventDefault();
          editor.chain().focus().toggleBulletList().run();
        }}
        class={editor.isActive("bulletList") ? ".is-active" : ""}
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
        onclick={(e) => {
          e.preventDefault();
          editor.chain().focus().toggleOrderedList().run();
        }}
        class={editor.isActive("orderedList") ? "is-active" : ""}
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
        onclick={(e) => {
          e.preventDefault();
          editor.chain().focus().toggleBlockquote().run();
        }}
        class:active={editor.isActive("blockquote") ? "is-active" : ""}
      >
        Blockquote
      </button>
      <button
        onclick={(e) => {
          e.preventDefault();
          editor.chain().focus().setHorizontalRule().run();
        }}
      >
        LineBreak
      </button>
      <button
        onclick={(e) => {
          e.preventDefault();
          editor.chain().focus().setHardBreak().run();
        }}>Next Line</button
      >

      <!-- svelte-ignore a11y_consider_explicit_label -->
      {#each ["3993f9", "6A994E", "BC4749", "c6ac8f"] as color}
        <button
          onclick={(e) => {
            e.preventDefault();
            editor.chain().focus().setColor(`#${color}`).run();
          }}
          style:background-color={`#${color}`}
          class={editor.isActive("textStyle", { color: `#${color}` })
            ? "is-active"
            : ""}
        >
          &nbsp;
        </button>
      {/each}
    {/if}
  </div>

  <div bind:this={element} class="xy"></div>

  <div id="btn-tray2">
    <Button color="green" text="Save" fn={doPost} />
  </div>
</form>

<div bind:this={bmenu} class="bubble-menu">
  <button
    onclick={(e) => {
      e.preventDefault();
      editor.chain().focus().toggleBold().run();
    }}
  >
    <strong>B</strong>
  </button>

  <button
    onclick={(e) => {
      e.preventDefault();
      editor.chain().focus().toggleItalic().run();
    }}
  >
    <em>I</em>
  </button>

  <button
    onclick={(e) => {
      e.preventDefault();
      editor.chain().focus().toggleStrike().run();
    }}
  >
    <strike>S</strike>
  </button>

  <button
    onclick={(e) => {
      e.preventDefault();
      editor.chain().focus().toggleUnderline().run();
    }}
    style:text-decoration="underline"
  >
    U
  </button>

  <button
    onclick={(e) => {
      e.preventDefault();
      editor.chain().focus().toggleCode().run();
    }}
  >
    ❮❯
  </button>

  <button
    onclick={(e) => {
      e.preventDefault();
      setLink();
    }}
  >
    🔗
  </button>
</div>

<div class="menu">
  {#if editor}
    <button
      onclick={(e) => {
        e.preventDefault();
        editor.chain().focus().toggleBold().run();
      }}
    >
      <strong>B</strong>
    </button>

    <button
      onclick={(e) => {
        e.preventDefault();
        editor.chain().focus().toggleItalic().run();
      }}
    >
      <em>I</em>
    </button>

    <button
      onclick={(e) => {
        e.preventDefault();
        editor.chain().focus().toggleStrike().run();
      }}
    >
      <strike>S</strike>
    </button>

    <button
      onclick={(e) => {
        e.preventDefault();
        editor.chain().focus().toggleUnderline().run();
      }}
      style:text-decoration="underline"
    >
      U
    </button>

    <button
      onclick={(e) => {
        e.preventDefault();
        editor.chain().focus().toggleCode().run();
      }}
    >
      ❮❯
    </button>

    <button
      onclick={(e) => {
        e.preventDefault();
        setLink();
      }}
    >
      🔗
    </button>
  {/if}
</div>

<style>
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    interpolate-size: allow-keywords;
    --input-field-width: 80%;
  }
  select {
    background-color: #ff8e72;
    border: none;
    border-radius: 20px;
    text-align: center;
    font-size: 1rem;
    padding: 0 1rem;
    font-family: "Fira Code";
    font-weight: 500;
    color: #313638;
    -moz-appearance: none; /* Firefox */
    -webkit-appearance: none; /* Safari and Chrome */
    appearance: none;
  }

  #contentbox {
    position: relative;
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    /* align-items: center; */
  }

  .toprow {
    width: var(--input-field-width);
    height: fit-content;
    display: flex;
    margin: 10rem auto 0 auto;
    gap: 20px;
  }

  #title-area {
    font-family: "DM Serif Text";
    font-size: 2rem;
    /* width: var(--input-field-width); */
    /* width: 60%; */
    flex: 1;
    /* height: fit-content; */
    background-color: #3b6064;
    color: #c9e4ca;
    border: none;
    padding: 8px 16px;
    user-select: contain;
    transition: all 0.1s ease-in-out;
    border-radius: 20px;
    /* caret-color: transparent; */
    &:hover {
      outline: none;
      border: none;
      box-shadow: rgba(0, 0, 0, 0.24) 10px 15px 15px;
    }
    &:focus {
      outline: none;
      border: none;
      box-shadow: rgba(0, 0, 0, 0.24) 10px 15px 15px;
      transform: translateY(-5px);
    }
  }

  #btn-tray {
    width: var(--input-field-width);
    margin: 2rem auto 0;
    display: flex;
    flex-wrap: wrap;
    justify-content: left;
    gap: 10px;
  }
  #btn-tray2 {
    width: var(--input-field-width);
    margin: 2rem auto 0;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
  }

  button {
    font-size: 1rem;
    width: fit-content;
    padding: 4px 8px;
    height: fit-content;
    border-radius: 3px;
    font-family: "Fira Code";
    transition: all 0.1s ease-in-out;
    background-color: #5e503f;
    border: 1px solid #eae0d54f;
    border-radius: 4px;
    /* border: none; */
    color: #c6ac8f;
    /* margin: 5px 10px; */
  }

  button:hover {
    transform: translateY(-3px);
    /* box-shadow:
      rgba(0, 0, 0, 0.3) 0px 10px 10px,
      rgba(0, 0, 0, 0.3) 10px 6px 6px; */
  }

  button:focus {
    /* box-shadow:
      rgba(0, 0, 0, 0.3) 0px 10px 10px,
      rgba(0, 0, 0, 0.3) 0px 6px 6px; */
  }

  .menu {
    gap: 10px;
    position: relative;
  }

  .xy {
    white-space: pre;
    width: var(--input-field-width);
    height: 250px;
    margin-inline: auto;
    margin-block: 2rem;
    background-color: #0a0908;
    color: #c9e4ca;
    font-size: 1.3rem;
    font-family: "Fira Code";
    border: none;
    resize: none;
    padding: 20px;
    user-select: contain;
    transition: all 0.1s ease-in-out;
    border-radius: 25px;
    /* caret-color: transparent; */
    &:hover {
      outline: none;
      border: none;
      box-shadow: rgba(0, 0, 0, 0.24) 10px 15px 15px;
    }
    &:focus {
      outline: none;
      border: none;
      box-shadow: rgba(0, 0, 0, 0.24) 10px 15px 15px;
      transform: translateY(-5px);
    }
  }

  :global(.ProseMirror:focus) {
    outline: none;
  }
  :global(.ProseMirror-focused) {
    outline: none;
  }

  #headingSizeSelector {
    display: flex;
    gap: 5px;

    .active {
      display: block;
      color: #ff8e72;
    }
    .hxBtn {
      color: #dabfff;
      background-color: #2c2a4a;
      border: 1px solid #7fdeff;
    }
    button {
      display: none;
    }

    &:hover {
      button {
        display: block;
      }
    }
  }

  :global(.is-active) {
    color: aqua;
  }
</style>
