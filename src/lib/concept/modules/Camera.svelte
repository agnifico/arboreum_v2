<script>
  import { useDevice } from "../device.svelte.js";
  const device = useDevice();
  // Hardware keys don't take keyboard focus on click, so typing carries on.
  const keepFocus = (e) => e.preventDefault();
</script>

<!-- CAMERA: doubles as the media button (adds images to the open note) -->
<section class="mod alu r-cam cam" aria-label="Camera module">
  <span class="screw s-tl"></span><span class="screw s-br"></span>
  <button class="lens" aria-label="Camera: add an image" onmousedown={keepFocus} onclick={() => device.pickImages()}>
    <span class="lens-glass"></span>
  </button>
  <span class="cam-led" class:on={device.camBusy}></span>
  <span class="etch cam-label">CAM · MEDIA</span>
</section>

<style>
  .cam { grid-area: cam; }
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
      0 3px 0 4px var(--side),
      0 6px 10px 2px rgba(0, 0, 0, 0.35);
    display: grid;
    place-items: center;
    transition: transform 0.08s ease, box-shadow 0.08s ease;
  }
  .lens:active {
    transform: translateY(2px);
    box-shadow: 0 0 0 3px #9aa09c, 0 0 0 4px rgba(0, 0, 0, 0.35), 0 1px 0 4px var(--side);
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
  .cam-led.on {
    background: var(--signal);
    box-shadow: 0 0 8px var(--signal);
  }
  .cam-label {
    position: absolute;
    left: 10px;
    top: 50%;
    transform: translateY(-50%) rotate(180deg);
    writing-mode: vertical-rl;
    font-size: 8px;
  }
  :global(.portrait) .lens { width: 56px; height: 56px; }
  :global(.portrait) .lens-glass { width: 26px; height: 26px; }
  :global(.portrait) .cam-label { display: none; }
</style>
