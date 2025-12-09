<script>
  import "../app.css";
  export const ssr = false;
  let { children } = $props();
  import Sidebar from "./_sidebar.svelte";
  import Button from "$lib/components/controls/Button.svelte";
  import MapButton from "$lib/components/controls/MapButton.svelte";
  import Modal from "$lib/components/Modal.svelte";
  import { isFullscreen, isMapVisible, placementMode } from "$lib/stores.js";
  import { browser } from '$app/environment';
  import { db } from "$lib/db.js";
  import { liveQuery } from "dexie";
  import { writable } from 'svelte/store';
  import Garden from './Garden.svelte';

  let sidebar_switch = $state(true);
  let showImportConfirm = $state(false);
  let notesToImport = $state(null);

  // Guard liveQuery to only run on the client
  const notes = browser
    ? liveQuery(() => db.notes.orderBy("createdAt").reverse().toArray())
    : writable([]);
  
  function toggleSidebar() {
    sidebar_switch = !sidebar_switch;
  }
  function toggleMap() {
    isMapVisible.set(!$isMapVisible);
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
          const importedData = JSON.parse(readerEvent.target.result);
          if (Array.isArray(importedData)) {
            notesToImport = importedData;
            showImportConfirm = true;
          } else {
            alert('Error: Invalid backup file format.');
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
      // Remove primary keys before importing to let Dexie auto-generate them
      const notesForImport = notesToImport.map(note => {
        const { id, ...rest } = note;
        return rest;
      });

      await db.transaction('rw', db.notes, async () => {
        await db.notes.clear();
        await db.notes.bulkAdd(notesForImport);
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

<div class="super" class:fullscreen-active={$isFullscreen}>
  {#if !$isFullscreen}
    <div id="topbar">
      <div class="arboreum dynamic-text-shadow">
        <a href=".">Arboreum</a>
      </div>
      <div class="top-nav">
        <Button variant="ghost" onClick={handleImport} title="Import from file">
          <img src="/icons/upload.svg" alt="Import" class="btn-icon" />
        </Button>
        <Button variant="ghost" onClick={handleExport} title="Export to file">
          <img src="/icons/download.svg" alt="Export" class="btn-icon" />
        </Button>
        <Button variant="ghost" href="./about" title="About">
          <img src="/icons/about.svg" alt="About" class="btn-icon" />
        </Button>

        <div class="separator"></div>

        <Button variant="ghost" active={sidebar_switch} onClick={toggleSidebar} class="top-bar-btn">
          <span class="desktop-only">Sidebar</span>
          <span class="mobile-only">☰</span>
        </Button>
        <MapButton active={$isMapVisible} onClick={toggleMap} class="top-bar-btn" />
        <form action="./newleaf">
          <Button variant="primary" type="submit" class="top-bar-btn">
            <span class="desktop-only">Create New</span>
            <span class="mobile-only">+</span>
          </Button>
        </form>
        <form action="./newleaf" target="_blank">
          <Button variant="primary" type="submit" class="top-bar-btn">⇗</Button>
        </form>
      </div>
    </div>
  {/if}
  <div id="page-container" class:sidebar-closed={!sidebar_switch}>
    {#if sidebar_switch && !$isFullscreen}
      <Sidebar notes={$notes} />
    {:else if !$isFullscreen}
      <button class="greenline" on:click={toggleSidebar}></button>
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
    display: flex;
    justify-content: center;
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

  .mobile-only {
    display: none;
  }

  @media (max-width: 768px) {
    .desktop-only {
      display: none;
    }
    .mobile-only {
      display: inline;
    }
  }
</style>

