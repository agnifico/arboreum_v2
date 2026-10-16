<script>
  import { page } from "$app/state";
  import Button from "$lib/components/controls/Button.svelte";
</script>

<div class="error">
  <p class="error-title">
    {page.status === 404 ? "This path leads nowhere." : "Something went wrong."}
  </p>
  <p>{page.status === 404 ? "There's no page here, but your notes are safe." : page.error?.message}</p>
  <Button variant="primary" href="/">Back to your notes</Button>
</div>

<style>
  .error {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
    margin: 4rem auto 0;
    padding: 0 1.5rem;
    max-width: 32rem;
    font-family: "Fira Code", monospace;
    color: var(--text-main);
  }
  .error p {
    margin: 0;
  }
  .error-title {
    font-family: "Silkscreen";
    font-size: 1.2rem;
    color: var(--neon-green);
  }
</style>
