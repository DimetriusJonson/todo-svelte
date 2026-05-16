<script lang="ts">
    import MainTitle from "$lib/components/MainTitle.svelte";
    import TaskEditForm from "$lib/composite/TaskEditForm.svelte";
    import type { Task } from "$lib/model/Task.svelte.js";
    import { getTask, updateTask } from "$lib/remote/task.remote.js";

    let { params } = $props();

    const task = $derived((await getTask(params.id)) as Task);
</script>

<div class="container p-4">
    <MainTitle title={"Редактировать задачу"} />
    <TaskEditForm {task} sourceForm={updateTask} />
</div>
