<script>
  // Page-level panel, outside the device: view and which modules are slotted.
  let {
    view = $bindable("desktop"),
    showBay = $bindable(true),
    showSpeaker = $bindable(true),
    showChassis = $bindable(false),
  } = $props();
  let panelOpen = $state(false);

  function handleKeydown(event) {
    if (event.key === "Escape") panelOpen = false;
  }
  function handleWindowClick(event) {
    if (panelOpen && !event.target.closest(".config")) panelOpen = false;
  }
</script>

<svelte:window onkeydown={handleKeydown} onclick={handleWindowClick} />

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
      <button class="toggle" aria-pressed={showChassis} onclick={() => (showChassis = !showChassis)}>
        <span class="sw" class:on={showChassis}></span> ENCLOSURE
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

<style>
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
