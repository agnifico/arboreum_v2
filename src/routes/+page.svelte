<script>
  import { browser } from "$app/environment";
  import { liveQuery } from "dexie";
  import { db } from "$lib/db.js";
  import Button from "$lib/components/controls/Button.svelte";

  // undefined until IndexedDB answers, so neither message flashes on load
  const noteCount = browser ? liveQuery(() => db.notes.count()) : null;
</script>

<div class="home">
  <div class="welcome-text">
    <h1>Welcome to Arboreum!</h1>
    <p class="tagline">Notes that grow into trees.</p>

    {#if $noteCount === 0}
      <p>
        Every note you write becomes a little pixel tree. Pick its kind, plant
        it on your map, and watch your thoughts turn into a garden you can wander.
      </p>
      <div class="cta">
        <Button variant="primary" href="/newleaf">Plant your first note</Button>
      </div>
    {:else if $noteCount > 0}
      <p>
        Pick a note from your list, or start a new one. Open the map to wander
        your garden.
      </p>
      <div class="cta">
        <Button variant="primary" href="/newleaf">Create New</Button>
      </div>
    {/if}
  </div>
</div>

<style>
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    interpolate-size: allow-keywords;
  }
  .home {
    display: flex;
    flex-direction: column;
    width: 100%;
  }
  .welcome-text {
    max-width: 36rem;
    font-family: "Fira Code";
    color: #ffd6ad;
    padding: 4rem clamp(1.25rem, 5vw, 5rem) 2rem;
  }
  h1 {
    font-size: 2rem;
    font-weight: normal;
  }
  .tagline {
    font-size: 1.25rem;
    color: var(--neon-green);
    margin-top: 0.5rem;
  }
  p {
    font-size: 1rem;
    line-height: 1.7;
    color: var(--text-main);
    margin-top: 1.5rem;
  }
  .cta {
    margin-top: 2rem;
  }
  @media (max-width: 768px) {
    .welcome-text {
      padding-top: 2.5rem;
    }
    h1 {
      font-size: 1.5rem;
    }
  }
</style>
