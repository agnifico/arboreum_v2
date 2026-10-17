<script>
  import { onMount, untrack } from "svelte";
  import { cubicIn, backOut } from "svelte/easing";
  import "$lib/concept/materials.css";
  import Camera from "$lib/concept/modules/Camera.svelte";
  import Nameplate from "$lib/concept/modules/Nameplate.svelte";
  import ListModule from "$lib/concept/modules/ListModule.svelte";
  import Screen from "$lib/concept/modules/Screen.svelte";
  import MapViewer from "$lib/concept/modules/MapViewer.svelte";
  import Treemoji from "$lib/concept/modules/Treemoji.svelte";
  import DPad from "$lib/concept/modules/DPad.svelte";
  import ControlPad from "$lib/concept/modules/ControlPad.svelte";
  import FormatDeck from "$lib/concept/modules/FormatDeck.svelte";
  import Speaker from "$lib/concept/modules/Speaker.svelte";
  import Configurator from "$lib/concept/Configurator.svelte";
  import { Device, provideDevice } from "$lib/concept/device.svelte.js";

  const device = provideDevice(new Device());
  $effect(() => {
    const bay = showBay ? bayModule : null;
    device.hasListModule = (view === "landscape" && leftList) || bay === "list";
    untrack(() => device.slot(bay));
    device.ctlSlotted = showCtl;
  });
  onMount(() => {
    const stop = device.start();
    // Start in a note, ready to write (no menu in the way).
    device.ready.then(() => {
      device.caretAt = "start";
      if (device.note) device.open();
      else device.newNote();
    });
    return stop;
  });

  function handleKeydown(event) {
    if (device.handleKey(event)) event.preventDefault();
  }

  // Swap motion: the module slides out, then the next slides in. The bay
  // slides sideways; the control slot (pad ⇄ deck) slides down and up.
  const shift = (u, y) => `transform: translate${y ? "Y" : "X"}(${u * (y ? 40 : 56)}px);`;
  const eject = (_, { y = false } = {}) => ({ duration: 200, easing: cubicIn, css: (t, u) => `${shift(u, y)} opacity: ${t};` });
  const insert = (_, { y = false } = {}) => ({ delay: 170, duration: 340, easing: backOut, css: (t, u) => `${shift(u, y)} opacity: ${Math.min(1, t * 2)};` });

  // Look test 01: free-standing modules that together make the 1610F.
  // Landscape and portrait arrangements, fitted FIXED. See CONCEPT.md.

  let orient = $state("auto"); // Configure: auto | landscape | portrait
  let shape = $state(null); // the window's shape, for auto
  let view = $derived(orient === "auto" ? (shape ?? "landscape") : orient); // landscape | portrait (arrangements, not devices)
  // Each arrangement keeps its own bay (CONCEPT.md, "Layout system"): portrait
  // starts without one, so the screen gets the room, and brought back it holds the List.
  let bays = $state({ landscape: { show: true, module: "map" }, portrait: { show: false, module: "list" } });
  let showBay = $derived(bays[view].show);
  let bayModule = $derived(bays[view].module); // what's in the bay: map | treemoji | list
  let showSpeaker = $state(true);
  let showChassis = $state(false); // optional enclosure behind the modules
  let showGlare = $state(false); // reflections on the screens
  let showList = $state(true); // landscape's left dock; otherwise the list is a full screen
  // There's one List module: in the bay, it isn't on the left.
  let leftList = $derived(showList && !(showBay && bayModule === "list"));
  let showDpad = $state(true);
  let showCtl = $state(true);
  // The D-pad follows the control slot: on with the control pad, off with the
  // Format deck or no controls. A manual toggle holds until the slot changes.
  let lastSlot = null;
  $effect(() => {
    const slot = showCtl ? device.controls : "none";
    if (lastSlot !== null && slot !== lastSlot) showDpad = slot === "pad";
    lastSlot = slot;
  });

  let stageW = $state(1440); // the page's own width, so overflow can't inflate it
  let winH = $state(900);

  // Fit (see CONCEPT.md, "Layout system"): the console zooms as a whole to
  // the tighter direction (up to 125%), and the screen takes whatever is left
  // in the other. Only the screen stretches; every other module keeps its
  // size. One rule everywhere: no device special cases, so no jumps.
  let small = $derived(stageW < 520 || winH < 520);
  let pad = $derived(
    small
      ? { x: 8, top: 8, bottom: 16 } // 16: room for the enclosure's 12px lip
      : { x: 24, top: 20, bottom: 20 }
  );
  let availW = $derived(stageW - pad.x * 2);
  let availH = $derived(winH - pad.top - pad.bottom);

  const MAX_ZOOM = 1.25;
  const PORTRAIT_W = 440;
  const PORTRAIT_MIN_H = 720; // portrait's design height, enclosure included
  // Padding around the grid: the enclosure's, or room for the bottom modules' thickness.
  let frame = $derived(showChassis ? { w: 44, h: 52 } : { w: 0, h: 14 });

  // Auto orientation follows the window's shape: taller than wide is portrait.
  // After the first pick it only switches 10% past square, so resizing near
  // the line doesn't flicker.
  $effect(() => {
    stageW, winH; // follow resizes and rotation
    const w = innerWidth, h = innerHeight;
    if (!shape) shape = h > w ? "portrait" : "landscape";
    else if (h > w * 1.1) shape = "portrait";
    else if (w > h * 1.1) shape = "landscape";
  });

  // With no speaker under it (or no bottom row), the bay has the whole right
  // column, and the Map viewer zooms in to use it.
  let tallBay = $derived(view === "landscape" && showBay && (!showSpeaker || !(showDpad || showCtl)));

  // Grid layout per view, from the placement rules (CONCEPT.md): controls
  // sit below the screen; a side holds at most one dock; with no controls
  // the screen takes the height. Gives the grid's css and its design size.
  // Tracks under the screen are fr, weighted by their design widths, so
  // extra width is shared in proportion and the deck keeps its share.
  const fr = (w) => `minmax(0, ${w}fr)`;
  let grid = $derived.by(() => {
    const bottom = showDpad || showCtl;
    const pair = (n) => (showDpad && showCtl ? `${"dpad ".repeat(n - 1)}ctl` : (showDpad ? "dpad " : "ctl ").repeat(n).trim());
    // The control slot's share of the bottom row: half beside the D-pad for
    // the control pad, two thirds for the Format deck (it matters more there).
    const deckShare = showDpad && showCtl && device.controls === "deck" ? 2 / 3 : null;
    if (view === "portrait") {
      // With the speaker, a slim side column down the right holds its strip
      // and the Configure gear; without it there's no column (the gear docks
      // in the nameplate) and the modules take the full width.
      const side = showSpeaker;
      const main = PORTRAIT_W - (side ? 44 : 0); // 30px column + gap
      const ctlW = Math.round((main - 14) * (deckShare ?? 1 / 2));
      const cols = ["110px", fr(main - 28 - 110 - ctlW), fr(ctlW), side && "30px"].filter(Boolean).join(" ");
      // The screen takes what's left and scrolls inside; it never grows with the note.
      // Controls sit right under the screen (as in landscape); the bay goes below them.
      // The controls row is slim; the deck's three rows beside the D-pad need 160.
      const rows = ["80px", "minmax(0, 1fr)", bottom && (deckShare ? "160px" : "144px"), showBay && "190px"].filter(Boolean);
      const sc = side ? " side" : "";
      const areas = [
        `"cam plate plate${side ? " plate" : ""}"`,
        `"scr scr scr${side ? (showBay || bottom ? " scr" : " side") : ""}"`,
        bottom && `"${showDpad && showCtl ? "dpad dpad ctl" : pair(3)}${sc}"`,
        showBay && `"bay bay bay${sc}"`,
      ].filter(Boolean);
      return {
        css: `grid-template-columns: ${cols}; grid-template-rows: ${rows.join(" ")}; grid-template-areas: ${areas.join(" ")};`,
        w: PORTRAIT_W,
        h: PORTRAIT_MIN_H - frame.h,
      };
    }
    const list = leftList;
    const right = showBay || showSpeaker;
    // Bottom-row cells keep their total width; the Format deck takes two thirds.
    const cells = list ? [400, 420] : [150, 400, 420];
    if (deckShare) {
      const total = cells.reduce((x, y) => x + y) + 14 * (cells.length - 1);
      const deckW = Math.round((total - 14) * deckShare);
      cells[cells.length - 2] += cells[cells.length - 1] - deckW;
      cells[cells.length - 1] = deckW;
    }
    const fixed = [list && 150, list && 110, right && 300].filter(Boolean);
    const cols = [list && "150px", list && "110px", ...cells.map(fr), right && "300px"].filter(Boolean);
    const n = cols.length - (right ? 1 : 0); // columns left of the right column
    // Right column: with a bottom row, bay over speaker; without one, just one of them.
    const r2 = right ? (showBay ? " bay" : bottom ? " scr" : " spk") : "";
    const r3 = right ? (showSpeaker ? " spk" : " bay") : "";
    const row2 = list ? "list list scr scr" : "scr scr scr";
    // Bottom row cells (left of the right column): under the list it's still the list.
    const under = list ? "list list " : "";
    const nCells = n - (list ? 2 : 0);
    const row3 = under + (showDpad && showCtl ? `${"dpad ".repeat(nCells - 1)}ctl` : pair(nCells));
    const areas = [
      `"cam ${"plate ".repeat(n - 1 + (right ? 1 : 0)).trim()}"`,
      `"${row2}${r2}"`,
      bottom && `"${row3}${r3}"`,
    ].filter(Boolean);
    const rows = bottom ? "112px minmax(0, 1fr) 182px" : "112px minmax(0, 1fr)";
    return {
      css: `grid-template-columns: ${cols.join(" ")}; grid-template-rows: ${rows}; grid-template-areas: ${areas.join(" ")};`,
      w: [...fixed, ...cells].reduce((x, y) => x + y) + 14 * (cols.length - 1),
      h: 112 + 636 + 14, // screen row 440 + bottom row 182 + gap, or the screen alone
    };
  });

  // Zoom so the design fits; the grid is then drawn at the window's size at
  // that zoom, so it's never smaller than the design and the screen's tracks
  // take the difference.
  let scale = $derived(Math.min(availW / (grid.w + frame.w), availH / (grid.h + frame.h), MAX_ZOOM));
  let size = $derived(`width: ${availW / scale - frame.w}px; height: ${availH / scale - frame.h}px;`);

