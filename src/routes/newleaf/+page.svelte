<script>
  import Editor from '$lib/Editor.svelte';
  let { data } = $props();
</script>

<Editor note={data.note} />

<style>
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
</style>
