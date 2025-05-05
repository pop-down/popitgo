<script lang="ts">
  export let id: string;
  export let label: string = '';
  export let type: 'text' | 'email' | 'password' | 'number' | 'date' | 'time' | 'datetime-local' | 'url' = 'text';
  export let placeholder: string = '';
  export let value: string | number = '';
  export let required = false;
  export let disabled = false;
  export let error: string = '';
  export let helpText: string = '';
  export let fullWidth = true;
</script>

<div class={`mb-4 ${fullWidth ? 'w-full' : ''}`}>
  {#if label}
    <label for={id} class="block text-sm font-medium text-neutral-700 mb-1">{label}</label>
  {/if}
  
  <input
    {id}
    {type}
    {placeholder}
    {required}
    {disabled}
    class="px-3 py-2 bg-white border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary block w-full text-sm
    {error ? 'border-warning' : 'border-neutral-300'}"
    bind:value
    on:input
    on:change
    on:focus
    on:blur
  />
  
  {#if error}
    <p class="mt-1 text-sm text-warning">{error}</p>
  {:else if helpText}
    <p class="mt-1 text-sm text-neutral-500">{helpText}</p>
  {/if}
</div> 