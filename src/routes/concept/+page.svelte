<script>
  import { onMount } from "svelte";

  // Look test 01: free-standing modules that together make the F16O.
  // Desktop (landscape) and mobile (portrait) layouts. See CONCEPT.md.

  let view = $state("desktop"); // desktop | mobile
  let showBay = $state(true); // bay holds the Map viewer
  let showSpeaker = $state(true);
  let panelOpen = $state(false);

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

  const lines = [
    [{ t: "# ", c: "md" }, { t: "Morning pages", c: "h" }],
    [],
    [{ t: "Woke up before the alarm. The fern on the sill has a new curl, " }, { t: "**", c: "md" }, { t: "third one this week", c: "b" }, { t: "**", c: "md" }, { t: "." }],
    [],
    [{ t: "- [x] ", c: "md" }, { t: "water the fern", c: "done" }],
    [{ t: "- [ ] ", c: "md" }, { t: "repot the little palm" }],
    [{ t: "- [ ] ", c: "md" }, { t: "write to Mira about Sunday" }],
    [],
    [{ t: "> ", c: "md" }, { t: "plant this one somewhere sunny", c: "q" }],
  ];
  const cursorLine = 8;

  const formatKeys = ["B", "I", "U", "S", "H1", "H2", "•", "1.", "☐", "❝", "</>"];

  const notes = [
    { title: "morning-pages", when: "now", tree: "/Flower_tree2.png" },
    { title: "groceries-for-the-week", when: "2h", tree: "/t-red.png" },
    { title: "apple-pie-recipe", when: "1d", tree: "/Tree2.png" },
    { title: "letters-to-mira", when: "3d", tree: "/Palm_tree2_2.png" },
    { title: "zebra-facts", when: "1w", tree: "/t-blue.png" },
    { title: "garden-plans-2026", when: "2w", tree: "/Moss_tree2.png" },
    { title: "books-to-read", when: "1m", tree: "/Snow_tree2.png" },
  ];
  const selectedNote = 0;

  // A tiny pixel map for the Map viewer: w water, s sand, g grass, d dark grass.
  const mapRows = [
    "wwwwwwwwwwww",
    "wwsggggsswww",
    "wsggddgggsww",
    "wsgdddggggsw",
    "wwsggggddgsw",
    "wwwsggggggsw",
    "wwwwssgggsww",
    "wwwwwwssswww",
    "wwwwwwwwwwww",
  ];
  const plantedTrees = [
    { x: 4, y: 3, src: "/t-red.png" },
    { x: 7, y: 2, src: "/Tree2.png" },
    { x: 8, y: 5, src: "/Palm_tree2_2.png" },
  ];
  const mapCursor = { x: 5, y: 5 };

  function handleKeydown(event) {
    if (event.key === "Escape") panelOpen = false;
  }
  function handleWindowClick(event) {
    if (panelOpen && !event.target.closest(".config")) panelOpen = false;
  }
</script>

<svelte:window
  bind:innerHeight={winH}
  onkeydown={handleKeydown}
  onclick={handleWindowClick}
/>

<svelte:head>
  <title>Arboreum F16O · look test</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link
    href="https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@400;500;600;700&family=JetBrains+Mono:ital,wght@0,400;0,500;0,700;1,400&display=swap"
    rel="stylesheet"
  />
</svelte:head>

