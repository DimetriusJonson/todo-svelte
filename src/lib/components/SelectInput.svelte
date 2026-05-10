<script lang="ts">
    let {
        name,
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
