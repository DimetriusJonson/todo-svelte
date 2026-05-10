<script lang="ts">
    import SelectInput from "./SelectInput.svelte";

    let {
        name,
        label,
        options,
        value = $bindable(),
        onChange = (e: Event) => {},
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
