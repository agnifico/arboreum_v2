<script>
  let {
    variant = "primary",
    onClick = () => {},
    href = null,
    target = "_self",
    active = false,
    type = "button",
    class: extraClass = "",
    // title, aria-label, aria-pressed, etc. are passed straight through
    ...rest
  } = $props();
</script>

{#if href}
  <a
    {href}
    {target}
    class={`btn btn-${variant} ${extraClass}`}
    class:active
    on:click={onClick}
    {...rest}
  >
    <slot />
  </a>
{:else}
  <button
    {type}
    class={`btn btn-${variant} ${extraClass}`}
    class:active
    on:click={onClick}
    {...rest}
  >
    <slot />
  </button>
{/if}

<style>
  /* All styling is now handled by global classes in app.css */
</style>
