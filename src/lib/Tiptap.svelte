<script>
  import { onMount, onDestroy } from "svelte";
  import { Editor } from "@tiptap/core";
  import StarterKit from "@tiptap/starter-kit";
  import Button from "$lib/components/controls/Button.svelte";

  let element;
  let editor;

  onMount(() => {
    editor = new Editor({
      element: element,
      extensions: [StarterKit],
      content: "<p>Hello World! 🌍️ </p>",
      onTransaction: () => {
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

  async function doPost () {
		const res = await fetch('?/create', {
			method: 'POST',
			body: JSON.stringify({
				'markdown_data' : editor.getHTML(),
			}), 
			headers: {
				'Content-Type': "application/x-www-form-urlencoded",
			}
		})
		
		const json = await res.json()
		result = JSON.stringify(json)
	}
</script>

{#if editor}
  <button
    on:click={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
    class:active={editor.isActive("heading", { level: 1 })}
  >
    H1
  </button>
  <button
    on:click={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
    class:active={editor.isActive("heading", { level: 2 })}
  >
    H2
  </button>
  <button
    on:click={() => editor.chain().focus().setParagraph().run()}
    class:active={editor.isActive("paragraph")}
  >
    P
  </button>
{/if}

<div bind:this={element} />

	<Button variant="primary" onClick={doPost}>Save</Button>

<style>
	div {
		color: aliceblue;
		font-family: "Fira Code";
		width: 70%;
		height: inherit;
	}
  button.active {
    background: black;
    color: white;
  }
</style>
