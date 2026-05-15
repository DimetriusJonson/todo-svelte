<script lang="ts">
    import SelectInput from "./SelectInput.svelte";

    let {
        name,
        label,
        options,
        value = $bindable(),
        onChange = (e: Event) => {},
        errors = [],
    } = $props();
</script>

<label class="label mx-2" for={name}>{label}</label>
<SelectInput
    {name}
    bind:value={value}
    {options}
    notSelectedText={"Не выбран"}
    {onChange}
/>
{#each errors as issue}
    <p class="help is-danger px-4">{issue.message}</p>
{/each}
