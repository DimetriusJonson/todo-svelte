<script lang="ts">
    interface Props {
        title: string;
        className?: string;
    }

    let { title, className = "" }: Props = $props();
</script>

<h1 class={"title ".concat(className)}>
    {title}
</h1>
