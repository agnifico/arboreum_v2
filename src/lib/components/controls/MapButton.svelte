<script>
  let {
    onClick = () => {},
    active = false
  } = $props();
</script>

<button type="button" class="map-btn" on:click={onClick} class:active>
  <img src="/map.svg" alt="Map" />
</button>

<style>
  .map-btn {
    position: relative;
    border-radius: 8px 2rem 0px 8px;
    border-radius: 8px;
    margin-inline: auto 0;
    width: fit-content;
    /* padding: 0 5rem; */
    background-position: 8px 8px;
    background-repeat: no-repeat;
    object-fit: contain;
    height: 100%;
    color: #463f3a;
    background-color: #8a817c;
    border: 2px solid #bcb8b1;
    object-fit: contain;
    font-family: 'Fira Code', monospace;
    transition: all 0.1s ease-in-out;
    background-color: transparent;
  }

  .map-btn img {
    margin-top: 4px;
    height: 18px;
  }

  .map-btn.active {
    color: #22577a;
    background-color: #38a3a5;
    border-color: #57cc99;
    font-weight: 600;
    transform: translateY(-5px);
  }

  .map-btn:hover {
    transform: translateY(-3px);
    background-color: #463f3a;
    border-color: #8a817c;
    color: #bcb8b1;
  }
</style>
