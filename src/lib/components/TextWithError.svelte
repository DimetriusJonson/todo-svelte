<script lang="ts">
    let {
        name,
        value = $bindable(),
        placeholder = "",
        inputType = "",
        error = "",
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
{#if error && error.length > 0}
    <p class="help is-danger">{error}</p>
{/if}
