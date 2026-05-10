<script lang="ts">
    import { goto } from "$app/navigation";
    import Button from "$lib/components/Button.svelte";
    import CheckboxWithLabel from "$lib/components/CheckboxWithLabel.svelte";
    import SelectWithLabel from "$lib/components/SelectWithLabel.svelte";
    import TextArea from "$lib/components/TextArea.svelte";
    import TextWithError from "$lib/components/TextWithError.svelte";
    import { showInfo } from "$lib/store/messages.svelte";
    import { apiInProgressGlobal } from "$lib/store/settings.svelte";
    import { enhance } from "$app/forms";
    import {
        isTaskCompleted,
        MIN_COMPLETED_AT,
        taskFromJson,
    } from "$lib/model/Task.svelte";
    import { type ApiError } from "$lib/api/ApiCommon.svelte";
    import { onMount } from "svelte";

    let { data = {}, form, action } = $props();

    let onServerRedirectTo = $derived('/task/');
    onMount(() => onServerRedirectTo = '');

</script>

<form
    method="POST"
    action="?/{action}"
    use:enhance={() => {
        apiInProgressGlobal.value = true;
        return async ({ result, update }) => {
            await update();
            apiInProgressGlobal.value = false;
            if (result.type === "success") {
                let savedTask = taskFromJson(result.data?.task);
                showInfo("Задача сохранена");
                goto("/task/" + savedTask.id);
            } else if (result.type === "failure") {
                let error = result.data?.error as ApiError;
                if (error.unAuthorized) {
                    goto("/login");
                }
            }
        };
    }}
>
    <fieldset disabled={apiInProgressGlobal.value}>
        <input type="hidden" name="id" value={data.task?.id} />
        <input type="hidden" name="redirectTo" value="{onServerRedirectTo}"/>

        <input
            type="hidden"
            name="oldCompleted_at"
            value={data?.task?.completed_at}
        />

        {#if form?.error && !form.error.validateErrors}
            <div class="box">
                <span class="message is-danger"> {form.error.message} </span>
            </div>
        {/if}

        <div class="level">
            <div class="level-left">
                <div class="level-item">
                    <SelectWithLabel
                        name="priority"
                        label={"Приоритет:"}
                        value={form?.task?.priority ?? data?.task?.priority ?? "C"}
                        options={data.priorities}
                    />
                </div>
            </div>

            <div class="level-right">
                <div class="level-item">
                    <CheckboxWithLabel
                        name="completed"
                        label="Завершена"
                        value={isTaskCompleted(
                            form?.task?.completed_at ??
                                data?.task?.completed_at ??
                                MIN_COMPLETED_AT,
                        )}
                    />
                </div>
            </div>
        </div>

        <div class="field">
            <TextWithError
                name="title"
                placeholder="Название"
                value={form?.task?.title ?? data?.task?.title ?? ""}
                error={form?.error?.validateErrors?.get("title")}
            />
        </div>
        <div class="field">
            <TextArea
                name="description"
                placeholder="Описание"
                value={form?.task?.description ?? data?.task?.description ?? ""}
            />
        </div>
        <div class="field is-grouped">
            <div class="control">
                <Button
                    className="is-primary"
                    label="Сохранить"
                    loading={apiInProgressGlobal.value}
                />
            </div>
            <div class="control">
                <Button
                    className="is-light"
                    label="Отмена"
                    onclick={(event: MouseEvent) => {
                        event.preventDefault();
                        if (data?.task?.id) {
                            goto("/task/" + data?.task?.id);
                        } else {
                            goto("/");
                        }
                    }}
                    loading={apiInProgressGlobal.value}
                />
            </div>
        </div>
    </fieldset>
</form>
