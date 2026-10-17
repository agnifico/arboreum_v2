<script>
  import { useDevice } from "../device.svelte.js";
  import EdgeSwitch from "./EdgeSwitch.svelte";
  const device = useDevice();
  // Hardware keys don't take keyboard focus on click, so typing carries on
  // in the editor (keyboard users can still Tab to them).
  const keepFocus = (e) => e.preventDefault();
  // Select acts on release (holding it with the D-pad selects instead); a
  // click from the keyboard (Enter on the focused key) is a plain tap.
  function selectDown(e) {
    if (e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    device.selectDown();
  }
</script>

<!-- CONTROL PAD: Select, Start, B, A in one straight row (narrow portrait: B A, Select Start under) -->
<section class="mod bone ctl" aria-label="Control pad">
  <span class="screw s-tl"></span><span class="screw s-tr"></span>
  <span class="screw s-bl"></span><span class="screw s-br"></span>
  <div class="ctl-row">
    <!-- Select and Start share a well, as on a handheld; names on the keys -->
    <div class="start-well">
      <button
        class="start"
        class:lit={device.lit.select}
        aria-label="Select: {device.labels.select}"
        onmousedown={keepFocus}
        onpointerdown={selectDown}
        onpointerup={() => device.selectUp()}
        onpointercancel={() => device.selectUp({ cancel: true })}
        onclick={(e) => e.detail === 0 && device.press("select")}
      >SELECT</button>
      <button class="start" class:lit={device.lit.start} aria-label="Start: {device.labels.start}" onmousedown={keepFocus} onclick={() => device.press("start")}>START</button>
    </div>
    <div class="ab-pad">
      <div class="btn-col">
        <button class="round b" class:lit={device.lit.b} aria-label="B: {device.labels.b}" onmousedown={keepFocus} onclick={() => device.press("b")}>B</button>
      </div>
      <div class="btn-col">
        <button class="round a" class:lit={device.lit.a} aria-label="A: {device.labels.a}" onmousedown={keepFocus} onclick={() => device.press("a")}>A</button>
      </div>
    </div>
  </div>
  <EdgeSwitch label="Swap for the Format deck" onflip={() => device.swapControls()} />
  <span class="etch ctl-label">CTL-01</span>
</section>

<style>
  .ctl { grid-area: ctl; }
  .ctl {
    container-type: inline-size; /* its own width decides the portrait layout */
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
  /* Bottom padding = top + the key's 3px drop, so the well looks even */
  .start-well {
    display: flex;
    gap: 10px;
    padding: 9px 12px 12px;
    border-radius: 22px;
    background: color-mix(in oklab, var(--bone), black 9%);
    box-shadow: inset 0 2px 5px rgba(0, 0, 0, 0.2), 0 1px 0 rgba(255, 255, 255, 0.6);
  }
  .start {
    display: block;
    width: 64px;
    height: 24px;
    border-radius: 12px;
    font-family: var(--label);
    font-weight: 700;
    font-size: 9px;
    letter-spacing: 0.16em;
    color: #c9cec9;
    text-shadow: 0 -1px 0 rgba(0, 0, 0, 0.5);
    background: linear-gradient(180deg, #4a4e4c, #2c2f2e);
    box-shadow: 0 3px 0 #141615, inset 0 1px 0 rgba(255, 255, 255, 0.15);
  }
  .start:active,
  .start.lit {
    box-shadow: 0 1px 0 #141615;
    transform: translateY(2px);
  }
  .ab-pad {
    display: flex;
    gap: 20px;
    padding: 10px 16px 16px;
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
  .round:active,
  .round.lit {
    transform: translateY(4px);
  }
  .round.a:active,
  .round.a.lit { box-shadow: 0 1px 0 var(--signal-side), inset 0 1px 0 rgba(255, 255, 255, 0.4); }
  .round.b:active,
  .round.b.lit { box-shadow: 0 1px 0 #121413; }
  .ctl-label {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 12px;
    text-align: center;
  }
  /* Portrait: B and A on one row, Start on its own row under them, a size
     down so the label has room under them */
  :global(.portrait) .ctl-row { flex-direction: column-reverse; gap: 8px; margin-top: -14px; }
  :global(.portrait) .start-well { gap: 8px; padding: 6px 8px 9px; }
  :global(.portrait) .start { width: 46px; height: 18px; font-size: 7px; letter-spacing: 0.1em; }
  /* Wells: bottom padding = top + the key's drop (round 5px, Start 3px) */
  :global(.portrait) .ab-pad { gap: 12px; padding: 7px 9px 12px; border-radius: 32px; }
  :global(.portrait) .round { width: 42px; height: 42px; font-size: 15px; }
  :global(.portrait) .ctl-label { font-size: 8.5px; letter-spacing: 0.12em; bottom: 11px; }
  /* Portrait with room (an upright tablet, or no D-pad beside it): Start, B, A
     back in one row, as in landscape, with the portrait-sized keys */
  @container (min-width: 300px) {
    :global(.portrait) .ctl-row { flex-direction: row; gap: 22px; margin-top: -10px; }
  }
</style>
