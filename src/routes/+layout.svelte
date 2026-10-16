<script>
  import { onMount, onDestroy } from "svelte";
  import "../app.css";
  export const ssr = false;
  let { children } = $props();
  import Sidebar from "./_sidebar.svelte";
  import Button from "$lib/components/controls/Button.svelte";
  import MapButton from "$lib/components/controls/MapButton.svelte";
  import Modal from "$lib/components/Modal.svelte";
  import { isFullscreen, isMapVisible, placementMode, toggleMap, toast } from "$lib/stores.js";
  import { browser } from '$app/environment';
  import { db } from "$lib/db.js";
  import { liveQuery } from "dexie";
  import { writable } from 'svelte/store';
  import Garden from './Garden.svelte';
  import { base } from '$app/paths';
  import { normalizeBackup } from '$lib/backup.js';
  import { afterNavigate } from '$app/navigation';

  let sidebar_switch = $state(true);
  let showImportConfirm = $state(false);
  let notesToImport = $state.raw(null); // raw: IndexedDB can't clone $state proxies
  let showMoreMenu = $state(false);

  function handleClickOutside(event) {
    if (showMoreMenu && !event.target.closest('.mobile-only')) {
      showMoreMenu = false;
    }
  }

  // On phones the sidebar is a drawer over the page: closed by default and
  // after each navigation, so the note or editor gets the whole screen.
  const mobileQuery = browser ? window.matchMedia('(max-width: 768px)') : null;
  let isMobile = $state(false);
  const updateIsMobile = () => (isMobile = mobileQuery.matches);

  afterNavigate(() => {
    if (isMobile) sidebar_switch = false;
  });

  function handleEscape(event) {
    if (showMoreMenu && event.key === 'Escape') showMoreMenu = false;
  }

  onMount(() => {
    if (browser) {
      window.addEventListener('click', handleClickOutside);
      window.addEventListener('keydown', handleEscape);
      updateIsMobile();
      if (isMobile) sidebar_switch = false;
      mobileQuery.addEventListener('change', updateIsMobile);
    }
  });

  onDestroy(() => {
    if (browser) {
      window.removeEventListener('click', handleClickOutside);
      window.removeEventListener('keydown', handleEscape);
      mobileQuery.removeEventListener('change', updateIsMobile);
    }
  });

  // Guard liveQuery to only run on the client
  const notes = browser
    ? liveQuery(() => db.notes.orderBy("createdAt").reverse().toArray())
    : writable(null);
  
  function toggleSidebar() {
    sidebar_switch = !sidebar_switch;
  }
  
  async function handleExport() {
    if (!browser) return;

    const allNotes = await db.notes.toArray();
    const jsonString = JSON.stringify(allNotes, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `arboreum-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function handleImport() {
    if (!browser) return;

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json';
    input.onchange = e => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = readerEvent => {
        try {
          const { notes: parsed } = normalizeBackup(JSON.parse(readerEvent.target.result));
          if (parsed.length > 0) {
            notesToImport = parsed;
            showImportConfirm = true;
          } else {
            alert("That file doesn't contain any Arboreum notes. Pick a backup made with Export.");
          }
        } catch (err) {
          alert('Error reading or parsing file. Is it a valid JSON backup?');
          console.error(err);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }

  async function executeImport() {
    if (!notesToImport) return;

    try {
      // Clear + add in one transaction: if anything fails, nothing is lost.
      await db.transaction('rw', db.notes, async () => {
        await db.notes.clear();
        await db.notes.bulkAdd(notesToImport);
      });
    } catch (error) {
      console.error("Failed to import notes:", error);
      alert("An error occurred during the import process.");
    } finally {
      showImportConfirm = false;
      notesToImport = null;
    }
  }
</script>

{#if $isMapVisible}
  <Garden notes={$notes} />
{/if}

<Modal 
  bind:show={showImportConfirm} 
  title="Confirm Import"
  message={`Are you sure you want to import ${notesToImport?.length || 0} notes? This will overwrite all current notes in your garden.`}
>
  <svelte:fragment slot="footer">
    <Button variant="ghost" onClick={() => showImportConfirm = false}>Cancel</Button>
    <Button variant="primary" onClick={executeImport}>Overwrite and Import</Button>
  </svelte:fragment>
</Modal>

<div class="toast-region" role="status" aria-live="polite">
  {#if $toast}
    <div class="toast">{$toast}</div>
  {/if}
</div>

<div class="super" class:fullscreen-active={$isFullscreen}>
  {#if !$isFullscreen}
    <div id="topbar">
      <div class="arboreum dynamic-text-shadow">
        <a href="/">Arboreum</a>
      </div>
      <div class="top-nav">
        <!-- Desktop Buttons -->
        <div class="desktop-only-flex">
          <Button variant="ghost" onClick={handleImport} title="Import from file">
            <img src="{base}/icons/upload.svg" alt="Import" class="btn-icon" />
          </Button>
          <Button variant="ghost" onClick={handleExport} title="Export to file">
            <img src="{base}/icons/download.svg" alt="Export" class="btn-icon" />
          </Button>
          <Button variant="ghost" href="/about" title="About">
            <img src="{base}/icons/about.svg" alt="About" class="btn-icon" />
          </Button>
        </div>

        <!-- Mobile Popover -->
        <div class="mobile-only">
          <Button
            variant="ghost"
            onClick={(e) => { e.stopPropagation(); showMoreMenu = !showMoreMenu; }}
            aria-label="More: import, export, about"
            title="More"
            aria-haspopup="true"
            aria-expanded={showMoreMenu}
          >
            ...
          </Button>
          {#if showMoreMenu}
            <div class="popover">
              <Button variant="ghost" onClick={handleImport} title="Import from file">
                <img src="{base}/icons/upload.svg" alt="Import" class="btn-icon" />
                Import
              </Button>
              <Button variant="ghost" onClick={handleExport} title="Export to file">
                <img src="{base}/icons/download.svg" alt="Export" class="btn-icon" />
                Export
              </Button>
              <Button variant="ghost" href="/about" title="About">
                <img src="{base}/icons/about.svg" alt="About" class="btn-icon" />
                About
              </Button>
            </div>
          {/if}
        </div>

        <div class="separator"></div>

        <Button
          variant="ghost"
          active={sidebar_switch}
          onClick={toggleSidebar}
          class="top-bar-btn"
          aria-label="Sidebar"
          aria-pressed={sidebar_switch}
          title="Show or hide your notes"
        >
          <span class="desktop-only">Sidebar</span>
          <span class="mobile-only">☰</span>
        </Button>
        <MapButton active={$isMapVisible} onClick={toggleMap} class="top-bar-btn" />
        <form action="/newleaf">
          <Button variant="primary" type="submit" class="top-bar-btn" aria-label="Create New" title="Create a new note">
            <span class="desktop-only">Create New</span>
            <span class="mobile-only">+</span>
          </Button>
        </form>
        <form action="/newleaf" target="_blank" class="desktop-only-form">
          <Button
            variant="primary"
            type="submit"
            class="top-bar-btn"
            aria-label="Create New in a new tab"
            title="Create a new note in a new tab"
          >⇗</Button>
        </form>
      </div>
    </div>
  {/if}
  <div id="page-container" class:sidebar-closed={!sidebar_switch}>
    {#if sidebar_switch && !$isFullscreen}
      <button class="scrim" on:click={toggleSidebar} aria-label="Close notes list"></button>
      <Sidebar notes={$notes} />
    {:else if !$isFullscreen}
      <button class="greenline" on:click={toggleSidebar} aria-label="Show your notes" title="Show your notes"></button>
    {/if}
    <div class="main-content">
      {@render children()}
    </div>
  </div>
  {#if !$isFullscreen}
    <div class="controls" style="display: none;">
      <!-- Buttons have been moved to the top bar -->
    </div>
  {/if}
</div>

<style>
  .super {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100dvh;
    background-color: var(--bg-main);
    /* background-image: url("/forest1.png"); */
    background-size: cover;
  }

  #page-container {
    position: relative;
    display: flex;
    flex-grow: 1;
    overflow: hidden;
    transition: all 0.3s ease-in-out;
  }

  .main-content {
    flex-grow: 1;
    width: 100%;
    min-width: 0;
    display: flex;
    justify-content: center;
    overflow-y: auto; /* long notes scroll instead of being cut off */
  }

  #topbar {
    position: relative;
    display: flex;
    align-items: center;
    background-color: rgba(0, 0, 0, 0.35);
    box-shadow:
      rgba(0, 0, 0, 0.4) 0px 2px 4px,
      rgba(0, 0, 0, 0.3) 0px 6px 9px -3px,
      rgba(0, 0, 0, 0.2) 0px -4px 0px inset;
  }

  .arboreum {
    z-index: 3;
    color: #B6CF67;
    font-family: "Silkscreen";
    font-size: 1.5rem;
    text-align: left;
    padding-left: 1rem;
    padding-block: 0.5rem;
  }

  .dynamic-text-shadow {
    text-shadow: 0.2rem 0.2rem 0 #497752;
  }

  .top-nav {
    position: relative;
    padding: 0.5rem 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-left: auto;
    z-index: 2;
  }

  /* The form elements should not disrupt the flexbox layout */
  .top-nav form {
    display: contents;
  }
  
  .controls {
    display: none;
  }

  .greenline {
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: 10px;
    background-color: var(--accent-primary);
    border-radius: 0;
    cursor: pointer;
    z-index: 10;
    padding-right: 10px; /* Invisible hover/click area */
    transition: width 0.2s ease;
    writing-mode: vertical-rl;
    text-orientation: mixed;
    color: transparent; /* Hide the text */
  }

  .greenline:hover {
    width: 24px;
  }

  .scrim {
    display: none;
  }

  .toast-region {
    position: fixed;
    left: 50%;
    bottom: 1.5rem;
    transform: translateX(-50%);
    z-index: 2000;
    pointer-events: none;
  }
  .toast {
    padding: 0.5rem 1rem;
    background-color: var(--charcoal);
    color: var(--neon-green);
    border: 3px solid var(--hunter-green);
    border-radius: 10px;
    font-family: "Fira Code", monospace;
    font-size: 0.9rem;
    white-space: nowrap;
    box-shadow:
      rgba(0, 0, 0, 0.4) 0px 2px 4px,
      rgba(0, 0, 0, 0.3) 0px 6px 9px -3px,
      rgba(0, 0, 0, 0.2) 0px -4px 0px inset;
  }

  .mobile-only {
    display: none;
  }
  .desktop-only-flex {
    display: flex;
    gap: 0.5rem;
  }

  .popover {
    position: absolute;
    top: 110%;
    right: 0;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    padding: 0.5rem;
    background-color: var(--bg-tertiary);
    border-radius: 8px;
    box-shadow: var(--shadow-elevation-medium);
    z-index: 10;
  }
  .popover :global(button) {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    width: 100%;
    justify-content: flex-start;
  }


  @media (max-width: 768px) {
    .desktop-only, .desktop-only-flex {
      display: none;
    }
    /* Keep the header within a 375px screen; Create New stays visible. */
    .arboreum {
      font-size: 1.1rem;
      padding-left: 0.75rem;
    }
    .top-nav {
      padding: 0.5rem 0.5rem;
      gap: 0.35rem;
    }
    .top-nav :global(.btn) {
      padding: 6px 10px;
    }
    .top-nav form.desktop-only-form {
      display: none;
    }
    /* ☰ in the header opens the drawer; the edge strip would cover content */
    .greenline {
      display: none;
    }
    .scrim {
      display: block;
      position: absolute;
      inset: 0;
      z-index: 15;
      padding: 0;
      border: none;
      border-radius: 0;
      box-shadow: none;
      background-color: rgba(10, 28, 33, 0.6);
    }
    .mobile-only {
      display: inline-block; /* Use block/inline-block for positioning context */
      position: relative;
    }
  }
</style>
