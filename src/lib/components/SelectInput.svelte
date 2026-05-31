<script lang="ts">
    let {
        name,
        label,
        options,
        className = "",
        value = $bindable(),
        notSelectedText,
        onChange,
    } = $props();
</script>

<div class={"select " + className}>
    <select
        id = {name}
        aria-label={label}
        {name}
        bind:value
        onchange={(event: Event & { currentTarget: HTMLSelectElement }) => {
            onChange(event.currentTarget.value);
        }}
    >
        <option value={""}>{notSelectedText}</option>
        {#each options as option (option.value)}
            <option value={option.value}>{option.text}</option>
        {/each}
    </select>
</div>
