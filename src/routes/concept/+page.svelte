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

  // Look test 01: free-standing modules that together make the 1610F.
  // Desktop (landscape) and mobile (portrait) layouts. See CONCEPT.md.

  let view = $state("desktop"); // desktop | mobile
  let showBay = $state(true); // bay holds the Map viewer
  let showSpeaker = $state(true);
  let showChassis = $state(false); // optional enclosure behind the modules

  // The device is drawn at its natural size, then scaled to fit the window.
  let natW = $state(0);
  let natH = $state(0);
  let stageW = $state(1440); // the page's own width, so overflow can't inflate it
  let winH = $state(900);
  let scale = $derived(natW && natH ? Math.min((stageW - 48) / natW, (winH - 140) / natH, 1.2) : 1);

  onMount(() => {
    if (matchMedia("(max-width: 700px)").matches) view = "mobile";
  });

  // Grid layout per view; the right column only exists if something is in it.
  let grid = $derived.by(() => {
    if (view === "mobile") {
      const rows = ["92px", "430px", showBay && "236px", "176px", showSpeaker && "64px"].filter(Boolean);
      const areas = [
        '"cam plate plate"',
        '"scr scr scr"',
        showBay && '"bay bay bay"',
        '"dpad dpad ctl"',
        showSpeaker && '"spk spk spk"',
      ].filter(Boolean);
      return `grid-template-columns: 110px 96px 206px; grid-template-rows: ${rows.join(" ")}; grid-template-areas: ${areas.join(" ")};`;
    }
    const right = showBay || showSpeaker;
    const cols = ["150px", "110px", "400px", "420px", right && "300px"].filter(Boolean);
    const r2 = right ? (showBay ? " bay" : " scr") : "";
    const r3 = right ? (showSpeaker ? " spk" : " bay") : "";
    const areas = [
      `"cam plate plate plate${right ? " plate" : ""}"`,
      `"list list scr scr${r2}"`,
      `"list list dpad ctl${r3}"`,
    ];
    return `grid-template-columns: ${cols.join(" ")}; grid-template-rows: 112px 440px 182px; grid-template-areas: ${areas.join(" ")};`;
  });

  // Without the Map viewer there's no plot either; the screen says what's missing.
  let missing = $derived(showBay ? "NO TREE" : "NO TREE · NO PLOT");
  let drawerLabel = $derived(showBay ? "TREE" : "TREE · PLOT");
</script>

<svelte:window bind:innerHeight={winH} />

<svelte:head>
  <title>Arboreum 1610F · look test</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link
    href="https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@400;500;600;700&family=JetBrains+Mono:ital,wght@0,400;0,500;0,700;1,400&display=swap"
    rel="stylesheet"
  />
</svelte:head>

<main class="stage arb" bind:clientWidth={stageW}>
  <header class="caption">
    <span class="cap-title">ARBOREUM <span class="code-id">1610F</span></span>
    <span class="cap-sub">Look test 01 · {view === "desktop" ? "desktop / landscape" : "mobile / portrait"} · static</span>
  </header>

  <div class="fit" style="width:{natW * scale}px; height:{natH * scale}px;">
    <div
      class="device {view}"
      class:chassis={showChassis}
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
      {#if view === "desktop"}<ListModule />{/if}
      <Screen {missing} {drawerLabel} />
      {#if showBay}<MapViewer />{/if}
      <DPad />
      <ControlPad />
      {#if showSpeaker}<Speaker slots={view === "mobile" ? 22 : 11} />{/if}
    </div>
  </div>

  <Configurator bind:view bind:showBay bind:showSpeaker bind:showChassis />
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
    box-sizing: border-box;
    padding: 24px 24px 84px; /* bottom: room for the Configure button */
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
  .caption {
    align-self: stretch;
    display: flex;
    flex-wrap: wrap;
    gap: 6px 16px;
    align-items: baseline;
    letter-spacing: 0.08em;
  }
  .cap-title {
    font-weight: 700;
    font-size: 15px;
  }
  .code-id {
    font-family: var(--mono);
  }
  .cap-sub {
    font-size: 12px;
    color: #6d6a62;
    text-transform: uppercase;
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
  .c-tl { top: 9px; left: 9px; }
  .c-tr { top: 9px; right: 9px; }
  .c-bl { bottom: 9px; left: 9px; }
  .c-br { bottom: 9px; right: 9px; }
</style>
