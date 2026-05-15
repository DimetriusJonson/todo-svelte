<script lang="ts">
    import MainTitle from "$lib/components/MainTitle.svelte";
    import TaskEditForm from "$lib/composite/TaskEditForm.svelte";
    import { createTask } from "$lib/remote/task.remote.js";

    let { form, data } = $props();
</script>

<div class="container p-4">
    <MainTitle title={"Создать задачу"} />
    <TaskEditForm {data} sourceForm={createTask} task={null}/>
</div>
