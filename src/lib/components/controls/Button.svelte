<script>
  let {
    variant = "primary",
    onClick = () => {},
    href = null,
    target = "_self",
    active = false,
    type = "button",
    class: extraClass = "",
  } = $props();

  const Tag = href ? "a" : "button";
</script>

<svelte:element
  this={Tag}
  {href}
  {target}
  type={Tag === "button" ? type : undefined}
  class={`btn btn-${variant} ${extraClass}`}
  class:active
  on:click={onClick}
>
  <slot />
</svelte:element>

<style>
  /* All styling is now handled by global classes in app.css */
</style>