<script>
  import { onMount } from "svelte";

  // Look test 00: the assembled F16O, landscape, static. See CONCEPT.md.
  // The device is drawn at a fixed size and scaled to fit the window.
  const W = 1180;
  const H = 820;
  let scale = $state(1);

  function fit() {
    scale = Math.min((innerWidth - 48) / W, (innerHeight - 120) / H, 1.2);
  }

  onMount(() => {
    fit();
    addEventListener("resize", fit);
    return () => removeEventListener("resize", fit);
  });

  const lines = [
    [{ t: "# ", c: "md" }, { t: "Morning pages", c: "h" }],
    [],
    [{ t: "Woke up before the alarm. The fern on the" }],
    [{ t: "sill has a new curl, " }, { t: "**", c: "md" }, { t: "third one this week", c: "b" }, { t: "**", c: "md" }, { t: "." }],
    [],
    [{ t: "- [x] ", c: "md" }, { t: "water the fern", c: "done" }],
    [{ t: "- [ ] ", c: "md" }, { t: "repot the little palm" }],
    [{ t: "- [ ] ", c: "md" }, { t: "write to Mira about Sunday" }],
    [],
    [{ t: "> ", c: "md" }, { t: "plant this one somewhere sunny", c: "q" }],
  ];
  const cursorLine = 9;

  const formatKeys = ["B", "I", "U", "S", "H1", "H2", "•", "1.", "☐", "❝", "</>"];
</script>

<svelte:head>
  <title>Arboreum F16O · look test</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link
    href="https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@400;500;600;700&family=JetBrains+Mono:ital,wght@0,400;0,500;0,700;1,400&display=swap"
    rel="stylesheet"
  />
</svelte:head>

