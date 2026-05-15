<script lang="ts">
    let {
        name,
        value = $bindable(),
        placeholder = "",
        inputType = "",
        errors = [],
    } = $props();
</script>

<div class="control">
    <input
        class={"input { error.length > 0 ? 'is-danger' : '' }"}
        type={inputType}
        id={name}
        {name}
        bind:value={value}
        {placeholder}
    />
</div>

{#each errors as issue}
    <p class="help is-danger">{issue.message}</p>
{/each}
