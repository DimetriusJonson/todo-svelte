<script lang="ts">
    import MainTitle from "$lib/components/MainTitle.svelte";

    let { data } = $props();
</script>

<section class="section is-paddingless">
    <div class="container">
        <MainTitle title="Пользователи"/>

        <div>
            {#each data.users as { id, name }}
                <div>{id}: {name}</div>
            {/each}
        </div>
    </div>
</section>
