<script>
  let { data } = $props();
</script>

<div class="about">
  <div class="arboreum dynamic-text-shadow">
    Arboreum
  </div>
  <div class="text">
    Written in Svelte 5, and Node.js.
  </div>
</div>

<style>

  .about {
    height: 100dvh;
    width: 100dvw;
    display: flex;
    flex-direction: column;
    color: aliceblue;
    font-family: "DM Serif Text";
    margin: auto;
    text-align: left;
    margin: 5rem 5rem 1rem 5rem;
  }

  .arboreum {
    color: #a7c957;
    font-family: "Silkscreen";
    font-size: 2.5rem;
    /* text-align: left; */
    background-color: none;
    margin-bottom: 3rem;
  }
  .dynamic-text-shadow {
    text-shadow: .2rem .2rem 0 #386641;
  }

  .text {
    font-family: "Fira Code";
    color: #e07a5f;
    font-size: 1.5rem;
  }

</style>