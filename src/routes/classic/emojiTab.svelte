<script>
  let props = $props();
</script>

<div class="trees">
  {#each props.set as tree (tree.filePath)}
    <label>
      <input
        type="radio"
        name={props.name}
        id={tree.name}
        bind:group={props.group}
        bind:value={tree.filePath}
      />
      <img src={tree.filePath} alt={tree.name} style="aspect-ratio: 1; height: 50px;"/>
    </label>
  {/each}
  <input checked="checked">
</div>

<style>
  .trees {
    display: flex;
    min-width: 60px;
    height: inherit;
    z-index: 0;
    /* flex: 1; */
    /* margin-right: 10px; */
  }

  input {
    display: none;
  }

  .trees label {
    padding: 5px;
    display: flex;
    flex-direction: column-reverse;
    position: relative;
    border-radius: 50%;
    aspect-ratio: 1;
    object-fit: contain;
  }

  .trees:hover label {
    position: relative;
    &:hover {
      background-color: #679289;
      border-radius: 50%;
    }
  }

  label:has(input:checked) {
    background-color: #171614;
    background-color: #679289;
    position: relative;
    z-index: 1;
    border-radius: 50%;
  }
  label:has(:not(input:checked)) {
    position: absolute;
  }
</style>
