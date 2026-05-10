<script lang="ts">
    
    let buttonElement: HTMLButtonElement;
    let {
        id = null,
        loading = false,
        className = "",
        disabled = false,
        label,
        onclick = () => {},
    } = $props();
</script>

<button
    bind:this={buttonElement}
    {id}
    aria-label={label}
    class={"button is-rounded" +
        (loading ? " is-loading" : "") +
        " " +
        className}
    onclick={(event) => onclick(event)}
    onmouseup={() => buttonElement.blur()}
    {disabled}
>
    {label}
</button>
