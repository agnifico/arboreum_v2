<script>
  import { useDevice } from "../device.svelte.js";
  const device = useDevice();
</script>

<!-- LIST (desktop): notes as a numbered list with index tabs -->
<section class="mod graphite list" class:focused={device.focus === "list"} aria-label="List module">
  <span class="screw s-tl"></span><span class="screw s-bl"></span>
  <div class="list-glass">
    <div class="list-head">
      <span>NOTES · {device.notes.length}</span>
      <span class="list-sort">SAVED ▾</span>
    </div>
    <ol class="list-rows">
      {#each device.notes as n, i}
        <li class:sel={i === device.index}>
          <span class="li-num">{String(i + 1).padStart(2, "0")}</span>
          <img class="li-tree" src={n.tree} alt="" />
          <span class="li-title">{n.title}</span>
          <span class="li-when">{n.when}</span>
        </li>
      {/each}
    </ol>
    <div class="list-foot"><i class="pip a">A</i>OPEN <i class="pip b">B</i>SORT</div>
    <div class="glare" aria-hidden="true"></div>
  </div>
  <div class="tabs" aria-hidden="true">
    <span class="tab on">SAVED</span>
    <span class="tab">A–Z</span>
    <span class="tab">MADE</span>
  </div>
  <span class="etch-dark list-label">LST-01</span>
</section>

<style>
  .list { grid-area: list; }
  .list {
    padding: 24px 40px 30px 22px;
  }
  .list-glass {
    height: 100%;
    display: flex;
    flex-direction: column;
  }
  .list-head {
    display: flex;
    justify-content: space-between;
    padding: 10px 14px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.08em;
    color: var(--phosphor-dim);
    border-bottom: 1px solid rgba(213, 228, 198, 0.08);
  }
  .list-sort {
    color: var(--phosphor);
  }
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
  .list-foot {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 9px 12px;
    font-size: 10.5px;
    font-weight: 700;
    letter-spacing: 0.08em;
    border-top: 1px solid rgba(213, 228, 198, 0.1);
  }
  .list-foot .pip.b {
    margin-left: 8px;
  }
  .tabs {
    position: absolute;
    right: 8px;
    top: 34px;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .tab {
    writing-mode: vertical-rl;
    padding: 10px 4px;
    font-size: 8.5px;
    font-weight: 700;
    letter-spacing: 0.16em;
    color: rgba(210, 214, 210, 0.55);
    background: linear-gradient(90deg, #3b3f3d, #2b2e2d);
    border-radius: 0 5px 5px 0;
    box-shadow: 0 2px 0 #121413, inset 0 1px 0 rgba(255, 255, 255, 0.1);
  }
  .tab.on {
    color: #2b1406;
    background: linear-gradient(90deg, #ff8a45, var(--signal));
    box-shadow: 0 2px 0 var(--signal-side);
  }
  .list-label {
    position: absolute;
    bottom: 10px;
    left: 0;
    right: 0;
    text-align: center;
    font-size: 9px;
  }
</style>
