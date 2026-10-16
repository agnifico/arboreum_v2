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

<style>
  .dpadmod { grid-area: dpad; }
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
  :global(.mobile) .dpad { transform: scale(0.92); }
</style>