<main class="stage">
  <header class="caption">
    <span class="cap-title">ARBOREUM <span class="code-id">F16O</span></span>
    <span class="cap-sub">Look test 00 · desktop / landscape · static</span>
  </header>

  <div class="fit" style="width:{W * scale}px; height:{H * scale}px;">
    <div class="device" style="transform: scale({scale});">
      <div class="chassis">
        <span class="screw tl"></span><span class="screw tr"></span>
        <span class="screw bl"></span><span class="screw br"></span>

        <!-- CAMERA: doubles as the media button -->
        <section class="mod alu cam" aria-label="Camera module">
          <span class="screw s-tl"></span><span class="screw s-br"></span>
          <button class="lens" aria-label="Camera: add an image">
            <span class="lens-glass"></span>
          </button>
          <span class="cam-led"></span>
          <span class="etch cam-label">CAM · MEDIA</span>
          <span class="latch"></span>
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

        <!-- SCREEN -->
        <section class="mod graphite screen" aria-label="Screen module">
          <span class="screw s-tl"></span><span class="screw s-tr"></span>
          <span class="screw s-bl"></span><span class="screw s-br"></span>
          <div class="glass">
            <div class="status">
              <span>▣ NOTES / <b>morning-pages</b></span>
              <span class="status-r"><span class="dot-unsaved">●</span> UNSAVED <span class="sep">│</span> 11:42 <span class="sep">│</span> 16·10</span>
            </div>

            <div class="code" aria-label="Note text">
              {#each lines as line, i}
                <div class="ln" class:current={i === cursorLine}>
                  <span class="gutter">{i + 1}</span>
                  <span class="txt">
                    {#each line as seg}<span class={seg.c}>{seg.t}</span>{/each}{#if i === cursorLine}<span class="cursor"></span>{/if}
                  </span>
                </div>
              {/each}
            </div>

            <!-- Missing-module alert + drawer handle (bay is empty) -->
            <div class="alert">
              <span class="bang">!</span>
              <span>NO TREE · NO PLOT</span>
              <span class="alert-arrow">▸</span>
            </div>
            <div class="drawer-tab" aria-hidden="true">TREE · PLOT</div>

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
          <span class="etch screen-label">SCR-01 · 7.2" MONO</span>
        </section>

        <!-- BAY: empty slot -->
        <section class="bay" aria-label="Bay, empty">
          <div class="pins" aria-hidden="true"></div>
          <div class="bay-text">
            <span class="etch-dark">BAY 01</span>
            <span class="bay-opts">MAP · TREEMOJI · LIST</span>
            <span class="bay-empty"><span class="bang small">!</span> SLOT A MODULE</span>
          </div>
          <span class="rail l"></span><span class="rail r"></span>
        </section>

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
          <span class="release top" title="Release"></span>
        </section>

        <!-- CONTROL PAD: A, B, Start -->
        <section class="mod bone ctl" aria-label="Control pad">
          <span class="screw s-tl"></span><span class="screw s-tr"></span>
          <span class="screw s-bl"></span><span class="screw s-br"></span>
          <div class="start-wrap">
            <button class="start" aria-label="Start"></button>
            <span class="etch">START</span>
          </div>
          <div class="ab-btns">
            <div class="btn-wrap b-wrap">
              <button class="round b" aria-label="B">B</button>
            </div>
            <div class="btn-wrap a-wrap">
              <button class="round a" aria-label="A">A</button>
            </div>
          </div>
          <div class="swap-hint"><span class="etch">CTL-01 · ⇄ FORMAT DECK</span></div>
          <span class="release top" title="Release"></span>
        </section>

        <!-- Free corner: speaker grille + power -->
        <section class="grille" aria-hidden="true">
          <div class="slots">{#each Array(11) as _}<i></i>{/each}</div>
          <div class="grille-foot">
            <span class="pwr"></span>
            <span class="etch-dark">PWR</span>
            <span class="etch-dark grille-model code-id">F16O</span>
          </div>
        </section>
      </div>
    </div>
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
    --chassis: #222523;
    --chassis-side: #0f1110;
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
    padding: 24px;
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
  }

  .caption {
    align-self: stretch;
    display: flex;
    gap: 16px;
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
    width: 1180px;
    height: 820px;
    transform-origin: top left;
  }

  /* ------------------------------------------------------------------ */
  /* Chassis: the frame every module locks into.                         */
  /* ------------------------------------------------------------------ */
  .chassis {
    position: relative;
    box-sizing: border-box;
    width: 1180px;
    height: 800px;
    padding: 22px;
    display: grid;
    grid-template-columns: 180px 215px 405px 1fr;
    grid-template-rows: 112px 1fr 182px;
    grid-template-areas:
      "cam  plate plate plate"
      "scr  scr   scr   bay"
      "dpad dpad  ctl   grille";
    gap: 14px;
    border-radius: 28px;
    background: linear-gradient(170deg, #2e322f, var(--chassis) 45%, #1b1d1c);
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.08),
      inset 0 0 0 2px rgba(0, 0, 0, 0.35),
      0 12px 0 var(--chassis-side),
      0 12px 0 1px rgba(0, 0, 0, 0.4),
      0 40px 60px -18px rgba(30, 28, 20, 0.55);
  }

  /* ------------------------------------------------------------------ */
  /* Module body: face gradient, lit top edge, hard side, soft shadow.   */
  /* ------------------------------------------------------------------ */
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
      0 6px 0 1px rgba(0, 0, 0, 0.35),
      0 14px 18px -6px rgba(0, 0, 0, 0.55);
  }
  .alu { --face: var(--alu); --face-hi: var(--alu-hi); --side: var(--alu-side); }
  .bone { --face: var(--bone); --face-hi: var(--bone-hi); --side: var(--bone-side); }
  .moss { --face: var(--moss); --face-hi: var(--moss-hi); --side: var(--moss-side); }
  .graphite { --face: var(--graphite); --face-hi: var(--graphite-hi); --side: var(--graphite-side); }
  .graphite { box-shadow:
      inset 0 1.5px 0 rgba(255, 255, 255, 0.12),
      inset 0 -2px 0 rgba(0, 0, 0, 0.3),
      0 6px 0 var(--side),
      0 6px 0 1px rgba(0, 0, 0, 0.45),
      0 14px 18px -6px rgba(0, 0, 0, 0.6); }

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
  .chassis > .tl { top: 9px; left: 9px; }
  .chassis > .tr { top: 9px; right: 9px; }
  .chassis > .bl { bottom: 9px; left: 9px; }
  .chassis > .br { bottom: 9px; right: 9px; }
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
    color: rgba(210, 214, 210, 0.45);
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
    grid-area: cam;
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
    right: 26px;
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
  .latch {
    position: absolute;
    right: -9px;
    top: 34px;
    width: 9px;
    height: 34px;
    border-radius: 0 4px 4px 0;
    background: linear-gradient(90deg, var(--signal-side), var(--signal));
    box-shadow: 0 3px 0 var(--signal-side);
    z-index: 2;
  }

  /* ------------------------------------------------------------------ */
  /* Nameplate                                                           */
  /* ------------------------------------------------------------------ */
  .plate {
    grid-area: plate;
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
    font-style: normal;
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
    background:
      linear-gradient(115deg, transparent 0 34%, var(--signal) 34% 52%, transparent 52% 60%, #2b2d2c 60% 66%, transparent 66%);
    opacity: 0.95;
  }

  /* ------------------------------------------------------------------ */
  /* Screen                                                              */
  /* ------------------------------------------------------------------ */
  .screen {
    grid-area: scr;
    padding: 26px 30px 30px;
  }
  .screen-label {
    position: absolute;
    bottom: 9px;
    right: 34px;
    color: rgba(210, 214, 210, 0.35);
    text-shadow: 0 -1px 0 rgba(0, 0, 0, 0.6);
    font-size: 9px;
  }
  .glass {
    position: relative;
    height: 100%;
    box-sizing: border-box;
    border-radius: 8px;
    background:
      radial-gradient(120% 90% at 30% 20%, #142019, var(--glass) 70%);
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
    padding: 14px 0;
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
    white-space: pre;
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

  /* Missing-module alert and drawer handle */
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
  .bang.small {
    width: 14px;
    height: 14px;
    font-size: 10px;
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

  /* A/B context overlay */
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

  /* Secondary strip */
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
  }
  .key {
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
  /* Bay (empty slot)                                                    */
  /* ------------------------------------------------------------------ */
  .bay {
    grid-area: bay;
    position: relative;
    border-radius: 14px;
    background:
      repeating-linear-gradient(135deg, rgba(255, 255, 255, 0.02) 0 10px, transparent 10px 20px),
      #141615;
    box-shadow:
      inset 0 4px 12px rgba(0, 0, 0, 0.8),
      inset 0 0 0 2px rgba(0, 0, 0, 0.6),
      0 1px 0 rgba(255, 255, 255, 0.06);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .pins {
    position: absolute;
    top: 18px;
    left: 50%;
    width: 120px;
    height: 10px;
    transform: translateX(-50%);
    border-radius: 2px;
    background: repeating-linear-gradient(90deg, #c9a24a 0 5px, #6b5320 5px 6px, transparent 6px 9px);
    box-shadow: 0 0 0 3px #0a0b0a;
  }
  .rail {
    position: absolute;
    top: 50px;
    bottom: 50px;
    width: 6px;
    border-radius: 3px;
    background: linear-gradient(90deg, #0a0b0a, #2a2d2b);
  }
  .rail.l { left: 12px; }
  .rail.r { right: 12px; }
  .bay-text {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    text-align: center;
  }
  .bay-text .etch-dark {
    font-size: 14px;
  }
  .bay-opts {
    font-size: 10px;
    letter-spacing: 0.18em;
    color: rgba(210, 214, 210, 0.3);
  }
  .bay-empty {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 8px;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.16em;
    color: #ff9ea3;
  }

  /* ------------------------------------------------------------------ */
  /* D-pad                                                               */
  /* ------------------------------------------------------------------ */
  .dpadmod {
    grid-area: dpad;
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
  .up:active, .down:active, .left:active, .right:active { transform: translateY(3px); }
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
  /* Control pad                                                         */
  /* ------------------------------------------------------------------ */
  .ctl {
    grid-area: ctl;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 48px 0 44px;
  }
  .start-wrap {
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
    transform: rotate(-14deg);
  }
  .start:active {
    box-shadow: 0 1px 0 #141615;
    transform: rotate(-14deg) translateY(2px);
  }
  .ab-btns {
    display: flex;
    gap: 22px;
    align-items: flex-end;
    padding: 10px 18px;
    border-radius: 40px;
    background: color-mix(in oklab, var(--bone), black 9%);
    box-shadow: inset 0 2px 5px rgba(0, 0, 0, 0.2), 0 1px 0 rgba(255, 255, 255, 0.6);
    transform: rotate(-14deg);
  }
  .b-wrap {
    margin-top: 26px;
  }
  .a-wrap {
    margin-bottom: 26px;
  }
  .round {
    width: 62px;
    height: 62px;
    border-radius: 50%;
    font-family: var(--label);
    font-weight: 700;
    font-size: 20px;
    transform: rotate(14deg);
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
    transform: rotate(14deg) translateY(4px);
  }
  .round.a:active { box-shadow: 0 1px 0 var(--signal-side), inset 0 1px 0 rgba(255, 255, 255, 0.4); }
  .round.b:active { box-shadow: 0 1px 0 #121413; }
  .swap-hint {
    position: absolute;
    left: 50%;
    bottom: 12px;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 8px;
  }
  /* Orange release tab: every swappable module has one */
  .release {
    position: absolute;
    width: 34px;
    height: 8px;
    border-radius: 0 0 3px 3px;
    background: linear-gradient(180deg, var(--signal), #ff8a45);
    box-shadow: 0 2px 0 var(--signal-side), inset 0 -1px 0 rgba(0, 0, 0, 0.15);
  }
  .release.top {
    top: 0;
    left: 50%;
    transform: translateX(-50%);
  }

  /* ------------------------------------------------------------------ */
  /* Grille corner                                                       */
  /* ------------------------------------------------------------------ */
  .grille {
    grid-area: grille;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 16px;
    padding: 0 22px;
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
  .grille-foot {
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
  .grille-model {
    margin-left: auto;
  }
</style>
