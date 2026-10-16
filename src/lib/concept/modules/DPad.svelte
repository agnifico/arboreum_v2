<script>
  import { useDevice } from "../device.svelte.js";
  const device = useDevice();
  // Hardware keys don't take keyboard focus on click, so typing carries on
  // in the editor (keyboard users can still Tab to them).
  const keepFocus = (e) => e.preventDefault();

  // Geometry (px, in a 136px well; centre 68): arms 40 wide, the cross spans
  // 7..129, outer corners r = 7. The body is DEPTH deep; its side shows below
  // the bottom-facing edges, so the face sits DEPTH/2 high to stay centred.
  const DEPTH = 5;
  const CROSS =
    "M55 7H81Q88 7 88 14V48H122Q129 48 129 55V81Q129 88 122 88H88V122Q88 129 81 129H55Q48 129 48 122V88H14Q7 88 7 81V55Q7 48 14 48H48V14Q48 7 55 7Z";
  // Engraved arrows at each arm's centre (tip pointing outwards).
  const ARROWS = {
    up: "M68 21L74 31H62Z",
    down: "M68 115L62 105H74Z",
    left: "M21 68L31 62V74Z",
    right: "M115 68L105 74V62Z",
  };

  // The whole cross rocks toward the pressed arm, like a real pivoting D-pad.
  let held = $state(null);
  let tilt = $derived(held ?? ["up", "down", "left", "right"].find((d) => device.lit[d]) ?? null);
</script>

<!-- D-PAD -->
<section class="mod moss dpadmod" aria-label="D-pad module">
  <span class="screw s-tl"></span><span class="screw s-tr"></span>
  <span class="screw s-bl"></span><span class="screw s-br"></span>
  <div class="dpad">
    <svg class="cross tilt-{tilt ?? 'none'}" viewBox="0 0 136 136" aria-hidden="true">
      <defs>
        <linearGradient id="dp-face" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#40443f" />
          <stop offset="1" stop-color="#232624" />
        </linearGradient>
        <linearGradient id="dp-lit" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#fff" stop-opacity="0.22" />
          <stop offset="0.5" stop-color="#fff" stop-opacity="0.04" />
          <stop offset="1" stop-color="#000" stop-opacity="0.35" />
        </linearGradient>
        <radialGradient id="dp-well" cx="0.5" cy="0.38" r="0.6">
          <stop offset="0" stop-color="#0c0d0c" />
          <stop offset="1" stop-color="#1f2120" />
        </radialGradient>
        <clipPath id="dp-clip"><path d={CROSS} /></clipPath>
      </defs>
      <g transform="translate(0 {-DEPTH / 2})">
        <!-- Side: the same outline, DEPTH lower, in the dark of the plastic -->
        <path class="side" d={CROSS} transform="translate(0 {DEPTH})" />
        <!-- Face, then an inner bevel: lit on top-facing edges, dark below -->
        <path d={CROSS} fill="url(#dp-face)" />
        <path d={CROSS} fill="none" stroke="url(#dp-lit)" stroke-width="3" clip-path="url(#dp-clip)" />
        <!-- Centre pivot: a sunken well, not a key -->
        <rect x="53" y="53" width="30" height="30" rx="6" fill="url(#dp-well)" />
        <rect x="53" y="53" width="30" height="30" rx="6" fill="none" stroke="#000" stroke-opacity="0.55" stroke-width="1.5" />
        <circle cx="68" cy="68" r="7" fill="#0b0c0b" />
        <!-- Engraved arrows: a cut-in with a lit lower lip -->
        {#each Object.entries(ARROWS) as [dir, d]}
          <path d={d} fill="#fff" fill-opacity="0.1" transform="translate(0 1)" />
          <path d={d} class="arrow" class:on={tilt === dir} />
        {/each}
      </g>
    </svg>
    {#each ["up", "right", "down", "left"] as dir}
      <button
        class="arm {dir}"
        aria-label={dir[0].toUpperCase() + dir.slice(1)}
        onmousedown={keepFocus}
        onpointerdown={() => (held = dir)}
        onpointerup={() => (held = null)}
        onpointerleave={() => (held = null)}
        onclick={() => device.press(dir)}
      ></button>
    {/each}
  </div>
  <span class="etch dpad-label">NAV-01</span>
</section>

<style>
  .dpadmod { grid-area: dpad; }
  .dpadmod {
    display: flex;
    align-items: center;
    justify-content: center;
    padding-bottom: 18px; /* keeps the well clear of the NAV-01 label */
  }
  .dpad {
    position: relative;
    width: 136px;
    height: 136px;
    border-radius: 50%;
    background: radial-gradient(circle, color-mix(in oklab, var(--moss), black 22%) 60%, color-mix(in oklab, var(--moss), black 10%) 72%);
    box-shadow: inset 0 3px 6px rgba(0, 0, 0, 0.35), 0 1px 0 rgba(255, 255, 255, 0.25);
  }
  .cross {
    position: absolute;
    inset: 0;
    overflow: visible;
    transform-origin: 50% 50%;
    transition: transform 0.07s ease-out;
    filter: drop-shadow(0 4px 4px rgba(0, 0, 0, 0.35));
  }
  /* Rocking: the pressed arm dips, the opposite one rises */
  .tilt-up { transform: perspective(260px) rotateX(9deg); }
  .tilt-down { transform: perspective(260px) rotateX(-9deg); }
  .tilt-left { transform: perspective(260px) rotateY(-9deg); }
  .tilt-right { transform: perspective(260px) rotateY(9deg); }
  .side {
    fill: #0d0e0d;
  }
  .arrow {
    fill: #141615;
    transition: fill 0.07s ease;
  }
  .arrow.on {
    fill: var(--signal);
  }
  /* Invisible hit areas over each arm (the drawing is the SVG above) */
  .arm {
    position: absolute;
    z-index: 2;
    width: 41px;
    height: 41px;
    background: transparent;
    border-radius: 6px;
  }
  .up { left: 48px; top: 5px; }
  .down { left: 48px; top: 86px; }
  .left { left: 6px; top: 45px; }
  .right { left: 88px; top: 45px; }
  .dpad-label {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 12px;
    text-align: center;
    color: rgba(20, 28, 16, 0.55);
    text-shadow: 0 1px 0 rgba(255, 255, 255, 0.2);
  }
  :global(.portrait) .dpad { transform: scale(0.84) translateY(-8px); }
</style>
