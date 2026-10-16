<script>
  import { mapRows, plantedTrees, mapCursor } from "../sample.js";
</script>

<!-- BAY: Map viewer -->
<section class="mod alu bay" aria-label="Map viewer module">
  <span class="screw s-tl"></span><span class="screw s-tr"></span>
  <span class="screw s-bl"></span><span class="screw s-br"></span>
  <div class="map-glass">
    <div class="map-grid">
      {#each mapRows as row, y}
        {#each row.split("") as t, x}
          <i class="tile {t}" class:cur={x === mapCursor.x && y === mapCursor.y}></i>
        {/each}
      {/each}
      {#each plantedTrees as tr}
        <img class="map-tree" src={tr.src} alt="" style="left:{(tr.x / 12) * 100}%; top:{(tr.y / 9) * 100}%;" />
      {/each}
    </div>
    <div class="map-read">PLOT {String(mapCursor.x).padStart(2, "0")},{String(mapCursor.y).padStart(2, "0")} · FREE</div>
  </div>
  <div class="map-btns">
    <div class="mb-wrap mb-move">
      <button class="map-btn" aria-label="Move cursor">✥</button>
      <span class="etch">MOVE</span>
    </div>
    <div class="mb-wrap mb-plant">
      <button class="map-btn plant" aria-label="Plant here">✎</button>
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
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    aspect-ratio: 12 / 9;
    border-radius: 3px;
    overflow: hidden;
    image-rendering: pixelated;
  }
  .tile { display: block; }
  .tile.w { background: #5fb8cc; box-shadow: inset 0 -2px 0 rgba(255, 255, 255, 0.12); }
  .tile.s { background: #e3d39a; }
  .tile.g { background: #9fd37b; }
  .tile.d { background: #84bc62; }
  .tile.cur {
    position: relative;
    z-index: 2;
    outline: 2px solid var(--signal);
    outline-offset: -1px;
    animation: blink 1.1s steps(1) infinite;
  }
  .map-tree {
    position: absolute;
    width: calc(100% / 12);
    aspect-ratio: 1;
    object-fit: contain;
    transform: translateY(-20%);
    image-rendering: pixelated;
    z-index: 1;
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
  :global(.mobile) .bay { padding: 22px 70px 22px 70px; gap: 0; }
  :global(.mobile) .map-glass { height: 100%; display: flex; flex-direction: column; justify-content: center; }
  :global(.mobile) .map-grid { height: 150px; width: auto; aspect-ratio: 12 / 9; align-self: center; }
  :global(.mobile) .map-read { text-align: center; }
  :global(.mobile) .map-btns { display: contents; }
  :global(.mobile) .mb-wrap { position: absolute; }
  :global(.mobile) .mb-move { left: 12px; bottom: 26px; }
  :global(.mobile) .mb-plant { right: 12px; top: 26px; flex-direction: column-reverse; }
  :global(.mobile) .map-btn { width: 46px; height: 46px; font-size: 18px; }
  :global(.mobile) .bay-label { display: none; }
  @keyframes blink {
    50% { opacity: 0; }
  }
</style>
