<script>
  import { useDevice } from "../device.svelte.js";
  import GardenMap from "../GardenMap.svelte";
  import TreeGrid from "../TreeGrid.svelte";
  import { TREES } from "../trees.js";
  import { COLS, ROWS } from "../garden.js";
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
  // The map's screen takes the room its glass gets and shows more of the
  // garden, not bigger tiles: the base view (12 × 9, or 9 × 12 zoomed in for
  // a tall bay) sets the tile size, then as many whole tiles as fit, up to
  // the whole garden.
  let areaW = $state(0);
  let areaH = $state(0);
  let fit = $derived.by(() => {
    const [bc, br] = tall ? [9, 12] : [12, 9];
    if (!areaW || !areaH) return { cols: bc, rows: br, w: 0, h: 0 };
    const t0 = Math.min(areaW / bc, areaH / br);
    const cols = Math.min(COLS, Math.max(bc, Math.floor(areaW / t0)));
    const rows = Math.min(ROWS, Math.max(br, Math.floor(areaH / t0)));
    const t = Math.min(areaW / cols, areaH / rows);
    return { cols, rows, w: cols * t, h: rows * t };
  });
  let focused = $derived(device.focus === "bay");
  let treeMode = $derived(focused && device.bayMode === "tree");
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
<section class="mod alu r-bay bay" class:focused class:tall aria-label="Map viewer module">
  <span class="screw s-tl"></span><span class="screw s-tr"></span>
  <span class="screw s-bl"></span><span class="screw s-br"></span>
  <div class="map-glass">
    <div class="map-area" bind:clientWidth={areaW} bind:clientHeight={areaH}>
    <div class="map-grid" style="width: {fit.w}px; height: {fit.h}px;">
      {#if treeMode}
        <!-- TREE: the trees as a grid, driven like the map (D-pad, A picks, B back) -->
        <div class="tree-wrap"><TreeGrid fill={!tall} /></div>
      {:else}
        <GardenMap
          cursor={view}
          plots={device.plots}
          cols={fit.cols}
          rows={fit.rows}
          blink={focused}
          onpick={device.editing ? (t) => device.enterBay("plot", t) : null}
          onaccept={focused && !treeMode ? () => device.plant() : null}
          acceptable={!readout.endsWith("TAKEN")}
          onopen={(p) => device.openNote(p.noteid)}
        />
      {/if}
    </div>
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
      <button class="map-btn" class:on={focused && !treeMode} aria-label="Move this note's tree on the map" onmousedown={keepFocus} onclick={() => device.toggleBay("plot")}>✥</button>
      <span class="etch">MOVE</span>
    </div>
    <div class="mb-wrap mb-tree">
      <!-- Shows the note's tree; picks a different one -->
      <button class="map-btn tree-btn" class:on={treeMode} aria-label="Choose this note's tree" onmousedown={keepFocus} onclick={() => device.toggleBay("tree")}>
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
  /* The glass takes the bay's spare height; the keys sit under it */
  .map-glass {
    width: 100%;
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    padding: 10px;
  }
  /* Measured, never sized by the map (it's sized from this) */
  .map-area {
    position: relative;
    flex: 1;
    min-height: 0;
  }
  .map-grid {
    position: absolute;
    inset: 0;
    margin: auto;
    border-radius: 3px;
    overflow: hidden;
    image-rendering: pixelated;
  }
  .map-read.taken {
    color: #ffb3a1;
  }
  /* Latched while it has the D-pad: a push-on, push-off key that stays down
     (pressing it again goes all the way, then it pops back up) */
  .map-btn.on {
    transform: translateY(3px);
    background: radial-gradient(circle at 40% 30%, #484d4a, #2a2e2c 60%, #1f2221);
    box-shadow: 0 2px 0 #121413, 0 3px 4px rgba(0, 0, 0, 0.2), inset 0 2px 5px rgba(0, 0, 0, 0.55);
  }
  .map-btn.on:active {
    transform: translateY(4px);
    box-shadow: 0 1px 0 #121413, inset 0 2px 5px rgba(0, 0, 0, 0.55);
  }
  .tree-wrap {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  .tree-btn img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    image-rendering: pixelated;
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
  /* The readout and the A/B context share the line under the map, so the map
     never changes size when the A/B context shows (a second tap must land on
     the same tile to plant). */
  :global(.portrait) .map-glass {
    flex: 1;
    display: grid;
    grid-template: "map map" minmax(0, 1fr) "read ab" 20px / 1fr auto; /* a fixed line: the pips are taller than the text */
    padding: 10px;
    gap: 4px 12px;
    align-items: center;
  }
  /* Tall bay: the map zooms in (9 tiles across) */
  .tall {
    padding-inline: 16px;
  }
  :global(.portrait) .map-area { grid-area: map; align-self: stretch; }
  :global(.portrait) .map-read { grid-area: read; margin-top: 0; }
  :global(.portrait) .map-glass:has(.map-ab.off) .map-read { grid-column: 1 / -1; text-align: center; }
  :global(.portrait) .map-btns { flex-direction: column; justify-content: center; gap: 8px; }
  :global(.portrait) .mb-wrap { gap: 6px; }
  :global(.portrait) .map-btn { width: 40px; height: 40px; border-radius: 10px; font-size: 16px; }
  :global(.portrait) .tree-btn { padding: 7px; }
  :global(.portrait) .map-ab { grid-area: ab; margin-top: 0; padding-top: 0; border-top: none; }
  :global(.portrait) .map-ab.off { display: none; } /* the readout takes the whole line */
  :global(.portrait) .bay-label { display: none; }
</style>
