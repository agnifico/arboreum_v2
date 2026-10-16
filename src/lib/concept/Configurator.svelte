<script>
  // Page-level panel, outside the device: view and which modules are slotted.
  import { useDevice } from "./device.svelte.js";
  let {
    view = $bindable("landscape"),
    showBay = $bindable(true),
    bayModule = $bindable("map"),
    showSpeaker = $bindable(true),
    showChassis = $bindable(false),
    showGlare = $bindable(false),
    showList = $bindable(true),
    showDpad = $bindable(true),
    showCtl = $bindable(true),
    docked = false, // portrait: a gear docked in the console under the speaker
  } = $props();
  const device = useDevice();
  let panelOpen = $state(false);

  // When the panel closes, hand focus back: to the editor if a note is open,
  // otherwise to the device (so the arrow keys drive the D-pad again).
  let wasOpen = false;
  $effect(() => {
    const open = panelOpen;
    if (wasOpen && !open) {
      if (device?.focus === "editor") device.editorApi?.focus();
      else document.activeElement?.blur?.();
    }
    wasOpen = open;
  });

  // One List module: putting it in the bay takes it off the left, and back.
  let listInBay = $derived(showBay && bayModule === "list");
  let listLeft = $derived(view === "landscape" && showList && !listInBay);
  function toggleList() {
    if (listLeft) return void (showList = false);
    showList = true;
    if (listInBay) bayModule = "map";
  }
  function fillBay(m) {
    bayModule = m;
    if (m === "list") showList = false;
  }
  const BAY = [
    ["map", "MAP"],
    ["treemoji", "TREEMOJI"],
    ["list", "LIST"],
  ];

  function handleKeydown(event) {
    if (event.key === "Escape") panelOpen = false;
  }
  function handleWindowClick(event) {
    if (panelOpen && !event.target.closest(".config")) panelOpen = false;
  }
</script>

<svelte:window onkeydown={handleKeydown} onclick={handleWindowClick} />

<!-- Page-level configurator: outside the device, so nothing on it moves -->
<div class="config" class:docked>
  {#if panelOpen}
    <div class="config-panel" role="dialog" aria-label="Configure the device">
      <p class="cfg-h">ORIENTATION</p>
      <div class="seg" role="group" aria-label="Orientation">
        <button class:on={view === "landscape"} aria-pressed={view === "landscape"} onclick={() => (view = "landscape")}>LANDSCAPE</button>
        <button class:on={view === "portrait"} aria-pressed={view === "portrait"} onclick={() => (view = "portrait")}>PORTRAIT</button>
      </div>
      <p class="cfg-h">MODULES</p>
      <button class="toggle" aria-pressed={listLeft} disabled={view !== "landscape"} onclick={toggleList}>
        <span class="sw" class:on={listLeft}></span> LIST
      </button>
      <button class="toggle" aria-pressed={showDpad} onclick={() => (showDpad = !showDpad)}>
        <span class="sw" class:on={showDpad}></span> D-PAD
      </button>
      <button class="toggle" aria-pressed={showCtl} onclick={() => (showCtl = !showCtl)}>
        <span class="sw" class:on={showCtl}></span> CONTROL PAD
      </button>
      <button class="toggle" aria-pressed={showBay} onclick={() => (showBay = !showBay)}>
        <span class="sw" class:on={showBay}></span> BAY
      </button>
      <div class="seg bay-seg" role="group" aria-label="What the bay holds">
        {#each BAY as [key, label]}
          <button class:on={showBay && bayModule === key} aria-pressed={showBay && bayModule === key} disabled={!showBay} onclick={() => fillBay(key)}>{label}</button>
        {/each}
      </div>
      <button class="toggle" aria-pressed={showSpeaker} onclick={() => (showSpeaker = !showSpeaker)}>
        <span class="sw" class:on={showSpeaker}></span> SPEAKER
      </button>
      <p class="cfg-h">SCREEN</p>
      <button class="toggle" aria-pressed={device.showMarkup} onclick={() => (device.showMarkup = !device.showMarkup)}>
        <span class="sw" class:on={device.showMarkup}></span> SHOW MARKUP
      </button>
      <button class="toggle" aria-pressed={showGlare} onclick={() => (showGlare = !showGlare)}>
        <span class="sw" class:on={showGlare}></span> SCREEN GLARE
      </button>
      <p class="cfg-h">BODY</p>
      <button class="toggle" aria-pressed={showChassis} onclick={() => (showChassis = !showChassis)}>
        <span class="sw" class:on={showChassis}></span> ENCLOSURE
      </button>
      <p class="cfg-note">
        {view === "landscape" ? "Without the List module, the list opens full screen. Without controls, the keyboard and mouse drive the device." : "In portrait the list opens full screen, unless the bay holds it."}
      </p>
    </div>
  {/if}
  <button
    class="config-btn"
    class:compact={docked}
    aria-expanded={panelOpen}
    aria-label="Configure the device"
    title="Configure"
    onclick={() => (panelOpen = !panelOpen)}
  >
    <svg class="gear" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M10.3 2h3.4l.5 2.6c.6.2 1.2.5 1.7.9l2.5-.9 1.7 2.9-2 1.7c.1.6.1 1.3 0 1.9l2 1.7-1.7 2.9-2.5-.9c-.5.4-1.1.7-1.7.9l-.5 2.6h-3.4l-.5-2.6c-.6-.2-1.2-.5-1.7-.9l-2.5.9-1.7-2.9 2-1.7c-.1-.6-.1-1.3 0-1.9l-2-1.7 1.7-2.9 2.5.9c.5-.4 1.1-.7 1.7-.9zM12 8.6a3.4 3.4 0 1 0 0 6.8 3.4 3.4 0 0 0 0-6.8z" />
    </svg>
    {#if !docked}<span>CONFIGURE</span>{/if}
  </button>
</div>

<style>
  .config {
    position: fixed;
    right: 16px;
    bottom: 14px;
    z-index: 10;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 10px;
  }
  .config.docked {
    position: relative;
    right: auto;
    bottom: auto;
    align-items: center;
  }
  .docked .config-panel {
    position: absolute;
    right: 0;
    bottom: calc(100% + 10px);
  }
  .config-btn {
    display: flex;
    align-items: center;
    gap: 7px;
    padding: 7px 11px;
    border-radius: 8px;
    font-family: var(--label);
    font-weight: 700;
    font-size: 10px;
    letter-spacing: 0.14em;
    color: var(--bone-hi);
    background: linear-gradient(180deg, var(--graphite-hi), var(--graphite));
    box-shadow: 0 3px 0 var(--graphite-side), 0 8px 12px -4px rgba(40, 36, 24, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.12);
  }
  .config-btn.compact {
    width: 30px;
    height: 30px;
    padding: 0;
    justify-content: center;
    border-radius: 50%;
  }
  .config-btn:active {
    transform: translateY(2px);
    box-shadow: 0 1px 0 var(--graphite-side);
  }
  .gear {
    width: 14px;
    height: 14px;
    fill: var(--signal);
    fill-rule: evenodd;
  }
  .compact .gear {
    width: 18px;
    height: 18px;
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
  .bay-seg {
    margin: 2px 0 6px 44px; /* under the BAY switch */
  }
  .bay-seg button {
    flex: auto;
    padding: 6px 6px;
    font-size: 10px;
    letter-spacing: 0.08em;
  }
  .bay-seg button:disabled {
    cursor: default;
    opacity: 0.5;
  }
  .toggle:disabled {
    opacity: 0.4;
    cursor: default;
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
