<script>
  import { useDevice } from "../device.svelte.js";
  import GardenMap from "../GardenMap.svelte";
  import { TREES } from "../trees.js";
  // tall: the bay has the whole right column (no speaker under it), so the
  // map zooms in to fill it.
  let { tall = false } = $props();
  const device = useDevice();
  // Hardware keys don't take keyboard focus on click, so typing carries on
  // in the editor (keyboard users can still Tab to them).
  const keepFocus = (e) => e.preventDefault();
  const pad2 = (n) => String(n).padStart(2, "0");

  // While browsing the list, the map centres on the selected note's tree.
  let view = $derived.by(() => {
    if (device.editing) return device.cursor;
    const n = device.note;
    return n && n.mapX != null && n.mapY != null ? { x: n.mapX, y: n.mapY } : null;
  });
  let focused = $derived(device.focus === "map");
  let treeMode = $derived(focused && device.mapMode === "tree");
  let readout = $derived.by(() => {
    if (treeMode) return TREES[device.treeIndex].name.toUpperCase();
    if (!view) return "NOT PLANTED";
    const at = device.plots.find((p) => p.x === view.x && p.y === view.y);
    const where = `PLOT ${pad2(view.x)},${pad2(view.y)}`;
    if (!device.editing) return where;
    return `${where} · ${!at ? "FREE" : at.ghost ? "PLANTS ON SAVE" : at.mine ? "YOURS" : "TAKEN"}`;
  });
</script>

<!-- BAY: Map viewer -->
<section class="mod alu bay" class:focused class:tall aria-label="Map viewer module">
  <span class="screw s-tl"></span><span class="screw s-tr"></span>
  <span class="screw s-bl"></span><span class="screw s-br"></span>
  <div class="map-glass">
    <div class="map-grid">
      {#if treeMode}
        <!-- TREE: the trees as a grid, driven like the map (D-pad, A picks, B back) -->
        <div class="trees" role="radiogroup" aria-label="Trees">
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
      {:else}
        <GardenMap
          cursor={view}
          plots={device.plots}
          cols={tall ? 9 : 12}
          rows={tall ? 12 : 9}
          blink={focused}
          onpick={device.editing ? (t) => device.enterMap("plot", t) : null}
          onaccept={focused && !treeMode ? () => device.plant() : null}
          acceptable={!readout.endsWith("TAKEN")}
        />
      {/if}
    </div>
    <div class="map-read" class:taken={readout.endsWith("TAKEN")}>{readout}</div>
    <!-- The A/B context lives here while the Map viewer has the D-pad -->
    <!-- (its room is kept when hidden, so nothing below it jumps) -->
    <div class="map-ab" class:off={!focused} aria-hidden={!focused}>
      <span><i class="pip a">A</i>{focused ? device.labels.a : ""}</span>
      <span><i class="pip b">B</i>{focused ? device.labels.b : ""}</span>
    </div>
  </div>
  <div class="map-btns">
    <div class="mb-wrap mb-move">
      <button class="map-btn" class:on={focused && !treeMode} aria-label="Move this note's tree on the map" onmousedown={keepFocus} onclick={() => device.toggleMap("plot")}>✥</button>
      <span class="etch">MOVE</span>
    </div>
    <div class="mb-wrap mb-tree">
      <!-- Shows the note's tree; picks a different one -->
      <button class="map-btn tree-btn" class:on={treeMode} aria-label="Choose this note's tree" onmousedown={keepFocus} onclick={() => device.toggleMap("tree")}>
        {#if device.editing && device.draftIcon}<img src={device.draftIcon} alt="" />{:else}?{/if}
      </button>
      <span class="etch">TREE</span>
    </div>
  </div>
  <span class="etch bay-label">MAP-01</span>
</section>

<style>
  .bay { grid-area: bay; }
  .bay {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 28px 24px 30px;
    gap: 18px;
  }
  .map-glass {
    width: 100%;
    padding: 10px;
  }
  .map-grid {
    position: relative;
    aspect-ratio: 12 / 9;
    border-radius: 3px;
    overflow: hidden;
    image-rendering: pixelated;
  }
  .map-read.taken {
    color: #ffb3a1;
  }
  .map-btn.on {
    outline: 2px solid var(--signal);
    outline-offset: 2px;
  }
  .trees {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    grid-auto-rows: minmax(0, 1fr); /* rows share the map window's height */
    gap: 6px;
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
  .tree img,
  .tree-btn img {
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
  .tree-btn {
    padding: 10px;
    font-family: var(--label);
    font-weight: 700;
  }
  /* The A/B strip, moved here while the Map viewer has the D-pad */
  .map-ab {
    display: flex;
    gap: 14px;
    margin-top: 8px;
    padding-top: 8px;
    border-top: 1px solid rgba(213, 228, 198, 0.1);
    font-size: 10.5px;
    font-weight: 700;
    letter-spacing: 0.08em;
    color: var(--phosphor);
  }
  .map-ab.off {
    visibility: hidden;
  }
  .map-ab span {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .map-read {
    margin-top: 8px;
    font-size: 10.5px;
    font-weight: 700;
    letter-spacing: 0.1em;
    color: var(--phosphor-dim);
  }
  .map-btns {
    display: flex;
    gap: 28px;
  }
  .mb-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }
  .map-btn {
    width: 52px;
    height: 52px;
    border-radius: 12px;
    font-size: 20px;
    color: #c9cec9;
    background: radial-gradient(circle at 40% 30%, #555a57, #333735 60%, #262928);
    box-shadow: 0 5px 0 #121413, 0 8px 10px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.15);
    transition: transform 0.06s ease, box-shadow 0.06s ease;
  }
  .map-btn:active {
    transform: translateY(4px);
    box-shadow: 0 1px 0 #121413;
  }
  .bay-label {
    position: absolute;
    bottom: 10px;
    left: 0;
    right: 0;
    text-align: center;
    font-size: 9px;
  }
  /* Mobile: both buttons on one side, so the screen gets the width */
  :global(.portrait) .bay { flex-direction: row; align-items: stretch; padding: 16px 16px 16px 18px; gap: 16px; }
  :global(.portrait) .map-glass { flex: 1; display: flex; flex-direction: column; justify-content: center; }
  /* Tall bay: a zoomed-in, portrait-shaped map window, centred in the column */
  .tall {
    justify-content: center;
    padding-inline: 16px;
  }
  .tall .map-grid {
    aspect-ratio: 9 / 12;
  }
  .tall .trees {
    grid-auto-rows: auto;
    align-content: center;
  }
  .tall .tree {
    aspect-ratio: 1;
  }
  :global(.portrait) .map-grid { height: calc(100% - 22px); width: auto; aspect-ratio: 12 / 9; align-self: center; }
  :global(.portrait) .map-read { text-align: center; }
  :global(.portrait) .map-btns { flex-direction: column; justify-content: center; gap: 8px; }
  :global(.portrait) .mb-wrap { gap: 6px; }
  :global(.portrait) .map-btn { width: 40px; height: 40px; border-radius: 10px; font-size: 16px; }
  :global(.portrait) .tree-btn { padding: 7px; }
  :global(.portrait) .map-ab { justify-content: center; margin-top: 4px; padding-top: 4px; }
  :global(.portrait) .bay-label { display: none; }
</style>
