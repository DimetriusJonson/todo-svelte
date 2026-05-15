<script lang="ts">
    import { goto } from "$app/navigation";
    import { taskPriorityName } from "$lib/TaskHelper.svelte";
    import { showInfo } from "$lib/store/messages.svelte.js";
    import Button from "$lib/components/Button.svelte";
    import ButtonLink from "$lib/components/ButtonLink.svelte";
    import type { Task } from "$lib/model/Task.svelte.js";
    import { deleteTask, getTask } from "$lib/remote/task.remote.js";

    let { params } = $props();

    const task = $derived(await getTask(params.id) as Task);
</script>

<div class="container p-4">
    <div class="message">
        <div class="message-header">
            <p>{"Сделать"}</p>
        </div>

        <div class="message-body">
            <div class="media">
                <div class="media-left">
                    {#if task?.completed}
                        <span class="is-size-3">{"✅"}</span>
                    {:else}
                        <span class="is-size-3">{"❌"}</span>
                    {/if}
                </div>
                <div>
                    <p class="title is-size-4 is-size-6-mobile">
                        {task?.title}
                    </p>
                    <p class="subtitle is-6">
                        {taskPriorityName(task ?? {})}
                    </p>
                </div>
            </div>

            <div class="content">
                {#if task?.description}
                    <p>{task?.description}</p>
                {/if}
            </div>

            <div class="buttons">
                <ButtonLink
                    className="is-light is-size-7-mobile"
                    href={"/task/" + params.id + "/edit"}
                    label="Изменить"
                />
                <form
                    {...deleteTask.enhance(async ({ submit }) => {
                        if (await submit()) {
                            if (!deleteTask.result?.error) {
                                goto("/");
                                showInfo("Задача удалена.");
                            }
                        }
                    })}
                >
                    <input type="hidden" name="id" value={params.id} />

                    <input
                        type="hidden"
                        name="redirectTo"
                        value={'/'}
                    />

                    <Button
                        className="is-danger is-size-7-mobile"
                        label="Удалить"
                        disabled={deleteTask.pending > 0}
                        loading={deleteTask.pending > 0}
                    />
                </form>
            </div>
        </div>
    </div>
</div>
