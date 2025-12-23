<script>
  import { onMount } from 'svelte';

  let { data } = $props();
  let editorComponent = $state(null);

  onMount(async () => {
    // This 'import()' is dynamic. It tells the bundler to create a 
    // separate JavaScript file for Editor.svelte and its dependencies.
    const module = await import('$lib/Editor.svelte');
    editorComponent = module.default;
  });
</script>

{#if editorComponent}
  <!-- This special tag renders the component once it's loaded -->
  <svelte:component this={editorComponent} note={data.note} />
{:else}
  <!-- A placeholder can be shown while the separate file is fetched -->
  <div class="loading-container">
    <p>Loading Editor...</p>
  </div>
{/if}

<style>
  .loading-container {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    font-family: "Fira Code", monospace;
    color: var(--text-main);
  }
</style>