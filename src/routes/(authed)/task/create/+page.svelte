<script lang="ts">
    import MainTitle from "$lib/components/MainTitle.svelte";
    import TaskEditForm from "$lib/composite/TaskEditForm.svelte";

    let { form, data } = $props();
</script>

<section class="section">
    <div class="container">
        <MainTitle title={"Создать задачу"} />
        <TaskEditForm {data} {form} action='create'/>
    </div>
</section>
