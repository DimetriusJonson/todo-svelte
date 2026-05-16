<script lang="ts">
  import { enhance } from "$app/forms";
  import { type ApiError } from "$lib/api/ApiCommon.svelte";
  import { taskFromJson, type Task } from "$lib/model/Task.svelte";
  import { priorityName } from "$lib/TaskHelper.svelte";
  import Checkbox from "$lib/components/Checkbox.svelte";
  import { showError, showInfo } from "$lib/store/messages.svelte";
  import { apiInProgressGlobal } from "$lib/store/settings.svelte";
    import { onMount } from "svelte";

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

  let completedForms = new Map();
  let completedCheckboxes = new Map();

  let init = $state(true);
  onMount(() => {
    init = false;
  });
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
            <form
              bind:this={
                () => completedForms.get(task.id), (value) => completedForms.set(task.id, value)
              }
              method="POST"
              action="?/changeCompleted"
              use:enhance={() => {
                apiInProgressGlobal.value = true;
                return async ({ update, result }) => {
                  await update({ invalidateAll: false });
                  apiInProgressGlobal.value = false;
                  if (result.type === "success") {
                    let savedTask = taskFromJson(result.data?.task);
                    let foundTask = tasks.find((t) => t.id === savedTask.id);
                    if (foundTask) {
                      foundTask.completed_at = savedTask.completed_at;
                    }
                    let checkbox = completedCheckboxes.get(savedTask.id);
                    checkbox.checked = savedTask.completed;
                    showInfo("Задача сохранена.");
                  } else if (result.type == "failure") {
                    let oldTask = taskFromJson(result.data?.task);
                    let error = result.data?.error as ApiError;

                    task.completed = oldTask.completed;
                    showError(error.message);
                  }
                };
              }}
            >
              <input type="hidden" name="id" value={task.id} />
              <Checkbox
                bind:inputRef={
                  () => completedCheckboxes.get(task.id),
                  (value) => completedCheckboxes.set(task.id, value)
                }
                className="is-medium"
                name={"completed"}
                value={task.completed}
                title={task.completed_at
                  ? new Date(task.completed_at).toLocaleString()
                  : ""}
                disabled={apiInProgressGlobal.value || init}
                onChange={() => completedForms.get(task.id).requestSubmit()}
              />
            </form>
          </td>
          <td><a href={"/task/" + task.id} aria-label={task.title}>{task.title}</a></td>
          <td class="is-hidden-mobile">{task.description}</td>
        </tr>
      {/each}
    {:else}
      <tr><td colSpan="3" style="text-align: center">{"Нет записей"}</td></tr>
    {/if}
  </tbody>
</table>
