<script>
  // The notes as numbered rows, shared by the List module and the screen's
  // full-screen list (portrait). The selected row follows the D-pad.
  import { useDevice } from "./device.svelte.js";
  const device = useDevice();
  let { big = false } = $props();
</script>

<ol class="list-rows" class:big>
  {#each device.notes as n, i}
    <li class:sel={i === device.index}>
      <span class="li-num">{String(i + 1).padStart(2, "0")}</span>
      <img class="li-tree" src={n.tree} alt="" />
      <span class="li-title">{n.title}</span>
      <span class="li-when">{n.when}</span>
    </li>
  {:else}
    <li class="empty">NO NOTES YET · ≡ START → NEW NOTE</li>
  {/each}
</ol>

<style>
  .list-rows {
    list-style: none;
    margin: 0;
    padding: 6px 0;
    flex: 1;
  }
  .list-rows li {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 7px 12px;
    font-size: 12.5px;
    color: #a9bb9d;
    border-left: 3px solid transparent;
  }
  .list-rows li.sel {
    background: rgba(255, 106, 26, 0.12);
    border-left-color: var(--signal);
    color: #fff;
  }
  .li-num {
    color: #3d4b3b;
    font-size: 11px;
  }
  .sel .li-num {
    color: var(--signal);
  }
  .li-tree {
    width: 18px;
    height: 18px;
    object-fit: contain;
    image-rendering: pixelated;
  }
  .li-title {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .li-when {
    color: var(--phosphor-dim);
    font-size: 11px;
  }
  .list-rows.big li {
    padding: 9px 18px;
    font-size: 14px;
  }
  .list-rows.big .li-tree {
    width: 22px;
    height: 22px;
  }
  .empty {
    color: var(--phosphor-dim);
    font-size: 11px;
    letter-spacing: 0.08em;
  }
</style>
