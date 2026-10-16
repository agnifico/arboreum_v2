<script>
  import { onMount } from "svelte";
  import "$lib/concept/materials.css";
  import Camera from "$lib/concept/modules/Camera.svelte";
  import Nameplate from "$lib/concept/modules/Nameplate.svelte";
  import ListModule from "$lib/concept/modules/ListModule.svelte";
  import Screen from "$lib/concept/modules/Screen.svelte";
  import MapViewer from "$lib/concept/modules/MapViewer.svelte";
  import DPad from "$lib/concept/modules/DPad.svelte";
  import ControlPad from "$lib/concept/modules/ControlPad.svelte";
  import Speaker from "$lib/concept/modules/Speaker.svelte";
  import Configurator from "$lib/concept/Configurator.svelte";
  import { Device, provideDevice } from "$lib/concept/device.svelte.js";

  const device = provideDevice(new Device());
  $effect(() => {
    device.hasListModule = view === "landscape" && showList;
    device.hasMapViewer = showBay;
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

  // Look test 01: free-standing modules that together make the 1610F.
  // Landscape and portrait arrangements, fitted FIXED. See CONCEPT.md.

  let view = $state("landscape"); // landscape | portrait (arrangements, not devices)
  let showBay = $state(true); // bay holds the Map viewer
  let showSpeaker = $state(true);
  let showChassis = $state(false); // optional enclosure behind the modules
  let showGlare = $state(false); // reflections on the screens
  let showList = $state(true); // landscape only; otherwise the list is a full screen
  let showDpad = $state(true);
  let showCtl = $state(true);

  // The device is drawn at its natural size, then scaled to fit the window.
  let natW = $state(0);
  let natH = $state(0);
  let stageW = $state(1440); // the page's own width, so overflow can't inflate it
  let winH = $state(900);

  // Fit: FIXED (see CONCEPT.md, "Layout system"). Each arrangement keeps its
  // designed proportions and zooms as a whole to fit the window, centred on
  // the mat. One rule everywhere: no device special cases, so no jumps.
  let small = $derived(stageW < 520 || winH < 520);
  // Landscape floats the Configure pill below the console; portrait docks it inside.
  let pad = $derived(
    small
      ? { x: 8, top: 8, bottom: view === "landscape" ? 52 : 16 } // 16: room for the enclosure's 12px lip
      : { x: 24, top: 20, bottom: view === "landscape" ? 64 : 20 }
  );
  let availW = $derived(stageW - pad.x * 2);
  let availH = $derived(winH - pad.top - pad.bottom);

  // Portrait is designed at 440 x 953 (a 9 : 19.5 phone); the screen row takes what's left.
  const PORTRAIT_W = 440;
  const PORTRAIT_H = 953;

  let scale = $derived(natW && natH ? Math.min(availW / natW, availH / natH, 1.25) : 1);

  // Orientation is picked once from the shape of the screen, then stays put.
  onMount(() => {
    if (innerWidth < innerHeight) view = "portrait";
  });

  // With no speaker under it (or no bottom row), the bay has the whole right
  // column, and the Map viewer zooms in to use it.
  let tallBay = $derived(view === "landscape" && showBay && (!showSpeaker || !(showDpad || showCtl)));

  // Grid layout per view; the right column only exists if something is in it.
  // Grid layout per view, from the placement rules (CONCEPT.md): controls
  // sit below the screen; a side holds at most one dock; with no controls
  // the screen takes the height.
  let grid = $derived.by(() => {
    const bottom = showDpad || showCtl;
    const pair = (n) => (showDpad && showCtl ? `${"dpad ".repeat(n - 1)}ctl` : (showDpad ? "dpad " : "ctl ").repeat(n).trim());
    if (view === "portrait") {
      // A slim side column down the right holds the speaker strip with the
      // Configure gear docked under it.
      const cols = "110px 90px 168px 30px";
      // The screen takes what's left and scrolls inside; it never grows with the note.
      const rows = ["80px", "minmax(0, 1fr)", showBay && "190px", bottom && "160px"].filter(Boolean);
      const sideRow = showBay || bottom ? "" : " side"; // nowhere else to dock it
      const areas = [
        '"cam plate plate plate"',
        `"scr scr scr ${sideRow ? "side" : "scr"}"`,
        showBay && '"bay bay bay side"',
        bottom && `"${showDpad && showCtl ? "dpad dpad ctl" : pair(3)} side"`,
      ].filter(Boolean);
      return `width: ${PORTRAIT_W}px; height: ${PORTRAIT_H}px; grid-template-columns: ${cols}; grid-template-rows: ${rows.join(" ")}; grid-template-areas: ${areas.join(" ")};`;
    }
    const list = showList;
    const right = showBay || showSpeaker;
    const cols = [...(list ? ["150px", "110px"] : ["150px"]), "400px", "420px", right && "300px"].filter(Boolean);
    const n = cols.length - (right ? 1 : 0); // columns left of the right column
    // Right column: with a bottom row, bay over speaker; without one, just one of them.
    const r2 = right ? (showBay ? " bay" : bottom ? " scr" : " spk") : "";
    const r3 = right ? (showSpeaker ? " spk" : " bay") : "";
    const row2 = list ? "list list scr scr" : "scr scr scr";
    // Bottom row cells (left of the right column): under the list it's still the list.
    const under = list ? "list list " : "";
    const cells = n - (list ? 2 : 0);
    const row3 = under + (showDpad && showCtl ? `${"dpad ".repeat(cells - 1)}ctl` : pair(cells));
    const areas = [
      `"cam ${"plate ".repeat(n - 1 + (right ? 1 : 0)).trim()}"`,
      `"${row2}${r2}"`,
      bottom && `"${row3}${r3}"`,
    ].filter(Boolean);
    const rows = bottom ? "112px 440px 182px" : "112px 636px";
    return `grid-template-columns: ${cols.join(" ")}; grid-template-rows: ${rows}; grid-template-areas: ${areas.join(" ")};`;
  });

</script>

<svelte:window
  bind:innerHeight={winH}
  onkeydown={handleKeydown}
  onbeforeunload={(e) => {
    if (device.dirty) e.preventDefault();
  }}
/>

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
  <div class="fit" style="width:{natW * scale}px; height:{natH * scale}px;">
    <div
      class="device {view}"
      class:chassis={showChassis}
      class:no-glare={!showGlare}
      style="{grid} transform: scale({scale});"
      bind:offsetWidth={natW}
      bind:offsetHeight={natH}
    >
      {#if showChassis}
        <span class="screw c-tl"></span><span class="screw c-tr"></span>
        <span class="screw c-bl"></span><span class="screw c-br"></span>
      {/if}

      <Camera />
      <Nameplate />
      {#if view === "landscape" && showList}<ListModule />{/if}
      <Screen />
      {#if showBay}<MapViewer tall={tallBay} />{/if}
      {#if showDpad}<DPad />{/if}
      {#if showCtl}<ControlPad />{/if}
      {#if view === "portrait"}
        <div class="side">
          {#if showSpeaker}<Speaker />{/if}
          <Configurator bind:view bind:showBay bind:showSpeaker bind:showChassis bind:showGlare bind:showList bind:showDpad bind:showCtl docked />
        </div>
      {:else if showSpeaker && (showDpad || showCtl || !showBay)}
        <!-- (with no controls row the right column has room for one module) -->
        <Speaker />
      {/if}
    </div>
  </div>

  {#if view === "landscape"}
    <Configurator bind:view bind:showBay bind:showSpeaker bind:showChassis bind:showGlare bind:showList bind:showDpad bind:showCtl />
  {/if}
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
  .side {
    grid-area: side;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-end;
    gap: 12px;
  }
  .c-tl { top: 9px; left: 9px; }
  .c-tr { top: 9px; right: 9px; }
  .c-bl { bottom: 9px; left: 9px; }
  .c-br { bottom: 9px; right: 9px; }
</style>
