<script>
  // The notes as numbered rows, shared by the List module and the screen's
  // full-screen list (portrait). The selected row follows the D-pad.
  import { useDevice } from "./device.svelte.js";
  const device = useDevice();
  let { big = false } = $props();

  // Keep the selected row in view as the D-pad moves through a long list.
  let list = $state();
  $effect(() => {
    device.index;
    device.isNew;
    list?.querySelector("li.sel")?.scrollIntoView({ block: "nearest" });
  });

  // Touch/mouse: tap selects, tapping the selected row again opens it.
  // While a note is open, tapping another opens it straight away (the open
  // one is saved first). While picking notes, a tap picks or unpicks.
  // A long press (touch) starts picking, with that note picked. The click
  // that follows it is swallowed so it doesn't unpick it straight away.
  let press = null;
  let longPressed = false;
  function pressDown(e, n) {
    if (e.pointerType === "mouse" || device.picking) return;
    const at = { x: e.clientX, y: e.clientY };
    press = { at, timer: setTimeout(async () => {
      press = null;
      longPressed = true;
      if (device.editing) await device.leave(); // leaving a note saves it
      device.selectedId = n.noteid;
      device.startPicking(n.noteid);
      navigator.vibrate?.(12);
    }, 480) };
  }
  function pressMove(e) {
    if (press && Math.hypot(e.clientX - press.at.x, e.clientY - press.at.y) > 8) pressEnd();
  }
  function pressEnd() {
    if (press) clearTimeout(press.timer);
    press = null;
  }

  function tap(i) {
    if (longPressed) return void (longPressed = false);
    if (device.picking) {
      device.index = i;
      return device.togglePick(device.notes[i].noteid);
    }
    if (device.editing) return device.switchTo(i);
    if (i === device.index) device.press("a");
    else device.index = i;
  }
</script>

<ol class="list-rows" class:big bind:this={list}>
  {#if device.isNew}
    <!-- The note being written, before its first save -->
    <li class="sel draft">
      <!-- <span class="li-num">··</span> -->
      {#if device.draftIcon}<img class="li-tree" src={device.draftIcon} alt="" />{:else}<span class="li-tree li-none">?</span>{/if}
      <span class="li-title">{device.draftTitle.trim() || "untitled"}</span>
      <span class="li-when">new</span>
    </li>
  {/if}
  {#each device.notes as n, i (n.noteid)}
    <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
    <!-- Keyboard users drive the list with the D-pad keys (arrows, Enter) -->
    {@const picked = device.picking && device.picked.includes(n.noteid)}
    <li
      class:sel={!device.isNew && i === device.index}
      class:picked
      onclick={() => tap(i)}
      onpointerdown={(e) => pressDown(e, n)}
      onpointermove={pressMove}
      onpointerup={pressEnd}
      onpointercancel={pressEnd}
      oncontextmenu={(e) => e.preventDefault()}
    >
      {#if device.picking}<span class="li-pick" aria-label={picked ? "picked" : "not picked"}>{picked ? "[x]" : "[ ]"}</span>{/if}
      <!-- <span class="li-num">{String(i + 1).padStart(2, "0")}</span> -->
      <img class="li-tree" src={n.tree} alt="" />
      <span class="li-title">{n.title}</span>
      <span class="li-when">{n.when}</span>
    </li>
  {:else}
    {#if !device.isNew}<li class="empty">NO NOTES YET · B FOR A NEW NOTE</li>{/if}
  {/each}
</ol>

<style>
  .list-rows {
    list-style: none;
    margin: 0;
    padding: 6px 0;
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    scrollbar-width: none;
  }
  .list-rows li {
    cursor: pointer;
    user-select: none;
    -webkit-user-select: none;
    -webkit-touch-callout: none; /* a long press picks, not the phone's menu */
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 7px 12px;
    font-size: 12.5px;
    color: #a9bb9d;
    border-left: 3px solid transparent;
  }
  .list-rows li.sel {
    background: color-mix(in srgb, var(--signal) 12%, transparent);
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
  /* Picking: the same markers as task lists */
  .li-pick {
    color: var(--phosphor-dim);
    font-size: 11px;
  }
  .picked .li-pick {
    color: var(--signal);
    font-weight: 700;
  }
  .list-rows li.picked {
    color: #fff;
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
  .draft {
    cursor: default;
    font-style: italic;
  }
  .li-none {
    display: inline-grid;
    place-items: center;
    font-style: normal;
    color: var(--phosphor-dim);
  }
  .empty {
    color: var(--phosphor-dim);
    font-size: 11px;
    letter-spacing: 0.08em;
  }
</style>
