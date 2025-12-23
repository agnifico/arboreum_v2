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
      <img
        src={tree.filePath}
        alt={tree.name}
        style="aspect-ratio: 1; height: 40px;"
      />
    </label>
  {/each}
  <input checked="checked" />
</div>

<style>
  .trees {
    /* position: absolute; */
    /* inset: 0; */
    /* left: 10px;
    top: 10px; */
    display: flex;
    min-width: 50px;
    max-height: 100px;
    z-index: 999;
    padding-bottom: 3rem;
    /* flex: 1; */
    /* margin-right: 10px; */
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    grid-template-rows: repeat(5, 1fr);
    grid-column-gap: 0px;
    grid-row-gap: 0px;
    overflow: scroll;
    scrollbar-width: none;
    background-color: #5c4430;
  }

  input {
    display: none;
  }

  .trees label {
    padding: 5px;
    display: flex;
    flex-direction: column-reverse;
    position: relative;
    /* border-radius: 50%; */
    aspect-ratio: 1;
    object-fit: contain;
  }

  .trees:hover label {
    position: relative;
    &:hover {
      background-color: #e5e5e5;
      /* border-radius: 50%; */
    }
  }

  label:has(input:checked) {
    background-color: #e5e5e5;
    position: relative;
    z-index: 1;
    /* border-radius: 50%; */
    border: 2px solid white;
    border-radius: 4px;
    box-shadow:
      rgba(6, 24, 44, 0.4) 0px 0px 0px 2px,
      rgba(6, 24, 44, 0.65) 0px 4px 6px -1px,
      rgba(255, 255, 255, 0.08) 0px 1px 0px inset;
  }
  label:has(:not(input:checked)) {
    position: absolute;
  }
</style>
