<script lang="ts">
    import { goto } from "$app/navigation";
    import { taskPriorityName } from "$lib/TaskHelper.svelte";
    import { apiInProgressGlobal } from "$lib/store/settings.svelte";
    import { enhance } from "$app/forms";
    import { showError, showInfo } from "$lib/store/messages.svelte.js";
    import { type ApiError } from "$lib/api/ApiCommon.svelte.js";
    import Button from "$lib/components/Button.svelte";
    import { onMount } from "svelte";
    import ButtonLink from "$lib/components/ButtonLink.svelte";

    let { params, data } = $props();

    let onServerRedirectTo = $derived("/");
    onMount(() => (onServerRedirectTo = ""));
</script>

<div class="container pt-5">
    <div class="message">
        <div class="message-header">
            <p>{"Сделать"}</p>
        </div>

        <div class="message-body">
            <div class="media">
                <div class="media-left">
                    {#if data.task?.completed}
                        <span class="is-size-3">{"✅"}</span>
                    {:else}
                        <span class="is-size-3">{"❌"}</span>
                    {/if}
                </div>
                <div>
                    <p class="title is-size-4 is-size-6-mobile">
                        {data.task?.title}
                    </p>
                    <p class="subtitle is-6">
                        {taskPriorityName(data.task ?? {})}
                    </p>
                </div>
            </div>

            <div class="content">
                {#if data.task?.description}
                    <p>{data.task?.description}</p>
                {/if}
            </div>

            <div class="buttons">
                <ButtonLink
                    className="is-light is-size-7-mobile"
                    href={"/task/" + params.id + "/edit"}
                    label="Изменить"
                />
                <form
                    method="POST"
                    action="?/delete"
                    use:enhance={() => {
                        apiInProgressGlobal.value = true;
                        return async ({ update, result }) => {
                            await update({ invalidateAll: false });
                            apiInProgressGlobal.value = false;
                            if (result.type == "success") {
                                showInfo("Задача удалена.");
                                goto("/");
                            } else if (result.type == "failure") {
                                let error = result.data?.error as ApiError;
                                showError(error.message);
                            }
                        };
                    }}
                >
                    <input
                        type="hidden"
                        name="redirectTo"
                        value={onServerRedirectTo}
                    />

                    <Button
                        className="is-danger is-size-7-mobile"
                        label="Удалить"
                        disabled={apiInProgressGlobal.value}
                        loading={apiInProgressGlobal.value}
                    />
                </form>
            </div>
        </div>
    </div>
</div>
