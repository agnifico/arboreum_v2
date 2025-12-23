<script>
  import { base } from '$app/paths';
  let { onToggle = () => {}, onDelete = () => {}, active = false } = $props();
</script>

<div class="delete-control" class:active>
  <button type="button" class="toggle" on:click={onToggle}>
    {active ? "Unselect" : "Select"}
  </button>
  <button type="button" class="confirm" on:click={onDelete}>
    <img src="{base}/delete.svg" alt="Confirm Delete" />
  </button>
</div>

<style>
  .delete-control {
    width: calc(10ch + 16px);
    position: relative;
    margin-left: .75rem;
    /* width: fit-content; */
    display: flex;
    flex-wrap: nowrap;
    background-color: var(--charcoal);
    border: 4px solid #38a3a5;
    border: 4px solid var(--hunter-green);
    color: #3d405b;
    border-radius: 8px;
    transition: all 0.2s ease-in-out;
    z-index: 1;
    height: 28px;
   
  }

  .delete-control.active {
    border-color: #e07a5f;
  }

  .toggle {
    cursor: pointer;
    width: 10ch;
    text-align: center;
    position: relative;
    border: 2px solid var(--evergreen);
    box-shadow: none;
    border-radius: 4px;
    /* z-index: 2; */
    background-color: #38a3a5;
    background-color: var(--hunter-green);
    color: var(--dust-grey);
    font-family: "Fira Code", monospace;
    font-size: 0.85rem;
    font-weight: 600;
    transition: all 0.1s ease;
    padding: 0.25rem 0.5rem;
    transform: translateX(38px);
  }

  .delete-control.active .toggle {
    background-color: #3d405b;
    color: #e07a5f;
    transform: translateX(0px);
  }

  .toggle:hover {
    background-color: var(--dry-sage);
    color: var(--charcoal);
  }

  .confirm {
    z-index: 1;
    position: relative;
    visibility: hidden;
    width: 40px;
    border: none;
    border-radius: 0px;
    background-color: #e07a5f;
    transition: all 0.1s ease;
    box-shadow: none;
    height: 100%;
  }

  .delete-control.active .confirm {
    visibility: visible;
    box-shadow:
      /* rgba(0, 0, 0, 0.4) 0px 2px 4px, */
      /* rgba(0, 0, 0, 0.5) 0px 9px 13px -3px, */
      rgba(0, 0, 0, 0.2) 0px -3px 0px inset;
  }
  .confirm img {
    position: relative;
    aspect-ratio: 1;
    height: 80%;
  }

  .delete-control.active .confirm:hover {
    box-shadow:
      rgba(0, 0, 0, 0.4) 0px 2px 4px inset,
      rgba(0, 0, 0, 0.4) 0px -2px 4px inset,
      rgba(0, 0, 0, 0.4) 0px 7px 13px -3px inset;
    img {
      transform: translateY(3px);
    }
  }
</style>