<script>
  import Button from '$lib/components/controls/Button.svelte';
  let { data } = $props();
	
  let note = $derived(data.note);
</script>

{#if note}
  <div class="note-view-container">
    <div class="note-header">
      <h1 class="note-title">{note.title || 'Untitled Note'}</h1>
      <Button variant="primary" href={`/newleaf?noteid=${note.noteid}`}>Edit</Button>
    </div>
    <div class="note-body">
      {@html note.text}
    </div>
  </div>
{:else}
  <p>Loading note...</p>
{/if}

<style>
  .note-view-container {
    width: 100%;
    max-width: 800px;
    margin: 2rem auto;
    padding: 2rem;
    background-color: var(--editor-bg);
    border-radius: 12px;
    color: var(--text-main);
    height: fit-content;
  }

  .note-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid var(--bg-tertiary);
    padding-bottom: 1rem;
    margin-bottom: 1rem;
  }

  .note-title {
    font-family: "DM Serif Text", serif;
    font-size: 2rem;
    color: var(--text-bright);
    margin: 0;
  }

  .note-body {
    line-height: 1.7;
  }

  .note-body :global(p) {
    margin-bottom: 1rem;
  }

  .note-body :global(h1),
  .note-body :global(h2),
  .note-body :global(h3) {
    color: var(--text-bright);
    margin-top: 1.5rem;
    margin-bottom: 0.5rem;
  }
</style>