</script>

<svelte:window
  bind:innerHeight={winH}
  onkeydown={handleKeydown}
  onbeforeunload={(e) => {
    if (device.dirty) e.preventDefault();
  }}
  onpagehide={() => device.saveOnLeave()}
/>
<svelte:document onvisibilitychange={() => document.visibilityState === "hidden" && device.saveOnLeave()} />

<svelte:head>
  <title>Arboreum 1610F · look test</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link
    href="https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@400;500;600;700&family=JetBrains+Mono:ital,wght@0,400;0,500;0,700;1,400&display=swap"
    rel="stylesheet"
  />
</svelte:head>

<main
  class="stage arb"
  bind:clientWidth={stageW}
  style="padding: {pad.top}px {pad.x}px {pad.bottom}px;"
>
  <div class="fit" style="width:{availW}px; height:{availH}px;">
    <div
      class="device {view}"
      class:chassis={showChassis}
      class:no-glare={!showGlare}
      style="{grid.css} {size} transform: scale({scale});"
    >
      {#if showChassis}
        <span class="screw c-tl"></span><span class="screw c-tr"></span>
        <span class="screw c-bl"></span><span class="screw c-br"></span>
      {/if}

      <Camera />
      <Nameplate />
      <!-- Configure: always the gear at the nameplate's left end, in every
           arrangement; its panel opens downward -->
      <div class="plate-dock">
        <Configurator {view} bind:orient bind:showBay={() => showBay, (v) => (bays[view].show = v)} bind:bayModule={() => bayModule, (v) => (bays[view].module = v)} bind:showSpeaker bind:showChassis bind:showGlare bind:showList bind:showDpad bind:showCtl />
      </div>
      {#if view === "landscape" && leftList}<ListModule />{/if}
      <Screen />
      {#if showBay}
        <!-- Swapping the bay: the old module ejects, the new one slides in -->
        {#key bayModule}
          <div class="slot bay-slot" in:insert out:eject>
            {#if bayModule === "map"}<MapViewer tall={tallBay} />
            {:else if bayModule === "treemoji"}<Treemoji tall={tallBay} />
            {:else}<ListModule />{/if}
          </div>
        {/key}
      {/if}
      {#if showDpad}<DPad />{/if}
      {#if showCtl}
        {#key device.controls}
          <div class="slot ctl-slot" in:insert={{ y: true }} out:eject={{ y: true }}>
            {#if device.controls === "deck"}<FormatDeck rows={view === "portrait" && showDpad ? 3 : 2} />{:else}<ControlPad />{/if}
          </div>
        {/key}
      {/if}
      {#if view === "portrait"}
        {#if showSpeaker}<div class="side"><Speaker /></div>{/if}
      {:else if showSpeaker && (showDpad || showCtl || !showBay)}
        <!-- (with no controls row the right column has room for one module) -->
        <Speaker />
      {/if}
    </div>
  </div>

</main>

<style>
  .stage {
    --bone: #e6e0d0;
    --bone-hi: #f4f0e4;
    --bone-side: #b7ae98;
    --alu: #c8ccc8;
    --alu-hi: #e6e9e6;
    --alu-side: #8b908c;
    --moss: #6d8756;
    --moss-hi: #87a26d;
    --moss-side: #4a5e3a;
    --lichen: #c2cab1;
    --lichen-hi: #dce2cf;
    --lichen-side: #8f9a7f;
    --graphite: #2d302f;
    --graphite-hi: #3b3f3d;
    --graphite-side: #171918;
    --signal: #ff6a1a;
    --signal-side: #b8460b;
    --alert: #e5323b;
    --glass: #0b100d;
    --phosphor: #d5e4c6;
    --phosphor-dim: #61735c;
    --mat: #ebe8e0;
    --mat-line: #d6d1c4;

    --label: "Chakra Petch", system-ui, sans-serif;
    --mono: "JetBrains Mono", ui-monospace, monospace;

    min-height: 100dvh;
    box-sizing: border-box; /* padding set inline: room for the Configure button */
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    background-color: var(--mat);
    background-image:
      linear-gradient(transparent calc(100% - 1px), var(--mat-line) 0),
      linear-gradient(90deg, transparent calc(100% - 1px), var(--mat-line) 0);
    background-size: 48px 48px;
    font-family: var(--label);
    color: var(--graphite);
    overflow-x: clip;
  }
  .fit {
    position: relative;
  }
  .device {
    position: absolute;
    top: 0;
    left: 0;
    display: grid;
    gap: 14px;
    padding-bottom: 14px; /* room for the bottom modules' thickness */
    transform-origin: top left;
  }
  .device.chassis {
    padding: 22px 22px 30px;
    border-radius: 28px;
    background: linear-gradient(170deg, #2e322f, #222523 45%, #1b1d1c);
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.08),
      inset 0 0 0 2px rgba(0, 0, 0, 0.35),
      0 12px 0 #0f1110,
      0 12px 0 1px rgba(0, 0, 0, 0.4),
      0 40px 60px -18px rgba(30, 28, 20, 0.55);
  }
  /* Swappable slots: both modules share the cell while one ejects and the next slides in */
  .slot {
    display: flex;
    min-width: 0;
    min-height: 0;
  }
  .bay-slot { grid-area: bay; }
  .ctl-slot { grid-area: ctl; }
  .slot > :global(.mod) {
    flex: 1;
    min-width: 0;
  }
  .side {
    grid-area: side;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-end;
    gap: 12px;
  }
  .plate-dock {
    grid-area: plate;
    align-self: center;
    justify-self: start;
    margin-left: 18px;
    z-index: 2;
  }
  .c-tl { top: 9px; left: 9px; }
  .c-tr { top: 9px; right: 9px; }
  .c-bl { bottom: 9px; left: 9px; }
  .c-br { bottom: 9px; right: 9px; }
</style>
