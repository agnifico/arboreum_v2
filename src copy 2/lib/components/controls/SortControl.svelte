<script>
  let {
    value = $bindable('createdAt'),
    direction = $bindable('desc')
  } = $props();

  let showDropdown = $state(false);

  const options = [
    { key: 'updatedAt', label: 'Last Saved' },
    { key: 'createdAt', label: 'Created' },
    { key: 'title', label: 'A-Z' },
  ];

  function toggleDirection() {
    direction = direction === 'asc' ? 'desc' : 'asc';
  }

  function selectOption(key) {
    value = key;
    showDropdown = false;
  }
</script>

<div class="sort-control-wrapper">
  <div class="sort-control">
    <div class="dropdown-container">
      <button class="dropdown-trigger" on:click={() => showDropdown = !showDropdown}>
        {options.find(o => o.key === value)?.label}
      </button>
      {#if showDropdown}
        <div class="dropdown-menu">
          {#each options as option (option.key)}
            <button class:active={value === option.key} on:click={() => selectOption(option.key)}>
              {option.label}
            </button>
          {/each}
        </div>
      {/if}
    </div>
    <!-- <div class="separator"></div> -->
    <button class="direction-toggle" on:click={toggleDirection}>
      {#if direction === 'asc'}
        <span class="arrow">▲</span>
      {:else}
        <span class="arrow">▼</span>
      {/if}
    </button>
  </div>
</div>

<style>
  .sort-control-wrapper {
    /* padding: 0.5rem 1rem; */
    width: auto;
  }
  .sort-control {
    display: flex;
    /* width: 100%; */
    height: 28px;
    background-color: var(--charcoal);
    border: 4px solid var(--bg-tertiary);
    border-radius: 8px;
    font-family: "Fira Code", monospace;
    /* box-shadow: rgba(0,0,0,0.2) 0 2px 5px inset; */
  }

  .dropdown-container {
    position: relative;
    flex-grow: 1;
  }

  .dropdown-trigger, .direction-toggle {
    width: 100%;
    height: 100%;
    background: none;
    border: none;
    color: var(--text-main);
    cursor: pointer;
    padding: .25rem 0.5rem;
    font-size: 0.85rem;
    display: flex;
    align-items: center;
    
  }
  .dropdown-trigger {
    justify-content: flex-start;
    border-radius: 4px 0 0 4px;
    width: 13ch;
  }
  .direction-toggle {
    justify-content: center;
    flex-grow: 0;
    flex-basis: 40px;
    border-radius: 0 4px 4px 0;
    background-color: var(--hunter-green);
    border: 2px solid var(--evergreen);
  }

  .dropdown-trigger:hover, .direction-toggle:hover {
    background-color: rgba(255,255,255,0.05);
    background-color: var(--dry-sage);
    color: var(--charcoal);
  }

  .separator {
    width: 1px;
    height: 60%;
    background-color: var(--hunter-green);
    align-self: center;
  }

  .arrow {
    font-size: 0.7rem;
  }

  .dropdown-menu {
    position: absolute;
    top: 110%;
    left: 0;
    width: 100%;
    background-color: var(--bg-tertiary);
    border: 1px solid var(--hunter-green);
    border-radius: 6px;
    z-index: 10;
    overflow: hidden;
  }

  .dropdown-menu button {
    width: 100%;
    height: 36px;
    background: none;
    border: none;
    color: var(--text-main);
    cursor: pointer;
    font-size: 0.85rem;
    text-align: left;
    padding: 0 0.75rem;
  }
  .dropdown-menu button.active {
    font-weight: bold;
    color: var(--text-bright);
  }

  .dropdown-menu button:hover {
    background-color: var(--dry-sage);
    color: var(--charcoal);
  }
</style>
