<script>
  import { onMount, onDestroy } from 'svelte';
  import { browser } from '$app/environment';

  let { show, title = '', message = '' } = $props();

  let dialog;

  function handleKeydown(event) {
    if (event.key === 'Escape') {
      close();
    }
  }

  function close() {
    show = false;
  }

  onMount(() => {
    if (browser) {
      window.addEventListener('keydown', handleKeydown);
    }
  });

  onDestroy(() => {
    if (browser) {
      window.removeEventListener('keydown', handleKeydown);
    }
  });
</script>

{#if show}
  <div class="backdrop" on:click={close}>
    <div class="modal" role="dialog" aria-labelledby="modal-title" on:click|stopPropagation>
      <div class="modal-header">
        <h2 id="modal-title">{title}</h2>
        <button class="close-btn" on:click={close} aria-label="Close modal">&times;</button>
      </div>
      <div class="modal-body">
        <p>{message}</p>
      </div>
      <div class="modal-footer">
        <slot name="footer" />
      </div>
    </div>
  </div>
{/if}

<style>
  .backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(10, 28, 33, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }

  .modal {
    min-width: 300px;
    max-width: 500px;
    background-color: var(--bg-secondary);
    border: 2px solid var(--bg-tertiary);
    border-radius: 12px;
    box-shadow: 0 5px 15px rgba(0,0,0,0.5);
    display: flex;
    flex-direction: column;
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    border-bottom: 1px solid var(--bg-tertiary);
  }

  #modal-title {
    margin: 0;
    font-family: "Silkscreen", sans-serif;
    font-size: 1.2rem;
    color: var(--text-bright);
  }

  .close-btn {
    background: none;
    border: none;
    font-size: 1.5rem;
    color: var(--text-muted);
    cursor: pointer;
  }
  .close-btn:hover {
    color: var(--text-bright);
  }

  .modal-body {
    padding: 1rem;
    color: var(--text-main);
    font-family: "Rubik", sans-serif;
  }

  .modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
    padding: 1rem;
    border-top: 1px solid var(--bg-tertiary);
  }
</style>
