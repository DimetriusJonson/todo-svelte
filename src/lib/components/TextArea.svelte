<script lang="ts">
    let {
        name,
        value = $bindable(),
        placeholder,
        onChange = (v: string) => {},
    } = $props();
</script>

<textarea
    class="textarea"
    rows="4"
    cols="50"
    {name}
    bind:value
    {placeholder}
    onchange={(event: Event & { currentTarget: HTMLTextAreaElement }) =>
        onChange(event.currentTarget.value)}
></textarea>
