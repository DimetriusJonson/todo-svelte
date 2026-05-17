<script lang="ts">
  import { taskFromJson, type Task } from "$lib/model/Task.svelte";
  import { priorityName } from "$lib/TaskHelper.svelte";
  import Checkbox from "$lib/components/Checkbox.svelte";
  import { showError, showInfo } from "$lib/store/messages.svelte";
  import { onMount } from "svelte";
  import { changeCompletedTask } from "$lib/remote/task.remote";
  import type { ApiError } from "$lib/api/apiTypes";

  interface Props {
    tasks: Task[];
  }

  let { tasks }: Props = $props();

  let changeCompletedInProgress = $state(true);
  onMount(() => {
    changeCompletedInProgress = false;
  });

  async function onChangeCompleted(info: any) {
    changeCompletedInProgress = true;
    try {
      let result = await changeCompletedTask({
        id: parseInt(
          info.target.name.substring(info.target.name.indexOf("_") + 1),
        ),
        completed: info.target.checked,
      });
      if (!result?.error) {
        let savedTask = taskFromJson(result?.task);
        let foundTask = tasks.find((t) => t.id === savedTask.id);
        if (foundTask) {
          foundTask.completed_at = savedTask.completed_at;
          foundTask.completed = savedTask.completed;
        }

        showInfo("Задача сохранена.");
      } else {
        info.target.checked = !info.target.checked;
        let error = result?.error as ApiError;
        showError(error.message);
      }
    } finally {
      changeCompletedInProgress = false;
    }
  }
</script>

<table class="table is-striped is-fullwidth">
  <thead>
    <tr>
      <th>{"Приоритет"}</th>
      <th>{"Завершена"}</th>
      <th>{"Название"}</th>
      <th class="is-hidden-mobile">{"Описание"}</th>
    </tr>
  </thead>
  <tbody>
    {#if tasks.length > 0}
      {#each tasks as task (task.id)}
        <tr>
          <td>{priorityName(task.priority ?? "")}</td>
          <td>
            <input type="hidden" name="id" value={task.id} />
            <Checkbox
              className="is-medium"
              name={"completed_" + task.id}
              value={task.completed}
              title={task.completed_at
                ? new Date(task.completed_at).toLocaleString()
                : ""}
              disabled={changeCompletedInProgress}
              onChange={onChangeCompleted}
            />
          </td>
          <td
            ><a href={"/task/" + task.id} aria-label={task.title}
              >{task.title}</a
            ></td
          >
          <td class="is-hidden-mobile">{task.description}</td>
        </tr>
      {/each}
    {:else}
      <tr><td colSpan="3" style="text-align: center">{"Нет записей"}</td></tr>
    {/if}
  </tbody>
</table>
