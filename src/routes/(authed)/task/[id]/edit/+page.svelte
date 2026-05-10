<script lang="ts">
    import MainTitle from "$lib/components/MainTitle.svelte";
    import TaskEditForm from "$lib/composite/TaskEditForm.svelte";

    let { data, form } = $props();
</script>

<section class="section">
    <div class="container">
        <MainTitle title={"Редактировать задачу"}/>
        <TaskEditForm {data} {form} action="update"/>
    </div>
</section>
