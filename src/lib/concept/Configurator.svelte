<script>
  // The Configure gear, docked at the nameplate's left end in every
  // arrangement; its panel opens downward. View and which modules are slotted.
  import { useDevice } from "./device.svelte.js";
  let {
    view = "landscape", // the arrangement showing now
    orient = $bindable("auto"), // auto (follows the window) | landscape | portrait
    showBay = $bindable(true),
    bayModule = $bindable("map"),
    showSpeaker = $bindable(true),
    showChassis = $bindable(false),
    showGlare = $bindable(false),
    showList = $bindable(true),
    showDpad = $bindable(true),
    showCtl = $bindable(true),
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

<div class="config">
  {#if panelOpen}
    <div class="config-panel" role="dialog" aria-label="Configure the device">
      <p class="cfg-h">ORIENTATION</p>
      <div class="seg orient" role="group" aria-label="Orientation">
        {#each [["auto", "AUTO"], ["landscape", "LANDSCAPE"], ["portrait", "PORTRAIT"]] as [key, label]}
          <button class:on={orient === key} aria-pressed={orient === key} onclick={() => (orient = key)}>{label}</button>
        {/each}
      </div>
      <p class="cfg-h">MODULES</p>
      <button class="toggle" aria-pressed={listLeft} disabled={view !== "landscape"} onclick={toggleList}>
        <span class="sw" class:on={listLeft}></span> LIST
      </button>
      <button class="toggle" aria-pressed={showDpad} onclick={() => (showDpad = !showDpad)}>
        <span class="sw" class:on={showDpad}></span> D-PAD
      </button>
      <button class="toggle" aria-pressed={showCtl} onclick={() => (showCtl = !showCtl)}>
        <span class="sw" class:on={showCtl}></span> CONTROLS
      </button>
      <div class="seg sub-seg" role="group" aria-label="What the control slot holds">
        {#each [["pad", "CONTROL PAD"], ["deck", "FORMAT DECK"]] as [key, label]}
          <button class:on={showCtl && device.controls === key} aria-pressed={showCtl && device.controls === key} disabled={!showCtl} onclick={() => (device.controls = key)}>{label}</button>
        {/each}
      </div>
      <button class="toggle" aria-pressed={showBay} onclick={() => (showBay = !showBay)}>
        <span class="sw" class:on={showBay}></span> BAY
      </button>
      <div class="seg sub-seg" role="group" aria-label="What the bay holds">
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
      <button class="toggle" aria-pressed={device.showLines} onclick={() => (device.showLines = !device.showLines)}>
        <span class="sw" class:on={device.showLines}></span> LINE NUMBERS
      </button>
      <button class="toggle" aria-pressed={device.spellCheck} onclick={() => (device.spellCheck = !device.spellCheck)}>
        <span class="sw" class:on={device.spellCheck}></span> SPELL CHECK
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
    aria-expanded={panelOpen}
    aria-label="Configure the device"
    title="Configure"
    onclick={() => (panelOpen = !panelOpen)}
  >
    <svg class="gear" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M10.3 2h3.4l.5 2.6c.6.2 1.2.5 1.7.9l2.5-.9 1.7 2.9-2 1.7c.1.6.1 1.3 0 1.9l2 1.7-1.7 2.9-2.5-.9c-.5.4-1.1.7-1.7.9l-.5 2.6h-3.4l-.5-2.6c-.6-.2-1.2-.5-1.7-.9l-2.5.9-1.7-2.9 2-1.7c-.1-.6-.1-1.3 0-1.9l-2-1.7 1.7-2.9 2.5.9c.5-.4 1.1-.7 1.7-.9zM12 8.6a3.4 3.4 0 1 0 0 6.8 3.4 3.4 0 0 0 0-6.8z" />
    </svg>
  </button>
</div>

<style>
  .config {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .config-panel {
    position: absolute;
    left: 0;
    top: calc(100% + 10px);
  }
  .config-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    padding: 0;
    border-radius: 50%;
    color: var(--bone-hi);
    background: linear-gradient(180deg, var(--graphite-hi), var(--graphite));
    box-shadow: 0 3px 0 var(--graphite-side), 0 8px 12px -4px rgba(40, 36, 24, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.12);
  }
  /* Landscape's taller nameplate takes a bigger gear */
  :global(.landscape) .config-btn {
    width: 36px;
    height: 36px;
  }
  .config-btn:active {
    transform: translateY(2px);
    box-shadow: 0 1px 0 var(--graphite-side);
  }
  .gear {
    width: 18px;
    height: 18px;
    fill: var(--signal);
    fill-rule: evenodd;
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
  /* Three labels of different lengths: each takes its own width */
  .orient button {
    flex: auto;
    padding: 7px 10px;
  }
  /* What a slot holds, under its switch */
  .sub-seg {
    margin: 2px 0 6px 44px;
  }
  .sub-seg button {
    flex: auto;
    padding: 6px 6px;
    font-size: 10px;
    letter-spacing: 0.08em;
  }
  .sub-seg button:disabled {
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
