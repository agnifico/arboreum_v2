<script>
  import { useDevice, SORTS } from "../device.svelte.js";
  import NoteRows from "../NoteRows.svelte";
  const device = useDevice();
</script>

<!-- LIST: notes as a numbered list with index tabs (left dock, or the bay) -->
<section class="mod graphite list" class:focused={device.focus === "list"} aria-label="List module">
  <span class="screw s-tl"></span><span class="screw s-bl"></span>
  <div class="list-glass">
    <div class="list-head">
      <span>{#if device.picking}PICKED · {device.pickedNotes.length}/{device.notes.length}{:else}NOTES · {device.notes.length}{/if}</span>
      <span class="list-sort">{device.sortLabel} ▾</span>
    </div>
    <NoteRows />
    <div class="list-foot"><i class="pip a">A</i>{device.picking ? device.labels.a : "OPEN"} <i class="pip b">B</i>{device.picking ? "DONE" : "NEW"}</div>
    <div class="glare" aria-hidden="true"></div>
  </div>
  <!-- Physical index tabs: sort the list -->
  <div class="tabs" role="group" aria-label="Sort notes">
    {#each SORTS as t}
      <button class="tab" class:on={device.sort === t.key} aria-pressed={device.sort === t.key} onclick={() => device.setSort(t.key)}>{t.label}</button>
    {/each}
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
  /* Portrait bay: a short row, so the tabs lie flat and A/B stay on the screen */
  :global(.portrait) .list { padding: 16px 66px 16px 18px; }
  :global(.portrait) .list-head { padding: 8px 12px; }
  :global(.portrait) .list-foot,
  :global(.portrait) .list-label { display: none; }
  :global(.portrait) .tabs { right: 10px; top: 16px; gap: 5px; }
  :global(.portrait) .tab { writing-mode: horizontal-tb; width: 46px; padding: 5px 0; border-radius: 0 4px 4px 0; text-align: center; }
</style>
