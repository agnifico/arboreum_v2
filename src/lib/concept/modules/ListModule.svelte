<script>
  import { useDevice, SORTS } from "../device.svelte.js";
  import NoteRows from "../NoteRows.svelte";
  const device = useDevice();
  const keepFocus = (e) => e.preventDefault();
  // The selection switch: the classic app's Select/Exit slider, stood on end.
  // Switched on, the slider rises and uncovers the delete key.
  async function toggleSelect() {
    if (device.picking) return device.stopPicking();
    if (device.editing) await device.leave(); // leaving a note saves it
    device.startPicking();
  }
</script>

<!-- LIST: notes as a numbered list with index tabs (left dock, or the bay) -->
<section class="mod graphite r-scr list" class:focused={device.focus === "list"} aria-label="List module">
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
    <div class="sel-switch" class:on={device.picking}>
      <button class="sel-del" disabled={!device.picking || !device.pickedNotes.length} aria-label="Delete the picked notes" onmousedown={keepFocus} onclick={() => device.askDeletePicked()}>
        <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M6 1.5h4l.5 1.5H14v1.5H2V3h3.5zM3.5 6h9l-.8 8.5H4.3z" /></svg>
      </button>
      <button class="sel-slide" aria-pressed={device.picking} aria-label={device.picking ? "Stop selecting notes" : "Select notes to delete"} onmousedown={keepFocus} onclick={toggleSelect}>{device.picking ? "EXIT" : "SELECT"}</button>
    </div>
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
    background: linear-gradient(90deg, var(--signal-hi), var(--signal));
    box-shadow: 0 2px 0 var(--signal-side);
  }
  /* The selection switch: a recessed track; the slider covers the delete key
     until it's switched on, then rises to uncover it */
  .sel-switch {
    --slide: 58px;
    --del: 28px;
    position: relative;
    margin-top: 10px;
    height: calc(var(--slide) + var(--del));
    border-radius: 0 6px 6px 0;
    background: #161817;
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.6), 0 0 0 1.5px #3b3f3d;
    transition: box-shadow 0.2s ease;
  }
  .sel-switch.on {
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.6), 0 0 0 1.5px var(--signal);
  }
  .sel-slide {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    height: var(--slide);
    writing-mode: vertical-rl;
    font-size: 8.5px;
    font-weight: 700;
    letter-spacing: 0.16em;
    color: rgba(210, 214, 210, 0.75);
    background: linear-gradient(90deg, #3b3f3d, #2b2e2d);
    border-radius: 0 5px 5px 0;
    box-shadow: 0 2px 0 #121413, inset 0 1px 0 rgba(255, 255, 255, 0.1);
    transform: translateY(var(--del)); /* off: it sits over the delete key */
    transition: transform 0.16s ease;
  }
  .on .sel-slide {
    transform: none;
    color: var(--signal);
  }
  .sel-del {
    position: absolute;
    left: 2px;
    right: 2px;
    bottom: 2px;
    height: calc(var(--del) - 4px);
    display: grid;
    place-items: center;
    border-radius: 0 4px 4px 0;
    background: linear-gradient(180deg, #f0504f, var(--alert));
    box-shadow: inset 0 -2px 0 rgba(0, 0, 0, 0.25);
  }
  .sel-del svg {
    width: 11px;
    height: 11px;
    fill: #fff2f0;
  }
  .sel-del:disabled {
    filter: saturate(0.4) brightness(0.7);
  }
  .sel-del:not(:disabled):active {
    box-shadow: inset 0 2px 3px rgba(0, 0, 0, 0.4);
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
  :global(.portrait) .sel-switch { --slide: 22px; --del: 22px; margin-top: 8px; }
  :global(.portrait) .sel-slide { writing-mode: horizontal-tb; font-size: 7.5px; letter-spacing: 0.1em; }
</style>
