<script>
  // The device at / draws its own chrome (see CONCEPT.md); the classic app
  // keeps its shell in classic/+layout.svelte.
  import "../app.css";
  let { children } = $props();
</script>

{@render children()}