<main class="stage" bind:clientWidth={stageW}>
  <header class="caption">
    <span class="cap-title">ARBOREUM <span class="code-id">F16O</span></span>
    <span class="cap-sub">Look test 01 · {view === "desktop" ? "desktop / landscape" : "mobile / portrait"} · static</span>
  </header>

  <div class="fit" style="width:{natW * scale}px; height:{natH * scale}px;">
    <div
      class="device {view}"
      style="{grid} transform: scale({scale});"
      bind:offsetWidth={natW}
      bind:offsetHeight={natH}
    >
      <!-- CAMERA: doubles as the media button -->
      <section class="mod alu cam" aria-label="Camera module">
        <span class="screw s-tl"></span><span class="screw s-br"></span>
        <button class="lens" aria-label="Camera: add an image">
          <span class="lens-glass"></span>
        </button>
        <span class="cam-led"></span>
        <span class="etch cam-label">CAM · MEDIA</span>
      </section>

      <!-- NAMEPLATE: fixed hardware branding -->
      <section class="mod bone plate" aria-label="Nameplate">
        <span class="screw s-tl"></span><span class="screw s-bl"></span>
        <div class="plate-name">
          <span class="brand">ARBOREUM</span>
          <span class="model">F16O</span>
        </div>
        <div class="plate-print">
          <span>MODULAR NOTE SYSTEM</span>
          <span>REV 16.10 · FRI</span>
          <span class="marks"><i>◇</i><i>⌂</i><i>◎</i></span>
        </div>
        <div class="plate-stripe" aria-hidden="true"></div>
      </section>

      <!-- LIST (desktop): notes as a numbered list with index tabs -->
      {#if view === "desktop"}
        <section class="mod graphite list" aria-label="List module">
          <span class="screw s-tl"></span><span class="screw s-bl"></span>
          <div class="list-glass">
            <div class="list-head">
              <span>NOTES · {notes.length}</span>
              <span class="list-sort">SAVED ▾</span>
            </div>
            <ol class="list-rows">
              {#each notes as n, i}
                <li class:sel={i === selectedNote}>
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
      {/if}

      <!-- SCREEN -->
      <section class="mod graphite screen" aria-label="Screen module">
        <span class="screw s-tl"></span><span class="screw s-tr"></span>
        <span class="screw s-bl"></span><span class="screw s-br"></span>
        <div class="glass">
          <div class="status">
            <span>▣ <b>morning-pages</b></span>
            <span class="status-r"><span class="dot-unsaved">●</span> UNSAVED<span class="wide-only"> <span class="sep">│</span> 11:42 <span class="sep">│</span> 16·10</span></span>
          </div>

          <div class="code" aria-label="Note text">
            {#each lines as line, i}
              <div class="ln" class:current={i === cursorLine}>
                <span class="gutter">{i + 1}</span>
                <span class="txt">{#each line as seg}<span class={seg.c}>{seg.t}</span>{/each}{#if i === cursorLine}<span class="cursor"></span>{/if}</span>
              </div>
            {/each}
          </div>

          <!-- Missing-module alert + drawer handle -->
          <div class="alert">
            <span class="bang">!</span>
            <span>{missing}</span>
            <span class="alert-arrow">▸</span>
          </div>
          <div class="drawer-tab" aria-hidden="true">{drawerLabel}</div>

          <!-- A/B context: overlaid, always visible -->
          <div class="ab">
            <span><i class="pip a">A</i>SAVE</span>
            <span><i class="pip b">B</i>LIST</span>
            <span><i class="pip st">≡</i>START</span>
          </div>

          <!-- Secondary strip: paged with ◀ ▶ (format · details) -->
          <div class="strip">
            <span class="pg">◀</span>
            <span class="strip-label">FORMAT</span>
            <span class="pg">▶</span>
            <span class="keys">
              {#each formatKeys as k}<span class="key">{k}</span>{/each}
            </span>
            <span class="pages"><i class="on"></i><i></i></span>
          </div>
          <div class="glare" aria-hidden="true"></div>
        </div>
        <span class="etch-dark screen-label">SCR-01 · MONO</span>
      </section>

      <!-- BAY: Map viewer -->
      {#if showBay}
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
      {/if}

      <!-- D-PAD -->
      <section class="mod moss dpadmod" aria-label="D-pad module">
        <span class="screw s-tl"></span><span class="screw s-tr"></span>
        <span class="screw s-bl"></span><span class="screw s-br"></span>
        <div class="dpad">
          <button class="arm up" aria-label="Up"><span>▲</span></button>
          <button class="arm right" aria-label="Right"><span>▶</span></button>
          <button class="arm down" aria-label="Down"><span>▼</span></button>
          <button class="arm left" aria-label="Left"><span>◀</span></button>
          <span class="hub"></span>
        </div>
        <span class="etch dpad-label">NAV-01</span>
      </section>

      <!-- CONTROL PAD: Start, B, A in one straight row -->
      <section class="mod bone ctl" aria-label="Control pad">
        <span class="screw s-tl"></span><span class="screw s-tr"></span>
        <span class="screw s-bl"></span><span class="screw s-br"></span>
        <div class="ctl-row">
          <div class="btn-col">
            <button class="start" aria-label="Start"></button>
            <span class="etch">START</span>
          </div>
          <div class="ab-pad">
            <div class="btn-col">
              <button class="round b" aria-label="B">B</button>
            </div>
            <div class="btn-col">
              <button class="round a" aria-label="A">A</button>
            </div>
          </div>
        </div>
        <span class="etch ctl-label">CTL-01 · ⇄ FORMAT DECK</span>
      </section>

      <!-- SPEAKER -->
      {#if showSpeaker}
        <section class="mod graphite spk" aria-label="Speaker module">
          <span class="screw s-tl"></span><span class="screw s-br"></span>
          <div class="slots" aria-hidden="true">{#each Array(view === "mobile" ? 22 : 11) as _}<i></i>{/each}</div>
          <div class="spk-foot">
            <span class="pwr"></span>
            <span class="etch-dark">PWR</span>
            <span class="etch-dark spk-model">SPK-01</span>
          </div>
        </section>
      {/if}
    </div>
  </div>

  <!-- Page-level configurator: outside the device, so nothing on it moves -->
  <div class="config">
    {#if panelOpen}
      <div class="config-panel" role="dialog" aria-label="Configure the device">
        <p class="cfg-h">VIEW</p>
        <div class="seg" role="group" aria-label="View">
          <button class:on={view === "desktop"} aria-pressed={view === "desktop"} onclick={() => (view = "desktop")}>DESKTOP</button>
          <button class:on={view === "mobile"} aria-pressed={view === "mobile"} onclick={() => (view = "mobile")}>MOBILE</button>
        </div>
        <p class="cfg-h">MODULES</p>
        <button class="toggle" aria-pressed={showBay} onclick={() => (showBay = !showBay)}>
          <span class="sw" class:on={showBay}></span> BAY · MAP VIEWER
        </button>
        <button class="toggle" aria-pressed={showSpeaker} onclick={() => (showSpeaker = !showSpeaker)}>
          <span class="sw" class:on={showSpeaker}></span> SPEAKER
        </button>
        <p class="cfg-note">
          {view === "desktop" ? "The list sits beside the screen on desktop." : "On mobile the list opens full screen."}
        </p>
      </div>
    {/if}
    <button
      class="config-btn"
      aria-expanded={panelOpen}
      aria-label="Configure the device"
      onclick={() => (panelOpen = !panelOpen)}
    >
      <span class="cfg-dot"></span> CONFIGURE
    </button>
  </div>
</main>

<style>
  /* ------------------------------------------------------------------ */
  /* Tone family: muted workshop colours, signal orange as the accent.  */
  /* ------------------------------------------------------------------ */
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

  /* ------------------------------------------------------------------ */
  /* Device: no chassis. The modules themselves make the console.       */
  /* ------------------------------------------------------------------ */
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

  /* Module body: face gradient, lit top edge, hard side, soft shadow. */
  .mod {
    --face: var(--alu);
    --face-hi: var(--alu-hi);
    --side: var(--alu-side);
    position: relative;
    border-radius: 14px;
    background: linear-gradient(165deg, var(--face-hi), var(--face) 38%, color-mix(in oklab, var(--face), black 8%));
    box-shadow:
      inset 0 1.5px 0 rgba(255, 255, 255, 0.55),
      inset 0 -2px 0 rgba(0, 0, 0, 0.12),
      0 6px 0 var(--side),
      0 6px 0 1px rgba(0, 0, 0, 0.3),
      0 16px 20px -6px rgba(40, 36, 24, 0.45);
  }
  .alu { --face: var(--alu); --face-hi: var(--alu-hi); --side: var(--alu-side); }
  .bone { --face: var(--bone); --face-hi: var(--bone-hi); --side: var(--bone-side); }
  .moss { --face: var(--moss); --face-hi: var(--moss-hi); --side: var(--moss-side); }
  .graphite {
    --face: var(--graphite);
    --face-hi: var(--graphite-hi);
    --side: var(--graphite-side);
    box-shadow:
      inset 0 1.5px 0 rgba(255, 255, 255, 0.12),
      inset 0 -2px 0 rgba(0, 0, 0, 0.3),
      0 6px 0 var(--side),
      0 6px 0 1px rgba(0, 0, 0, 0.4),
      0 16px 20px -6px rgba(40, 36, 24, 0.55);
  }

  .cam { grid-area: cam; }
  .plate { grid-area: plate; }
  .list { grid-area: list; }
  .screen { grid-area: scr; }
  .bay { grid-area: bay; }
  .dpadmod { grid-area: dpad; }
  .ctl { grid-area: ctl; }
  .spk { grid-area: spk; }

  /* Screws */
  .screw {
    position: absolute;
    width: 11px;
    height: 11px;
    border-radius: 50%;
    background: radial-gradient(circle at 35% 30%, #fbfbfa, #b8bcbb 40%, #6a6f6d 75%, #464a48);
    box-shadow: 0 1px 0 rgba(255, 255, 255, 0.35), inset 0 -1px 1px rgba(0, 0, 0, 0.35);
  }
  .screw::after {
    content: "";
    position: absolute;
    left: 2px;
    right: 2px;
    top: 4.5px;
    height: 2px;
    border-radius: 1px;
    background: rgba(40, 42, 41, 0.75);
    transform: rotate(-35deg);
  }
  .s-tl { top: 9px; left: 9px; }
  .s-tr { top: 9px; right: 9px; }
  .s-bl { bottom: 9px; left: 9px; }
  .s-br { bottom: 9px; right: 9px; }

  /* Etched/printed hardware labels */
  .etch,
  .etch-dark {
    font-family: var(--label);
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.16em;
    text-transform: uppercase;
  }
  .etch {
    color: rgba(30, 32, 31, 0.55);
    text-shadow: 0 1px 0 rgba(255, 255, 255, 0.45);
  }
  .etch-dark {
    color: rgba(210, 214, 210, 0.4);
    text-shadow: 0 -1px 0 rgba(0, 0, 0, 0.6);
  }

  button {
    font: inherit;
    border: none;
    padding: 0;
    cursor: pointer;
  }

  /* ------------------------------------------------------------------ */
  /* Camera                                                              */
  /* ------------------------------------------------------------------ */
  .cam {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .lens {
    width: 70px;
    height: 70px;
    border-radius: 50%;
    background: radial-gradient(circle at 50% 50%, #2a2d2c 58%, #121413 60%, #3a3e3c 70%, #1a1c1b 72%);
    box-shadow:
      0 0 0 3px #9aa09c,
      0 0 0 4px rgba(0, 0, 0, 0.35),
      0 3px 0 4px var(--alu-side),
      0 6px 10px 2px rgba(0, 0, 0, 0.35);
    display: grid;
    place-items: center;
    transition: transform 0.08s ease, box-shadow 0.08s ease;
  }
  .lens:active {
    transform: translateY(2px);
    box-shadow: 0 0 0 3px #9aa09c, 0 0 0 4px rgba(0, 0, 0, 0.35), 0 1px 0 4px var(--alu-side);
  }
  .lens-glass {
    width: 34px;
    height: 34px;
    border-radius: 50%;
    background:
      radial-gradient(circle at 36% 32%, rgba(255, 255, 255, 0.75) 0 3px, transparent 4px),
      radial-gradient(circle at 62% 66%, rgba(140, 200, 255, 0.35) 0 5px, transparent 7px),
      radial-gradient(circle, #24364a, #0a1018 70%);
    box-shadow: 0 0 0 2px var(--signal), inset 0 0 6px rgba(0, 0, 0, 0.8);
  }
  .cam-led {
    position: absolute;
    top: 14px;
    right: 22px;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #3a3e3c;
    box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.6);
  }
  .cam-label {
    position: absolute;
    left: 10px;
    top: 50%;
    transform: translateY(-50%) rotate(180deg);
    writing-mode: vertical-rl;
    font-size: 8px;
  }

  /* ------------------------------------------------------------------ */
  /* Nameplate                                                           */
  /* ------------------------------------------------------------------ */
  .plate {
    display: flex;
    align-items: center;
    gap: 36px;
    padding: 0 40px 0 44px;
    overflow: hidden;
  }
  .plate-name {
    display: flex;
    align-items: baseline;
    gap: 14px;
  }
  .brand {
    font-weight: 700;
    font-size: 44px;
    letter-spacing: 0.06em;
    color: #2b2d2c;
    text-shadow: 0 1px 0 rgba(255, 255, 255, 0.7), 0 -1px 0 rgba(0, 0, 0, 0.12);
  }
  .model {
    font-family: var(--mono); /* mono keeps the O of F16O distinct from a zero */
    font-weight: 700;
    font-size: 26px;
    letter-spacing: 0.04em;
    color: var(--signal);
    text-shadow: 0 1px 0 rgba(255, 255, 255, 0.5);
  }
  .plate-print {
    display: flex;
    flex-direction: column;
    gap: 3px;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.18em;
    color: rgba(43, 45, 44, 0.6);
    border-left: 1.5px solid rgba(43, 45, 44, 0.25);
    padding-left: 16px;
  }
  .marks {
    display: flex;
    gap: 8px;
  }
  .marks i {
    font-style: normal;
  }
  .plate-stripe {
    position: absolute;
    right: 0;
    top: 0;
    bottom: 0;
    width: 150px;
    background: linear-gradient(115deg, transparent 0 34%, var(--signal) 34% 52%, transparent 52% 60%, #2b2d2c 60% 66%, transparent 66%);
  }

  /* Shared glass for every screen */
  .glass,
  .list-glass,
  .map-glass {
    position: relative;
    box-sizing: border-box;
    border-radius: 8px;
    background: radial-gradient(120% 90% at 30% 20%, #142019, var(--glass) 70%);
    box-shadow:
      inset 0 0 0 2px #050706,
      inset 0 3px 10px rgba(0, 0, 0, 0.8),
      0 1px 0 rgba(255, 255, 255, 0.08);
    overflow: hidden;
    font-family: var(--mono);
    color: var(--phosphor);
  }
  .glare {
    position: absolute;
    inset: 0;
    background: linear-gradient(118deg, rgba(255, 255, 255, 0.07) 0 22%, transparent 22.5% 100%);
    pointer-events: none;
  }

  /* ------------------------------------------------------------------ */
  /* List module                                                         */
  /* ------------------------------------------------------------------ */
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

  /* ------------------------------------------------------------------ */
  /* Screen                                                              */
  /* ------------------------------------------------------------------ */
  .screen {
    padding: 26px 30px 30px;
  }
  .screen-label {
    position: absolute;
    bottom: 9px;
    right: 34px;
    font-size: 9px;
  }
  .glass {
    height: 100%;
  }
  .status {
    display: flex;
    justify-content: space-between;
    padding: 10px 18px;
    font-size: 12px;
    letter-spacing: 0.04em;
    color: var(--phosphor-dim);
    border-bottom: 1px solid rgba(213, 228, 198, 0.08);
  }
  .status b {
    color: var(--phosphor);
    font-weight: 500;
  }
  .dot-unsaved {
    color: var(--signal);
  }
  .sep {
    opacity: 0.4;
    margin: 0 4px;
  }
  .code {
    padding: 14px 120px 14px 0;
    font-size: 15px;
    line-height: 26px;
  }
  .ln {
    display: flex;
  }
  .ln.current {
    background: rgba(213, 228, 198, 0.04);
  }
  .gutter {
    width: 54px;
    flex-shrink: 0;
    padding-right: 18px;
    text-align: right;
    color: #3d4b3b;
    user-select: none;
  }
  .ln.current .gutter {
    color: var(--phosphor-dim);
  }
  .txt {
    white-space: pre-wrap;
    min-width: 0;
  }
  .md { color: #4f6150; }
  .h { color: #f3c58a; font-weight: 700; }
  .b { color: #ffffff; font-weight: 700; }
  .q { color: #a9bb9d; font-style: italic; }
  .done { color: #5f705c; text-decoration: line-through; }
  .cursor {
    display: inline-block;
    width: 9px;
    height: 18px;
    margin-left: 1px;
    vertical-align: -3px;
    background: var(--signal);
    box-shadow: 0 0 8px rgba(255, 106, 26, 0.6);
    animation: blink 1.1s steps(1) infinite;
  }
  @keyframes blink {
    50% { opacity: 0; }
  }

  .alert {
    position: absolute;
    right: 18px;
    top: 52px;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 5px 10px 5px 5px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.08em;
    color: #ffd9d9;
    background: rgba(229, 50, 59, 0.16);
    border: 1px solid rgba(229, 50, 59, 0.55);
    border-radius: 4px;
  }
  .bang {
    display: inline-grid;
    place-items: center;
    width: 18px;
    height: 18px;
    border-radius: 3px;
    background: var(--alert);
    color: #fff;
    font-family: var(--label);
    font-weight: 700;
    font-size: 13px;
    box-shadow: 0 0 10px rgba(229, 50, 59, 0.6);
    animation: pulse 1.6s ease-in-out infinite;
  }
  @keyframes pulse {
    50% { box-shadow: 0 0 2px rgba(229, 50, 59, 0.3); }
  }
  .alert-arrow {
    color: var(--alert);
  }
  .drawer-tab {
    position: absolute;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    writing-mode: vertical-rl;
    padding: 12px 4px;
    font-size: 9px;
    letter-spacing: 0.2em;
    color: #ffd9d9;
    background: rgba(229, 50, 59, 0.25);
    border-left: 1px solid rgba(229, 50, 59, 0.6);
    border-radius: 4px 0 0 4px;
  }

  .ab {
    position: absolute;
    right: 14px;
    bottom: 54px;
    display: flex;
    gap: 14px;
    padding: 7px 12px;
    font-size: 11.5px;
    font-weight: 700;
    letter-spacing: 0.08em;
    background: rgba(5, 8, 6, 0.85);
    border: 1px solid rgba(213, 228, 198, 0.16);
    border-radius: 6px;
  }
  .ab span {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .pip {
    display: inline-grid;
    place-items: center;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    font-style: normal;
    font-size: 10px;
    color: #10130f;
  }
  .pip.a { background: var(--signal); }
  .pip.b { background: #8e9a88; }
  .pip.st { background: #4c5a49; color: var(--phosphor); border-radius: 4px; width: 22px; }

  .strip {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 40px;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0 14px;
    font-size: 11.5px;
    font-weight: 700;
    letter-spacing: 0.08em;
    color: var(--phosphor-dim);
    background: rgba(213, 228, 198, 0.05);
    border-top: 1px solid rgba(213, 228, 198, 0.1);
    overflow: hidden;
  }
  .pg {
    color: var(--phosphor);
  }
  .strip-label {
    width: 64px;
    text-align: center;
    color: var(--phosphor);
  }
  .keys {
    display: flex;
    gap: 6px;
    margin-left: 10px;
    min-width: 0;
    overflow: hidden;
    mask-image: linear-gradient(90deg, #000 85%, transparent);
  }
  .key {
    flex-shrink: 0;
    min-width: 24px;
    padding: 2px 6px;
    text-align: center;
    border: 1px solid rgba(213, 228, 198, 0.18);
    border-radius: 3px;
    color: var(--phosphor);
    font-weight: 500;
  }
  .pages {
    margin-left: auto;
    display: flex;
    gap: 5px;
    flex-shrink: 0;
  }
  .pages i {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #33402f;
  }
  .pages i.on {
    background: var(--phosphor);
  }

  /* ------------------------------------------------------------------ */
  /* Map viewer (bay). Desktop: buttons side by side under the screen.   */
  /* ------------------------------------------------------------------ */
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

  /* ------------------------------------------------------------------ */
  /* D-pad                                                               */
  /* ------------------------------------------------------------------ */
  .dpadmod {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .dpad {
    position: relative;
    width: 132px;
    height: 132px;
    border-radius: 50%;
    background: radial-gradient(circle, color-mix(in oklab, var(--moss), black 22%) 60%, color-mix(in oklab, var(--moss), black 10%) 72%);
    box-shadow: inset 0 3px 6px rgba(0, 0, 0, 0.35), 0 1px 0 rgba(255, 255, 255, 0.25);
  }
  .arm {
    position: absolute;
    width: 40px;
    height: 40px;
    background: linear-gradient(160deg, #3a3d3b, #222423);
    color: #7c827e;
    font-size: 11px;
    box-shadow: 0 4px 0 #0e0f0e, inset 0 1px 0 rgba(255, 255, 255, 0.12);
    transition: transform 0.06s ease, box-shadow 0.06s ease;
  }
  .arm:active {
    transform: translateY(3px);
    box-shadow: 0 1px 0 #0e0f0e;
  }
  .up { left: 46px; top: 8px; border-radius: 7px 7px 0 0; }
  .down { left: 46px; bottom: 12px; border-radius: 0 0 7px 7px; }
  .left { left: 8px; top: 44px; border-radius: 7px 0 0 7px; }
  .right { right: 8px; top: 44px; border-radius: 0 7px 7px 0; }
  .hub {
    position: absolute;
    left: 46px;
    top: 44px;
    width: 40px;
    height: 40px;
    background: #2b2e2c;
    box-shadow: 0 4px 0 #0e0f0e;
    pointer-events: none;
  }
  .hub::after {
    content: "";
    position: absolute;
    inset: 12px;
    border-radius: 50%;
    background: radial-gradient(circle at 50% 35%, #1c1e1d, #333634);
  }
  .dpad-label {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 12px;
    text-align: center;
    color: rgba(20, 28, 16, 0.55);
    text-shadow: 0 1px 0 rgba(255, 255, 255, 0.2);
  }

  /* ------------------------------------------------------------------ */
  /* Control pad: Start, B, A in one straight row                        */
  /* ------------------------------------------------------------------ */
  .ctl {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .ctl-row {
    display: flex;
    align-items: center;
    gap: 36px;
    margin-top: -10px;
  }
  .btn-col {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 9px;
  }
  .start {
    width: 58px;
    height: 18px;
    border-radius: 9px;
    background: linear-gradient(180deg, #4a4e4c, #2c2f2e);
    box-shadow: 0 3px 0 #141615, inset 0 1px 0 rgba(255, 255, 255, 0.15);
  }
  .start:active {
    box-shadow: 0 1px 0 #141615;
    transform: translateY(2px);
  }
  .ab-pad {
    display: flex;
    gap: 20px;
    padding: 10px 16px;
    border-radius: 44px;
    background: color-mix(in oklab, var(--bone), black 9%);
    box-shadow: inset 0 2px 5px rgba(0, 0, 0, 0.2), 0 1px 0 rgba(255, 255, 255, 0.6);
  }
  .round {
    width: 62px;
    height: 62px;
    border-radius: 50%;
    font-family: var(--label);
    font-weight: 700;
    font-size: 20px;
    transition: transform 0.06s ease, box-shadow 0.06s ease;
  }
  .round.a {
    color: #fff3ea;
    background: radial-gradient(circle at 40% 30%, #ff9a5c, var(--signal) 55%, #e2560c);
    box-shadow: 0 5px 0 var(--signal-side), 0 8px 10px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.4);
    text-shadow: 0 -1px 0 rgba(0, 0, 0, 0.25);
  }
  .round.b {
    color: #c9cec9;
    background: radial-gradient(circle at 40% 30%, #555a57, #333735 60%, #262928);
    box-shadow: 0 5px 0 #121413, 0 8px 10px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.15);
  }
  .round:active {
    transform: translateY(4px);
  }
  .round.a:active { box-shadow: 0 1px 0 var(--signal-side), inset 0 1px 0 rgba(255, 255, 255, 0.4); }
  .round.b:active { box-shadow: 0 1px 0 #121413; }
  .ctl-label {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 12px;
    text-align: center;
  }

  /* ------------------------------------------------------------------ */
  /* Speaker                                                             */
  /* ------------------------------------------------------------------ */
  .spk {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 16px;
    padding: 0 26px;
  }
  .slots {
    display: flex;
    justify-content: space-between;
    height: 92px;
  }
  .slots i {
    width: 9px;
    border-radius: 5px;
    background: linear-gradient(90deg, #0b0c0b, #171918);
    box-shadow: 0 1px 0 rgba(255, 255, 255, 0.07), inset 0 2px 3px rgba(0, 0, 0, 0.8);
  }
  .spk-foot {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .pwr {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--signal);
    box-shadow: 0 0 8px var(--signal);
  }
  .spk-model {
    margin-left: auto;
  }

  /* ------------------------------------------------------------------ */
  /* Mobile (portrait): same modules, re-proportioned by hand            */
  /* ------------------------------------------------------------------ */
  .mobile .lens { width: 56px; height: 56px; }
  .mobile .lens-glass { width: 26px; height: 26px; }
  .mobile .cam-label { display: none; }
  .mobile .plate { padding: 0 22px 0 28px; gap: 0; }
  .mobile .brand { font-size: 26px; }
  .mobile .model { font-size: 17px; }
  .mobile .plate-name { gap: 8px; }
  .mobile .plate-print { display: none; }
  .mobile .plate-stripe { width: 80px; }

  .mobile .screen { padding: 22px 18px 26px; }
  .mobile .status { padding: 9px 12px; font-size: 11px; }
  .mobile .wide-only { display: none; }
  .mobile .code { padding: 10px 14px 10px 0; font-size: 13px; line-height: 22px; }
  .mobile .gutter { width: 34px; padding-right: 10px; }
  .mobile .cursor { height: 15px; width: 8px; }
  .mobile .alert { top: 44px; right: 10px; padding: 4px 8px 4px 4px; font-size: 10px; }
  .mobile .bang { width: 16px; height: 16px; font-size: 11px; }
  .mobile .ab { right: 10px; bottom: 50px; gap: 10px; padding: 6px 9px; font-size: 10px; }
  .mobile .pip { width: 16px; height: 16px; font-size: 9px; }
  .mobile .pip.st { width: 19px; }
  .mobile .strip { padding: 0 10px; gap: 6px; font-size: 10px; }
  .mobile .strip-label { width: 50px; }
  .mobile .keys { margin-left: 4px; gap: 4px; }
  .mobile .key { min-width: 20px; padding: 2px 4px; }

  /* Mobile map viewer: buttons at opposite corners, so one thumb reaches both */
  .mobile .bay { padding: 22px 70px 22px 70px; gap: 0; }
  .mobile .map-glass { height: 100%; display: flex; flex-direction: column; justify-content: center; }
  .mobile .map-grid { height: 150px; width: auto; aspect-ratio: 12 / 9; align-self: center; }
  .mobile .map-read { text-align: center; }
  .mobile .map-btns { display: contents; }
  .mobile .mb-wrap { position: absolute; }
  .mobile .mb-move { left: 12px; bottom: 26px; }
  .mobile .mb-plant { right: 12px; top: 26px; flex-direction: column-reverse; }
  .mobile .map-btn { width: 46px; height: 46px; font-size: 18px; }
  .mobile .bay-label { display: none; }

  .mobile .dpad { transform: scale(0.92); }
  .mobile .ctl-row { gap: 12px; margin-top: -8px; }
  .mobile .start { width: 42px; height: 15px; }
  .mobile .btn-col .etch { font-size: 8.5px; }
  .mobile .ab-pad { gap: 12px; padding: 8px 10px; }
  .mobile .round { width: 48px; height: 48px; font-size: 16px; }
  .mobile .ctl-label { font-size: 8.5px; letter-spacing: 0.12em; }

  .mobile .spk { flex-direction: row; align-items: center; padding: 0 22px; }
  .mobile .slots { flex: 1; height: 22px; }
  .mobile .slots i { width: 6px; }
  .mobile .spk-foot { flex-shrink: 0; }
  .mobile .spk-model { display: none; }

  /* ------------------------------------------------------------------ */
  /* Configurator: page-level, bottom right                              */
  /* ------------------------------------------------------------------ */
  .config {
    position: fixed;
    right: 20px;
    bottom: 20px;
    z-index: 10;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 10px;
  }
  .config-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 11px 16px;
    border-radius: 10px;
    font-family: var(--label);
    font-weight: 700;
    font-size: 12px;
    letter-spacing: 0.14em;
    color: var(--bone-hi);
    background: linear-gradient(180deg, var(--graphite-hi), var(--graphite));
    box-shadow: 0 4px 0 var(--graphite-side), 0 10px 16px -4px rgba(40, 36, 24, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.12);
  }
  .config-btn:active {
    transform: translateY(3px);
    box-shadow: 0 1px 0 var(--graphite-side);
  }
  .cfg-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--signal);
    box-shadow: 0 0 6px var(--signal);
  }
  .config-panel {
    width: 250px;
    padding: 16px;
    border-radius: 12px;
    background: linear-gradient(165deg, var(--bone-hi), var(--bone));
    box-shadow: 0 5px 0 var(--bone-side), 0 18px 28px -8px rgba(40, 36, 24, 0.5), inset 0 1px 0 #fff;
  }
  .cfg-h {
    margin: 0 0 8px;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.18em;
    color: rgba(43, 45, 44, 0.55);
  }
  .cfg-h:not(:first-child) {
    margin-top: 16px;
  }
  .seg {
    display: flex;
    padding: 3px;
    border-radius: 8px;
    background: color-mix(in oklab, var(--bone), black 10%);
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.15);
  }
  .seg button {
    flex: 1;
    padding: 7px 0;
    border-radius: 6px;
    font-family: var(--label);
    font-weight: 700;
    font-size: 11px;
    letter-spacing: 0.12em;
    color: rgba(43, 45, 44, 0.6);
    background: transparent;
  }
  .seg button.on {
    color: #fff3ea;
    background: var(--graphite);
    box-shadow: 0 2px 0 var(--graphite-side);
  }
  .toggle {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    padding: 6px 0;
    font-family: var(--label);
    font-weight: 600;
    font-size: 12px;
    letter-spacing: 0.1em;
    color: var(--graphite);
    background: none;
    text-align: left;
  }
  .sw {
    position: relative;
    width: 34px;
    height: 18px;
    border-radius: 9px;
    background: #b9b2a0;
    box-shadow: inset 0 2px 3px rgba(0, 0, 0, 0.25);
    transition: background 0.15s ease;
  }
  .sw::after {
    content: "";
    position: absolute;
    top: 2px;
    left: 2px;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: #fff;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
    transition: transform 0.15s ease;
  }
  .sw.on {
    background: var(--signal);
  }
  .sw.on::after {
    transform: translateX(16px);
  }
  .cfg-note {
    margin: 14px 0 0;
    font-size: 11px;
    line-height: 1.5;
    color: rgba(43, 45, 44, 0.6);
  }
</style>
