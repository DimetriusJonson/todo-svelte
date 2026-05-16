<script lang="ts">
  import { type ApiError } from "$lib/api/ApiCommon.svelte";
  import { taskFromJson, type Task } from "$lib/model/Task.svelte";
  import { priorityName } from "$lib/TaskHelper.svelte";
  import Checkbox from "$lib/components/Checkbox.svelte";
  import { showError, showInfo } from "$lib/store/messages.svelte";
  import { onMount } from "svelte";
  import { changeCompletedTask } from "$lib/remote/task.remote";

  interface Props {
    tasks: Task[];
  }

  let { tasks }: Props = $props();

  function priorityStyle(task: Task) {
    if (task.priority) {
      switch (task.priority) {
        case "C":
          return "critical";
        case "H":
          return "high";
        case "N":
          return "normal";
        default:
          return "low";
      }
    } else {
      return "gray";
    }
  }

  let changeCompletedInProgress = $state(true);
  onMount(() => {
    changeCompletedInProgress = false;
  });

  async function changeCompleted(task: Task, info: any) {
    changeCompletedInProgress = true;
    try {
      let result = await changeCompletedTask({
        id: task.id ?? 0,
        completed: !task.completed,
      });
      if (!result?.error) {
        let savedTask = taskFromJson(result?.task);
        let foundTask = tasks.find((t) => t.id === savedTask.id);
        if (foundTask) {
          foundTask.completed_at = savedTask.completed_at;
        }
        info.target.checked = savedTask.completed;
        showInfo("Задача сохранена.");
      } else {
        let oldTask = taskFromJson(result?.task);
        let error = result?.error as ApiError;

        task.completed = oldTask.completed;
        showError(error.message);
      }
    } catch (error: any) {
      showError(error.toString());
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
          <td class={priorityStyle(task)}
            >{priorityName(task.priority ?? "")}</td
          >
          <td>
            <input type="hidden" name="id" value={task.id} />
            <Checkbox
              className="is-medium"
              name={"completed"}
              value={task.completed}
              title={task.completed_at
                ? new Date(task.completed_at).toLocaleString()
                : ""}
              disabled={changeCompletedInProgress}
              onChange={async (info: any) => await changeCompleted(task, info)}
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
