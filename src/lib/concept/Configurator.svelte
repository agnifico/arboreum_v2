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
  <!-- A pill key in a recessed well, like Select and Start: it sits in the
       plate instead of floating on it -->
  <span class="config-well">
  <button
    class="config-btn"
    class:on={panelOpen}
    aria-expanded={panelOpen}
    aria-label="Configure the device"
    title="Configure"
    onclick={() => (panelOpen = !panelOpen)}
  >
    <svg class="gear" viewBox="0 0 24 24" aria-hidden="true">
      <path fill-rule="evenodd" clip-rule="evenodd" d="M12.7848 0.449982C13.8239 0.449982 14.7167 1.16546 14.9122 2.15495L14.9991 2.59495C15.3408 4.32442 17.1859 5.35722 18.9016 4.7794L19.3383 4.63233C20.3199 4.30175 21.4054 4.69358 21.9249 5.56605L22.7097 6.88386C23.2293 7.75636 23.0365 8.86366 22.2504 9.52253L21.9008 9.81555C20.5267 10.9672 20.5267 13.0328 21.9008 14.1844L22.2504 14.4774C23.0365 15.1363 23.2293 16.2436 22.7097 17.1161L21.925 18.4339C21.4054 19.3064 20.3199 19.6982 19.3382 19.3676L18.9017 19.2205C17.1859 18.6426 15.3408 19.6754 14.9991 21.405L14.9122 21.845C14.7167 22.8345 13.8239 23.55 12.7848 23.55H11.2152C10.1761 23.55 9.28331 22.8345 9.08781 21.8451L9.00082 21.4048C8.65909 19.6754 6.81395 18.6426 5.09822 19.2205L4.66179 19.3675C3.68016 19.6982 2.59465 19.3063 2.07505 18.4338L1.2903 17.1161C0.770719 16.2436 0.963446 15.1363 1.74956 14.4774L2.09922 14.1844C3.47324 13.0327 3.47324 10.9672 2.09922 9.8156L1.74956 9.52254C0.963446 8.86366 0.77072 7.75638 1.2903 6.8839L2.07508 5.56608C2.59466 4.69359 3.68014 4.30176 4.66176 4.63236L5.09831 4.77939C6.81401 5.35722 8.65909 4.32449 9.00082 2.59506L9.0878 2.15487C9.28331 1.16542 10.176 0.449982 11.2152 0.449982H12.7848ZM12 15.3C13.8225 15.3 15.3 13.8225 15.3 12C15.3 10.1774 13.8225 8.69998 12 8.69998C10.1774 8.69998 8.69997 10.1774 8.69997 12C8.69997 13.8225 10.1774 15.3 12 15.3Z"/>
    </svg>
  </button>
  </span>
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
  /* Bottom padding = top + the key's 3px drop, so the well looks even */
  .config-well {
    display: flex;
    padding: 6px 7px 9px;
    border-radius: 18px;
    background: color-mix(in oklab, var(--bone), black 9%);
    box-shadow: inset 0 2px 5px rgba(0, 0, 0, 0.2), 0 1px 0 rgba(255, 255, 255, 0.6);
  }
  .config-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 22px;
    padding: 0;
    border-radius: 11px;
    background: linear-gradient(180deg, #4a4e4c, #2c2f2e);
    box-shadow: 0 3px 0 #141615, inset 0 1px 0 rgba(255, 255, 255, 0.15);
    transition: transform 0.06s ease, box-shadow 0.06s ease;
  }
  /* Landscape's taller nameplate takes a bigger key */
  :global(.landscape) .config-btn {
    width: 48px;
    height: 26px;
    border-radius: 13px;
  }
  :global(.landscape) .config-well {
    border-radius: 20px;
  }
  /* Pressed, and held down while the panel is open */
  .config-btn:active,
  .config-btn.on {
    transform: translateY(2px);
    box-shadow: 0 1px 0 #141615, inset 0 1px 3px rgba(0, 0, 0, 0.4);
  }
  .gear {
    width: 15px;
    height: 15px;
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
