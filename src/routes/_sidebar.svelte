<script>
  import { db } from "$lib/db.js";
  import FileIcon from "./fileTab.svelte";
  import DeleteControl from "$lib/components/controls/DeleteControl.svelte";
  import SortControl from "$lib/components/controls/SortControl.svelte";
  import Modal from "$lib/components/Modal.svelte";
  import Button from "$lib/components/controls/Button.svelte";
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import { skipUnsavedGuard } from "$lib/stores.js";

  let { notes = [] } = $props();
  let to_del = $state([]);
  let sidebar = $state("sidebar");
  let select_switch = $state(false);
  let showDeleteConfirm = $state(false);

  let sortBy = $state("updatedAt");
  let sortDir = $state("desc");

  // Dates may be Date objects (saved here) or ISO strings (older imports).
  const time = (v) => (v ? new Date(v).getTime() || 0 : 0);

  let sortedNotes = $derived.by(() => {
    if (!Array.isArray(notes)) return [];

    const sorted = [...notes].sort((a, b) => {
      if (sortBy === "title") {
        return (a.title?.trim() || "").localeCompare(b.title?.trim() || "", undefined, {
          sensitivity: "base",
          numeric: true,
        });
      }
      // 'createdAt' or 'updatedAt' (never-edited notes fall back to createdAt)
      return time(a[sortBy] ?? a.createdAt) - time(b[sortBy] ?? b.createdAt);
    });

    if (sortDir === "desc") {
      sorted.reverse();
    }
    return sorted;
  });

  let deleteMessage = $derived(
    to_del.length === 1
      ? `Delete “${to_del[0].title?.trim() || "Untitled"}”? Its tree leaves your garden too. This can't be undone.`
      : `Delete ${to_del.length} notes? Their trees leave your garden too. This can't be undone.`
  );

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

  // Is the page we're on showing (or editing) one of these notes?
  function isShowingAny(noteids) {
    const { pathname, searchParams } = page.url;
    const current = pathname.startsWith("/read/")
      ? decodeURIComponent(pathname.slice("/read/".length))
      : pathname === "/newleaf"
        ? searchParams.get("noteid")
        : null;
    return current !== null && noteids.includes(current);
  }

  async function executeDelete() {
    const idsToDelete = to_del.map((n) => n.id);
    const leaveCurrent = isShowingAny(to_del.map((n) => n.noteid));
    await db.notes.bulkDelete(idsToDelete);
    if (leaveCurrent) {
      skipUnsavedGuard.set(true);
      await goto("/", { replaceState: true });
      skipUnsavedGuard.set(false);
    }
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
    {#if sortedNotes}
      {#each sortedNotes as i (i.id)}
        <FileIcon
          note={i}
          selectMode={select_switch}
          selected={to_del.some((n) => n.id === i.id)}
          onSelect={() => handleSelectNote(i)}
        />
      {/each}
    {/if}
  </div>
</div>

<Modal bind:show={showDeleteConfirm} title={to_del.length === 1 ? "Delete note?" : "Delete notes?"} message={deleteMessage}>
  <svelte:fragment slot="footer">
    <Button variant="ghost" onClick={() => (showDeleteConfirm = false)}
      >Cancel</Button
    >
    <Button variant="danger" onClick={executeDelete}>
      Delete{to_del.length > 1 ? ` ${to_del.length}` : ""}
    </Button>
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

  @media (max-width: 768px) {
    /* Drawer over the page (see .scrim in +layout.svelte) */
    #sidebar {
      position: absolute;
      top: 0.5rem;
      bottom: 0.5rem;
      left: 0.5rem;
      z-index: 20;
      width: min(320px, calc(100% - 2rem));
      min-width: 0;
      height: auto;
      margin: 0;
      box-sizing: border-box;
      /* Same tint as desktop, but opaque so the page doesn't show through */
      background-color: var(--evergreen);
      background-image: linear-gradient(rgba(0, 0, 0, 0.35), rgba(0, 0, 0, 0.35));
    }
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
