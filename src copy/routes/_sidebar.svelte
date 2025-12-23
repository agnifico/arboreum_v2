<script>
  import { db } from "$lib/db.js";
  import FileIcon from "./fileTab.svelte";
  import DeleteControl from "$lib/components/controls/DeleteControl.svelte";
  import SortControl from "$lib/components/controls/SortControl.svelte";
  import Modal from "$lib/components/Modal.svelte";
  import Button from "$lib/components/controls/Button.svelte";

  let { notes = [] } = $props();
  let to_del = $state([]);
  let sidebar = $state("sidebar");
  let select_switch = $state(false);
  let showDeleteConfirm = $state(false);

  let sortBy = $state("updatedAt");
  let sortDir = $state("desc");

  let sortedNotes = $derived(() => {
    if (!Array.isArray(notes)) return [];

    const sorted = [...notes].sort((a, b) => {
      let valA, valB;
      if (sortBy === "title") {
        valA = a.title?.toLowerCase() || "";
        valB = b.title?.toLowerCase() || "";
      } else {
        // 'createdAt' or 'updatedAt'
        valA = a[sortBy] || a.createdAt;
        valB = b[sortBy] || b.createdAt;
      }
      if (valA < valB) return -1;
      if (valA > valB) return 1;
      return 0;
    });

    if (sortDir === "desc") {
      sorted.reverse();
    }
    return sorted;
  });

  function toggleSelect() {
    select_switch = !select_switch;
    if (!select_switch) {
      to_del = [];
    }
  }

  function handleDeleteClick() {
    if (to_del.length === 0) {
      select_switch = false;
      return;
    }
    showDeleteConfirm = true;
  }

  async function executeDelete() {
    const idsToDelete = to_del.map((n) => n.id);
    await db.notes.bulkDelete(idsToDelete);
    to_del = [];
    select_switch = false;
    showDeleteConfirm = false;
  }

  function handleSelectNote(note) {
    if (!select_switch) return;
    const index = to_del.findIndex((n) => n.id === note.id);
    if (index > -1) {
      to_del.splice(index, 1);
    } else {
      to_del.push(note);
    }
  }
</script>

<div
  id={sidebar}
  name={sidebar}
  style:border-color={"#e07a5f"}
  style:color={"#e07a5f"}
>
  <div class="sidebar-heading"> Your notes </div>

  <div class="sidebar-controls">
    <SortControl bind:value={sortBy} bind:direction={sortDir} />
    <DeleteControl
      onToggle={toggleSelect}
      onDelete={handleDeleteClick}
      active={select_switch}
    />
  </div>

  <div class="message">
    {#if select_switch}
      {to_del.length} note{to_del.length === 1 ? "" : "s"} selected
    {/if}
  </div>
  <div class="notes">
    {#if sortedNotes()}
      {#each sortedNotes() as i (i.id)}
        <div on:click={() => handleSelectNote(i)}>
          <FileIcon
            note={i}
            disabled={!select_switch}
            bg={to_del.map((n) => n.id)}
            sidebar_name={sidebar}
          />
        </div>
      {/each}
    {/if}
  </div>
</div>

<Modal bind:show={showDeleteConfirm} title="Confirm Deletion">
  <svelte:fragment slot="footer">
    <Button variant="ghost" onClick={() => (showDeleteConfirm = false)}
      >Cancel</Button
    >
    <Button variant="primary" onClick={executeDelete}>Delete</Button>
  </svelte:fragment>
</Modal>

<style>
  #sidebar {
    width: 280px;
    min-width: 280px;
    position: relative;
    display: flex;
    flex-direction: column;
    background-color: rgba(0, 0, 0, 0.35);
    height: 85%;
    margin-block: auto;
    margin-left: 2rem;
    padding: 1rem;
    border-radius: 20px;
    box-shadow:
      rgba(0, 0, 0, 0.4) 0px 2px 4px,
      rgba(0, 0, 0, 0.3) 0px 6px 9px -3px,
      rgba(0, 0, 0, 0.2) 0px -8px 0px inset;
  }
  .sidebar-heading {
    font-family: "Silkscreen";
    font-size: 1.2rem;
    color: var(--text-bright);
    padding: 0.5rem;
  }

  .sidebar-controls {
    display: flex;
    /* justify-content: space-between; */
    align-items: center;
    flex-wrap: wrap;
    /* gap: .5rem; */
    /* padding: 0.5rem 0; */
  }

  .message {
    font-family: "Fira Code";
    font-size: 0.75rem;
    color: var(--accent-secondary);
    padding: 0.5rem;
    height: 1.2rem; /* Reserve space */
  }

  .notes {
    position: relative;
    display: flex;
    flex-direction: column;
    scrollbar-width: none;
    overflow-y: scroll;
    flex-grow: 1;
    min-height: 0; /* Prevent flex item from overflowing its container */
  }
</style>
