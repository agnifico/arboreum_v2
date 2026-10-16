<script>
  import { useDevice } from "../device.svelte.js";
  const device = useDevice();
  // Hardware keys don't take keyboard focus on click, so typing carries on
  // in the editor (keyboard users can still Tab to them).
  const keepFocus = (e) => e.preventDefault();
</script>

<!-- D-PAD -->
<section class="mod moss dpadmod" aria-label="D-pad module">
  <span class="screw s-tl"></span><span class="screw s-tr"></span>
  <span class="screw s-bl"></span><span class="screw s-br"></span>
  <div class="dpad">
    <button class="arm up" class:lit={device.lit.up} aria-label="Up" onmousedown={keepFocus} onclick={() => device.press("up")}><span>▲</span></button>
    <button class="arm right" class:lit={device.lit.right} aria-label="Right" onmousedown={keepFocus} onclick={() => device.press("right")}><span>▶</span></button>
    <button class="arm down" class:lit={device.lit.down} aria-label="Down" onmousedown={keepFocus} onclick={() => device.press("down")}><span>▼</span></button>
    <button class="arm left" class:lit={device.lit.left} aria-label="Left" onmousedown={keepFocus} onclick={() => device.press("left")}><span>◀</span></button>
    <span class="hub"></span>
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
  /* Geometry: a 136px well. The centre groove is 40x40; each arm is 41 long.
     Margins to the rim are even once the arms' 4px drop is counted. */
  .dpad {
    position: relative;
    width: 136px;
    height: 136px;
    border-radius: 50%;
    background: radial-gradient(circle, color-mix(in oklab, var(--moss), black 22%) 60%, color-mix(in oklab, var(--moss), black 10%) 72%);
    box-shadow: inset 0 3px 6px rgba(0, 0, 0, 0.35), 0 1px 0 rgba(255, 255, 255, 0.25);
  }
  .arm {
    position: absolute;
    z-index: 2; /* every key sits above the groove */
    background: linear-gradient(160deg, #3a3d3b, #222423);
    color: #8a908c;
    font-size: 11px;
    text-shadow: 0 -1px 0 rgba(0, 0, 0, 0.6), 0 1px 0 rgba(255, 255, 255, 0.08);
    box-shadow: 0 4px 0 #0e0f0e, inset 0 1px 0 rgba(255, 255, 255, 0.12);
    transition: transform 0.06s ease, box-shadow 0.06s ease;
  }
  .arm:active,
  .arm.lit {
    transform: translateY(3px);
    box-shadow: 0 1px 0 #0e0f0e;
  }
  .up { left: 48px; top: 5px; width: 40px; height: 41px; border-radius: 7px 7px 0 0; }
  .down { left: 48px; top: 86px; width: 40px; height: 41px; border-radius: 0 0 7px 7px; }
  .left { left: 7px; top: 46px; width: 41px; height: 40px; border-radius: 7px 0 0 7px; }
  .right { left: 88px; top: 46px; width: 41px; height: 40px; border-radius: 0 7px 7px 0; }
  /* Centre: a dead area, so it's a sunken groove rather than a key */
  .hub {
    position: absolute;
    z-index: 1;
    left: 48px;
    top: 46px;
    width: 40px;
    height: 40px;
    background: #141615;
    box-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.85), inset 0 -1px 0 rgba(255, 255, 255, 0.05);
    pointer-events: none;
  }
  .hub::after {
    content: "";
    position: absolute;
    inset: 13px;
    border-radius: 50%;
    background: radial-gradient(circle at 50% 70%, #262928, #0c0d0c 70%);
    box-shadow: 0 1px 0 rgba(255, 255, 255, 0.06);
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
  :global(.portrait) .dpad { transform: scale(0.84) translateY(-8px); }
</style>
