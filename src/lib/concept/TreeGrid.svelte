<script>
  // The trees as a 4-wide grid, driven by the D-pad (the device's treeIndex)
  // or a tap. Shared by the Map viewer, Treemoji and the drawer.
  import { useDevice } from "./device.svelte.js";
  import { TREES } from "./trees.js";
  // fill: rows share the height they're given (a module's screen);
  // otherwise each tile is square and the grid takes the height it needs.
  let { fill = false } = $props();
  const device = useDevice();
  // Tapping a tree keeps typing focus where it was (as hardware keys do).
  const keepFocus = (e) => e.preventDefault();
</script>

<div class="trees" class:fill role="radiogroup" aria-label="Trees">
  {#each TREES as t, i}
    <button
      class="tree"
      class:cur={i === device.treeIndex}
      class:chosen={t.src === device.draftIcon}
      role="radio"
      aria-checked={t.src === device.draftIcon}
      aria-label={t.name}
      onmousedown={keepFocus}
      onclick={() => device.pickTree(i)}
    ><img src={t.src} alt="" /></button>
  {/each}
</div>

<style>
  .trees {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr)); /* sprites mustn't widen the grid */
    gap: 6px;
  }
  .trees.fill {
    grid-auto-rows: minmax(0, 1fr);
    height: 100%;
  }
  .tree {
    min-width: 0;
    min-height: 0;
    padding: 4px;
    border-radius: 6px;
    background: rgba(213, 228, 198, 0.05);
    border: 1px solid transparent;
  }
  .trees:not(.fill) .tree {
    aspect-ratio: 1;
  }
  .tree img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    image-rendering: pixelated;
  }
  .tree.chosen {
    background: rgba(213, 228, 198, 0.14);
  }
  .tree.cur {
    border-color: var(--signal);
    box-shadow: 0 0 0 1px var(--signal);
  }
</style>
