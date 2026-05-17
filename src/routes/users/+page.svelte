<script lang="ts">
    import MainTitle from "$lib/components/MainTitle.svelte";
    import { getUsers } from "$lib/remote/user.remote";
</script>

<section class="section is-paddingless">
    <div class="container">
        <MainTitle title="Пользователи" />

        <div>
            {#each await getUsers() as { id, name }}
                <div>{id}: {name}</div>
            {/each}
        </div>
    </div>
</section>
