<script lang="ts">
  export let isActive: boolean = false;
  export let onClick: () => void = () => {};
</script>

<button
  class="inline-flex items-center p-4 text-sm font-medium border-b-2 {isActive ? 'border-primary text-primary' : 'border-transparent text-neutral-600 hover:text-neutral-800 hover:border-neutral-300'}"
  class:border-b-2={true}
  class:border-primary={isActive}
  class:text-primary={isActive}
  class:border-transparent={!isActive}
  on:click={onClick}
  role="tab"
  aria-selected={isActive}
>
  <slot />
</button> 