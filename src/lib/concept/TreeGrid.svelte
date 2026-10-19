<script>
  // The trees as a grid (4 a row), driven by the D-pad (the device's treeIndex)
  // or a tap. Shared by the Map viewer, Treemoji and the drawer.
  import { useDevice } from "./device.svelte.js";
  import { TREES } from "./trees.js";
  // fill: rows share the height they're given (a module's screen);
  // otherwise each tile is square and the grid takes the height it needs.
  // cursor: show the D-pad's cursor (off where the grid is only for tapping);
  // live: taps pick (off while no note is open).
  let { fill = false, cursor = true, live = true } = $props();
  const device = useDevice();
  // Tapping a tree keeps typing focus where it was (as hardware keys do).
  const keepFocus = (e) => e.preventDefault();

  // A filled grid picks its row length from its own shape, so the tiles stay
  // near square: 6 a row (two rows) on a wide, short screen such as a bay
  // module in portrait, otherwise 4 (three rows). The D-pad steps by the same.
  let el = $state();
  let cols = $state(4);
  $effect(() => {
    if (!fill || !el) return;
    const ro = new ResizeObserver(([e]) => (cols = e.contentRect.width > e.contentRect.height * 2 ? 6 : 4));
    ro.observe(el);
    return () => ro.disconnect();
  });
  $effect(() => {
    if (!cursor) return;
    device.treeCols = cols;
    return () => (device.treeCols = 4);
  });
</script>

<div class="trees" class:fill style:--cols={cols} bind:this={el} role="radiogroup" aria-label="Trees">
  {#each TREES as t, i}
    <button
      class="tree"
      class:cur={cursor && i === device.treeIndex}
      class:chosen={t.src === device.draftIcon}
      role="radio"
      aria-checked={t.src === device.draftIcon}
      aria-label={t.name}
      onmousedown={keepFocus}
      disabled={!live}
      onclick={() => device.pickTree(i)}
    ><img src={t.src} alt="" /></button>
  {/each}
</div>

<style>
  .trees {
    display: grid;
    grid-template-columns: repeat(var(--cols), minmax(0, 1fr)); /* sprites mustn't widen the grid */
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
    background: color-mix(in srgb, var(--phosphor) 5%, transparent);
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
  .tree:disabled {
    opacity: 0.45;
  }
  .tree.chosen {
    background: color-mix(in srgb, var(--phosphor) 14%, transparent);
  }
  .tree.cur {
    border-color: var(--signal);
    box-shadow: 0 0 0 1px var(--signal);
  }
</style>
