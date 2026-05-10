<script lang="ts">
    let {
        id = null,
        loading = false,
        className = "",
        href = "",
        label,
    } = $props();
</script>

<a
    {id}
    aria-label={label}
    {href}
    class={"button is-rounded" +
        (loading ? " is-loading" : "") +
        " " +
        className}
    >{label}</a
>
