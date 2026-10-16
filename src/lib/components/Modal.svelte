<script>
  import { onMount, onDestroy, tick } from 'svelte';
  import { browser } from '$app/environment';

  let { show = $bindable(false), title = '', message = '' } = $props();

  const id = $props.id();
  let dialog = $state();
  let returnFocusTo = null;

  function handleKeydown(event) {
    if (show && event.key === 'Escape') {
      close();
    }
  }

  function close() {
    show = false;
  }

  // Focus moves into the dialog (the first footer action, e.g. Cancel, is the
  // safe default) and goes back to where it was when the dialog closes.
  $effect(() => {
    if (show) {
      returnFocusTo = document.activeElement;
      tick().then(() => {
        const first = dialog?.querySelector('.modal-footer button, .modal-footer a') ?? dialog;
        first?.focus();
      });
    } else if (returnFocusTo) {
      const el = returnFocusTo;
      returnFocusTo = null;
      if (el.isConnected) el.focus();
    }
  });

  // Keep Tab inside the dialog while it's open.
  function trapTab(event) {
    if (event.key !== 'Tab') return;
    const items = [...dialog.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')];
    if (items.length === 0) return;
    const first = items[0];
    const last = items.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      last.focus();
      event.preventDefault();
    } else if (!event.shiftKey && document.activeElement === last) {
      first.focus();
      event.preventDefault();
    }
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
  <!-- Clicking the backdrop closes; keyboard users have Escape (handled on window) -->
  <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
  <div class="backdrop" on:click={close}>
    <div
      class="modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="{id}-title"
      aria-describedby="{id}-message"
      tabindex="-1"
      bind:this={dialog}
      on:click|stopPropagation
      on:keydown={trapTab}
    >
      <div class="modal-header">
        <h2 id="{id}-title" class="modal-title">{title}</h2>
        <button class="close-btn" on:click={close} aria-label="Close" title="Close">&times;</button>
      </div>
      <div class="modal-body">
        <p id="{id}-message">{message}</p>
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
    z-index: 3000; /* above the fullscreen editor (1000) and toasts (2000) */
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

  .modal-title {
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
