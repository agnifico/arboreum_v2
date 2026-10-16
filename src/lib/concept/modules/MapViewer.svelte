<script>
  import { useDevice } from "../device.svelte.js";
  import GardenMap from "../GardenMap.svelte";
  const device = useDevice();
  const pad2 = (n) => String(n).padStart(2, "0");

  // While browsing the list, the map centres on the selected note's tree.
  let view = $derived.by(() => {
    if (device.editing) return device.cursor;
    const n = device.note;
    return n && n.mapX != null && n.mapY != null ? { x: n.mapX, y: n.mapY } : null;
  });
  let readout = $derived.by(() => {
    if (!view) return "NOT PLANTED";
    const at = device.plots.find((p) => p.x === view.x && p.y === view.y);
    const where = `PLOT ${pad2(view.x)},${pad2(view.y)}`;
    if (!device.editing) return where;
    return `${where} · ${!at ? "FREE" : at.mine ? "YOURS" : "TAKEN"}`;
  });
</script>

<!-- BAY: Map viewer -->
<section class="mod alu bay" class:focused={device.focus === "map"} aria-label="Map viewer module">
  <span class="screw s-tl"></span><span class="screw s-tr"></span>
  <span class="screw s-bl"></span><span class="screw s-br"></span>
  <div class="map-glass">
    <div class="map-grid">
      <GardenMap
        cursor={view}
        plots={device.plots}
        blink={device.focus === "map"}
        onpick={device.editing ? (t) => { device.cursor = t; device.focus = "map"; } : null}
      />
    </div>
    <div class="map-read" class:taken={readout.endsWith("TAKEN")}>{readout}</div>
  </div>
  <div class="map-btns">
    <div class="mb-wrap mb-move">
      <button class="map-btn" class:on={device.focus === "map"} aria-label="Move the map cursor" onclick={() => device.enterMap()}>✥</button>
      <span class="etch">MOVE</span>
    </div>
    <div class="mb-wrap mb-plant">
      <button class="map-btn plant" aria-label="Plant here" onclick={() => device.plant()}>✎</button>
      <span class="etch">PLANT</span>
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
  .map-btn.plant {
    color: #fff3ea;
    background: radial-gradient(circle at 40% 30%, #ff9a5c, var(--signal) 55%, #e2560c);
    box-shadow: 0 5px 0 var(--signal-side), 0 8px 10px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.4);
  }
  .map-btn:active {
    transform: translateY(4px);
    box-shadow: 0 1px 0 #121413;
  }
  .map-btn.plant:active {
    box-shadow: 0 1px 0 var(--signal-side);
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
  :global(.portrait) .map-grid { height: calc(100% - 22px); width: auto; aspect-ratio: 12 / 9; align-self: center; }
  :global(.portrait) .map-read { text-align: center; }
  :global(.portrait) .map-btns { flex-direction: column; justify-content: center; gap: 8px; }
  :global(.portrait) .mb-wrap { gap: 6px; }
  :global(.portrait) .map-btn { width: 40px; height: 40px; border-radius: 10px; font-size: 16px; }
  :global(.portrait) .bay-label { display: none; }
</style>
